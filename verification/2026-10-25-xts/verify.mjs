import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {xtsEncrypt, xtsDecrypt, XTS_VECTOR} from './xts-teaching.mjs';

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
  assert.equal(entry.id, 'xts-details');
  assert.equal(entry.coverage, 'catalog-entry');
  assert.deepEqual(entry.inventoryIds, ['xts']);
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
  for (const name of ['content.json', 'sources.json', 'xts-teaching.mjs', 'article.zh.md', 'article.en.md']) {
    assert(!read(name).includes('\r'), 'UTF-8 LF expected: ' + name);
  }
  return {
    catalogEntity: 'xts',
    sources: sources.sources.length,
    claims: all.length,
    translatedSections: Object.keys(entry.sections.zh).length,
    limit: 'Structural correspondence and evidence links only; independent factual review remains required.'
  };
});

check('xts-cavp-vector', () => {
  const v = XTS_VECTOR;
  const ciphertext = xtsEncrypt(v.key, v.tweak, v.plaintext);
  assert.equal(ciphertext, v.ciphertext);
  assert.equal(xtsDecrypt(v.key, v.tweak, ciphertext), v.plaintext);
  return {
    dataUnitBits: 256,
    ciphertext,
    limit: 'One official full-block data-unit case; not the CAVP 130-bit or 200-bit ciphertext-stealing cases.'
  };
});

check('xts-tweak-sensitivity', () => {
  const v = XTS_VECTOR;
  const otherTweak = '000102030405060708090a0b0c0d0e0f';
  const first = xtsEncrypt(v.key, v.tweak, v.plaintext);
  const second = xtsEncrypt(v.key, otherTweak, v.plaintext);
  assert.notEqual(first, second);
  assert.equal(xtsDecrypt(v.key, v.tweak, first), v.plaintext);
  assert.equal(xtsDecrypt(v.key, otherTweak, second), v.plaintext);
  return {
    originalTweak: v.tweak,
    otherTweak,
    first: first.slice(0, 32),
    second: second.slice(0, 32),
    limit: 'One fixed pair of tweaks; it demonstrates dependence, not a key-scope policy.'
  };
});

check('xts-cts-roundtrip', () => {
  const v = XTS_VECTOR;
  const plaintext39 = '00112233445566778899aabbccddeeff102132435465768798a9bacbdcedfe0fa1a2a3a4a5a6a7';
  const ciphertext39 = xtsEncrypt(v.key, v.tweak, plaintext39);
  assert.equal(ciphertext39.length / 2, 39);
  assert.equal(xtsDecrypt(v.key, v.tweak, ciphertext39), plaintext39);
  const plaintext17 = v.plaintext.slice(0, 32) + 'aa';
  const ciphertext17 = xtsEncrypt(v.key, v.tweak, plaintext17);
  assert.equal(ciphertext17.length / 2, 17);
  assert.equal(xtsDecrypt(v.key, v.tweak, ciphertext17), plaintext17);
  return {
    plaintextBytes39: 39,
    ciphertextBytes39: 39,
    plaintextBytes17: 17,
    ciphertextBytes17: 17,
    limit: 'Byte-aligned partial blocks only; not the CAVP bit-level ciphertext-stealing vectors.'
  };
});

check('xts-tamper-no-auth', () => {
  const v = XTS_VECTOR;
  const tampered = Buffer.from(v.ciphertext, 'hex');
  tampered[0] ^= 0x80;
  const recovered = xtsDecrypt(v.key, v.tweak, tampered.toString('hex'));
  assert.notEqual(recovered, v.plaintext);
  assert.equal(recovered.length / 2, v.plaintext.length / 2);
  return {
    changedByte: 0,
    original: v.plaintext.slice(0, 32),
    tamperedPlaintext: recovered.slice(0, 32),
    limit: 'One flipped byte; it demonstrates the absence of a tag, not a complete manipulation attack.'
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
    'xts-teaching.mjs',
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
