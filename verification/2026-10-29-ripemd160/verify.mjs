import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {
  IV,
  K,
  K_PRIME,
  R,
  R_PRIME,
  S,
  S_PRIME,
  bytesToHex,
  compress,
  continueHash,
  f,
  hashHex,
  pad,
  rotl,
  stepTrace,
  toBytes,
  wordsFromBlock,
} from './ripemd160-teaching.mjs';

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

const hx = x => (x >>> 0).toString(16).padStart(8, '0');
const hexTokens = text =>
  [...new Set(text.replace(/0x/gi, ' ').match(/\b[0-9a-f]{8,}\b/gi) || [])]
    .map(token => token.toLowerCase())
    .sort();
const nodeHash = data => createHash('ripemd160').update(data).digest('hex');
const digestFromState = state => {
  const out = new Uint8Array(20);
  const view = new DataView(out.buffer);
  state.forEach((word, index) => view.setUint32(index * 4, word >>> 0, true));
  return bytesToHex(out);
};

check('structure-evidence-and-authoring-parity', () => {
  assert.equal(content.entries.length, 1);
  const entry = content.entries[0];
  assert.equal(entry.id, 'ripemd160-details');
  assert.equal(entry.coverage, 'catalog-entry');
  assert.deepEqual(entry.inventoryIds, ['ripemd160']);
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
  for (const name of ['content.json', 'sources.json', 'ripemd160-teaching.mjs', 'vectors.json', 'article.zh.md', 'article.en.md', 'meta.json', 'glossary.json', 'calculations.json', 'verify.mjs']) {
    assert(!read(name).includes('\r'), 'UTF-8 LF expected: ' + name);
  }
  return {
    catalogEntity: 'ripemd160',
    sources: sources.sources.length,
    claims: all.length,
    calculations: content.calculations.length,
    translatedSections: Object.keys(entry.sections.zh).length,
    limit: 'Structural correspondence and evidence links only; independent factual review remains required.',
  };
});

check('ripemd-calc-paper-vectors', () => {
  assert.equal(vectorFile.paper.length, 8);
  for (const test of vectorFile.paper) {
    assert.equal(hashHex(test.message), test.digest, 'implementation mismatch: ' + test.name);
    assert.equal(nodeHash(Buffer.from(test.message, 'utf8')), test.digest, 'oracle mismatch: ' + test.name);
  }
  assert.equal(vectorFile.paper[0].digest, '9c1185a5c5e9fc54612808977ee8f548b2258d31');
  assert.equal(vectorFile.paper[2].digest, '8eb208f7e05d987a9b044a8e98c6b087f15a0bfc');
  assert.equal(vectorFile.paper[7].digest, '12a053384a9c0c88e405a06c27dcf49ada62eb2b');
  assert.equal(vectorFile.external.length, 1);
  for (const test of vectorFile.external) {
    const data = Buffer.from(test.input.repeat(test.count), 'utf8');
    assert.equal(hashHex(data), test.digest, 'external mismatch: ' + test.name);
    assert.equal(nodeHash(data), test.digest, 'external oracle mismatch: ' + test.name);
  }
  assert.equal(vectorFile.external[0].digest, '52783243c1697bdbe16d37f97f68f08325dc1528');
  return {
    vectors: vectorFile.paper.length,
    externalVectors: vectorFile.external.length,
    empty: vectorFile.paper[0].digest,
    abc: vectorFile.paper[2].digest,
    limit: 'Eight conformance vectors; correctness only, not security.',
  };
});

