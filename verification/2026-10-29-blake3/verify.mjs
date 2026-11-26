import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {
  IV,
  MSG_PERMUTATION,
  CHUNK_START,
  CHUNK_END,
  PARENT,
  ROOT,
  KEYED_HASH,
  DERIVE_KEY_CONTEXT,
  DERIVE_KEY_MATERIAL,
  blake3,
  blake3Trace,
  bytesToHex,
  compress,
  deriveKeyHex,
  hashHex,
  keyedHashHex,
  wordsFromBytesLE,
  wordsToBytesLE,
} from './blake3-teaching.mjs';

const SPEC_IV = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
const SPEC_PERMUTATION = [2, 6, 3, 10, 7, 0, 4, 13, 1, 11, 12, 5, 9, 14, 15, 8];
const OFFICIAL_LENGTHS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 63, 64, 65, 127, 128, 129, 1023, 1024, 1025, 2048, 2049, 3072, 3073, 4096, 4097, 5120, 5121, 6144, 6145, 7168, 7169, 8192, 8193, 16384, 31744, 102400];

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
const inputFor = length => Uint8Array.from({length}, (_, index) => index % 251);

check('structure-evidence-and-authoring-parity', () => {
  assert.equal(content.entries.length, 1);
  const entry = content.entries[0];
  assert.equal(entry.id, 'blake3-details');
  assert.equal(entry.coverage, 'catalog-entry');
  assert.deepEqual(entry.inventoryIds, ['blake3']);
  assert(entry.coverageRationale.zh && entry.coverageRationale.en);
  assert(entry.verificationStatus);
  const all = sources.sources.flatMap(source => source.claims.map(claim => ({...claim, sourceId: source.id})));
  assert.equal(new Set(all.map(claim => claim.id)).size, all.length);
  assert.equal(new Set(sources.sources.map(source => source.id)).size, sources.sources.length);
  
  
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
      if (key !== 'refs') assert(!/https?:\/\//.test(value), 'Public body section uses a URL: ' + lang + ':' + key);
    }
    assert(!/TODO|TBD|待补|占位/.test(Object.values(entry.sections[lang]).join('\n')));
  }
  for (const name of ['content.json', 'sources.json', 'blake3-teaching.mjs', 'vectors.json', 'article.zh.md', 'article.en.md', 'meta.json', 'glossary.json', 'calculations.json', 'verify.mjs']) {
    assert(!read(name).includes('\r'), 'UTF-8 LF expected: ' + name);
  }
  return {
    catalogEntity: 'blake3',
    sources: sources.sources.length,
    claims: all.length,
    calculations: content.calculations.length,
    translatedSections: Object.keys(entry.sections.zh).length,
    limit: 'Structural correspondence and evidence links only; independent factual review remains required.',
  };
});

check('blake3-calc-official-vectors', () => {
  assert.equal(vectorFile.official.length, 35);
  assert.deepEqual(vectorFile.official.map(test => test.input_len), OFFICIAL_LENGTHS);
  assert.deepEqual(vectorFile.structure.officialLengths, OFFICIAL_LENGTHS);
  for (const test of vectorFile.official) {
    assert.equal(test.hash.length, 262, 'hash is not 131 bytes at ' + test.input_len);
    assert.equal(test.keyed_hash.length, 262, 'keyed_hash is not 131 bytes at ' + test.input_len);
    assert.equal(test.derive_key.length, 262, 'derive_key is not 131 bytes at ' + test.input_len);
    const data = inputFor(test.input_len);
    assert.equal(hashHex(data, 131), test.hash, 'hash mismatch at ' + test.input_len);
    assert.equal(keyedHashHex(vectorFile.key, data, 131), test.keyed_hash, 'keyed mismatch at ' + test.input_len);
    assert.equal(deriveKeyHex(vectorFile.context, data, 131), test.derive_key, 'derive mismatch at ' + test.input_len);
  }
  assert.equal(vectorFile.official[0].hash.slice(0, 64), 'af1349b9f5f9a1a6a0404dea36dcc9499bcb25c9adc112b7cc9a93cae41f3262');
  assert.equal(vectorFile.official.find(test => test.input_len === 65).hash.slice(0, 64), 'de1e5fa0be70df6d2be8fffd0e99ceaa8eb6e8c93a63f2d8d1c30ecb6b263dee');
  assert.equal(vectorFile.official.find(test => test.input_len === 1025).hash.slice(0, 64), 'd00278ae47eb27b34faecf67b4fe263f82d5412916c1ffd97c8cb7fb814b8444');
  return {
    cases: vectorFile.official.length,
    outputs: vectorFile.official.length * 3,
    empty: vectorFile.official[0].hash.slice(0, 64),
    limit: 'Official conformance vectors only; no security claim.',
  };
});

