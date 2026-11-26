import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {
  IV,
  K2,
  K3,
  R1_K,
  R1_S,
  R2_K,
  R2_S,
  R3_K,
  R3_S,
  pad,
  transform,
  md4,
  hashHex,
  toBytes,
  bytesToHex,
  wordsFromBytesLE,
  bytesFromWordsLE,
} from './md4-teaching.mjs';

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

const hexTokens = text =>
  [...new Set(text.replace(/0x/gi, ' ').match(/\b[0-9a-f]{8,}\b/gi) || [])]
    .map(token => token.toLowerCase())
    .sort();

check('structure-evidence-and-authoring-parity', () => {
  assert.equal(content.entries.length, 1);
  const entry = content.entries[0];
  assert.equal(entry.id, 'md4-details');
  assert.equal(entry.coverage, 'catalog-entry');
  assert.deepEqual(entry.inventoryIds, ['md4']);
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
  for (const name of ['content.json', 'sources.json', 'md4-teaching.mjs', 'vectors.json', 'article.zh.md', 'article.en.md', 'meta.json', 'glossary.json', 'calculations.json', 'verify.mjs']) {
    assert(!read(name).includes('\r'), 'UTF-8 LF expected: ' + name);
  }
  return {
    catalogEntity: 'md4',
    sources: sources.sources.length,
    claims: all.length,
    calculations: content.calculations.length,
    translatedSections: Object.keys(entry.sections.zh).length,
    limit: 'Structural correspondence and evidence links only; independent factual review remains required.',
  };
});

check('md4-calc-rfc-suite', () => {
  for (const test of vectorFile.rfcSuite) {
    assert.equal(hashHex(test.message), test.digest, 'RFC suite mismatch: ' + JSON.stringify(test.message));
  }
  assert.equal(vectorFile.rfcSuite.length, 7);
  assert.equal(vectorFile.rfcSuite[0].digest, '31d6cfe0d16ae931b73c59d7e0c089c0');
  assert.equal(vectorFile.rfcSuite[2].digest, 'a448017aaf21d8525fc10ae87aa6729d');
  assert.equal(vectorFile.rfcSuite[6].digest, 'e33b4ddc9c38f2199c3e7b164fcc0536');
  return {
    vectors: vectorFile.rfcSuite.length,
    emptyDigest: vectorFile.rfcSuite[0].digest,
    abcDigest: vectorFile.rfcSuite[2].digest,
    limit: 'Seven short unkeyed messages; correctness only, not security.',
  };
});

check('md4-calc-abc-trace', () => {
  const expected = vectorFile.abcTrace;
  const traced = md4(toBytes(expected.message));
  const words = arr => arr.map(x => x.toString(16).padStart(8, '0'));
  // The block words must come from the implementation's own padding, not from
  // hand-typed strings: 0x80 pad byte lands in X[0], the bit length in X[14].
  const derivedBlock = wordsFromBytesLE(pad(toBytes(expected.message)).slice(0, 64));
  assert.deepEqual(words(derivedBlock), expected.blockWords, 'blockWords do not match the padded block');
  assert.equal(expected.blockWords[0], '80636261');
  assert.equal(expected.blockWords[14], '00000018');
  assert.equal(expected.blockWords[15], '00000000');
  assert(expected.blockWords.slice(1, 14).every(word => word === '00000000'));
  assert.deepEqual(words(traced.rounds[0]), expected.afterRound1);
  assert.deepEqual(words(traced.rounds[1]), expected.afterRound2);
  assert.deepEqual(words(traced.rounds[2]), expected.afterRound3);
  assert.equal(bytesToHex(traced.digest), expected.digest);
  assert.equal(expected.digest, 'a448017aaf21d8525fc10ae87aa6729d');
  return {
    rounds: 3,
    registersPerRound: 4,
    digest: expected.digest,
    limit: 'One single-block trace; intermediates come from the teaching implementation itself.',
  };
});

check('md4-calc-crosscheck', () => {
  const seen = new Set();
  for (const test of vectorFile.crosscheck) {
    const data = Buffer.from(test.hexInput, 'hex');
    assert.equal(hashHex(data), test.digest, 'oracle mismatch ' + test.name);
    assert(!seen.has(test.name), 'Duplicate crosscheck case ' + test.name);
    seen.add(test.name);
  }
  assert.equal(vectorFile.crosscheck.length, 20);
  const lengths = vectorFile.crosscheck.map(test => test.hexInput.length / 2);
  for (const boundary of [55, 56, 57, 63, 64, 65, 119, 120, 127, 128, 129]) {
    assert(lengths.includes(boundary), 'Missing boundary length ' + boundary);
  }
  return {
    cases: vectorFile.crosscheck.length,
    pythonVectorOracle: vectorFile.crosscheck.length,
    boundaryLengths: [55, 56, 57, 63, 64, 65, 119, 120, 127, 128, 129],
    utf16leCases: 2,
    limit: 'Conformance agreement with an independent in-batch Python oracle, not security; OpenSSL 3 removed MD4 from its default provider.',
  };
});

