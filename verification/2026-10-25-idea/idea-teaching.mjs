/**
 * Educational IDEA block cipher.
 * NOT production cryptography: JavaScript operations are not constant-time,
 * secrets are copied and not reliably erased, and this has no mode or MAC.
 * Lai and Massey, "A Proposal for a New Block Encryption Standard",
 * EUROCRYPT '90, LNCS 473, Springer, 1991, describes the algorithm; the
 * Handbook of Applied Cryptography, Chapter 7, Section 7.6, gives the
 * encryption/key-schedule/decryption algorithms and a worked vector.
 * This is original teaching code, not a copy of a reference implementation.
 */

const MODULUS = 0x10001; // 2^16 + 1
const MASK16 = 0xffff;

function parseWords(hex, count, label) {
  if (typeof hex !== 'string' || hex.length !== count * 4 || !/^[0-9a-f]+$/i.test(hex)) {
    throw new TypeError(`${label} must be ${count * 4} hexadecimal digits`);
  }
  return (hex.match(/.{4}/g) || []).map(word => parseInt(word, 16));
}

function toHex(words) {
  return words.map(word => (word & MASK16).toString(16).padStart(4, '0')).join('');
}

/** Multiplication modulo 2^16+1, with 0 standing for 2^16. */
export function modMul(a, b) {
  if (!Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b < 0 || a > MASK16 || b > MASK16) {
    throw new TypeError('IDEA multiplication operands must be 16-bit values');
  }
  const x = a === 0 ? 0x10000 : a;
  const y = b === 0 ? 0x10000 : b;
  const product = BigInt(x) * BigInt(y);
  const remainder = Number(product % 65537n);
  return remainder === 0x10000 ? 0 : remainder;
}

/** Multiplicative inverse modulo 2^16+1; inv(0)=0 because 0 represents 2^16. */
export function modInv(a) {
  if (!Number.isInteger(a) || a < 0 || a > MASK16) throw new TypeError('IDEA inverse input must be a 16-bit value');
  if (a === 0) return 0;
  let [oldR, r] = [MODULUS, a];
  let [oldS, s] = [0, 1];
  while (r !== 0) {
    const quotient = Math.floor(oldR / r);
    [oldR, r] = [r, oldR - quotient * r];
    [oldS, s] = [s, oldS - quotient * s];
  }
  let inverse = oldS % MODULUS;
  if (inverse < 0) inverse += MODULUS;
  return inverse === 0x10000 ? 0 : inverse;
}

/** Additive inverse modulo 2^16. */
export function addInv(a) {
  if (!Number.isInteger(a) || a < 0 || a > MASK16) throw new TypeError('IDEA additive-inverse input must be a 16-bit value');
  return (0x10000 - a) & MASK16;
}

const add = (a, b) => (a + b) & MASK16;
const xor = (a, b) => (a ^ b) & MASK16;

function rotateLeft25(words) {
  const joined = words.map(word => word.toString(16).padStart(4, '0')).join('');
  const value = BigInt('0x' + joined);
  const shifted = ((value << 25n) | (value >> 103n)) & ((1n << 128n) - 1n);
  return shifted.toString(16).padStart(32, '0').match(/.{4}/g).map(word => parseInt(word, 16));
}

function expandSubkeys(keyHex) {
  const keyWords = parseWords(keyHex, 8, 'IDEA key');
  const flat = [...keyWords];
  let current = keyWords;
  while (flat.length < 56) {
    current = rotateLeft25(current);
    flat.push(...current);
  }
  const encryptionRounds = [];
  for (let round = 0; round < 8; round += 1) {
    encryptionRounds.push(flat.slice(round * 6, round * 6 + 6));
  }
  const outputSubkeys = flat.slice(48, 52);
  const decryptionRounds = [];
  decryptionRounds.push([
    modInv(outputSubkeys[0]),
    addInv(outputSubkeys[1]),
    addInv(outputSubkeys[2]),
    modInv(outputSubkeys[3]),
    encryptionRounds[7][4],
    encryptionRounds[7][5]
  ]);
  for (let round = 2; round <= 8; round += 1) {
    const source = encryptionRounds[9 - round];
    decryptionRounds.push([
      modInv(source[0]),
      addInv(source[2]),
      addInv(source[1]),
      modInv(source[3]),
      encryptionRounds[8 - round][4],
      encryptionRounds[8 - round][5]
    ]);
  }
  const decryptionOutput = [
    modInv(encryptionRounds[0][0]),
    addInv(encryptionRounds[0][1]),
    addInv(encryptionRounds[0][2]),
    modInv(encryptionRounds[0][3])
  ];
  return {keyWords, flat: flat.slice(0, 52), encryptionRounds, outputSubkeys, decryptionRounds, decryptionOutput};
}

