// Teaching implementation of BLAKE2b and BLAKE2s sequential mode (RFC 7693).
// Not constant-time, no key erasure, no memory locking, no fault detection.
// Not for protecting real data.

const MASK64 = (1n << 64n) - 1n;

export const SIGMA = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
  [14, 10, 4, 8, 9, 15, 13, 6, 1, 12, 0, 2, 11, 7, 5, 3],
  [11, 8, 12, 0, 5, 2, 15, 13, 10, 14, 3, 6, 7, 1, 9, 4],
  [7, 9, 3, 1, 13, 12, 11, 14, 2, 6, 5, 10, 4, 0, 15, 8],
  [9, 0, 5, 7, 2, 4, 10, 15, 14, 1, 11, 12, 6, 8, 3, 13],
  [2, 12, 6, 10, 0, 11, 8, 3, 4, 13, 7, 5, 15, 14, 1, 9],
  [12, 5, 1, 15, 14, 13, 4, 10, 0, 7, 6, 3, 9, 2, 8, 11],
  [13, 11, 7, 14, 12, 1, 3, 9, 5, 0, 15, 4, 8, 6, 2, 10],
  [6, 15, 14, 9, 11, 3, 0, 8, 12, 2, 13, 7, 1, 4, 10, 5],
  [10, 2, 8, 4, 7, 6, 1, 5, 15, 11, 9, 14, 3, 12, 13, 0]
];

export const IV_B = [
  0x6a09e667f3bcc908n,
  0xbb67ae8584caa73bn,
  0x3c6ef372fe94f82bn,
  0xa54ff53a5f1d36f1n,
  0x510e527fade682d1n,
  0x9b05688c2b3e6c1fn,
  0x1f83d9abfb41bd6bn,
  0x5be0cd19137e2179n
];

export const IV_S = [
  0x6a09e667,
  0xbb67ae85,
  0x3c6ef372,
  0xa54ff53a,
  0x510e527f,
  0x9b05688c,
  0x1f83d9ab,
  0x5be0cd19
];

export const R_B = [32n, 24n, 16n, 63n];
export const R_S = [16, 12, 8, 7];

export const BB_B = 128;
export const BB_S = 64;

const enc = new TextEncoder();

export function toBytes(value) {
  if (value instanceof Uint8Array) return value;
  if (Array.isArray(value)) return Uint8Array.from(value);
  if (typeof value === 'string') return enc.encode(value);
  throw Error('Expected a string, byte array or Uint8Array');
}

export function bytesToHex(bytes) {
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}

export function hexToBytes(hex) {
  if (!/^[0-9a-fA-F]*$/.test(hex) || hex.length % 2) throw Error('Invalid hex string');
  const out = new Uint8Array(hex.length / 2);
  for (let index = 0; index < out.length; index++) out[index] = parseInt(hex.slice(2 * index, 2 * index + 2), 16);
  return out;
}

export function wordsFromBytesLE(bytes, wordBytes) {
  const words = [];
  for (let offset = 0; offset < bytes.length; offset += wordBytes) {
    if (wordBytes === 8) {
      let word = 0n;
      for (let index = 0; index < 8; index++) word |= BigInt(bytes[offset + index] ?? 0) << BigInt(8 * index);
      words.push(word & MASK64);
    } else {
      let word = 0;
      for (let index = 0; index < 4; index++) word = (word | ((bytes[offset + index] ?? 0) << (8 * index))) >>> 0;
      words.push(word);
    }
  }
  return words;
}

export function bytesFromWordsLE(words, wordBytes) {
  const out = new Uint8Array(words.length * wordBytes);
  words.forEach((word, index) => {
    for (let byte = 0; byte < wordBytes; byte++) {
      out[index * wordBytes + byte] = wordBytes === 8
        ? Number((word >> BigInt(8 * byte)) & 0xffn)
        : (word >>> (8 * byte)) & 0xff;
    }
  });
  return out;
}

export function wordsToHex(words, wordBytes) {
  return words.map(word => wordBytes === 8 ? word.toString(16).padStart(16, '0') : word.toString(16).padStart(8, '0'));
}

function rotr64(value, amount) {
  const shift = BigInt(amount);
  return ((value >> shift) | (value << (64n - shift))) & MASK64;
}

function rotr32(value, amount) {
  return ((value >>> amount) | (value << (32 - amount))) >>> 0;
}

export function isqrt(value) {
  if (value < 2n) return value;
  let x = 1n << BigInt(Math.ceil(value.toString(2).length / 2));
  for (;;) {
    const next = (x + value / x) >> 1n;
    if (next >= x) return x;
    x = next;
  }
}

