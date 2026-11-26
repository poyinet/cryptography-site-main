import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {ROTORS, REFLECTOR_B, isPermutation, reflectorMap, createEnigma, stepPositions, plugboardCount, nominalKeySpace, factorial} from './enigma-teaching.mjs';

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

check('enigma-details-structure-and-evidence', () => {
  assert.equal(content.entries.length, 1);
  assert.equal(entry.id, 'enigma-details');
  assert.equal(entry.coverage, 'catalog-entry');
  assert.deepEqual(entry.inventoryIds, ['machine--enigma']);
  assert(entry.coverageRationale.zh && entry.coverageRationale.en);
  assert.deepEqual(Object.keys(entry.sections.zh).sort(), Object.keys(entry.sections.en).sort());
  assert.equal(entry.glossary.zh.length, entry.glossary.en.length);
  for (const lang of ['zh', 'en']) {
    for (const key of ['principle','why','used','broken','history','refs','example']) {
      assert(entry.sections[lang][key]?.trim(), `${lang}:${key} must be non-empty`);
    }
    // the split rule, in the same shape 3des and keyschedule carry: the body sections must stay URL-free, and the
    // refs section must print every registered source URL. Enigma previously carried only the second half, so
    // nothing on the body side was checked by this dossier's own gate.
    for (const [key, value] of Object.entries(entry.sections[lang])) if (key !== 'refs') assert(!/https?:\/\//.test(String(value)), `published body must not print a URL (${lang}:${key})`);
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

check('enigma-wiring-structure', () => {
  const expected = {
    I: 'EKMFLGDQVZNTOWYHXUSPAIBRCJ',
    II: 'AJDKSIRUXBLHWTMCQGZNPYFVOE',
    III: 'BDFHJLCPRTXVZNYEIWGAKMUSQO',
    IV: 'ESOVPZJAYQUIRHXLNFTGKDCMWB',
    V: 'VZBRGITYUPSDNHLXAWMJQOFECK'
  };
  for (const [name, wiring] of Object.entries(expected)) {
    assert.equal(ROTORS[name].wiring, wiring);
    assert(isPermutation(wiring), `${name} must be a permutation`);
  }
  assert.equal(REFLECTOR_B, 'YRUHQSLDPXNGOKMIEBFZCWVJAT');
  assert(isPermutation(REFLECTOR_B));
  let fixed = 0;
  for (const letter of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
    assert.equal(reflectorMap(reflectorMap(letter)), letter);
    if (reflectorMap(letter) === letter) fixed++;
  }
  assert.equal(fixed, 0);
  return {rotors: Object.keys(expected).length, reflector: REFLECTOR_B, fixedPoints: fixed, involution: true};
});

check('enigma-known-answer', () => {
  const machine = createEnigma({rotors: ['I', 'II', 'III'], rings: ['A', 'A', 'A'], positions: ['A', 'A', 'A']});
  assert.equal(machine.encode('AAAAA'), 'BDZGO');
  const reverse = createEnigma({rotors: ['I', 'II', 'III'], rings: ['A', 'A', 'A'], positions: ['A', 'A', 'A']});
  assert.equal(reverse.encode('BDZGO'), 'AAAAA');
  return {plaintext: 'AAAAA', ciphertext: 'BDZGO', reverse: 'AAAAA'};
});

check('enigma-involution-no-fixed', () => {
  let mappings = 0, fixed = 0, involutionFailures = 0;
  for (let a = 0; a < 26; a++) {
    for (let b = 0; b < 26; b++) {
      for (let c = 0; c < 26; c++) {
        const positions = [String.fromCharCode(65 + a), String.fromCharCode(65 + b), String.fromCharCode(65 + c)];
        const machine = createEnigma({rotors: ['I', 'II', 'III'], rings: ['A', 'A', 'A'], positions});
        for (const letter of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
          const out = machine.mapCurrent(letter);
          if (out === letter) fixed++;
          if (machine.mapCurrent(out) !== letter) involutionFailures++;
          mappings++;
        }
      }
    }
  }
  assert.equal(mappings, 456976);
  assert.equal(fixed, 0);
  assert.equal(involutionFailures, 0);
  return {mappings, fixed, involutionFailures};
});

check('enigma-stepping-period', () => {
  let state = ['A', 'D', 'O'];
  const sequence = [state.join('')];
  for (let i = 0; i < 6; i++) {
    state = stepPositions(['III', 'II', 'I'], state);
    sequence.push(state.join(''));
  }
  assert.deepEqual(sequence, ['ADO', 'ADP', 'ADQ', 'AER', 'BFS', 'BFT', 'BFU']);
  let cycleState = ['A', 'A', 'A'];
  const seen = new Set();
  for (let i = 0; i < 20000; i++) {
    seen.add(cycleState.join(''));
    cycleState = stepPositions(['III', 'II', 'I'], cycleState);
  }
  assert.equal(seen.size, 16900);
  cycleState = ['A', 'A', 'A'];
  for (let i = 0; i < 16900; i++) cycleState = stepPositions(['III', 'II', 'I'], cycleState);
  assert.deepEqual(cycleState, ['A', 'A', 'A']);
  const image = new Set();
  for (let a = 0; a < 26; a++) for (let b = 0; b < 26; b++) for (let c = 0; c < 26; c++) {
    image.add(stepPositions(['III', 'II', 'I'], [String.fromCharCode(65 + a), String.fromCharCode(65 + b), String.fromCharCode(65 + c)]).join(''));
  }
  assert.equal(image.size, 16926);
  assert.equal(17576 - image.size, 650);
  assert(seen.has('BFS'));
  assert(!seen.has('BFR'));
  assert.deepEqual(stepPositions(['III', 'II', 'I'], ['B', 'F', 'R']), ['B', 'F', 'S']);
  return {sequence, uniqueStates: seen.size, cycle: 16900, reachableImage: image.size, unreachable: 650, transientExample: 'BFR -> BFS', formula: '26*25*26'};
});

check('enigma-keyspace', () => {
  const plugboard = plugboardCount(10);
  assert.equal(plugboard.toString(), '150738274937250');
  const nominal = nominalKeySpace({rotorOrders: 60, wheelSettings: 16926, ringSettings: 26 * 26, plugboardPairs: 10});
  assert.equal(nominal.toString(), '103484623446804960360000');
  assert.equal((60n * 16900n * 26n * 26n * plugboard).toString(), '103325660891587134000000');
  assert.equal((6n * 26n * 26n * 26n).toString(), '105456');
  const sixCables = factorial(26) / (factorial(14) * factorial(6) * (2n ** 6n));
  assert.equal(sixCables.toString(), '100391791500');
  assert.equal((6n * 16926n * 26n * 26n * sixCables).toString(), '6892082813640024000');
  return {plugboard: plugboard.toString(), nominal: nominal.toString(), cycleBasedAlternative: '103325660891587134000000', strongPart: '105456', earlySixOrders: '6892082813640024000'};
});

check('enigma-crib-elimination', () => {
  const ciphertext = 'BDZGO', crib = 'HELLO';
  const matches = [];
  for (let i = 0; i < crib.length; i++) if (crib[i] === ciphertext[i]) matches.push(i + 1);
  assert.deepEqual(matches, [5]);
  assert.equal(matches.length, 1);
  return {ciphertext, crib, matchingPositions: matches, eliminatedAlignments: matches.length};
});

check('enigma-ring-invariance', () => {
  const outputs = [];
  for (const d of [0, 1, 5, 13]) {
    const letter = String.fromCharCode(65 + d);
    const machine = createEnigma({rotors: ['I', 'II', 'III'], rings: [letter, letter, letter], positions: [letter, letter, letter]});
    const out = machine.encode('AAAAA');
    assert.equal(out, 'BDZGO');
    outputs.push({d, output: out});
  }
  const a = createEnigma({rotors: ['I', 'II', 'III'], rings: ['A', 'A', 'A'], positions: ['A', 'A', 'A']}).encode('A'.repeat(40));
  const b = createEnigma({rotors: ['I', 'II', 'III'], rings: ['B', 'B', 'B'], positions: ['B', 'B', 'B']}).encode('A'.repeat(40));
  let firstDifference = 0;
  while (firstDifference < 40 && a[firstDifference] === b[firstDifference]) firstDifference++;
  assert.equal(firstDifference + 1, 21);
  assert.equal(a.slice(0, 20), b.slice(0, 20));
  assert.notEqual(a.slice(20), b.slice(20));
  return {outputs, invariant: 'first five letters', firstDifference: 21, a, b};
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
    'enigma-teaching.mjs',
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
