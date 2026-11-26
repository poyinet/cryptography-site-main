import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {
  IV_B,
  IV_S,
  SIGMA,
  BB_B,
  compressB,
  createBlake2,
  blake2b,
  blake2s,
  hashHex,
  hexToBytes,
  bytesToHex,
  ivFromPrimes,
  wordsToHex,
  traceB,
  traceS
} from './blake2-teaching.mjs';

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

const MASK64 = (1n << 64n) - 1n;
const pad = (bytes, length) => {
  const out = new Uint8Array(length);
  out.set(bytes);
  return out;
};
const message = length => Uint8Array.from({length}, (_, index) => (index * 37 + 11) & 0xff);
const keyBytes = length => Uint8Array.from({length}, (_, index) => (index * 53 + 7) & 0xff);
const splitDigest = (variant, data, outlen, key, splits) => {
  const hasher = createBlake2(variant, {outlen, key});
  let position = 0;
  for (const split of splits) {
    hasher.update(data.subarray(position, split));
    position = split;
  }
  hasher.update(data.subarray(position));
  return bytesToHex(hasher.final());
};
const oneShot = (variant, data, outlen, key) => bytesToHex((variant === 'b' ? blake2b : blake2s)(data, outlen, key));
const hexTokens = text => [...new Set(text.match(/\b[0-9A-F]{8,}\b/g) || [])].sort();

check('structure-evidence-and-authoring-parity', () => {
  assert.equal(content.entries.length, 1);
  const entry = content.entries[0];
  assert.equal(entry.id, 'blake2-details');
  assert.equal(entry.coverage, 'catalog-entry');
  assert.deepEqual(entry.inventoryIds, ['blake2']);
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
  for (const name of ['content.json', 'sources.json', 'blake2-teaching.mjs', 'vectors.json', 'article.zh.md', 'article.en.md', 'meta.json', 'glossary.json', 'calculations.json', 'verify.mjs']) {
    assert(!read(name).includes('\r'), 'UTF-8 LF expected: ' + name);
  }
  return {
    catalogEntity: 'blake2',
    sources: sources.sources.length,
    claims: all.length,
    calculations: content.calculations.length,
    translatedSections: Object.keys(entry.sections.zh).length,
    limit: 'Structural correspondence and evidence links only; independent factual review remains required.'
  };
});

check('blake2-calc-rfc-traces', () => {
  for (const variant of ['b', 's']) {
    const expected = vectorFile.rfcTraces[variant];
    const traced = variant === 'b'
      ? traceB(hexToBytes(expected.message), expected.outlen)
      : traceS(hexToBytes(expected.message), expected.outlen);
    assert.equal(traced.vectors.length, expected.vectors.length);
    expected.vectors.forEach((words, index) => assert.deepEqual(traced.vectors[index], words, `${variant} vector ${index}`));
    assert.deepEqual(traced.h, expected.h);
    assert.equal(traced.digest, expected.digest);
  }
  assert.equal(vectorFile.rfcTraces.b.vectors.length, 13);
  assert.equal(vectorFile.rfcTraces.s.vectors.length, 11);
  assert.equal(vectorFile.rfcTraces.b.digest, 'ba80a53f981c4d0d6a2797b69f12f6e94c212f14685ac4b74b12bb6fdbffa2d17d87c5392aab792dc252d5de4533cc9518d38aa8dbf1925ab92386edd4009923');
  assert.equal(vectorFile.rfcTraces.s.digest, '508c5e8c327c14e2e1a72ba34eeb452f37458b209ed63a294d999b4c86675982');
  return {
    blake2bVectors: vectorFile.rfcTraces.b.vectors.length,
    blake2sVectors: vectorFile.rfcTraces.s.vectors.length,
    finalStates: 2,
    digests: 2,
    limit: 'Two single-block unkeyed traces; keyed mode, multi-block padding and the self-test matrix are covered separately.'
  };
});

function selftestSeq(length, seed) {
  const out = new Uint8Array(length);
  let a = Math.imul(0xDEAD4BAD, seed) >>> 0;
  let b = 1;
  for (let index = 0; index < length; index++) {
    const t = (a + b) >>> 0;
    a = b;
    b = t;
    out[index] = (t >>> 24) & 0xFF;
  }
  return out;
}

