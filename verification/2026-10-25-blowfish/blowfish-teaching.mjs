/**
 * Educational Blowfish block cipher with pi-derived initial tables.
 * NOT production cryptography: JavaScript operations are not constant-time,
 * secrets are copied and not reliably erased, and this has no mode or MAC.
 * Schneier, Description of a New Variable-Length Key, 64-Bit Block Cipher
 * (Blowfish), FSE 1993 supplies the algorithm; this is original teaching code.
 */

const HEX_DIGITS = 8336; // 18 P words + 4 * 256 S-box words, in hexadecimal
const GUARD_DIGITS = 16;

function derivePiWords() {
  const scale = 1n << BigInt(4 * (HEX_DIGITS + GUARD_DIGITS));
  const arctanInverse = x => {
    const bigX = BigInt(x);
    const square = bigX * bigX;
    let term = scale / bigX;
    let sum = 0n;
    let k = 0n;
    let sign = 1n;
    while (term !== 0n) {
      sum += sign * (term / (2n * k + 1n));
      term /= square;
      sign = -sign;
      k += 1n;
    }
    return sum;
  };
  const piScaled = 16n * arctanInverse(5) - 4n * arctanInverse(239);
  const fraction = (piScaled - 3n * scale) >> BigInt(4 * GUARD_DIGITS);
  const hex = fraction.toString(16).padStart(HEX_DIGITS, '0');
  const words = (hex.match(/.{8}/g) || []).map(word => parseInt(word, 16) >>> 0);
  if (words.length !== 1042) throw new Error('Expected 1042 pi words');
  return {
    P: words.slice(0, 18),
    S: [
      words.slice(18, 274),
      words.slice(274, 530),
      words.slice(530, 786),
      words.slice(786, 1042)
    ]
  };
}

let cachedTables;
function baseTables() {
  if (!cachedTables) cachedTables = derivePiWords();
  return {
    P: Uint32Array.from(cachedTables.P),
    S: cachedTables.S.map(box => Uint32Array.from(box))
  };
}

const fromHex = hex => {
  if (typeof hex !== 'string' || hex.length % 8 || !/^[0-9a-f]*$/i.test(hex)) {
    throw new TypeError('Expected hexadecimal words');
  }
  return (hex.match(/.{8}/g) || []).map(word => parseInt(word, 16) >>> 0);
};

const toHex = words => words.map(word => (word >>> 0).toString(16).padStart(8, '0')).join('');

function keyBytes(hex) {
  if (typeof hex !== 'string' || hex.length % 2 || !/^[0-9a-f]*$/i.test(hex)) {
    throw new TypeError('Expected an even-length hexadecimal key');
  }
  const bytes = Uint8Array.from(hex.match(/../g) || [], value => parseInt(value, 16));
  if (bytes.length < 4 || bytes.length > 56) throw new TypeError('Blowfish key must be 4..56 bytes');
  return bytes;
}

function functionF(value, S) {
  const a = (value >>> 24) & 0xff;
  const b = (value >>> 16) & 0xff;
  const c = (value >>> 8) & 0xff;
  const d = value & 0xff;
  const first = (S[0][a] + S[1][b]) >>> 0;
  return ((first ^ S[2][c]) + S[3][d]) >>> 0;
}

function encryptWords(left, right, P, S) {
  let xL = left >>> 0;
  let xR = right >>> 0;
  for (let round = 0; round < 16; round += 1) {
    xL = (xL ^ P[round]) >>> 0;
    xR = (xR ^ functionF(xL, S)) >>> 0;
    const swap = xL;
    xL = xR;
    xR = swap;
  }
  const undo = xL;
  xL = xR;
  xR = undo;
  xR = (xR ^ P[16]) >>> 0;
  xL = (xL ^ P[17]) >>> 0;
  return [xL, xR];
}

function decryptWords(left, right, P, S) {
  let xL = left >>> 0;
  let xR = right >>> 0;
  for (let round = 0; round < 16; round += 1) {
    xL = (xL ^ P[17 - round]) >>> 0;
    xR = (xR ^ functionF(xL, S)) >>> 0;
    const swap = xL;
    xL = xR;
    xR = swap;
  }
  const undo = xL;
  xL = xR;
  xR = undo;
  xR = (xR ^ P[1]) >>> 0;
  xL = (xL ^ P[0]) >>> 0;
  return [xL, xR];
}

export function blowfishExpandKey(keyHex) {
  const key = keyBytes(keyHex);
  const {P, S} = baseTables();
  let index = 0;
  for (let word = 0; word < 18; word += 1) {
    let value = 0;
    for (let byte = 0; byte < 4; byte += 1) {
      value = ((value << 8) | key[index % key.length]) >>> 0;
      index += 1;
    }
    P[word] = (P[word] ^ value) >>> 0;
  }
  let left = 0;
  let right = 0;
  for (let word = 0; word < 18; word += 2) {
    const result = encryptWords(left, right, P, S);
    left = result[0];
    right = result[1];
    P[word] = left;
    P[word + 1] = right;
  }
  for (let box = 0; box < 4; box += 1) {
    for (let word = 0; word < 256; word += 2) {
      const result = encryptWords(left, right, P, S);
      left = result[0];
      right = result[1];
      S[box][word] = left;
      S[box][word + 1] = right;
    }
  }
  return {P, S};
}

export function blowfishEncryptBlock(plaintextHex, keyHex) {
  const block = fromHex(plaintextHex);
  if (block.length !== 2) throw new TypeError('Blowfish plaintext must be two 32-bit words');
  const {P, S} = blowfishExpandKey(keyHex);
  return toHex(encryptWords(block[0], block[1], P, S));
}

export function blowfishDecryptBlock(ciphertextHex, keyHex) {
  const block = fromHex(ciphertextHex);
  if (block.length !== 2) throw new TypeError('Blowfish ciphertext must be two 32-bit words');
  const {P, S} = blowfishExpandKey(keyHex);
  return toHex(decryptWords(block[0], block[1], P, S));
}

export {fromHex, toHex, derivePiWords};

export const VECTORS = [
  {key: '0000000000000000', plaintext: '0000000000000000', ciphertext: '4ef997456198dd78'},
  {key: 'ffffffffffffffff', plaintext: 'ffffffffffffffff', ciphertext: '51866fd5b85ecb8a'},
  {key: '3000000000000000', plaintext: '1000000000000001', ciphertext: '7d856f9a613063f2'},
  {key: '1111111111111111', plaintext: '1111111111111111', ciphertext: '2466dd878b963c9d'},
  {key: '0123456789abcdef', plaintext: '1111111111111111', ciphertext: '61f9c3802281b096'}
];
