import assert from 'node:assert/strict';

export const ROTORS = {
  I: {wiring: 'EKMFLGDQVZNTOWYHXUSPAIBRCJ', turnover: 'Q'},
  II: {wiring: 'AJDKSIRUXBLHWTMCQGZNPYFVOE', turnover: 'E'},
  III: {wiring: 'BDFHJLCPRTXVZNYEIWGAKMUSQO', turnover: 'V'},
  IV: {wiring: 'ESOVPZJAYQUIRHXLNFTGKDCMWB', turnover: 'J'},
  V: {wiring: 'VZBRGITYUPSDNHLXAWMJQOFECK', turnover: 'Z'}
};

export const REFLECTOR_B = 'YRUHQSLDPXNGOKMIEBFZCWVJAT';
export const REFLECTOR_C = 'FVPJIAOYEDRZXWGCTKUQSBNMHL';

const idx = ch => {
  assert(typeof ch === 'string' && /^[A-Z]$/.test(ch), `Expected one uppercase letter, got ${ch}`);
  return ch.charCodeAt(0) - 65;
};
const chr = n => String.fromCharCode(65 + ((n % 26 + 26) % 26));

function inverseWiring(wiring) {
  assert.equal(wiring.length, 26);
  const out = Array(26);
  for (let i = 0; i < 26; i++) out[idx(wiring[i])] = i;
  return out;
}

for (const rotor of Object.values(ROTORS)) rotor.inverse = inverseWiring(rotor.wiring);
const reflectorInverse = inverseWiring(REFLECTOR_B);
assert.deepEqual(reflectorInverse, [...REFLECTOR_B].map(idx));

export function isPermutation(wiring) {
  const seen = new Set([...wiring].map(idx));
  return wiring.length === 26 && seen.size === 26;
}

export function reflectorMap(letter, reflector = REFLECTOR_B) {
  return reflector[idx(letter)];
}

export function rotorForward(rotorName, letter, position, ring) {
  const rotor = ROTORS[rotorName];
  const offset = ((idx(position) - idx(ring)) % 26 + 26) % 26;
  const wired = idx(rotor.wiring[(idx(letter) + offset) % 26]);
  return chr(wired - offset);
}

export function rotorBackward(rotorName, letter, position, ring) {
  const rotor = ROTORS[rotorName];
  const offset = ((idx(position) - idx(ring)) % 26 + 26) % 26;
  const wired = rotor.inverse[(idx(letter) + offset) % 26];
  return chr(wired - offset);
}

export function plugboardMap(letter, plugboard = []) {
  for (const pair of plugboard) {
    assert.equal(pair.length, 2);
    if (pair[0] === letter) return pair[1];
    if (pair[1] === letter) return pair[0];
  }
  return letter;
}

export function stepPositions(rotorNames, positions) {
  const middle = ROTORS[rotorNames[1]], right = ROTORS[rotorNames[2]];
  const next = positions.map(idx);
  const middleAtNotch = chr(next[1]) === middle.turnover;
  const rightAtNotch = chr(next[2]) === right.turnover;
  if (middleAtNotch) {
    next[1] = (next[1] + 1) % 26;
    next[0] = (next[0] + 1) % 26;
  } else if (rightAtNotch) {
    next[1] = (next[1] + 1) % 26;
  }
  next[2] = (next[2] + 1) % 26;
  return next.map(chr);
}

export function createEnigma({rotors, rings, positions, reflector = REFLECTOR_B, plugboard = []}) {
  assert.equal(rotors.length, 3);
  assert.equal(rings.length, 3);
  assert.equal(positions.length, 3);
  for (const name of rotors) assert(ROTORS[name], `Unknown rotor ${name}`);
  let pos = [...positions];
  const rotorNames = [...rotors];

  function mapCurrent(letter) {
    let x = plugboardMap(letter, plugboard);
    x = rotorForward(rotorNames[2], x, pos[2], rings[2]);
    x = rotorForward(rotorNames[1], x, pos[1], rings[1]);
    x = rotorForward(rotorNames[0], x, pos[0], rings[0]);
    x = reflectorMap(x, reflector);
    x = rotorBackward(rotorNames[0], x, pos[0], rings[0]);
    x = rotorBackward(rotorNames[1], x, pos[1], rings[1]);
    x = rotorBackward(rotorNames[2], x, pos[2], rings[2]);
    return plugboardMap(x, plugboard);
  }

  function advance() {
    pos = stepPositions(rotorNames, pos);
  }

  function encode(text) {
    const letters = String(text).toUpperCase().replace(/[^A-Z]/g, '');
    let out = '';
    for (const letter of letters) {
      advance();
      out += mapCurrent(letter);
    }
    return out;
  }

  return {
    encode,
    mapCurrent,
    advance,
    positions: () => pos.join(''),
    setPositions: next => { pos = [...next]; }
  };
}

export function factorial(n) {
  assert(Number.isInteger(n) && n >= 0);
  let out = 1n;
  for (let i = 2n; i <= BigInt(n); i++) out *= i;
  return out;
}

export function plugboardCount(pairs) {
  assert(Number.isInteger(pairs) && pairs >= 0 && pairs <= 13);
  return factorial(26) / (factorial(26 - 2 * pairs) * factorial(pairs) * (2n ** BigInt(pairs)));
}

export function nominalKeySpace({rotorOrders = 60, wheelSettings = 16900, ringSettings = 26 * 26, plugboardPairs = 10} = {}) {
  return BigInt(rotorOrders) * BigInt(wheelSettings) * BigInt(ringSettings) * plugboardCount(plugboardPairs);
}
