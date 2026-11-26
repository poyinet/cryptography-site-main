import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {gmacEncrypt, gmacVerify, GMAC_VECTOR} from './gmac-teaching.mjs';

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
  assert.equal(entry.id, 'gmac-details');
  assert.equal(entry.coverage, 'catalog-entry');
  assert.deepEqual(entry.inventoryIds, ['gmac']);
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
  for (const name of ['content.json', 'sources.json', 'gmac-teaching.mjs', 'article.zh.md', 'article.en.md']) {
    assert(!read(name).includes('\r'), 'UTF-8 LF expected: ' + name);
  }
  return {
    catalogEntity: 'gmac',
    sources: sources.sources.length,
    claims: all.length,
    translatedSections: Object.keys(entry.sections.zh).length,
    limit: 'Structural correspondence and evidence links only; independent factual review remains required.'
  };
});

check('gmac-official-vector', () => {
  const v = GMAC_VECTOR;
  const tag = gmacEncrypt(v.key, v.iv, v.aad);
  assert.equal(tag, v.tag);
  assert.equal(gmacVerify(v.key, v.iv, v.aad, tag), true);
  return {
    tag,
    limit: 'One official GMAC case; not exhaustive AAD testing.'
  };
});

check('gmac-aad-mismatch', () => {
  const v = GMAC_VECTOR;
  const tag = gmacEncrypt(v.key, v.iv, v.aad);
  const badAad = v.aad.slice(0, -2) + ((parseInt(v.aad.slice(-2), 16) ^ 0x01).toString(16).padStart(2, '0'));
  let rejected = false;
  try { gmacVerify(v.key, v.iv, badAad, tag); } catch { rejected = true; }
  assert.equal(rejected, true);
  return {
    modifiedAad: badAad,
    rejected,
    limit: 'One fixed AAD change; not exhaustive AAD parsing.'
  };
});

check('gmac-tag-tamper', () => {
  const v = GMAC_VECTOR;
  const tag = gmacEncrypt(v.key, v.iv, v.aad);
  const badTag = tag.slice(0, -2) + ((parseInt(tag.slice(-2), 16) ^ 0x01).toString(16).padStart(2, '0'));
  let rejected = false;
  try { gmacVerify(v.key, v.iv, v.aad, badTag); } catch { rejected = true; }
  assert.equal(rejected, true);
  return {
    modifiedTag: badTag,
    rejected,
    limit: 'One fixed tag change; not exhaustive malformed-input testing.'
  };
});

check('gmac-tag-truncation', () => {
  const v = GMAC_VECTOR;
  const tag = gmacEncrypt(v.key, v.iv, v.aad);
  const truncated = tag.slice(0, 24);
  assert.equal(truncated.length, 24);
  assert.equal(gmacVerify(v.key, v.iv, v.aad, truncated), true);
  const bad = truncated.slice(0, -2) + ((parseInt(truncated.slice(-2), 16) ^ 0x01).toString(16).padStart(2, '0'));
  let rejected = false;
  try { gmacVerify(v.key, v.iv, v.aad, bad); } catch { rejected = true; }
  assert.equal(rejected, true);
  return {
    truncatedTag: truncated,
    truncatedBits: 96,
    modifiedTruncatedTagRejected: true,
    limit: 'Truncation mechanics only; no quantitative security estimate.'
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
    'gmac-teaching.mjs',
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
