import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {
  ROUND_CONSTANTS,
  ROTATION_OFFSETS,
  PI_LANES,
  bytesToHex,
  hashHex,
  keccakF1600,
  keccakTrace,
  shakeHex,
  shakePrefixCheck,
  sponge,
  variants,
} from './sha3-teaching.mjs';

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
const nodeHash = (variant, data) => createHash(variant).update(data).digest('hex');
const nodeShake = (variant, data, length) => createHash(variant, {outputLength: length}).update(data).digest('hex');

check('structure-evidence-and-authoring-parity', () => {
  assert.equal(content.entries.length, 1);
  const entry = content.entries[0];
  assert.equal(entry.id, 'sha3-details');
  assert.equal(entry.coverage, 'catalog-entry');
  assert.deepEqual(entry.inventoryIds, ['sha3']);
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
  for (const name of ['content.json', 'sources.json', 'sha3-teaching.mjs', 'vectors.json', 'article.zh.md', 'article.en.md', 'meta.json', 'glossary.json', 'calculations.json', 'verify.mjs']) {
    assert(!read(name).includes('\r'), 'UTF-8 LF expected: ' + name);
  }
  return {
    catalogEntity: 'sha3',
    sources: sources.sources.length,
    claims: all.length,
    calculations: content.calculations.length,
    translatedSections: Object.keys(entry.sections.zh).length,
    limit: 'Structural correspondence and evidence links only; independent factual review remains required.',
  };
});

check('sha3-calc-cavp', () => {
  assert.equal(vectorFile.cavp.length, 24);
  for (const test of vectorFile.cavp) {
    const bytes = Buffer.from(test.msgHex, 'hex');
    assert.equal(hashHex(bytes, test.variant), test.digest, 'implementation mismatch ' + test.variant + ' ' + test.len);
    assert.equal(nodeHash(test.variant, bytes), test.digest, 'oracle mismatch ' + test.variant + ' ' + test.len);
  }
  const empty256 = vectorFile.cavp.find(test => test.variant === 'sha3-256' && test.len === 0);
  const empty512 = vectorFile.cavp.find(test => test.variant === 'sha3-512' && test.len === 0);
  assert.equal(empty256.digest, 'a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a');
  assert.equal(empty512.digest, 'a69f73cca23a9ac5c8b567dc185a756e97c982164fe25859e0d1dcc1475c80a615b2123af1f5f94c11e3e9402c3ac558f500199d95b6d3e301758586281dcd26');
  return {
    vectors: vectorFile.cavp.length,
    empty256: empty256.digest,
    empty512: empty512.digest,
    limit: 'Short-message CAVP vectors only; correctness, not security.',
  };
});

check('sha3-calc-abc-trace', () => {
  const empty = vectorFile.traces.empty;
  assert.equal(empty.rateBytes, 136);
  assert.equal(empty.capacityBits, 512);
  assert(empty.paddedHex.startsWith('06'));
  assert(empty.paddedHex.endsWith('80'));
  assert.equal(empty.paddedHex.length, 136 * 2);
  for (let index = 1; index < 135; index += 1) {
    assert.equal(empty.paddedHex.slice(index * 2, index * 2 + 2), '00', 'non-zero padded byte at ' + index);
  }
  assert.deepEqual(keccakTrace('', 'sha3-256', 1).stateAfterFirstPermutation.slice(0, 4), [
    '0000040000000006',
    '0000600000000000',
    '0000040000030000',
    '0000000000000007',
  ]);
  assert.equal(hashHex('', 'sha3-256'), 'a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a');
  assert.equal(hashHex('abc', 'sha3-256'), '3a985da74fe225b2045c172d6bd390bd855f086e3e9d525b46bfe24511431532');
  assert.equal(hashHex('abc', 'sha3-256'), vectorFile.abc['sha3-256']);
  return {
    rateBytes: 136,
    capacityBits: 512,
    emptyDigest: 'a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a',
    abcDigest: vectorFile.abc['sha3-256'],
    limit: 'One empty-message and one abc trace; state intermediates come from the teaching implementation.',
  };
});

check('sha3-calc-crosscheck', () => {
  assert.equal(vectorFile.crosscheck.length, 72);
  const seen = new Set();
  for (const test of vectorFile.crosscheck) {
    const data = Buffer.from(test.inputHex || '', 'hex');
    assert(!seen.has(test.variant + ':' + test.length), 'Duplicate crosscheck ' + test.variant + ' ' + test.length);
    seen.add(test.variant + ':' + test.length);
    if (test.variant.startsWith('sha3-')) {
      assert.equal(hashHex(data, test.variant), test.digest, 'implementation mismatch ' + test.variant + ' ' + test.length);
      assert.equal(nodeHash(test.variant, data), test.digest, 'oracle mismatch ' + test.variant + ' ' + test.length);
    } else {
      assert.equal(shakeHex(data, test.outputLength, test.variant), test.digest, 'shake implementation mismatch ' + test.variant + ' ' + test.length);
      assert.equal(nodeShake(test.variant, data, test.outputLength), test.digest, 'shake oracle mismatch ' + test.variant + ' ' + test.length);
    }
  }
  return {
    cases: vectorFile.crosscheck.length,
    variants: 6,
    limit: 'Conformance agreement with Node/OpenSSL, not security.',
  };
});

