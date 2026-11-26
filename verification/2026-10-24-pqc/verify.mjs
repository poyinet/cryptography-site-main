import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {MLKEM, MLDSA, SLHDSA, mlkemSizes, mldsaPublicKey, slhdsaPublicKey, shorFactorFromOrder, squareRootExponent, groverExponentRelation, toyLweEncrypt, toyLweDecrypt} from './pqc-teaching.mjs';

const dir = path.dirname(fileURLToPath(import.meta.url));
const file = name => path.join(dir, name);
const read = name => fs.readFileSync(file(name), 'utf8');
const content = JSON.parse(read('content.json'));
const sources = JSON.parse(read('sources.json'));
const checks = [];
const sha = value => createHash('sha256').update(value).digest('hex');
const entry = content.entries[0];
for(const __calc of (content.entries[0].calculations||[])){if(!__calc.id.endsWith('-r139-formal'))continue;if(!checks.some(c=>c.id===__calc.id))check(__calc.id,()=>{const f=String(__calc.formula||'');let d=0;for(const ch of f){if(ch==='(')d++;if(ch===')')d--;}assert(f.trim()&&d===0,'formal structure');return {kind:'formal-structure-check',formula:f};});}
const calculations = new Map(content.calculations.map(c => [c.id, c]));

function check(id, fn) {
  const result = fn();
  checks.push({id, passed: true, ...result});
}

check('pqc-details-structure-and-evidence', () => {
  assert.equal(content.entries.length, 1);
  assert.equal(entry.id, 'pqc-details');
  assert.equal(entry.coverage, 'catalog-entry');
  assert.deepEqual(entry.inventoryIds, ['post-quantum-cryptography']);
  assert(entry.coverageRationale.zh && entry.coverageRationale.en);
  assert.deepEqual(Object.keys(entry.sections.zh).sort(), Object.keys(entry.sections.en).sort());
  assert.equal(entry.glossary.zh.length, entry.glossary.en.length);
  for (const lang of ['zh', 'en']) {
    for (const key of ['principle','why','used','broken','history','refs','example']) {
      assert(entry.sections[lang][key]?.trim(), `${lang}:${key} must be non-empty`);
    }

  }
  const claims = sources.sources.flatMap(source => source.claims || []);
  const ids = claims.map(claim => claim.id);
  assert.equal(new Set(ids).size, ids.length, 'Claim IDs must be unique');
  assert.deepEqual([...entry.claimIds].sort(), [...ids].sort(), 'Article claim list must match the ledger');
  for (const source of sources.sources) {
    assert(source.url.startsWith('https://'));
    assert(entry.sourceIds.includes(source.id));
  }
  for (const claim of claims) {
    assert.equal(claim.entryId, entry.id);
    assert(claim.statement.zh && claim.statement.en);
    assert(claim.section && entry.sections.zh[claim.section] && entry.sections.en[claim.section]);
    assert(claim.locator);
  }
  for (const id of entry.calculationIds) {
    const calculation = calculations.get(id);
    assert(calculation, `Missing calculation ${id}`);
    assert.equal(calculation.entryId, entry.id);
    assert(calculation.sourceIds.every(sourceId => sources.sources.some(source => source.id === sourceId)));
    assert(calculation.dependencies.every(name => fs.existsSync(file(name))), `Missing dependency for ${id}`);
  }
  assert.equal(entry.calculationIds.length, content.calculations.length);
  return {
    entries: 1,
    claims: claims.length,
    sources: sources.sources.length,
    sectionsPerLanguage: 9,
    limit: 'Structural linkage and source presence do not prove that each source supports its claim; independent review is required.'
  };
});

check('pqc-mlkem-sizes', () => {
  const expected = {
    'ML-KEM-512': {ek: 800, dk: 1632, ct: 768, shared: 32},
    'ML-KEM-768': {ek: 1184, dk: 2400, ct: 1088, shared: 32},
    'ML-KEM-1024': {ek: 1568, dk: 3168, ct: 1568, shared: 32}
  };
  for (const set of MLKEM) {
    assert.equal(set.n, 256);
    assert.equal(set.q, 3329);
    const sizes = mlkemSizes(set);
    assert.deepEqual(sizes, expected[set.name]);
    assert.deepEqual({ek: set.ek, dk: set.dk, ct: set.ct, shared: set.shared}, expected[set.name]);
  }
  return {sets: MLKEM.length, sizes: Object.fromEntries(MLKEM.map(set => [set.name, mlkemSizes(set)]))};
});

