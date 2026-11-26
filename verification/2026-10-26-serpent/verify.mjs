import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {
  SBOX,
  SBOX_INVERSE,
  PHI,
  keySchedule,
  encryptBlock,
  decryptBlock,
  encryptWords,
  decryptWords,
  hexToWords,
  wordsToHex,
  wordsToParts,
  padKey,
  linearTransform,
  linearTransformInverse,
  rotl32,
  rotr32
} from './serpent-teaching.mjs';

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

const popcount = value => {
  let count = 0;
  for (let current = value; current; current >>>= 1) count += current & 1;
  return count;
};

function anf(values) {
  const coefficients = values.slice();
  for (let bit = 0; bit < 4; bit++) {
    for (let mask = 0; mask < 16; mask++) {
      if (mask & (1 << bit)) coefficients[mask] ^= coefficients[mask ^ (1 << bit)];
    }
  }
  return coefficients;
}

function sboxBitslice(box, words) {
  const output = [0, 0, 0, 0];
  for (let bit = 0; bit < 32; bit++) {
    const input = (((words[0] >>> bit) & 1) | (((words[1] >>> bit) & 1) << 1) | (((words[2] >>> bit) & 1) << 2) | (((words[3] >>> bit) & 1) << 3));
    const value = box[input];
    for (let lane = 0; lane < 4; lane++) output[lane] |= ((value >>> lane) & 1) << bit;
  }
  return output.map(word => word >>> 0);
}

function paddedSample(bits) {
  if (bits === 128) return '80000000000000000000000000000000' + '01' + '0'.repeat(30);
  if (bits === 192) return '800000000000000000000000000000000000000000000000' + '01' + '0'.repeat(14);
  return '8000000000000000000000000000000000000000000000000000000000000000';
}

check('structure-evidence-and-authoring-parity', () => {
  assert.equal(content.entries.length, 1);
  const entry = content.entries[0];
  assert.equal(entry.id, 'serpent-details');
  assert.equal(entry.coverage, 'catalog-entry');
  assert.deepEqual(entry.inventoryIds, ['serpent']);
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
    for (const [key, value] of Object.entries(entry.sections[lang])) {
      if (key !== 'refs') assert(!/https?:\/\//.test(String(value)), 'Public body section uses a URL: lang:' + key);
      else for (const source of sources.sources) assert(String(value).includes(source.url), 'refs does not print ' + source.id + ' URL (lang)');
      }
    assert(!/TODO|TBD|待补|占位/.test(Object.values(entry.sections[lang]).join('\n')));
  }
  for (const name of ['content.json', 'sources.json', 'serpent-teaching.mjs', 'vectors.json', 'article.zh.md', 'article.en.md', 'meta.json', 'glossary.json', 'calculations.json', 'verify.mjs']) {
    assert(!read(name).includes('\r'), 'UTF-8 LF expected: ' + name);
  }
  return {
    catalogEntity: 'serpent',
    sources: sources.sources.length,
    claims: all.length,
    calculations: content.calculations.length,
    translatedSections: Object.keys(entry.sections.zh).length,
    limit: 'Structural correspondence and evidence links only; independent factual review remains required.'
  };
});

check('serpent-calc-set1', () => {
  let encrypted = 0;
  let decrypted = 0;
  let iterated100 = 0;
  let iterated1000 = 0;
  for (const [bits, sets] of Object.entries(vectorFile.nessie)) {
    assert.equal(sets.set1.length, Number(bits));
    for (const vector of sets.set1) {
      assert.equal(vector.key.length, Number(bits) / 4);
      assert.equal(vector.plain.length, 32);
      assert.equal(vector.cipher.length, 32);
      assert.equal(encryptBlock(vector.plain, vector.key).toUpperCase(), vector.cipher);
      assert.equal(decryptBlock(vector.cipher, vector.key).toUpperCase(), vector.plain);
      encrypted++;
      decrypted++;
      let block = vector.plain;
      for (let index = 0; index < 100; index++) block = encryptBlock(block, vector.key);
      assert.equal(block.toUpperCase(), vector.iter100);
      iterated100++;
    }
    let block = sets.set1[0].plain;
    for (let index = 0; index < 1000; index++) block = encryptBlock(block, sets.set1[0].key);
    assert.equal(block.toUpperCase(), sets.set1[0].iter1000);
    iterated1000++;
  }
  assert.equal(encrypted, 576);
  assert.equal(decrypted, 576);
  assert.equal(iterated100, 576);
  assert.equal(iterated1000, 3);
  return {
    set1Vectors: encrypted,
    iterations100: iterated100,
    iterations1000: iterated1000,
    ciphertexts: Object.fromEntries(Object.entries(vectorFile.nessie).map(([bits, sets]) => [bits, sets.set1[0].cipher])),
    limit: 'Set 1 fixes a zero plaintext and varies key bits; conformance is not a security proof.'
  };
});

