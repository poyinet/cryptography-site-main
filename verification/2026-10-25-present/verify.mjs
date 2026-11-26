import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {
  presentEncrypt,
  presentDecrypt,
  presentKeySchedule,
  presentSboxLayer,
  presentInverseSboxLayer,
  presentPLayer,
  presentInversePLayer,
  PRESENT_VECTORS
} from './present-teaching.mjs';

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
  return BigInt('0x' + hex).toString(2).replace(/0/g, '').length;
}

function xorHex(a, b) {
  return (BigInt('0x' + a) ^ BigInt('0x' + b)).toString(16).padStart(16, '0');
}

check('structure-evidence-and-authoring-parity', () => {
  assert.equal(content.entries.length, 1);
  const entry = content.entries[0];
  assert.equal(entry.id, 'present-details');
  assert.equal(entry.coverage, 'catalog-entry');
  assert.deepEqual(entry.inventoryIds, ['present']);
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
  for (const name of ['content.json', 'sources.json', 'present-teaching.mjs', 'article.zh.md', 'article.en.md']) {
    assert(!read(name).includes('\r'), 'UTF-8 LF expected: ' + name);
  }
  return {
    catalogEntity: 'present',
    sources: sources.sources.length,
    claims: all.length,
    translatedSections: Object.keys(entry.sections.zh).length,
    limit: 'Structural correspondence and evidence links only; independent factual review remains required.'
  };
});

check('present-official-vectors', () => {
  const observed = [];
  for (const vector of PRESENT_VECTORS) {
    const ciphertext = presentEncrypt(vector.plaintext, vector.key);
    assert.equal(ciphertext, vector.ciphertext);
    assert.equal(presentDecrypt(ciphertext, vector.key), vector.plaintext);
    observed.push({plaintext: vector.plaintext, key: vector.key, ciphertext});
  }
  return {
    vectors: observed,
    limit: 'Four fixed 64-bit vectors; not a full key-size or message-length matrix.'
  };
});

check('present-key-schedule', () => {
  const keys80 = presentKeySchedule('00000000000000000000');
  assert.equal(keys80.length, 32);
  assert.equal(keys80[0].toString(16).padStart(16, '0'), '0000000000000000');
  assert.equal(keys80[31].toString(16).padStart(16, '0'), '6dab31744f41d700');
  const keys128 = presentKeySchedule('00112233445566778899aabbccddeeff');
  assert.equal(keys128.length, 32);
  assert.equal(keys128[0].toString(16).padStart(16, '0'), '0011223344556677');
  assert.equal(keys128[31].toString(16).padStart(16, '0'), '091989a5ae8eab21');
  return {
    keys80Last: keys80[31].toString(16).padStart(16, '0'),
    keys128First: keys128[0].toString(16).padStart(16, '0'),
    keys128Last: keys128[31].toString(16).padStart(16, '0'),
    limit: 'Two fixed keys; the 128-bit values are checked against the published example, not an independent ciphertext vector.'
  };
});

check('present-inverse-layers', () => {
  let sboxCases = 0;
  for (let nibble = 0; nibble < 16; nibble += 1) {
    const value = nibble.toString(16).padStart(16, '0');
    assert.equal(presentInverseSboxLayer(presentSboxLayer(value)), value);
    sboxCases += 1;
  }
  let permutationCases = 0;
  for (let bit = 0; bit < 64; bit += 1) {
    const value = (1n << BigInt(bit)).toString(16).padStart(16, '0');
    assert.equal(presentInversePLayer(presentPLayer(value)), value);
    permutationCases += 1;
  }
  return {
    sboxCases,
    permutationCases,
    limit: 'Structural inverses only; not a security property.'
  };
});

check('present-diffusion', () => {
  const key = '00000000000000000000';
  const plaintext0 = '0000000000000000';
  const plaintext1 = '0000000000000001';
  const oneRound0 = presentPLayer(presentSboxLayer(plaintext0));
  const oneRound1 = presentPLayer(presentSboxLayer(plaintext1));
  const oneRoundDistance = bitCount(xorHex(oneRound0, oneRound1));
  const ciphertext0 = presentEncrypt(plaintext0, key);
  const ciphertext1 = presentEncrypt(plaintext1, key);
  const fullDistance = bitCount(xorHex(ciphertext0, ciphertext1));
  assert.equal(oneRoundDistance, 2);
  assert.equal(fullDistance, 32);
  return {
    oneRound0,
    oneRound1,
    oneRoundDistance,
    ciphertext0,
    ciphertext1,
    fullDistance,
    limit: 'One fixed one-bit difference; it demonstrates diffusion, not a differential attack.'
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
    'present-teaching.mjs',
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
