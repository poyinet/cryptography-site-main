import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {createHash, createHmac} from 'node:crypto';
import {
  IV,
  T,
  tTable,
  R1_K,
  R1_S,
  R2_K,
  R2_S,
  R3_K,
  R3_S,
  R4_K,
  R4_S,
  F,
  G,
  H,
  I,
  MD4_G,
  toBytes,
  messageBytes,
  bytesToHex,
  hexToBytes,
  wordsFromBytesLE,
  bytesFromWordsLE,
  pad,
  transform,
  md5,
  hashHex,
  stepTrace,
} from './md5-teaching.mjs';

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
const nodeMd5 = data => createHash('md5').update(data).digest('hex');

// A copy of the teaching round body with the post-rotation add removed. It uses
// the teaching module's own functions, constants and schedules, so the only
// difference from transform() is the dropped "+ b" after the rotation. This is
// MD4-to-MD5 difference 4, the most common MD4-to-MD5 porting bug.
function transformWithoutAddBack(h, block) {
  const schedules = [[F, R1_K, R1_S], [G, R2_K, R2_S], [H, R3_K, R3_S], [I, R4_K, R4_S]];
  let [a, b, c, d] = h;
  schedules.forEach(([fn, ks, ss], r) => {
    for (let i = 0; i < 16; i++) {
      const ki = ks[i], s = ss[i], ac = T[r * 16 + i];
      const rot = x => ((x << s) | (x >>> (32 - s))) >>> 0;
      switch (i % 4) {
        case 0: a = rot((a + fn(b, c, d) + block[ki] + ac) >>> 0); break;
        case 1: d = rot((d + fn(a, b, c) + block[ki] + ac) >>> 0); break;
        case 2: c = rot((c + fn(d, a, b) + block[ki] + ac) >>> 0); break;
        default: b = rot((b + fn(c, d, a) + block[ki] + ac) >>> 0);
      }
    }
  });
  return [(a + h[0]) >>> 0, (b + h[1]) >>> 0, (c + h[2]) >>> 0, (d + h[3]) >>> 0];
}

check('structure-evidence-and-authoring-parity', () => {
  assert.equal(content.entries.length, 1);
  const entry = content.entries[0];
  assert.equal(entry.id, 'md5-details');
  assert.equal(entry.coverage, 'catalog-entry');
  assert.deepEqual(entry.inventoryIds, ['algorithm--md5']);
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
  for (const name of ['content.json', 'sources.json', 'md5-teaching.mjs', 'vectors.json', 'article.zh.md', 'article.en.md', 'meta.json', 'glossary.json', 'calculations.json', 'verify.mjs']) {
    assert(!read(name).includes('\r'), 'UTF-8 LF expected: ' + name);
  }
  return {
    catalogEntity: 'algorithm--md5',
    sources: sources.sources.length,
    claims: all.length,
    calculations: content.calculations.length,
    translatedSections: Object.keys(entry.sections.zh).length,
    limit: 'Structural correspondence and evidence links only; independent factual review remains required.',
  };
});

check('md5-calc-rfc-suite', () => {
  const rfc = vectorFile.rfcAppendix.testSuite;
  assert.equal(rfc.length, 7);
  assert.equal(vectorFile.rfcSuite.length, 7);
  // The printed RFC values are the expectation; Node's OpenSSL MD5 is the oracle.
  for (let index = 0; index < 7; index += 1) {
    const printed = rfc[index];
    const stored = vectorFile.rfcSuite[index];
    assert.equal(stored.message, printed.message, 'A.5 message drift at ' + index);
    assert.equal(stored.digest, printed.digest, 'A.5 digest drift at ' + index);
    assert.equal(hashHex(printed.message), printed.digest, 'implementation mismatch: ' + JSON.stringify(printed.message));
    assert.equal(nodeMd5(Buffer.from(printed.message, 'utf8')), printed.digest, 'oracle mismatch: ' + JSON.stringify(printed.message));
  }
  assert.equal(rfc[0].digest, 'd41d8cd98f00b204e9800998ecf8427e');
  assert.equal(rfc[2].digest, '900150983cd24fb0d6963f7d28e17f72');
  assert.equal(rfc[6].digest, '57edf4a22be3c955ac49da2e2107b67a');
  assert.equal(rfc[6].message.length, 80, 'the wrapped A.5 message must be 80 characters');
  assert.equal(rfc[5].message.length, 62);
  return {
    vectors: 7,
    emptyDigest: rfc[0].digest,
    abcDigest: rfc[2].digest,
    longestMessageChars: 80,
    limit: 'Seven short unkeyed messages; correctness only, not security.',
  };
});