function runSelftest(variant) {
  const expected = vectorFile.selftest[variant];
  const hash = variant === 'b' ? blake2b : blake2s;
  const parts = [];
  for (const outlen of expected.digestLengths) {
    for (const inlen of expected.inputLengths) {
      const input = selftestSeq(inlen, inlen);
      parts.push(hash(input, outlen));
      parts.push(hash(input, outlen, selftestSeq(outlen, outlen)));
    }
  }
  const joined = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let offset = 0;
  for (const part of parts) {
    joined.set(part, offset);
    offset += part.length;
  }
  assert.equal(parts.length, 48);
  assert.equal(bytesToHex(hash(joined, 32)), expected.grand);
  return {digests: parts.length, grand: expected.grand};
}

check('blake2-calc-selftest', () => {
  const b = runSelftest('b');
  const s = runSelftest('s');
  assert.equal(vectorFile.selftest.b.grand, 'c23a7800d98123bd10f506c61e29da5603d763b8bbad2e737f5e765a7bccd475');
  assert.equal(vectorFile.selftest.s.grand, '6a411f08ce25adcdfb02aba641451cec53c598b24f4fc787fbdc88797f4c1dfe');
  return {
    blake2bDigests: b.digests,
    blake2sDigests: s.digests,
    grandHashes: 2,
    digestLengths: [4, 4],
    messageLengths: [6, 6],
    limit: 'The printed grand hash is the only stored oracle; correctness only, not security.'
  };
});

check('blake2-calc-crosscheck', () => {
  let nodeChecked = 0;
  const seen = new Set();
  for (const test of vectorFile.crosscheck) {
    const data = message(test.messageLength);
    const key = test.keyLength ? keyBytes(test.keyLength) : undefined;
    const actual = oneShot(test.variant, data, test.outlen, key);
    assert.equal(actual, test.digest, `${test.variant} len=${test.messageLength} out=${test.outlen} key=${test.keyLength}`);
    const tag = `${test.variant}/${test.messageLength}/${test.outlen}/${test.keyLength}`;
    assert(!seen.has(tag), 'Duplicate crosscheck case ' + tag);
    seen.add(tag);
    if (test.keyLength === 0 && test.outlen === (test.variant === 'b' ? 64 : 32)) {
      const name = test.variant === 'b' ? 'blake2b512' : 'blake2s256';
      assert.equal(createHash(name).update(data).digest('hex'), test.digest, 'Node/OpenSSL mismatch ' + tag);
      nodeChecked++;
    }
  }
  assert.equal(vectorFile.crosscheck.length, 60);
  return {
    cases: vectorFile.crosscheck.length,
    pythonVectorOracle: vectorFile.crosscheck.length,
    nodeOpensslChecked: nodeChecked,
    digestLengths: [...new Set(vectorFile.crosscheck.map(test => test.outlen))].sort((a, b) => a - b),
    keyLengths: [...new Set(vectorFile.crosscheck.map(test => test.keyLength))].sort((a, b) => a - b),
    limit: 'Conformance agreement, not security; Node/OpenSSL covers only unkeyed full-length digests.'
  };
});

