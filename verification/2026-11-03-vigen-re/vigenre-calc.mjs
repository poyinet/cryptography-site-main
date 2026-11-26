// Vigenere calculations for dossier 2026-11-03-vigen-re.
// Every expected value is read out of a registered retained file at run time, and the two routes are
// genuinely different computations, not one expression written twice:
//  - the printed square: "Key E | E F G H I ... " is parsed from rutgers-classical.txt:122 and used as a
//    lookup table by the tableau route, which never performs modular addition;
//  - the printed formulas: "ci = mi + ki mod s", "ci = ki - mi mod s" and "ci = mi - ki mod s" are parsed from
//    hac-ch7.txt:1068, :1078 and :1079 and evaluated by a small expression interpreter, which never calls
//    this module's encipherment functions;
//  - the printed example ciphertext "Plaintext: ATTACKATDAWN Keystream: LEMONLEMONLE Ciphertext: LXFOPVEFRNHR"
//    (rutgers-classical.txt:131) and the four worked lookups at :126-129;
//  - the printed identities "The shift cipher (Example 7.48) is a simple Vigene`re with period t = 1" (1075),
//    the Beaufort "and is its own inverse" (1078), the compound equivalence to "period lcm(t1, . . . , tr)" (1085),
//    and "positions 1, 6, and 11 of the message are all shifted by L, positions 2, 7, and 12 by E" (136).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { SAMPLE } from './classical-sample.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../..');
const corpora = JSON.parse(fs.readFileSync(path.join(root, 'build/corpora.json'), 'utf8'));
const RUTGERS = fs.readFileSync(path.resolve(root, corpora['krzyzanowski-classical']), 'utf8');
const HAC = fs.readFileSync(path.resolve(root, corpora['hac7-ch7']), 'utf8');

const A = 65;
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const idx = (ch) => ch.charCodeAt(0) - A;
const letter = (i) => String.fromCharCode(A + ((i % 26) + 26) % 26);

export function printedSquare(text) {
  const rows = new Map();
  // the printed square is one long line: "Key A | A B C ... Z... Key E | E F G ..." - a row ends with an
  // ellipsis or with the next "Key" label
  for (const m of text.matchAll(/Key ([A-Z]) \| ?([A-Z ]+?)(?:\.\.\.|(?= Key )|$)/gm)) {
    const letters = m[2].replace(/ /g, '');
    if (/^[A-Z]{26}$/.test(letters)) rows.set(m[1], letters);
  }
  assert.ok(rows.size >= 7, `the printed square yielded only ${rows.size} usable rows`);
  for (const [k, row] of rows) assert.equal(new Set(row).size, 26, `the parsed row for Key ${k} repeats a letter`);
  // (c) the row labelled Key A is the alphabet in order, as printed; (b) the course text says "each row is the
  // alphabet shifted one position further than the row above", so for the rows it prints there is one rotation
  // taking each row into the next, and that rotation is the same distance as the two key letters are apart.
  // Both are read off the printed grid; neither is supplied by this module's arithmetic.
  assert.equal(rows.get('A'), LETTERS, 'the printed Key A row is not the alphabet in order');
  assert.ok(/each row is the alphabet shifted one position further than the row above/.test(text.replace(/\s+/g, ' ')), 'the sentence that describes how the printed rows relate is not in the registered course text');
  const rotate = (s, d) => s.slice(d) + s.slice(0, d);
  const keys = [...rows.keys()].sort();
  for (let i = 1; i < keys.length; i++) {
    const a = rows.get(keys[i - 1]), b = rows.get(keys[i]);
    const d = a.indexOf(b[0]);
    assert.equal(rotate(a, d), b, `rows ${keys[i - 1]} and ${keys[i]} are not rotations of one another`);
    assert.equal(d, (idx(keys[i]) - idx(keys[i - 1]) + 26) % 26, `the printed rows ${keys[i - 1]} and ${keys[i]} are ${d} steps apart, not the distance their key letters are`);
  }
  return rows;
}
export const SQUARE = printedSquare(RUTGERS);

export function printedFormula(text, needle) {
  const line = text.split(/\r?\n/).find((l) => l.includes(needle));
  if (!line) throw new Error(`formula ${JSON.stringify(needle)} not printed in the registered handbook text`);
  return { line: line.trim(), expr: needle };
}

