const MASK64 = (1n << 64n) - 1n;

const primes = count => {
  const out = [];
  for (let candidate = 2; out.length < count; candidate += 1) {
    if (out.every(prime => candidate % prime !== 0)) out.push(candidate);
  }
  return out;
};

const isqrt = n => {
  if (n < 2n) return n;
  let x = 1n << BigInt(Math.ceil(n.toString(2).length / 2));
  for (;;) {
    const y = (x + n / x) >> 1n;
    if (y >= x) return x;
    x = y;
  }
};

const icbrt = n => {
  if (n < 2n) return n;
  let x = 1n << BigInt(Math.ceil(n.toString(2).length / 3) + 1);
  for (;;) {
    const y = (2n * x + n / (x * x)) / 3n;
    if (y >= x) return x;
    x = y;
  }
};

const PRIMES = primes(80);
export const SHA256_IV = PRIMES.slice(0, 8).map(p => Number(isqrt(BigInt(p) << 64n) & 0xffffffffn));
export const SHA512_IV = PRIMES.slice(0, 8).map(p => isqrt(BigInt(p) << 128n) & MASK64);
export const SHA224_IV = PRIMES.slice(8, 16).map(p => Number(isqrt(BigInt(p) << 128n) & 0xffffffffn));
export const SHA384_IV = PRIMES.slice(8, 16).map(p => isqrt(BigInt(p) << 128n) & MASK64);
export const K256 = PRIMES.slice(0, 64).map(p => Number(icbrt(BigInt(p) << 96n) & 0xffffffffn));
export const K512 = PRIMES.slice(0, 80).map(p => icbrt(BigInt(p) << 192n) & MASK64);

export const rotr32 = (x, n) => ((x >>> n) | (x << (32 - n))) >>> 0;
export const shr32 = (x, n) => x >>> n;
export const add32 = (...values) => values.reduce((sum, value) => (sum + value) >>> 0, 0);
export const ch32 = (x, y, z) => ((x & y) ^ (~x & z)) >>> 0;
export const maj32 = (x, y, z) => ((x & y) ^ (x & z) ^ (y & z)) >>> 0;
export const bigSigma0_256 = x => (rotr32(x, 2) ^ rotr32(x, 13) ^ rotr32(x, 22)) >>> 0;
export const bigSigma1_256 = x => (rotr32(x, 6) ^ rotr32(x, 11) ^ rotr32(x, 25)) >>> 0;
export const smallSigma0_256 = x => (rotr32(x, 7) ^ rotr32(x, 18) ^ shr32(x, 3)) >>> 0;
export const smallSigma1_256 = x => (rotr32(x, 17) ^ rotr32(x, 19) ^ shr32(x, 10)) >>> 0;

export const rotr64 = (x, n) => ((x >> BigInt(n)) | (x << BigInt(64 - n))) & MASK64;
export const shr64 = (x, n) => x >> BigInt(n);
export const add64 = (...values) => values.reduce((sum, value) => (sum + value) & MASK64, 0n);
export const ch64 = (x, y, z) => ((x & y) ^ ((~x & MASK64) & z)) & MASK64;
export const maj64 = (x, y, z) => ((x & y) ^ (x & z) ^ (y & z)) & MASK64;
export const bigSigma0_512 = x => (rotr64(x, 28) ^ rotr64(x, 34) ^ rotr64(x, 39)) & MASK64;
export const bigSigma1_512 = x => (rotr64(x, 14) ^ rotr64(x, 18) ^ rotr64(x, 41)) & MASK64;
export const smallSigma0_512 = x => (rotr64(x, 1) ^ rotr64(x, 8) ^ shr64(x, 7)) & MASK64;
export const smallSigma1_512 = x => (rotr64(x, 19) ^ rotr64(x, 61) ^ shr64(x, 6)) & MASK64;

export const toBytes = input => {
  if (typeof input === 'string') return new TextEncoder().encode(input);
  if (input instanceof Uint8Array) return input;
  throw TypeError('Expected a string or Uint8Array');
};

export const bytesToHex = bytes =>
  [...bytes].map(byte => byte.toString(16).padStart(2, '0')).join('');

export const hexToBytes = hex => Uint8Array.from(Buffer.from(hex, 'hex'));

export function pad(bytes, blockBytes, lengthBytes) {
  const bitLength = BigInt(bytes.length) * 8n;
  if (lengthBytes === 8 && bitLength >= 1n << 64n) throw RangeError('SHA-256 input must be shorter than 2^64 bits');
  if (lengthBytes === 16 && bitLength >= 1n << 128n) throw RangeError('SHA-512 input must be shorter than 2^128 bits');
  const paddedLength = Math.ceil((bytes.length + 1 + lengthBytes) / blockBytes) * blockBytes;
  const out = new Uint8Array(paddedLength);
  out.set(bytes);
  out[bytes.length] = 0x80;
  const view = new DataView(out.buffer);
  if (lengthBytes === 8) {
    view.setBigUint64(paddedLength - 8, bitLength, false);
  } else {
    view.setBigUint64(paddedLength - 16, bitLength >> 64n, false);
    view.setBigUint64(paddedLength - 8, bitLength & MASK64, false);
  }
  return out;
}

