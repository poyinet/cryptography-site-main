import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {
  pkcs7Pad,
  pkcs7Unpad,
  cbcEncryptNoPadding,
  cbcDecryptNoPadding,
  paddingOracle,
  recoverLastByteWithOracle,
  PADDING_VECTOR
} from './padding-teaching.mjs';

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
  assert.equal(entry.id, 'padding-details');
  assert.equal(entry.coverage, 'catalog-entry');
  assert.deepEqual(entry.inventoryIds, ['padding']);
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
  for (const name of ['content.json', 'sources.json', 'padding-teaching.mjs', 'article.zh.md', 'article.en.md']) {
    assert(!read(name).includes('\r'), 'UTF-8 LF expected: ' + name);
  }
  return {
    catalogEntity: 'padding',
    sources: sources.sources.length,
    claims: all.length,
    translatedSections: Object.keys(entry.sections.zh).length,
    limit: 'Structural correspondence and evidence links only; independent factual review remains required.'
  };
});

check('padding-pkcs7-lengths', () => {
  const cases = [
    {bytes: 0, paddedBytes: 16, last: '10'},
    {bytes: 1, paddedBytes: 16, last: '0f'},
    {bytes: 15, paddedBytes: 16, last: '01'},
    {bytes: 16, paddedBytes: 32, last: '10'},
    {bytes: 17, paddedBytes: 32, last: '0f'}
  ];
  const observed = [];
  for (const item of cases) {
    const plaintext = 'aa'.repeat(item.bytes);
    const padded = pkcs7Pad(plaintext);
    assert.equal(padded.length / 2, item.paddedBytes);
    assert.equal(padded.slice(-2), item.last);
    assert.equal(pkcs7Unpad(padded), plaintext);
    observed.push({bytes: item.bytes, paddedBytes: item.paddedBytes, last: item.last});
  }
  return {
    cases: observed,
    limit: 'One fixed block size and five lengths; not an exhaustive length matrix.'
  };
});

check('padding-unpad-validation', () => {
  for (let bytes = 0; bytes <= 32; bytes += 1) {
    const plaintext = 'ab'.repeat(bytes);
    assert.equal(pkcs7Unpad(pkcs7Pad(plaintext)), plaintext);
  }
  assert.throws(() => pkcs7Unpad(''));
  assert.throws(() => pkcs7Unpad('00'.repeat(16)));
  assert.throws(() => pkcs7Unpad('11'.repeat(16)));
  assert.throws(() => pkcs7Unpad('00'.repeat(15) + '02'));
  assert.equal(pkcs7Unpad('00'.repeat(14) + '0202'), '00'.repeat(14));
  return {
    roundTrips: 33,
    rejected: ['empty', 'zero-length padding', 'padding length 17', 'inconsistent padding', 'non-block length'],
    limit: 'Strict-removal checks on fixed malformed cases; not a fuzzing campaign.'
  };
});

check('padding-cbc-overhead', () => {
  const v = PADDING_VECTOR;
  const short = '00112233445566778899aabbccddee';
  const aligned = short + 'ff';
  const shortCiphertext = cbcEncryptNoPadding(v.key, v.iv, pkcs7Pad(short));
  const alignedCiphertext = cbcEncryptNoPadding(v.key, v.iv, pkcs7Pad(aligned));
  assert.equal(shortCiphertext.length / 2, 16);
  assert.equal(alignedCiphertext.length / 2, 32);
  assert.equal(pkcs7Unpad(cbcDecryptNoPadding(v.key, v.iv, shortCiphertext)), short);
  assert.equal(pkcs7Unpad(cbcDecryptNoPadding(v.key, v.iv, alignedCiphertext)), aligned);
  return {
    shortPlaintextBytes: 15,
    shortCiphertextBytes: 16,
    alignedPlaintextBytes: 16,
    alignedCiphertextBytes: 32,
    limit: 'One key, IV and two lengths; it demonstrates overhead, not protocol behavior.'
  };
});

check('padding-oracle-recovery', () => {
  const v = PADDING_VECTOR;
  const ciphertext = cbcEncryptNoPadding(v.key, v.iv, v.plaintext);
  assert.equal(ciphertext.length / 2, 32);
  assert.equal(paddingOracle(v.key, v.iv, ciphertext), false);
  const recovered = recoverLastByteWithOracle(v.key, v.iv, ciphertext);
  assert.equal(recovered.recoveredLastByte, v.plaintext.slice(-2));
  const forged = Buffer.from(ciphertext, 'hex');
  forged[15] = recovered.guess ^ 0x01;
  assert.equal(paddingOracle(v.key, v.iv, forged.toString('hex')), false);
  return {
    originalLastByte: v.plaintext.slice(-2),
    recoveredLastByte: recovered.recoveredLastByte,
    guess: recovered.guess,
    limit: 'One fixed byte and fixed ciphertext; not a full multi-byte or end-to-end protocol attack.'
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
    'padding-teaching.mjs',
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
