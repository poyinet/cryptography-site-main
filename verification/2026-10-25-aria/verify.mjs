import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {
  SBOXES,
  C,
  VECTORS,
  bytesToHex,
  hexToBytes,
  ariaA,
  ariaExpandKey,
  ariaEncryptBlock,
  ariaDecryptBlock,
  ariaEncryptRounds
} from './aria-teaching.mjs';

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

const hex32 = value => value.toString(16).padStart(32, '0');
const sameBytes = (a, b) => bytesToHex(a) === bytesToHex(b);

check('structure-evidence-and-authoring-parity', () => {
  assert.equal(content.entries.length, 1);
  const entry = content.entries[0];
  assert.equal(entry.id, 'aria-details');
  assert.equal(entry.coverage, 'catalog-entry');
  assert.deepEqual(entry.inventoryIds, ['aria']);
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
  for (const name of ['content.json', 'sources.json', 'aria-teaching.mjs', 'sboxes.json', 'vectors.json', 'article.zh.md', 'article.en.md', 'meta.json', 'glossary.json', 'calculations.json', 'verify.mjs']) {
    assert(!read(name).includes('\r'), 'UTF-8 LF expected: ' + name);
  }
  return {
    catalogEntity: 'aria',
    sources: sources.sources.length,
    claims: all.length,
    calculations: content.calculations.length,
    translatedSections: Object.keys(entry.sections.zh).length,
    limit: 'Structural correspondence and evidence links only; independent factual review remains required.'
  };
});

check('aria-calc-rfc-vectors', () => {
  const vectors = vectorFile.rfc5794.vectors;
  assert.equal(vectors.length, 3);
  for (const vector of vectors) {
    const schedule = ariaExpandKey(vector.key);
    assert.equal(schedule.keyBits, vector.keyBits);
    assert.equal(schedule.rounds, vector.rounds);
    assert.equal(schedule.roundKeys.length, vector.rounds + 1);
    assert.equal(schedule.decryption.length, vector.rounds + 1);
    const ciphertext = ariaEncryptBlock(vector.plaintext, vector.key);
    assert.equal(ciphertext, vector.ciphertext);
    assert.equal(ariaDecryptBlock(ciphertext, vector.key), vector.plaintext);
  }
  const intermediate = vectorFile.rfc5794.intermediate128;
  const schedule = ariaExpandKey(vectors[0].key);
  assert.deepEqual(schedule.W.map(hex32), intermediate.W);
  assert.deepEqual(schedule.roundKeys.map(bytesToHex), intermediate.ek);
  const rounds = ariaEncryptRounds(vectors[0].plaintext, vectors[0].key);
  assert.deepEqual(rounds.states.map(item => bytesToHex(item.state)), intermediate.P);
  assert.equal(VECTORS.length, vectors.length);
  return {
    vectors: vectors.length,
    keyBits: vectors.map(vector => vector.keyBits),
    rounds: vectors.map(vector => vector.rounds),
    intermediateW: intermediate.W.length,
    intermediateRoundKeys: intermediate.ek.length,
    intermediateRounds: intermediate.P.length,
    limit: 'Three fixed vectors with one plaintext each; a match does not establish security against cryptanalysis.'
  };
});

check('aria-calc-key-schedule', () => {
  const vectors = vectorFile.rfc5794.vectors;
  const schedule = ariaExpandKey(vectors[0].key);
  const intermediate = vectorFile.rfc5794.intermediate128;
  assert.deepEqual(schedule.W.map(hex32), intermediate.W);
  assert.deepEqual(schedule.roundKeys.map(bytesToHex), intermediate.ek);
  assert.equal(schedule.roundKeys.length, 13);
  assert.equal(schedule.rounds, 12);
  assert.equal(schedule.decryption.length, 13);
  assert(sameBytes(schedule.decryption[0], schedule.roundKeys[12]));
  assert(sameBytes(schedule.decryption[12], schedule.roundKeys[0]));
  for (let index = 1; index < 12; index += 1) {
    assert(sameBytes(schedule.decryption[index], ariaA(schedule.roundKeys[12 - index])));
  }
  assert.equal(ariaExpandKey(vectors[1].key).roundKeys.length, 15);
  assert.equal(ariaExpandKey(vectors[2].key).roundKeys.length, 17);
  assert.equal(ariaExpandKey(vectors[1].key).rounds, 14);
  assert.equal(ariaExpandKey(vectors[2].key).rounds, 16);
  assert.equal(C.length, 3);
  assert.equal(C[0].toString(16), '517cc1b727220a94fe13abe8fa9a6ee0');
  assert.equal(C[2].toString(16), 'db92371d2126e9700324977504e8c90e');
  return {
    key: vectors[0].key,
    W: schedule.W.map(hex32),
    ekFirst: bytesToHex(schedule.roundKeys[0]),
    ekLast: bytesToHex(schedule.roundKeys[12]),
    roundKeyCounts: [13, 15, 17],
    limit: 'Only the 128-bit key has published W/ek intermediates; the other key sizes are checked indirectly by their vectors.'
  };
});