export function wordsFromBlock32(block) {
  const view = new DataView(block.buffer, block.byteOffset, block.byteLength);
  return Array.from({length: 16}, (_, index) => view.getUint32(index * 4, false));
}

export function wordsFromBlock64(block) {
  const view = new DataView(block.buffer, block.byteOffset, block.byteLength);
  return Array.from({length: 16}, (_, index) => view.getBigUint64(index * 8, false));
}

export function schedule256(blockWords) {
  const w = new Array(64);
  for (let t = 0; t < 16; t += 1) w[t] = blockWords[t] >>> 0;
  for (let t = 16; t < 64; t += 1) {
    w[t] = add32(smallSigma1_256(w[t - 2]), w[t - 7], smallSigma0_256(w[t - 15]), w[t - 16]);
  }
  return w;
}

export function schedule512(blockWords) {
  const w = new Array(80);
  for (let t = 0; t < 16; t += 1) w[t] = blockWords[t] & MASK64;
  for (let t = 16; t < 80; t += 1) {
    w[t] = add64(smallSigma1_512(w[t - 2]), w[t - 7], smallSigma0_512(w[t - 15]), w[t - 16]);
  }
  return w;
}

export function compress256(state, blockWords) {
  const w = schedule256(blockWords);
  let [a, b, c, d, e, f, g, h] = state;
  for (let t = 0; t < 64; t += 1) {
    const t1 = add32(h, bigSigma1_256(e), ch32(e, f, g), K256[t], w[t]);
    const t2 = add32(bigSigma0_256(a), maj32(a, b, c));
    h = g;
    g = f;
    f = e;
    e = add32(d, t1);
    d = c;
    c = b;
    b = a;
    a = add32(t1, t2);
  }
  return [a, b, c, d, e, f, g, h].map((value, index) => add32(state[index], value));
}

export function compress512(state, blockWords) {
  const w = schedule512(blockWords);
  let [a, b, c, d, e, f, g, h] = state;
  for (let t = 0; t < 80; t += 1) {
    const t1 = add64(h, bigSigma1_512(e), ch64(e, f, g), K512[t], w[t]);
    const t2 = add64(bigSigma0_512(a), maj64(a, b, c));
    h = g;
    g = f;
    f = e;
    e = add64(d, t1);
    d = c;
    c = b;
    b = a;
    a = add64(t1, t2);
  }
  return [a, b, c, d, e, f, g, h].map((value, index) => add64(state[index], value));
}

const variants = {
  sha224: {bits: 32, blockBytes: 64, lengthBytes: 8, rounds: 64, iv: SHA224_IV, k: K256, digestBytes: 28},
  sha256: {bits: 32, blockBytes: 64, lengthBytes: 8, rounds: 64, iv: SHA256_IV, k: K256, digestBytes: 32},
  sha384: {bits: 64, blockBytes: 128, lengthBytes: 16, rounds: 80, iv: SHA384_IV, k: K512, digestBytes: 48},
  sha512: {bits: 64, blockBytes: 128, lengthBytes: 16, rounds: 80, iv: SHA512_IV, k: K512, digestBytes: 64},
};

function initialState(config) {
  return config.iv.slice();
}

export function hashWithConfig(input, config, {iv = null, totalBitLength = null} = {}) {
  const bytes = toBytes(input);
  if (totalBitLength !== null) {
    if (config.lengthBytes === 8 && totalBitLength >= 1n << 64n) throw RangeError('SHA-256 total length must be shorter than 2^64 bits');
    if (config.lengthBytes === 16 && totalBitLength >= 1n << 128n) throw RangeError('SHA-512 total length must be shorter than 2^128 bits');
  }
  const padded = totalBitLength === null
    ? pad(bytes, config.blockBytes, config.lengthBytes)
    : (() => {
        const tail = new Uint8Array(Math.ceil((bytes.length + 1 + config.lengthBytes) / config.blockBytes) * config.blockBytes);
        tail.set(bytes);
        tail[bytes.length] = 0x80;
        const view = new DataView(tail.buffer);
        if (config.lengthBytes === 8) view.setBigUint64(tail.length - 8, totalBitLength, false);
        else {
          view.setBigUint64(tail.length - 16, totalBitLength >> 64n, false);
          view.setBigUint64(tail.length - 8, totalBitLength & MASK64, false);
        }
        return tail;
      })();
  let state = iv ? iv.slice() : initialState(config);
  for (let offset = 0; offset < padded.length; offset += config.blockBytes) {
    const block = padded.subarray(offset, offset + config.blockBytes);
    state = config.bits === 32
      ? compress256(state, wordsFromBlock32(block))
      : compress512(state, wordsFromBlock64(block));
  }
  return {state, padded};
}

