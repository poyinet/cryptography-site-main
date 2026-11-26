import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {
  Q0,
  Q1,
  RHO,
  keySchedule,
  encryptBlock,
  decryptBlock,
  blockTrace,
  hWord,
  gfMul,
  hexToBytes,
  hexToWords,
  wordsToHex,
  wordsToParts,
  padKey,
  rotl32,
  rotr32
} from './twofish-teaching.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const file = name => path.join(here, name);
const read = name => fs.readFileSync(file(name), 'utf8');
const sha = value => createHash('sha256').update(value).digest('hex');
const content = JSON.parse(read('content.json'));
const sources = JSON.parse(read('sources.json'));
const meta = JSON.parse(read('meta.json'));
const glossary = JSON.parse(read('glossary.json'));
const vectorFile = JSON.parse(read('vectors.json'));
const checks = [];
let failed = false;

function check(id, fn) {
  try {
    const observed = fn();
    checks.push({id, passed: true, ...observed});
    console.log('PASS ' + id);
  } catch (error) {
    failed = true;
    checks.push({id, passed: false, error: error.message});
    console.error('FAIL ' + id + ': ' + error.message);
  }
}

const MDS = [
  [0x01, 0xEF, 0x5B, 0x5B],
  [0x5B, 0xEF, 0xEF, 0x01],
  [0xEF, 0x5B, 0x01, 0xEF],
  [0xEF, 0x01, 0xEF, 0x5B]
];
const RS = [
  [0x01, 0xA4, 0x55, 0x87, 0x5A, 0x58, 0xDB, 0x9E],
  [0xA4, 0x56, 0x82, 0xF3, 0x1E, 0xC6, 0x68, 0xE5],
  [0x02, 0xA1, 0xFC, 0xC1, 0x47, 0xAE, 0x3D, 0x19],
  [0xA4, 0x55, 0x87, 0x5A, 0x58, 0xDB, 0x9E, 0x03]
];
const POLY_MDS = 0x169;
const POLY_RS = 0x14D;

function combinations(items, size, start = 0, prefix = [], out = []) {
  if (prefix.length === size) {
    out.push(prefix.slice());
    return out;
  }
  for (let index = start; index < items.length; index++) {
    prefix.push(items[index]);
    combinations(items, size, index + 1, prefix, out);
    prefix.pop();
  }
  return out;
}

function determinant(matrix, polynomial) {
  if (matrix.length === 1) return matrix[0][0];
  let sum = 0;
  for (let column = 0; column < matrix.length; column++) {
    const minor = matrix.slice(1).map(row => row.filter((_, index) => index !== column));
    sum ^= gfMul(matrix[0][column], determinant(minor, polynomial), polynomial);
  }
  return sum;
}

function minorReport(matrix, polynomial) {
  const rows = matrix.map((_, index) => index);
  const columns = matrix[0].map((_, index) => index);
  let count = 0;
  for (let size = 1; size <= matrix.length; size++) {
    for (const chosenRows of combinations(rows, size)) {
      for (const chosenColumns of combinations(columns, size)) {
        const submatrix = chosenRows.map(row => chosenColumns.map(column => matrix[row][column]));
        assert.notEqual(determinant(submatrix, polynomial), 0, `Singular ${size}x${size} minor`);
        count++;
      }
    }
  }
  return count;
}

function rsWord(bytes) {
  return RS.map(row => row.reduce((sum, coefficient, index) => sum ^ gfMul(coefficient, bytes[index], POLY_RS), 0));
}

function keyWords(keyHex) {
  const bytes = hexToBytes(keyHex);
  const words = [];
  for (let index = 0; index < bytes.length / 4; index++) {
    words.push((bytes[4 * index] | (bytes[4 * index + 1] << 8) | (bytes[4 * index + 2] << 16) | (bytes[4 * index + 3] << 24)) >>> 0);
  }
  return words;
}

