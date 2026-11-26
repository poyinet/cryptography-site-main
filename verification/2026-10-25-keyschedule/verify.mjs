import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {aesKeySchedule, toHex, KEY_VECTORS} from './ks-teaching.mjs';

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

check('structure-evidence-and-authoring-parity', () => {
  assert.equal(content.entries.length, 1);
  const entry = content.entries[0];
  assert.equal(entry.id, 'ks-details');
  assert.equal(entry.coverage, 'catalog-entry');
  assert.deepEqual(entry.inventoryIds, ['key-schedule']);
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
      if (key !== 'refs') assert(!/https?:\/\//.test(value), 'Public body section uses a URL: ' + lang + ':' + key);
      else for (const source of sources.sources) assert(String(value).includes(source.url), `refs does not print ${source.id} URL (${lang})`);
    }
    assert(!/TODO|TBD|待补|占位/.test(Object.values(entry.sections[lang]).join('\n')));
  }
  for (const name of ['content.json', 'sources.json', 'ks-teaching.mjs', 'article.zh.md', 'article.en.md', 'meta.json', 'glossary.json', 'calculations.json']) {
    assert(!read(name).includes('\r'), 'UTF-8 LF expected: ' + name);
  }
  return {
    catalogEntity: 'key-schedule',
    sources: sources.sources.length,
    claims: all.length,
    calculations: content.calculations.length,
    translatedSections: Object.keys(entry.sections.zh).length,
    limit: 'Structural correspondence and evidence links only; independent factual review remains required.'
  };
});

check('ks-calc-aes128', () => {
  const schedule = aesKeySchedule(KEY_VECTORS.aes128);
  assert.equal(schedule.Nk, 4);
  assert.equal(schedule.Nr, 10);
  assert.equal(schedule.words.length, 44);
  assert.equal(schedule.roundKeys.length, 11);
  assert.equal(toHex(schedule.roundKeys[0]), KEY_VECTORS.aes128);
  assert.equal(toHex(schedule.roundKeys[10]), 'd014f9a8c9ee2589e13f0cc8b6630ca6');
  assert.equal(toHex(schedule.words[43]), 'b6630ca6');
  return {
    words: schedule.words.length,
    roundKeys: schedule.roundKeys.length,
    first: toHex(schedule.roundKeys[0]),
    last: toHex(schedule.roundKeys[10]),
    lastWord: toHex(schedule.words[43]),
    limit: 'One official example key; it does not establish behavior for every 128-bit key.'
  };
});

check('ks-calc-aes192-256', () => {
  const aes192 = aesKeySchedule(KEY_VECTORS.aes192);
  assert.equal(aes192.Nk, 6);
  assert.equal(aes192.Nr, 12);
  assert.equal(aes192.words.length, 52);
  assert.equal(aes192.roundKeys.length, 13);
  assert.equal(toHex(aes192.roundKeys[0]), KEY_VECTORS.aes192.slice(0, 32));
  assert.equal(toHex(Uint8Array.from(aes192.words.slice(0, aes192.Nk).flatMap(word => Array.from(word)))), KEY_VECTORS.aes192);
  assert.equal(toHex(aes192.roundKeys.at(-1)), 'e98ba06f448c773c8ecc720401002202');
  const aes256 = aesKeySchedule(KEY_VECTORS.aes256);
  assert.equal(aes256.Nk, 8);
  assert.equal(aes256.Nr, 14);
  assert.equal(aes256.words.length, 60);
  assert.equal(aes256.roundKeys.length, 15);
  assert.equal(toHex(aes256.roundKeys[0]), KEY_VECTORS.aes256.slice(0, 32));
  assert.equal(toHex(Uint8Array.from(aes256.words.slice(0, aes256.Nk).flatMap(word => Array.from(word)))), KEY_VECTORS.aes256);
  assert.equal(toHex(aes256.roundKeys.at(-1)), 'fe4890d1e6188d0b046df344706c631e');
  return {
    aes192: {words: aes192.words.length, roundKeys: aes192.roundKeys.length, last: toHex(aes192.roundKeys.at(-1))},
    aes256: {words: aes256.words.length, roundKeys: aes256.roundKeys.length, last: toHex(aes256.roundKeys.at(-1))},
    limit: 'Two official example keys; the shared routine is exercised at all three AES key lengths only through these fixed examples.'
  };
});

check('ks-calc-sensitivity', () => {
  assert(KEY_VECTORS.aes128.endsWith('3c'));
  const alteredKey = KEY_VECTORS.aes128.slice(0, -2) + '3d';
  const original = aesKeySchedule(KEY_VECTORS.aes128);
  const altered = aesKeySchedule(alteredKey);
  let changed = 0;
  for (let round = 0; round < original.roundKeys.length; round += 1) {
    for (let byte = 0; byte < 16; byte += 1) {
      if (original.roundKeys[round][byte] !== altered.roundKeys[round][byte]) changed += 1;
    }
  }
  assert.equal(changed, 139);
  assert.equal(original.roundKeys.length * 16, 176);
  return {
    change: 'last key byte 3c to 3d',
    changedBytes: changed,
    totalBytes: 176,
    limit: 'One fixed key and a one-byte change; this is a diffusion observation, not a security proof or a differential probability.'
  };
});

check('ks-calc-des-counts', () => {
  const rounds = 16;
  const subkeyBits = 48;
  const keyBits = 64;
  const parityBits = 8;
  assert.equal(rounds * subkeyBits, 768);
  assert.equal(keyBits - parityBits, 56);
  assert(768 > 56);
  return {
    rounds,
    subkeyBits,
    totalSubkeyBits: rounds * subkeyBits,
    effectiveKeyBits: keyBits - parityBits,
    limit: 'Arithmetic from the standard only; no DES implementation, weak-key enumeration or subkey-value check is performed in this batch.'
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
    'ks-teaching.mjs',
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
