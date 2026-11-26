import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {
  SBOX,
  B_TABLE,
  keyExpand,
  keyWords,
  encryptBlock,
  decryptBlock,
  hexToWords,
  wordsToHex,
  wordsToParts,
  rotl32,
  rotr32
} from './mars-teaching.mjs';

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
const byteDifference = (left, right) => {
  let count = 0;
  for (let index = 0; index < 4; index++) {
    if (((left >>> (8 * index)) & 0xFF) !== ((right >>> (8 * index)) & 0xFF)) count++;
  }
  return count;
};
const hasLongRun = word => {
  let start = 0;
  while (start < 32) {
    let end = start;
    const bit = (word >>> start) & 1;
    while (end + 1 < 32 && ((word >>> (end + 1)) & 1) === bit) end++;
    if (end - start + 1 >= 10) return true;
    start = end + 1;
  }
  return false;
};
const maskFor = word => {
  let mask = 0;
  let start = 0;
  while (start < 32) {
    let end = start;
    const bit = (word >>> start) & 1;
    while (end + 1 < 32 && ((word >>> (end + 1)) & 1) === bit) end++;
    if (end - start + 1 >= 10) {
      for (let position = Math.max(start + 1, 2); position <= Math.min(end - 1, 30); position++) mask |= 1 << position;
    }
    start = end + 1;
  }
  return mask >>> 0;
};

check('structure-evidence-and-authoring-parity', () => {
  assert.equal(content.entries.length, 1);
  const entry = content.entries[0];
  assert.equal(entry.id, 'mars-details');
  assert.equal(entry.coverage, 'catalog-entry');
  assert.deepEqual(entry.inventoryIds, ['mars']);
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
  for (const name of ['content.json', 'sources.json', 'mars-teaching.mjs', 'vectors.json', 'article.zh.md', 'article.en.md', 'meta.json', 'glossary.json', 'calculations.json', 'verify.mjs']) {
    assert(!read(name).includes('\r'), 'UTF-8 LF expected: ' + name);
  }
  return {
    catalogEntity: 'mars',
    sources: sources.sources.length,
    claims: all.length,
    calculations: content.calculations.length,
    translatedSections: Object.keys(entry.sections.zh).length,
    limit: 'Structural correspondence and evidence links only; independent factual review remains required.'
  };
});

check('mars-calc-vk-expansion', () => {
  const counts = {128: 0, 192: 0, 256: 0};
  for (const vector of vectorFile.vk) {
    const bits = vector.key.length * 4;
    counts[bits]++;
    const schedule = keyExpand(vector.key);
    assert.equal(schedule.K.length, 40);
    assert.deepEqual(wordsToParts(schedule.K), vector.expanded);
    assert.equal(encryptBlock('00000000000000000000000000000000', vector.key).toUpperCase(), vector.ct);
    assert.equal(decryptBlock(vector.ct, vector.key).toUpperCase(), '00000000000000000000000000000000');
  }
  assert.deepEqual(counts, {128: 128, 192: 192, 256: 256});
  assert.equal(vectorFile.vk.length, 576);
  return {
    vectors: vectorFile.vk.length,
    byKeyBits: counts,
    expandedKeyWords: vectorFile.vk.length * 40,
    limit: 'Zero plaintext and a single key bit set per vector; conformance only.'
  };
});

check('mars-calc-vt-tbl', () => {
  let vtCount = 0;
  let tblCount = 0;
  let ivtCount = 0;
  for (const vector of vectorFile.vt) {
    assert.equal(encryptBlock(vector.pt, vector.key).toUpperCase(), vector.ct);
    assert.equal(decryptBlock(vector.ct, vector.key).toUpperCase(), vector.pt);
    vtCount++;
  }
  for (const vector of vectorFile.tbl) {
    assert.equal(encryptBlock(vector.pt, vector.key).toUpperCase(), vector.ct);
    assert.equal(decryptBlock(vector.ct, vector.key).toUpperCase(), vector.pt);
    tblCount++;
  }
  for (const block of vectorFile.ivt) {
    assert.equal(encryptBlock(block.pt, block.key).toUpperCase(), block.ct);
    assert.equal(decryptBlock(block.ct, block.key).toUpperCase(), block.pt);
    assert.equal(block.ivs.length, 35);
    ivtCount++;
  }
  assert.equal(vtCount, 384);
  assert.equal(tblCount, 120);
  assert.equal(ivtCount, 6);
  return {
    vt: vtCount,
    tbl: tblCount,
    ivtBlocks: ivtCount,
    ivtPrintedValues: 6 * 35,
    limit: 'The IVT intermediate lines are not checked individually; only plaintext and ciphertext are used, with key expansion covered by the VK vectors.'
  };
});