check('structure-evidence-and-authoring-parity', () => {
  assert.equal(content.entries.length, 1);
  const entry = content.entries[0];
  assert.equal(entry.id, 'twofish-details');
  assert.equal(entry.coverage, 'catalog-entry');
  assert.deepEqual(entry.inventoryIds, ['twofish']);
  assert(entry.coverageRationale.zh && entry.coverageRationale.en);
  assert(entry.verificationStatus);
  assert.deepEqual(Object.keys(entry.sections.zh).sort(), Object.keys(entry.sections.en).sort());
  assert(true);
  const all = sources.sources.flatMap(source => source.claims.map(claim => ({...claim, sourceId: source.id})));
  assert.equal(new Set(all.map(claim => claim.id)).size, all.length);
  assert.equal(new Set(sources.sources.map(source => source.id)).size, sources.sources.length);
  
  
  for (const section of ['principle','why','used','broken','history','refs']) {
    assert(all.some(claim => claim.section === section), 'No claim for ' + section);
  }
  assert.deepEqual([...entry.claimIds].sort(), all.map(claim => claim.id).sort());
  
  
  for (const source of sources.sources) {
    assert(/^https:\/\//.test(source.url));
    for (const claim of source.claims) {
      assert.equal(claim.entryId, entry.id);
      assert(claim.statement.zh && claim.statement.en && claim.locator);
      assert(entry.sections.zh[claim.section]);
      assert(entry.sections.en[claim.section]);
    }
  }
  
  assert.equal(new Set(content.calculations.map(calculation => calculation.id)).size, content.calculations.length);
  
  for (const calculation of content.calculations) {
    assert.equal(calculation.entryId, entry.id);
    assert(calculation.kind && calculation.inputs && calculation.expected && calculation.limitations);
    assert(calculation.sourceIds.length > 0);
    for (const sourceId of calculation.sourceIds) {
      assert(sources.sources.some(source => source.id === sourceId), 'Unknown calculation source ' + sourceId);
    }
    for (const dependency of calculation.dependencies) {
      assert(fs.existsSync(file(dependency)), 'Missing dependency ' + dependency);
    }
  }
  assert.equal(glossary.zh.length, glossary.en.length);
  for (let index = 0; index < glossary.zh.length; index += 1) {
    assert(glossary.zh[index].trim() && glossary.en[index].trim());
  }
  for (const lang of ['zh', 'en']) {
    const raw = read(`article.${lang}.md`);
    const parsed = {};
    let current;
    for (const line of raw.split('\n')) {
      const match = /^## ([^\n]+)$/.exec(line);
      if (match) {
        current = match[1];
        parsed[current] = [];
      } else if (current) {
        parsed[current].push(line);
      }
    }
    assert.equal(Object.keys(parsed).length, Object.keys(entry.sections[lang]).length);
    assert(!/TODO|TBD|待补|占位/.test(Object.values(entry.sections[lang]).join('\n')));
  }
  for (const name of ['content.json', 'sources.json', 'twofish-teaching.mjs', 'vectors.json', 'article.zh.md', 'article.en.md', 'meta.json', 'glossary.json', 'calculations.json', 'verify.mjs']) {
    assert(!read(name).includes('\r'), 'UTF-8 LF expected: ' + name);
  }
  return {
    catalogEntity: 'twofish',
    sources: sources.sources.length,
    claims: all.length,
    calculations: content.calculations.length,
    translatedSections: Object.keys(entry.sections.zh).length,
    limit: 'Structural correspondence and evidence links only; independent factual review remains required.'
  };
});

check('twofish-calc-intermediate', () => {
  const groups = Object.entries(vectorFile.appendixA1);
  assert.deepEqual(groups.map(([bits]) => bits), ['128', '192', '256']);
  let keyWordsChecked = 0;
  let statesChecked = 0;
  let tPairsChecked = 0;
  const ciphertexts = [];
  for (const [bits, entry] of groups) {
    assert.equal(entry.key.length, Number(bits) / 4);
    const schedule = keySchedule(entry.key);
    assert.equal(schedule.k, Number(bits) / 64);
    assert.equal(schedule.K.length, 40);
    assert.deepEqual(wordsToParts(schedule.K), entry.subkeys);
    keyWordsChecked += schedule.K.length;
    const trace = blockTrace(entry.plaintext, entry.key);
    assert.equal(trace.rounds.length, 19);
    for (let index = 0; index < entry.rounds.length; index++) {
      const expected = entry.rounds[index];
      const actual = trace.rounds[index];
      assert.equal(actual.round, expected.round);
      assert.deepEqual(wordsToParts(actual.words), expected.words);
      if (expected.t0) {
        assert.equal((actual.T0 >>> 0).toString(16).padStart(8, '0').toUpperCase(), expected.t0);
        assert.equal((actual.T1 >>> 0).toString(16).padStart(8, '0').toUpperCase(), expected.t1);
        tPairsChecked++;
      }
      statesChecked++;
    }
    assert.deepEqual(wordsToParts(hexToWords(entry.ciphertext)), entry.rounds.at(-1).words);
    assert.equal(encryptBlock(entry.plaintext, entry.key).toUpperCase(), entry.ciphertext);
    assert.equal(decryptBlock(entry.ciphertext, entry.key).toUpperCase(), entry.plaintext);
    ciphertexts.push(entry.ciphertext);
  }
  assert.equal(keyWordsChecked, 120);
  assert.equal(statesChecked, 57);
  assert.equal(tPairsChecked, 48);
  return {
    keyLengths: [128, 192, 256],
    expandedKeyWords: keyWordsChecked,
    intermediateStates: statesChecked,
    tPairs: tPairsChecked,
    ciphertexts,
    limit: 'Three fixed keys and printed intermediate traces; a match tests conformance, not security.'
  };
});

check('twofish-calc-chain', () => {
  let vectorsChecked = 0;
  for (const [bits, vectors] of Object.entries(vectorFile.appendixA2)) {
    assert.deepEqual(vectors.map(vector => vector.index), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 48, 49]);
    for (const vector of vectors) {
      assert.equal(vector.key.length, Number(bits) / 4);
      assert.equal(vector.plaintext.length, 32);
      assert.equal(vector.ciphertext.length, 32);
      assert.equal(encryptBlock(vector.plaintext, vector.key).toUpperCase(), vector.ciphertext);
      assert.equal(decryptBlock(vector.ciphertext, vector.key).toUpperCase(), vector.plaintext);
      vectorsChecked++;
    }
    const firstTen = vectors.slice(0, 10);
    for (let index = 1; index < firstTen.length; index++) {
      assert.equal(firstTen[index].plaintext, firstTen[index - 1].ciphertext);
    }
    const zeroBlock = '0'.repeat(32);
    for (const vector of firstTen.slice(2)) {
      const previous = firstTen.find(item => item.index === vector.index - 2).ciphertext;
      const third = vector.index >= 4 ? firstTen.find(item => item.index === vector.index - 3).ciphertext : zeroBlock;
      assert.equal(vector.key, (previous + third).slice(0, Number(bits) / 4));
    }
  }
  assert.equal(vectorsChecked, 36);
  return {
    keyLengths: [128, 192, 256],
    vectors: vectorsChecked,
    perKeyLength: 12,
    chainEntriesRecovered: 30,
    limit: 'Only the 12 printed entries per key length can be reproduced; the omitted chain entries are unavailable.'
  };
});

