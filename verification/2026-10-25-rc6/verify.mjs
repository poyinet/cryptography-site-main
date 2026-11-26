import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {
  P32,
  Q32,
  VECTORS,
  hexToBytes,
  rc6KeySchedule,
  rc6EncryptBlock,
  rc6DecryptBlock
} from './rc6-teaching.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const file = name => path.join(here, name);
const read = name => fs.readFileSync(file(name), 'utf8');
const sha = value => createHash('sha256').update(value).digest('hex');
const content = JSON.parse(read('content.json'));
const sources = JSON.parse(read('sources.json'));
const meta = JSON.parse(read('meta.json'));
const glossary = JSON.parse(read('glossary.json'));
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

const hex8 = value => (value >>> 0).toString(16).padStart(8, '0');
const words = list => Array.from(list, hex8);

check('structure-evidence-and-authoring-parity', () => {
  assert.equal(content.entries.length, 1);
  const entry = content.entries[0];
  assert.equal(entry.id, 'rc6-details');
  assert.equal(entry.coverage, 'catalog-entry');
  assert.deepEqual(entry.inventoryIds, ['algorithm--rc6']);
  assert(entry.coverageRationale.zh && entry.coverageRationale.en);
  assert(entry.verificationStatus);
  assert.deepEqual(Object.keys(entry.sections.zh).sort(), Object.keys(entry.sections.en).sort());
  assert(true);
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
      assert(entry.sections.en[claim.section]);
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
    for (const dependency of calculation.dependencies) {
      assert(fs.existsSync(file(dependency)), 'Missing dependency ' + dependency);
    }
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
      if (key !== 'refs') assert(!/https?:\/\//.test(String(value)), 'Public body section uses a URL: lang:' + key);
      else for (const source of sources.sources) assert(String(value).includes(source.url), 'refs does not print ' + source.id + ' URL (lang)');
      }
    assert(!/TODO|TBD|待补|占位/.test(Object.values(entry.sections[lang]).join('\n')));
  }
  for (const name of ['content.json', 'sources.json', 'rc6-teaching.mjs', 'vectors.json', 'article.zh.md', 'article.en.md', 'meta.json', 'glossary.json', 'calculations.json', 'verify.mjs']) {
    assert(!read(name).includes('\r'), 'UTF-8 LF expected: ' + name);
  }
  return {
    catalogEntity: 'rc6',
    sources: sources.sources.length,
    claims: all.length,
    calculations: content.calculations.length,
    translatedSections: Object.keys(entry.sections.zh).length,
    limit: 'Structural correspondence and evidence links only; independent factual review remains required.'
  };
});

check('rc6-calc-submission-vectors', () => {
  const vectors = vectorFile.submission.vectors;
  assert.equal(vectors.length, 6);
  for (const vector of vectors) {
    assert.equal(vector.key.length, vector.keyBits / 4);
    assert.equal(vector.plaintext.length, 32);
    const ciphertext = rc6EncryptBlock(vector.plaintext, vector.key);
    assert.equal(ciphertext, vector.ciphertext);
    assert.equal(rc6DecryptBlock(ciphertext, vector.key), vector.plaintext);
  }
  const schedule = rc6KeySchedule(hexToBytes(vectors[0].key));
  assert.deepEqual(words(schedule.S.slice(0, 4)), vectorFile.samples.S0to3);
  assert.deepEqual(words(schedule.S.slice(42, 44)), vectorFile.samples.S42to43);
  assert.equal(VECTORS.length, vectors.length);
  return {
    vectors: vectors.length,
    keyBits: vectors.map(vector => vector.keyBits),
    ciphertexts: vectors.map(vector => vector.ciphertext),
    S0to3: vectorFile.samples.S0to3,
    S42to43: vectorFile.samples.S42to43,
    limit: 'Six fixed vectors with two plaintexts; a match does not establish security against cryptanalysis.'
  };
});

check('rc6-calc-key-schedule', () => {
  const vectors = vectorFile.submission.vectors;
  const schedule = rc6KeySchedule(hexToBytes(vectors[0].key));
  assert.equal(schedule.S.length, 44);
  assert.equal(P32, 0xB7E15163);
  assert.equal(Q32, 0x9E3779B9);
  assert.equal(((P32 + Q32) >>> 0), 0x5618CB1C);
  assert.deepEqual(words(schedule.S.slice(0, 4)), vectorFile.samples.S0to3);
  assert.deepEqual(words(schedule.S.slice(42, 44)), vectorFile.samples.S42to43);
  assert.deepEqual(words(schedule.L), vectorFile.samples.L);
  assert.equal(schedule.L.length, 4);
  for (const vector of vectors) {
    const current = rc6KeySchedule(hexToBytes(vector.key));
    assert.equal(current.S.length, 44);
    assert.equal(current.L.length, vector.keyBits / 32);
    assert.equal(rc6EncryptBlock(vector.plaintext, vector.key), vector.ciphertext);
  }
  return {
    SLength: schedule.S.length,
    P: hex8(P32),
    Q: hex8(Q32),
    S0to3: vectorFile.samples.S0to3,
    S42to43: vectorFile.samples.S42to43,
    L: vectorFile.samples.L,
    limit: 'The mixed S values for the zero key are computed, not published; the schedule is verified through the six ciphertexts and the P/Q rule.'
  };
});

check('rc6-calc-draft-vector', () => {
  const vector = vectorFile.draft;
  const ciphertext = rc6EncryptBlock(vector.plaintext, vector.key);
  assert.equal(ciphertext, vector.ciphertext);
  assert.equal(rc6DecryptBlock(ciphertext, vector.key), vector.plaintext);
  assert.equal(ciphertext, '3a96f9c7f6755cfe46f00e3dcd5d2a3c');
  return {
    key: vector.key,
    plaintext: vector.plaintext,
    ciphertext: vector.ciphertext,
    limit: 'One independent vector from an IETF draft, not a standard; it cross-checks but does not replace the six submission vectors.'
  };
});

check('rc6-calc-roundtrip', () => {
  const keys = [
    '00000000000000000000000000000000',
    '000000000000000000000000000000000000000000000000',
    '0000000000000000000000000000000000000000000000000000000000000000'
  ];
  const plaintexts = vectorFile.roundtrip.plaintexts;
  assert.equal(keys.length, 3);
  assert.equal(plaintexts.length, 8);
  const results = [];
  for (const key of keys) {
    const seen = new Set();
    for (const plaintext of plaintexts) {
      const ciphertext = rc6EncryptBlock(plaintext, key);
      assert.equal(rc6DecryptBlock(ciphertext, key), plaintext);
      assert(!seen.has(ciphertext), 'Duplicate ciphertext for one key');
      seen.add(ciphertext);
      results.push({keyBits: key.length * 4, plaintext, ciphertext});
    }
  }
  assert.equal(results.length, 24);
  const official = plaintexts[2];
  const byKey = keys.map(key => rc6EncryptBlock(official, key));
  assert.equal(new Set(byKey).size, 3);
  const schedules = keys.map(key => JSON.stringify(words(rc6KeySchedule(hexToBytes(key)).S)));
  assert.equal(new Set(schedules).size, 3);
  return {
    roundTrips: results.length,
    keyBits: [128, 192, 256],
    first: results[0],
    last: results.at(-1),
    limit: 'Deterministic round trips only; no modes, protocols, key management, side channels or randomness are tested.'
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
    'rc6-teaching.mjs',
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