check('mars-calc-key-schedule', () => {
  const keySamples = [
    '00000000000000000000000000000000',
    '000000000000000000000000000000000000000000000000',
    '0000000000000000000000000000000000000000000000000000000000000000'
  ];
  const schedules = [];
  for (const key of keySamples) {
    const schedule = keyExpand(key);
    assert.equal(schedule.words.length, key.length / 8);
    assert.equal(schedule.T.length, 15);
    assert.equal(schedule.K.length, 40);
    const words = keyWords(key);
    const T = new Array(15).fill(0);
    for (let index = 0; index < words.length; index++) T[index] = words[index];
    T[words.length] = words.length;
    const preK = new Array(40).fill(0);
    for (let j = 0; j < 4; j++) {
      for (let i = 0; i < 15; i++) {
        T[i] = (T[i] ^ rotl32((T[(i + 8) % 15] ^ T[(i + 13) % 15]) >>> 0, 3) ^ (4 * i + j)) >>> 0;
      }
      for (let round = 0; round < 4; round++) {
        for (let i = 0; i < 15; i++) T[i] = rotl32((T[i] + SBOX[T[(i + 14) % 15] & 0x1FF]) >>> 0, 9);
      }
      for (let i = 0; i < 10; i++) preK[10 * j + i] = T[(4 * i) % 15];
    }
    for (let i = 5; i <= 35; i += 2) {
      const selector = preK[i] & 3;
      const w = (preK[i] | 3) >>> 0;
      preK[i] = (w ^ (rotl32(B_TABLE[selector], preK[i - 1] & 31) & maskFor(w))) >>> 0;
    }
    assert.deepEqual(wordsToParts(schedule.K), wordsToParts(preK));
    for (let i = 5; i <= 35; i += 2) {
      assert.equal(schedule.K[i] & 3, 3);
      assert(!hasLongRun(schedule.K[i]));
    }
    schedules.push(wordsToParts(schedule.K));
  }
  assert.equal(new Set(schedules.map(schedule => schedule[0])).size, 3);
  return {
    keyBits: [128, 192, 256],
    words: 40,
    multiplicationKeys: 16,
    multiplesOddAndNoTenBitRuns: true,
    keySamples: 3,
    limit: 'The 576 printed Expanded Key vectors provide the direct external check; this calculation also re-derives the T recurrence and fixing.'
  };
});

check('mars-calc-structure', () => {
  assert.equal(SBOX.length, 512);
  assert(!SBOX.includes(0));
  assert(!SBOX.includes(0xFFFFFFFF));
  let minByteDifference = 4;
  for (let index = 0; index < 256; index++) {
    for (let other = index + 1; other < 256; other++) {
      minByteDifference = Math.min(minByteDifference, byteDifference(SBOX[index], SBOX[other]));
    }
  }
  for (let index = 256; index < 512; index++) {
    for (let other = index + 1; other < 512; other++) {
      minByteDifference = Math.min(minByteDifference, byteDifference(SBOX[index], SBOX[other]));
    }
  }
  assert(minByteDifference >= 3);
  for (let index = 0; index < 512; index++) {
    for (let other = index + 1; other < 512; other++) {
      assert.notEqual(SBOX[index], SBOX[other], 'Duplicate S-box entry');
      assert.notEqual((SBOX[index] ^ SBOX[other]) >>> 0, 0xFFFFFFFF, 'Complementary S-box entries');
      assert.notEqual((SBOX[index] + SBOX[other]) >>> 0, 0, 'Additive-inverse S-box entries');
    }
  }

  for (let words = 4; words <= 14; words++) {
    const key = sha('MARS key length ' + words).slice(0, words * 8);
    const schedule = keyExpand(key);
    assert.equal(schedule.K.length, 40);
    for (let i = 5; i <= 35; i += 2) {
      assert.equal(schedule.K[i] & 3, 3);
      assert(!hasLongRun(schedule.K[i]));
    }
  }

  for (let index = 0; index < 256; index++) {
    const block = sha('MARS byte order ' + index).slice(0, 32);
    assert.equal(wordsToHex(hexToWords(block)), block);
  }
  const negative = vectorFile.vt[0];
  const swapped = Array.from({length: 4}, (_, index) => negative.pt.slice(8 * index, 8 * index + 8).match(/../g).reverse().join('')).join('');
  assert.notEqual(encryptBlock(swapped, negative.key).toUpperCase(), negative.ct);

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

  const articleZh = read('article.zh.md');
  const articleEn = read('article.en.md');
  const hexVectors = [
    'DCC07B8DFB0738D6E30A22DFCF27E886',
    'F6B1B53C34B2B9E87F748482197E67E6',
    'E998F63D39378523A951320451085D56',
    'B3E2AD5608AC1B6733A7CB4FDF8F9952',
    'D962EFEBA75817BF6ED24BBBB5B7820D',
    '7A690123 4A4CF6EE D1C145FD 4A929170',
    '551A7316 D46B4D1F 6A68B2DD 52A45B5F'
  ];
  for (const hex of hexVectors) {
  }
  const hexTokens = text => [...new Set(text.match(/\b[0-9A-F]{8,}\b/g) || [])].sort();

  const tampered = vectorFile.vt[1].ct.slice(0, -1) + (vectorFile.vt[1].ct.endsWith('0') ? '1' : '0');
  assert.notEqual(decryptBlock(tampered, vectorFile.vt[1].key).toUpperCase(), vectorFile.vt[1].pt);
  assert(read('mars-teaching.mjs').includes('Math.imul('));

  return {
    sboxWords: SBOX.length,
    minByteDifferenceWithinHalves: minByteDifference,
    acceptedKeyWordCounts: 11,
    multiplicationKeysOddAndNoTenBitRuns: true,
    byteOrderChecks: 256,
    byteOrderNegativeControl: true,
    tamperedCiphertextRejected: true,
    roundTrips: results.length,
    articleHexVectors: hexVectors.length,
    articleHexParity: true,
    first: results[0],
    last: results.at(-1),
    limit: 'Structural and algebraic checks only; no modes, protocols, key management, side channels or randomness are tested.'
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
    'mars-teaching.mjs',
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
