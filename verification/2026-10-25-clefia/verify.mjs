import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {
  SBOXES,
  VECTORS,
  clefiaF0,
  clefiaF1,
  clefiaEncryptBlock,
  clefiaDecryptBlock,
  clefiaEncryptRounds,
  clefiaExpandKey,
  clefiaConstants,
  clefiaSigma,
  gf8Mul
} from './clefia-teaching.mjs';

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

const hex8 = value => (value >>> 0).toString(16).padStart(8, '0');
const hex32 = value => value.toString(16).padStart(32, '0');
const words = list => Array.from(list, hex8);

check('structure-evidence-and-authoring-parity', () => {
  assert.equal(content.entries.length, 1);
  const entry = content.entries[0];
  assert.equal(entry.id, 'clefia-details');
  assert.equal(entry.coverage, 'catalog-entry');
  assert.deepEqual(entry.inventoryIds, ['clefia']);
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
  for (const name of ['content.json', 'sources.json', 'clefia-teaching.mjs', 'sboxes.json', 'vectors.json', 'article.zh.md', 'article.en.md', 'meta.json', 'glossary.json', 'calculations.json', 'verify.mjs']) {
    assert(!read(name).includes('\r'), 'UTF-8 LF expected: ' + name);
  }
  return {
    catalogEntity: 'clefia',
    sources: sources.sources.length,
    claims: all.length,
    calculations: content.calculations.length,
    translatedSections: Object.keys(entry.sections.zh).length,
    limit: 'Structural correspondence and evidence links only; independent factual review remains required.'
  };
});

check('clefia-calc-rfc-vectors', () => {
  const vectors = vectorFile.rfc6114.vectors;
  assert.equal(vectors.length, 3);
  for (const vector of vectors) {
    const ciphertext = clefiaEncryptBlock(vector.plaintext, vector.key);
    assert.equal(ciphertext, vector.ciphertext);
    assert.equal(clefiaDecryptBlock(ciphertext, vector.key), vector.plaintext);
  }
  const intermediate = vectorFile.rfc6114.intermediate128;
  const schedule = clefiaExpandKey(vectors[0].key);
  assert.equal(hex32(schedule.L), intermediate.L);
  assert.deepEqual(words(schedule.whitening), intermediate.WK);
  assert.deepEqual(words(schedule.roundKeys), intermediate.RK);
  const rounds = clefiaEncryptRounds(vectors[0].plaintext, vectors[0].key);
  assert.deepEqual(words(rounds.whitened), intermediate.whitened);
  assert.deepEqual(words(rounds.rounds[0].input), intermediate.round1.input);
  assert.equal(hex8(rounds.rounds[0].f0.keyAdd), intermediate.round1.f0.keyAdd);
  assert.equal(hex8(rounds.rounds[0].f0.afterS), intermediate.round1.f0.afterS);
  assert.equal(hex8(rounds.rounds[0].f0.afterM), intermediate.round1.f0.afterM);
  assert.equal(hex8(rounds.rounds[0].f1.keyAdd), intermediate.round1.f1.keyAdd);
  assert.equal(hex8(rounds.rounds[0].f1.afterS), intermediate.round1.f1.afterS);
  assert.equal(hex8(rounds.rounds[0].f1.afterM), intermediate.round1.f1.afterM);
  assert.deepEqual(words(rounds.rounds[1].input), intermediate.round2Input);
  assert.equal(VECTORS.length, vectors.length);
  return {
    vectors: vectors.length,
    keyBits: vectors.map(vector => vector.keyBits),
    rounds: vectors.map(vector => vector.rounds),
    roundKeys: schedule.roundKeys.length,
    limit: 'Three fixed vectors with one plaintext each; a match does not establish security against cryptanalysis.'
  };
});

check('clefia-calc-key-schedule', () => {
  const vectors = vectorFile.rfc6114.vectors;
  const intermediate = vectorFile.rfc6114.intermediate128;
  const schedule = clefiaExpandKey(vectors[0].key);
  assert.equal(hex32(schedule.L), intermediate.L);
  assert.deepEqual(words(schedule.whitening), intermediate.WK);
  assert.deepEqual(words(schedule.roundKeys), intermediate.RK);
  assert.equal(schedule.roundKeys.length, 36);
  assert.equal(schedule.con.length, 60);
  assert.deepEqual(words(schedule.con.slice(0, 4)), vectorFile.samples.CON128);
  assert.deepEqual(words(schedule.con.slice(56, 60)), vectorFile.samples.CON128Last);
  assert.equal(hex32(clefiaSigma(0x000102030405060708090a0b0c0d0e0fn)), vectorFile.samples.sigma);
  assert.equal(clefiaExpandKey(vectors[1].key).roundKeys.length, 44);
  assert.equal(clefiaExpandKey(vectors[2].key).roundKeys.length, 52);
  assert.equal(clefiaConstants(128).length, 60);
  assert.equal(clefiaConstants(192).length, 84);
  assert.equal(clefiaConstants(256).length, 92);
  return {
    L: intermediate.L,
    WK: intermediate.WK,
    firstRK: intermediate.RK.slice(0, 4),
    lastRK: intermediate.RK.slice(32, 36),
    roundKeyCounts: [36, 44, 52],
    conCounts: [60, 84, 92],
    sigma: vectorFile.samples.sigma,
    limit: 'Only the 128-bit key has published L/WK/RK intermediates; the 192/256-bit schedules are checked by their vectors and structural counts.'
  };
});