export function ideaSubkeys(keyHex) {
  const {keyWords, flat, encryptionRounds, outputSubkeys, decryptionRounds, decryptionOutput} = expandSubkeys(keyHex);
  return {keyWords, flat, encryptionRounds, outputSubkeys, decryptionRounds, decryptionOutput};
}

function roundFunction(words, roundKeys) {
  let [x1, x2, x3, x4] = words;
  const [k1, k2, k3, k4, k5, k6] = roundKeys;
  x1 = modMul(x1, k1);
  x4 = modMul(x4, k4);
  x2 = add(x2, k2);
  x3 = add(x3, k3);
  const t0 = modMul(k5, xor(x1, x3));
  const t1 = modMul(k6, add(t0, xor(x2, x4)));
  const t2 = add(t0, t1);
  x1 = xor(x1, t1);
  x4 = xor(x4, t2);
  const swap = xor(x2, t2);
  x2 = xor(x3, t1);
  x3 = swap;
  return [x1, x2, x3, x4];
}

function outputTransform(words, outputSubkeys) {
  const [x1, x2, x3, x4] = words;
  return [
    modMul(x1, outputSubkeys[0]),
    add(x3, outputSubkeys[1]),
    add(x2, outputSubkeys[2]),
    modMul(x4, outputSubkeys[3])
  ];
}

function cryptBlock(words, rounds, outputSubkeys) {
  const states = [];
  let state = words;
  for (const roundKeys of rounds) {
    state = roundFunction(state, roundKeys);
    states.push([...state]);
  }
  return {states, output: outputTransform(state, outputSubkeys)};
}

export function ideaEncryptTrace(plaintextHex, keyHex) {
  const block = parseWords(plaintextHex, 4, 'IDEA plaintext');
  const {encryptionRounds, outputSubkeys} = expandSubkeys(keyHex);
  const {states, output} = cryptBlock(block, encryptionRounds, outputSubkeys);
  return {rounds: encryptionRounds, outputSubkeys, states, ciphertext: toHex(output)};
}

export function ideaDecryptTrace(ciphertextHex, keyHex) {
  const block = parseWords(ciphertextHex, 4, 'IDEA ciphertext');
  const {decryptionRounds, decryptionOutput} = expandSubkeys(keyHex);
  const {states, output} = cryptBlock(block, decryptionRounds, decryptionOutput);
  return {rounds: decryptionRounds, outputSubkeys: decryptionOutput, states, plaintext: toHex(output)};
}

export function ideaEncryptBlock(plaintextHex, keyHex) {
  return ideaEncryptTrace(plaintextHex, keyHex).ciphertext;
}

export function ideaDecryptBlock(ciphertextHex, keyHex) {
  return ideaDecryptTrace(ciphertextHex, keyHex).plaintext;
}

export const VECTORS = [
  {key: '00010002000300040005000600070008', plaintext: '0000000100020003', ciphertext: '11fbed2b01986de5'},
  {key: '00010002000300040005000600070008', plaintext: '0102030405060708', ciphertext: '540e5fea18c2f8b1'},
  {key: '00010002000300040005000600070008', plaintext: '0019324b647d96af', ciphertext: '9f0a0ab6e10ced78'},
  {key: '00010002000300040005000600070008', plaintext: 'f5202d5b9c671b08', ciphertext: 'cf18fd7355e2c5c5'},
  {key: '00010002000300040005000600070008', plaintext: 'fae6d2beaa96826e', ciphertext: '85df52005608193d'},
  {key: '00010002000300040005000600070008', plaintext: '0a141e28323c4650', ciphertext: '2f7de750212fb734'},
  {key: '00010002000300040005000600070008', plaintext: '050a0f14191e2328', ciphertext: '7b7314925de59c09'},
  {key: '0005000a000f00140019001e00230028', plaintext: '0102030405060708', ciphertext: '3ec04780beff6e20'},
  {key: '3a984e2000195db32ee501c8c47cea60', plaintext: '0102030405060708', ciphertext: '97bcd8200780da86'},
  {key: '006400c8012c019001f4025802bc0320', plaintext: '05320a6414c819fa', ciphertext: '65be87e7a2538aed'},
  {key: '9d4075c103bc322afb03e7be6ab30006', plaintext: '0808080808080808', ciphertext: 'f5db1ac45e5ef9f9'}
];
