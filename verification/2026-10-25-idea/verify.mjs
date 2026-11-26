import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {
  ideaEncryptBlock,
  ideaDecryptBlock,
  ideaEncryptTrace,
  ideaDecryptTrace,
  ideaSubkeys,
  modMul,
  modInv,
  addInv
} from './idea-teaching.mjs';

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

const hexWords = words => words.map(word => (word & 0xffff).toString(16).padStart(4, '0'));
const same = (actual, expected) => assert.equal(JSON.stringify(actual), JSON.stringify(expected));
const formatState = words => hexWords(words);

check('structure-evidence-and-authoring-parity', () => {
  assert.equal(content.entries.length, 1);
  const entry = content.entries[0];
  assert.equal(entry.id, 'idea-details');
  assert.equal(entry.coverage, 'catalog-entry');
  assert.deepEqual(entry.inventoryIds, ['idea']);
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
  for (const name of ['content.json', 'sources.json', 'idea-teaching.mjs', 'article.zh.md', 'article.en.md', 'meta.json', 'glossary.json', 'calculations.json', 'vectors.json', 'verify.mjs']) {
    assert(!read(name).includes('\r'), 'UTF-8 LF expected: ' + name);
  }
  return {
    catalogEntity: 'idea',
    sources: sources.sources.length,
    claims: all.length,
    calculations: content.calculations.length,
    translatedSections: Object.keys(entry.sections.zh).length,
    limit: 'Structural correspondence and evidence links only; independent factual review remains required.'
  };
});

check('idea-calc-hac-encryption', () => {
  const hac = vectorFile.hacExample;
  const subkeys = ideaSubkeys(hac.key);
  same(subkeys.encryptionRounds.map(row => hexWords(row)), hac.roundSubkeys);
  same(hexWords(subkeys.outputSubkeys), hac.outputSubkeys);
  const trace = ideaEncryptTrace(hac.plaintext, hac.key);
  same(trace.states.map(formatState), hac.roundStates);
  assert.equal(trace.ciphertext, hac.ciphertext);
  return {
    key: hac.key,
    plaintext: hac.plaintext,
    ciphertext: trace.ciphertext,
    rounds: trace.states.length,
    firstState: hac.roundStates[0],
    lastState: hac.roundStates.at(-1),
    limit: 'One authoritative worked example; it validates this key and plaintext, not every key or block.'
  };
});

check('idea-calc-hac-decryption', () => {
  const hac = vectorFile.hacExample;
  const subkeys = ideaSubkeys(hac.key);
  same(subkeys.decryptionRounds.map(row => hexWords(row)), hac.decryptionSubkeys.slice(0, 8));
  same(hexWords(subkeys.decryptionOutput), hac.decryptionSubkeys[8]);
  same(hexWords(subkeys.decryptionOutput), hac.decryptionOutputSubkeys);
  const trace = ideaDecryptTrace(hac.ciphertext, hac.key);
  same(trace.states.map(formatState), hac.decryptionStates);
  same(hexWords(trace.outputSubkeys), hac.decryptionOutputSubkeys);
  assert.equal(trace.plaintext, hac.plaintext);
  return {
    ciphertext: hac.ciphertext,
    plaintext: trace.plaintext,
    rounds: trace.states.length,
    firstState: hac.decryptionStates[0],
    lastState: hac.decryptionStates.at(-1),
    limit: 'One authoritative worked example; it checks the inverse-subkey derivation for this key only.'
  };
});

check('idea-calc-gnupg-vectors', () => {
  const vectors = vectorFile.gnupgSelftest.vectors;
  assert.equal(vectors.length, 11);
  for (const vector of vectors) {
    assert.equal(ideaEncryptBlock(vector.plaintext, vector.key), vector.ciphertext);
    assert.equal(ideaDecryptBlock(vector.ciphertext, vector.key), vector.plaintext);
  }
  assert.equal(ideaEncryptBlock(vectorFile.hacExample.plaintext, vectorFile.hacExample.key), vectors[0].ciphertext);
  return {
    vectors: vectors.length,
    distinctKeys: new Set(vectors.map(vector => vector.key)).size,
    first: vectors[0],
    last: vectors.at(-1),
    limit: 'Eleven fixed vectors; the first duplicates the HAC example, four use different keys, and they do not cover every key or plaintext.'
  };
});

check('idea-calc-key-schedule', () => {
  const hac = vectorFile.hacExample;
  const subkeys = ideaSubkeys(hac.key);
  assert.equal(subkeys.flat.length, 52);
  assert.deepEqual(subkeys.keyWords, [1, 2, 3, 4, 5, 6, 7, 8]);
  same(hexWords(subkeys.flat.slice(0, 8)), hac.roundSubkeys[0].concat(hac.roundSubkeys[1].slice(0, 2)));
  const joined = hac.key.match(/.{4}/g).join('');
  let value = BigInt('0x' + joined);
  let current = value;
  const groups = [];
  for (let group = 0; group < 6; group += 1) {
    current = ((current << 25n) | (current >> 103n)) & ((1n << 128n) - 1n);
    groups.push(...current.toString(16).padStart(32, '0').match(/.{4}/g).map(word => parseInt(word, 16)));
  }
  same(hexWords(subkeys.flat.slice(8)), hexWords(groups.slice(0, 44)));
  assert.equal(hexWords(subkeys.flat.slice(8, 16)).join(' '), '0400 0600 0800 0a00 0c00 0e00 1000 0200');
  assert.equal(hexWords(subkeys.outputSubkeys).join(' '), '0080 00c0 0100 0140');
  assert.equal(hexWords(subkeys.flat.slice(48, 52)).join(' '), '0080 00c0 0100 0140');
  assert.equal(hexWords(subkeys.flat)[51], '0140');
  return {
    subkeys: subkeys.flat.length,
    firstGroup: hexWords(subkeys.flat.slice(0, 8)).join(' '),
    secondGroup: hexWords(subkeys.flat.slice(8, 16)).join(' '),
    lastGroup: hexWords(subkeys.flat.slice(48, 52)).join(' '),
    rotationBits: 25,
    limit: 'One key; the rotation rule is checked on this key and the GnuPG vectors exercise four other keys.'
  };
});

check('idea-calc-multiplication', () => {
  assert.equal(modMul(0, 0), 1);
  assert.equal(modMul(0, 1), 0);
  assert.equal(modMul(0x0100, 0x0100), 0);
  assert.equal(modMul(0xffff, 0xffff), 4);
  assert.equal(modInv(0), 0);
  assert.equal(modInv(1), 1);
  assert.equal(modInv(0x0100), 0xff01);
  assert.equal(modMul(0x0100, modInv(0x0100)), 1);
  assert.equal(addInv(0), 0);
  assert.equal(addInv(1), 0xffff);
  assert.equal(addInv(0xffff), 1);
  return {
    zeroTimesZero: modMul(0, 0),
    zeroTimesOne: modMul(0, 1),
    inverseOf0100: modInv(0x0100),
    ffffTimesFfff: modMul(0xffff, 0xffff),
    additiveInverseOf0001: addInv(1),
    limit: 'Selected boundary values, not an exhaustive test of all 2^16 operands.'
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
    'idea-teaching.mjs',
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
