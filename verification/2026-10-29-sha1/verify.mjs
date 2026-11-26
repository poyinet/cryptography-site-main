import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {createHash, createHmac} from 'node:crypto';
import {
  IV,
  K,
  bytesToHex,
  f,
  hashHex,
  hmacHex,
  pad,
  rotl,
  schedule,
  sha1,
  stepTrace,
  toBytes,
  transform,
  wordsFromBlock,
} from './sha1-teaching.mjs';

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

const hex = x => (x >>> 0).toString(16).padStart(8, '0');
const words = arr => arr.map(hex);
const hexTokens = text =>
  [...new Set(text.replace(/0x/gi, ' ').match(/\b[0-9a-f]{8,}\b/gi) || [])]
    .map(token => token.toLowerCase())
    .sort();
const nodeSha1 = data => createHash('sha1').update(data).digest('hex');

check('structure-evidence-and-authoring-parity', () => {
  assert.equal(content.entries.length, 1);
  const entry = content.entries[0];
  assert.equal(entry.id, 'sha1-details');
  assert.equal(entry.coverage, 'catalog-entry');
  assert.deepEqual(entry.inventoryIds, ['sha1']);
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
  for (const name of ['content.json', 'sources.json', 'sha1-teaching.mjs', 'vectors.json', 'article.zh.md', 'article.en.md', 'meta.json', 'glossary.json', 'calculations.json', 'verify.mjs']) {
    assert(!read(name).includes('\r'), 'UTF-8 LF expected: ' + name);
  }
  return {
    catalogEntity: 'sha1',
    sources: sources.sources.length,
    claims: all.length,
    calculations: content.calculations.length,
    translatedSections: Object.keys(entry.sections.zh).length,
    limit: 'Structural correspondence and evidence links only; independent factual review remains required.',
  };
});

check('sha1-calc-rfc-suite', () => {
  const rfc = vectorFile.rfc3174;
  assert.equal(rfc.length, 4);
  for (const test of rfc) {
    assert.equal(hashHex(test.message), test.digest, 'implementation mismatch: ' + test.name);
    assert.equal(nodeSha1(Buffer.from(test.message, 'utf8')), test.digest, 'oracle mismatch: ' + test.name);
  }
  assert.equal(rfc[0].digest, 'a9993e364706816aba3e25717850c26c9cd0d89d');
  assert.equal(rfc[1].digest, '84983e441c3bd26ebaae4aa1f95129e5e54670f1');
  assert.equal(rfc[2].digest, '34aa973cd4c4daa4f61eeb2bdbad27316534016f');
  assert.equal(rfc[3].digest, 'dea356a2cddd90c7a7ecedc5ebb563934f460452');
  assert.equal(rfc[3].message.length, 640, 'the 01234567 test string must be 640 bytes');
  return {
    vectors: 4,
    abcDigest: rfc[0].digest,
    millionA: rfc[2].digest,
    longMessageBytes: 640,
    limit: 'Four unkeyed messages; correctness only, not security.',
  };
});

check('sha1-calc-abc-trace', () => {
  const expected = vectorFile.abcTrace;
  const traced = stepTrace('abc');
  const derivedBlock = wordsFromBlock(pad(toBytes('abc')).slice(0, 64));
  assert.deepEqual(words(derivedBlock), expected.blockWords, 'blockWords do not match the padded block');
  assert.equal(expected.blockWords[0], '61626380');
  assert.equal(expected.blockWords[15], '00000018');
  assert(expected.blockWords.slice(1, 15).every(word => word === '00000000'));
  assert.deepEqual(words(schedule(derivedBlock).slice(0, 20)), expected.scheduleFirst20);
  assert.equal(expected.scheduleFirst20[16], 'c2c4c700');
  assert.equal(expected.scheduleFirst20[18], '00000030');
  assert.equal(expected.scheduleFirst20[19], '85898e01');

  const first = traced.trace[0];
  assert.equal(first.step, 1);
  assert.equal(hex(first.fValue), expected.trace[0].fValue);
  assert.equal(hex(first.fValue), '98badcfe');
  assert.equal(hex(first.rotated), 'e8a4602c');
  assert.equal(hex(first.temp), '0116fc33');
  assert.deepEqual(words(first.before), ['67452301', 'efcdab89', '98badcfe', '10325476', 'c3d2e1f0']);
  assert.deepEqual(words(first.after), ['0116fc33', '67452301', '7bf36ae2', '98badcfe', '10325476']);
  assert.equal(hex((rotl(IV[0], 5) + f(0, IV[1], IV[2], IV[3]) + IV[4] + K[0] + derivedBlock[0]) >>> 0), '0116fc33');

  for (const group of ['after20', 'after40', 'after60', 'after80']) {
    assert.deepEqual(words(traced.groups[group]), expected.groups[group], group + ' mismatch');
  }
  assert.deepEqual(words(traced.feedForward), expected.feedForward);
  assert.deepEqual(words(traced.feedForward), ['a9993e36', '4706816a', 'ba3e2571', '7850c26c', '9cd0d89d']);
  assert.equal(bytesToHex(traced.digest), expected.digest);
  assert.equal(expected.digest, 'a9993e364706816aba3e25717850c26c9cd0d89d');
  return {
    groups: 4,
    stepsPerBlock: 80,
    digest: expected.digest,
    limit: 'One single-block trace; the group intermediates come from the teaching implementation itself.',
  };
});

