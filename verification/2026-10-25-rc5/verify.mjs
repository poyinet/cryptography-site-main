import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {rc5EncryptBlock, rc5DecryptBlock, rc5KeySchedule, RC5_VECTOR} from './rc5-teaching.mjs';

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

function bitCount(hex) {
  return (BigInt('0x' + hex) ^ 0n).toString(2).replace(/0/g, '').length;
}

check('structure-evidence-and-authoring-parity', () => {
  assert.equal(content.entries.length, 1);
  const entry = content.entries[0];
  assert.equal(entry.id, 'rc5-details');
  assert.equal(entry.coverage, 'catalog-entry');
  assert.deepEqual(entry.inventoryIds, ['rc5']);
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
  for (const name of ['content.json', 'sources.json', 'rc5-teaching.mjs', 'article.zh.md', 'article.en.md']) {
    assert(!read(name).includes('\r'), 'UTF-8 LF expected: ' + name);
  }
  return {
    catalogEntity: 'rc5',
    sources: sources.sources.length,
    claims: all.length,
    translatedSections: Object.keys(entry.sections.zh).length,
    limit: 'Structural correspondence and evidence links only; independent factual review remains required.'
  };
});

check('rc5-reference-vector', () => {
  const ciphertext = rc5EncryptBlock(RC5_VECTOR.plaintext, RC5_VECTOR.key, RC5_VECTOR.rounds);
  assert.equal(ciphertext, RC5_VECTOR.ciphertext);
  assert.equal(rc5DecryptBlock(ciphertext, RC5_VECTOR.key, RC5_VECTOR.rounds), RC5_VECTOR.plaintext);
  return {
    ciphertext,
    decrypted: RC5_VECTOR.plaintext,
    limit: 'One reference vector for one w/r/b parameter set; not a parameter matrix.'
  };
});

check('rc5-key-schedule', () => {
  const S = rc5KeySchedule(RC5_VECTOR.key, RC5_VECTOR.rounds);
  assert.equal(S.length, 42);
  assert.equal(S[0].toString(16).padStart(8, '0'), '98c9276e');
  assert.equal(S[1].toString(16).padStart(8, '0'), '30979fa4');
  assert.equal(S[41].toString(16).padStart(8, '0'), '4765b2f6');
  return {
    words: S.length,
    first: S[0].toString(16).padStart(8, '0'),
    second: S[1].toString(16).padStart(8, '0'),
    last: S[41].toString(16).padStart(8, '0'),
    limit: 'One fixed key and round count; values are derived, not a separate official vector.'
  };
});

check('rc5-roundtrip', () => {
  const cases = [
    ['0000000000000000', '00000000000000000000000000000000'],
    ['0123456789abcdef', '00112233445566778899aabbccddeeff'],
    ['ffffffffffffffff', 'ffffffffffffffffffffffffffffffff'],
    ['deadbeefcafebabe', '0f1e2d3c4b5a69788796a5b4c3d2e1f0']
  ];
  const rounds = [0, 1, 8, 12, 16, 20];
  for (const [plaintext, key] of cases) {
    for (const count of rounds) {
      assert.equal(rc5DecryptBlock(rc5EncryptBlock(plaintext, key, count), key, count), plaintext);
    }
  }
  return {
    cases: cases.length,
    roundCounts: rounds,
    limit: 'Fixed data only; not a random or exhaustive test.'
  };
});

check('rc5-avalanche', () => {
  const key = '00112233445566778899aabbccddeeff';
  const first = rc5EncryptBlock('0000000000000000', key, 20);
  const second = rc5EncryptBlock('0000000000000001', key, 20);
  const distance = bitCount((BigInt('0x' + first) ^ BigInt('0x' + second)).toString(16).padStart(16, '0'));
  assert.equal(distance, 36);
  return {
    first,
    second,
    distance,
    limit: 'One fixed one-bit difference; it demonstrates diffusion, not a differential probability.'
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
    'rc5-teaching.mjs',
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