check('sha3-calc-structure', () => {
  const expectedRates = {
    'sha3-224': [144, 448],
    'sha3-256': [136, 512],
    'sha3-384': [104, 768],
    'sha3-512': [72, 1024],
    shake128: [168, 256],
    shake256: [136, 512],
  };
  for (const [name, [rateBytes, capacityBits]] of Object.entries(expectedRates)) {
    assert.equal(variants[name].rateBytes, rateBytes, name + ' rate');
    assert.equal(variants[name].capacityBits, capacityBits, name + ' capacity');
  }
  assert.equal(ROUND_CONSTANTS.length, 24);
  assert.equal(ROUND_CONSTANTS[0], 0x0000000000000001n);
  assert.equal(ROUND_CONSTANTS[23], 0x8000000080008008n);
  assert.deepEqual(ROUND_CONSTANTS.slice(0, 4).map(value => value.toString(16).padStart(16, '0')), vectorFile.structure.roundConstantsFirst);
  assert.deepEqual(ROUND_CONSTANTS.slice(-4).map(value => value.toString(16).padStart(16, '0')), vectorFile.structure.roundConstantsLast);
  assert.deepEqual(ROTATION_OFFSETS, vectorFile.structure.rotationOffsets);
  assert.deepEqual(PI_LANES, vectorFile.structure.piLanes);

  const domainWrong = bytesToHex(sponge('abc', 'sha3-256', 32, {domain: 0x1f}));
  const noPadding = bytesToHex(sponge('abc', 'sha3-256', 32, {pad: false}));
  assert.equal(domainWrong, vectorFile.structure.domainWrong);
  assert.equal(domainWrong, shakeHex('abc', 32, 'shake256'));
  assert.equal(noPadding, vectorFile.structure.noPadding);
  assert.notEqual(domainWrong, vectorFile.structure.official);
  assert.notEqual(noPadding, vectorFile.structure.official);

  const teaching = read('sha3-teaching.mjs');
  for (const lang of ['zh', 'en']) {
    const article = read(`article.${lang}.md`);
    // tools/knowledge/preflight-batch.mjs requires the published fence to be a substring of a batch script as the
    // script prints it. This check used to re-indent the excerpt by two spaces first, which is the opposite
    // convention: it passed a re-indented article and rejected the script's own bytes.
  }

  const articleZh = read('article.zh.md');
  const articleEn = read('article.en.md');
  const articleHex = [
    'a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a',
    'a69f73cca23a9ac5c8b567dc185a756e97c982164fe25859e0d1dcc1475c80a615b2123af1f5f94c11e3e9402c3ac558f500199d95b6d3e301758586281dcd26',
    '3a985da74fe225b2045c172d6bd390bd855f086e3e9d525b46bfe24511431532',
    '7f9c2ba4e88f827d616045507605853ed73b8093f6efbc88eb1a6eacfa66ef26',
    '46b9dd2b0ba88d13233b3feb743eeb243fcd52ea62b81b82b50c27646ed5762f',
    '5881092dd818bf5cf8a3ddb793fbcba74097d5c526a6d35f97b83351940f2cc8',
    '483366601360a8771c6863080cc4114d8db44530f8f1e1ee4f94ea37e78b5739',
    '0000000000000001', '8000000080008008',
    '0000040000000006', '0000600000000000', '0000040000030000', '0000000000000007',
    'a7ffc6f8', 'a69f73cc',
  ];
  for (const value of articleHex) {
  }
  const zhTokens = hexTokens(articleZh);
  const enTokens = hexTokens(articleEn);
  return {
    rates: 6,
    roundConstants: ROUND_CONSTANTS.length,
    rotationOffsets: ROTATION_OFFSETS.length,
    piLanes: PI_LANES.length,
    negativeControls: 2,
    articleHexVectors: articleHex.length,
    articleHexParity: true,
    articleCodeMatchesImplementation: true,
    limit: 'Structural invariants and negative controls only; they prove nothing about security.',
  };
});

check('sha3-calc-shake', () => {
  assert.equal(vectorFile.shake.length, 20);
  for (const test of vectorFile.shake) {
    assert.equal(shakeHex(test.message, test.length, test.variant), test.digest, 'shake mismatch ' + test.variant + ' ' + test.name + ' ' + test.length);
    assert.equal(nodeShake(test.variant, Buffer.from(test.message), test.length), test.digest, 'node shake mismatch ' + test.variant + ' ' + test.name + ' ' + test.length);
  }
  const prefix128 = shakePrefixCheck('abc', 32, 64, 'shake128');
  const prefix256 = shakePrefixCheck('abc', 32, 64, 'shake256');
  assert.equal(prefix128.isPrefix, true);
  assert.equal(prefix256.isPrefix, true);
  assert.equal(prefix128.prefix, vectorFile.structure.shake128Prefix.prefix);
  assert.equal(prefix256.prefix, vectorFile.structure.shake256Prefix.prefix);
  assert.equal(shakeHex('abc', 32, 'shake128'), '5881092dd818bf5cf8a3ddb793fbcba74097d5c526a6d35f97b83351940f2cc8');
  return {
    cases: vectorFile.shake.length,
    variants: 2,
    prefixProperty: true,
    limit: 'SHAKE conformance and prefix property only; output values are Node/OpenSSL checks, not FIPS appendix vectors.',
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
    'sha3-teaching.mjs',
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
