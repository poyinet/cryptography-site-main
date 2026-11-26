/**
 * Educational XTEA block cipher, written to expose the word schedule.
 * NOT production cryptography: JavaScript operations are not constant-time,
 * secrets are copied and not reliably erased, and this has no mode or MAC.
 * Needham and Wheeler, TEA extensions (1996, revised 1997) supplies the
 * algorithm; this is original teaching code.
 */
const DELTA = 0x9e3779b9;

const fromHex = hex => {
  if (typeof hex !== 'string' || hex.length % 8 || !/^[0-9a-f]*$/i.test(hex)) {
    throw new TypeError('Expected hexadecimal words');
  }
  return (hex.match(/.{8}/g) || []).map(word => parseInt(word, 16) >>> 0);
};

const toHex = words => words.map(word => (word >>> 0).toString(16).padStart(8, '0')).join('');

function checkKey(key) {
  if (!Array.isArray(key) || key.length !== 4 || !key.every(word => Number.isInteger(word))) {
    throw new TypeError('XTEA key must be four 32-bit words');
  }
  return key.map(word => word >>> 0);
}

function checkCycles(cycles) {
  if (!Number.isInteger(cycles) || cycles < 0 || cycles > 255) {
    throw new TypeError('XTEA cycles must be an integer in 0..255');
  }
  return cycles;
}

export function xteaEncryptWords(v0, v1, key, cycles = 32) {
  const k = checkKey(key);
  const count = checkCycles(cycles);
  let y = v0 >>> 0;
  let z = v1 >>> 0;
  let sum = 0;
  const limit = (DELTA * count) >>> 0;
  while (sum !== limit) {
    y = (y + ((((z << 4) ^ (z >>> 5)) + z) ^ (sum + k[sum & 3]))) >>> 0;
    sum = (sum + DELTA) >>> 0;
    z = (z + ((((y << 4) ^ (y >>> 5)) + y) ^ (sum + k[(sum >>> 11) & 3]))) >>> 0;
  }
  return [y, z];
}

export function xteaDecryptWords(v0, v1, key, cycles = 32) {
  const k = checkKey(key);
  const count = checkCycles(cycles);
  let y = v0 >>> 0;
  let z = v1 >>> 0;
  let sum = (DELTA * count) >>> 0;
  while (sum !== 0) {
    z = (z - ((((y << 4) ^ (y >>> 5)) + y) ^ (sum + k[(sum >>> 11) & 3]))) >>> 0;
    sum = (sum - DELTA) >>> 0;
    y = (y - ((((z << 4) ^ (z >>> 5)) + z) ^ (sum + k[sum & 3]))) >>> 0;
  }
  return [y, z];
}

export function xteaEncryptBlock(plaintextHex, keyHex, cycles = 32) {
  const p = fromHex(plaintextHex);
  const k = fromHex(keyHex);
  if (p.length !== 2) throw new TypeError('XTEA plaintext must be two 32-bit words');
  if (k.length !== 4) throw new TypeError('XTEA key must be four 32-bit words');
  return toHex(xteaEncryptWords(p[0], p[1], k, cycles));
}

export function xteaDecryptBlock(ciphertextHex, keyHex, cycles = 32) {
  const c = fromHex(ciphertextHex);
  const k = fromHex(keyHex);
  if (c.length !== 2) throw new TypeError('XTEA ciphertext must be two 32-bit words');
  if (k.length !== 4) throw new TypeError('XTEA key must be four 32-bit words');
  return toHex(xteaDecryptWords(c[0], c[1], k, cycles));
}

export {fromHex, toHex};

export const VECTORS = {
  cycles32: {
    plaintext: 'af20a390547571aa',
    key: '27f917b1c1da899360e2acaaa6eb923d',
    ciphertext: 'd26428af0a202283',
    cycles: 32
  },
  cycles64: {
    plaintext: '2e6c1fe7f5571f9d',
    key: '62ee209f069b7afc376a8936cdc9e923',
    ciphertext: '7a01cbc9b03d6068',
    cycles: 64
  }
};