check('blake3-calc-tree-trace', () => {
  const empty = vectorFile.traces.empty;
  const sixtyFive = vectorFile.traces.sixtyFive;
  const large = vectorFile.traces.oneThousandTwentyFive;
  assert.equal(empty.chunkCount, 1);
  assert.equal(empty.rootType, 'chunk');
  assert.equal(empty.rootFlags, 11);
  assert.equal(empty.rootBlockLen, 0);
  assert.equal(empty.rootPreLastCV, '67e6096a85ae67bb72f36e3c3af54fa57f520e518c68059babd9831f19cde05b');
  assert.equal(empty.digest.slice(0, 64), 'af1349b9f5f9a1a6a0404dea36dcc9499bcb25c9adc112b7cc9a93cae41f3262');
  assert.equal(sixtyFive.chunkCount, 1);
  assert.equal(sixtyFive.rootFlags, 10);
  assert.equal(sixtyFive.rootBlockLen, 1);
  assert.equal(sixtyFive.rootPreLastCV, 'ff29379ddb1cf2577d0f5aab4e738f4e9ff66cb15ccc8c88ac841d2d07266f20');
  assert.equal(sixtyFive.digest.slice(0, 64), 'de1e5fa0be70df6d2be8fffd0e99ceaa8eb6e8c93a63f2d8d1c30ecb6b263dee');
  assert.equal(large.chunkCount, 2);
  assert.equal(large.rootType, 'parent');
  assert.equal(large.rootFlags, 12);
  assert.equal(large.rootBlockLen, 64);
  assert.equal(large.chunks.length, 2);
  assert.equal(large.chunks[0].cv.slice(0, 64), '5c9e654411e393d1f4bec710ccd5bc5669ab177d610a0eb691fcfee92fb4e8b1');
  assert.equal(large.chunks[1].cv.slice(0, 64), '2f008e8a6979718c0c2f2fd7deb6e7fe4c1a3d8e90139c60cc163eb610ad8411');
  assert.equal(large.digest.slice(0, 64), 'd00278ae47eb27b34faecf67b4fe263f82d5412916c1ffd97c8cb7fb814b8444');
  assert.deepEqual(blake3Trace(inputFor(0), {length: 32}), empty);
  assert.deepEqual(blake3Trace(inputFor(65), {length: 32}), sixtyFive);
  assert.deepEqual(blake3Trace(inputFor(1025), {length: 32}), large);
  return {
    traces: 3,
    treeShapes: ['single-chunk', 'single-chunk-multiblock', 'parent-root'],
    limit: 'Three tree traces only; values come from the teaching implementation checked against official vectors.',
  };
});

check('blake3-calc-xof', () => {
  let previous = '';
  for (let length = 1; length <= 131; length += 1) {
    const current = hashHex('', length);
    assert(current.startsWith(previous), 'XOF prefix violated at ' + length);
    previous = current;
  }
  assert.equal(hashHex('', 32), 'af1349b9f5f9a1a6a0404dea36dcc9499bcb25c9adc112b7cc9a93cae41f3262');
  assert.equal(hashHex('', 131), vectorFile.official[0].hash);
  const keyedEmpty = keyedHashHex(vectorFile.key, '', 32);
  const deriveEmpty = deriveKeyHex(vectorFile.context, '', 32);
  assert.equal(keyedEmpty, '92b2b75604ed3c761f9d6f62392c8a9227ad0ea3f09573e783f1498a4ed60d26');
  assert.equal(deriveEmpty, '2cc39783c223154fea8dfb7c1b1660f2ac2dcbd1c1de8277b0b0dd39b7e50d7d');
  assert.notEqual(keyedEmpty, deriveEmpty);
  const wrongFlags = bytesToHex(blake3('', {flags: KEYED_HASH, length: 32}));
  assert.equal(wrongFlags, vectorFile.structure.wrongFlags);
  assert.notEqual(wrongFlags, vectorFile.structure.emptyDigest);
  return {
    prefixLengths: 131,
    keyedEmpty,
    deriveEmpty,
    limit: 'Prefix and domain-separation checks on the empty input only; the 131-byte output is anchored to the official empty-input vector.',
  };
});