export function ivFromPrimes(wordBits) {
  const primes = [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n];
  return primes.map(prime => {
    const scaled = isqrt(prime << BigInt(2 * wordBits));
    const value = scaled - isqrt(prime) * (1n << BigInt(wordBits));
    return wordBits === 64 ? value : Number(value);
  });
}

function paramBlock(outlen, keyLength) {
  return BigInt(0x01010000 | ((keyLength & 0xff) << 8) | (outlen & 0xff));
}

function mixB(v, a, b, c, d, x, y, rotations) {
  v[a] = (v[a] + v[b] + x) & MASK64;
  v[d] = rotr64(v[d] ^ v[a], rotations[0]);
  v[c] = (v[c] + v[d]) & MASK64;
  v[b] = rotr64(v[b] ^ v[c], rotations[1]);
  v[a] = (v[a] + v[b] + y) & MASK64;
  v[d] = rotr64(v[d] ^ v[a], rotations[2]);
  v[c] = (v[c] + v[d]) & MASK64;
  v[b] = rotr64(v[b] ^ v[c], rotations[3]);
}

function mixS(v, a, b, c, d, x, y, rotations) {
  v[a] = (v[a] + v[b] + x) >>> 0;
  v[d] = rotr32(v[d] ^ v[a], rotations[0]);
  v[c] = (v[c] + v[d]) >>> 0;
  v[b] = rotr32(v[b] ^ v[c], rotations[1]);
  v[a] = (v[a] + v[b] + y) >>> 0;
  v[d] = rotr32(v[d] ^ v[a], rotations[2]);
  v[c] = (v[c] + v[d]) >>> 0;
  v[b] = rotr32(v[b] ^ v[c], rotations[3]);
}

export function compressB(h, block, counter, last, {rotations = R_B, invertFinal = last, trace = false} = {}) {
  const m = wordsFromBytesLE(block, 8);
  const v = [...h, ...IV_B];
  const t = BigInt(counter);
  v[12] ^= t & MASK64;
  v[13] ^= (t >> 64n) & MASK64;
  if (invertFinal) v[14] ^= MASK64;
  const vectors = trace ? [wordsToHex(v, 8)] : null;
  for (let round = 0; round < 12; round++) {
    const s = SIGMA[round % 10];
    mixB(v, 0, 4, 8, 12, m[s[0]], m[s[1]], rotations);
    mixB(v, 1, 5, 9, 13, m[s[2]], m[s[3]], rotations);
    mixB(v, 2, 6, 10, 14, m[s[4]], m[s[5]], rotations);
    mixB(v, 3, 7, 11, 15, m[s[6]], m[s[7]], rotations);
    mixB(v, 0, 5, 10, 15, m[s[8]], m[s[9]], rotations);
    mixB(v, 1, 6, 11, 12, m[s[10]], m[s[11]], rotations);
    mixB(v, 2, 7, 8, 13, m[s[12]], m[s[13]], rotations);
    mixB(v, 3, 4, 9, 14, m[s[14]], m[s[15]], rotations);
    if (trace) vectors.push(wordsToHex(v, 8));
  }
  const out = h.map((word, index) => (word ^ v[index] ^ v[index + 8]) & MASK64);
  return trace ? {h: out, vectors} : out;
}

export function compressS(h, block, counter, last, {rotations = R_S, invertFinal = last, trace = false} = {}) {
  const m = wordsFromBytesLE(block, 4);
  const v = [...h, ...IV_S];
  const t = BigInt(counter);
  v[12] = (v[12] ^ Number(t & 0xffffffffn)) >>> 0;
  v[13] = (v[13] ^ Number((t >> 32n) & 0xffffffffn)) >>> 0;
  if (invertFinal) v[14] = (v[14] ^ 0xffffffff) >>> 0;
  const vectors = trace ? [wordsToHex(v, 4)] : null;
  for (let round = 0; round < 10; round++) {
    const s = SIGMA[round % 10];
    mixS(v, 0, 4, 8, 12, m[s[0]], m[s[1]], rotations);
    mixS(v, 1, 5, 9, 13, m[s[2]], m[s[3]], rotations);
    mixS(v, 2, 6, 10, 14, m[s[4]], m[s[5]], rotations);
    mixS(v, 3, 7, 11, 15, m[s[6]], m[s[7]], rotations);
    mixS(v, 0, 5, 10, 15, m[s[8]], m[s[9]], rotations);
    mixS(v, 1, 6, 11, 12, m[s[10]], m[s[11]], rotations);
    mixS(v, 2, 7, 8, 13, m[s[12]], m[s[13]], rotations);
    mixS(v, 3, 4, 9, 14, m[s[14]], m[s[15]], rotations);
    if (trace) vectors.push(wordsToHex(v, 4));
  }
  const out = h.map((word, index) => (word ^ v[index] ^ v[index + 8]) >>> 0);
  return trace ? {h: out, vectors} : out;
}

