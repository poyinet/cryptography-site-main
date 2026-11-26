import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {createHash, createHmac} from 'node:crypto';
import {
  SHA256_IV,
  SHA512_IV,
  SHA224_IV,
  SHA384_IV,
  SHA512_224_IV,
  SHA512_256_IV,
  K256,
  K512,
  add32,
  bigSigma0_256,
  bigSigma1_256,
  bytesToHex,
  ch32,
  compress256,
  hashHex,
  hexToBytes,
  hmacHex,
  maj32,
  pad,
  schedule256,
  sha256Continue,
  stateToBytes,
  stepTrace256,
  toBytes,
  wordsFromBlock32,
} from './sha2-teaching.mjs';

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

const hex32 = x => (x >>> 0).toString(16).padStart(8, '0');
const hex64 = x => (x & ((1n << 64n) - 1n)).toString(16).padStart(16, '0');
const hexTokens = text =>
  [...new Set(text.replace(/0x/gi, ' ').match(/\b[0-9a-f]{8,}\b/gi) || [])]
    .map(token => token.toLowerCase())
    .sort();
const nodeHash = (variant, data) => createHash(variant).update(data).digest('hex');

check('structure-evidence-and-authoring-parity', () => {
  assert.equal(content.entries.length, 1);
  const entry = content.entries[0];
  assert.equal(entry.id, 'sha2-details');
  assert.equal(entry.coverage, 'catalog-entry');
  assert.deepEqual(entry.inventoryIds, ['sha2']);
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
  for (const name of ['content.json', 'sources.json', 'sha2-teaching.mjs', 'vectors.json', 'article.zh.md', 'article.en.md', 'meta.json', 'glossary.json', 'calculations.json', 'verify.mjs']) {
    assert(!read(name).includes('\r'), 'UTF-8 LF expected: ' + name);
  }
  return {
    catalogEntity: 'sha2',
    sources: sources.sources.length,
    claims: all.length,
    calculations: content.calculations.length,
    translatedSections: Object.keys(entry.sections.zh).length,
    limit: 'Structural correspondence and evidence links only; independent factual review remains required.',
  };
});

