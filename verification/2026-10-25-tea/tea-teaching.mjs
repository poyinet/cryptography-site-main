const DELTA = 0x9e3779b9;
const MASK = 0xffffffff;

const word = (hex, offset) => parseInt(hex.slice(offset, offset + 8), 16) >>> 0;
const toHex = value => (value >>> 0).toString(16).padStart(8, '0');

function parseKey(keyHex) {
  if (keyHex.length !== 32) throw Error('TEA key must be 128 bits');
  return [word(keyHex, 0), word(keyHex, 8), word(keyHex, 16), word(keyHex, 24)];
}

function encryptWords(v0, v1, key) {
  let y = v0 >>> 0;
  let z = v1 >>> 0;
  let sum = 0;
  const [k0, k1, k2, k3] = key;
  for (let cycle = 0; cycle < 32; cycle += 1) {
    sum = (sum + DELTA) >>> 0;
    y = (y + ((((z << 4) >>> 0) + k0) ^ (z + sum) ^ (((z >>> 5) + k1) >>> 0))) >>> 0;
    z = (z + ((((y << 4) >>> 0) + k2) ^ (y + sum) ^ (((y >>> 5) + k3) >>> 0))) >>> 0;
  }
  return [y, z];
}

function decryptWords(v0, v1, key) {
  let y = v0 >>> 0;
  let z = v1 >>> 0;
  let sum = (DELTA * 32) >>> 0;
  const [k0, k1, k2, k3] = key;
  for (let cycle = 0; cycle < 32; cycle += 1) {
    z = (z - ((((y << 4) >>> 0) + k2) ^ (y + sum) ^ (((y >>> 5) + k3) >>> 0))) >>> 0;
    y = (y - ((((z << 4) >>> 0) + k0) ^ (z + sum) ^ (((z >>> 5) + k1) >>> 0))) >>> 0;
    sum = (sum - DELTA) >>> 0;
  }
  return [y, z];
}

export function teaEncrypt(plaintextHex, keyHex) {
  if (plaintextHex.length !== 16) throw Error('TEA block must be 64 bits');
  const [y, z] = encryptWords(word(plaintextHex, 0), word(plaintextHex, 8), parseKey(keyHex));
  return toHex(y) + toHex(z);
}

export function teaDecrypt(ciphertextHex, keyHex) {
  if (ciphertextHex.length !== 16) throw Error('TEA block must be 64 bits');
  const [y, z] = decryptWords(word(ciphertextHex, 0), word(ciphertextHex, 8), parseKey(keyHex));
  return toHex(y) + toHex(z);
}

export const TEA_VECTOR = {
  plaintext: '0000000000000000',
  key: '00000000000000000000000000000000',
  ciphertext: '41ea3a0a94baa940'
};

export function teaFlipHighBits(keyHex, positions) {
  const key = parseKey(keyHex);
  for (const index of positions) {
    key[index] = (key[index] ^ 0x80000000) >>> 0;
  }
  return key.map(toHex).join('');
}

export const TEA_DELTA = DELTA;
