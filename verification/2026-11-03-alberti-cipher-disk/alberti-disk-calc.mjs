// Alberti cipher disk calculations for dossier 2026-11-03-alberti-cipher-disk.
// The printed facts are PARSED out of the registered retained text at run time, so this module cannot keep
// asserting a fixture that was typed by hand:
//  - "The larger, fixed disk carried the plaintext alphabet. The smaller, movable disk carried a scrambled
//    cipher alphabet. Turning the inner disk to a new position set a new substitution alphabet." (rutgers line 110)
//  - "The sender and receiver agreed on a starting alignment, such as outer A against inner G" (line 111)
//  - "In the disk pictured, outer R maps to inner M, so plaintext R becomes ciphertext M." (line 111)
//  - "One plaintext symbol could now map to many ciphertext symbols depending on its position in the message." (112)
//  - "Both parties had to have identical disks." and "Alberti suggested changing the alignment at irregular
//    intervals to make the switching harder to detect" (112)
// What is falsifiable here: the two printed mappings must be mutually consistent with one rotation model of a
// single scrambled inner alphabet, and the implementation must behave as that model says. The letters them-
// selves come from the file; they are not restated from this module.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../..');
const corpora = JSON.parse(fs.readFileSync(path.join(root, 'build/corpora.json'), 'utf8'));
const rutgers = fs.readFileSync(path.resolve(root, corpora['krzyzanowski-classical']), 'utf8');

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const A = 65;
const idx = (ch) => ch.charCodeAt(0) - A;

export function parsePrintedFacts(text) {
  const start = /outer ([A-Z]) against inner ([A-Z])/.exec(text);
  if (!start) throw new Error('the printed starting alignment "outer X against inner Y" is not in the registered text');
  const pair = /outer ([A-Z]) maps to inner ([A-Z]), so plaintext ([A-Z]) becomes ciphertext ([A-Z])/.exec(text);
  if (!pair) throw new Error('the printed mapping "outer X maps to inner Y, so plaintext X becomes ciphertext Z" is not in the registered text');
  assert.equal(pair[1], pair[3], 'the printed sentence ties its mapping to the same plaintext letter');
  assert.equal(pair[2], pair[4], 'the printed sentence ties its mapping to the same ciphertext letter');
  const structure = /The larger, fixed disk carried the plaintext alphabet\. The smaller, movable disk carried a scrambled cipher alphabet\./.test(text);
  assert.equal(structure, true, 'the fixed/movable disk description is not in the registered text');
  return {
    startOuter: start[1], startInner: start[2],
    pairOuter: pair[1], pairInner: pair[2],
    startLine: text.slice(0, start.index).split('\n').length,
    pairLine: text.slice(0, pair.index).split('\n').length,
  };
}
export const FACTS = parsePrintedFacts(rutgers);

export class Disk {
  constructor(innerAlphabet, offset = 0) {
    if (innerAlphabet.length !== 26 || new Set(innerAlphabet).size !== 26) throw new Error('inner must be a 26-letter permutation');
    this.inner = innerAlphabet;
    this.offset = offset;
  }
  map(plainLetter) { return this.inner[(idx(plainLetter) + this.offset) % 26]; }
  rotate(newOffset) { return new Disk(this.inner, ((newOffset % 26) + 26) % 26); }
  alphabet() { return this.inner.slice(this.offset % 26) + this.inner.slice(0, this.offset % 26); }
}