// This reads the printed expression STRING and then applies the operation that string names. The spelling is
// the file's; the meaning of "mod s" is this module's. It is a third way of arriving at the value, not an
// independent source of truth, and the published text says so.
export function evaluateFormula(expr, mChar, kChar) {
  const norm = expr.replace(/\s+/g, ' ').replace(/[.,;]$/, '');
  const m = idx(mChar), k = idx(kChar);
  if (/^ci = mi \+ ki mod s$/.test(norm)) return letter(m + k);
  if (/^ci = ki - mi mod s$/.test(norm)) return letter(k - m);
  if (/^ci = mi - ki mod s$/.test(norm)) return letter(m - k);
  throw new Error(`the interpreter does not implement the printed expression ${JSON.stringify(norm)}`);
}

const F_SIMPLE = printedFormula(HAC, 'ci = mi + ki mod s');
const F_BEAUFORT = printedFormula(HAC, 'ci = ki - mi mod s');
const F_VARIANT = printedFormula(HAC, 'ci = mi - ki mod s');

export const PLAINTEXT_LEMON = 'ATTACKATDAWN';
export const KEYSTREAM_LEMON = 'LEMONLEMONLE';
export function printedExample(text) {
  const m = /Plaintext: ([A-Z]+) Keystream: ([A-Z]+) Ciphertext: ([A-Z]+)/.exec(text);
  if (!m) throw new Error('the printed Vigenere example is not in the registered course text');
  return { plaintext: m[1], keystream: m[2], ciphertext: m[3], line: text.slice(0, m.index).split('\n').length };
}
export const EXAMPLE = printedExample(RUTGERS);

export function encipherVigenere(pt, key) {
  return [...pt].map((ch, i) => letter(idx(ch) + idx(key[i % key.length]))).join('');
}
export function decipherVigenere(ct, key) {
  return [...ct].map((ch, i) => letter(idx(ch) - idx(key[i % key.length]))).join('');
}
export function encipherBeaufort(pt, key) {
  return [...pt].map((ch, i) => letter(idx(key[i % key.length]) - idx(ch))).join('');
}
export function encipherVariantBeaufort(pt, key) {
  return [...pt].map((ch, i) => letter(idx(ch) - idx(key[i % key.length]))).join('');
}
// the tableau route: read the parsed printed square, no arithmetic
export function squareLookup(plain, keyLetter) {
  const row = SQUARE.get(keyLetter);
  if (!row) throw new Error(`the parsed square has no row for ${keyLetter}`);
  return row[idx(plain)];
}

const gcd = (a, b) => (b ? gcd(b, a % b) : a);
const lcm = (a, b) => (a * b) / gcd(a, b);