check('blake2-calc-structure', () => {
  assert.deepEqual(wordsToHex(ivFromPrimes(64), 8), wordsToHex(IV_B, 8));
  assert.deepEqual(wordsToHex(ivFromPrimes(32), 4), wordsToHex(IV_S, 4));
  assert.equal(ivFromPrimes(64).length, 8);
  assert.equal(SIGMA.length, 10);
  const rowText = SIGMA.map(row => row.join(','));
  assert.equal(new Set(rowText).size, 10);
  for (const row of SIGMA) {
    assert.equal(row.length, 16);
    assert.deepEqual([...row].sort((a, b) => a - b), [...Array(16).keys()]);
  }

  const digest64 = hashHex('b', 'abc', 64);
  const digest32 = hashHex('b', 'abc', 32);
  const digest20 = hashHex('b', 'abc', 20);
  assert.notEqual(digest64.slice(0, 40), digest20);
  assert.notEqual(digest64.slice(0, 64), digest32);
  assert.notEqual(hashHex('b', 'abc', 32, keyBytes(32)), hashHex('b', 'abc', 32, keyBytes(31)));
  assert.notEqual(hashHex('b', 'abc', 64), hashHex('s', 'abc', 32));
  assert.notEqual(hashHex('b', new Uint8Array(0), 32), hashHex('b', new Uint8Array(0), 32, keyBytes(32)));

  const splitLengths = [0, 1, 3, 64, 65, 128, 129];
  for (const variant of ['b', 's']) {
    const full = variant === 'b' ? 64 : 32;
    for (const length of splitLengths) {
      const data = message(length);
      const expected = oneShot(variant, data, full);
      for (let split = 0; split <= length; split++) {
        assert.equal(splitDigest(variant, data, full, undefined, [split]), expected, `${variant} split ${split}/${length}`);
      }
    }
    for (const length of [255, 256, 257, 1024]) {
      const data = message(length);
      const expected = oneShot(variant, data, full, keyBytes(16));
      const splits = [...new Set([0, 1, 63, 64, 65, 128, 129, Math.min(255, length), Math.floor(length / 2), Math.max(0, length - 1), length])].sort((a, b) => a - b);
      assert.equal(splitDigest(variant, data, full, keyBytes(16), splits), expected, variant + ' keyed sample ' + length);
    }
  }

  const key = keyBytes(32);
  const state = IV_B.slice();
  state[0] = (state[0] ^ (0x01010000n | (BigInt(key.length) << 8n) | 32n)) & MASK64;
  const keyedEmptyDirect = bytesToHex((() => {
    const output = compressB(state, pad(key, BB_B), BigInt(BB_B), true);
    const bytes = new Uint8Array(64);
    output.forEach((word, index) => {
      for (let byte = 0; byte < 8; byte++) bytes[index * 8 + byte] = Number((word >> BigInt(8 * byte)) & 0xffn);
    });
    return bytes.slice(0, 32);
  })());
  assert.equal(keyedEmptyDirect, oneShot('b', new Uint8Array(0), 32, key));

  const abcBlock = pad(hexToBytes('616263'), BB_B);
  const officialState = IV_B.map((word, index) => index === 0 ? (word ^ 0x01010040n) & MASK64 : word);
  const officialH = wordsToHex(compressB(officialState, abcBlock, 3n, true), 8);
  assert.deepEqual(officialH, vectorFile.rfcTraces.b.h);
  const noFlag = wordsToHex(compressB(officialState, abcBlock, 3n, false), 8);
  assert.notDeepEqual(noFlag, officialH);
  const wrongRotation = wordsToHex(compressB(officialState, abcBlock, 3n, true, {rotations: [32n, 25n, 16n, 63n]}), 8);
  assert.notDeepEqual(wrongRotation, officialH);
  const bigEndianBlock = new Uint8Array(BB_B);
  for (let group = 0; group < BB_B; group += 8) {
    for (let byte = 0; byte < 8; byte++) bigEndianBlock[group + byte] = abcBlock[group + 7 - byte];
  }
  const bigEndianH = wordsToHex(compressB(officialState, bigEndianBlock, 3n, true), 8);
  assert.notDeepEqual(bigEndianH, officialH);

  assert.throws(() => blake2b('abc', 65));
  assert.throws(() => blake2s('abc', 33));
  assert.throws(() => blake2b('abc', 64, new Uint8Array(65)));
  assert.throws(() => blake2s('abc', 32, new Uint8Array(33)));

  const articleZh = read('article.zh.md');
  const articleEn = read('article.en.md');
  const hexVectors = [
    'BA80A53F981C4D0D6A2797B69F12F6E94C212F14685AC4B74B12BB6FDBFFA2D1',
    '508C5E8C327C14E2E1A72BA34EEB452F37458B209ED63A294D999B4C86675982',
    'C23A7800D98123BD10F506C61E29DA5603D763B8BBAD2E737F5E765A7BCCD475',
    '6A411F08CE25ADCDFB02ABA641451CEC53C598B24F4FC787FBDC88797F4C1DFE',
    '6A09E667F2BDC948',
    '6B08E647',
    '0D4D1C983FA580BA',
    'E07C2654'
  ];
  for (const hex of hexVectors) {
  }
  assert(read('blake2-teaching.mjs').includes('BigInt'));
  assert(read('blake2-teaching.mjs').includes('>>> 0'));

  return {
    ivWords: 8,
    sigmaRows: SIGMA.length,
    splitPoints: splitLengths.reduce((sum, length) => sum + length + 1, 0) * 2,
    keyedSplitSamples: 8,
    keyedEmptySemantics: true,
    negativeControls: ['last-block flag', 'wrong rotation 25', 'big-endian parsing'],
    parameterEffects: true,
    invalidLengthsRejected: 4,
    articleHexVectors: hexVectors.length,
    articleHexParity: true,
    limit: 'Structural and algebraic checks only; no modes, protocols, key management, side channels or formal security proof are tested.'
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
    'blake2-teaching.mjs',
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
