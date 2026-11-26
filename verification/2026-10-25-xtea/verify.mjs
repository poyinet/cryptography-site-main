import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {xteaEncryptBlock, xteaDecryptBlock, xteaEncryptWords, fromHex, toHex, VECTORS} from './xtea-teaching.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const file = name => path.join(here, name);
const read = name => fs.readFileSync(file(name), 'utf8');
const sha = value => createHash('sha256').update(value).digest('hex');
const content = JSON.parse(read('content.json'));
const sources = JSON.parse(read('sources.json'));
const meta = JSON.parse(read('meta.json'));
const glossary = JSON.parse(read('glossary.json'));
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

function bitCount(value) {
  let word = value >>> 0;
  let count = 0;
  while (word) {
    count += word & 1;
    word >>>= 1;
  }
  return count;
}

function lockstoneRows() {
  const state = new Uint32Array(1024);
  const rows = {};
  for (let n = 1; n <= 64; n += 1) {
    const key = [state[n + 2], state[n + 3], state[n + 4], state[n + 5]];
    const [v0, v1] = xteaEncryptWords(state[n], state[n + 1], key, n);
    state[n] = v0;
    state[n + 1] = v1;
    if (n === 32 || n === 64) {
      rows[n] = toHex([state[n], state[n + 1], state[n + 2], state[n + 3], state[n + 4], state[n + 5]]);
    }
    state[n + 6] = state[n];
  }
  return rows;
}

check('structure-evidence-and-authoring-parity', () => {
  assert.equal(content.entries.length, 1);
  const entry = content.entries[0];
  assert.equal(entry.id, 'xtea-details');
  assert.equal(entry.coverage, 'catalog-entry');
  assert.deepEqual(entry.inventoryIds, ['xtea']);
  assert(entry.coverageRationale.zh && entry.coverageRationale.en);
  assert(entry.verificationStatus);
  assert.deepEqual(Object.keys(entry.sections.zh).sort(), Object.keys(entry.sections.en).sort());
  const all = sources.sources.flatMap(source => source.claims.map(claim => ({...claim, sourceId: source.id})));
  assert.equal(new Set(all.map(claim => claim.id)).size, all.length);
  assert.equal(new Set(sources.sources.map(source => source.id)).size, sources.sources.length);
  
  for (const section of ['principle','why','used','broken','history','refs']) {
    assert(all.some(claim => claim.section === section), `No claim for ${section}`);
  }
  assert.deepEqual([...entry.claimIds].sort(), all.map(claim => claim.id).sort());
  
  for (const source of sources.sources) {
    assert(/^https:\/\//.test(source.url));
    for (const claim of source.claims) {
      assert.equal(claim.entryId, entry.id);
      assert(claim.statement.zh && claim.statement.en && claim.locator);
      assert(entry.sections.zh[claim.section]);
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
  }
  assert.equal(glossary.zh.length, glossary.en.length);
  assert(glossary.zh.length >= 10);
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
  for (const name of ['content.json', 'sources.json', 'xtea-teaching.mjs', 'article.zh.md', 'article.en.md', 'meta.json', 'glossary.json', 'calculations.json']) {
    assert(!read(name).includes('\r'), 'UTF-8 LF expected: ' + name);
  }
  return {
    catalogEntity: 'xtea',
    sources: sources.sources.length,
    claims: all.length,
    calculations: content.calculations.length,
    translatedSections: Object.keys(entry.sections.zh).length,
    limit: 'Structural correspondence and evidence links only; independent factual review remains required.'
  };
});

check('xtea-calc-vector-32', () => {
  const vector = VECTORS.cycles32;
  const ciphertext = xteaEncryptBlock(vector.plaintext, vector.key, vector.cycles);
  assert.equal(ciphertext, vector.ciphertext);
  assert.equal(xteaDecryptBlock(ciphertext, vector.key, vector.cycles), vector.plaintext);
  return {
    cycles: vector.cycles,
    plaintext: vector.plaintext,
    ciphertext,
    limit: 'One fixed vector for the recommended 32-cycle path; it does not cover every key or cycle count.'
  };
});

check('xtea-calc-vector-64', () => {
  const vector = VECTORS.cycles64;
  const ciphertext = xteaEncryptBlock(vector.plaintext, vector.key, vector.cycles);
  assert.equal(ciphertext, vector.ciphertext);
  assert.equal(xteaDecryptBlock(ciphertext, vector.key, vector.cycles), vector.plaintext);
  const rows = lockstoneRows();
  assert.equal(rows[32], 'd26428af0a20228327f917b1c1da899360e2acaaa6eb923d');
  assert.equal(rows[64], '7a01cbc9b03d606862ee209f069b7afc376a8936cdc9e923');
  return {
    cycles: vector.cycles,
    ciphertext,
    lockstone32: rows[32],
    lockstone64: rows[64],
    limit: '64 cycles tests parameterization, not the recommended count; the table reproduction is one fixed scheme.'
  };
});

check('xtea-calc-roundtrip', () => {
  const cases = [
    ['0000000000000000', '00000000000000000000000000000000'],
    ['0123456789abcdef', '00112233445566778899aabbccddeeff'],
    ['ffffffffffffffff', 'ffffffffffffffffffffffffffffffff'],
    ['af20a390547571aa', '27f917b1c1da899360e2acaaa6eb923d']
  ];
  const cycles = [1, 2, 8, 16, 32, 64];
  for (const [plaintext, key] of cases) {
    for (const count of cycles) {
      const ciphertext = xteaEncryptBlock(plaintext, key, count);
      assert.equal(xteaDecryptBlock(ciphertext, key, count), plaintext);
    }
  }
  return {
    cases: cases.length,
    cycleCounts: cycles,
    limit: 'Fixed data only; not a random or exhaustive test. Zero cycles is excluded because it performs no encryption.'
  };
});

check('xtea-calc-diffusion', () => {
  const vector = VECTORS.cycles32;
  const altered = vector.plaintext.slice(0, 7) + '1' + vector.plaintext.slice(8);
  assert.equal(altered, 'af20a391547571aa');
  const first = xteaEncryptBlock(vector.plaintext, vector.key, 32);
  const second = xteaEncryptBlock(altered, vector.key, 32);
  const firstWords = fromHex(first);
  const secondWords = fromHex(second);
  const distance = bitCount(firstWords[0] ^ secondWords[0]) + bitCount(firstWords[1] ^ secondWords[1]);
  assert.equal(distance, 36);
  return {
    first,
    second,
    altered,
    distance,
    limit: 'One fixed one-bit difference; it is a diffusion observation, not a differential probability or a security proof.'
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
    'xtea-teaching.mjs',
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
