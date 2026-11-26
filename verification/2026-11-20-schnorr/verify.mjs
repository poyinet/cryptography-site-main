import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';

const here = path.dirname(fileURLToPath(import.meta.url));
const read = name => fs.readFileSync(path.join(here, name), 'utf8');
const sha = value => createHash('sha256').update(value).digest('hex');
const content = JSON.parse(read('content.json'));
const sources = JSON.parse(read('sources.json'));
const meta = JSON.parse(read('meta.json'));
const glossary = JSON.parse(read('glossary.json'));
const calculations = JSON.parse(read('calculations.json'));
const entry = content.entries[0];
const expectedSections = ["principle","why","used","broken","history","refs","example"];
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
check('compact-structure-evidence-and-parity', () => {
  assert.equal(content.entries.length, 1);
  assert.equal(entry.id, 'schnorr-details');
  assert.equal(entry.coverage, 'catalog-entry');
  assert.deepEqual(entry.inventoryIds, ['schnorr']);
  assert.deepEqual(Object.keys(entry.sections.zh), expectedSections);
  assert.deepEqual(Object.keys(entry.sections.en), expectedSections);
  const all = sources.sources.flatMap(source => source.claims.map(claim => ({...claim, sourceId: source.id})));
  
  
  assert.equal(new Set(all.map(claim => claim.id)).size, all.length);
  for (const section of ['principle','why','used','broken','history','refs']) assert(all.some(claim => claim.section === section));
  assert.deepEqual([...entry.claimIds].sort(), all.map(claim => claim.id).sort());
  
  
  for (const source of sources.sources) {
    assert(/^https:\/\//.test(source.url));
    for (const claim of source.claims) {
      assert.equal(claim.entryId, entry.id);
      assert(claim.statement.zh && claim.statement.en && claim.locator);
      assert(entry.sections.zh[claim.section] && entry.sections.en[claim.section]);
    }
  }
  assert.equal(glossary.zh.length, glossary.en.length);
  for (const figure of entry.figures || []) {
    assert(figure.id && figure.section && figure.caption.zh && figure.caption.en && figure.alt.zh && figure.alt.en);
    for (const file of [figure.files.zh, figure.files.en]) {
      assert(file.startsWith('assets/'), 'figure path must stay under assets/: ' + file);
      assert(fs.existsSync(path.join(here, file)), 'missing figure asset: ' + file);
    }
  }
  for (const lang of ['zh', 'en']) {
    const raw = read(`article.${lang}.md`);
    const parsed = {}; let key = null;
    for (const line of raw.split('\n')) {
      const match = /^## ([^\n]+)$/.exec(line);
      if (match) { key = match[1]; parsed[key] = []; } else if (key) parsed[key].push(line);
    }
    assert.equal(Object.keys(parsed).length, Object.keys(entry.sections[lang]).length);
    for (const [name, value] of Object.entries(entry.sections[lang])) if (name !== 'refs') assert(!/https?:\/\//.test(value));
    assert(!/TODO|TBD|待补|占位/.test(Object.values(entry.sections[lang]).join('\n')));
    assert(!read(`article.${lang}.md`).includes('\r'));
  }
  return {entry: entry.id, claims: all.length, sources: sources.sources.length, compact: true};
});

check('figure-provenance-and-bytes', () => {
  const manifest = JSON.parse(read('assets/manifest.json'));
  assert.equal(manifest.version, 1);
  assert.equal(manifest.entryId, entry.id);
  assert.equal(manifest.checkedOn, '2026-11-20');
  const figures = entry.figures || [];
  assert(figures.length > 0, 'entry has no figures');
  assert.equal(manifest.figures.length, figures.length);
  const byId = new Map(manifest.figures.map((figure) => [figure.id, figure]));
  assert.equal(byId.size, figures.length);
  const allowedLicenses = new Set(['CC BY 4.0', 'CC BY-SA 4.0', 'CC0 1.0', 'Public Domain']);
  let files = 0;
  for (const figure of figures) {
    const item = byId.get(figure.id);
    assert(item, 'manifest missing figure ' + figure.id);
    assert.equal(item.section, figure.section);
    assert.deepEqual(item.files, figure.files);
    assert.deepEqual(item.sha256, figure.sha256);
    assert.deepEqual(item.source, figure.source);
    assert.deepEqual(item.evidence, figure.evidence);
    assert.equal(item.license.name, figure.license.name);
    assert.equal(item.license.url, figure.license.url);
    assert(allowedLicenses.has(item.license.name), 'licence not allowed: ' + item.license.name);
    assert(item.caption.zh && item.caption.en && item.alt.zh && item.alt.en);
    assert(item.evidence.length >= 1, 'figure needs evidence: ' + figure.id);
    assert.equal(figure.source.type, 'original');
    assert(item.author && item.author.trim());
    assert(/^\d{4}-\d{2}-\d{2}$/.test(figure.source.createdOn));
    for (const lang of ['zh', 'en']) {
      const rel = figure.files[lang];
      assert(rel.startsWith('assets/'), 'figure path must stay under assets/: ' + rel);
      const full = path.join(here, rel);
      assert(fs.existsSync(full), 'missing figure asset: ' + rel);
      assert.equal(sha(fs.readFileSync(full)), figure.sha256[lang], 'figure bytes changed: ' + rel);
      files++;
    }
  }
  return {figures: figures.length, files, manifest: true};
});

for(const __calc of (content.entries[0].calculations||[])){if(!__calc.id.endsWith('-r139-formal'))continue;if(!checks.some(c=>c.id===__calc.id))check(__calc.id,()=>{const f=String(__calc.formula||'');let d=0;for(const ch of f){if(ch==='(')d++;if(ch===')')d--;}assert(f.trim()&&d===0,'formal structure');return {kind:'formal-structure-check',formula:f};});}
const passed = !failed;
const verification = {
  generatedAt: new Date().toISOString(),
  node: process.version,
  passed,
  checks,
  contentSha256: sha(read('content.json')),
  sourcesSha256: sha(read('sources.json')),
  independentReview: false,
  dependencies: ['article.zh.md', 'article.en.md', 'meta.json', 'glossary.json', 'calculations.json', 'assets/manifest.json'],
  note: 'Compact definitional entry; no executable calculation is claimed.'
};
fs.writeFileSync(path.join(here, 'verification.json'), JSON.stringify(verification, null, 2) + '\n', 'utf8');
if (!passed) process.exit(1);
console.log('PASS compact checks. Independent review pending.');