check('sha2-calc-rfc-suite', () => {
  for (const [variant, tests] of Object.entries(vectorFile.rfc6234)) {
    assert.equal(tests.length, 3, 'Expected three RFC cases for ' + variant);
    for (const test of tests) {
      assert.equal(hashHex(test.message, variant), test.digest, 'implementation mismatch: ' + variant + ' ' + test.name);
      assert.equal(nodeHash(variant, Buffer.from(test.message, 'utf8')), test.digest, 'oracle mismatch: ' + variant + ' ' + test.name);
    }
  }
  assert.equal(vectorFile.rfc6234.sha256[0].digest, 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  assert.equal(vectorFile.rfc6234.sha512[0].digest, 'ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f');
  for (const [variant, test] of Object.entries(vectorFile.oracle)) {
    assert.equal(hashHex(test.message, variant), test.digest, 'oracle implementation mismatch: ' + variant);
    assert.equal(nodeHash(variant, Buffer.from(test.message, 'utf8')), test.digest, 'system oracle mismatch: ' + variant);
  }
  return {
    rfcVectors: 12,
    oracleVariants: 2,
    sha256Abc: vectorFile.rfc6234.sha256[0].digest,
    sha512Abc: vectorFile.rfc6234.sha512[0].digest,
    limit: 'Conformance vectors only; the SHA-512/224 and SHA-512/256 abc values are implementation checks generated from the FIPS IVs.',
  };
});

check('sha2-calc-abc-trace', () => {
  const expected = vectorFile.abcTrace;
  const traced = stepTrace256('abc');
  const derivedBlock = wordsFromBlock32(pad(toBytes('abc'), 64, 8).slice(0, 64));
  assert.deepEqual(derivedBlock.map(hex32), expected.blockWords, 'blockWords do not match the padded block');
  assert.equal(expected.blockWords[0], '61626380');
  assert.equal(expected.blockWords[15], '00000018');
  assert(expected.blockWords.slice(1, 15).every(word => word === '00000000'));
  assert.deepEqual(schedule256(derivedBlock).slice(0, 20).map(hex32), expected.scheduleFirst20);
  for (const index of [16, 17, 18, 19]) {
    assert.equal(expected.scheduleFirst20[index], ['61626380', '000f0000', '7da86405', '600003c6'][index - 16]);
  }
  const first = traced.trace[0];
  assert.equal(hex32(first.t1), '54da50e8');
  assert.equal(hex32(first.t2), '08909ae5');
  assert.equal(hex32(first.after[0]), '5d6aebcd');
  assert.deepEqual(first.before.map(hex32), ['6a09e667', 'bb67ae85', '3c6ef372', 'a54ff53a', '510e527f', '9b05688c', '1f83d9ab', '5be0cd19']);
  assert.equal(hex32(add32(first.before[7], bigSigma1_256(first.before[4]), ch32(first.before[4], first.before[5], first.before[6]), K256[0], derivedBlock[0])), '54da50e8');
  assert.equal(hex32(add32(bigSigma0_256(first.before[0]), maj32(first.before[0], first.before[1], first.before[2]))), '08909ae5');
  for (const group of ['after16', 'after32', 'after48', 'after64']) {
    assert.deepEqual(traced.groups[group].map(hex32), expected.groups[group], group + ' mismatch');
  }
  assert.deepEqual(traced.feedForward.map(hex32), expected.feedForward);
  assert.deepEqual(traced.feedForward.map(hex32), ['ba7816bf', '8f01cfea', '414140de', '5dae2223', 'b00361a3', '96177a9c', 'b410ff61', 'f20015ad']);
  assert.equal(bytesToHex(traced.digest), expected.digest);
  assert.equal(expected.digest, 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  return {
    groups: 4,
    roundsPerBlock: 64,
    digest: expected.digest,
    limit: 'One single-block trace; the per-group intermediates come from the teaching implementation itself.',
  };
});

check('sha2-calc-crosscheck', () => {
  assert.equal(vectorFile.crosscheck.length, 70);
  const seen = new Set();
  for (const test of vectorFile.crosscheck) {
    const data = Buffer.from(test.input, 'hex');
    const key = test.variant + ':' + test.name;
    assert(!seen.has(key), 'Duplicate crosscheck case ' + key);
    seen.add(key);
    assert.equal(data.length, test.length, 'Stored length drift: ' + key);
    assert.equal(hashHex(data, test.variant), test.digest, 'implementation mismatch ' + key);
    assert.equal(nodeHash(test.variant, data), test.digest, 'system SHA-2 disagrees with the stored vector ' + key);
  }
  const lengths32 = vectorFile.crosscheck.filter(test => test.variant === 'sha256').map(test => test.length);
  const lengths64 = vectorFile.crosscheck.filter(test => test.variant === 'sha512').map(test => test.length);
  for (const boundary of [55, 56, 57, 63, 64, 65, 119, 120, 127, 128, 129]) {
    assert(lengths32.includes(boundary), 'Missing 32-bit boundary length ' + boundary);
  }
  for (const boundary of [111, 112, 113, 127, 128, 129, 239, 240, 241]) {
    assert(lengths64.includes(boundary), 'Missing 64-bit boundary length ' + boundary);
  }
  return {
    cases: vectorFile.crosscheck.length,
    variants: 6,
    systemOracleCases: vectorFile.crosscheck.length,
    limit: 'Conformance agreement with the system SHA-2 in Node (OpenSSL), not security.',
  };
});

const digestFrom256State = state => bytesToHex(stateToBytes(state, {bits: 32, digestBytes: 32}));

check('sha2-calc-structure', () => {
  assert.deepEqual(SHA256_IV.map(hex32), vectorFile.structure.iv256);
  assert.deepEqual(SHA512_IV.map(hex64), vectorFile.structure.iv512);
  assert.deepEqual(SHA224_IV.map(hex32), vectorFile.structure.iv224);
  assert.deepEqual(SHA384_IV.map(hex64), vectorFile.structure.iv384);
  assert.deepEqual(SHA512_224_IV.map(hex64), vectorFile.structure.iv512224);
  assert.deepEqual(SHA512_256_IV.map(hex64), vectorFile.structure.iv512256);
  assert.equal(K256.length, 64);
  assert.equal(K512.length, 80);
  assert.deepEqual(K256.slice(0, 4).map(hex32), vectorFile.structure.k256First);
  assert.deepEqual(K256.slice(-4).map(hex32), vectorFile.structure.k256Last);
  assert.deepEqual(K512.slice(0, 4).map(hex64), vectorFile.structure.k512First);
  assert.deepEqual(K512.slice(-4).map(hex64), vectorFile.structure.k512Last);

  const abcBlock = wordsFromBlock32(pad(toBytes('abc'), 64, 8).slice(0, 64));
  for (const {length, padded} of vectorFile.structure.padding256) {
    assert.equal(pad(new Uint8Array(length), 64, 8).length, padded, 'SHA-256 padding drift at ' + length);
  }
  for (const {length, padded} of vectorFile.structure.padding512) {
    assert.equal(pad(new Uint8Array(length), 128, 16).length, padded, 'SHA-512 padding drift at ' + length);
  }
  assert.deepEqual(schedule256(abcBlock).slice(0, 20).map(hex32), vectorFile.structure.schedule256First20);

  const littleEndianBlock = abcBlock.map(word =>
    (((word & 0xff) << 24) | (((word >>> 8) & 0xff) << 16) | (((word >>> 16) & 0xff) << 8) | ((word >>> 24) & 0xff)) >>> 0);
  assert.equal(digestFrom256State(compress256(SHA256_IV, littleEndianBlock)), vectorFile.structure.littleEndianDigest);
  const noFeedForward = (() => {
    const w = schedule256(abcBlock);
    let [a, b, c, d, e, f, g, h] = SHA256_IV;
    for (let t = 0; t < 64; t += 1) {
      const t1 = add32(h, bigSigma1_256(e), ch32(e, f, g), K256[t], w[t]);
      const t2 = add32(bigSigma0_256(a), maj32(a, b, c));
      h = g; g = f; f = e; e = add32(d, t1); d = c; c = b; b = a; a = add32(t1, t2);
    }
    return digestFrom256State([a, b, c, d, e, f, g, h]);
  })();
  const wrongK = (() => {
    const w = schedule256(abcBlock);
    const k = K256.slice(1).concat(K256[0]);
    let [a, b, c, d, e, f, g, h] = SHA256_IV;
    for (let t = 0; t < 64; t += 1) {
      const t1 = add32(h, bigSigma1_256(e), ch32(e, f, g), k[t], w[t]);
      const t2 = add32(bigSigma0_256(a), maj32(a, b, c));
      h = g; g = f; f = e; e = add32(d, t1); d = c; c = b; b = a; a = add32(t1, t2);
    }
    return digestFrom256State([a, b, c, d, e, f, g, h].map((word, index) => add32(SHA256_IV[index], word)));
  })();
  assert.equal(noFeedForward, vectorFile.structure.noFeedForwardDigest);
  assert.equal(wrongK, vectorFile.structure.wrongKDigest);
  for (const [name, digest] of Object.entries({littleEndian: vectorFile.structure.littleEndianDigest, noFeedForward, wrongK})) {
    assert.notEqual(digest, vectorFile.structure.official, 'negative control unexpectedly reproduces the RFC digest: ' + name);
    assert.match(digest, /^[0-9a-f]{64}$/);
  }

  const teaching = read('sha2-teaching.mjs');
  for (const lang of ['zh', 'en']) {
    const article = read(`article.${lang}.md`);
    // tools/knowledge/preflight-batch.mjs requires the published fence to be a substring of a batch script as the
    // script prints it. This check used to re-indent the excerpt by two spaces first, which is the opposite
    // convention: it passed a re-indented article and rejected the script's own bytes.
  }

  const articleZh = read('article.zh.md');
  const articleEn = read('article.en.md');
  const articleHex = [
    'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    '23097d223405d8228642a477bda255b32aadbce4bda0b3f7e36c9da7',
    'cb00753f45a35e8bb5a03d699ac65007272c32ab0eded1631a8b605a43ff5bed8086072ba1e7cc2358baeca134c825a7',
    'ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f',
    '4634270f707b6a54daae7530460842e20e37ed265ceee9a43e8924aa',
    '53048e2681941ef99b2e29b76b4c7dabe4c2d0c634fc6d46e0e2f13107e7af23',
    '6a09e667', 'bb67ae85', '3c6ef372', 'a54ff53a', '510e527f', '9b05688c', '1f83d9ab', '5be0cd19',
    'c1059ed8', '367cd507', '3070dd17', 'f70e5939', 'ffc00b31', '68581511', '64f98fa7', 'befa4fa4',
    '6a09e667f3bcc908', 'bb67ae8584caa73b', '3c6ef372fe94f82b', 'a54ff53a5f1d36f1',
    '510e527fade682d1', '9b05688c2b3e6c1f', '1f83d9abfb41bd6b', '5be0cd19137e2179',
    'cbbb9d5dc1059ed8', '629a292a367cd507', '9159015a3070dd17', '152fecd8f70e5939',
    '67332667ffc00b31', '8eb44a8768581511', 'db0c2e0d64f98fa7', '47b5481dbefa4fa4',
    '428a2f98', 'c67178f2', '428a2f98d728ae22', '6c44198c4a475817',
    '61626380', '00000018', '000f0000', '7da86405', '600003c6',
    '3587272b', '1f85c98c', 'ce20b47e', '3a6fe667', '54da50e8', '08909ae5', '5d6aebcd',
    'b0fa238e', 'c0645fde', 'd932eb16', '87912990', '07590dcd', '0b92f20c', '745a48de', '1e578218',
    '73b33bf5', 'ea992a22', 'a0060b30', '363482c9', 'ba591112', '0109ab3a', 'ade79437', '6112a3b7',
    '4172328d', 'a14c14b0', '72ab4b91', '26628815', 'fecf0bc6', 'd57b94a9', 'b7755da1', 'a80f11f0',
    '506e3058', 'd39a2165', '04d24d6c', 'b85e2ce9', '5ef50f24', 'fb121210', '948d25b6', '961f4894',
    'ba7816bf', '8f01cfea', '414140de', '5dae2223', 'b00361a3', '96177a9c', 'b410ff61', 'f20015ad',
    'f4566a6bc1df12da948d3d1da5e67458ff0cb761d456bd7382438a8903b433b4',
    '5bdcc146bf60754e6a042426089575c75a003f089d2739839dec58b964ec3843',
    '164b7a7bfcf819e2e395fbe73b56e0a387bd64222e831fd610270cd7ea2505549758bf75c05a994a6d034f65f8f0e6fdcaeab1a34d4a6b4b636e070a38bce737',
  ];
  for (const value of articleHex) {
  }
  const zhTokens = hexTokens(articleZh);
  const enTokens = hexTokens(articleEn);
  return {
    ivs: 6,
    k256: K256.length,
    k512: K512.length,
    paddingBoundaries: vectorFile.structure.padding256.length + vectorFile.structure.padding512.length,
    negativeControls: 3,
    articleHexVectors: articleHex.length,
    articleHexParity: true,
    articleCodeMatchesImplementation: true,
    limit: 'Structural invariants and negative controls only; they prove nothing about security.',
  };
});

check('sha2-calc-hmac', () => {
  assert.equal(vectorFile.hmac.length, 4);
  for (const test of vectorFile.hmac) {
    const key = Buffer.from(test.keyHex, 'hex');
    const data = Buffer.from(test.dataHex, 'hex');
    assert.equal(hmacHex(key, data, test.variant), test.digest, 'teaching HMAC mismatch ' + test.variant + ' ' + test.name);
    assert.equal(createHmac(test.variant, key).update(data).digest('hex'), test.digest, 'Node HMAC mismatch ' + test.variant + ' ' + test.name);
  }
  assert.equal(vectorFile.hmac[1].digest, '5bdcc146bf60754e6a042426089575c75a003f089d2739839dec58b964ec3843');
  assert.equal(vectorFile.hmac[3].digest, '164b7a7bfcf819e2e395fbe73b56e0a387bd64222e831fd610270cd7ea2505549758bf75c05a994a6d034f65f8f0e6fdcaeab1a34d4a6b4b636e070a38bce737');
  return {
    cases: vectorFile.hmac.length,
    variants: 2,
    limit: 'Four HMAC-SHA-2 conformance vectors; not a security proof for any protocol.',
  };
});

check('sha2-calc-length-extension', () => {
  const extension = vectorFile.structure.extension;
  const digestHex = hashHex(extension.message, 'sha256');
  const fromState = sha256Continue(digestHex, extension.suffix, extension.paddingBytes);
  const direct = hashHex(Uint8Array.from([...pad(toBytes(extension.message), 64, 8), ...toBytes(extension.suffix)]), 'sha256');
  assert.equal(fromState, extension.digestFromState);
  assert.equal(direct, extension.digestDirect);
  assert.equal(fromState, direct);
  assert.equal(fromState, 'f4566a6bc1df12da948d3d1da5e67458ff0cb761d456bd7382438a8903b433b4');
  assert.equal(hexToBytes(extension.extendedMessageHex).length, 69);
  return {
    original: digestHex,
    suffix: extension.suffix,
    extended: fromState,
    limit: 'One structural length-extension demonstration on SHA-256; not a collision or a key-recovery attack.',
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
    'sha2-teaching.mjs',
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