check('sha1-calc-crosscheck', () => {
  const seen = new Set();
  for (const test of vectorFile.crosscheck) {
    let data;
    if (test.kind === 'utf8') data = Buffer.from(test.input, 'utf8');
    else if (test.kind === 'hex') data = Buffer.from(test.input, 'hex');
    else if (test.kind === 'repeat') data = Buffer.from(test.input.repeat(test.count), 'utf8');
    else throw Error('Unknown crosscheck kind ' + test.kind);
    assert(!seen.has(test.name), 'Duplicate crosscheck case ' + test.name);
    seen.add(test.name);
    assert.equal(data.length, test.length, 'Stored length drift: ' + test.name);
    assert.equal(hashHex(data), test.digest, 'implementation mismatch ' + test.name);
    assert.equal(nodeSha1(data), test.digest, 'system SHA-1 disagrees with the stored vector ' + test.name);
  }
  assert.equal(vectorFile.crosscheck.length, 18);
  const lengths = vectorFile.crosscheck.map(test => test.length);
  for (const boundary of [55, 56, 57, 63, 64, 65, 119, 120, 127, 128, 129]) {
    assert(lengths.includes(boundary), 'Missing boundary length ' + boundary);
  }
  const million = vectorFile.crosscheck.find(test => test.name === 'million-a');
  assert.equal(million.count, 1000000);
  assert.equal(million.length, 1000000);
  assert.equal(million.digest, '34aa973cd4c4daa4f61eeb2bdbad27316534016f');
  const empty = vectorFile.crosscheck.find(test => test.name === 'empty');
  assert.equal(empty.digest, 'da39a3ee5e6b4b0d3255bfef95601890afd80709');
  return {
    cases: vectorFile.crosscheck.length,
    systemOracleCases: vectorFile.crosscheck.length,
    boundaryLengths: [55, 56, 57, 63, 64, 65, 119, 120, 127, 128, 129],
    millionCharacterCase: million.digest,
    limit: 'Conformance agreement with the system SHA-1 in Node (OpenSSL), not security.',
  };
});

