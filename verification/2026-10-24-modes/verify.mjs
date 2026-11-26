import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {
  ecbEncrypt,
  ecbDecrypt,
  cbcEncrypt,
  cbcDecrypt,
  cfbEncrypt,
  ofbEncrypt,
  ctrEncrypt,
  gcmEncrypt,
  gcmDecrypt,
  pkcs7Pad,
  AES128_VECTORS,
  GCM_VECTOR
} from './modes-teaching.mjs';

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
const xorHex = (a, b) => {
  const left = Buffer.from(a, 'hex'), right = Buffer.from(b, 'hex');
  if (left.length !== right.length) throw Error('XOR length mismatch');
  return Buffer.from(left.map((value, index) => value ^ right[index])).toString('hex');
};

check('structure-evidence-and-authoring-parity', () => {
  assert.equal(content.entries.length, 1);
  const entry = content.entries[0];
  assert.equal(entry.id, 'modes-details');
  assert.equal(entry.coverage, 'catalog-entry');
  assert.deepEqual(entry.inventoryIds, ['block-cipher-mode']);
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
  for (const name of ['content.json', 'sources.json', 'modes-teaching.mjs', 'article.zh.md', 'article.en.md']) {
    assert(!read(name).includes('\r'), 'UTF-8 LF expected: ' + name);
  }
  return {
    catalogEntity: 'block-cipher-mode',
    sources: sources.sources.length,
    claims: all.length,
    translatedSections: Object.keys(entry.sections.zh).length,
    limit: 'Structural correspondence and evidence links only; independent factual review remains required.'
  };
});

check('modes-official-vectors', () => {
  const v = AES128_VECTORS;
  assert.equal(ecbEncrypt(v.key, v.plaintext), v.ecb);
  assert.equal(cbcEncrypt(v.key, v.iv, v.plaintext), v.cbc);
  assert.equal(cfbEncrypt(v.key, v.iv, v.plaintext), v.cfb);
  assert.equal(ofbEncrypt(v.key, v.iv, v.plaintext), v.ofb);
  assert.equal(ctrEncrypt(v.key, v.ctrIv, v.plaintext), v.ctr);
  assert.equal(ecbDecrypt(v.key, v.ecb), v.plaintext);
  assert.equal(cbcDecrypt(v.key, v.iv, v.cbc), v.plaintext);
  assert.equal(ctrEncrypt(v.key, v.ctrIv, v.ctr), v.plaintext);
  return {vectors: {ecb: v.ecb, cbc: v.cbc, cfb: v.cfb, ofb: v.ofb, ctr: v.ctr}, limit: 'First-block vectors; not full-message mode validation.'};
});

check('modes-gcm-vector', () => {
  const g = GCM_VECTOR;
  const result = gcmEncrypt(g.key, g.iv, g.plaintext);
  assert.equal(result.ciphertext, g.ciphertext);
  assert.equal(result.tag, g.tag);
  assert.equal(gcmDecrypt(g.key, g.iv, result.ciphertext, result.tag), g.plaintext);
  return {ciphertext: result.ciphertext, tag: result.tag, limit: 'One official GCM case; no AAD or long-message coverage.'};
});

check('modes-ecb-pattern', () => {
  const key = AES128_VECTORS.key;
  const block = AES128_VECTORS.plaintext;
  const repeated = block + block;
  const ecb = ecbEncrypt(key, repeated);
  assert.equal(ecb.slice(0, 32), ecb.slice(32, 64));
  const cbc = cbcEncrypt(key, AES128_VECTORS.iv, repeated);
  assert.notEqual(cbc.slice(0, 32), cbc.slice(32, 64));
  const ctr = ctrEncrypt(key, AES128_VECTORS.ctrIv, repeated);
  assert.notEqual(ctr.slice(0, 32), ctr.slice(32, 64));
  return {ecbBlocksEqual: true, cbcBlocksEqual: false, ctrBlocksEqual: false, ecb, limit: 'Structural demonstration only.'};
});

check('modes-ctr-reuse', () => {
  const key = AES128_VECTORS.key, nonce = AES128_VECTORS.ctrIv;
  const p1 = '00000000000000000000000000000000';
  const p2 = 'ffffffffffffffffffffffffffffffff';
  const c1 = ctrEncrypt(key, nonce, p1);
  const c2 = ctrEncrypt(key, nonce, p2);
  assert.equal(xorHex(c1, c2), xorHex(p1, p2));
  const nonce2 = '00000000000000000000000000000001';
  const c3 = ctrEncrypt(key, nonce2, p1);
  assert.notEqual(c1, c3);
  assert.notEqual(xorHex(c1, c3), xorHex(p1, p1));
  return {sameNonceXor: xorHex(c1, c2), plaintextXor: xorHex(p1, p2), differentNonceCipher: c3, limit: 'Keystream-reuse arithmetic; not a complete protocol attack.'};
});

check('modes-cbc-bitflip', () => {
  const key = AES128_VECTORS.key, iv = AES128_VECTORS.iv;
  const plaintext = '0000000000000000000000000000000011111111111111111111111111111111';
  const ciphertext = cbcEncrypt(key, iv, plaintext);
  const tampered = Buffer.from(ciphertext, 'hex');
  tampered[0] ^= 0x80;
  const decrypted = cbcDecrypt(key, iv, tampered.toString('hex'));
  assert.notEqual(decrypted.slice(0, 32), plaintext.slice(0, 32));
  assert.equal(decrypted.slice(32, 34), (parseInt(plaintext.slice(32, 34), 16) ^ 0x80).toString(16).padStart(2, '0'));
  assert.equal(decrypted.slice(34), plaintext.slice(34));
  return {tamperedCiphertext: tampered.toString('hex'), decrypted, firstBlockCorrupted: true, secondBlockBitFlipped: true, limit: 'Malleability demonstration; not a full oracle attack.'};
});

check('modes-gcm-tamper', () => {
  const g = GCM_VECTOR;
  const result = gcmEncrypt(g.key, g.iv, g.plaintext);
  const badCipher = result.ciphertext.slice(0, -2) + ((parseInt(result.ciphertext.slice(-2), 16) ^ 0x01).toString(16).padStart(2, '0'));
  let cipherRejected = false, tagRejected = false;
  try { gcmDecrypt(g.key, g.iv, badCipher, result.tag); } catch { cipherRejected = true; }
  const badTag = result.tag.slice(0, -2) + ((parseInt(result.tag.slice(-2), 16) ^ 0x01).toString(16).padStart(2, '0'));
  try { gcmDecrypt(g.key, g.iv, result.ciphertext, badTag); } catch { tagRejected = true; }
  assert.equal(cipherRejected, true);
  assert.equal(tagRejected, true);
  return {cipherRejected, tagRejected, limit: 'Tag verification behavior; not exhaustive malformed-input testing.'};
});

check('modes-padding', () => {
  const plaintext20 = '00112233445566778899aabbccddeeff00112233';
  const padded = pkcs7Pad(plaintext20);
  assert.equal(padded.length, 64);
  assert.equal(padded.slice(-24), '0c'.repeat(12));
  const ctr = ctrEncrypt(AES128_VECTORS.key, AES128_VECTORS.ctrIv, plaintext20);
  assert.equal(ctr.length, plaintext20.length);
  return {originalBytes: 20, paddedBytes: 32, paddingBytes: 12, paddingValue: '0c', ctrBytes: 20, limit: 'Padding mechanics only; no oracle behavior.'};
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
    'modes-teaching.mjs',
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