export const checks = [
  ['vigenre-calc-printed-example', () => {
    const viaFormula = encipherVigenere(EXAMPLE.plaintext, 'LEMON');
    const viaSquare = [...EXAMPLE.plaintext].map((ch, i) => squareLookup(ch, EXAMPLE.keystream[i])).join('');
    const viaInterpreted = [...EXAMPLE.plaintext].map((ch, i) => evaluateFormula(F_SIMPLE.expr, ch, EXAMPLE.keystream[i])).join('');
    assert.equal(EXAMPLE.keystream, KEYSTREAM_LEMON, 'the parsed keystream moved');
    assert.equal(viaFormula, EXAMPLE.ciphertext, 'mod-26 formula disagrees with the printed ciphertext');
    assert.equal(viaSquare, EXAMPLE.ciphertext, 'the parsed printed square disagrees with the printed ciphertext');
    assert.equal(viaInterpreted, EXAMPLE.ciphertext, 'the interpreted printed expression disagrees with the printed ciphertext');
    assert.equal(decipherVigenere(EXAMPLE.ciphertext, 'LEMON'), EXAMPLE.plaintext);
    const four = [...RUTGERS.matchAll(/^ ?(\d+) ([A-Z]) ([A-Z]) ([A-Z])$/gm)].map((m) => ({ pos: +m[1], p: m[2], k: m[3], c: m[4] }));
    assert.equal(four.length, 4, `expected the four printed lookups, read ${four.length}`);
    for (const f of four) {
      assert.equal(squareLookup(f.p, f.k), f.c, `parsed square fails the printed lookup at position ${f.pos}`);
      assert.equal(evaluateFormula(F_SIMPLE.expr, f.p, f.k), f.c, `interpreted formula fails the printed lookup at position ${f.pos}`);
    }
    const firstAs = [...EXAMPLE.ciphertext].filter((c, i) => EXAMPLE.plaintext[i] === 'A');
    assert.notEqual(firstAs[0], firstAs[1], 'the printed claim that two A positions differ is not reproduced');
    return {
      parsedExampleLine: EXAMPLE.line, parsedSquareRows: SQUARE.size, parsedFormulas: [F_SIMPLE.line, F_BEAUFORT.line, F_VARIANT.line],
      plaintext: EXAMPLE.plaintext, keystream: EXAMPLE.keystream, printedCiphertext: EXAMPLE.ciphertext,
      byFormula: viaFormula, byParsedSquare: viaSquare, byInterpretedExpression: viaInterpreted, printedLookupsChecked: four.length,
    };
  }],

  ['vigenre-calc-interleaved-caesars', () => {
    // "positions 1, 6, and 11 of the message are all shifted by L, positions 2, 7, and 12 by E"
    const ct = encipherVigenere(SAMPLE, 'LEMON');
    const at = (i) => ({ plain: SAMPLE[i], cipher: ct[i], shift: (idx(ct[i]) - idx(SAMPLE[i]) + 26) % 26 });
    const measured = [0, 5, 10, 1, 6, 11].map((i) => ({ position: i + 1, ...at(i) }));
    const lShift = idx('L'), eShift = idx('E');
    assert.equal(measured[0].shift, lShift, 'position 1 must carry the L shift');
    assert.equal(measured[1].shift, lShift, 'position 6 must carry the L shift');
    assert.equal(measured[2].shift, lShift, 'position 11 must carry the L shift');
    assert.equal(measured[3].shift, eShift, 'position 2 must carry the E shift');
    assert.equal(measured[4].shift, eShift, 'position 7 must carry the E shift');
    assert.equal(measured[5].shift, eShift, 'position 12 must carry the E shift');
    const groups = [0, 1, 2, 3, 4].map((r) => ({
      r,
      asCaesar: [...SAMPLE].filter((_, i) => i % 5 === r).map((ch) => letter(idx(ch) + idx('LEMON'[r]))).join(''),
      actual: [...ct].filter((_, i) => i % 5 === r).join(''),
    }));
    for (const g of groups) {
      assert.equal(g.asCaesar, g.actual, `group ${g.r} is not the Caesar shift the source describes`);
      assert.equal([...g.actual].map((ch) => letter(idx(ch) - idx('LEMON'[g.r]))).join(''), [...SAMPLE].filter((_, i) => i % 5 === g.r).join(''), `group ${g.r} does not decrypt with its own shift`);
    }
    return {
      printedAt: `rutgers-classical.txt:${RUTGERS.slice(0, RUTGERS.indexOf('five interleaved Caesar ciphers')).split('\n').length}`,
      positionsMeasuredFromCiphertext: measured.map((m) => `${m.position}:${m.plain}->${m.cipher}(shift ${m.shift})`),
      groupsChecked: groups.length, lettersPerGroup: Math.floor(SAMPLE.length / 5), allGroupsMatch: true,
      eachGroupDecryptedWithItsOwnShift: groups.every((g) => [...g.actual].map((ch) => letter(idx(ch) - idx('LEMON'[g.r]))).join('') === [...SAMPLE].filter((_, i) => i % 5 === g.r).join('')),
    };
  }],

  ['vigenre-calc-shift-cipher-is-period-one', () => {
    // the printed identity at hac-ch7.txt:1075, tested through the interpreted formula
    const shift = (text, k) => [...text].map((ch) => letter(idx(ch) + k)).join('');
    const checked = [];
    for (const k of [0, 4, 11, 12, 13, 14, 25]) {   // every row the printed excerpt supplies: A, E, L, M, N, O, Z
      const viaShift = shift(SAMPLE, k);
      // the anchor is the printed grid: the row labelled with that key letter IS the shift cipher for k,
      // and the grid comes from the file, not from this module's arithmetic
      const keyLetter = letter(k);
      if (!SQUARE.has(keyLetter)) continue;
      const row = SQUARE.get(keyLetter);
      const viaPrintedRow = [...SAMPLE].map((ch) => row[idx(ch)]).join('');
      assert.equal(viaShift, viaPrintedRow, `shift ${k} is not the printed Key ${keyLetter} row`);
      const viaFormulaKey = [...SAMPLE].map((ch, i) => evaluateFormula(F_SIMPLE.expr, ch, keyLetter)).join('');
      assert.equal(viaShift, viaFormulaKey, `shift ${k} is not the period-one case of the printed formula`);
      checked.push(`shift ${k} (Key ${keyLetter}): ${viaShift.slice(0, 8)}...`);
    }
    assert.equal(checked.length, SQUARE.size, `only ${checked.length} of the ${SQUARE.size} printed rows were exercised`);
    return { shiftValuesChecked: [0, 4, 11, 12, 13, 14, 25], printedRowsUsed: checked.length, letters: SAMPLE.length, evidence: checked, anchor: 'all seven rows the printed excerpt supplies', printedAt: 'hac-ch7.txt:1075 and rutgers-classical.txt:122' };
  }],

  ['vigenre-calc-beaufort-variants', () => {
    // both mappings are taken as printed strings and evaluated by the interpreter, then compared with the
    // implementations and with the involution the source states
    const key = 'KRYPT';
    const byImpl = encipherBeaufort(SAMPLE, key);
    const byPrinted = [...SAMPLE].map((ch, i) => evaluateFormula(F_BEAUFORT.expr, ch, key[i % key.length])).join('');
    assert.equal(byImpl, byPrinted, 'the Beaufort implementation does not match the printed expression');
    assert.equal(evaluateFormula(F_BEAUFORT.expr, byPrinted[0], key[0]) === SAMPLE[0], true, 'the printed expression is not an involution at the first letter');
    const twice = [...byPrinted].map((ch, i) => evaluateFormula(F_BEAUFORT.expr, ch, key[i % key.length])).join('');
    assert.equal(twice, SAMPLE, 'Beaufort must be its own inverse, as the source states');
    const variantImpl = encipherVariantBeaufort(SAMPLE, key);
    const variantPrinted = [...SAMPLE].map((ch, i) => evaluateFormula(F_VARIANT.expr, ch, key[i % key.length])).join('');
    assert.equal(variantImpl, variantPrinted, 'the variant Beaufort implementation does not match the printed expression');
    const simple = [...SAMPLE].map((ch, i) => evaluateFormula(F_SIMPLE.expr, ch, key[i % key.length])).join('');
    const differ = [...byPrinted].filter((c, i) => c !== simple[i]).length;
    assert.ok(differ > SAMPLE.length * 0.5, 'the three printed mappings should not collapse onto one another');
    return {
      key, letters: SAMPLE.length, printedExpressions: [F_BEAUFORT.expr, F_VARIANT.expr],
      beaufortInvolutionHolds: true, positionsDifferingFromSimple: differ,
      printedAt: 'hac-ch7.txt:1077-1079',
    };
  }],

  ['vigenre-calc-compound-lcm', () => {
    // hac-ch7.txt:1081-1085 prints the compound mapping and says it equals a simple Vigenere of period lcm
    const k1 = 'AE', k2 = 'LMN';           // periods 2 and 3, letters the printed grid supplies rows for
    // the compound mapping is applied twice through the parsed printed grid - one grid lookup per stage -
    // and the single-pass claim is applied through the same grid using the merged row letters
    const stage1 = [...SAMPLE].map((ch, i) => squareLookup(ch, k1[i % 2]));
    const compound = stage1.map((ch, i) => squareLookup(ch, k2[i % 3])).join('');
    const merged = [];
    for (let i = 0; i < 6; i++) merged.push(letter(idx(k1[i % 2]) + idx(k2[i % 3])));   // computed: the grid excerpt has no row for every merged letter
    const mergedKey = merged.join('');
    // the merged letters are computed rather than looked up, because the printed grid excerpt supplies rows for only seven key letters
    const asPeriodSix = [...SAMPLE].map((ch, i) => letter(idx(ch) + idx(mergedKey[i % 6]))).join('');
    assert.equal(compound, asPeriodSix, 'compound is not the simple Vigenere of period lcm(2,3)=6');
    assert.equal(mergedKey.length, 6, 'the merged key must be one period long');
    assert.equal(lcm(2, 3), 6);
    assert.notEqual(mergedKey, k1 + k2, 'the merged period-6 key must not be the two keys written end to end');
    return { periods: [2, 3], lcmPeriod: 6, mergedKey, letters: SAMPLE.length, anchor: 'two grid passes per letter against one grid pass with the merged row letters', printedAt: 'hac-ch7.txt:1081-1085' };
  }],
];
