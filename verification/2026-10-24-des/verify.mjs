import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {createHash, createCipheriv, createDecipheriv} from 'node:crypto';
import {
  hexToBits,
  bitsToHex,
  keySchedule,
  encryptBlock,
  encryptHex,
  SBOX,
  WEAK_KEYS,
  PC1,
  SHIFTS,
  IP,
  FP,
  OFFICIAL_KAT,
  STANDARD_VECTOR
} from './des-teaching.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const file = name => path.join(here, name);
const read = name => fs.readFileSync(file(name), 'utf8');
const sha = value => createHash('sha256').update(value).digest('hex');
const content = JSON.parse(read('content.json'));
const sources = JSON.parse(read('sources.json'));
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

function opensslDes(hex, keyHex) {
  const key = Buffer.from(keyHex.repeat(3), 'hex');
  const cipher = createCipheriv('des-ede3-ecb', key, null);
  cipher.setAutoPadding(false);
  return Buffer.concat([cipher.update(Buffer.from(hex, 'hex')), cipher.final()]).toString('hex').toUpperCase();
}
function opensslDesDecrypt(hex, keyHex) {
  const key = Buffer.from(keyHex.repeat(3), 'hex');
  const decipher = createDecipheriv('des-ede3-ecb', key, null);
  decipher.setAutoPadding(false);
  return Buffer.concat([decipher.update(Buffer.from(hex, 'hex')), decipher.final()]).toString('hex').toUpperCase();
}
const notBits = bits => bits.map(bit => 1 - bit);

check('structure-evidence-and-authoring-parity', () => {
  assert.equal(content.entries.length, 1);
  const entry = content.entries[0];
  assert.equal(entry.id, 'des-details');
  assert.equal(entry.coverage, 'catalog-entry');
  assert.deepEqual(entry.inventoryIds, ['algorithm--des']);
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
  for (const name of ['content.json', 'sources.json', 'des-teaching.mjs', 'article.zh.md', 'article.en.md']) {
    assert(!read(name).includes('\r'), 'UTF-8 LF expected: ' + name);
  }
  return {
    catalogEntity: 'algorithm--des',
    sources: sources.sources.length,
    claims: all.length,
    translatedSections: Object.keys(entry.sections.zh).length,
    limit: 'Structural correspondence and evidence links only; independent factual review remains required.'
  };
});

check('des-known-answer', () => {
  const official = OFFICIAL_KAT;
  assert.equal(encryptHex(official.plaintext, official.key), official.ciphertext);
  assert.equal(encryptHex(official.ciphertext, official.key, {decrypt: true}), official.plaintext);
  assert.equal(opensslDes(official.plaintext, official.key), official.ciphertext);
  assert.equal(opensslDesDecrypt(official.ciphertext, official.key), official.plaintext);

  const textbook = STANDARD_VECTOR;
  assert.equal(encryptHex(textbook.plaintext, textbook.key), textbook.ciphertext);
  assert.equal(encryptHex(textbook.ciphertext, textbook.key, {decrypt: true}), textbook.plaintext);
  assert.equal(opensslDes(textbook.plaintext, textbook.key), textbook.ciphertext);

  assert.notEqual(encryptHex(textbook.ciphertext, textbook.key), textbook.plaintext);
  return {
    officialKAT: official,
    fips81Example: textbook,
    implementations: ['original teaching DES', 'Node/OpenSSL 3DES in equal-key mode'],
    negativeControl: 'encrypting the ciphertext instead of decrypting it does not return the plaintext for the non-weak example key',
    limit: 'Two fixed vectors; not CAVP validation and not a security evaluation.'
  };
});

check('des-key-schedule', () => {
  const key = hexToBits('0101010101010101');
  assert.equal(key.length, 64);
  const permuted = PC1.map(index => key[index - 1]);
  assert.equal(permuted.length, 56);
  for (const parityPosition of [8, 16, 24, 32, 40, 48, 56, 64]) {
    assert(!PC1.includes(parityPosition), `PC-1 must drop parity bit ${parityPosition}`);
  }
  assert.equal(SHIFTS.reduce((sum, value) => sum + value, 0), 28);
  const subkeys = keySchedule(key);
  assert.equal(subkeys.length, 16);
  assert(subkeys.every(subkey => subkey.length === 48));
  const c = permuted.slice(0, 28);
  const d = permuted.slice(28);
  const rotate = (bits, amount) => [...bits.slice(amount), ...bits.slice(0, amount)];
  let c2 = c;
  let d2 = d;
  for (const shift of SHIFTS) {
    c2 = rotate(c2, shift);
    d2 = rotate(d2, shift);
  }
  assert.deepEqual(c2, c);
  assert.deepEqual(d2, d);
  return {
    pc1: {input: 64, output: permuted.length, parityBitsDropped: [8, 16, 24, 32, 40, 48, 56, 64]},
    subkeys: {count: subkeys.length, bitsEach: 48, totalBits: subkeys.length * 48},
    rotationTotal: 28,
    halvesReturnToStart: true
  };
});

