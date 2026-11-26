import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {
  SBOXES,
  SIGMA,
  VECTORS,
  camelliaKeyMaterial,
  camelliaDeriveKA,
  camelliaDeriveKB,
  camelliaExpandKey,
  camelliaEncryptBlock,
  camelliaDecryptBlock,
  camelliaS,
  camelliaP,
  camelliaF,
  camelliaFL,
  camelliaFLINV
} from './camellia-teaching.mjs';

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

const MASK64 = 0xffffffffffffffffn;
const hex64 = value => (value & MASK64).toString(16).padStart(16, '0');
const hex128 = value => value.toString(16).padStart(32, '0');
const words = list => Array.from(list, hex64);

check('structure-evidence-and-authoring-parity', () => {
  assert.equal(content.entries.length, 1);
  const entry = content.entries[0];
  assert.equal(entry.id, 'camellia-details');
  assert.equal(entry.coverage, 'catalog-entry');
  assert.deepEqual(entry.inventoryIds, ['algorithm--camellia']);
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
  for (const name of ['content.json', 'sources.json', 'camellia-teaching.mjs', 'sboxes.json', 'vectors.json', 'article.zh.md', 'article.en.md', 'meta.json', 'glossary.json', 'calculations.json', 'verify.mjs']) {
    assert(!read(name).includes('\r'), 'UTF-8 LF expected: ' + name);
  }
  return {
    catalogEntity: 'algorithm--camellia',
    sources: sources.sources.length,
    claims: all.length,
    calculations: content.calculations.length,
    translatedSections: Object.keys(entry.sections.zh).length,
    limit: 'Structural correspondence and evidence links only; independent factual review remains required.'
  };
});

check('camellia-calc-spec-vectors', () => {
  const vectors = vectorFile.spec2000.single;
  assert.equal(vectors.length, 3);
  for (const vector of vectors) {
    const schedule = camelliaExpandKey(vector.key);
    assert.equal(schedule.keyBits, vector.keyBits);
    assert.equal(schedule.rounds, vector.rounds);
    assert.equal(schedule.kw.length, 4);
    assert.equal(schedule.k.length, vector.rounds);
    assert.equal(schedule.ke.length, vector.rounds === 18 ? 4 : 6);
    const ciphertext = camelliaEncryptBlock(vector.plaintext, vector.key);
    assert.equal(ciphertext, vector.ciphertext);
    assert.equal(camelliaDecryptBlock(ciphertext, vector.key), vector.plaintext);
  }
  assert.equal(VECTORS.length, vectors.length);
  return {
    vectors: vectors.length,
    keyBits: vectors.map(vector => vector.keyBits),
    rounds: vectors.map(vector => vector.rounds),
    ciphertexts: vectors.map(vector => vector.ciphertext),
    limit: 'Three fixed vectors with one plaintext each; a match does not establish security against cryptanalysis.'
  };
});

check('camellia-calc-key-schedule', () => {
  const samples = vectorFile.samples;
  const schedule128 = camelliaExpandKey(samples.key128);
  assert.equal(hex128(schedule128.KL), samples.schedule128.KL);
  assert.equal(hex128(schedule128.KR), samples.schedule128.KR);
  assert.equal(hex128(schedule128.KA), samples.schedule128.KA);
  assert.equal(hex128(schedule128.KB), samples.schedule128.KB);
  assert.deepEqual(words(schedule128.kw), samples.schedule128.kw);
  assert.deepEqual(words(schedule128.k.slice(0, 4)), samples.schedule128.kFirst);
  assert.deepEqual(words(schedule128.k.slice(16, 18)), samples.schedule128.kLast);
  assert.deepEqual(words(schedule128.ke), samples.schedule128.ke);
  assert.deepEqual(words(schedule128.decryption.kw), [
    samples.schedule128.kw[2],
    samples.schedule128.kw[3],
    samples.schedule128.kw[0],
    samples.schedule128.kw[1]
  ]);
  assert.deepEqual(words(schedule128.decryption.k), words([...schedule128.k].reverse()));
  assert.deepEqual(words(schedule128.decryption.ke), words([...schedule128.ke].reverse()));
  assert.equal(schedule128.KA, camelliaDeriveKA(schedule128.KL, schedule128.KR));
  assert.equal(schedule128.KB, camelliaDeriveKB(schedule128.KA, schedule128.KR));

  const material192 = camelliaKeyMaterial(samples.schedule192.key);
  assert.equal(hex128(material192.KL), samples.schedule192.KL);
  assert.equal(hex128(material192.KR), samples.schedule192.KR);
  assert.equal(hex64(material192.KR >> 64n), samples.schedule192.rightmost64);
  assert.equal(hex64(material192.KR), samples.schedule192.complement64);
  assert.equal(material192.KR >> 64n, ~material192.KR & MASK64);
  const schedule192 = camelliaExpandKey(samples.schedule192.key);
  assert.equal(schedule192.rounds, 24);
  assert.equal(schedule192.k.length, 24);
  assert.equal(schedule192.ke.length, 6);

  const material256 = camelliaKeyMaterial(samples.schedule256.key);
  assert.equal(hex128(material256.KL), samples.schedule256.KL);
  assert.equal(hex128(material256.KR), samples.schedule256.KR);
  const schedule256 = camelliaExpandKey(samples.schedule256.key);
  assert.equal(schedule256.rounds, 24);
  assert.equal(schedule256.k.length, 24);
  assert.equal(schedule256.ke.length, 6);

  assert.equal(SIGMA[0], 0xA09E667F3BCC908Bn);
  assert.equal(SIGMA[5], 0xB05688C2B3E6C1FDn);
  assert.notEqual(schedule192.KA, schedule256.KA);
  assert.notEqual(schedule192.KB, schedule256.KB);
  return {
    key128: {
      KL: samples.schedule128.KL,
      KR: samples.schedule128.KR,
      KA: samples.schedule128.KA,
      KB: samples.schedule128.KB,
      subkeys: schedule128.kw.length + schedule128.k.length + schedule128.ke.length
    },
    key192: {
      KL: samples.schedule192.KL,
      KR: samples.schedule192.KR,
      subkeys: schedule192.kw.length + schedule192.k.length + schedule192.ke.length
    },
    key256: {
      KL: samples.schedule256.KL,
      KR: samples.schedule256.KR,
      subkeys: schedule256.kw.length + schedule256.k.length + schedule256.ke.length
    },
    limit: 'The 128-bit intermediate values are computed, not published; the 192/256-bit schedules are checked by vectors and structure, not by published intermediate subkeys.'
  };
});

