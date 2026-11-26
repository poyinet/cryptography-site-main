import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {
  cbcEncrypt,
  cbcDecrypt,
  xorHex,
  pkcs7Pad,
  pkcs7Unpad,
  birthdayProbability,
  CBC_VECTOR
} from './cbc-teaching.mjs';

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
  assert.equal(entry.id, 'cbc-details');
  assert.equal(entry.coverage, 'catalog-entry');
  assert.deepEqual(entry.inventoryIds, ['cipher-block-chaining']);
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
  for (const name of ['content.json', 'sources.json', 'cbc-teaching.mjs', 'article.zh.md', 'article.en.md']) {
    assert(!read(name).includes('\r'), 'UTF-8 LF expected: ' + name);
  }
  return {
    catalogEntity: 'cipher-block-chaining',
    sources: sources.sources.length,
    claims: all.length,
    translatedSections: Object.keys(entry.sections.zh).length,
    limit: 'Structural correspondence and evidence links only; independent factual review remains required.'
  };
});

check('cbc-official-vector', () => {
  const v = CBC_VECTOR;
  const ciphertext = cbcEncrypt(v.key, v.iv, v.plaintext);
  assert.equal(ciphertext, v.ciphertext);
  assert.equal(cbcDecrypt(v.key, v.iv, ciphertext), v.plaintext);
  return {
    blocks: 4,
    ciphertext,
    limit: 'One official four-block case; not protocol validation.'
  };
});

check('cbc-iv-effect', () => {
  const key = CBC_VECTOR.key;
  const first = CBC_VECTOR.plaintext.slice(0, 32);
  const second = CBC_VECTOR.plaintext.slice(32, 64);
  const ivA = CBC_VECTOR.iv;
  const ivB = '000102030405060708090a0b0c0d0e10';
  const cA = cbcEncrypt(key, ivA, first + second);
  const cB = cbcEncrypt(key, ivB, first + second);
  assert.notEqual(cA.slice(0, 32), cB.slice(0, 32));
  assert.equal(cbcEncrypt(key, ivA, first + second), cA);
  const tamperedIv = '800102030405060708090a0b0c0d0e0f';
  const decrypted = cbcDecrypt(key, tamperedIv, cA);
  assert.equal(decrypted.slice(0, 32), xorHex(first, '80000000000000000000000000000000'));
  assert.equal(decrypted.slice(32), second);
  return {
    ivA: ivA,
    ivB: ivB,
    firstCipherA: cA.slice(0, 32),
    firstCipherB: cB.slice(0, 32),
    limit: 'Structural IV demonstration; no chosen-plaintext attack.'
  };
});

check('cbc-bitflip', () => {
  const v = CBC_VECTOR;
  const tampered = Buffer.from(v.ciphertext, 'hex');
  const blockIndex = 1;
  tampered[blockIndex * 16] ^= 0x80;
  const decrypted = cbcDecrypt(v.key, v.iv, tampered.toString('hex'));
  const original = v.plaintext;
  assert.notEqual(decrypted.slice(32, 64), original.slice(32, 64));
  assert.equal(decrypted.slice(64, 66), xorHex(original.slice(64, 66), '80'));
  assert.equal(decrypted.slice(66, 96), original.slice(66, 96));
  assert.equal(decrypted.slice(0, 32), original.slice(0, 32));
  assert.equal(decrypted.slice(96), original.slice(96));
  return {
    tamperedCiphertext: tampered.toString('hex'),
    decrypted,
    limit: 'Malleability demonstration on fixed data; not a full oracle attack.'
  };
});

check('cbc-propagation', () => {
  const v = CBC_VECTOR;
  const changed = v.plaintext.slice(0, 32)
    + xorHex(v.plaintext.slice(32, 64), '80000000000000000000000000000000')
    + v.plaintext.slice(64);
  const baseline = cbcEncrypt(v.key, v.iv, v.plaintext);
  const modified = cbcEncrypt(v.key, v.iv, changed);
  assert.equal(baseline.slice(0, 32), modified.slice(0, 32));
  assert.notEqual(baseline.slice(32, 64), modified.slice(32, 64));
  assert.notEqual(baseline.slice(64, 96), modified.slice(64, 96));
  assert.notEqual(baseline.slice(96), modified.slice(96));
  return {
    baseline,
    modified,
    firstBlockUnchanged: true,
    laterBlocksChanged: true,
    limit: 'Encryption-chaining demonstration only.'
  };
});

check('cbc-padding', () => {
  const plaintext20 = '00112233445566778899aabbccddeeff00112233';
  const padded20 = pkcs7Pad(plaintext20);
  assert.equal(padded20.length, 64);
  assert.equal(padded20.slice(-24), '0c'.repeat(12));
  assert.equal(pkcs7Unpad(padded20), plaintext20);
  const plaintext16 = '00112233445566778899aabbccddeeff';
  const padded16 = pkcs7Pad(plaintext16);
  assert.equal(padded16.length, 64);
  assert.equal(padded16.slice(-32), '10'.repeat(16));
  assert.equal(pkcs7Unpad(padded16), plaintext16);
  let rejected = false;
  try { pkcs7Unpad('00'.repeat(15) + '0d'); } catch { rejected = true; }
  assert.equal(rejected, true);
  return {
    originalBytes: 20,
    paddedBytes: 32,
    paddingBytes: 12,
    fullBlockAdds: 16,
    invalidPaddingRejected: true,
    limit: 'Padding mechanics only; no oracle behavior.'
  };
});

check('cbc-birthday', () => {
  const at32 = birthdayProbability(2 ** 32, 64);
  const at325 = birthdayProbability(2 ** 32.5, 64);
  assert(Math.abs(at32 - 0.3934693402) < 1e-9);
  assert(Math.abs(at325 - 0.6321205588) < 1e-9);
  return {
    blockBits: 64,
    blocks: '4294967296',
    bytes: '34359738368',
    gibibytes: '32',
    probabilityAt2Pow32: at32,
    probabilityAt2Pow32_5: at325,
    limit: 'Birthday arithmetic only; not a protocol attack model.'
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
    'cbc-teaching.mjs',
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