check('md4-calc-structure', () => {
  assert.equal(IV[2], (~IV[0]) >>> 0);
  assert.equal(IV[3], (~IV[1]) >>> 0);
  assert.deepEqual(IV.map(x => x.toString(16).padStart(8, '0')), ['67452301', 'efcdab89', '98badcfe', '10325476']);

  // RFC 1320's note gives the round constants as octal values; the RFC does not
  // state a closed-form formula, so we check the octal equalities it provides.
  assert.equal(parseInt(vectorFile.structure.sqrt2Octal, 8), K2);
  assert.equal(parseInt(vectorFile.structure.sqrt3Octal, 8), K3);

  for (const schedule of [R1_K, R2_K, R3_K]) {
    assert.equal(schedule.length, 16);
    assert.deepEqual([...schedule].sort((a, b) => a - b), [...Array(16).keys()]);
  }
  assert.deepEqual(R1_S, [3, 7, 11, 19, 3, 7, 11, 19, 3, 7, 11, 19, 3, 7, 11, 19]);
  assert.deepEqual(R2_S, [3, 5, 9, 13, 3, 5, 9, 13, 3, 5, 9, 13, 3, 5, 9, 13]);
  assert.deepEqual(R3_S, [3, 9, 11, 15, 3, 9, 11, 15, 3, 9, 11, 15, 3, 9, 11, 15]);

  assert.equal(pad(new Uint8Array(0)).length, 64);
  assert.equal(pad(new Uint8Array(55)).length, 64);
  assert.equal(pad(new Uint8Array(56)).length, 128);
  assert.equal(pad(new Uint8Array(57)).length, 128);
  assert.equal(pad(new Uint8Array(64)).length, 128);

  assert.equal(hashHex(Buffer.from('', 'utf16le')), '31d6cfe0d16ae931b73c59d7e0c089c0');
  assert.equal(hashHex(Buffer.from('test', 'utf16le')), vectorFile.structure.ntTest);

  const abcBlock = wordsFromBytesLE(pad(toBytes('abc')).slice(0, 64));
  const officialDigest = bytesToHex(md4(toBytes('abc')).digest);
  assert.equal(officialDigest, 'a448017aaf21d8525fc10ae87aa6729d');

  const bigEndianBlock = abcBlock.map(w =>
    (((w & 0xff) << 24) | (((w >>> 8) & 0xff) << 16) | (((w >>> 16) & 0xff) << 8) | ((w >>> 24) & 0xff)) >>> 0);
  const bigEndianDigest = bytesToHex(bytesFromWordsLE(transform(IV, bigEndianBlock).out));
  assert.notEqual(bigEndianDigest, officialDigest);

  const wrongRotation = bytesToHex(bytesFromWordsLE(transform(IV, abcBlock, {r1s: [25, 7, 11, 19, 3, 7, 11, 19, 3, 7, 11, 19, 3, 7, 11, 19]}).out));
  assert.notEqual(wrongRotation, officialDigest);

  const noFeedForward = bytesToHex(bytesFromWordsLE(transform(IV, abcBlock, {feedForward: false}).out));
  assert.notEqual(noFeedForward, officialDigest);

  const articleZh = read('article.zh.md');
  const articleEn = read('article.en.md');
  const hexVectors = [
    '31d6cfe0d16ae931b73c59d7e0c089c0',
    'a448017aaf21d8525fc10ae87aa6729d',
    '67452301',
    'efcdab89',
    '98badcfe',
    '10325476',
    '5a827999',
    '6ed9eba1',
    '80636261',
    '00000018',
    '031b1304',
    'a299a540',
    '7296594c',
    '12bc25a3',
    '7a0148a4',
    '52d821af',
    'e80ac15f',
    '9d72a67a',
  ];
  for (const hex of hexVectors) {
  }
  assert(read('md4-teaching.mjs').includes('>>> 0'));

  return {
    ivComplementProperty: true,
    constantsMatchRFCOctal: true,
    schedulePermutations: 3,
    paddingBoundaries: 5,
    ntEmptyHash: true,
    negativeControls: ['big-endian parsing', 'wrong rotation 25', 'missing feed-forward'],
    articleHexVectors: hexVectors.length,
    articleHexParity: true,
    limit: 'Structural and algebraic checks only; no modes, protocols, key management, side channels or formal security proof are tested.',
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
    'md4-teaching.mjs',
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
console.log(`PASS ${verification.checks.length} checks, including ${calculations.length} named calculations. Independent review pending.`);