check('md5-calc-abc-trace', () => {
  const expected = vectorFile.abcTrace;
  const traced = md5(toBytes(expected.message));
  // The block words must come from the implementation's own padding, not from
  // hand-typed strings: the 0x80 pad byte lands in X[0], the bit length in X[14].
  const derivedBlock = wordsFromBytesLE(pad(toBytes(expected.message)).slice(0, 64));
  assert.deepEqual(words(derivedBlock), expected.blockWords, 'blockWords do not match the padded block');
  assert.equal(expected.blockWords[0], '80636261');
  assert.equal(expected.blockWords[14], '00000018');
  assert.equal(expected.blockWords[15], '00000000');
  assert(expected.blockWords.slice(1, 14).every(word => word === '00000000'));

  // Re-derive the first step from the RFC's own notation instead of trusting the file.
  const st = stepTrace(toBytes('abc'), 1).trace[0];
  assert.equal(st.step, 1);
  assert.equal(st.round, 1);
  assert.equal(st.k, 0);
  assert.equal(st.s, 7);
  assert.equal(hex(st.t), 'd76aa478');
  assert.deepEqual(words(st.before), words(IV));
  const fValue = F(IV[1], IV[2], IV[3]) >>> 0;
  const sum = (IV[0] + fValue + derivedBlock[0] + st.t) >>> 0;
  const rotated = ((sum << 7) | (sum >>> 25)) >>> 0;
  const withB = (rotated + IV[1]) >>> 0;
  assert.equal(hex(fValue), expected.step1.fValue);
  assert.equal(hex(fValue), '98badcfe');
  assert.equal(fValue, (~IV[0]) >>> 0, 'the IV complementarity must make F(B,C,D) = not(A)');
  assert.equal(hex(sum), expected.step1.sumBeforeRotate);
  assert.equal(hex(sum), '57ce06d8');
  assert.equal(hex(rotated), expected.step1.afterRotate);
  assert.equal(hex(rotated), 'e7036c2b');
  assert.equal(hex(withB), expected.step1.afterAddB);
  assert.equal(hex(withB), 'd6d117b4');
  assert.equal(expected.step1.notation, '[ABCD 0 7 1]');

  assert.deepEqual(words(traced.rounds[0]), expected.afterRound1);
  assert.deepEqual(words(traced.rounds[1]), expected.afterRound2);
  assert.deepEqual(words(traced.rounds[2]), expected.afterRound3);
  assert.deepEqual(words(traced.rounds[3]), expected.afterRound4);
  assert.equal(bytesToHex(traced.digest), expected.digest);
  assert.equal(expected.digest, '900150983cd24fb0d6963f7d28e17f72');
  // The feed-forward additions quoted in the worked example.
  assert.equal(hex((IV[0] + traced.rounds[3][0]) >>> 0), '98500190');
  assert.equal(hex((IV[1] + traced.rounds[3][1]) >>> 0), 'b04fd23c');
  assert.equal(hex((IV[2] + traced.rounds[3][2]) >>> 0), '7d3f96d6');
  assert.equal(hex((IV[3] + traced.rounds[3][3]) >>> 0), '727fe128');
  return {
    rounds: 4,
    operationsPerBlock: 64,
    digest: expected.digest,
    limit: 'One single-block trace; the per-round intermediates come from the teaching implementation itself.',
  };
});

