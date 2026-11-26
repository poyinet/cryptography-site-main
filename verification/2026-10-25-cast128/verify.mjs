import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {
  SBOXES,
  ROUND_TYPES,
  cast128EncryptBlock,
  cast128DecryptBlock,
  cast128PrepareKey,
  cast128ScheduleFromBytes,
  cast128ScheduleFromWords,
  cast128RoundFunction,
  cast128MaintenanceTest,
  VECTORS
} from './cast128-teaching.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const file = name => path.join(here, name);
const read = name => fs.readFileSync(file(name), 'utf8');
const sha = value => createHash('sha256').update(value).digest('hex');
const content = JSON.parse(read('content.json'));
const sources = JSON.parse(read('sources.json'));
const meta = JSON.parse(read('meta.json'));
const glossary = JSON.parse(read('glossary.json'));
const vectorFile = JSON.parse(read('vectors.json'));
const sboxes = JSON.parse(read('sboxes.json'));
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

const hexWord = value => (value >>> 0).toString(16).padStart(8, '0');
const wordList = list => Array.from(list, hexWord);

check('structure-evidence-and-authoring-parity', () => {
  assert.equal(content.entries.length, 1);
  const entry = content.entries[0];
  assert.equal(entry.id, 'cast128-details');
  assert.equal(entry.coverage, 'catalog-entry');
  assert.deepEqual(entry.inventoryIds, ['cast128']);
  assert(entry.coverageRationale.zh && entry.coverageRationale.en);
  assert(entry.verificationStatus);
  assert.deepEqual(Object.keys(entry.sections.zh).sort(), Object.keys(entry.sections.en).sort());
  const all = sources.sources.flatMap(source => source.claims.map(claim => ({...claim, sourceId: source.id})));
  assert.equal(new Set(all.map(claim => claim.id)).size, all.length);
  assert.equal(new Set(sources.sources.map(source => source.id)).size, sources.sources.length);
  
  
  for (const section of ['principle','why','used','broken','history','refs']) {
    assert(all.some(claim => claim.section === section), 'No claim for ' + section);
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
      if (key !== 'refs') assert(!/https?:\/\//.test(String(value)), 'Public body section uses a URL: lang:' + key);
      else for (const source of sources.sources) assert(String(value).includes(source.url), 'refs does not print ' + source.id + ' URL (lang)');
      }
    assert(!/TODO|TBD|待补|占位/.test(Object.values(entry.sections[lang]).join('\n')));
  }
  for (const name of ['content.json', 'sources.json', 'cast128-teaching.mjs', 'sboxes.json', 'vectors.json', 'article.zh.md', 'article.en.md', 'meta.json', 'glossary.json', 'calculations.json', 'verify.mjs']) {
    assert(!read(name).includes('\r'), 'UTF-8 LF expected: ' + name);
  }
  return {
    catalogEntity: 'cast128',
    sources: sources.sources.length,
    claims: all.length,
    calculations: content.calculations.length,
    translatedSections: Object.keys(entry.sections.zh).length,
    limit: 'Structural correspondence and evidence links only; independent factual review remains required.'
  };
});

check('cast128-calc-rfc-vectors', () => {
  const vectors = vectorFile.rfc2144.single;
  assert.equal(vectors.length, 3);
  for (const vector of vectors) {
    const prepared = cast128PrepareKey(vector.key);
    assert.equal(prepared.rounds, vector.rounds);
    assert.equal(prepared.keyBytes * 8, vector.keyBits);
    assert.equal(cast128EncryptBlock(vector.plaintext, vector.key), vector.ciphertext);
    assert.equal(cast128DecryptBlock(vector.ciphertext, vector.key), vector.plaintext);
  }
  const padded80 = cast128PrepareKey('01234567123456782345').padded;
  assert.equal(Buffer.from(padded80).toString('hex'), '01234567123456782345000000000000');
  const padded40 = cast128PrepareKey('0123456712').padded;
  assert.equal(Buffer.from(padded40).toString('hex'), '01234567120000000000000000000000');
  return {
    vectors: vectors.length,
    rounds: vectors.map(vector => vector.rounds),
    first: vectors[0],
    last: vectors.at(-1),
    limit: 'Three fixed vectors; only the 128-bit key exercises 16 rounds, and the 80/40-bit keys exercise 12 rounds with zero-padded key material.'
  };
});

