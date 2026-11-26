import {createHash, createHmac} from 'node:crypto';

export const IV = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0];

export const K = [
  0x5a827999, 0x5a827999, 0x5a827999, 0x5a827999, 0x5a827999, 0x5a827999, 0x5a827999, 0x5a827999,
  0x5a827999, 0x5a827999, 0x5a827999, 0x5a827999, 0x5a827999, 0x5a827999, 0x5a827999, 0x5a827999,
  0x5a827999, 0x5a827999, 0x5a827999, 0x5a827999,
  0x6ed9eba1, 0x6ed9eba1, 0x6ed9eba1, 0x6ed9eba1, 0x6ed9eba1, 0x6ed9eba1, 0x6ed9eba1, 0x6ed9eba1,
  0x6ed9eba1, 0x6ed9eba1, 0x6ed9eba1, 0x6ed9eba1, 0x6ed9eba1, 0x6ed9eba1, 0x6ed9eba1, 0x6ed9eba1,
  0x6ed9eba1, 0x6ed9eba1, 0x6ed9eba1, 0x6ed9eba1,
  0x8f1bbcdc, 0x8f1bbcdc, 0x8f1bbcdc, 0x8f1bbcdc, 0x8f1bbcdc, 0x8f1bbcdc, 0x8f1bbcdc, 0x8f1bbcdc,
  0x8f1bbcdc, 0x8f1bbcdc, 0x8f1bbcdc, 0x8f1bbcdc, 0x8f1bbcdc, 0x8f1bbcdc, 0x8f1bbcdc, 0x8f1bbcdc,
  0x8f1bbcdc, 0x8f1bbcdc, 0x8f1bbcdc, 0x8f1bbcdc,
  0xca62c1d6, 0xca62c1d6, 0xca62c1d6, 0xca62c1d6, 0xca62c1d6, 0xca62c1d6, 0xca62c1d6, 0xca62c1d6,
  0xca62c1d6, 0xca62c1d6, 0xca62c1d6, 0xca62c1d6, 0xca62c1d6, 0xca62c1d6, 0xca62c1d6, 0xca62c1d6,
  0xca62c1d6, 0xca62c1d6, 0xca62c1d6, 0xca62c1d6,
];

export const rotl = (x, s) => ((x << s) | (x >>> (32 - s))) >>> 0;

export const f = (t, x, y, z) => {
  if (t < 20) return ((x & y) | (~x & z)) >>> 0;
  if (t < 40) return (x ^ y ^ z) >>> 0;
  if (t < 60) return ((x & y) | (x & z) | (y & z)) >>> 0;
  return (x ^ y ^ z) >>> 0;
};

export const toBytes = input => {
  if (typeof input === 'string') return new TextEncoder().encode(input);
  if (input instanceof Uint8Array) return input;
  throw TypeError('Expected a string or Uint8Array');
};

export const bytesToHex = bytes =>
  [...bytes].map(byte => byte.toString(16).padStart(2, '0')).join('');

export function pad(bytes) {
  const bitLength = BigInt(bytes.length) * 8n;
  if (bitLength >= 1n << 64n) throw RangeError('SHA-1 input must be shorter than 2^64 bits');
  const paddedLength = Math.ceil((bytes.length + 9) / 64) * 64;
  const out = new Uint8Array(paddedLength);
  out.set(bytes);
  out[bytes.length] = 0x80;
  const view = new DataView(out.buffer);
  view.setBigUint64(paddedLength - 8, bitLength, false);
  return out;
}

export function wordsFromBlock(block) {
  const view = new DataView(block.buffer, block.byteOffset, block.byteLength);
  return Array.from({length: 16}, (_, index) => view.getUint32(index * 4, false));
}

export function schedule(blockWords, rotation = 1) {
  const w = new Array(80);
  for (let t = 0; t < 16; t += 1) w[t] = blockWords[t] >>> 0;
  for (let t = 16; t < 80; t += 1) {
    w[t] = rotl((w[t - 3] ^ w[t - 8] ^ w[t - 14] ^ w[t - 16]) >>> 0, rotation);
  }
  return w;
}

export function transform(h, blockWords, {scheduleMode = 'sha1', scheduleRotation = 1, feedForward = true} = {}) {
  const w = schedule(blockWords, scheduleMode === 'sha0' ? 0 : scheduleRotation);
  let [a, b, c, d, e] = h;
  for (let t = 0; t < 80; t += 1) {
    const temp = (rotl(a, 5) + f(t, b, c, d) + e + K[t] + w[t]) >>> 0;
    e = d;
    d = c;
    c = rotl(b, 30);
    b = a;
    a = temp;
  }
  return feedForward
    ? [(h[0] + a) >>> 0, (h[1] + b) >>> 0, (h[2] + c) >>> 0, (h[3] + d) >>> 0, (h[4] + e) >>> 0]
    : [a, b, c, d, e];
}

export function sha1(input, {iv = IV, feedForward = true, scheduleMode = 'sha1', scheduleRotation = 1} = {}) {
  const padded = pad(toBytes(input));
  let h = iv.slice();
  const blocks = [];
  for (let offset = 0; offset < padded.length; offset += 64) {
    const block = padded.subarray(offset, offset + 64);
    const words = wordsFromBlock(block);
    blocks.push(words);
    h = transform(h, words, {scheduleMode, scheduleRotation, feedForward});
  }
  const digest = new Uint8Array(20);
  const view = new DataView(digest.buffer);
  h.forEach((word, index) => view.setUint32(index * 4, word >>> 0, false));
  return {digest, h, blocks, padded};
}

export const hashHex = (input, options) => bytesToHex(sha1(input, options).digest);

export function stepTrace(input, steps = 5) {
  const padded = pad(toBytes(input));
  const blockWords = wordsFromBlock(padded.subarray(0, 64));
  const w = schedule(blockWords);
  let [a, b, c, d, e] = IV;
  const trace = [];
  const groups = {};
  for (let t = 0; t < 80; t += 1) {
    const before = [a, b, c, d, e];
    const fValue = f(t, b, c, d);
    const rotated = rotl(a, 5);
    const temp = (rotated + fValue + e + K[t] + w[t]) >>> 0;
    e = d;
    d = c;
    c = rotl(b, 30);
    b = a;
    a = temp;
    const after = [a, b, c, d, e];
    if (t < steps) trace.push({step: t + 1, before, fValue, rotated, k: K[t], w: w[t], temp, after});
    if ((t + 1) % 20 === 0) groups['after' + (t + 1)] = after;
  }
  const digest = sha1(input).digest;
  return {
    blockWords,
    schedule: w.slice(0, 20),
    trace,
    groups,
    feedForward: [0, 1, 2, 3, 4].map(index => (IV[index] + [a, b, c, d, e][index]) >>> 0),
    digest,
  };
}

export function hmacSha1(key, data) {
  const blockSize = 64;
  let k = toBytes(key);
  if (k.length > blockSize) k = sha1(k).digest;
  const paddedKey = new Uint8Array(blockSize);
  paddedKey.set(k);
  const ipad = Uint8Array.from(paddedKey, byte => byte ^ 0x36);
  const opad = Uint8Array.from(paddedKey, byte => byte ^ 0x5c);
  const inner = sha1(Uint8Array.from([...ipad, ...toBytes(data)])).digest;
  return sha1(Uint8Array.from([...opad, ...inner])).digest;
}

export const hmacHex = (key, data) => bytesToHex(hmacSha1(key, data));

export {createHash, createHmac};
