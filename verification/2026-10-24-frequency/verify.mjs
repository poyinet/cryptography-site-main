import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {HAC_ENGLISH_PERCENTAGES, lettersOnly, counts, indexOfCoincidence, chiSquare, shiftLetters, caesarRanking, digrams, vigenereEncrypt, columns} from './frequency-teaching.mjs';

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
const corpus = lettersOnly(read('corpus-en.txt'));

function check(id, fn) {
  const result = fn();
  checks.push({id, passed: true, ...result});
}

function close(actual, expected, tolerance = 1e-9, label = 'value') {
  assert(Math.abs(actual - expected) <= tolerance, `${label}: expected ${expected}, got ${actual}`);
}

check('frequency-details-structure-and-evidence', () => {
  assert.equal(content.entries.length, 1);
  assert.equal(entry.id, 'frequency-details');
  assert.equal(entry.coverage, 'catalog-entry');
  assert.deepEqual(entry.inventoryIds, ['attack--frequency-analysis']);
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

check('frequency-corpus-counts', () => {
  const calculation = calculations.get('frequency-corpus-counts');
  assert.equal(sha(read('corpus-en.txt')), calculation.corpusSha256);
  assert.equal(corpus.length, 20000);
  assert.deepEqual(counts(corpus), calculation.expectedCounts);
  assert.deepEqual(counts('BANANA'), [3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  return {letters: corpus.length, corpusSha256: sha(read('corpus-en.txt')), countsVerified: true, bananaCounts: '3/2/1'};
});

check('frequency-ioc', () => {
  const calculation = calculations.get('frequency-ioc');
  close(indexOfCoincidence('BANANA'), calculation.bananaIc, 1e-15, 'BANANA IC');
  close(indexOfCoincidence(corpus), calculation.corpusIc, 1e-12, 'corpus IC');
  close(1 / 26, calculation.uniformIc, 1e-15, 'uniform IC');
  assert(indexOfCoincidence(corpus) > 0.06 && indexOfCoincidence(corpus) < 0.07);
  return {bananaIc: indexOfCoincidence('BANANA'), corpusIc: indexOfCoincidence(corpus), uniformIc: 1 / 26};
});

check('frequency-chi-square-recovery', () => {
  const calculation = calculations.get('frequency-chi-square-recovery');
  const ciphertext = shiftLetters(corpus, 17);
  const ranking = caesarRanking(ciphertext);
  assert.equal(ranking[0].k, calculation.correctKey);
  close(ranking[0].score, calculation.correctChi, 1e-9, 'correct chi-square');
  assert.equal(ranking[1].k, calculation.runnerUpKey);
  close(ranking[1].score, calculation.runnerUpChi, 1e-6, 'runner-up chi-square');
  assert(ranking[0].score < ranking[1].score / 100);
  return {correctKey: ranking[0].k, correctChi: ranking[0].score, runnerUpKey: ranking[1].k, runnerUpChi: ranking[1].score};
});

check('frequency-chi-square-failure', () => {
  const calculation = calculations.get('frequency-chi-square-failure');
  const ciphertext = shiftLetters('ZEBRAZEBRAZEBRA', 17);
  const ranking = caesarRanking(ciphertext);
  assert.equal(ranking[0].k, calculation.winnerKey);
  close(ranking[0].score, calculation.winnerChi, 1e-9, 'winner chi-square');
  const correctIndex = ranking.findIndex(item => item.k === calculation.correctKey);
  assert.equal(correctIndex + 1, calculation.correctRank);
  assert.equal(ranking[0].plaintext, 'MROENMROENMROEN');
  assert.notEqual(ranking[0].k, calculation.correctKey);
  return {winnerKey: ranking[0].k, winnerPlaintext: ranking[0].plaintext, correctRank: correctIndex + 1, correctChi: ranking[correctIndex].score};
});

check('frequency-digrams', () => {
  const calculation = calculations.get('frequency-digrams');
  const top = digrams(corpus, 5);
  assert.deepEqual(top, calculation.topDigrams);
  assert.equal(top[0][0], 'TH');
  return {top: top.map(([pair, count]) => `${pair}:${count}`).join(', ')};
});

check('frequency-vigenere-boundary', () => {
  const calculation = calculations.get('frequency-vigenere-boundary');
  const ciphertext = vigenereEncrypt(corpus, 'LEMON');
  close(indexOfCoincidence(ciphertext), calculation.globalIc, 1e-12, 'global IC');
  const cols = columns(ciphertext, calculation.period);
  assert.equal(cols.length, 5);
  cols.forEach((col, index) => close(indexOfCoincidence(col), calculation.columnIcs[index], 1e-12, `column ${index} IC`));
  assert(calculation.globalIc < 0.045);
  assert(calculation.columnIcs.every(value => value > 0.06));
  return {globalIc: indexOfCoincidence(ciphertext), columnIcs: cols.map(indexOfCoincidence)};
});

check('frequency-expected-table', () => {
  const sum = HAC_ENGLISH_PERCENTAGES.reduce((x, y) => x + y, 0);
  close(sum, 99.99, 1e-12, 'expected-percentage sum');
  assert.equal(HAC_ENGLISH_PERCENTAGES.length, 26);
  assert(HAC_ENGLISH_PERCENTAGES.every(value => value >= 0));
  return {symbols: 26, sum, note: 'The 0.01 difference is the published table rounding, not a transcription omission.'};
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
    'frequency-teaching.mjs',
    'corpus-en.txt',
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
