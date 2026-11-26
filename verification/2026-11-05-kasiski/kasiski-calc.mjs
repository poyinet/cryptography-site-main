// Kasiski calculations for dossier 2026-11-05-kasiski.
// The method is checked against what the registered handbook prints, and the period it recovers is a
// period this module planted without telling the analysis where it is:
//  - "repeated portions of plaintext encrypted with the same portion of the keyword result in identical
//    ciphertext segments" (hac-ch7.txt:1477-1478)
//  - "one expects the number of characters between the beginning of repeated ciphertext segments to be a
//    multiple of the keyword length" (1479-1480)
//  - "the largest factor which occurs most commonly is the most likely keyword length. Repeated ciphertext
//    segments of length 4 or longer are most useful" (1483-1485)
//  - Example 7.77 auto-correlation: "for values t that are a multiple of t, the counts will be noticeably
//    higher" (1604-1605)
//  - "running-key ciphers prevent cryptanalysis by the Kasiski method" (1105)
import assert from 'node:assert/strict';
import { SAMPLE, letterStream } from './classical-sample.mjs';

const A = 65;
const idx = (ch) => ch.charCodeAt(0) - A;
const enc = (pt, key) => [...pt].map((ch, i) => String.fromCharCode(A + (idx(ch) + idx(key[i % key.length])) % 26)).join('');

export function repeatedSegments(text, minLength) {
  const seen = new Map();
  const hits = [];
  for (let i = 0; i + minLength <= text.length; i++) {
    const seg = text.slice(i, i + minLength);
    if (seen.has(seg)) { for (const j of seen.get(seg)) hits.push({ segment: seg, from: j, to: i, distance: i - j }); seen.get(seg).push(i); }
    else seen.set(seg, [i]);
  }
  return hits;
}
const factors = (n) => { const out = []; for (let d = 2; d <= n; d++) if (n % d === 0) out.push(d); return out; };

