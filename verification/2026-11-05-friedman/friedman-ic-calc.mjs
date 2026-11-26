// Friedman calculations for dossier 2026-11-05-friedman: the index of coincidence, the statistic the
// retained handbook credits to him, computed exactly as the registered text prints it.
// Anchors in the retained sources:
//  - "Define IC as the probability that two characters arbitrarily chosen from the given ciphertext sample
//    are equal" (hac-ch7.txt:1536-1537) and equation (7.2), IC = sum_i f_i(f_i-1) / (L(L-1)) (1539-1542)
//  - "one expects IC to range from 1/n (for polyalphabetic substitution with infinite period) to p
//    (for mono-alphabetic substitution)" (hac-ch7.txt:1554-1556)
//  - "For Roman-alphabet languages, n = 26 implies r = 0.03846" (hac-ch7.txt:1569-1570)
//  - Table 7.1 prints English p = 0.0667 (hac-ch7.txt:1590)
//  - Example 7.76: compare the IC of the sample against the values for candidate periods, then partition
//    into t groups and compare each group's frequency distribution to plaintext (1572-1579)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { SAMPLE } from './classical-sample.mjs';
import { encipherVigenere } from './vigenre-shim.mjs';

// the course-notes anchor is read from the registered file, so it is not a literal this module agrees with
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../..');
const corpora = JSON.parse(fs.readFileSync(path.join(root, 'build/corpora.json'), 'utf8'));
const courseText = fs.readFileSync(path.resolve(root, corpora['krzyzanowski-classical']), 'utf8');
export const PRINTED_EXAMPLE = (() => {
  const m = /Ciphertext: ([A-Z]{12})/.exec(courseText);
  if (!m) throw new Error('the printed Vigenere example ciphertext is not in the registered course text');
  return m[1];
})();

const A = 65;
const idx = (ch) => ch.charCodeAt(0) - A;

// equation (7.2) read off the printed definition
export function ic(sample) {
  const n = sample.length;
  const counts = new Map();
  for (const ch of sample) counts.set(ch, (counts.get(ch) || 0) + 1);
  let pairs = 0;
  for (const f of counts.values()) pairs += f * (f - 1);
  return pairs / (n * (n - 1));
}
// a second, deliberately different route: count matching pairs by enumerating the two draws
export function icByPairs(sample) {
  const n = sample.length;
  let match = 0, total = 0;
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) { total++; if (sample[i] === sample[j]) match++; }
  return match / total;
}