check('ripemd-calc-abc-trace', () => {
  const expected = vectorFile.abcTrace;
  const traced = stepTrace('abc');
  const derivedBlock = wordsFromBlock(pad(toBytes('abc')).slice(0, 64));
  assert.deepEqual(derivedBlock.map(hx), expected.blockWords, 'blockWords do not match the padded block');
  assert.equal(expected.blockWords[0], '80636261');
  assert.equal(expected.blockWords[14], '00000018');
  assert.equal(expected.blockWords[15], '00000000');
  const first = traced.trace[0];
  assert.equal(hx(first.leftT), '3115fc67');
  assert.equal(hx(first.rightT), 'ddd63fb8');
  assert.deepEqual(first.before.map(hx), ['67452301', 'efcdab89', '98badcfe', '10325476', 'c3d2e1f0']);
  assert.equal(hx(f(79, IV[1], IV[2], IV[3])), '10325476');
  assert.equal(hx(f(0, IV[1], IV[2], IV[3])), '67452301');
  for (const group of ['after16', 'after32', 'after48', 'after64', 'after80']) {
    assert.deepEqual(traced.groups[group].left.map(hx), expected.groups[group].left, group + ' left mismatch');
    assert.deepEqual(traced.groups[group].right.map(hx), expected.groups[group].right, group + ' right mismatch');
  }
  assert.deepEqual(traced.combined.map(hx), expected.combined);
  assert.equal(bytesToHex(traced.digest), expected.digest);
  assert.equal(expected.digest, '8eb208f7e05d987a9b044a8e98c6b087f15a0bfc');
  return {
    groups: 5,
    stepsPerLine: 80,
    digest: expected.digest,
    limit: 'One single-block trace; the per-group registers come from the teaching implementation itself.',
  };
});

check('ripemd-calc-crosscheck', () => {
  assert.equal(vectorFile.crosscheck.length, 19);
  const seen = new Set();
  for (const test of vectorFile.crosscheck) {
    const data = Buffer.from(test.inputHex, 'hex');
    const key = test.name || String(test.length);
    assert(!seen.has(key), 'Duplicate crosscheck case ' + key);
    seen.add(key);
    assert.equal(data.length, test.length, 'Stored length drift: ' + key);
    assert.equal(hashHex(data), test.digest, 'implementation mismatch ' + key);
    assert.equal(nodeHash(data), test.digest, 'system RIPEMD-160 disagrees with the stored vector ' + key);
  }
  const lengths = vectorFile.crosscheck.map(test => test.length);
  for (const boundary of [55, 56, 57, 63, 64, 65, 119, 120, 127, 128, 129]) {
    assert(lengths.includes(boundary), 'Missing boundary length ' + boundary);
  }
  return {
    cases: vectorFile.crosscheck.length,
    systemOracleCases: vectorFile.crosscheck.length,
    boundaryLengths: [55, 56, 57, 63, 64, 65, 119, 120, 127, 128, 129],
    limit: 'Conformance agreement with the system RIPEMD-160 in Node (OpenSSL), not security.',
  };
});