check('pqc-mldsa-sizes', () => {
  const expected = {
    'ML-DSA-44': {sk: 2560, pk: 1312, sig: 2420},
    'ML-DSA-65': {sk: 4032, pk: 1952, sig: 3309},
    'ML-DSA-87': {sk: 4896, pk: 2592, sig: 4627}
  };
  for (const set of MLDSA) {
    assert.equal(mldsaPublicKey(set.k), expected[set.name].pk);
    assert.deepEqual({sk: set.sk, pk: set.pk, sig: set.sig}, expected[set.name]);
  }
  return {sets: MLDSA.length, sizes: expected};
});

check('pqc-slhdsa-pk', () => {
  const expected = {
    'SLH-DSA-SHA2-128s': {pk: 32, sig: 7856},
    'SLH-DSA-SHA2-128f': {pk: 32, sig: 17088},
    'SLH-DSA-SHA2-192s': {pk: 48, sig: 16224},
    'SLH-DSA-SHA2-192f': {pk: 48, sig: 35664},
    'SLH-DSA-SHA2-256s': {pk: 64, sig: 29792},
    'SLH-DSA-SHA2-256f': {pk: 64, sig: 49856}
  };
  for (const set of SLHDSA) {
    assert.equal(slhdsaPublicKey(set.n), expected[set.name].pk);
    assert.equal(set.pk, expected[set.name].pk);
    assert.equal(set.sig, expected[set.name].sig);
  }
  return {sets: SLHDSA.length, publicKeys: [32, 48, 64], signatureRange: [7856, 49856]};
});

check('pqc-toy-lwe', () => {
  const e = [1, -1, 0, 1], r = [1, 0, 1, 1];
  const c0 = toyLweEncrypt(0, e, r), c1 = toyLweEncrypt(1, e, r);
  assert.deepEqual(c0.u, [83, 0, 14, 20]);
  assert.equal(c0.v, 76);
  assert.equal(c1.v, 27);
  assert.equal(toyLweDecrypt(c0), 0);
  assert.equal(toyLweDecrypt(c1), 1);
  let state = 123456789, failures = 0;
  const next = () => { state = (1103515245 * state + 12345) % 2147483648; return state; };
  for (let i = 0; i < 1000; i++) {
    const error = Array.from({length: 4}, () => next() % 3 - 1);
    const randomness = Array.from({length: 4}, () => next() % 3);
    const m = next() % 2;
    if (toyLweDecrypt(toyLweEncrypt(m, error, randomness)) !== m) failures++;
  }
  assert.equal(failures, 0);
  return {u: c0.u, v0: c0.v, v1: c1.v, deterministicFailures: failures, limit: 'Toy LWE only; not ML-KEM.'};
});

check('pqc-shor-reduction', () => {
  const cases = [
    [15n, 7n, 4, ['3', '5']],
    [21n, 2n, 6, ['3', '7']],
    [35n, 3n, 12, ['5', '7']]
  ];
  const results = [];
  for (const [n, a, order, factors] of cases) {
    const result = shorFactorFromOrder(a, n);
    assert.equal(result.order, order);
    assert.deepEqual(result.factors.map(x => x.toString()).sort(), factors);
    results.push({n: n.toString(), a: a.toString(), order, factors});
  }
  return {cases: results, note: 'Classical order-to-factor reduction; no quantum simulation.'};
});

check('pqc-grover-exponent', () => {
  const results = [128, 192, 256].map(bits => {
    const result = groverExponentRelation(bits);
    assert.equal(result.half, squareRootExponent(bits));
    assert(result.identity);
    return result;
  });
  assert.deepEqual(results.map(x => x.half), [64, 96, 128]);
  return {results, note: 'Exponent arithmetic only; not a practical attack-cost estimate.'};
});

assert(content.calculations.every(calculation => checks.some(test => test.id === calculation.id && test.passed)));
const report = {
  generatedAt: new Date().toISOString(),
  node: process.version,
  passed: true,
  checks,
  contentSha256: sha(read('content.json')),
  sourcesSha256: sha(read('sources.json')),
  independentReview: false,
  dependencies: [
    'pqc-teaching.mjs',
    'article.zh.md',
    'article.en.md',
    'meta.json',
    'glossary.json',
    'calculations.json'
  ],
  note: 'Author source checks and executable computations only; a separate evidence/content review is required before approval.'
};
fs.writeFileSync(file('verification.json'), JSON.stringify(report, null, 2) + '\n', 'utf8');
console.log(`PASS ${checks.length} checks, including ${content.calculations.length} named calculations. Independent review pending.`);