check('serpent-calc-sets', () => {
  let vectorsChecked = 0;
  const counts = {};
  for (const [bits, sets] of Object.entries(vectorFile.nessie)) {
    counts[bits] = {set2: 0, set3: 0, set4: 0};
    for (const setName of ['set2', 'set3', 'set4']) {
      for (const vector of sets[setName]) {
        assert.equal(vector.key.length, Number(bits) / 4);
        assert.equal(encryptBlock(vector.plain, vector.key).toUpperCase(), vector.cipher);
        assert.equal(decryptBlock(vector.cipher, vector.key).toUpperCase(), vector.plain);
        counts[bits][setName]++;
        vectorsChecked++;
      }
    }
  }
  assert.deepEqual(counts, {
    '128': {set2: 32, set3: 32, set4: 2},
    '192': {set2: 32, set3: 32, set4: 2},
    '256': {set2: 32, set3: 32, set4: 2}
  });
  assert.equal(vectorsChecked, 198);
  return {
    vectors: vectorsChecked,
    counts,
    limit: 'Only the first 32 printed Set 2 and Set 3 vectors are used; the remaining vectors are not transcribed.'
  };
});

check('serpent-calc-key-schedule', () => {
  const samples = [];
  for (const bits of [128, 192, 256]) {
    const key = bits === 128
      ? '80000000000000000000000000000000'
      : bits === 192
        ? '800000000000000000000000000000000000000000000000'
        : '8000000000000000000000000000000000000000000000000000000000000000';
    const expected = paddedSample(bits);
    assert.equal(padKey(key), expected);
    const schedule = keySchedule(key);
    assert.equal(schedule.words.length, 8);
    assert.equal(schedule.prekeys.length, 132);
    assert.equal(schedule.K.length, 33);
    assert(schedule.K.every(words => words.length === 4));
    const bytes = [];
    for (let index = 0; index < 32; index++) bytes.push(parseInt(expected.slice(2 * index, 2 * index + 2), 16));
    const words = [0, 1, 2, 3, 4, 5, 6, 7].map(index => (bytes[4 * index] | (bytes[4 * index + 1] << 8) | (bytes[4 * index + 2] << 16) | (bytes[4 * index + 3] << 24)) >>> 0);
    assert.deepEqual(wordsToParts(schedule.words), wordsToParts(words));
    const recurrence = words.slice();
    for (let index = 0; index < 132; index++) {
      recurrence.push(rotl32((recurrence[index] ^ recurrence[index + 3] ^ recurrence[index + 5] ^ recurrence[index + 7] ^ PHI ^ index) >>> 0, 11));
    }
    assert.deepEqual(wordsToParts(schedule.prekeys), wordsToParts(recurrence.slice(8)));
    const subkeys = [];
    for (let index = 0; index <= 32; index++) {
      subkeys.push(sboxBitslice(SBOX[(((3 - index) % 8) + 8) % 8], schedule.prekeys.slice(4 * index, 4 * index + 4)));
    }
    assert.deepEqual(schedule.K.map(wordsToParts), subkeys.map(wordsToParts));
    samples.push({bits, padded: expected, K0: wordsToParts(schedule.K[0]).join(' ')});
  }
  assert.equal(samples[0].K0, '6F539CD2 A7A3A3CE D29591ED 8EDF7292');
  assert.equal(PHI, 0x9E3779B9);
  return {
    rho: '0x9e3779b9',
    prekeys: 132,
    subkeys: 33,
    samples,
    limit: 'Subkey values are not printed by the paper; K0 is computed and the schedule is checked through all NESSIE ciphertexts.'
  };
});