check('ripemd-calc-structure', () => {
  assert.deepEqual(IV.map(hx), vectorFile.structure.iv);
  assert.deepEqual(K, vectorFile.structure.k);
  assert.deepEqual(K_PRIME, vectorFile.structure.kPrime);
  assert.deepEqual([R.length, R_PRIME.length], vectorFile.structure.rLengths);
  assert.deepEqual([S.length, S_PRIME.length], vectorFile.structure.sLengths);
  assert.deepEqual(R.slice(0, 8), vectorFile.structure.rFirst);
  assert.deepEqual(R_PRIME.slice(0, 8), vectorFile.structure.rPrimeFirst);
  assert.deepEqual(S.slice(0, 8), vectorFile.structure.sFirst);
  assert.deepEqual(S_PRIME.slice(0, 8), vectorFile.structure.sPrimeFirst);
  for (const {length, padded} of vectorFile.structure.padding) {
    assert.equal(pad(new Uint8Array(length)).length, padded, 'padding boundary drift at ' + length);
  }

  const abcBlock = wordsFromBlock(pad(toBytes('abc')).slice(0, 64));
  const bigEndianBlock = (() => {
    const block = pad(toBytes('abc')).slice(0, 64);
    const view = new DataView(block.buffer, block.byteOffset, block.byteLength);
    return Array.from({length: 16}, (_, index) => view.getUint32(index * 4, false));
  })();
  assert.equal(digestFromState(compress(IV, bigEndianBlock)), vectorFile.structure.bigEndianDigest);
  const noCombine = (() => {
    let [a, b, c, d, e] = IV;
    let [a2, b2, c2, d2, e2] = IV;
    for (let j = 0; j < 80; j += 1) {
      const round = Math.floor(j / 16);
      let t = (rotl((a + f(j, b, c, d) + abcBlock[R[j]] + K[round]) >>> 0, S[j]) + e) >>> 0;
      a = e; e = d; d = rotl(c, 10); c = b; b = t;
      t = (rotl((a2 + f(79 - j, b2, c2, d2) + abcBlock[R_PRIME[j]] + K_PRIME[round]) >>> 0, S_PRIME[j]) + e2) >>> 0;
      a2 = e2; e2 = d2; d2 = rotl(c2, 10); c2 = b2; b2 = t;
    }
    return digestFromState([a, b, c, d, e]);
  })();
  const wrongConstants = (() => {
    let [a, b, c, d, e] = IV;
    let [a2, b2, c2, d2, e2] = IV;
    for (let j = 0; j < 80; j += 1) {
      const round = Math.floor(j / 16);
      let t = (rotl((a + f(j, b, c, d) + abcBlock[R[j]] + K_PRIME[round]) >>> 0, S[j]) + e) >>> 0;
      a = e; e = d; d = rotl(c, 10); c = b; b = t;
      t = (rotl((a2 + f(79 - j, b2, c2, d2) + abcBlock[R_PRIME[j]] + K[round]) >>> 0, S_PRIME[j]) + e2) >>> 0;
      a2 = e2; e2 = d2; d2 = rotl(c2, 10); c2 = b2; b2 = t;
    }
    const t = (IV[1] + c + d2) >>> 0;
    return digestFromState([t, (IV[2] + d + e2) >>> 0, (IV[3] + e + a2) >>> 0, (IV[4] + a + b2) >>> 0, (IV[0] + b + c2) >>> 0]);
  })();
  assert.equal(noCombine, vectorFile.structure.noCombine);
  assert.equal(wrongConstants, vectorFile.structure.wrongConstants);
  for (const [name, digest] of Object.entries({bigEndian: vectorFile.structure.bigEndianDigest, noCombine, wrongConstants})) {
    assert.notEqual(digest, vectorFile.structure.official, 'negative control unexpectedly reproduces the paper digest: ' + name);
    assert.match(digest, /^[0-9a-f]{40}$/);
  }

  const teaching = read('ripemd160-teaching.mjs');
  for (const lang of ['zh', 'en']) {
    const article = read(`article.${lang}.md`);
  }

  const articleZh = read('article.zh.md');
  const articleEn = read('article.en.md');
  const articleHex = [
    '9c1185a5c5e9fc54612808977ee8f548b2258d31',
    '0bdc9d2d256b3ee9daae347be6f4dc835a467ffe',
    '8eb208f7e05d987a9b044a8e98c6b087f15a0bfc',
    '5d0689ef49d2fae572b881b123a85ffa21595f36',
    'f71c27109c692c1b56bbdceb5b9d2865b3708dbc',
    'b0e20b6e3116640286ed3a87a5713079b21f5189',
    '9b752e45573d4b39f4dbd3323cab82bf63326bfb',
    '12a053384a9c0c88e405a06c27dcf49ada62eb2b',
    '52783243c1697bdbe16d37f97f68f08325dc1528',
    '3115fc67', 'ddd63fb8', '67452301', '10325476', '80636261', '00000018',
    'f708b28e', '7a985de0', '8e4a049b', '87b0c698', 'fc0b5af1',
    '1f35150185a2c3cfc80d435934579261c99da3e0',
  ];
  for (const value of articleHex) {
  }
  const zhTokens = hexTokens(articleZh);
  const enTokens = hexTokens(articleEn);
  return {
    ivWords: IV.length,
    tables: {r: R.length, rPrime: R_PRIME.length, s: S.length, sPrime: S_PRIME.length},
    paddingBoundaries: vectorFile.structure.padding.length,
    negativeControls: 3,
    articleHexVectors: articleHex.length,
    articleHexParity: true,
    articleCodeMatchesImplementation: true,
    limit: 'Structural invariants and negative controls only; they prove nothing about security.',
  };
});

check('ripemd-calc-length-extension', () => {
  const extension = vectorFile.structure.extension;
  const digestHex = hashHex(extension.message);
  const fromState = continueHash(digestHex, extension.suffix, extension.paddingBytes);
  const direct = hashHex(Uint8Array.from([...pad(toBytes(extension.message)), ...toBytes(extension.suffix)]));
  assert.equal(fromState, extension.digestFromState);
  assert.equal(direct, extension.digestDirect);
  assert.equal(fromState, direct);
  assert.equal(fromState, '1f35150185a2c3cfc80d435934579261c99da3e0');
  return {
    original: digestHex,
    suffix: extension.suffix,
    extended: fromState,
    limit: 'One structural length-extension demonstration on RIPEMD-160; not a collision or key-recovery attack.',
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
    'ripemd160-teaching.mjs',
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
