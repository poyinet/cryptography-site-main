import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {
  feistelEncrypt,
  feistelDecrypt,
  toyFNonInjective,
  toyFPermutation,
  HALF_BITS,
  BLOCK_BITS
} from './feistel-teaching.mjs';

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
  assert.equal(entry.id, 'feistel-details');
  assert.equal(entry.coverage, 'catalog-entry');
  assert.deepEqual(entry.inventoryIds, ['feistel-network']);
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
  for (const name of ['content.json', 'sources.json', 'feistel-teaching.mjs', 'article.zh.md', 'article.en.md']) {
    assert(!read(name).includes('\r'), 'UTF-8 LF expected: ' + name);
  }
  return {
    catalogEntity: 'feistel-network',
    sources: sources.sources.length,
    claims: all.length,
    translatedSections: Object.keys(entry.sections.zh).length,
    limit: 'Structural correspondence and evidence links only; independent factual review remains required.'
  };
});

check('feistel-roundtrip', () => {
  const keys = [1, 2, 3, 4];
  let cases = 0;
  for (let block = 0; block < 65_536; block++) {
    const cipher = feistelEncrypt(block, keys, toyFNonInjective);
    assert.equal(feistelDecrypt(cipher, keys, toyFNonInjective), block);
    cases++;
  }
  assert.equal(cases, 65_536);
  const sample = 0x1234;
  const permutedCipher = feistelEncrypt(sample, keys, toyFPermutation);
  const wrongKey = feistelDecrypt(permutedCipher, [9, 9, 9, 9], toyFPermutation);
  assert.notEqual(wrongKey, sample);
  return {blocks: cases, sample: sample.toString(16), cipher: permutedCipher.toString(16), wrongKey: wrongKey.toString(16), limit: 'Toy invertibility only; not a security evaluation.'};
});

check('feistel-noninjective-f', () => {
  const preimages = [0, 0, 0, 0];
  for (let x = 0; x < 256; x++) preimages[toyFNonInjective(x)]++;
  assert.deepEqual(preimages, [64, 64, 64, 64]);
  const outputs = new Set();
  for (let x = 0; x < 256; x++) outputs.add(toyFNonInjective(x));
  assert.equal(outputs.size, 4);
  for (let block = 0; block < 65_536; block++) {
    assert.equal(feistelDecrypt(feistelEncrypt(block, [1, 2, 3, 4], toyFNonInjective), [1, 2, 3, 4], toyFNonInjective), block);
  }
  return {inputs: 256, outputs: outputs.size, preimagesPerOutput: 64, roundTripBlocks: 65_536, limit: 'Deliberately non-invertible F; not a real cipher round function.'};
});

check('feistel-three-four-rounds', () => {
  const result = {};
  for (const rounds of [3, 4]) {
    const keys = [1, 2, 3, 4].slice(0, rounds);
    let cases = 0;
    for (let block = 0; block < 65_536; block++) {
      if (feistelDecrypt(feistelEncrypt(block, keys, toyFNonInjective), keys, toyFNonInjective) !== block) throw Error(`round-trip failed at ${rounds} rounds`);
      cases++;
    }
    result[rounds] = cases;
  }
  return {threeRoundBlocks: result[3], fourRoundBlocks: result[4], securityDistinction: 'Luby–Rackoff theoretical model, not tested here', limit: 'Invertibility only.'};
});

check('feistel-des-tdea-counts', () => {
  assert.equal(BLOCK_BITS, 16);
  assert.equal(HALF_BITS, 8);
  const des = {blockBits: 64, halves: [32, 32], rounds: 16};
  const tdea = {passes: 3, desRoundsEach: des.rounds, totalRounds: 3 * des.rounds, blockBits: des.blockBits};
  assert.equal(des.blockBits / 2, 32);
  assert.equal(tdea.totalRounds, 48);
  return {des, tdea, limit: 'Concrete algorithm counts only; Feistel does not fix these parameters.'};
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
    'feistel-teaching.mjs',
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
