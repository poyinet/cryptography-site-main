import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {hashHex} from './event-sha1-teaching.mjs';
import {compareFiles} from './sha1event-check.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const file = name => path.join(here, name);
const read = name => fs.readFileSync(file(name), 'utf8');
const sha = value => createHash('sha256').update(value).digest('hex');
const content = JSON.parse(read('content.json'));
const sources = JSON.parse(read('sources.json'));
const meta = JSON.parse(read('meta.json'));
const glossary = JSON.parse(read('glossary.json'));
const calculationsFile = JSON.parse(read('calculations.json'));
const vectorFile = JSON.parse(read('vectors.json'));
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

const hexTokens = text =>
  [...new Set(text.replace(/0x/gi, ' ').match(/\b[0-9a-f]{8,}\b/gi) || [])]
    .map(token => token.toLowerCase())
    .sort();

check('structure-evidence-and-authoring-parity', () => {
  assert.equal(content.entries.length, 1);
  const entry = content.entries[0];
  assert.equal(entry.id, 'sha1event-details');
  assert.equal(entry.coverage, 'catalog-entry');
  assert.deepEqual(entry.inventoryIds, ['event-sha1-collision-2005']);
  assert(entry.coverageRationale.zh && entry.coverageRationale.en);
  assert(entry.verificationStatus);
  const all = sources.sources.flatMap(source => source.claims.map(claim => ({...claim, sourceId: source.id})));
  assert.equal(new Set(all.map(claim => claim.id)).size, all.length);
  
  
  for (const section of ['principle','why','used','broken','history','refs']) {
    assert(all.some(claim => claim.section === section), 'No claim for ' + section);
  }
  assert.deepEqual([...entry.claimIds].sort(), all.map(claim => claim.id).sort());
  
  
  for (const source of sources.sources) {
    assert(/^https:\/\//.test(source.url));
    assert(source.method, 'Source has no method: ' + source.id);
    for (const claim of source.claims) {
      assert.equal(claim.entryId, entry.id);
      assert(claim.statement.zh && claim.statement.en && claim.locator);
      assert(entry.sections.zh[claim.section]);
      assert(entry.sections.en[claim.section]);
    }
  }
  
  
  for (const calculation of content.calculations) {
    assert.equal(calculation.entryId, entry.id);
    assert(calculation.kind && calculation.inputs && calculation.expected && calculation.limitations);
    for (const sourceId of calculation.sourceIds) assert(sources.sources.some(source => source.id === sourceId), 'Unknown calculation source ' + sourceId);
    for (const dependency of calculation.dependencies) assert(fs.existsSync(file(dependency)), 'Missing dependency ' + dependency);
  }
  assert.equal(glossary.zh.length, glossary.en.length);
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
    }
    assert(!/TODO|TBD|待补|占位/.test(Object.values(entry.sections[lang]).join('\n')));
  }
  const zhTokens = hexTokens(read('article.zh.md'));
  const enTokens = hexTokens(read('article.en.md'));
  return {
    catalogEntity: 'event-sha1-collision-2005',
    sources: sources.sources.length,
    claims: all.length,
    calculations: content.calculations.length,
    limit: 'Structural correspondence and evidence links only; independent factual review remains required.',
  };
});

check('sha1event-calc-shattered-pair', () => {
  const first = file('shattered-1.pdf');
  const second = file('shattered-2.pdf');
  const observed = compareFiles(first, second);
  assert.equal(observed.bytesA, vectorFile.shattered.files[0].bytes);
  assert.equal(observed.bytesB, vectorFile.shattered.files[1].bytes);
  assert.equal(observed.sameLength, true);
  assert.equal(observed.sameBytes, false);
  assert.equal(observed.sha1A, vectorFile.shattered.commonSha1);
  assert.equal(observed.sha1B, vectorFile.shattered.commonSha1);
  assert.equal(observed.sha1A, '38762cf7f55934b34d179ae6a4c80cadccbb7f0a');
  assert.equal(createHash('sha1').update(fs.readFileSync(first)).digest('hex'), observed.sha1A);
  assert.equal(createHash('sha1').update(fs.readFileSync(second)).digest('hex'), observed.sha1B);
  assert.equal(createHash('sha256').update(fs.readFileSync(first)).digest('hex'), vectorFile.shattered.files[0].sha256);
  assert.equal(createHash('sha256').update(fs.readFileSync(second)).digest('hex'), vectorFile.shattered.files[1].sha256);
  return {
    files: 2,
    bytes: observed.bytesA,
    commonSha1: observed.sha1A,
    limit: 'Verifies the 2017 SHAttered pair only; it is not a test of the 2005 attack.',
  };
});

check('sha1event-calc-complexity', () => {
  const v = vectorFile.complexity;
  assert(v.wlyBits < v.birthdayBits);
  assert.equal((1n << BigInt(v.birthdayBits)) / (1n << BigInt(v.wlyBits)), 2048n);
  assert.equal(2 ** 80 / 2 ** 69, 2048);
  assert.equal(v.birthdayToWly, '2048');
  const ratio = 2 ** (v.wlyBits - v.shatteredBits);
  assert(ratio > 59 && ratio < 60);
  assert(Math.abs(ratio - v.wlyToShatteredApprox) < 0.2);
  assert(v.shamblesBits > v.shatteredBits);
  assert.deepEqual(vectorFile.timeline.map(item => item.date), ['2005-02', '2005-08', '2011-03', '2017', '2020-08']);
  return {
    birthdayBits: v.birthdayBits,
    wlyBits: v.wlyBits,
    birthdayToWly: v.birthdayToWly,
    wlyToShatteredApprox: ratio,
    limit: 'Arithmetic on published exponents only; no attack is executed.',
  };
});

for(const __calc of (content.entries[0].calculations||[])){if(!__calc.id.endsWith('-r139-formal'))continue;if(!checks.some(c=>c.id===__calc.id))check(__calc.id,()=>{const f=String(__calc.formula||'');let d=0;for(const ch of f){if(ch==='(')d++;if(ch===')')d--;}assert(f.trim()&&d===0,'formal structure');return {kind:'formal-structure-check',formula:f};});}
const calculations = content.calculations || [];
const missingCalculations = calculations.filter(calculation => !checks.some(test => test.id === calculation.id && test.passed));
const passed = !failed && missingCalculations.length === 0;
const verification = {
  generatedAt: new Date().toISOString(),
  node: process.version,
  passed,
  checks,
  contentSha256: sha(read('content.json')),
  sourcesSha256: sha(read('sources.json')),
  independentReview: false,
  dependencies: ['sha1event-check.mjs', 'event-sha1-teaching.mjs', 'shattered-1.pdf', 'shattered-2.pdf', 'vectors.json', 'article.zh.md', 'article.en.md', 'meta.json', 'glossary.json', 'calculations.json'],
  note: 'Author source checks and executable computations only; a separate evidence/content review is required before approval.',
};
fs.writeFileSync(file('verification.json'), JSON.stringify(verification, null, 2) + '\n', 'utf8');
if (!passed) {
  console.error('FAIL missing or failed calculations: ' + missingCalculations.map(calculation => calculation.id).join(', '));
  process.exit(1);
}
console.log(`PASS ${verification.checks.length} checks, including ${calculations.length} named calculations. Independent review pending.`);