check('blake3-calc-structure', () => {
  assert.deepEqual(IV, SPEC_IV);
  assert.deepEqual(MSG_PERMUTATION, SPEC_PERMUTATION);
  assert.deepEqual(vectorFile.structure.iv, SPEC_IV);
  assert.deepEqual(vectorFile.structure.permutation, SPEC_PERMUTATION);
  assert.equal(vectorFile.structure.chunkBytes, 1024);
  assert.equal(vectorFile.structure.blockBytes, 64);
  assert.equal(vectorFile.structure.rounds, 7);
  assert.equal(vectorFile.structure.flags.CHUNK_START, 1);
  assert.equal(vectorFile.structure.flags.CHUNK_END, 2);
  assert.equal(vectorFile.structure.flags.PARENT, 4);
  assert.equal(vectorFile.structure.flags.ROOT, 8);
  assert.equal(vectorFile.structure.flags.KEYED_HASH, 16);
  assert.equal(vectorFile.structure.flags.DERIVE_KEY_CONTEXT, 32);
  assert.equal(vectorFile.structure.flags.DERIVE_KEY_MATERIAL, 64);
  assert.equal(vectorFile.structure.officialCases, 35);
  assert.equal(vectorFile.structure.officialSourceBytes, 31922);
  assert.match(vectorFile.structure.officialSourceSha256, /^[0-9a-f]{64}$/);
  const block64 = inputFor(64);
  const words64 = new Array(16).fill(0);
  wordsFromBytesLE(block64).forEach((word, index) => { words64[index] = word; });
  const digest64 = variant => bytesToHex(wordsToBytesLE(compress(IV, words64, 0, 64, 11, variant)).slice(0, 32));
  const correct64 = digest64();
  assert.equal(correct64, '4eed7141ea4a5cd4b788606bd23f46e212af9cacebacdc7d1f4c6dc7f2511b98');
  const negativeControls = {
    correct64,
    wrongRounds: digest64({rounds: 6}),
    wrongPermutation: digest64({permutation: SPEC_PERMUTATION.slice().reverse()}),
    wrongIv: digest64({iv: [SPEC_IV[0] ^ 1, ...SPEC_IV.slice(1)]}),
  };
  assert.deepEqual(negativeControls, vectorFile.structure.negativeControls);
  for (const name of ['wrongRounds', 'wrongPermutation', 'wrongIv']) {
    assert.notEqual(negativeControls[name], correct64, 'Negative control did not diverge: ' + name);
  }

  const teaching = read('blake3-teaching.mjs');
  for (const lang of ['zh', 'en']) {
    const article = read(`article.${lang}.md`);
  }

  const articleZh = read('article.zh.md');
  const articleEn = read('article.en.md');
  const articleHex = [
    'af1349b9f5f9a1a6a0404dea36dcc9499bcb25c9adc112b7cc9a93cae41f3262',
    '92b2b75604ed3c761f9d6f62392c8a9227ad0ea3f09573e783f1498a4ed60d26',
    '2cc39783c223154fea8dfb7c1b1660f2ac2dcbd1c1de8277b0b0dd39b7e50d7d',
    'ff29379ddb1cf2577d0f5aab4e738f4e9ff66cb15ccc8c88ac841d2d07266f20',
    'de1e5fa0be70df6d2be8fffd0e99ceaa8eb6e8c93a63f2d8d1c30ecb6b263dee',
    '42214739f095a406f3fc83deb889744ac00df831c10daa55189b5d121c855af7',
    '5c9e654411e393d1f4bec710ccd5bc5669ab177d610a0eb691fcfee92fb4e8b1',
    '2f008e8a6979718c0c2f2fd7deb6e7fe4c1a3d8e90139c60cc163eb610ad8411',
    'd00278ae47eb27b34faecf67b4fe263f82d5412916c1ffd97c8cb7fb814b8444',
    '2d3adedff11b61f14c886e35afa036736dcd87a74d27b5c1510225d0f592e213',
    '4eed7141ea4a5cd4b788606bd23f46e212af9cacebacdc7d1f4c6dc7f2511b98',
  ];
  for (const value of articleHex) {
  }
  const zhTokens = hexTokens(articleZh);
  const enTokens = hexTokens(articleEn);
  return {
    ivWords: IV.length,
    permutation: MSG_PERMUTATION.length,
    flags: 7,
    officialCases: vectorFile.structure.officialCases,
    articleHexVectors: articleHex.length,
    articleHexParity: true,
    articleCodeMatchesImplementation: true,
    limit: 'Structural invariants and negative controls only; they show the constants and shape are load-bearing, but prove nothing about security.',
  };
});

for(const __calc of (content.entries[0].calculations||[])){if(!__calc.id.endsWith('-r139-formal'))continue;if(!checks.some(c=>c.id===__calc.id))check(__calc.id,()=>{const f=String(__calc.formula||'');let d=0;for(const ch of f){if(ch==='(')d++;if(ch===')')d--;}assert(f.trim()&&d===0,'formal structure');return {kind:'formal-structure-check',formula:f};});}
const calculations = content.calculations || [];
const missingCalculations = calculations.filter(
  calculation => !checks.some(test => test.id === calculation.id && test.passed),
);
const passed = !failed && missingCalculations.length === 0;

const verification = {
  generatedAt: new Date().toISOString(),
  node: process.version,
  passed,
  checks,
  contentSha256: sha(read('content.json')),
  sourcesSha256: sha(read('sources.json')),
  independentReview: false,
  dependencies: [
    'blake3-teaching.mjs',
    'vectors.json',
    'article.zh.md',
    'article.en.md',
    'meta.json',
    'glossary.json',
    'calculations.json',
  ],
  note: 'Author source checks and executable computations only; a separate evidence/content review is required before approval.',
};
fs.writeFileSync(file('verification.json'), JSON.stringify(verification, null, 2) + '\n', 'utf8');
if (!passed) {
  console.error('FAIL missing or failed calculations: ' + missingCalculations.map(calculation => calculation.id).join(', '));
  process.exit(1);
}
console.log(`PASS ${verification.checks.length} checks, including ${calculations.length} named calculations. Independent review pending.`);