check('clefia-calc-components', () => {
  for (const name of ['S0', 'S1']) {
    assert.equal(SBOXES[name].length, 256);
    assert.equal(sboxes[name].length, 256);
    assert.deepEqual(Array.from(SBOXES[name]), sboxes[name]);
  }
  assert.equal(SBOXES.S0[0xab].toString(16).padStart(2, '0'), vectorFile.samples.sboxes.S0.atAB);
  assert.equal(SBOXES.S0[0].toString(16).padStart(2, '0'), vectorFile.samples.sboxes.S0.first);
  assert.equal(SBOXES.S0[255].toString(16).padStart(2, '0'), vectorFile.samples.sboxes.S0.last);
  assert.equal(SBOXES.S1[0].toString(16).padStart(2, '0'), vectorFile.samples.sboxes.S1.first);
  assert.equal(SBOXES.S1[255].toString(16).padStart(2, '0'), vectorFile.samples.sboxes.S1.last);
  assert.equal(gf8Mul(0x80, 2), 0x1d);
  for (let index = 0; index < 256; index += 1) assert.equal(gf8Mul(index, 1), index);
  const t0 = [SBOXES.S0[0], SBOXES.S1[0], SBOXES.S0[0], SBOXES.S1[0]];
  const expectedF0 = (
    (t0[0] ^ gf8Mul(t0[1], 2) ^ gf8Mul(t0[2], 4) ^ gf8Mul(t0[3], 6)) << 24 |
    (gf8Mul(t0[0], 2) ^ t0[1] ^ gf8Mul(t0[2], 6) ^ gf8Mul(t0[3], 4)) << 16 |
    (gf8Mul(t0[0], 4) ^ gf8Mul(t0[1], 6) ^ t0[2] ^ gf8Mul(t0[3], 2)) << 8 |
    (gf8Mul(t0[0], 6) ^ gf8Mul(t0[1], 4) ^ gf8Mul(t0[2], 2) ^ t0[3])
  ) >>> 0;
  assert.equal(clefiaF0(0, 0), expectedF0);
  const t1 = [SBOXES.S1[0], SBOXES.S0[0], SBOXES.S1[0], SBOXES.S0[0]];
  const expectedF1 = (
    (t1[0] ^ gf8Mul(t1[1], 8) ^ gf8Mul(t1[2], 2) ^ gf8Mul(t1[3], 10)) << 24 |
    (gf8Mul(t1[0], 8) ^ t1[1] ^ gf8Mul(t1[2], 10) ^ gf8Mul(t1[3], 2)) << 16 |
    (gf8Mul(t1[0], 2) ^ gf8Mul(t1[1], 10) ^ t1[2] ^ gf8Mul(t1[3], 8)) << 8 |
    (gf8Mul(t1[0], 10) ^ gf8Mul(t1[1], 2) ^ gf8Mul(t1[2], 8) ^ t1[3])
  ) >>> 0;
  assert.equal(clefiaF1(0, 0), expectedF1);
  return {
    sboxes: 2,
    entriesPerBox: 256,
    s0AB: vectorFile.samples.sboxes.S0.atAB,
    f0AtZero: hex8(expectedF0),
    f1AtZero: hex8(expectedF1),
    limit: 'Structural and reproducibility checks, not an assessment of S-box nonlinearity or cryptographic strength.'
  };
});

check('clefia-calc-roundtrip', () => {
  const vectors = vectorFile.rfc6114.vectors;
  const keys = vectors.map(vector => vector.key);
  const plaintexts = vectorFile.roundtrip.plaintexts;
  assert.equal(keys.length, 3);
  assert.equal(plaintexts.length, 8);
  const results = [];
  for (const key of keys) {
    const seen = new Set();
    for (const plaintext of plaintexts) {
      const ciphertext = clefiaEncryptBlock(plaintext, key);
      assert.equal(clefiaDecryptBlock(ciphertext, key), plaintext);
      assert(!seen.has(ciphertext), 'Duplicate ciphertext for one key');
      seen.add(ciphertext);
      results.push({keyBits: key.length * 4, plaintext, ciphertext});
    }
  }
  assert.equal(results.length, 24);
  const official = plaintexts[2];
  const byKey = keys.map(key => clefiaEncryptBlock(official, key));
  assert.equal(new Set(byKey).size, 3);
  const schedules = keys.map(key => JSON.stringify({
    whitening: words(clefiaExpandKey(key).whitening),
    roundKeys: words(clefiaExpandKey(key).roundKeys)
  }));
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
    'clefia-teaching.mjs',
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