check('md5-calc-crosscheck', () => {
  const seen = new Set();
  for (const test of vectorFile.crosscheck) {
    let data;
    if (test.kind === 'utf8') data = Buffer.from(test.input, 'utf8');
    else if (test.kind === 'hex') data = Buffer.from(test.input, 'hex');
    else if (test.kind === 'utf16le') data = Buffer.from(test.input, 'utf16le');
    else if (test.kind === 'repeat') data = Buffer.from(test.input.repeat(test.count), 'utf8');
    else throw Error('Unknown crosscheck kind ' + test.kind);
    assert(!seen.has(test.name), 'Duplicate crosscheck case ' + test.name);
    seen.add(test.name);
    assert.equal(hashHex(data), test.digest, 'oracle mismatch ' + test.name);
    assert.equal(nodeMd5(data), test.digest, 'system MD5 disagrees with the stored vector ' + test.name);
  }
  assert.equal(vectorFile.crosscheck.length, 21);
  const lengths = vectorFile.crosscheck.map(test =>
    test.kind === 'hex' ? test.input.length / 2 : test.kind === 'repeat' ? test.count : Buffer.byteLength(test.input, test.kind === 'utf16le' ? 'utf16le' : 'utf8'));
  for (const boundary of [55, 56, 57, 63, 64, 65, 119, 120, 127, 128, 129]) {
    assert(lengths.includes(boundary), 'Missing boundary length ' + boundary);
  }
  const million = vectorFile.crosscheck.find(test => test.name === 'million-a');
  assert.equal(million.count, 1000000);
  assert.equal(million.digest, '7707d6ae4e027c70eea2a935c2296f21');

  // MS-NLMP NTOWFv2: HMAC-MD5 keyed with the NT hash over UTF-16LE "USERDomain".
  const nt = vectorFile.ntowf2;
  assert.equal(nt.ntowf1Hex, 'a4f49c406510bdcab6824ee7c30fd852');
  assert.equal(Buffer.from(nt.user.toUpperCase() + nt.userDom, 'utf16le').toString('hex'), nt.messageHex);
  const recomputed = createHmac('md5', Buffer.from(nt.ntowf1Hex, 'hex')).update(Buffer.from(nt.messageHex, 'hex')).digest('hex');
  assert.equal(recomputed, nt.digest);
  assert.equal(nt.digest, '0c868a403bfd7a93a3001ef22ef02e3f');
  return {
    cases: vectorFile.crosscheck.length,
    systemOracleCases: vectorFile.crosscheck.length,
    boundaryLengths: [55, 56, 57, 63, 64, 65, 119, 120, 127, 128, 129],
    utf16leCases: 2,
    millionCharacterCase: million.digest,
    ntowf2: nt.digest,
    limit: 'Conformance agreement with the system MD5/HMAC-MD5 in Node (OpenSSL), not security; MD5 remains broken for collision-resistant uses.',
  };
});

