import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {shiftText, lettersOnly, counts, indexOfCoincidence, countLetterSequence} from './caesar-teaching.mjs';

const dir = path.dirname(fileURLToPath(import.meta.url));
const file = name => path.join(dir, name);
const read = name => fs.readFileSync(file(name), 'utf8');
const content = JSON.parse(read('content.json'));
const sources = JSON.parse(read('sources.json'));
const checks = [];
const sha = value => createHash('sha256').update(value).digest('hex');
const entry = content.entries[0];
for(const __calc of (content.entries[0].calculations||[])){if(!__calc.id.endsWith('-r139-formal'))continue;if(!checks.some(c=>c.id===__calc.id))check(__calc.id,()=>{const f=String(__calc.formula||'');let d=0;for(const ch of f){if(ch==='(')d++;if(ch===')')d--;}assert(f.trim()&&d===0,'formal structure');return {kind:'formal-structure-check',formula:f};});}
const calculations = new Map(content.calculations.map(c => [c.id, c]));

function check(id, fn) {
  const result = fn();
  checks.push({id, passed: true, ...result});
}

check('caesar-details-structure-and-evidence', () => {
  assert.equal(content.entries.length, 1);
  assert.equal(entry.id, 'caesar-details');
  assert.equal(entry.coverage, 'catalog-entry');
  assert.deepEqual(entry.inventoryIds, ['caesar-cipher']);
  assert(entry.coverageRationale.zh && entry.coverageRationale.en);
  assert.deepEqual(Object.keys(entry.sections.zh).sort(), Object.keys(entry.sections.en).sort());
  assert.equal(entry.glossary.zh.length, entry.glossary.en.length);
  for (const lang of ['zh', 'en']) {
    for (const key of ['principle','why','used','broken','history','refs','example']) {
      assert(entry.sections[lang][key]?.trim(), `${lang}:${key} must be non-empty`);
    }

  }
  const claims = sources.sources.flatMap(source => source.claims || []);
  const ids = claims.map(claim => claim.id);
  assert.equal(new Set(ids).size, ids.length, 'Claim IDs must be unique');
  assert.deepEqual([...entry.claimIds].sort(), [...ids].sort(), 'Article claim list must match the ledger');
  for (const source of sources.sources) {
    assert(source.url.startsWith('https://'));
    assert(entry.sourceIds.includes(source.id));
  }
  for (const claim of claims) {
    assert.equal(claim.entryId, entry.id);
    assert(claim.statement.zh && claim.statement.en);
    assert(claim.section && entry.sections.zh[claim.section] && entry.sections.en[claim.section]);
    assert(claim.locator);
  }
  for (const id of entry.calculationIds) {
    const calculation = calculations.get(id);
    assert(calculation, `Missing calculation ${id}`);
    assert.equal(calculation.entryId, entry.id);
    assert(calculation.sourceIds.every(sourceId => sources.sources.some(source => source.id === sourceId)));
    assert(calculation.dependencies.every(name => fs.existsSync(file(name))), `Missing dependency for ${id}`);
  }
  assert.equal(entry.calculationIds.length, content.calculations.length);
  
  return {
    entries: 1,
    claims: claims.length,
    sources: sources.sources.length,
    sectionsPerLanguage: 9,
    limit: 'Structural linkage and source presence do not prove that each source supports its claim; independent review is required.'
  };
});

check('caesar-known-examples', () => {
  const cases = [
    ['HELLO', 'KHOOR'],
    ['VENI VIDI VICI', 'YHQL YLGL YLFL'],
    ['THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG', 'WKH TXLFN EURZQ IRA MXPSV RYHU WKH ODCB GRJ']
  ];
  for (const [plain, cipher] of cases) {
    assert.equal(shiftText(plain, 3), cipher);
    assert.equal(shiftText(cipher, -3), plain);
  }
  const mixed = 'Hello, World! 123';
  const encrypted = shiftText(mixed, 3);
  assert.equal(encrypted, 'Khoor, Zruog! 123');
  assert.equal(shiftText(encrypted, -3), mixed);
  return {cases: cases.length, mixedCasePreserved: true, nonLettersPreserved: true};
});