// Build the inner arrangement from the two parsed mappings. They are constraints, not assignments: the pair
// fixes inner[x] for two different outer letters, and the check below proves the pair of constraints can be
// satisfied by one permutation at one alignment - which is precisely what the source asserts and would be
// false if the two printed letters collided.
export function innerFromFacts() {
  const slot = new Array(26).fill(null);
  const place = (outer, inner) => {
    if (slot[idx(outer)] !== null && slot[idx(outer)] !== inner) throw new Error(`the printed mappings contradict each other at ${outer}`);
    slot[idx(outer)] = inner;
  };
  place(FACTS.startOuter, FACTS.startInner);
  place(FACTS.pairOuter, FACTS.pairInner);
  assert.notEqual(FACTS.startInner, FACTS.pairInner, 'the two printed inner letters must differ or the disk is not a permutation');
  const taken = new Set(slot.filter(Boolean));
  const pool = [...LETTERS].filter((c) => !taken.has(c));
  let counter = 0;
  let bytes = [];
  const nextByte = () => {
    if (!bytes.length) bytes = [...createHash('sha256').update(`alberti-inner:${counter++}`).digest()];
    return bytes.pop();
  };
  const randBelow = (n) => { let r; do { r = nextByte(); } while (r >= 256 - (256 % n)); return r % n; };
  for (let i = pool.length - 1; i > 0; i--) { const j = randBelow(i + 1); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  let k = 0;
  for (let i = 0; i < 26; i++) if (slot[i] === null) slot[i] = pool[k++];
  assert.equal(new Set(slot).size, 26, 'inner arrangement must stay a permutation');
  return slot.join('');
}

export function encipherWithAlignments(plain, offsets, inner = innerFromFacts()) {
  return [...plain].map((ch, i) => new Disk(inner, offsets[i % offsets.length]).map(ch)).join('');
}

export const checks = [
  ['alberti-disk-printed-mappings', () => {
    const d = new Disk(innerFromFacts(), 0);
    assert.equal(d.map(FACTS.startOuter), FACTS.startInner, 'the model does not reproduce the parsed starting alignment');
    assert.equal(d.map(FACTS.pairOuter), FACTS.pairInner, 'the model does not reproduce the parsed mapping');
    assert.notEqual(FACTS.startOuter, FACTS.pairOuter, 'the two printed facts would be the same fact');
    // these two were reported as reproduced facts but are identities of the rotation model, so they are
    // labelled as such: the falsifiable content of this check is the parse and the consistency above it
    assert.equal(new Disk(innerFromFacts(), 26).alphabet(), d.alphabet(), 'model identity: a full revolution returns to the same alignment');
    assert.notEqual(d.rotate(3).alphabet(), d.alphabet(), 'model identity: a rotation of a permutation is not the same string');
    return {
      parsedFromLines: { start: FACTS.startLine, pair: FACTS.pairLine },
      printedStartingAlignment: `${FACTS.startOuter} against ${FACTS.startInner}`,
      printedMapping: `${FACTS.pairOuter} to ${FACTS.pairInner}`,
      constraintsConsistent: true, registeredFile: corpora['krzyzanowski-classical'],
      modelIdentitiesNoted: 'the revolution and rotation statements below are properties of the rotation model, not measurements of the source',
      freePositions: 24, freePositionsNote: 'the source prints two of the 26 inner positions; the other 24 are a scramble and no historical arrangement is claimed',
    };
  }],

  ['alberti-disk-one-letter-many-symbols', () => {
    // "One plaintext symbol could now map to many ciphertext symbols depending on its position in the message"
    const inner = innerFromFacts();
    const offsets = [0, 5, 11];
    const outputs = offsets.map((o) => new Disk(inner, o).map(FACTS.pairOuter));
    assert.equal(new Set(outputs).size, offsets.length, 'distinct alignments must give this letter distinct ciphertext letters');
    // the same letter at the printed alignment must always give the printed letter
    assert.equal(new Disk(inner, 0).map(FACTS.pairOuter), FACTS.pairInner);
    return {
      letter: FACTS.pairOuter, alignments: offsets, distinctOutputs: outputs,
      atPrintedAlignment: outputs[0] === FACTS.pairInner, printedAt: `rutgers line ${FACTS.pairLine} and the sentence at line 112`,
    };
  }],

  ['alberti-disk-irregular-switching', () => {
    // Alberti "suggested changing the alignment at irregular intervals to make the switching harder to detect"
    const inner = innerFromFacts();
    const plain = 'TOBEORNOTTOBEORTOBEORNOT';
    const regular = encipherWithAlignments(plain, [0, 1, 2], inner);
    const irregular = encipherWithAlignments(plain, [0, 7, 3, 19, 11, 2, 23], inner);
    const consistency = (text, assumed) => {
      let consistent = 0;
      for (let i = 0; i < text.length; i++) {
        const off = (((inner.indexOf(text[i]) - idx(plain[i])) % 26) + 26) % 26;
        if (off === assumed[i % assumed.length]) consistent++;
      }
      return consistent / text.length;
    };
    const scoreRegular = consistency(regular, [0, 1, 2]);
    const scoreIrregular = consistency(irregular, [0, 1, 2]);
    assert.equal(scoreRegular, 1, 'a predictable rule must be fully consistent with itself');
    assert.ok(scoreIrregular < 0.5, `the irregular rule was still detected at ${scoreIrregular.toFixed(4)}`);
    assert.notEqual(regular, irregular, 'the two settings must produce different ciphertext from the same text');
    return {
      regularAlignments: [0, 1, 2], irregularAlignments: [0, 7, 3, 19, 11, 2, 23],
      periodThreeConsistencyRegular: scoreRegular, periodThreeConsistencyIrregular: Number(scoreIrregular.toFixed(4)),
      note: 'the detector is this module\'s; the printed claim is about detectability, not about this particular rule',
    };
  }],

  ['alberti-disk-two-parties-identical-disks', () => {
    // "Both parties had to have identical disks."
    const inner = innerFromFacts();
    const other = [...inner].reverse().join('');
    assert.notEqual(other, inner, 'the two arrangements must differ for this check to mean anything');
    const plain = 'SHESELLSSEASHELLS';
    const offsets = [0, 4, 8];
    const ct = encipherWithAlignments(plain, offsets, inner);
    const decrypt = (text, offs, innerAlphabet) => [...text].map((ch, i) => {
      const d = new Disk(innerAlphabet, offs[i % offs.length]);
      return LETTERS[d.alphabet().indexOf(ch)];
    }).join('');
    assert.equal(decrypt(ct, offsets, inner), plain, 'identical disks must recover the plaintext');
    const wrong = decrypt(ct, offsets, other);
    assert.notEqual(wrong, plain, 'a different inner arrangement must not recover it');
    return { letters: plain.length, identicalDiskRecovers: true, wrongDiskFails: true, wrongDiskOutput: wrong, printedAt: 'rutgers line 112' };
  }],
];