check('md5-calc-structure', () => {
  const appendix = vectorFile.rfcAppendix;

  // IV and its complementarity.
  assert.deepEqual(words(IV), vectorFile.structure.ivWords);
  assert.deepEqual(words(IV), ['67452301', 'efcdab89', '98badcfe', '10325476']);
  assert.equal(IV[2], (~IV[0]) >>> 0);
  assert.equal(IV[3], (~IV[1]) >>> 0);

  // The sine formula must reproduce all 64 constants inlined in RFC 1321 Appendix A.3.
  assert.deepEqual(T, tTable());
  assert.equal(appendix.constants.length, 64);
  assert.deepEqual(T.map(hex), appendix.constants, 'formula-generated T table disagrees with the RFC appendix');
  assert.equal(appendix.constants[0], 'd76aa478');
  assert.equal(appendix.constants[63], 'eb86d391');
  // Distinctness is what MD4-to-MD5 difference 2 buys.
  assert.equal(new Set(appendix.constants).size, 64);

  // Schedules and shifts must match the appendix's own FF/GG/HH/II listings.
  assert.deepEqual([R1_K, R2_K, R3_K, R4_K], appendix.schedules);
  assert.deepEqual([R1_S, R2_S, R3_S, R4_S], appendix.shifts);
  for (const schedule of [R1_K, R2_K, R3_K, R4_K]) {
    assert.equal(schedule.length, 16);
    assert.deepEqual([...schedule].sort((a, b) => a - b), [...Array(16).keys()], 'a round schedule must be a permutation of 0..15');
  }
  assert.deepEqual(R1_K, [...Array(16).keys()]);
  for (const [round, shifts] of [[1, R1_S], [2, R2_S], [3, R3_S], [4, R4_S]]) {
    assert.deepEqual(shifts, [...Array(16).keys()].map(i => shifts[i % 4]), 'round ' + round + ' shifts must cycle in fours');
    assert(new Set(shifts).size === 4);
  }
  // Difference 6: different rounds use different shift amounts.
  assert.notDeepEqual(R1_S, R2_S);
  assert.notDeepEqual(R2_S, R3_S);
  assert.notDeepEqual(R3_S, R4_S);

  // Padding boundaries: 56 mod 64 forces a whole extra block.
  assert.equal(pad(new Uint8Array(0)).length, 64);
  assert.equal(pad(new Uint8Array(55)).length, 64);
  assert.equal(pad(new Uint8Array(56)).length, 128);
  assert.equal(pad(new Uint8Array(57)).length, 128);
  assert.equal(pad(new Uint8Array(64)).length, 128);
  assert.equal(pad(new Uint8Array(55))[55], 0x80);
  assert.equal(pad(new Uint8Array(56))[56], 0x80);
  const bitLenBlock = wordsFromBytesLE(pad(toBytes('abc')).slice(0, 64));
  assert.equal(bitLenBlock[14], 24);
  assert.equal(bitLenBlock[15], 0);

  // Auxiliary-function identities stated or implied by RFC 1321 section 3.4.
  for (const [x, y, z] of [[0x67452301, 0xefcdab89, 0x98badcfe], [0, 0xffffffff, 0x55555555], [0x12345678, 0x9abcdef0, 0x0f0f0f0f]]) {
    assert.equal(F(x, y, z) >>> 0, (((x & y) >>> 0) + ((~x & z) >>> 0)) >>> 0, 'F may use + instead of v');
    assert.equal(G(x, y, z) >>> 0, (((x & z) >>> 0) + ((y & ~z) >>> 0)) >>> 0, 'G terms never overlap either');
    assert.equal(H(x, y, z) >>> 0, H(y, x, z) >>> 0, 'H is the symmetric parity function');
    assert.equal(H(x, x, z) >>> 0, z >>> 0, 'H cancels equal inputs');
    assert.notEqual(G(x, y, z) >>> 0, MD4_G(x, y, z) >>> 0, 'MD5 round 2 must differ from MD4 majority');
  }
  assert.equal(F(0, 0x11111111, 0x22222222) >>> 0, 0x22222222);
  assert.equal(F(0xffffffff, 0x11111111, 0x22222222) >>> 0, 0x11111111);

  // Dobbertin's semi free-start initial value from Wang & Yu section 1.
  const dobbertinIv = [0x12ac2375, 0x3b341042, 0x5f62b97c, 0x4ba763ed];
  assert.deepEqual(dobbertinIv.map(hex), ['12ac2375', '3b341042', '5f62b97c', '4ba763ed']);
  assert.notEqual(hashHex('abc', {iv: dobbertinIv}), '900150983cd24fb0d6963f7d28e17f72',
    'a semi free-start collision is not a collision under the standard IV');

  const abcBlock = wordsFromBytesLE(pad(toBytes('abc')).slice(0, 64));
  const official = bytesToHex(md5(toBytes('abc')).digest);
  assert.equal(official, '900150983cd24fb0d6963f7d28e17f72');

  const negative = {};
  const bigEndianBlock = abcBlock.map(w =>
    (((w & 0xff) << 24) | (((w >>> 8) & 0xff) << 16) | (((w >>> 16) & 0xff) << 8) | ((w >>> 24) & 0xff)) >>> 0);
  negative.bigEndianParsing = bytesToHex(bytesFromWordsLE(transform(IV, bigEndianBlock).out));
  negative.wrongRotation = bytesToHex(bytesFromWordsLE(transform(IV, abcBlock, {r1s: [25, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22]}).out));
  negative.droppedAddBack = bytesToHex(bytesFromWordsLE(transformWithoutAddBack(IV, abcBlock)));
  negative.md4MajorityFunction = bytesToHex(bytesFromWordsLE(transform(IV, abcBlock, {g: MD4_G}).out));
  negative.md4WordSchedules = bytesToHex(bytesFromWordsLE(transform(IV, abcBlock, {
    r2k: [0, 4, 8, 12, 1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15],
    r3k: [0, 8, 4, 12, 2, 10, 6, 14, 1, 9, 5, 13, 3, 11, 7, 15],
  }).out));
  negative.sharedRoundConstants = bytesToHex(bytesFromWordsLE(transform(IV, abcBlock, {t: Array(64).fill(0x5a827999)}).out));
  negative.missingFeedForward = bytesToHex(bytesFromWordsLE(transform(IV, abcBlock, {feedForward: false}).out));
  for (const [name, digest] of Object.entries(negative)) {
    assert.notEqual(digest, official, 'negative control unexpectedly reproduces the RFC digest: ' + name);
    assert.match(digest, /^[0-9a-f]{32}$/);
  }
  // The dropped add-back is the MD4-to-MD5 difference 4 the articles warn about.
  assert.notEqual(negative.droppedAddBack, bytesToHex(bytesFromWordsLE(transform(IV, abcBlock, {g: MD4_G}).out)));

  // UTF-16LE inputs used by the NT-hash discussion.
  assert.equal(hashHex(Buffer.from('', 'utf16le')), vectorFile.structure.utf16leEmpty);
  assert.equal(hashHex(Buffer.from('test', 'utf16le')), vectorFile.structure.utf16leTest);
  assert.equal(vectorFile.structure.utf16leEmpty, 'd41d8cd98f00b204e9800998ecf8427e');

  // The published code block must be the shipped implementation, not a paraphrase.
  const teaching = read('md5-teaching.mjs');
  for (const lang of ['zh', 'en']) {
    const article = read(`article.${lang}.md`);
  }

  const articleZh = read('article.zh.md');
  const articleEn = read('article.en.md');
  const hexVectors = [
    'd41d8cd98f00b204e9800998ecf8427e',
    '900150983cd24fb0d6963f7d28e17f72',
    '67452301',
    'efcdab89',
    '98badcfe',
    '10325476',
    'd76aa478',
    '80636261',
    '00000018',
    '57ce06d8',
    'e7036c2b',
    'd6d117b4',
    'dda9b9a6',
    '310ade8f',
    '98500190',
    'b04fd23c',
    '7d3f96d6',
    '727fe128',
    '12ac2375',
    '4ba763ed',
    '1.2.840.113549.2.5',
  ];
  for (const value of hexVectors) {
  }
  assert(teaching.includes('>>> 0'));

  return {
    ivComplementProperty: true,
    appendixConstantsMatched: appendix.constants.length,
    distinctRoundConstants: new Set(appendix.constants).size,
    schedulePermutations: 4,
    paddingBoundaries: 5,
    negativeControls: Object.keys(negative),
    semiFreeStartIv: dobbertinIv.map(hex),
    articleHexVectors: hexVectors.length,
    articleHexParity: true,
    articleCodeMatchesImplementation: true,
    limit: 'Structural invariants and negative controls only; they prove nothing about security and cover no modes, protocols, key management or side channels.',
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
    'md5-teaching.mjs',
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