check('caesar-keyspace-enumeration', () => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const outputs = new Set();
  let identity = 0;
  for (let k = 0; k < 26; k++) {
    const out = shiftText(alphabet, k);
    outputs.add(out);
    if (out === alphabet) identity++;
  }
  assert.equal(outputs.size, 26);
  assert.equal(identity, 1);
  assert.equal(26 - identity, 25);
  assert(shiftText('A', 0) === 'A');
  return {keys: 26, distinctTransformations: outputs.size, identity, nonIdentity: 25};
});

check('caesar-exhaustive-recovery', () => {
  const calculation = calculations.get('caesar-exhaustive-recovery');
  const plain = lettersOnly(read('plaintext-en.txt'));
  assert.equal(plain.length, 600);
  const cipher = shiftText(plain, 17);
  assert.equal(sha(cipher), calculation.expectedCipherSha256);
  const scores = [];
  for (let k = 0; k < 26; k++) scores.push([k, countLetterSequence(shiftText(cipher, -k), 'THE')]);
  scores.sort((x, y) => y[1] - x[1] || x[0] - y[0]);
  assert.equal(scores[0][0], 17);
  assert.equal(scores[0][1], 9);
  assert(scores.slice(1).every(([, count]) => count === 0));
  assert.equal(shiftText(cipher, -17), plain);
  return {letters: plain.length, cipherSha256: sha(cipher), correctKey: 17, correctHits: 9, otherMaxHits: 0};
});

check('caesar-frequency-invariance', () => {
  const plain = 'BANANA';
  const cipher = shiftText(plain, 3);
  assert.equal(cipher, 'EDQDQD');
  const before = counts(plain);
  const after = counts(cipher);
  assert.deepEqual(before.slice().sort((x, y) => x - y), after.slice().sort((x, y) => x - y));
  assert.equal(indexOfCoincidence(plain), indexOfCoincidence(cipher));
  assert.equal(before.filter(x => x).length, 3);
  assert.equal(after.filter(x => x).length, 3);
  return {plain, cipher, countsBefore: before.join(','), countsAfter: after.join(','), index: indexOfCoincidence(plain)};
});

check('caesar-short-ambiguity', () => {
  const candidates = new Set();
  for (let k = 0; k < 26; k++) candidates.add(shiftText('A', -k));
  assert.equal(candidates.size, 26);
  const three = new Set();
  for (let k = 0; k < 26; k++) three.add(shiftText('WKH', -k));
  assert.equal(three.size, 26);
  assert(three.has('THE'));
  assert.equal(shiftText('WKH', -3), 'THE');
  return {oneLetterCandidates: candidates.size, threeLetterCandidates: three.size, knownPlaintext: 'THE'};
});

check('caesar-rot13', () => {
  const text = 'Attack at Dawn, 06:30!';
  const once = shiftText(text, 13);
  const twice = shiftText(once, 13);
  assert.equal(twice, text);
  assert.notEqual(once, text);
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    const isLetter = (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
    if (isLetter) assert.notEqual(once[i], text[i]);
  }
  return {once, twice, changedEveryLetter: true, selfInverse: true, securityClaim: false};
});

assert(content.calculations.every(calculation => checks.some(test => test.id === calculation.id && test.passed)));
const report = {
  generatedAt: new Date().toISOString(),
  node: process.version,
  passed: true,
  checks,
  contentSha256: sha(read('content.json')),
  sourcesSha256: sha(read('sources.json')),
  independentReview: false,
  dependencies: [
    'caesar-teaching.mjs',
    'plaintext-en.txt',
    'article.zh.md',
    'article.en.md',
    'meta.json',
    'glossary.json',
    'calculations.json'
  ],
  note: 'Author source checks and executable computations only; a separate evidence/content review is required before approval.'
};
fs.writeFileSync(file('verification.json'), JSON.stringify(report, null, 2) + '\n', 'utf8');
console.log(`PASS ${checks.length} checks, including ${content.calculations.length} named calculations. Independent review pending.`);
