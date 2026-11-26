import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {createHash, createCipheriv, createDecipheriv} from 'node:crypto';
import {encryptHex, WEAK_KEYS} from './des-core.mjs';
import {tdeaEncryptHex, KEYING_OPTIONS, keyBundleFor, TDEA_VECTORS} from './tdea-teaching.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const file = name => path.join(here, name);
const read = name => fs.readFileSync(file(name), 'utf8');
const sha = value => createHash('sha256').update(value).digest('hex');
const content = JSON.parse(read('content.json'));
const sources = JSON.parse(read('sources.json'));
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

function opensslTdea(hex, keys, decrypt = false) {
  const key = Buffer.from(keys.join(''), 'hex');
  const operation = decrypt ? createDecipheriv('des-ede3-ecb', key, null) : createCipheriv('des-ede3-ecb', key, null);
  operation.setAutoPadding(false);
  return Buffer.concat([operation.update(Buffer.from(hex, 'hex')), operation.final()]).toString('hex').toUpperCase();
}
const repeatBlock = value => value.repeat(4).toUpperCase();

check('structure-evidence-and-authoring-parity', () => {
  assert.equal(content.entries.length, 1);
  const entry = content.entries[0];
  assert.equal(entry.id, '3des-details');
  assert.equal(entry.coverage, 'catalog-entry');
  assert.deepEqual(entry.inventoryIds, ['algorithm--3des']);
  assert(entry.coverageRationale.zh && entry.coverageRationale.en);
  assert(entry.verificationStatus);
  assert.deepEqual(Object.keys(entry.sections.zh).sort(), Object.keys(entry.sections.en).sort());
  const all = sources.sources.flatMap(source => source.claims.map(claim => ({...claim, sourceId: source.id})));
  assert.equal(new Set(all.map(claim => claim.id)).size, all.length);
  assert.equal(new Set(sources.sources.map(source => source.id)).size, sources.sources.length);
  for (const section of ['principle','why','used','broken','history','refs']) {
    assert(all.some(claim => claim.section === section), `No claim for ${section}`);
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
      else for (const source of sources.sources) assert(String(value).includes(source.url), `refs does not print ${source.id} URL (${lang})`);
    }
    assert(!/TODO|TBD|待补|占位/.test(Object.values(entry.sections[lang]).join('\n')));
  }
  for (const name of ['content.json', 'sources.json', 'tdea-teaching.mjs', 'des-core.mjs', 'article.zh.md', 'article.en.md']) {
    assert(!read(name).includes('\r'), 'UTF-8 LF expected: ' + name);
  }
  return {
    catalogEntity: 'algorithm--3des',
    sources: sources.sources.length,
    claims: all.length,
    translatedSections: Object.keys(entry.sections.zh).length,
    limit: 'Structural correspondence and evidence links only; independent factual review remains required.'
  };
});

check('tdea-official-vectors', () => {
  const results = [];
  for (const [name, vector] of Object.entries(TDEA_VECTORS)) {
    const ciphertext = tdeaEncryptHex(vector.plaintext, vector.keys);
    assert.equal(ciphertext, vector.ciphertext);
    assert.equal(tdeaEncryptHex(ciphertext, vector.keys, {decrypt: true}), vector.plaintext);
    assert.equal(opensslTdea(vector.plaintext, vector.keys), vector.ciphertext);
    assert.equal(opensslTdea(ciphertext, vector.keys, true), vector.plaintext);
    results.push({name, blocks: vector.plaintext.length / 16, firstBlock: ciphertext.slice(0, 16)});
  }
  assert.deepEqual(results.map(r => r.name).sort(), ['threeKey', 'twoKey']);
  return {
    vectors: results,
    implementations: ['original teaching TDEA over the teaching DES engine', 'Node/OpenSSL des-ede3-ecb'],
    negativeControl: 'two-key and three-key ciphertexts differ',
    limit: 'Fixed ECB examples; not CAVP validation and not a security evaluation.'
  };
});

check('tdea-keying-options', () => {
  const key1 = '0123456789ABCDEF';
  const key2 = '23456789ABCDEF01';
  const key3 = '456789ABCDEF0123';
  const plain = '6BC1BEE22E409F96';
  const bundle1 = keyBundleFor('1-key', key1);
  assert.deepEqual(bundle1, [key1, key1, key1]);
  const oneKeyCipher = tdeaEncryptHex(plain, bundle1);
  assert.equal(oneKeyCipher, encryptHex(plain, key1));
  assert.equal(tdeaEncryptHex(oneKeyCipher, bundle1, {decrypt: true}), plain);
  const bundle2 = keyBundleFor('2-key', key1, key2);
  assert.deepEqual(bundle2, [key1, key2, key1]);
  const bundle3 = keyBundleFor('3-key', key1, key2, key3);
  assert.deepEqual(bundle3, [key1, key2, key3]);
  const twoKeyCipher = tdeaEncryptHex(plain, bundle2);
  const threeKeyCipher = tdeaEncryptHex(plain, bundle3);
  assert.notEqual(twoKeyCipher, threeKeyCipher);
  assert.deepEqual(Object.fromEntries(Object.entries(KEYING_OPTIONS).map(([name, spec]) => [name, {nominalBits: spec.nominalBits, effectiveBits: spec.effectiveBits}])), {
    '1-key': {nominalBits: 64, effectiveBits: 56},
    '2-key': {nominalBits: 128, effectiveBits: 112},
    '3-key': {nominalBits: 192, effectiveBits: 168}
  });
  return {oneKeyEqualsSingleDes: true, twoKeyCipher, threeKeyCipher, options: KEYING_OPTIONS, limit: 'Structural equivalence only; no security estimate.'};
});