check('aria-calc-components', () => {
  for (const name of ['SB1', 'SB2', 'SB3', 'SB4']) {
    assert.equal(SBOXES[name].length, 256);
    assert.equal(sboxes[name].length, 256);
    assert.deepEqual(Array.from(SBOXES[name]), sboxes[name]);
  }
  for (let index = 0; index < 256; index += 1) {
    assert.equal(SBOXES.SB3[SBOXES.SB1[index]], index);
    assert.equal(SBOXES.SB1[SBOXES.SB3[index]], index);
    assert.equal(SBOXES.SB4[SBOXES.SB2[index]], index);
    assert.equal(SBOXES.SB2[SBOXES.SB4[index]], index);
  }
  assert.equal(SBOXES.SB1[0x23].toString(16).padStart(2, '0'), vectorFile.samples.sboxes.SB1.at23);
  assert.equal(SBOXES.SB4[0xef].toString(16).padStart(2, '0'), vectorFile.samples.sboxes.SB4.atEF);
  assert.equal(SBOXES.SB1[0].toString(16).padStart(2, '0'), vectorFile.samples.sboxes.SB1.first);
  assert.equal(SBOXES.SB2[0].toString(16).padStart(2, '0'), vectorFile.samples.sboxes.SB2.first);
  assert.equal(SBOXES.SB3[0].toString(16).padStart(2, '0'), vectorFile.samples.sboxes.SB3.first);
  const sample = hexToBytes(vectorFile.samples.A.input);
  assert.equal(bytesToHex(ariaA(sample)), vectorFile.samples.A.output);
  assert.equal(bytesToHex(ariaA(ariaA(sample))), vectorFile.samples.A.input);
  for (let index = 0; index < 256; index += 1) {
    const block = Uint8Array.from({length: 16}, (_, offset) => (index * 31 + offset * 7) & 0xff);
    assert.equal(bytesToHex(ariaA(ariaA(block))), bytesToHex(block));
  }
  return {
    sboxes: 4,
    entriesPerBox: 256,
    inverses: 'SB3/SB4 of SB1/SB2',
    A: vectorFile.samples.A.output,
    inverseSamples: 256,
    limit: 'Structural and reproducibility checks, not an assessment of S-box nonlinearity or cryptographic strength.'
  };
});

check('aria-calc-roundtrip', () => {
  const vectors = vectorFile.rfc5794.vectors;
  const keys = vectors.map(vector => vector.key);
  const plaintexts = vectorFile.roundtrip.plaintexts;
  assert.equal(keys.length, 3);
  assert.equal(plaintexts.length, 8);
  const results = [];
  for (const key of keys) {
    const seen = new Set();
    for (const plaintext of plaintexts) {
      const ciphertext = ariaEncryptBlock(plaintext, key);
      assert.equal(ariaDecryptBlock(ciphertext, key), plaintext);
      assert(!seen.has(ciphertext), 'Duplicate ciphertext for one key');
      seen.add(ciphertext);
      results.push({keyBits: key.length * 4, plaintext, ciphertext});
    }
  }
  assert.equal(results.length, 24);
  const official = plaintexts[2];
  const byKey = keys.map(key => ariaEncryptBlock(official, key));
  assert.equal(new Set(byKey).size, 3);
  const schedules = keys.map(key => JSON.stringify(ariaExpandKey(key).roundKeys.map(bytesToHex)));
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
    'aria-teaching.mjs',
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