export const checks = [
  ['kasiski-calc-printed-observation', () => {
    // the printed observation both ways: same keyword portion -> identical segments, different portion -> not
    const phrase = 'ANDWHENTHEDISKESTURN';          // 20 letters
    const gap = 'XXXXXXXXXX';                       // 10 letters, so 20+10 is a multiple of the period 5
    const plain = phrase + gap + phrase;
    const start2 = phrase.length + gap.length;
    const key = 'LEMON';
    assert.equal(start2 % 5, 0, 'the second copy must start under the same keyword portion');
    const ct = enc(plain, key);
    assert.equal(ct.slice(0, 20), ct.slice(start2, start2 + 20), 'identical plaintext under the same keyword portion must give identical ciphertext');
    const plainOff = phrase + 'X'.repeat(9) + phrase;   // one letter shorter gap: keyword portion changes
    const ctOff = enc(plainOff, key);
    assert.notEqual(ctOff.slice(0, 20), ctOff.slice(29, 49), 'a different keyword portion must not reproduce the segment');
    return {
      phrase, distance: start2, distanceModPeriod: start2 % 5,
      identicalUnderSameKeywordPortion: true, differsUnderDifferentPortion: true,
      printedAt: 'hac-ch7.txt:1477-1480',
    };
  }],

  ['kasiski-calc-period-from-distances', () => {
    const planted = 5;
    const ct = enc(SAMPLE, 'LEMON');
    const hits = repeatedSegments(ct, 4);
    assert.ok(hits.length > 0, 'a repeating keyword must leave repeated 4-letter segments in a text this long');
    const tally = new Map();
    for (const h of hits) for (const f of factors(h.distance)) tally.set(f, (tally.get(f) || 0) + 1);
    const ranked = [...tally.entries()].sort((a, b) => (b[1] - a[1]) || (a[0] - b[0]));
    const topCount = ranked[0][1];
    const largestMostCommon = ranked.filter(([, c]) => c === topCount).map(([d]) => d).sort((a, b) => b - a)[0];
    const multiples = hits.filter((h) => h.distance % planted === 0).length;
    const coincidental = hits.length - multiples;
    // the source expects multiples "ideally" but prints that coincidental repeats also occur (1481-1482),
    // so the claim checked here is the one it actually makes: the largest most-common factor is the period
    assert.equal(largestMostCommon, planted, `the largest most-common factor was ${largestMostCommon}, not the planted ${planted}`);
    assert.ok(multiples / hits.length > 0.95, `only ${multiples}/${hits.length} distances were multiples of the period`);
    return {
      plantedPeriod: planted, windowLength: 4, repeatedWindowsFound: hits.length, quantity: 'repeated 4-letter windows; the handbook counts segments of length 4 or longer',
      distancesMultiplesOfPeriod: multiples, coincidentalRepeats: coincidental,
      coincidentalShare: Number((coincidental / hits.length).toFixed(4)),
      factorRanking: ranked.slice(0, 6).map(([d, c]) => `${d}:${c}`),
      recoveredPeriod: largestMostCommon,
      printedAt: 'hac-ch7.txt:1479-1485 (multiples expected, coincidental repeats acknowledged)',
    };
  }],

  ['kasiski-calc-autocorrelation-route', () => {
    // Example 7.77, an independent route to the same period
    const planted = 5;
    const ct = enc(SAMPLE, 'LEMON');
    const counts = [];
    for (let t = 1; t <= 10; t++) {
      let c = 0;
      for (let i = 0; i + t < ct.length; i++) if (ct[i] === ct[i + t]) c++;
      counts.push({ t, c });
    }
    const meanNonMultiple = counts.filter((x) => x.t % planted !== 0).reduce((s, x) => s + x.c, 0) / counts.filter((x) => x.t % planted !== 0).length;
    const multiples = counts.filter((x) => x.t % planted === 0);
    for (const m of multiples) assert.ok(m.c > meanNonMultiple * 1.2, `lag ${m.t} did not stand out above the other lags`);
    const strongest = multiples.reduce((a, b) => (a.c >= b.c ? a : b));
    assert.equal(strongest.t % planted, 0);
    return {
      plantedPeriod: planted, lagsTested: counts.length,
      countsByLag: counts.map((x) => `${x.t}:${x.c}`),
      meanOfOtherLags: Math.round(meanNonMultiple), spikeLags: multiples.map((x) => x.t),
      printedAt: 'hac-ch7.txt:1599-1607 (Example 7.77)',
    };
  }],

  ['kasiski-calc-running-key-defeat', () => {
    // the printed countermeasure: a key as long as the plaintext leaves the distance analysis nothing to latch on to
    const plain = SAMPLE.slice(0, 1500);
    // A key stream as long as the message, generated rather than taken from a book. What has to hold is that
    // it has no PERIOD; occasional repeated windows are expected from randomness (about two over 1497 windows)
    // and are not what the Kasiski examination feeds on - a repeating keyword is.

    const key = letterStream('kasiski-running-key', plain.length);
    assert.equal(key.length, plain.length);
    const shortestPeriod = (text) => {
      for (let p = 1; p <= Math.floor(text.length / 2); p++) {
        let ok = true;
        for (let i = p; i < text.length && ok; i++) if (text[i] !== text[i - p]) ok = false;
        if (ok) return p;
      }
      return 0;
    };
    assert.equal(shortestPeriod(key), 0, 'the generated key stream turned out to be periodic');
    assert.equal(shortestPeriod('LEMONLEMON'), 5, 'sanity: a five-letter keyword written twice must be detected as period 5');
    const running = [...plain].map((ch, i) => String.fromCharCode(A + (idx(ch) + idx(key[i])) % 26)).join('');
    const keyword = enc(SAMPLE, 'LEMON').slice(0, 1500);

    const analyse = (text) => {
      const hits = repeatedSegments(text, 4);
      const tally = new Map();
      let entries = 0;
      for (const h of hits) for (const f of factors(h.distance)) { tally.set(f, (tally.get(f) || 0) + 1); entries++; }
      const ranked = [...tally.entries()].sort((a, b) => (b[1] - a[1]) || (a[0] - b[0]));
      return { hits: hits.length, entries, ranked };
    };
    const withKeyword = analyse(keyword);
    const withRunning = analyse(running);
    const conc = (a) => (a.ranked.length ? a.ranked[0][1] / Math.max(a.hits, 1) : 0);
    const keywordTop = withKeyword.ranked[0];
    const runningTop = withRunning.ranked[0] || [0, 0];
    assert.equal(keywordTop[0], 5, 'the repeating keyword must put the period on top of the factor ranking');
    // The comparison that means something is the volume of repeated windows against what randomness alone
    // would produce. For W windows over a 26-letter alphabet the expected number of repeats is
    // C(W,2)/26^4; with W = 1497 that is about 2.5. A repeating keyword multiplies it, an aperiodic key does not.
    const chanceRepeats = (w) => (w * (w - 1) / 2) / (26 ** 4);
    const windowsOf = (text) => repeatedSegments(text, 4).length;
    const wCount = plain.length - 3;
    const expected = chanceRepeats(wCount);
    const keywordWindows = windowsOf(keyword);
    const runningWindows = windowsOf(running);
    assert.ok(keywordWindows > expected * 10, `the repeating keyword produced only ${keywordWindows} repeated windows against a chance expectation of ${expected.toFixed(2)}`);
    assert.ok(runningWindows < expected * 4, `the drawn running key produced ${runningWindows} repeated windows, well above the chance level ${expected.toFixed(2)}`);
    const trials = [];
    for (let seed = 1; seed <= 20; seed++) {

      const k2 = letterStream(`kasiski-trial-${seed}`, plain.length);
      assert.equal(shortestPeriod(k2), 0, `trial key stream ${seed} was periodic`);
      const ct2 = [...plain].map((ch, x) => String.fromCharCode(A + (idx(ch) + idx(k2[x])) % 26)).join('');
      const scored = analyse(ct2);
      trials.push({ seed, windows: scored.hits, topFactor: scored.ranked.length ? scored.ranked[0][0] : null, topCount: scored.ranked.length ? scored.ranked[0][1] : 0 });
    }
    const trialCounts = trials.map((t) => t.windows);
    const maxTrial = Math.max(...trialCounts);
    const meanTrial = trialCounts.reduce((a, b) => a + b, 0) / trialCounts.length;
    assert.ok(maxTrial < expected * 6, `a trial reached ${maxTrial} repeated windows, far above the chance level ${expected.toFixed(2)}`);
    assert.ok(meanTrial < expected * 3, `the trials averaged ${meanTrial.toFixed(2)} repeated windows, above chance`);
    assert.ok(withKeyword.hits > 0, 'the repeating-keyword case must leave segments to analyse');
    return {
      printedClaim: 'running-key ciphers prevent cryptanalysis by the Kasiski method',
      printedAt: 'hac-ch7.txt:1105, in section 7.3.3 (the running-key example); p.242 is the page whose header sits at line 1088',
      plaintextLetters: plain.length,
      measure: 'repeated 4-letter windows against C(W,2)/26^4 for a uniform stream. The key streams come from a SHA-256 counter with rejection sampling: the 32-bit generator used earlier overflowed in floating point, drew from only 13 of the 26 letters, and its own repeat rate was about 19.5 rather than 2.45, which would have made the comparison false',
      chanceExpectation: Number(expected.toFixed(2)), windowsAvailable: wCount,
      repeatingKeyword: { repeatedWindows: keywordWindows, multipleOfChance: Number((keywordWindows / expected).toFixed(1)), topFactor: keywordTop[0] },
      thisRunningKey: { repeatedWindows: runningWindows, multipleOfChance: Number((runningWindows / expected).toFixed(2)), topFactor: runningTop[0] ?? null },
      twentyRunningKeys: {
        windowCounts: trialCounts, max: maxTrial, mean: Number(meanTrial.toFixed(2)),
        topFactors: trials.map((t) => t.topFactor).filter((x) => x !== null),
        note: 'a handful of chance repeats is expected in any long ciphertext; what the method needs is the multiplication a repeating keyword causes',
      },
      conclusion: 'with a key as long as the message and no period, the repeated segments stop being more numerous than chance, so there is no distance structure for the factor analysis to name; the key streams here are generated, not book text',
    };
  }],
];