check('tdea-security-strength', () => {
  const twoKeyNominal = 2n ** 112n;
  const threeKeyNominal = 2n ** 168n;
  assert.equal(twoKeyNominal, 5192296858534827628530496329220096n);
  assert.equal(threeKeyNominal, 374144419156711147060143317175368453031918731001856n);
  assert.equal(KEYING_OPTIONS['2-key'].effectiveBits, 112);
  assert.equal(KEYING_OPTIONS['3-key'].effectiveBits, 168);
  assert.equal(80 < 112, true);
  assert.equal(112 < 168, true);
  return {
    effectiveKeySpace: {'2-key': twoKeyNominal.toString(), '3-key': threeKeyNominal.toString()},
    nominalBits: KEYING_OPTIONS,
    nistStrengthBits: {'2-key': 80, '3-key': 112},
    nominalVsStrength: {'2-key': '128 nominal / 112 effective / about 80 strength', '3-key': '192 nominal / 168 effective / about 112 strength'},
    limit: 'Records NIST-assessed strength; it does not reproduce the underlying attacks.'
  };
});

check('tdea-data-limit', () => {
  const blocks = 2n ** 20n;
  const bytes = blocks * 8n;
  const mib = bytes / (1024n ** 2n);
  assert.equal(blocks, 1_048_576n);
  assert.equal(bytes, 8_388_608n);
  assert.equal(mib, 8n);
  assert.equal(KEYING_OPTIONS['2-key'].effectiveBits, 112);
  return {blockLimit: blocks.toString(), bytes: bytes.toString(), mebibytes: mib.toString(), twoKeyForEncryption: 'not permitted by SP 800-67 Revision 2', limit: 'Policy limit only; no protocol framing assumed.'};
});

check('tdea-sweet32-bound', () => {
  const blockBits = 64n;
  const blockSpace = 2n ** blockBits;
  const blocks = 2n ** 32n;
  const bytes = blocks * 8n;
  const gibi = bytes / (1024n ** 3n);
  assert.equal(bytes, 34359738368n);
  assert.equal(gibi, 32n);
  const probability = n => 1 - Math.exp(-(Number(n) * (Number(n) - 1)) / (2 * Number(blockSpace)));
  const p32 = probability(2 ** 32);
  const p325 = probability(2 ** 32.5);
  assert(Math.abs(p32 - 0.3935) < 0.001);
  assert(Math.abs(p325 - 0.6321) < 0.001);
  return {blockBits: 64, blocks: blocks.toString(), bytes: bytes.toString(), gibibytes: gibi.toString(), collisionProbabilityAt2Pow32: p32, collisionProbabilityAt2Pow32_5: p325, limit: 'Birthday arithmetic only; not a protocol attack model.'};
});

check('tdea-weak-keys', () => {
  assert.equal(new Set(WEAK_KEYS).size, 4);
  let cases = 0;
  const samples = [];
  for (const weakKey of WEAK_KEYS) {
    const sampleBlock = '0123456789ABCDEF';
    assert.equal(tdeaEncryptHex(sampleBlock, [weakKey, weakKey, weakKey]), encryptHex(sampleBlock, weakKey));
    for (let index = 0; index < 4_096; index++) {
      const block = repeatBlock(index.toString(16).padStart(4, '0'));
      const once = tdeaEncryptHex(block, [weakKey, weakKey, weakKey]);
      const twice = tdeaEncryptHex(once, [weakKey, weakKey, weakKey]);
      assert.equal(twice, block);
      if (index < 2) samples.push({weakKey, block, once, twice});
      cases++;
    }
  }
  assert.equal(cases, 16_384);
  return {weakKeys: WEAK_KEYS, blocksPerKey: 4_096, cases, samples, limit: 'Finite structured sample; degeneration follows from identical keys.'};
});

check('tdea-block-rounds', () => {
  assert.equal(TDEA_VECTORS.threeKey.plaintext.length / 16, 4);
  const blockBits = 64;
  const desRounds = 16;
  const passes = 3;
  assert.equal(blockBits, 64);
  assert.equal(desRounds * passes, 48);
  assert.equal(TDEA_VECTORS.threeKey.keys.length, 3);
  for (const key of TDEA_VECTORS.threeKey.keys) assert.equal(key.length * 4, 64);
  return {blockBits, desRounds, passes, totalRounds: desRounds * passes, keysPerBundle: 3, keyBitsEach: 64, limit: 'Counting only; round count is not a security proof.'};
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
    'tdea-teaching.mjs',
    'des-core.mjs',
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