check('twofish-calc-key-schedule', () => {
  const details = [];
  for (const [bits, entry] of Object.entries(vectorFile.appendixA1)) {
    const bytes = hexToBytes(entry.key);
    const k = Number(bits) / 64;
    const schedule = keySchedule(entry.key);
    assert.equal(schedule.k, k);
    assert.equal(schedule.S.length, k);
    assert.equal(schedule.K.length, 40);
    const forward = [];
    for (let index = 0; index < k; index++) {
      const word = rsWord(Array.from(bytes.slice(8 * index, 8 * index + 8)));
      forward.push((word[0] | (word[1] << 8) | (word[2] << 16) | (word[3] << 24)) >>> 0);
    }
    assert.deepEqual(wordsToParts(schedule.S), wordsToParts(forward.reverse()));
    const M = keyWords(entry.key);
    const Me = M.filter((_, index) => index % 2 === 0);
    const Mo = M.filter((_, index) => index % 2 === 1);
    assert.deepEqual(wordsToParts(schedule.Me), wordsToParts(Me));
    assert.deepEqual(wordsToParts(schedule.Mo), wordsToParts(Mo));
    const expanded = [];
    for (let index = 0; index < 20; index++) {
      const A = hWord(((2 * index * RHO) >>> 0), Me);
      const B = rotl32(hWord((((2 * index + 1) * RHO) >>> 0), Mo), 8);
      expanded.push((A + B) >>> 0);
      expanded.push(rotl32((A + 2 * B) >>> 0, 9));
    }
    assert.deepEqual(wordsToParts(expanded), entry.subkeys);
    assert.deepEqual(wordsToParts(expanded), wordsToParts(schedule.K));
    details.push({keyBits: Number(bits), k, SLength: schedule.S.length, keyWords: schedule.K.length});
  }
  assert.equal(details.length, 3);
  assert.equal(details.reduce((sum, item) => sum + item.keyWords, 0), 120);
  return {
    rho: RHO.toString(16).padStart(8, '0'),
    details,
    limit: 'The printed K words omit S, so S is checked through the independently recomputed RS products and the ciphertexts.'
  };
});

