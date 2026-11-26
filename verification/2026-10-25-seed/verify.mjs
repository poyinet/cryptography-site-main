import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {
  SBOXES,
  KC,
  VECTORS,
  seedG,
  seedF,
  seedExpandKey,
  seedEncryptBlock,
  seedDecryptBlock,
  seedEncryptRounds
} from './seed-teaching.mjs';

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
const hex64 = (high, low) => hex8(high) + hex8(low);
const MASK32 = 0xffffffffn;

check('structure-evidence-and-authoring-parity', () => {
  assert.equal(content.entries.length, 1);
  const entry = content.entries[0];
  assert.equal(entry.id, 'seed-details');
  assert.equal(entry.coverage, 'catalog-entry');
  assert.deepEqual(entry.inventoryIds, ['seed']);
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
  for (const name of ['content.json', 'sources.json', 'seed-teaching.mjs', 'sboxes.json', 'vectors.json', 'article.zh.md', 'article.en.md', 'meta.json', 'glossary.json', 'calculations.json', 'verify.mjs']) {
    assert(!read(name).includes('\r'), 'UTF-8 LF expected: ' + name);
  }
  return {
    catalogEntity: 'seed',
    sources: sources.sources.length,
    claims: all.length,
    calculations: content.calculations.length,
    translatedSections: Object.keys(entry.sections.zh).length,
    limit: 'Structural correspondence and evidence links only; independent factual review remains required.'
  };
});

check('seed-calc-rfc-vectors', () => {
  const vectors = vectorFile.rfc4269.vectors;
  assert.equal(vectors.length, 4);
  for (const vector of vectors) {
    const ciphertext = seedEncryptBlock(vector.plaintext, vector.key);
    assert.equal(ciphertext, vector.ciphertext);
    assert.equal(seedDecryptBlock(ciphertext, vector.key), vector.plaintext);
  }
  const rows = vectorFile.rfc4269.rfcRowsB1;
  assert.equal(rows.length, 16);
  const observed = seedEncryptRounds(vectors[0].plaintext, vectors[0].key);
  const plaintext = BigInt('0x' + vectors[0].plaintext);
  let before = {
    l0: Number((plaintext >> 96n) & 0xffffffffn) >>> 0,
    l1: Number((plaintext >> 64n) & 0xffffffffn) >>> 0,
    r0: Number((plaintext >> 32n) & 0xffffffffn) >>> 0,
    r1: Number(plaintext & 0xffffffffn) >>> 0
  };
  for (let index = 0; index < 16; index += 1) {
    const expected = rows[index];
    const actual = observed[index];
    assert.equal(actual.round, expected.round);
    assert.equal(hex8(actual.ki0), expected.ki0);
    assert.equal(hex8(actual.ki1), expected.ki1);
    assert.equal(hex8(before.l0), expected.l0);
    assert.equal(hex8(before.l1), expected.l1);
    assert.equal(hex8(before.r0), expected.r0);
    assert.equal(hex8(before.r1), expected.r1);
    if (index < 15) {
      const next = rows[index + 1];
      assert.equal(hex8(actual.l0), next.l0);
      assert.equal(hex8(actual.l1), next.l1);
      assert.equal(hex8(actual.r0), next.r0);
      assert.equal(hex8(actual.r1), next.r1);
    }
    before = {l0: actual.l0, l1: actual.l1, r0: actual.r0, r1: actual.r1};
  }
  const ciphertext = BigInt('0x' + vectors[0].ciphertext);
  assert.equal(hex8(observed[15].l0), (ciphertext >> 96n).toString(16).padStart(8, '0'));
  assert.equal(hex8(observed[15].l1), ((ciphertext >> 64n) & 0xffffffffn).toString(16).padStart(8, '0'));
  assert.equal(hex8(observed[15].r0), ((ciphertext >> 32n) & 0xffffffffn).toString(16).padStart(8, '0'));
  assert.equal(hex8(observed[15].r1), (ciphertext & 0xffffffffn).toString(16).padStart(8, '0'));
  assert.equal(VECTORS.length, vectors.length);
  return {
    vectors: vectors.length,
    ciphertexts: vectors.map(vector => vector.ciphertext),
    publishedRounds: rows.length,
    firstRow: rows[0],
    lastRow: rows.at(-1),
    limit: 'Four fixed vectors and one published round table; a match does not establish security against cryptanalysis.'
  };
});

check('seed-calc-key-schedule', () => {
  const vectors = vectorFile.rfc4269.vectors;
  const rows = vectorFile.rfc4269.rfcRowsB1;
  const schedule = seedExpandKey(vectors[0].key);
  assert.equal(schedule.length, 16);
  for (let index = 0; index < 16; index += 1) {
    assert.equal(hex8(schedule[index].ki0), rows[index].ki0);
    assert.equal(hex8(schedule[index].ki1), rows[index].ki1);
  }
  assert.equal(hex64(schedule[0].ki0, schedule[0].ki1), '7c8f8c7ec737a22c');
  assert.equal(hex64(schedule[1].ki0, schedule[1].ki1), 'ff276cdba7ca684a');
  assert.equal(hex64(schedule[15].ki0, schedule[15].ki1), '7189115098b255b0');
  const reversed = [...schedule].reverse();
  assert.equal(hex64(reversed[0].ki0, reversed[0].ki1), '7189115098b255b0');
  assert.equal(hex64(reversed[15].ki0, reversed[15].ki1), '7c8f8c7ec737a22c');
  assert.equal(KC.length, 16);
  assert.equal(KC[0], 0x9E3779B9);
  assert.equal(KC[15], 0xBCDCCF1B);
  const otherSchedule = seedExpandKey(vectors[2].key);
  assert.notEqual(hex64(otherSchedule[0].ki0, otherSchedule[0].ki1), hex64(schedule[0].ki0, schedule[0].ki1));
  return {
    key: vectors[0].key,
    first: hex64(schedule[0].ki0, schedule[0].ki1),
    last: hex64(schedule[15].ki0, schedule[15].ki1),
    rounds: schedule.length,
    limit: 'Only the all-zero key has published per-round subkeys; other keys are checked indirectly by the remaining vectors.'
  };
});

