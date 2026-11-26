import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {
  ctrEncrypt,
  ctrDecrypt,
  xorHex,
  incrementRightmost,
  CTR_VECTOR
} from './ctr-teaching.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const file = name => path.join(here, name);
const read = name => fs.readFileSync(file(name), 'utf8');
const sha = value => createHash('sha256').update(value).digest('hex');
const content = JSON.parse(read('content.json'));
const sources = JSON.parse(read('sources.json'));
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

check('structure-evidence-and-authoring-parity', () => {
  assert.equal(content.entries.length, 1);
  const entry = content.entries[0];
  assert.equal(entry.id, 'ctr-details');
  assert.equal(entry.coverage, 'catalog-entry');
  assert.deepEqual(entry.inventoryIds, ['counter-mode']);
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
  for (const name of ['content.json', 'sources.json', 'ctr-teaching.mjs', 'article.zh.md', 'article.en.md']) {
    assert(!read(name).includes('\r'), 'UTF-8 LF expected: ' + name);
  }
  return {
    catalogEntity: 'counter-mode',
    sources: sources.sources.length,
    claims: all.length,
    translatedSections: Object.keys(entry.sections.zh).length,
    limit: 'Structural correspondence and evidence links only; independent factual review remains required.'
  };
});

check('ctr-official-vector', () => {
  const v = CTR_VECTOR;
  const ciphertext = ctrEncrypt(v.key, v.initialCounter, v.plaintext);
  assert.equal(ciphertext, v.ciphertext);
  assert.equal(ctrDecrypt(v.key, v.initialCounter, ciphertext), v.plaintext);
  return {
    blocks: 4,
    ciphertext,
    limit: 'One official four-block case; not protocol validation.'
  };
});

check('ctr-parallel', () => {
  const v = CTR_VECTOR;
  const counter3 = incrementRightmost(incrementRightmost(v.initialCounter, 32), 32);
  const keystream3 = ctrEncrypt(v.key, counter3, '00'.repeat(16));
  const plaintext3 = xorHex(keystream3, v.ciphertext.slice(64, 96));
  assert.equal(plaintext3, v.plaintext.slice(64, 96));
  return {
    counter3,
    keystream3,
    plaintext3,
    limit: 'Random-access demonstration on one fixed block; not a parallel benchmark.'
  };
});

check('ctr-reuse', () => {
  const key = CTR_VECTOR.key, initial = CTR_VECTOR.initialCounter;
  const p1 = '00'.repeat(16);
  const p2 = 'ff'.repeat(16);
  const c1 = ctrEncrypt(key, initial, p1);
  const c2 = ctrEncrypt(key, initial, p2);
  assert.equal(xorHex(c1, c2), xorHex(p1, p2));
  const otherInitial = '00000000000000000000000000000001';
  const c3 = ctrEncrypt(key, otherInitial, p1);
  assert.notEqual(xorHex(c1, c3), xorHex(p1, p1));
  return {
    sameCounterXor: xorHex(c1, c2),
    plaintextXor: xorHex(p1, p2),
    differentCounterCipher: c3,
    limit: 'Keystream-reuse arithmetic; not a complete protocol attack.'
  };
});

check('ctr-increment-wrap', () => {
  const next32 = incrementRightmost(CTR_VECTOR.initialCounter, 32);
  assert.equal(next32, 'f0f1f2f3f4f5f6f7f8f9fafbfcfdff00');
  let toy = '00000000';
  for (let index = 0; index < 255; index++) toy = incrementRightmost(toy, 8);
  assert.equal(toy, '000000ff');
  toy = incrementRightmost(toy, 8);
  assert.equal(toy, '00000000');
  return {
    next32,
    toy8After255: '000000ff',
    toy8After256: '00000000',
    limit: 'Toy field size; the 32-bit case does not iterate 2^32 blocks.'
  };
});

check('ctr-no-padding', () => {
  const key = CTR_VECTOR.key, initial = CTR_VECTOR.initialCounter;
  const plaintext20 = '00112233445566778899aabbccddeeff00112233';
  const plaintext21 = plaintext20 + '44';
  const ciphertext20 = ctrEncrypt(key, initial, plaintext20);
  const ciphertext21 = ctrEncrypt(key, initial, plaintext21);
  assert.equal(ciphertext20.length, plaintext20.length);
  assert.equal(ciphertext21.length, plaintext21.length);
  assert.equal(ctrDecrypt(key, initial, ciphertext20), plaintext20);
  assert.equal(ctrDecrypt(key, initial, ciphertext21), plaintext21);
  return {
    plaintextBytes: 20,
    ciphertextBytes: 20,
    plaintextBytes21: 21,
    ciphertextBytes21: 21,
    limit: 'Length behavior only; no long-message counter-limit test.'
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
    'ctr-teaching.mjs',
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