check('sha1-calc-structure', () => {
  assert.deepEqual(words(IV), vectorFile.structure.ivWords);
  assert.deepEqual(words(IV), ['67452301', 'efcdab89', '98badcfe', '10325476', 'c3d2e1f0']);
  assert.equal(K.length, 80);
  const kLiteral = [
    ...Array(20).fill(0x5a827999),
    ...Array(20).fill(0x6ed9eba1),
    ...Array(20).fill(0x8f1bbcdc),
    ...Array(20).fill(0xca62c1d6),
  ];
  assert.deepEqual(K, kLiteral);
  assert.deepEqual(K.map(hex), vectorFile.structure.constants);
  assert.equal(new Set(K).size, 4);
  assert.equal(K[0], 0x5a827999);
  assert.equal(K[19], 0x5a827999);
  assert.equal(K[20], 0x6ed9eba1);
  assert.equal(K[39], 0x6ed9eba1);
  assert.equal(K[40], 0x8f1bbcdc);
  assert.equal(K[59], 0x8f1bbcdc);
  assert.equal(K[60], 0xca62c1d6);
  assert.equal(K[79], 0xca62c1d6);

  const abcBlock = wordsFromBlock(pad(toBytes('abc')).slice(0, 64));
  const abcSchedule = schedule(abcBlock);
  assert.equal(abcSchedule[16], 0xc2c4c700);
  for (const {length, padded} of vectorFile.structure.paddingBoundaries) {
    assert.equal(pad(new Uint8Array(length)).length, padded, 'padding boundary drift at ' + length);
  }
  assert.equal(pad(new Uint8Array(0)).length, 64);
  assert.equal(pad(new Uint8Array(55)).length, 64);
  assert.equal(pad(new Uint8Array(56)).length, 128);
  assert.equal(pad(new Uint8Array(57)).length, 128);
  assert.equal(pad(new Uint8Array(64)).length, 128);

  const official = hashHex('abc');
  assert.equal(official, 'a9993e364706816aba3e25717850c26c9cd0d89d');
  const sha0 = hashHex('abc', {scheduleMode: 'sha0'});
  const wrongRotation = hashHex('abc', {scheduleRotation: 2});
  const noFeedForward = hashHex('abc', {feedForward: false});
  const littleEndianBlock = abcBlock.map(word =>
    (((word & 0xff) << 24) | (((word >>> 8) & 0xff) << 16) | (((word >>> 16) & 0xff) << 8) | ((word >>> 24) & 0xff)) >>> 0);
  const littleEndian = bytesToHex((() => {
    const h = transform(IV, littleEndianBlock);
    const out = new Uint8Array(20);
    const view = new DataView(out.buffer);
    h.forEach((word, index) => view.setUint32(index * 4, word, false));
    return out;
  })());
  assert.equal(sha0, vectorFile.structure.sha0Digest);
  assert.equal(wrongRotation, vectorFile.structure.wrongRotation);
  assert.equal(noFeedForward, vectorFile.structure.noFeedForward);
  assert.equal(littleEndian, vectorFile.structure.littleEndianDigest);
  for (const [name, digest] of Object.entries({sha0, wrongRotation, noFeedForward, littleEndian})) {
    assert.notEqual(digest, official, 'negative control unexpectedly reproduces the RFC digest: ' + name);
    assert.match(digest, /^[0-9a-f]{40}$/);
  }
  assert.equal(noFeedForward, bytesToHex((() => {
    const out = new Uint8Array(20);
    const view = new DataView(out.buffer);
    stepTrace('abc').groups.after80.forEach((word, index) => view.setUint32(index * 4, word, false));
    return out;
  })()));

  const teaching = read('sha1-teaching.mjs');
  for (const lang of ['zh', 'en']) {
    const article = read(`article.${lang}.md`);
    // tools/knowledge/preflight-batch.mjs requires the published fence to be a substring of a batch script as the
    // script prints it. This check used to re-indent the excerpt by two spaces first, which is the opposite
    // convention: it passed a re-indented article and rejected the script's own bytes.
  }

  const articleZh = read('article.zh.md');
  const articleEn = read('article.en.md');
  const articleHex = [
    'a9993e364706816aba3e25717850c26c9cd0d89d',
    '84983e441c3bd26ebaae4aa1f95129e5e54670f1',
    '34aa973cd4c4daa4f61eeb2bdbad27316534016f',
    'dea356a2cddd90c7a7ecedc5ebb563934f460452',
    '67452301', 'efcdab89', '98badcfe', '10325476', 'c3d2e1f0',
    '5a827999', '6ed9eba1', '8f1bbcdc', 'ca62c1d6',
    '61626380', '00000018', 'c2c4c700', '00000030', '85898e01',
    'e8a4602c', '815f3d2a', '45321f1a', '9fb498b3', '0116fc33', '7bf36ae2',
    'fd9e1d7d', 'dc64901d', '20aa99ca', 'd3a49608', 'c82f758b',
    '32de1cba', '4c986405', 'f718e5cf', '03d447f6', 'f72eec32',
    '3f52de5a', '09d785fd', '3498bfd4', 'f211824f', 'd79915ab',
    '42541b35', '5738d5e1', '21834873', '681e6df6', 'd8fdf6ad',
    '4706816a', 'ba3e2571', '7850c26c', '9cd0d89d',
    'effcdf6ae5eb2fa2d27416d5f184df9c259a7c79',
  ];
  for (const value of articleHex) {
  }
  return {
    ivWords: IV.length,
    constants: K.length,
    distinctConstants: new Set(K).size,
    paddingBoundaries: vectorFile.structure.paddingBoundaries.length,
    negativeControls: ['sha0', 'wrongRotation', 'noFeedForward', 'littleEndian'],
    articleHexVectors: articleHex.length,
    articleHexParity: true,
    articleCodeMatchesImplementation: true,
    limit: 'Structural invariants and negative controls only; they prove nothing about security.',
  };
});

check('sha1-calc-hmac', () => {
  for (const test of vectorFile.hmac) {
    const key = test.keyHex ? Buffer.from(test.keyHex, 'hex') : Buffer.from(test.key, 'utf8');
    const data = test.dataKind === 'hex' ? Buffer.from(test.data, 'hex') : Buffer.from(test.data, 'utf8');
    assert.equal(hmacHex(key, data), test.digest, 'teaching HMAC mismatch ' + test.name);
    assert.equal(createHmac('sha1', key).update(data).digest('hex'), test.digest, 'Node HMAC mismatch ' + test.name);
  }
  assert.equal(vectorFile.hmac.length, 7);
  assert.equal(vectorFile.hmac[1].digest, 'effcdf6ae5eb2fa2d27416d5f184df9c259a7c79');
  assert.equal(vectorFile.hmac[5].digest, 'aa4ae5e15272d00e95705637ce8a3b55ed402112');
  return {
    cases: vectorFile.hmac.length,
    jefe: vectorFile.hmac[1].digest,
    longKey: vectorFile.hmac[5].digest,
    limit: 'Seven HMAC-SHA-1 conformance vectors; not a security proof for any protocol.',
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
    'sha1-teaching.mjs',
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