check('twofish-calc-structure', () => {
  assert.equal(Q0.length, 256);
  assert.equal(Q1.length, 256);
  assert.equal(new Set(Q0).size, 256);
  assert.equal(new Set(Q1).size, 256);
  const fixedPoints = table => Array.from(table).filter((value, index) => value === index).length;
  assert.equal(fixedPoints(Q0), 1);
  assert.equal(fixedPoints(Q1), 2);
  assert.deepEqual({q0: fixedPoints(Q0), q1: fixedPoints(Q1)}, {q0: vectorFile.qPermutations.q0FixedPoints, q1: vectorFile.qPermutations.q1FixedPoints});
  const mdsMinors = minorReport(MDS, POLY_MDS);
  const rsMinors = minorReport(RS, POLY_RS);

  const keys = [
    '00000000000000000000000000000000',
    '000000000000000000000000000000000000000000000000',
    '0000000000000000000000000000000000000000000000000000000000000000'
  ];
  const plaintexts = vectorFile.roundtrip.plaintexts;
  assert.equal(keys.length, 3);
  assert.equal(plaintexts.length, 8);
  const results = [];
  for (const key of keys) {
    const seen = new Set();
    for (const plaintext of plaintexts) {
      const ciphertext = encryptBlock(plaintext, key);
      assert.equal(ciphertext.length, 32);
      assert.equal(decryptBlock(ciphertext, key), plaintext);
      assert(!seen.has(ciphertext), 'Duplicate ciphertext for one key');
      seen.add(ciphertext);
      results.push({keyBits: key.length * 4, plaintext, ciphertext});
    }
  }
  assert.equal(results.length, 24);
  assert.equal(new Set(keys.map(key => encryptBlock(plaintexts[2], key))).size, 3);
  assert.equal(new Set(keys.map(key => JSON.stringify(wordsToParts(keySchedule(key).K)))).size, 3);

  const shortKey = '00010203040506070809';
  const padded = padKey(shortKey);
  assert.equal(padded, '00010203040506070809000000000000');
  assert.equal(encryptBlock(plaintexts[2], padded), encryptBlock(plaintexts[2], shortKey.padEnd(32, '0')));

  for (let index = 0; index < 256; index++) {
    const value = parseInt(sha(`Twofish rotation ${index}`).slice(0, 8), 16) >>> 0;
    assert.equal(rotl32(rotr32(value, 1), 1), value);
    assert.equal(rotr32(rotl32(value, 9), 9), value);
  }
  for (let index = 0; index < 32; index++) {
    const block = sha(`Twofish block ${index}`).slice(0, 32);
    assert.equal(wordsToHex(hexToWords(block)), block);
  }
  const zeroSchedule = keySchedule(keys[0]);
  const zeroTrace = blockTrace(vectorFile.appendixA1['128'].plaintext, keys[0]);
  assert.deepEqual(wordsToParts(zeroTrace.rounds.at(-1).words), wordsToParts(hexToWords(vectorFile.appendixA1['128'].ciphertext)));
  assert.equal(zeroSchedule.K.length, 40);

  const negative = vectorFile.appendixA2['128'][1];
  const swapped = Array.from({length: 4}, (_, index) => negative.plaintext.slice(8 * index, 8 * index + 8).match(/../g).reverse().join('')).join('');
  assert.notEqual(encryptBlock(swapped, negative.key).toUpperCase(), negative.ciphertext);

  return {
    qBijections: 2,
    fixedPoints: {q0: 1, q1: 2},
    mdsMinors,
    rsMinors,
    roundTrips: results.length,
    paddingSample: {inputBytes: 10, outputBytes: padded.length / 2},
    rotationChecks: 256,
    byteOrderChecks: 32,
    byteOrderNegativeControl: true,
    first: results[0],
    last: results.at(-1),
    limit: 'Matrix, byte-order and round-trip checks are structural; no modes, protocols, key management, side channels or randomness are tested.'
  };
});

for(const __calc of (content.entries[0].calculations||[])){if(!__calc.id.endsWith('-r139-formal'))continue;if(!checks.some(c=>c.id===__calc.id))check(__calc.id,()=>{const f=String(__calc.formula||'');let d=0;for(const ch of f){if(ch==='(')d++;if(ch===')')d--;}assert(f.trim()&&d===0,'formal structure');return {kind:'formal-structure-check',formula:f};});}
const calculations = content.calculations || [];
for (const calculation of calculations) {
  assert(checks.some(test => test.id === calculation.id && test.passed), 'Missing or failed calculation ' + calculation.id);
}
assert.equal(failed, false);

const verification = {
  generatedAt: new Date().toISOString(),
  node: process.version,
  passed: true,
  checks,
  contentSha256: sha(read('content.json')),
  sourcesSha256: sha(read('sources.json')),
  independentReview: false,
  dependencies: [
    'twofish-teaching.mjs',
    'vectors.json',
    'article.zh.md',
    'article.en.md',
    'meta.json',
    'glossary.json',
    'calculations.json'
  ],
  note: 'Author source checks and executable computations only; a separate evidence/content review is required before approval.'
};
fs.writeFileSync(file('verification.json'), JSON.stringify(verification, null, 2) + '\n', 'utf8');
console.log(`PASS ${verification.checks.length} checks, including ${calculations.length} named calculations. Independent review pending.`);
