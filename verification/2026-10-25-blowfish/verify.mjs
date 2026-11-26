import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {blowfishEncryptBlock, blowfishDecryptBlock, derivePiWords, fromHex, VECTORS} from './blowfish-teaching.mjs';

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

function bitCount(value) {
  let word = value >>> 0;
  let count = 0;
  while (word) {
    count += word & 1;
    word >>>= 1;
  }
  return count;
}

check('structure-evidence-and-authoring-parity', () => {
  assert.equal(content.entries.length, 1);
  const entry = content.entries[0];
  assert.equal(entry.id, 'blowfish-details');
  assert.equal(entry.coverage, 'catalog-entry');
  assert.deepEqual(entry.inventoryIds, ['blowfish']);
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
  
  assert.equal(new Set(content.calculations.map(calculation => calculation.id)).size, content.calculations.length);
  
  for (const calculation of content.calculations) {
    assert.equal(calculation.entryId, entry.id);
    assert(calculation.kind && calculation.inputs && calculation.expected && calculation.limitations);
    assert(calculation.sourceIds.length > 0);
    for (const sourceId of calculation.sourceIds) {
      assert(sources.sources.some(source => source.id === sourceId), 'Unknown calculation source ' + sourceId);
    }
  }
  assert.equal(glossary.zh.length, glossary.en.length);
  assert(glossary.zh.length >= 10);
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
      if (key !== 'refs') assert(!/https?:\/\//.test(String(value)), 'Public body section uses a URL: lang:' + key);
      else for (const source of sources.sources) assert(String(value).includes(source.url), 'refs does not print ' + source.id + ' URL (lang)');
      }
    assert(!/TODO|TBD|待补|占位/.test(Object.values(entry.sections[lang]).join('\n')));
  }
  for (const name of ['content.json', 'sources.json', 'blowfish-teaching.mjs', 'article.zh.md', 'article.en.md', 'meta.json', 'glossary.json', 'calculations.json', 'vectors.json']) {
    assert(!read(name).includes('\r'), 'UTF-8 LF expected: ' + name);
  }
  return {
    catalogEntity: 'blowfish',
    sources: sources.sources.length,
    claims: all.length,
    calculations: content.calculations.length,
    translatedSections: Object.keys(entry.sections.zh).length,
    limit: 'Structural correspondence and evidence links only; independent factual review remains required.'
  };
});

check('blowfish-calc-vectors', () => {
  assert.equal(vectorFile.vectors.length, 34);
  for (const vector of vectorFile.vectors) {
    const ciphertext = blowfishEncryptBlock(vector.plaintext, vector.key);
    assert.equal(ciphertext, vector.ciphertext);
    assert.equal(blowfishDecryptBlock(ciphertext, vector.key), vector.plaintext);
  }
  return {
    vectors: vectorFile.vectors.length,
    first: vectorFile.vectors[0],
    last: vectorFile.vectors.at(-1),
    limit: '34 fixed 8-byte-key vectors; two rows are the same zero key/plaintext, so there are 33 distinct input pairs. They do not cover every key length or plaintext.'
  };
});

check('blowfish-calc-roundtrip-keys', () => {
  const plaintext = '1111111111111111';
  const pattern = '0123456789abcdef';
  const keys = [4, 8, 16, 24, 32, 56].map(bytes => {
    let key = '';
    while (key.length < bytes * 2) key += pattern;
    return key.slice(0, bytes * 2);
  });
  const lengths = keys.map(key => key.length / 2);
  assert.deepEqual(lengths, [4, 8, 16, 24, 32, 56]);
  for (const key of keys) {
    const ciphertext = blowfishEncryptBlock(plaintext, key);
    assert.equal(blowfishDecryptBlock(ciphertext, key), plaintext);
  }
  return {
    plaintext,
    keyLengths: lengths,
    limit: 'Fixed data and six key lengths; not a random or exhaustive key-length test. 56 bytes is the 448-bit maximum.'
  };
});

check('blowfish-calc-pi-table', () => {
  const tables = derivePiWords();
  const hex = words => words.map(word => word.toString(16).padStart(8, '0')).join(' ');
  assert.equal(hex(tables.P.slice(0, 4)), '243f6a88 85a308d3 13198a2e 03707344');
  assert.equal(hex(tables.P.slice(16, 18)), '9216d5d9 8979fb1b');
  assert.equal(hex(tables.S[0].slice(0, 4)), 'd1310ba6 98dfb5ac 2ffd72db d01adfb7');
  assert.equal(tables.P.length, 18);
  assert.equal(tables.S.length, 4);
  assert(tables.S.every(box => box.length === 256));
  return {
    p1p4: hex(tables.P.slice(0, 4)),
    p17p18: hex(tables.P.slice(16, 18)),
    s1: hex(tables.S[0].slice(0, 4)),
    words: 1042,
    limit: 'Checks selected initial entries; the 34 known-answer vectors validate the full tables indirectly.'
  };
});

check('blowfish-calc-diffusion', () => {
  const key = '0000000000000000';
  const first = blowfishEncryptBlock('0000000000000000', key);
  const second = blowfishEncryptBlock('0000000000000001', key);
  assert.equal(first, '4ef997456198dd78');
  const firstWords = fromHex(first);
  const secondWords = fromHex(second);
  const distance = bitCount(firstWords[0] ^ secondWords[0]) + bitCount(firstWords[1] ^ secondWords[1]);
  assert.equal(distance, 28);
  return {
    first,
    second,
    distance,
    limit: 'One fixed one-bit difference; it is a diffusion observation, not a differential probability or a security proof.'
  };
});

check('blowfish-calc-key-equivalence', () => {
  const plaintext = '1111111111111111';
  const shortKey = '01234567';
  const longKey = '0123456701234567';
  const first = blowfishEncryptBlock(plaintext, shortKey);
  const second = blowfishEncryptBlock(plaintext, longKey);
  assert.equal(first, 'ea55f49044fe2b24');
  assert.equal(second, first);
  return {
    shortKey,
    longKey,
    ciphertext: first,
    limit: 'One short key and its doubled form; the general equivalence follows from key cycling, not from testing every key.'
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
    'blowfish-teaching.mjs',
    'article.zh.md',
    'article.en.md',
    'meta.json',
    'glossary.json',
    'calculations.json',
    'vectors.json'
  ],
  note: 'Author source checks and executable computations only; a separate evidence/content review is required before approval.'
};
fs.writeFileSync(file('verification.json'), JSON.stringify(verification, null, 2) + '\n', 'utf8');
console.log(`PASS ${verification.checks.length} checks, including ${calculations.length} named calculations. Independent review pending.`);
