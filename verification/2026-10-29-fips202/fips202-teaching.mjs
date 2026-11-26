// FIPS 202 batch teaching implementation, adapted from the reviewed SHA-3 batch.
const MASK64 = (1n << 64n) - 1n;

export const ROUND_CONSTANTS = [
  0x0000000000000001n, 0x0000000000008082n, 0x800000000000808an, 0x8000000080008000n,
  0x000000000000808bn, 0x0000000080000001n, 0x8000000080008081n, 0x8000000000008009n,
  0x000000000000008an, 0x0000000000000088n, 0x0000000080008009n, 0x000000008000000an,
  0x000000008000808bn, 0x800000000000008bn, 0x8000000000008089n, 0x8000000000008003n,
  0x8000000000008002n, 0x8000000000000080n, 0x000000000000800an, 0x800000008000000an,
  0x8000000080008081n, 0x8000000000008080n, 0x0000000080000001n, 0x8000000080008008n,
];

export const ROTATION_OFFSETS = [1, 3, 6, 10, 15, 21, 28, 36, 45, 55, 2, 14, 27, 41, 56, 8, 25, 43, 62, 18, 39, 61, 20, 44];
export const PI_LANES = [10, 7, 11, 17, 18, 3, 5, 16, 8, 21, 24, 4, 15, 23, 19, 13, 12, 2, 20, 14, 22, 9, 6, 1];

export const rotl64 = (x, n) => ((x << BigInt(n)) | (x >> BigInt(64 - n))) & MASK64;

export function keccakF1600(state, rounds = 24) {
  const st = state.slice();
  for (let round = 0; round < rounds; round += 1) {
    const bc = new Array(5);
    for (let i = 0; i < 5; i += 1) bc[i] = st[i] ^ st[i + 5] ^ st[i + 10] ^ st[i + 15] ^ st[i + 20];
    for (let i = 0; i < 5; i += 1) {
      const t = bc[(i + 4) % 5] ^ rotl64(bc[(i + 1) % 5], 1);
      for (let j = 0; j < 25; j += 5) st[j + i] = st[j + i] ^ t;
    }
    let t = st[1];
    for (let i = 0; i < 24; i += 1) {
      const j = PI_LANES[i];
      const saved = st[j];
      st[j] = rotl64(t, ROTATION_OFFSETS[i]);
      t = saved;
    }
    for (let j = 0; j < 25; j += 5) {
      for (let i = 0; i < 5; i += 1) bc[i] = st[j + i];
      for (let i = 0; i < 5; i += 1) {
        st[j + i] = (st[j + i] ^ ((~bc[(i + 1) % 5] & MASK64) & bc[(i + 2) % 5])) & MASK64;
      }
    }
    st[0] = (st[0] ^ ROUND_CONSTANTS[round]) & MASK64;
  }
  return st;
}

export const toBytes = input => {
  if (typeof input === 'string') return new TextEncoder().encode(input);
  if (input instanceof Uint8Array) return input;
  throw TypeError('Expected a string or Uint8Array');
};

export const bytesToHex = bytes => [...bytes].map(byte => byte.toString(16).padStart(2, '0')).join('');
export const hexToBytes = hex => Uint8Array.from(Buffer.from(hex, 'hex'));

export const variants = {
  'sha3-224': {rateBytes: 144, domain: 0x06, digestBytes: 28, capacityBits: 448},
  'sha3-256': {rateBytes: 136, domain: 0x06, digestBytes: 32, capacityBits: 512},
  'sha3-384': {rateBytes: 104, domain: 0x06, digestBytes: 48, capacityBits: 768},
  'sha3-512': {rateBytes: 72, domain: 0x06, digestBytes: 64, capacityBits: 1024},
  shake128: {rateBytes: 168, domain: 0x1f, digestBytes: null, capacityBits: 256},
  shake256: {rateBytes: 136, domain: 0x1f, digestBytes: null, capacityBits: 512},
};

function xorByte(state, offset, value) {
  const lane = offset >> 3;
  const shift = BigInt((offset & 7) * 8);
  state[lane] = (state[lane] ^ (BigInt(value) << shift)) & MASK64;
}

function laneBytes(state, rateBytes) {
  const out = new Uint8Array(rateBytes);
  for (let i = 0; i < rateBytes; i += 1) {
    out[i] = Number((state[i >> 3] >> BigInt((i & 7) * 8)) & 0xffn);
  }
  return out;
}

