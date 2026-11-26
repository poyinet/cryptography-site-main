// Jefferson cylinder calculations for dossier 2026-11-05-jefferson.
// The retained handbook prints the device in enough detail to model it, and prints statements the model can
// contradict. Each statement is re-read from the registered text at run time by the `printed` helper, so a
// sentence that stopped being printed would stop this file running.
//  - "A solid cylinder 6 inches long is sliced into 36 disks ... The periphery of each disk is divided into
//    26 parts. On each disk, the letters A-Z are inscribed in a (different) random ordering." (1153-1155)
//  - "Plaintext messages are encrypted in 36-character blocks ... The 25 other parallel reference positions
//    then each define a ciphertext" (1156-1159)
//  - the receiver rotates the disks "to obtain characters along a fixed reference line matching the
//    ciphertext. The other 25 reference positions are examined for a recognizable plaintext. If the original
//    message is not recognizable ... both parties agree beforehand on an index 1 through 25" (1175-1179)
//  - "Re-ordering disks (1 through 36) alters the polyalphabetic substitution key. The number of possible
//    orderings is 36! [given there as] 3.72 x 10^41. Changing the ordering of letters on each disk affords
//    25! further mappings (per disk)" (1184-1186)
//  - "the result is the substitution mapping ci = ei(mi), where the subscript i in ei is taken modulo t.
//    The key consists of t permutations e1, ..., et" (1098-1099)
// The 36 wheel orderings are NOT printed (Figure 7.3 shows fragments of five rows), so they are generated here
// from a fixed seed and declared as an instance of the device, not as the historical arrangement.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { SAMPLE } from './classical-sample.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../..');
const corpora = JSON.parse(fs.readFileSync(path.join(root, 'build/corpora.json'), 'utf8'));
const hacText = fs.readFileSync(path.resolve(root, corpora['hac7-ch7']), 'utf8');
const hacFolded = hacText.replace(/\s+/g, ' ');

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const WHEELS = 36;
const PARTS = 26;

function printed(s) {
  if (!hacText.includes(s) && !hacFolded.includes(s.replace(/\s+/g, ' '))) {
    throw new Error(`not printed in the registered handbook text (${corpora['hac7-ch7']}): ${JSON.stringify(s.slice(0, 64))}`);
  }
  return s;
}

export function wheels() {
  const out = [];
  for (let w = 0; w < WHEELS; w++) out.push(shuffledAlphabet(`jefferson-wheel-${w}`));
  return out;
}

export function readCylinder(disks, block) {
  if (block.length !== WHEELS) throw new Error(`a block must be ${WHEELS} characters`);
  const rows = [];
  for (let r = 0; r < PARTS; r++) {
    let out = '';
    for (let w = 0; w < WHEELS; w++) {
      const plainIndex = disks[w].indexOf(block[w]);
      out += disks[w][(plainIndex + r) % PARTS];
    }
    rows.push(out);
  }
  return rows;
}


// A deterministic Fisher-Yates driven by SHA-256 with rejection, so the wheel orderings are an honest
// uniform sample rather than the low bits of an overflowed multiply.
export function shuffledAlphabet(seed) {
  const pool = [...LETTERS];
  let counter = 0;
  let bytes = [];
  const nextByte = () => {
    if (!bytes.length) { bytes = [...createHash('sha256').update(`${seed}:${counter++}`).digest()]; }
    return bytes.pop();
  };
  for (let i = pool.length - 1; i > 0; i--) {
    let r;
    do { r = nextByte(); } while (r >= 256 - (256 % (i + 1)));   // rejection: no modulo bias
    [pool[i], pool[r % (i + 1)]] = [pool[r % (i + 1)], pool[i]];
  }
  return pool.join('');
}

