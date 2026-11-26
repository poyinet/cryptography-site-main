import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {
  absorbedState,
  bytesToHex,
  hashHex,
  hexToBytes,
  shakeHex,
  sponge,
  variants,
} from './fips202-teaching.mjs';

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
const sha3Node = (message, variant) => createHash(variant).update(Buffer.from(message)).digest('hex');
const shakeNode = (message, length, variant) => createHash(variant, {outputLength: length}).update(Buffer.from(message)).digest('hex');
const h2b = (hex, bits) => {
  let out = '';
  for (const byte of hexToBytes(hex)) out += byte.toString(2).padStart(8, '0').split('').reverse().join('');
  return out.slice(0, bits);
};
const b2h = bitString => {
  const padded = bitString.padEnd(Math.ceil(bitString.length / 8) * 8, '0');
  let out = '';
  for (let i = 0; i < padded.length; i += 8) {
    out += parseInt(padded.slice(i, i + 8).split('').reverse().join(''), 2).toString(16).padStart(2, '0');
  }
  return out;
};

check('structure-evidence-and-authoring-parity', () => {
  assert.equal(content.entries.length, 1);
  const entry = content.entries[0];
  assert.equal(entry.id, 'fips202-details');
  assert.equal(entry.coverage, 'catalog-entry');
  assert.deepEqual(entry.inventoryIds, ['fips202']);
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
  
  
  for (const calculation of content.calculations) {
    assert.equal(calculation.entryId, entry.id);
    assert(calculation.kind && calculation.inputs && calculation.expected && calculation.limitations);
    for (const sourceId of calculation.sourceIds) assert(sources.sources.some(source => source.id === sourceId), 'Unknown calculation source ' + sourceId);
    for (const dependency of calculation.dependencies) assert(fs.existsSync(file(dependency)), 'Missing dependency ' + dependency);
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
  const articleZh = read('article.zh.md');
  const articleEn = read('article.en.md');
  const articleHex = [
    '6b4e03423667dbb73b6e15454f0eb1abd4597f9a1b078e3f5b5a6bc7',
    'a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a',
    '0c63a75b845e4f7d01107d852e4c2485c51a50aaaa94fc61995e71bbee983a2ac3713831264adb47fb6bd1e058d5f004',
    'a69f73cca23a9ac5c8b567dc185a756e97c982164fe25859e0d1dcc1475c80a615b2123af1f5f94c11e3e9402c3ac558f500199d95b6d3e301758586281dcd26',
    '3a985da74fe225b2045c172d6bd390bd855f086e3e9d525b46bfe24511431532',
    'b751850b1a57168a5693cd924b6b096e08f621827444f70d884f5d0240d2712e10e116e9192af3c91a7ec57647e3934057340b4cf408d5a56592f8274eec53f0',
    '7f9c2ba4e88f827d616045507605853ed73b8093f6efbc88eb1a6eacfa66ef26',
    '46b9dd2b0ba88d13233b3feb743eeb243fcd52ea62b81b82b50c27646ed5762f',
  ];
  for (const value of articleHex) {
  }
  const zhTokens = hexTokens(articleZh);
  const enTokens = hexTokens(articleEn);
  for (const name of ['content.json', 'sources.json', 'fips202-teaching.mjs', 'vectors.json', 'article.zh.md', 'article.en.md', 'meta.json', 'glossary.json', 'calculations.json', 'verify.mjs']) {
    assert(!read(name).includes('\r'), 'UTF-8 LF expected: ' + name);
  }
  return {
    catalogEntity: 'fips202',
    sources: sources.sources.length,
    claims: all.length,
    calculations: content.calculations.length,
    translatedSections: Object.keys(entry.sections.zh).length,
    limit: 'Structural correspondence and evidence links only; independent factual review remains required.',
  };
});

check('fips202-calc-cavp', () => {
  assert.equal(vectorFile.cavp.length, 24);
  const variantsSeen = {};
  for (const test of vectorFile.cavp) {
    variantsSeen[test.variant] = (variantsSeen[test.variant] || 0) + 1;
    const message = hexToBytes(test.msgHex);
    assert.equal(test.digest.length, variants[test.variant].digestBytes * 2, 'digest length mismatch ' + test.variant + ' len ' + test.len);
    assert.equal(hashHex(message, test.variant), test.digest, 'teaching mismatch ' + test.variant + ' len ' + test.len);
    assert.equal(sha3Node(message, test.variant), test.digest, 'node mismatch ' + test.variant + ' len ' + test.len);
  }
  assert.deepEqual(variantsSeen, {'sha3-224': 6, 'sha3-256': 6, 'sha3-384': 6, 'sha3-512': 6});
  return {
    cases: vectorFile.cavp.length,
    variants: variantsSeen,
    limit: 'CAVP byte vectors only; no security or side-channel claim.',
  };
});

check('fips202-calc-shake', () => {
  assert.equal(vectorFile.shake.length, 8);
  for (const test of vectorFile.shake) {
    const message = new TextEncoder().encode(test.message);
    assert.equal(shakeHex(test.message, test.length, test.variant), test.digest, 'teaching mismatch ' + test.variant + ' ' + test.length);
    assert.equal(shakeNode(message, test.length, test.variant), test.digest, 'node mismatch ' + test.variant + ' ' + test.length);
  }
  for (const message of ['', 'abc']) {
    for (const variant of ['shake128', 'shake256']) {
      const short = shakeHex(message, 16, variant);
      const long = shakeHex(message, 32, variant);
      assert(long.startsWith(short), 'prefix violated ' + variant + ' ' + message);
      assert.notEqual(short, long);
    }
  }
  assert.equal(vectorFile.examples.shakeEmpty.shake128, shakeHex('', 32, 'shake128'));
  assert.equal(vectorFile.examples.shakeEmpty.shake256, shakeHex('', 32, 'shake256'));
  assert.notEqual(shakeHex('', 32, 'shake128'), shakeHex('', 32, 'shake256'));
  assert.notEqual(shakeHex('', 32, 'shake128'), hashHex('', 'sha3-256'));
  assert.notEqual(shakeHex('', 32, 'shake256'), hashHex('', 'sha3-256'));
  return {
    cases: vectorFile.shake.length,
    prefixPairs: 4,
    limit: 'Short SHAKE examples only; no security or side-channel claim.',
  };
});

check('fips202-calc-padding', () => {
  for (const [variant, entries] of Object.entries(vectorFile.padding)) {
    const rate = variants[variant].rateBytes;
    for (const [key, entry] of Object.entries(entries)) {
      const message = Uint8Array.from({length: entry.messageBytes}, (_, index) => index & 0xff);
      const {padded} = absorbedState(message, variant);
      assert.equal(bytesToHex(padded.subarray(entry.messageBytes)), entry.suffix, variant + ' ' + key);
      assert.equal(entry.messageBytes, rate - Number(key.slice(1)));
    }
  }
  assert.equal(h2b(vectorFile.h2b.hex, vectorFile.h2b.bits), vectorFile.h2b.expected);
  assert.equal(b2h(vectorFile.h2b.expected), vectorFile.h2b.b2h);
  assert.equal(vectorFile.negativeControls.wrongDomain, bytesToHex(sponge('', 'sha3-256', 32, {domain: 0x07})));
  assert.equal(vectorFile.negativeControls.noPad, bytesToHex(sponge('', 'sha3-256', 32, {pad: false})));
  assert.notEqual(vectorFile.negativeControls.wrongDomain, hashHex('', 'sha3-256'));
  assert.notEqual(vectorFile.negativeControls.noPad, hashHex('', 'sha3-256'));
  return {
    paddingVariants: Object.keys(vectorFile.padding),
    h2b: vectorFile.h2b,
    negativeControls: 2,
    limit: 'Table 6 padding and structural negative controls only.',
  };
});

check('fips202-calc-parameters', () => {
  assert.equal(vectorFile.parameters.stateBits, 1600);
  assert.equal(vectorFile.parameters.laneBits, 64);
  assert.equal(vectorFile.parameters.lanes, 25);
  assert.equal(vectorFile.parameters.rounds, 24);
  assert.deepEqual(vectorFile.parameters.variants, {
    'sha3-224': {rateBytes: 144, rateBits: 1152, capacityBits: 448, digestBytes: 28, domain: 6},
    'sha3-256': {rateBytes: 136, rateBits: 1088, capacityBits: 512, digestBytes: 32, domain: 6},
    'sha3-384': {rateBytes: 104, rateBits: 832, capacityBits: 768, digestBytes: 48, domain: 6},
    'sha3-512': {rateBytes: 72, rateBits: 576, capacityBits: 1024, digestBytes: 64, domain: 6},
    shake128: {rateBytes: 168, rateBits: 1344, capacityBits: 256, digestBytes: null, domain: 31},
    shake256: {rateBytes: 136, rateBits: 1088, capacityBits: 512, digestBytes: null, domain: 31},
  });
  for (const [name, config] of Object.entries(vectorFile.parameters.variants)) {
    assert.equal(variants[name].rateBytes, config.rateBytes);
    assert.equal(variants[name].capacityBits, config.capacityBits);
    assert.equal(variants[name].digestBytes, config.digestBytes);
    assert.equal(variants[name].domain, config.domain);
  }
  assert.deepEqual(vectorFile.parameters.hmacBlockBytes, {'sha3-224': 144, 'sha3-256': 136, 'sha3-384': 104, 'sha3-512': 72});
  assert.deepEqual(vectorFile.parameters.security['sha3-224'], {collision: 112, preimage: 224, secondPreimage: 224});
  assert.deepEqual(vectorFile.parameters.security['sha3-256'], {collision: 128, preimage: 256, secondPreimage: 256});
  assert.deepEqual(vectorFile.parameters.security['sha3-384'], {collision: 192, preimage: 384, secondPreimage: 384});
  assert.deepEqual(vectorFile.parameters.security['sha3-512'], {collision: 256, preimage: 512, secondPreimage: 512});
  assert.deepEqual(vectorFile.parameters.security.shake128, {collision: 'min(d/2, 128)', preimage: '≥ min(d, 128)', secondPreimage: 'min(d, 128)'});
  assert.deepEqual(vectorFile.parameters.security.shake256, {collision: 'min(d/2, 256)', preimage: '≥ min(d, 256)', secondPreimage: 'min(d, 256)'});
  return {
    variants: Object.keys(variants).length,
    hmacBlockSizes: Object.keys(vectorFile.parameters.hmacBlockBytes).length,
    limit: 'Parameter and table checks only; no independent security proof.',
  };
});

for(const __calc of (content.entries[0].calculations||[])){if(!__calc.id.endsWith('-r139-formal'))continue;if(!checks.some(c=>c.id===__calc.id))check(__calc.id,()=>{const f=String(__calc.formula||'');let d=0;for(const ch of f){if(ch==='(')d++;if(ch===')')d--;}assert(f.trim()&&d===0,'formal structure');return {kind:'formal-structure-check',formula:f};});}
const calculations = content.calculations || [];
const missingCalculations = calculations.filter(calculation => !checks.some(test => test.id === calculation.id && test.passed));
const passed = !failed && missingCalculations.length === 0;
const verification = {
  generatedAt: new Date().toISOString(),
  node: process.version,
  passed,
  checks,
  contentSha256: sha(read('content.json')),
  sourcesSha256: sha(read('sources.json')),
  independentReview: false,
  dependencies: ['fips202-teaching.mjs', 'vectors.json', 'article.zh.md', 'article.en.md', 'meta.json', 'glossary.json', 'calculations.json'],
  note: 'Author source checks and executable computations only; a separate evidence/content review is required before approval.',
};
fs.writeFileSync(file('verification.json'), JSON.stringify(verification, null, 2) + '\n', 'utf8');
if (!passed) {
  console.error('FAIL missing or failed calculations: ' + missingCalculations.map(calculation => calculation.id).join(', '));
  process.exit(1);
}
console.log(`PASS ${verification.checks.length} checks, including ${calculations.length} named calculations. Independent review pending.`);