check('cast128-calc-maintenance', () => {
  const maintenance = vectorFile.rfc2144.maintenance;
  const observed = cast128MaintenanceTest(maintenance.iterations);
  assert.equal(observed.iterations, 1000000);
  assert.equal(observed.a, maintenance.a);
  assert.equal(observed.b, maintenance.b);
  return {
    iterations: observed.iterations,
    a: observed.a,
    b: observed.b,
    limit: 'One official initial value and one fixed iteration count; it is a strong consistency test, not a proof of security or an exhaustive key test.'
  };
});

check('cast128-calc-key-sizes', () => {
  const plaintext = '0123456789abcdef';
  const sizes = [];
  for (let bytes = 5; bytes <= 16; bytes += 1) {
    const key = '0123456789abcdef0123456789abcdef'.slice(0, bytes * 2);
    const prepared = cast128PrepareKey(key);
    const expectedRounds = bytes <= 10 ? 12 : 16;
    assert.equal(prepared.rounds, expectedRounds);
    assert.equal(prepared.padded.length, 16);
    assert.equal(Buffer.from(prepared.padded.subarray(0, bytes)).toString('hex'), key);
    assert(Buffer.from(prepared.padded.subarray(bytes)).every(byte => byte === 0));
    const ciphertext = cast128EncryptBlock(plaintext, key);
    assert.equal(cast128DecryptBlock(ciphertext, key), plaintext);
    sizes.push({bits: bytes * 8, rounds: prepared.rounds});
  }
  assert.equal(sizes.length, 12);
  return {
    sizes: sizes.map(size => size.bits),
    rounds: sizes.map(size => size.rounds),
    limit: 'Twelve fixed key sizes with one plaintext; only the 128/80/40-bit sizes have published known-answer ciphertexts.'
  };
});

check('cast128-calc-structure', () => {
  const samples = vectorFile.samples;
  for (const name of ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8']) {
    assert.equal(SBOXES[name].length, 256);
    assert.equal(sboxes[name].length, 256);
    assert.deepEqual(Array.from(SBOXES[name]), sboxes[name]);
    assert.equal(hexWord(SBOXES[name][0]), samples.sboxes[name].first);
    assert.equal(hexWord(SBOXES[name][255]), samples.sboxes[name].last);
  }
  const prepared = cast128PrepareKey(samples.key);
  const schedule = cast128ScheduleFromBytes(prepared.padded);
  assert.equal(schedule.length, 32);
  assert.equal(prepared.rounds, 16);
  assert.deepEqual(wordList(schedule.slice(0, 4)), samples.maskingSubkeys);
  assert.deepEqual(wordList(schedule.slice(16, 20)), samples.rotationSubkeys);
  const pairs = Array.from({length: 16}, (_, index) => [schedule[index], schedule[15 + index + 1]]);
  assert.equal(pairs.length, 16);
  assert.deepEqual(ROUND_TYPES, [1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1]);
  const data = 0x01234567;
  const km = 0x89abcdef;
  const kr = 5;
  const outputs = [1, 2, 3].map(type => cast128RoundFunction(type, data, km, kr));
  assert.equal(new Set(outputs).size, 3);
  const fromWords = cast128ScheduleFromWords([0x01234567, 0x12345678, 0x23456789, 0x3456789a]);
  assert.deepEqual(Array.from(fromWords), Array.from(schedule));
  return {
    sboxes: 8,
    entriesPerBox: 256,
    subkeys: schedule.length,
    roundTypes: ROUND_TYPES.join(','),
    firstRoundFunctionOutputs: outputs.map(hexWord),
    limit: 'Structural and reproducibility checks, not an assessment of S-box nonlinearity or cryptographic strength.'
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
    'cast128-teaching.mjs',
    'sboxes.json',
    'vectors.json',
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