check('seed-calc-sboxes-g', () => {
  const samples = vectorFile.samples;
  for (const name of ['S0', 'S1']) {
    assert.equal(SBOXES[name].length, 256);
    assert.equal(sboxes[name].length, 256);
    assert.deepEqual(Array.from(SBOXES[name]), sboxes[name]);
  }
  const m = [0xFC, 0xF3, 0xCF, 0x3F];
  const derive = {
    SS0: value => ((value & m[3]) << 24 | (value & m[2]) << 16 | (value & m[1]) << 8 | (value & m[0])) >>> 0,
    SS1: value => ((value & m[0]) << 24 | (value & m[3]) << 16 | (value & m[2]) << 8 | (value & m[1])) >>> 0,
    SS2: value => ((value & m[1]) << 24 | (value & m[0]) << 16 | (value & m[3]) << 8 | (value & m[2])) >>> 0,
    SS3: value => ((value & m[2]) << 24 | (value & m[1]) << 16 | (value & m[0]) << 8 | (value & m[3])) >>> 0
  };
  const base = {SS0: sboxes.S0, SS1: sboxes.S1, SS2: sboxes.S0, SS3: sboxes.S1};
  for (const name of ['SS0', 'SS1', 'SS2', 'SS3']) {
    assert.equal(SBOXES[name].length, 256);
    assert.equal(sboxes[name].length, 256);
    for (let index = 0; index < 256; index += 1) {
      const derived = derive[name](base[name][index]);
      assert.equal(derived, sboxes[name][index]);
      assert.equal(derived, SBOXES[name][index]);
    }
  }
  assert.equal(sboxes.S0[0].toString(16).padStart(2, '0'), samples.sboxes.S0.first);
  assert.equal(sboxes.S1[0].toString(16).padStart(2, '0'), samples.sboxes.S1.first);
  assert.equal(sboxes.S0[255].toString(16).padStart(2, '0'), samples.sboxes.S0.last);
  assert.equal(sboxes.S1[255].toString(16).padStart(2, '0'), samples.sboxes.S1.last);
  assert.equal(hex8(seedG(0)), samples.G0);
  assert.equal(hex8(seedG(0x01234567)), samples.G01234567);
  const first = seedExpandKey(vectorFile.rfc4269.vectors[0].key)[0];
  const f = seedF(first.ki0, first.ki1, 0x08090a0b, 0x0c0d0e0f);
  assert.equal(hex64(f.r0, f.r1), samples.F1);
  for (const name of ['SS0', 'SS1', 'SS2', 'SS3']) {
    assert.equal(sboxes[name][0].toString(16).padStart(8, '0'), samples.sboxes[name].first);
    assert.equal(sboxes[name][255].toString(16).padStart(8, '0'), samples.sboxes[name].last);
  }
  return {
    sboxes: 2,
    entriesPerBox: 256,
    extendedSboxes: 4,
    G0: samples.G0,
    G01234567: samples.G01234567,
    F1: samples.F1,
    limit: 'Structural and reproducibility checks, not an assessment of S-box nonlinearity or cryptographic strength.'
  };
});

check('seed-calc-roundtrip', () => {
  const vectors = vectorFile.rfc4269.vectors;
  const keys = [vectors[0].key, vectors[2].key, vectors[3].key];
  const plaintexts = vectorFile.roundtrip.plaintexts;
  assert.equal(keys.length, 3);
  assert.equal(plaintexts.length, 8);
  const results = [];
  for (const key of keys) {
    const seen = new Set();
    for (const plaintext of plaintexts) {
      const ciphertext = seedEncryptBlock(plaintext, key);
      assert.equal(seedDecryptBlock(ciphertext, key), plaintext);
      assert(!seen.has(ciphertext), 'Duplicate ciphertext for one key');
      seen.add(ciphertext);
      results.push({key, plaintext, ciphertext});
    }
  }
  assert.equal(results.length, 24);
  const official = plaintexts[2];
  const byKey = keys.map(key => seedEncryptBlock(official, key));
  assert.equal(new Set(byKey).size, 3);
  const schedules = keys.map(key => JSON.stringify(seedExpandKey(key)));
  assert.equal(new Set(schedules).size, 3);
  assert.equal(seedExpandKey(keys[0]).length, 16);
  assert.equal(seedExpandKey(keys[1]).length, 16);
  return {
    roundTrips: results.length,
    keys: keys.length,
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
    'seed-teaching.mjs',
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
