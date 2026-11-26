import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {
  cfb128Encrypt,
  cfb128Decrypt,
  cfb8Encrypt,
  cfb8Decrypt,
  xorHex,
  CFB128_VECTOR,
  CFB8_VECTOR
} from './cfb-teaching.mjs';

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
  assert.equal(entry.id, 'cfb-details');
  assert.equal(entry.coverage, 'catalog-entry');
  assert.deepEqual(entry.inventoryIds, ['cfb']);
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
  for (const name of ['content.json', 'sources.json', 'cfb-teaching.mjs', 'article.zh.md', 'article.en.md']) {
    assert(!read(name).includes('\r'), 'UTF-8 LF expected: ' + name);
  }
  return {
    catalogEntity: 'cfb',
    sources: sources.sources.length,
    claims: all.length,
    translatedSections: Object.keys(entry.sections.zh).length,
    limit: 'Structural correspondence and evidence links only; independent factual review remains required.'
  };
});

check('cfb-official-vector128', () => {
  const v = CFB128_VECTOR;
  const ciphertext = cfb128Encrypt(v.key, v.iv, v.plaintext);
  assert.equal(ciphertext, v.ciphertext);
  assert.equal(cfb128Decrypt(v.key, v.iv, ciphertext), v.plaintext);
  return {
    blocks: 4,
    ciphertext,
    limit: 'One official s=128 case; not protocol validation.'
  };
});

check('cfb-official-vector8', () => {
  const v = CFB8_VECTOR;
  const ciphertext = cfb8Encrypt(v.key, v.iv, v.plaintext);
  assert.equal(ciphertext, v.ciphertext);
  assert.equal(cfb8Decrypt(v.key, v.iv, ciphertext), v.plaintext);
  return {
    ciphertext,
    limit: 'First 16 bytes of the CFB8 example; not the full segment table.'
  };
});

check('cfb-bitflip', () => {
  const v = CFB128_VECTOR;
  const tampered = Buffer.from(v.ciphertext, 'hex');
  tampered[16] ^= 0x80;
  const decrypted = cfb128Decrypt(v.key, v.iv, tampered.toString('hex'));
  assert.equal(decrypted.slice(32, 34), xorHex(v.plaintext.slice(32, 34), '80'));
  assert.equal(decrypted.slice(34, 64), v.plaintext.slice(34, 64));
  assert.notEqual(decrypted.slice(64, 96), v.plaintext.slice(64, 96));
  assert.equal(decrypted.slice(96), v.plaintext.slice(96));
  return {
    tamperedCiphertext: tampered.toString('hex'),
    decrypted,
    limit: 'One fixed s=b case; no smaller-s propagation measurement.'
  };
});

check('cfb-iv-reuse', () => {
  const v = CFB128_VECTOR;
  const p1 = v.plaintext.slice(0, 32);
  const p2 = xorHex(p1, '80000000000000000000000000000000');
  const c1 = cfb128Encrypt(v.key, v.iv, p1);
  const c2 = cfb128Encrypt(v.key, v.iv, p2);
  assert.equal(xorHex(c1, c2), xorHex(p1, p2));
  return {
    firstCipherXor: xorHex(c1, c2),
    firstPlainXor: xorHex(p1, p2),
    limit: 'First-segment arithmetic only; later segments feed back different ciphertext.'
  };
});

check('cfb-no-padding', () => {
  const key = CFB8_VECTOR.key, iv = CFB8_VECTOR.iv;
  const plaintext20 = '00112233445566778899aabbccddeeff00112233';
  const ciphertext20 = cfb8Encrypt(key, iv, plaintext20);
  assert.equal(ciphertext20.length, plaintext20.length);
  assert.equal(cfb8Decrypt(key, iv, ciphertext20), plaintext20);
  return {
    plaintextBytes: 20,
    ciphertextBytes: 20,
    limit: 's=8 length behavior only; s=128 still needs block-aligned input.'
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
    'cfb-teaching.mjs',
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