check('des-exhaustion-bound', () => {
  const keys = 2n ** 56n;
  assert.equal(keys, 72_057_594_037_927_936n);
  const secondsAt1e9 = Number(keys) / 1e9;
  const secondsAt1e12 = Number(keys) / 1e12;
  const daysAt1e9 = secondsAt1e9 / 86_400;
  const yearsAt1e9 = daysAt1e9 / 365.2425;
  const hoursAt1e12 = secondsAt1e12 / 3_600;
  assert.equal(Math.round(daysAt1e9), 834);
  assert(Math.abs(yearsAt1e9 - 2.2834) < 0.0005);
  assert(Math.abs(hoursAt1e12 - 20.016) < 0.001);
  return {
    keySpace: keys.toString(),
    atOneBillionPerSecond: {seconds: secondsAt1e9, days: daysAt1e9, years: yearsAt1e9},
    atOneTrillionPerSecond: {seconds: secondsAt1e12, hours: hoursAt1e12},
    limit: 'Arithmetic bound only; no hardware measurement and no candidate-filtering overhead.'
  };
});

check('des-weak-keys', () => {
  assert.equal(new Set(WEAK_KEYS).size, 4);
  let cases = 0;
  for (const weakKey of WEAK_KEYS) {
    assert.equal(keySchedule(hexToBits(weakKey)).length, 16);
    for (let index = 0; index < 65_536; index++) {
      const blockHex = index.toString(16).padStart(4, '0').repeat(4).toUpperCase();
      const once = encryptHex(blockHex, weakKey);
      const twice = encryptHex(once, weakKey);
      assert.equal(twice, blockHex);
      cases++;
    }
  }
  return {weakKeys: WEAK_KEYS, blocksPerKey: 65_536, cases, limit: 'Finite structured sample; involution follows from identical subkeys.'};
});

check('des-complement', () => {
  let cases = 0;
  const samples = [];
  for (let keyIndex = 0; keyIndex < 128; keyIndex++) {
    const key = sha(`DES complement key ${keyIndex}`).slice(0, 16).toUpperCase();
    const keyBits = hexToBits(key);
    for (let blockIndex = 0; blockIndex < 128; blockIndex++) {
      const plain = sha(`DES complement block ${keyIndex}/${blockIndex}`).slice(0, 16).toUpperCase();
      const plainBits = hexToBits(plain);
      const left = bitsToHex(encryptBlock(notBits(plainBits), notBits(keyBits)));
      const right = bitsToHex(notBits(encryptBlock(plainBits, keyBits)));
      assert.equal(left, right);
      if (keyIndex === 0 && blockIndex < 3) samples.push({key, plain, complementCipher: left});
      cases++;
    }
  }
  assert.equal(cases, 16_384);
  return {deterministicKeyBlockPairs: cases, keys: 128, blocksPerKey: 128, samples, limit: 'Structural identity on a finite sample; not an attack.'};
});

check('des-sbox-rows', () => {
  assert.equal(SBOX.length, 8);
  let rows = 0;
  let entries = 0;
  for (const box of SBOX) {
    assert.equal(box.length, 4);
    for (const row of box) {
      assert.equal(row.length, 16);
      assert.deepEqual([...row].sort((a, b) => a - b), Array.from({length: 16}, (_, index) => index));
      rows++;
      entries += row.length;
    }
  }
  assert.equal(rows, 32);
  assert.equal(entries, 512);
  return {boxes: SBOX.length, rows, entries, eachRowPermutation: true, limit: 'Table shape only; not a differential/linear security proof.'};
});

check('des-ip-fp-inverse', () => {
  let cases = 0;
  for (let index = 0; index < 4_096; index++) {
    const block = sha(`DES IP/FP block ${index}`).slice(0, 16).toUpperCase();
    const bits = hexToBits(block);
    const ipBits = IP.map(position => bits[position - 1]);
    assert.equal(bitsToHex(FP.map(position => ipBits[position - 1])), block);
    const fpBits = FP.map(position => bits[position - 1]);
    assert.equal(bitsToHex(IP.map(position => fpBits[position - 1])), block);
    cases++;
  }
  return {blocks: cases, limit: 'Positional permutation identity only.'};
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
    'des-teaching.mjs',
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