function padded(bytes, blockBytes) {
  const out = new Uint8Array(blockBytes);
  out.set(bytes);
  return out;
}

function config(variant) {
  if (variant === 'b' || variant === 'blake2b') return {variant: 'b', wordBytes: 8, rounds: 12, blockBytes: BB_B, maxOut: 64, maxKey: 64, iv: IV_B, compress: compressB, rotate: rotr64};
  if (variant === 's' || variant === 'blake2s') return {variant: 's', wordBytes: 4, rounds: 10, blockBytes: BB_S, maxOut: 32, maxKey: 32, iv: IV_S, compress: compressS, rotate: rotr32};
  throw Error('Unknown BLAKE2 variant');
}

export function createBlake2(variant, {outlen, key} = {}) {
  const cfg = config(variant);
  const digestLength = outlen ?? cfg.maxOut;
  const keyBytes = key === undefined || key === null ? new Uint8Array(0) : toBytes(key);
  if (!Number.isInteger(digestLength) || digestLength < 1 || digestLength > cfg.maxOut) throw Error('Invalid digest length for BLAKE2' + cfg.variant);
  if (keyBytes.length > cfg.maxKey) throw Error('Invalid key length for BLAKE2' + cfg.variant);
  const h = cfg.iv.slice();
  h[0] = cfg.variant === 'b'
    ? (h[0] ^ paramBlock(digestLength, keyBytes.length)) & MASK64
    : (h[0] ^ Number(paramBlock(digestLength, keyBytes.length))) >>> 0;
  let buffer = keyBytes.length ? padded(keyBytes, cfg.blockBytes) : new Uint8Array(0);
  let committed = 0n;
  let finished = false;

  function update(data) {
    if (finished) throw Error('update after final');
    const input = toBytes(data);
    if (!input.length) return api;
    const merged = new Uint8Array(buffer.length + input.length);
    merged.set(buffer);
    merged.set(input, buffer.length);
    buffer = merged;
    while (buffer.length > cfg.blockBytes) {
      const block = buffer.subarray(0, cfg.blockBytes);
      const counter = committed + BigInt(cfg.blockBytes);
      const output = cfg.compress(h, block, counter, false);
      for (let index = 0; index < 8; index++) h[index] = output[index];
      committed = counter;
      buffer = buffer.subarray(cfg.blockBytes);
    }
    return api;
  }

  function final() {
    if (finished) throw Error('final called twice');
    finished = true;
    const block = padded(buffer, cfg.blockBytes);
    const counter = committed + BigInt(buffer.length);
    const output = cfg.compress(h, block, counter, true);
    for (let index = 0; index < 8; index++) h[index] = output[index];
    return bytesFromWordsLE(h, cfg.wordBytes).slice(0, digestLength);
  }

  const api = {update, final, get digestLength() { return digestLength; }, get variant() { return cfg.variant; }};
  return api;
}

export function blake2b(data, outlen = 64, key = undefined) {
  const hasher = createBlake2('b', {outlen, key});
  hasher.update(data);
  return hasher.final();
}

export function blake2s(data, outlen = 32, key = undefined) {
  const hasher = createBlake2('s', {outlen, key});
  hasher.update(data);
  return hasher.final();
}

export function hashHex(variant, data, outlen, key) {
  return bytesToHex((variant === 'b' ? blake2b : blake2s)(data, outlen, key));
}

function trace(variant, data, outlen, key) {
  const cfg = config(variant);
  const message = toBytes(data);
  const keyBytes = key === undefined || key === null ? new Uint8Array(0) : toBytes(key);
  if (keyBytes.length) throw Error('The RFC worked traces are unkeyed');
  if (message.length > cfg.blockBytes) throw Error('The RFC worked traces use one block');
  const h = cfg.iv.slice();
  h[0] = cfg.variant === 'b'
    ? (h[0] ^ paramBlock(outlen, 0)) & MASK64
    : (h[0] ^ Number(paramBlock(outlen, 0))) >>> 0;
  const result = cfg.compress(h, padded(message, cfg.blockBytes), BigInt(message.length), true, {trace: true});
  return {
    vectors: result.vectors,
    h: wordsToHex(result.h, cfg.wordBytes),
    digest: bytesToHex(bytesFromWordsLE(result.h, cfg.wordBytes).slice(0, outlen))
  };
}

export function traceB(data, outlen = 64, key = undefined) {
  return trace('b', data, outlen, key);
}

export function traceS(data, outlen = 32, key = undefined) {
  return trace('s', data, outlen, key);
}