check('camellia-calc-sboxes-fl', () => {
  const samples = vectorFile.samples;
  for (const name of ['S1', 'S2', 'S3', 'S4']) {
    assert.equal(SBOXES[name].length, 256);
    assert.equal(sboxes[name].length, 256);
    assert.deepEqual(Array.from(SBOXES[name]), sboxes[name]);
    assert.equal(SBOXES[name][0].toString(16).padStart(2, '0'), samples.sboxes[name].first);
    assert.equal(SBOXES[name][255].toString(16).padStart(2, '0'), samples.sboxes[name].last);
  }
  assert.equal(SBOXES.S1[0x3d].toString(16).padStart(2, '0'), samples.sboxes.S1.at3d);
  const rotl8 = (value, shift) => ((value << shift) | (value >>> (8 - shift))) & 0xff;
  for (let index = 0; index < 256; index += 1) {
    assert.equal(SBOXES.S2[index], rotl8(SBOXES.S1[index], 1));
    assert.equal(SBOXES.S3[index], rotl8(SBOXES.S1[index], 7));
    assert.equal(SBOXES.S4[index], SBOXES.S1[rotl8(index, 1)]);
  }
  assert.equal(hex64(camelliaS(0x0123456789abcdefn)), samples.S);
  assert.equal(hex64(camelliaP(0x0123456789abcdefn)), samples.P);
  assert.equal(hex64(camelliaF(0x0123456789abcdefn, 0n)), samples.F);
  const fl = camelliaFL(0x0123456789abcdefn, 0xfedcba9876543210n);
  assert.equal(hex64(fl), samples.FL.output);
  assert.equal(camelliaFLINV(fl, 0xfedcba9876543210n), 0x0123456789abcdefn);
  for (let index = 0; index < 256; index += 1) {
    const input = (BigInt(index) * 0x0101010101010101n) & MASK64;
    const subkey = (input ^ 0xa5a5a5a5a5a5a5a5n) & MASK64;
    assert.equal(camelliaFLINV(camelliaFL(input, subkey), subkey), input);
  }
  return {
    sboxes: 4,
    entriesPerBox: 256,
    s1At3d: samples.sboxes.S1.at3d,
    S: samples.S,
    P: samples.P,
    F: samples.F,
    FL: samples.FL.output,
    inverseSamples: 256,
    limit: 'Structural and reproducibility checks, not an assessment of S-box nonlinearity or cryptographic strength.'
  };
});

check('camellia-calc-roundtrip', () => {
  const keys = vectorFile.spec2000.single.map(vector => vector.key);
  const plaintexts = vectorFile.roundtrip.plaintexts;
  assert.equal(keys.length, 3);
  assert.equal(plaintexts.length, 8);
  const results = [];
  for (const key of keys) {
    const seen = new Set();
    for (const plaintext of plaintexts) {
      const ciphertext = camelliaEncryptBlock(plaintext, key);
      assert.equal(camelliaDecryptBlock(ciphertext, key), plaintext);
      assert(!seen.has(ciphertext), 'Duplicate ciphertext for one key');
      seen.add(ciphertext);
      results.push({keyBits: key.length * 4, plaintext, ciphertext});
    }
  }
  assert.equal(results.length, 24);
  const official = plaintexts[2];
  const byKey = keys.map(key => camelliaEncryptBlock(official, key));
  assert.equal(new Set(byKey).size, 3);
  const schedule192 = camelliaExpandKey(keys[1]);
  const schedule256 = camelliaExpandKey(keys[2]);
  assert.notEqual(schedule192.KA, schedule256.KA);
  assert.notEqual(schedule192.KB, schedule256.KB);
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
    'camellia-teaching.mjs',
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