export function stateToBytes(state, config) {
  const out = new Uint8Array(config.bits === 32 ? state.length * 4 : state.length * 8);
  const view = new DataView(out.buffer);
  if (config.bits === 32) state.forEach((word, index) => view.setUint32(index * 4, word >>> 0, false));
  else state.forEach((word, index) => view.setBigUint64(index * 8, word & MASK64, false));
  return out.subarray(0, config.digestBytes);
}

export function hashBytes(input, variant, options = {}) {
  const config = variants[variant];
  if (!config) throw Error('Unknown SHA-2 variant ' + variant);
  const {state} = hashWithConfig(input, config, options);
  return stateToBytes(state, config);
}

export const hashHex = (input, variant, options) => bytesToHex(hashBytes(input, variant, options));

export function makeSha512tIV(t) {
  const config = {bits: 64, blockBytes: 128, lengthBytes: 16, rounds: 80, iv: null, k: K512, digestBytes: 64};
  const seed = SHA512_IV.map(word => word ^ 0xa5a5a5a5a5a5a5a5n);
  const {state} = hashWithConfig(String(`SHA-512/${t}`), config, {iv: seed});
  return state;
}

export const SHA512_224_IV = makeSha512tIV(224);
export const SHA512_256_IV = makeSha512tIV(256);

variants['sha512-224'] = {bits: 64, blockBytes: 128, lengthBytes: 16, rounds: 80, iv: SHA512_224_IV, k: K512, digestBytes: 28};
variants['sha512-256'] = {bits: 64, blockBytes: 128, lengthBytes: 16, rounds: 80, iv: SHA512_256_IV, k: K512, digestBytes: 32};

export function stepTrace256(input, steps = 4) {
  const config = variants.sha256;
  const padded = pad(toBytes(input), config.blockBytes, config.lengthBytes);
  const blockWords = wordsFromBlock32(padded.subarray(0, 64));
  const w = schedule256(blockWords);
  let [a, b, c, d, e, f, g, h] = config.iv;
  const trace = [];
  const groups = {};
  for (let t = 0; t < 64; t += 1) {
    const before = [a, b, c, d, e, f, g, h];
    const t1 = add32(h, bigSigma1_256(e), ch32(e, f, g), K256[t], w[t]);
    const t2 = add32(bigSigma0_256(a), maj32(a, b, c));
    h = g;
    g = f;
    f = e;
    e = add32(d, t1);
    d = c;
    c = b;
    b = a;
    a = add32(t1, t2);
    if (t < steps) trace.push({step: t + 1, before, t1, t2, w: w[t], k: K256[t], after: [a, b, c, d, e, f, g, h]});
    if ((t + 1) % 16 === 0) groups['after' + (t + 1)] = [a, b, c, d, e, f, g, h];
  }
  const feedForward = config.iv.map((word, index) => add32(word, [a, b, c, d, e, f, g, h][index]));
  return {
    blockWords,
    schedule: w.slice(0, 20),
    trace,
    groups,
    feedForward,
    digest: stateToBytes(feedForward, config),
  };
}

export function hmacSha2(key, data, variant) {
  const config = variants[variant];
  const blockBytes = config.blockBytes;
  let k = toBytes(key);
  if (k.length > blockBytes) k = hashBytes(k, variant);
  const paddedKey = new Uint8Array(blockBytes);
  paddedKey.set(k);
  const ipad = Uint8Array.from(paddedKey, byte => byte ^ 0x36);
  const opad = Uint8Array.from(paddedKey, byte => byte ^ 0x5c);
  const inner = hashBytes(Uint8Array.from([...ipad, ...toBytes(data)]), variant);
  return hashBytes(Uint8Array.from([...opad, ...inner]), variant);
}

export const hmacHex = (key, data, variant) => bytesToHex(hmacSha2(key, data, variant));

export function sha256StateFromDigest(hex) {
  const bytes = hexToBytes(hex);
  if (bytes.length !== 32) throw Error('SHA-256 digest must be 32 bytes');
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return Array.from({length: 8}, (_, index) => view.getUint32(index * 4, false));
}

export function sha256Continue(digestHex, suffix, prefixPaddedBytes) {
  if (prefixPaddedBytes % 64 !== 0) throw RangeError('prefixPaddedBytes must be a multiple of the SHA-256 block size');
  const state = sha256StateFromDigest(digestHex);
  const suffixBytes = toBytes(suffix);
  const totalBytes = prefixPaddedBytes + suffixBytes.length;
  const {state: next} = hashWithConfig(suffixBytes, variants.sha256, {
    iv: state,
    totalBitLength: BigInt(totalBytes) * 8n,
  });
  return bytesToHex(stateToBytes(next, variants.sha256));
}
