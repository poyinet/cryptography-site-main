export const IV = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0];

export const K = [0x00000000, 0x5a827999, 0x6ed9eba1, 0x8f1bbcdc, 0xa953fd4e];
export const K_PRIME = [0x50a28be6, 0x5c4dd124, 0x6d703ef3, 0x7a6d76e9, 0x00000000];

export const R = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
  7, 4, 13, 1, 10, 6, 15, 3, 12, 0, 9, 5, 2, 14, 11, 8,
  3, 10, 14, 4, 9, 15, 8, 1, 2, 7, 0, 6, 13, 11, 5, 12,
  1, 9, 11, 10, 0, 8, 12, 4, 13, 3, 7, 15, 14, 5, 6, 2,
  4, 0, 5, 9, 7, 12, 2, 10, 14, 1, 3, 8, 11, 6, 15, 13,
];

export const R_PRIME = [
  5, 14, 7, 0, 9, 2, 11, 4, 13, 6, 15, 8, 1, 10, 3, 12,
  6, 11, 3, 7, 0, 13, 5, 10, 14, 15, 8, 12, 4, 9, 1, 2,
  15, 5, 1, 3, 7, 14, 6, 9, 11, 8, 12, 2, 10, 0, 4, 13,
  8, 6, 4, 1, 3, 11, 15, 0, 5, 12, 2, 13, 9, 7, 10, 14,
  12, 15, 10, 4, 1, 5, 8, 7, 6, 2, 13, 14, 0, 3, 9, 11,
];

export const S = [
  11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8,
  7, 6, 8, 13, 11, 9, 7, 15, 7, 12, 15, 9, 11, 7, 13, 12,
  11, 13, 6, 7, 14, 9, 13, 15, 14, 8, 13, 6, 5, 12, 7, 5,
  11, 12, 14, 15, 14, 15, 9, 8, 9, 14, 5, 6, 8, 6, 5, 12,
  9, 15, 5, 11, 6, 8, 13, 12, 5, 12, 13, 14, 11, 8, 5, 6,
];

export const S_PRIME = [
  8, 9, 9, 11, 13, 15, 15, 5, 7, 7, 8, 11, 14, 14, 12, 6,
  9, 13, 15, 7, 12, 8, 9, 11, 7, 7, 12, 7, 6, 15, 13, 11,
  9, 7, 15, 11, 8, 6, 6, 14, 12, 13, 5, 14, 13, 13, 7, 5,
  15, 5, 8, 11, 14, 14, 6, 14, 6, 9, 12, 9, 12, 5, 15, 8,
  8, 5, 12, 9, 12, 5, 14, 6, 8, 13, 6, 5, 15, 13, 11, 11,
];

export const rotl = (x, s) => ((x << s) | (x >>> (32 - s))) >>> 0;

export const f = (j, x, y, z) => {
  if (j < 16) return (x ^ y ^ z) >>> 0;
  if (j < 32) return ((x & y) | (~x & z)) >>> 0;
  if (j < 48) return ((x | ~y) ^ z) >>> 0;
  if (j < 64) return ((x & z) | (y & ~z)) >>> 0;
  return (x ^ (y | ~z)) >>> 0;
};

export const toBytes = input => {
  if (typeof input === 'string') return new TextEncoder().encode(input);
  if (input instanceof Uint8Array) return input;
  throw TypeError('Expected a string or Uint8Array');
};

export const bytesToHex = bytes => [...bytes].map(byte => byte.toString(16).padStart(2, '0')).join('');

export function pad(bytes) {
  const bitLength = BigInt(bytes.length) * 8n;
  if (bitLength >= 1n << 64n) throw RangeError('RIPEMD-160 input must be shorter than 2^64 bits');
  const paddedLength = Math.ceil((bytes.length + 9) / 64) * 64;
  const out = new Uint8Array(paddedLength);
  out.set(bytes);
  out[bytes.length] = 0x80;
  const view = new DataView(out.buffer);
  view.setBigUint64(paddedLength - 8, bitLength, true);
  return out;
}

export function wordsFromBlock(block) {
  const view = new DataView(block.buffer, block.byteOffset, block.byteLength);
  return Array.from({length: 16}, (_, index) => view.getUint32(index * 4, true));
}