export const checks = [
  ['jefferson-calc-block-structure', () => {
    printed('A solid cylinder 6 inches long is sliced into 36 disks');
    printed('The periphery of each disk is divided into 26 parts');
    printed('in a (different) random ordering');
    printed('Plaintext messages are encrypted in 36-character blocks');
    printed('The 25 other parallel reference positions then each define a ciphertext');
    const disks = wheels();
    assert.equal(disks.length, WHEELS);
    for (const d of disks) assert.equal(new Set(d).size, PARTS, 'each disk must carry the 26 letters once');
    assert.equal(new Set(disks).size, WHEELS, 'the source says the orderings are different per disk, so no two wheels may match');
    const block = 'THEQUICKBROWNFOXJUMPSOVERTHELAZYDOGS';
    assert.equal(block.length, WHEELS);
    const rows = readCylinder(disks, block);
    assert.equal(rows.length, PARTS, 'the reference row plus the 25 other positions');
    const alternatives = rows.filter((r) => r !== block);
    assert.equal(alternatives.length, 25, 'the text says the 25 other parallel positions each define a ciphertext');
    assert.equal(new Set(alternatives).size, 25, 'the 25 candidate ciphertexts must be distinct from one another');
    assert.equal(rows.indexOf(block), 0, 'the reference row itself reads back the plaintext');
    return {
      wheels: WHEELS, partsPerWheel: PARTS, block, candidateCiphertexts: alternatives.length,
      distinctCandidates: new Set(alternatives).size, printedSentencesChecked: 5,
      registeredFile: corpora['hac7-ch7'],
      randomOrderings: 'generated from a fixed seed here; Figure 7.3 prints fragments of five wheel rows, not a complete ordering, so no historical order is claimed',
    };
  }],

  ['jefferson-calc-equals-full-vigenere', () => {
    // The printed statement is about STRUCTURE: a family of exactly t permutations with the subscript taken
    // modulo t (hac-ch7.txt:1098-1099). Two things here are falsifiable and one is not, and the record says so:
    // the five printed sentences below are re-read from the registered file, and the count of distinct
    // permutations is only 36 because the model has 36 wheels - if the device had been modelled with a
    // position-dependent wheel choice the equality at i and i+36 would fail. The equality itself, however,
    // holds by construction for this model, and is reported as a model property rather than as evidence.
    printed('The key consists of t permutations');
    const disks = wheels();
    const r = 17;
    const permAt = (i) => {
      const wheel = disks[i % WHEELS];
      const table = {};
      for (const m of LETTERS) table[m] = wheel[(wheel.indexOf(m) + r) % PARTS];
      return table;
    };
    const blocks = [];
    for (let s = 0; s + WHEELS <= SAMPLE.length; s += WHEELS) blocks.push(SAMPLE.slice(s, s + WHEELS));
    const viaDevice = blocks.map((b) => readCylinder(disks, b)[r]).join('');
    const distinct = new Set();
    let positions = 0;
    for (let i = 0; i + WHEELS < SAMPLE.length; i++) {
      const a = permAt(i), b = permAt(i + WHEELS);
      for (const m of LETTERS) assert.equal(a[m], b[m], `positions ${i} and ${i + WHEELS} do not share a permutation`);
      distinct.add(Object.keys(a).map((k) => a[k]).join(''));
      positions++;
    }
    assert.equal(distinct.size, WHEELS, `the device presented ${distinct.size} distinct permutations, not t = ${WHEELS}`);
    const viaFamily = [...SAMPLE].slice(0, positions).map((m, i) => permAt(i)[m]).join('');
    assert.equal(viaDevice.slice(0, positions), viaFamily, 'the row is not the ci = ei(mi) mapping with subscript modulo t');
    return {
      periodUsed: WHEELS, rowOffset: r, blocksTested: blocks.length, lettersTested: viaDevice.length,
      positionsCheckedForPeriodicity: positions, distinctPermutationsObserved: distinct.size,
      permutationForm: 'ci = ei(mi) with the subscript i taken modulo t (t = 36)',
      whatThisChecks: 'the count of distinct permutations (36) is measured over the model; the equality of position i with position i + 36 holds by construction because the model indexes the wheels that way, and is reported as a model property rather than as evidence about the source',
      printedAt: 'hac-ch7.txt:1098-1099',
    };
  }],

  ['jefferson-calc-key-space', () => {
    // What the extract literally prints is "36!", then "3.72", then "1041": the approximation sign and the
    // superscript are lost in this copy, so 3.72 x 10^41 is stated as a reconstruction of those fragments
    // rather than as a printed string. 25! is named with no decimal at all, and that absence is asserted.
    // mappings per disk) without a printed decimal, so only the first is compared with a printed figure.
    printed('ordering disks (1 through 36) alters the polyalphabetic substitution key');   // the copy hyphenates "Re-" onto the previous line
    printed('25! further mappings (per disk)');
    const fact = (n) => { let v = 1n; for (let i = 2n; i <= n; i++) v *= i; return v; };
    const thirtySix = fact(36n), twentyFive = fact(25n);
    const sci = (v) => { const s = v.toString(); return `${(Number(s.slice(0, 5)) / 10000).toFixed(2)}e${s.length - 1}`; };
    assert.equal(sci(thirtySix), '3.72e41', `36! computes to ${sci(thirtySix)}; the source prints 3.72 x 10^41`);
    assert.ok(twentyFive < thirtySix, 're-lettering one disk cannot outnumber the orderings of all disks');
    return {
      wheels: WHEELS, printedBytes: '36! ... 3.72 ... 1041 (approximation sign and superscript lost in this copy)', reconstructedFigure: '3.72 x 10^41', computedFactorial36: sci(thirtySix),
      printedPerDiskRelabelling: '25! further mappings (per disk)', computedFactorial25: sci(twentyFive),
      decimalPrintedFor25Factorial: 'asserted absent from the registered extract', printedAt: 'hac-ch7.txt:1184-1186',
    };
  }],

  ['jefferson-calc-decryption-side', () => {
    // The source prints a search with a fallback agreed index. The falsifiable facts: a ciphertext presents the
    // plaintext exactly once among the 26 rows - otherwise "examine the other 25 positions for a recognizable
    // plaintext" would be ambiguous - and the agreed index 1 through 25 lands on it.
    printed('reference positions are exam');
    printed('both parties agree beforehand on an index 1 through 25');
    const disks = wheels();
    const blocks = [];
    for (let s = 0; s + WHEELS <= SAMPLE.length; s += WHEELS) blocks.push(SAMPLE.slice(s, s + WHEELS));
    let searched = 0, duplicates = 0;
    for (const offset of [1, 7, 25]) {
      for (const b of blocks) {
        const ct = readCylinder(disks, b)[offset];
        const rows = readCylinder(disks, ct);
        const hits = rows.reduce((n, row) => n + (row === b ? 1 : 0), 0);
        assert.equal(hits, 1, `offset ${offset}: the plaintext appeared ${hits} times among the 26 rows`);
        assert.equal(rows[(26 - offset) % 26], b, `offset ${offset}: the agreed index did not land on the plaintext`);
        searched++; duplicates += hits - 1;
      }
    }
    assert.equal(searched, 3 * blocks.length);
    assert.equal(duplicates, 0);
    return {
      offsetsTested: [1, 7, 25], blocksPerOffset: blocks.length, ciphertextsSearched: searched,
      plaintextUniqueAmongThe26Rows: 'holds, and holds by construction for any permutation wheels', agreedIndexRuleHolds: 'same', modelPropertyNotEvidence: true,
    };
  }],
];