export function absorbedState(input, variant, {pad = true} = {}) {
  const config = variants[variant];
  if (!config) throw Error('Unknown SHA-3 variant ' + variant);
  const bytes = toBytes(input);
  const state = new Array(25).fill(0n);
  const paddedLength = Math.ceil((bytes.length + 1) / config.rateBytes) * config.rateBytes;
  const padded = new Uint8Array(paddedLength);
  padded.set(bytes);
  if (pad) {
    padded[bytes.length] ^= config.domain;
    padded[padded.length - 1] ^= 0x80;
  }
  for (let offset = 0; offset < padded.length; offset += config.rateBytes) {
    for (let i = 0; i < config.rateBytes; i += 1) xorByte(state, i, padded[offset + i]);
    keccakF1600(state).forEach((lane, index) => { state[index] = lane; });
  }
  return {state, padded, config};
}

export function sponge(input, variant, outputBytes, {pad = true, domain = null} = {}) {
  const config = variants[variant];
  if (!config) throw Error('Unknown SHA-3 variant ' + variant);
  if (!Number.isInteger(outputBytes) || outputBytes < 0) throw RangeError('outputBytes must be a non-negative integer');
  const bytes = toBytes(input);
  const effectiveDomain = domain === null ? config.domain : domain;
  const state = new Array(25).fill(0n);
  const paddedLength = Math.ceil((bytes.length + 1) / config.rateBytes) * config.rateBytes;
  const padded = new Uint8Array(paddedLength);
  padded.set(bytes);
  if (pad) {
    padded[bytes.length] ^= effectiveDomain;
    padded[padded.length - 1] ^= 0x80;
  }
  for (let offset = 0; offset < padded.length; offset += config.rateBytes) {
    for (let i = 0; i < config.rateBytes; i += 1) xorByte(state, i, padded[offset + i]);
    keccakF1600(state).forEach((lane, index) => { state[index] = lane; });
  }
  const out = new Uint8Array(outputBytes);
  let written = 0;
  while (written < outputBytes) {
    const block = laneBytes(state, config.rateBytes);
    const take = Math.min(config.rateBytes, outputBytes - written);
    out.set(block.subarray(0, take), written);
    written += take;
    if (written < outputBytes) keccakF1600(state).forEach((lane, index) => { state[index] = lane; });
  }
  return out;
}

export const hashBytes = (input, variant) => {
  const config = variants[variant];
  if (!config || config.digestBytes === null) throw Error('Not a fixed-length SHA-3 variant: ' + variant);
  return sponge(input, variant, config.digestBytes);
};

export const hashHex = (input, variant) => bytesToHex(hashBytes(input, variant));

export const shakeBytes = (input, outputBytes, variant = 'shake128') => sponge(input, variant, outputBytes);
export const shakeHex = (input, outputBytes, variant = 'shake128') => bytesToHex(shakeBytes(input, outputBytes, variant));

export function keccakTrace(input, variant = 'sha3-256', rounds = 1) {
  const config = variants[variant];
  const bytes = toBytes(input);
  const paddedLength = Math.ceil((bytes.length + 1) / config.rateBytes) * config.rateBytes;
  const padded = new Uint8Array(paddedLength);
  padded.set(bytes);
  padded[bytes.length] ^= config.domain;
  padded[padded.length - 1] ^= 0x80;
  const state = new Array(25).fill(0n);
  for (let i = 0; i < config.rateBytes; i += 1) xorByte(state, i, padded[i]);
  const before = state.map(lane => lane.toString(16).padStart(16, '0'));
  const after = keccakF1600(state, rounds).map(lane => lane.toString(16).padStart(16, '0'));
  return {
    variant,
    rateBytes: config.rateBytes,
    capacityBits: config.capacityBits,
    paddedHex: bytesToHex(padded),
    stateBeforeFirstPermutation: before,
    stateAfterFirstPermutation: after,
    rounds,
  };
}

export function shakePrefixCheck(input, shortBytes, longBytes, variant = 'shake128') {
  const short = shakeBytes(input, shortBytes, variant);
  const long = shakeBytes(input, longBytes, variant);
  return {prefix: bytesToHex(short), longer: bytesToHex(long), isPrefix: [...short].every((byte, index) => byte === long[index])};
}