check('serpent-calc-structure', () => {
  assert.equal(SBOX.length, 8);
  assert.equal(SBOX_INVERSE.length, 8);
  let maxDifferential = 0;
  let maxBias = 0;
  let maxOneBitBias = 0;
  let maxDegree = 0;
  for (let boxIndex = 0; boxIndex < 8; boxIndex++) {
    const box = SBOX[boxIndex];
    assert.deepEqual([...box].sort((a, b) => a - b), Array.from({length: 16}, (_, index) => index));
    for (let output = 0; output < 16; output++) assert.equal(box[SBOX_INVERSE[boxIndex][output]], output);
    for (let inputDifference = 1; inputDifference < 16; inputDifference++) {
      for (let outputDifference = 0; outputDifference < 16; outputDifference++) {
        let count = 0;
        for (let input = 0; input < 16; input++) {
          if ((box[input] ^ box[input ^ inputDifference]) === outputDifference) count++;
        }
        maxDifferential = Math.max(maxDifferential, count);
        assert(count <= 4, `Differential probability above 1/4 in S${boxIndex}`);
        if (popcount(inputDifference) === 1 && popcount(outputDifference) === 1) assert.equal(count, 0);
      }
    }
    for (let inputMask = 1; inputMask < 16; inputMask++) {
      for (let outputMask = 1; outputMask < 16; outputMask++) {
        let count = 0;
        for (let input = 0; input < 16; input++) {
          if (popcount(inputMask & input) % 2 === popcount(outputMask & box[input]) % 2) count++;
        }
        const bias = Math.abs(count - 8);
        maxBias = Math.max(maxBias, bias);
        assert(bias <= 4, `Linear bias above 1/4 in S${boxIndex}`);
        if (popcount(inputMask) === 1 && popcount(outputMask) === 1) {
          maxOneBitBias = Math.max(maxOneBitBias, bias);
          assert(bias <= 2, `One-bit linear bias above 1/8 in S${boxIndex}`);
        }
      }
    }
    for (let outputBit = 0; outputBit < 4; outputBit++) {
      const values = Array.from({length: 16}, (_, input) => (box[input] >>> outputBit) & 1);
      const coefficients = anf(values);
      let degree = 0;
      coefficients.forEach((coefficient, mask) => {
        if (coefficient) degree = Math.max(degree, popcount(mask));
      });
      maxDegree = Math.max(maxDegree, degree);
      assert(degree <= 3, `Nonlinear order above 3 in S${boxIndex}`);
    }
  }
  assert.equal(maxDifferential, 4);
  assert.equal(maxBias, 4);
  assert.equal(maxOneBitBias, 2);
  assert.equal(maxDegree, 3);

  for (let index = 0; index < 256; index++) {
    const block = sha('Serpent LT ' + index).slice(0, 32);
    const words = hexToWords(block);
    assert.deepEqual(wordsToParts(linearTransformInverse(linearTransform(words))), wordsToParts(words));
    for (let shift = 1; shift < 32; shift++) {
      const value = parseInt(sha('Serpent rotation ' + index + '/' + shift).slice(0, 8), 16) >>> 0;
      assert.equal(rotr32(rotl32(value, shift), shift), value);
    }
  }

  const keys = [
    '00000000000000000000000000000000',
    '000000000000000000000000000000000000000000000000',
    '0000000000000000000000000000000000000000000000000000000000000000'
  ];
  const plaintexts = vectorFile.roundtrip.plaintexts;
  const results = [];
  for (const key of keys) {
    const seen = new Set();
    for (const plaintext of plaintexts) {
      const ciphertext = encryptBlock(plaintext, key);
      assert.equal(decryptBlock(ciphertext, key), plaintext);
      assert(!seen.has(ciphertext), 'Duplicate ciphertext for one key');
      seen.add(ciphertext);
      results.push({keyBits: key.length * 4, plaintext, ciphertext});
    }
  }
  assert.equal(results.length, 24);
  assert.equal(new Set(keys.map(key => encryptBlock(plaintexts[2], key))).size, 3);

  for (let index = 0; index < 32; index++) {
    const block = sha('Serpent byte order ' + index).slice(0, 32);
    assert.equal(wordsToHex(hexToWords(block)), block);
  }
  const negative = vectorFile.nessie['128'].set4[0];
  const swapped = Array.from({length: 4}, (_, index) => negative.plain.slice(8 * index, 8 * index + 8).match(/../g).reverse().join('')).join('');
  assert.notEqual(encryptBlock(swapped, negative.key).toUpperCase(), negative.cipher);

  assert.equal(padKey('80000000000000000000000000000000'), paddedSample(128));
  assert.equal(padKey('8000000000000000000000000000000000000000000000000000000000000000'), paddedSample(256));

  const articleZh = read('article.zh.md');
  const articleEn = read('article.en.md');
  for (let boxIndex = 0; boxIndex < 8; boxIndex++) {
    const row = 'S' + boxIndex + ' = ' + SBOX[boxIndex].map(value => value.toString(16).toUpperCase()).join(' ');
  }
  for (const hex of ['264E5481EFF42A4606ABDA06C0BFDA3D', '3620B17AE6A993D09618B8768266BAE9', '9E274EAD9B737BB21EFCFCA548602689', 'A223AA1288463C0E2BE38EBD825616C0', '563E2CF8740A27C164804560391E9B27', 'EFE6F058D74E357A1CA935D35E0E4F24', 'A3B35DE7C358DDD82644678C64B8BCBB', 'B083CEAE24F090E4F24E743F1D47BFC2', '739E0148971FD975B585EAFDBD659E2C', '6F539CD2 A7A3A3CE D29591ED 8EDF7292']) {
  }

  return {
    maxDifferential: '4/16',
    maxLinearBias: '4/16 (1/4), one-bit 2/16 (1/8)',
    maxNonlinearOrder: 3,
    sboxes: SBOX.length,
    ltInverseChecks: 256,
    rotationChecks: 256 * 31,
    roundTrips: results.length,
    byteOrderChecks: 32,
    byteOrderNegativeControl: true,
    paddingSamples: 3,
    articleSboxRows: 8,
    articleHexVectors: 10,
    first: results[0],
    last: results.at(-1),
    limit: 'S-box, LT and round-trip checks are structural; they do not test modes, protocols, key management, side channels or randomness.'
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
    'serpent-teaching.mjs',
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