export const checks = [
  ['friedman-calc-ic-definition', () => {
    // hand-checkable case: AAB has counts A=2, B=1, so IC = (2*1 + 1*0)/(3*2) = 1/3
    assert.equal(ic('AAB').toFixed(6), (1 / 3).toFixed(6));
    assert.equal(ic('ABCD'), 0, 'four distinct letters share no pair');
    assert.equal(ic('AAAA'), 1, 'all letters equal');
    const small = 'AABBC';   // counts 2,2,1 -> (2+2+0)/(5*4) = 4/20
    assert.equal(ic(small).toFixed(6), (4 / 20).toFixed(6));
    const a = ic(SAMPLE), b = icByPairs(SAMPLE);
    assert.equal(a.toFixed(10), b.toFixed(10), 'the two routes must agree on the sample');
    return {
      handValues: { AAB: Number(ic('AAB').toFixed(6)), ABCD: ic('ABCD'), AAAA: ic('AAAA'), AABBC: Number(ic('AABBC').toFixed(6)) },
      sampleLetters: SAMPLE.length, byFormula: Number(a.toFixed(6)), byPairEnumeration: Number(b.toFixed(6)),
      printedAt: 'hac-ch7.txt:1536-1542',
    };
  }],

  ['friedman-calc-ic-range', () => {
    // The source states the range in terms of the plaintext distribution p and 1/n; this sample is the
    // repository's own prose, so the two ends are measured here rather than borrowed from Table 7.1.
    const n = 26, r = 1 / n;
    const plain = SAMPLE;
    const plainIc = ic(plain);
    const mono = [...plain].map((ch) => String.fromCharCode(A + (idx(ch) + 7) % 26)).join('');
    assert.equal(ic(mono).toFixed(10), plainIc.toFixed(10), 'a mono-alphabetic substitution must not change IC');
    const keyOf = (t) => [...Array(t)].map((_, i) => String.fromCharCode(A + ((i * 7 + 3) % 26))).join('');
    const values = [1, 2, 3, 5, 8, 13, 26].map((t) => ({ t, ic: ic(encipherVigenere(plain, keyOf(t))) }));
    // the upper end is this sample's own plaintext IC; the lower end is the printed 1/n
    assert.equal(values[0].t, 1);
    assert.equal(values[0].ic.toFixed(10), plainIc.toFixed(10), 'period 1 is a mono-alphabetic substitution');
    const last = values[values.length - 1];
    assert.ok(last.ic < values[0].ic, 'IC must fall as the number of alphabets grows');
    assert.ok(Math.abs(last.ic - r) < Math.abs(values[0].ic - r), 'the longest period must sit nearer the printed floor than the shortest');
    const decreasing = values.every((v, i) => i === 0 || v.ic <= values[i - 1].ic + 1e-9);
    assert.equal(decreasing, true, 'the measured index of coincidence did not fall as the number of alphabets grew');
    return {
      printedLowerBound: Number(r.toFixed(5)), printedLowerBoundAt: 'hac-ch7.txt:1569-1570 prints r = 0.03846 for n = 26',
      printedEnglishP: 0.0667, printedEnglishPAt: 'hac-ch7.txt:1590 (Table 7.1)',
      samplePlaintextIc: Number(plainIc.toFixed(5)),
      sampleIcDiffersFromPrintedEnglishP: Number((plainIc - 0.0667).toFixed(5)),
      monoalphabeticUnchanged: true, monotoneInPeriod: decreasing,
      byPeriod: values.map((v) => `t=${v.t}:${v.ic.toFixed(5)}`),
      note: 'the printed p is the source estimate for English; this sample measures its own value, and the check compares against that',
    };
  }],

  ['friedman-calc-period-by-partitioning', () => {
    // Example 7.76: the mean IC of the t groups approaches the plaintext IC only at the true period -
    // and, as the same paragraph implies, at every multiple of it.
    const planted = 5;
    const ct = encipherVigenere(SAMPLE, 'LEMON');
    const scores = [];
    for (let t = 1; t <= 10; t++) {
      const groupIcs = [];
      for (let r0 = 0; r0 < t; r0++) groupIcs.push(ic([...ct].filter((_, i) => i % t === r0).join('')));
      scores.push({ t, mean: groupIcs.reduce((a, b) => a + b, 0) / t, min: Math.min(...groupIcs), max: Math.max(...groupIcs) });
    }
    const target = ic(SAMPLE);
    const distance = (s) => Math.abs(s.mean - target);
    const smallest = scores.filter((s) => distance(s) < 0.002).sort((a, b) => a.t - b.t)[0];
    const qualifying = scores.filter((s) => distance(s) < 0.002).map((s) => s.t);
    assert.ok(smallest, 'no candidate came near the plaintext IC, so the procedure was not exercised');
    assert.equal(smallest.t, planted, `the smallest candidate that matches was ${smallest.t}, not the planted ${planted}`);
    for (const t of qualifying) assert.equal(t % planted, 0, `candidate ${t} matched but is not a multiple of the planted period`);
    assert.ok(!qualifying.includes(4) && !qualifying.includes(3), 'a candidate that is not a multiple of the period must not match');
    return {
      plantedPeriod: planted, keyword: 'LEMON', sampleLetters: SAMPLE.length,
      plaintextIc: Number(target.toFixed(5)),
      candidateMeans: scores.map((s) => `t=${s.t}:${s.mean.toFixed(5)}`),
      smallestMatchingCandidate: smallest.t, allMatchingCandidates: qualifying,
      disclosedLimitation: 'the statistic identifies the period only up to its multiples; 10 matches as well as 5',
      method: 'hac-ch7.txt:1572-1579 (Example 7.76)',
    };
  }],

  ['friedman-calc-shim-anchored', () => {
    // the local Vigenere helper used above must itself reproduce the ciphertext the source prints
    const computedExample = encipherVigenere('ATTACKATDAWN', 'LEMON');
    assert.equal(computedExample, PRINTED_EXAMPLE);
    return { printedCiphertext: PRINTED_EXAMPLE, computed: computedExample, printedAt: 'rutgers-classical.txt:131, read at run time' };
  }],
];