export function compress(h, blockWords) {
  let [a, b, c, d, e] = h;
  let [a2, b2, c2, d2, e2] = h;
  for (let j = 0; j < 80; j += 1) {
    const round = Math.floor(j / 16);
    let t = (rotl((a + f(j, b, c, d) + blockWords[R[j]] + K[round]) >>> 0, S[j]) + e) >>> 0;
    a = e;
    e = d;
    d = rotl(c, 10);
    c = b;
    b = t;
    t = (rotl((a2 + f(79 - j, b2, c2, d2) + blockWords[R_PRIME[j]] + K_PRIME[round]) >>> 0, S_PRIME[j]) + e2) >>> 0;
    a2 = e2;
    e2 = d2;
    d2 = rotl(c2, 10);
    c2 = b2;
    b2 = t;
  }
  const t = (h[1] + c + d2) >>> 0;
  const h1 = (h[2] + d + e2) >>> 0;
  const h2 = (h[3] + e + a2) >>> 0;
  const h3 = (h[4] + a + b2) >>> 0;
  const h4 = (h[0] + b + c2) >>> 0;
  return [t, h1, h2, h3, h4];
}

export function ripemd160(input, {iv = IV} = {}) {
  const padded = pad(toBytes(input));
  let h = iv.slice();
  const blocks = [];
  for (let offset = 0; offset < padded.length; offset += 64) {
    const block = padded.subarray(offset, offset + 64);
    const words = wordsFromBlock(block);
    blocks.push(words);
    h = compress(h, words);
  }
  const digest = new Uint8Array(20);
  const view = new DataView(digest.buffer);
  h.forEach((word, index) => view.setUint32(index * 4, word >>> 0, true));
  return {digest, h, blocks, padded};
}

export const hashHex = (input, options) => bytesToHex(ripemd160(input, options).digest);

export function stepTrace(input, steps = 5) {
  const padded = pad(toBytes(input));
  const blockWords = wordsFromBlock(padded.subarray(0, 64));
  let [a, b, c, d, e] = IV;
  let [a2, b2, c2, d2, e2] = IV;
  const trace = [];
  const groups = {};
  for (let j = 0; j < 80; j += 1) {
    const round = Math.floor(j / 16);
    const before = [a, b, c, d, e];
    const leftT = (rotl((a + f(j, b, c, d) + blockWords[R[j]] + K[round]) >>> 0, S[j]) + e) >>> 0;
    a = e;
    e = d;
    d = rotl(c, 10);
    c = b;
    b = leftT;
    const beforePrime = [a2, b2, c2, d2, e2];
    const rightT = (rotl((a2 + f(79 - j, b2, c2, d2) + blockWords[R_PRIME[j]] + K_PRIME[round]) >>> 0, S_PRIME[j]) + e2) >>> 0;
    a2 = e2;
    e2 = d2;
    d2 = rotl(c2, 10);
    c2 = b2;
    b2 = rightT;
    if (j < steps) trace.push({step: j + 1, round: round + 1, before, beforePrime, leftT, rightT, after: [a, b, c, d, e], afterPrime: [a2, b2, c2, d2, e2]});
    if ((j + 1) % 16 === 0) groups['after' + (j + 1)] = {left: [a, b, c, d, e], right: [a2, b2, c2, d2, e2]};
  }
  const combined = [
    (IV[1] + c + d2) >>> 0,
    (IV[2] + d + e2) >>> 0,
    (IV[3] + e + a2) >>> 0,
    (IV[4] + a + b2) >>> 0,
    (IV[0] + b + c2) >>> 0,
  ];
  const digest = new Uint8Array(20);
  const view = new DataView(digest.buffer);
  combined.forEach((word, index) => view.setUint32(index * 4, word, true));
  return {blockWords, trace, groups, combined, digest};
}

export function stateFromDigest(hex) {
  const bytes = Uint8Array.from(Buffer.from(hex, 'hex'));
  if (bytes.length !== 20) throw Error('RIPEMD-160 digest must be 20 bytes');
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return Array.from({length: 5}, (_, index) => view.getUint32(index * 4, true));
}

export function continueHash(digestHex, suffix, prefixPaddedBytes) {
  if (prefixPaddedBytes % 64 !== 0) throw RangeError('prefixPaddedBytes must be a multiple of the RIPEMD-160 block size');
  const state = stateFromDigest(digestHex);
  const bytes = toBytes(suffix);
  const totalBytes = prefixPaddedBytes + bytes.length;
  const paddedLength = Math.ceil((bytes.length + 9) / 64) * 64;
  const tail = new Uint8Array(paddedLength);
  tail.set(bytes);
  tail[bytes.length] = 0x80;
  const view = new DataView(tail.buffer);
  view.setBigUint64(tail.length - 8, BigInt(totalBytes) * 8n, true);
  let h = state;
  for (let offset = 0; offset < tail.length; offset += 64) {
    h = compress(h, wordsFromBlock(tail.subarray(offset, offset + 64)));
  }
  const digest = new Uint8Array(20);
  const out = new DataView(digest.buffer);
  h.forEach((word, index) => out.setUint32(index * 4, word >>> 0, true));
  return bytesToHex(digest);
}
