/**
 * Educational CLEFIA block cipher.
 * NOT production cryptography: JavaScript operations are not constant-time,
 * table lookups leak memory-access patterns, secrets are not reliably erased,
 * and this file implements neither a mode of operation nor authentication.
 *
 * Specification: M. Katagi and S. Moriai, "The 128-Bit Blockcipher CLEFIA",
 * RFC 6114, March 2011. Sections 4-6 define GFN_{4,r}/GFN_{8,r}, F0/F1,
 * S0/S1, M0/M1, the double-swap Sigma, the CON constants and the key
 * schedules; Appendices A and B give the test vectors and intermediates.
 * RFC 6114 is Informational. The S-box tables in sboxes.json are Tables 1-2.
 * This is original teaching code, not a copy of a reference implementation.
 */

import fs from 'node:fs';

const rawBoxes = JSON.parse(fs.readFileSync(new URL('./sboxes.json', import.meta.url), 'utf8'));
export const SBOXES = Object.freeze({
  S0: Uint8Array.from(rawBoxes.S0),
  S1: Uint8Array.from(rawBoxes.S1)
});
const {S0, S1} = SBOXES;

const MASK32 = 0xffffffffn;
const MASK128 = (1n << 128n) - 1n;
const MASK57 = (1n << 57n) - 1n;
const u32 = value => value >>> 0;

export const GFN_ROUNDS = Object.freeze({128: 18, 192: 22, 256: 26});

function requireHex(value, length, label) {
  const pattern = new RegExp(`^[0-9a-fA-F]{${length}}$`);
  if (typeof value !== 'string' || !pattern.test(value)) {
    throw new TypeError(`${label} must be a ${length}-digit hexadecimal string`);
  }
  return value.toLowerCase();
}

export function gf8Mul(a, b) {
  let x = a & 0xff;
  let y = b & 0xff;
  let product = 0;
  for (let bit = 0; bit < 8; bit += 1) {
    if (y & 1) product ^= x;
    const high = x & 0x80;
    x = (x << 1) & 0xff;
    if (high) x ^= 0x1d;
    y >>= 1;
  }
  return product & 0xff;
}

const m2 = value => gf8Mul(value, 0x02);
const m4 = value => gf8Mul(value, 0x04);
const m6 = value => gf8Mul(value, 0x06);
const m8 = value => gf8Mul(value, 0x08);
const ma = value => gf8Mul(value, 0x0a);

const m0 = t => {
  const [a, b, c, d] = t;
  return [
    u32(a ^ m2(b) ^ m4(c) ^ m6(d)),
    u32(m2(a) ^ b ^ m6(c) ^ m4(d)),
    u32(m4(a) ^ m6(b) ^ c ^ m2(d)),
    u32(m6(a) ^ m4(b) ^ m2(c) ^ d)
  ];
};

const m1 = t => {
  const [a, b, c, d] = t;
  return [
    u32(a ^ m8(b) ^ m2(c) ^ ma(d)),
    u32(m8(a) ^ b ^ ma(c) ^ m2(d)),
    u32(m2(a) ^ ma(b) ^ c ^ m8(d)),
    u32(ma(a) ^ m2(b) ^ m8(c) ^ d)
  ];
};

const bytesOf = value => [
  Number((value >>> 24) & 0xff),
  Number((value >>> 16) & 0xff),
  Number((value >>> 8) & 0xff),
  Number(value & 0xff)
];
const wordOf = bytes => ((bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3]) >>> 0;

export function clefiaF0(roundKey, input) {
  const t = bytesOf(u32(roundKey ^ input));
  return wordOf(m0([S0[t[0]], S1[t[1]], S0[t[2]], S1[t[3]]]));
}

export function clefiaF1(roundKey, input) {
  const t = bytesOf(u32(roundKey ^ input));
  return wordOf(m1([S1[t[0]], S0[t[1]], S1[t[2]], S0[t[3]]]));
}

const sigma = value => {
  const x = value & MASK128;
  const part1 = (x >> 64n) & MASK57;
  const part2 = x & 0x7fn;
  const part3 = (x >> 121n) & 0x7fn;
  const part4 = (x >> 7n) & MASK57;
  return ((part1 << 71n) | (part2 << 64n) | (part3 << 57n) | part4) & MASK128;
};
export {sigma as clefiaSigma};

function gfn4(roundKeys, input, rounds) {
  let [t0, t1, t2, t3] = input;
  for (let index = 0; index < rounds; index += 1) {
    t1 = u32(t1 ^ clefiaF0(roundKeys[2 * index], t0));
    t3 = u32(t3 ^ clefiaF1(roundKeys[2 * index + 1], t2));
    [t0, t1, t2, t3] = [t1, t2, t3, t0];
  }
  return [t3, t0, t1, t2];
}

function gfn8(roundKeys, input, rounds) {
  let t = [...input];
  for (let index = 0; index < rounds; index += 1) {
    t[1] = u32(t[1] ^ clefiaF0(roundKeys[4 * index], t[0]));
    t[3] = u32(t[3] ^ clefiaF1(roundKeys[4 * index + 1], t[2]));
    t[5] = u32(t[5] ^ clefiaF0(roundKeys[4 * index + 2], t[4]));
    t[7] = u32(t[7] ^ clefiaF1(roundKeys[4 * index + 3], t[6]));
    t = [t[1], t[2], t[3], t[4], t[5], t[6], t[7], t[0]];
  }
  return [t[7], t[0], t[1], t[2], t[3], t[4], t[5], t[6]];
}

function gfninv4(roundKeys, input, rounds) {
  let [t0, t1, t2, t3] = input;
  for (let index = 0; index < rounds; index += 1) {
    t1 = u32(t1 ^ clefiaF0(roundKeys[2 * (rounds - index) - 2], t0));
    t3 = u32(t3 ^ clefiaF1(roundKeys[2 * (rounds - index) - 1], t2));
    [t0, t1, t2, t3] = [t3, t0, t1, t2];
  }
  return [t1, t2, t3, t0];
}

const CON_CONFIG = Object.freeze({
  128: {count: 60, length: 30, iv: 0x428a},
  192: {count: 84, length: 42, iv: 0x7137},
  256: {count: 92, length: 46, iv: 0xb5c0}
});
const P16 = 0xb7e1;
const Q16 = 0x243f;
const GF16_POLY = 0x1a831;

function gf16Mul(a, b) {
  let x = a & 0xffff;
  let y = b & 0xffff;
  let product = 0;
  for (let bit = 0; bit < 16; bit += 1) {
    if (y & 1) product ^= x;
    const high = x & 0x8000;
    x = (x << 1) & 0xffff;
    if (high) x ^= GF16_POLY & 0xffff;
    y >>= 1;
  }
  return product & 0xffff;
}

function gf16Pow(base, exponent) {
  let result = 1;
  let factor = base & 0xffff;
  let e = exponent;
  while (e > 0) {
    if (e & 1) result = gf16Mul(result, factor);
    factor = gf16Mul(factor, factor);
    e >>= 1;
  }
  return result;
}

const INV2 = gf16Pow(2, 0xffff - 1);
const rotl16 = (value, shift) => ((value << shift) | (value >>> (16 - shift))) & 0xffff;

export function clefiaConstants(keyBits) {
  const config = CON_CONFIG[keyBits];
  if (!config) throw new TypeError('Unsupported CLEFIA key size');
  const values = [];
  let t = config.iv;
  for (let index = 0; index < config.length; index += 1) {
    values.push(u32(((t ^ P16) << 16) | rotl16((~t) & 0xffff, 1)));
    values.push(u32((((~t) & 0xffff) ^ Q16) << 16 | rotl16(t, 8)));
    t = gf16Mul(t, INV2);
  }
  return values.slice(0, config.count);
}

const wordsFromHex = hex => {
  const out = [];
  for (let offset = 0; offset < hex.length; offset += 8) out.push(parseInt(hex.slice(offset, offset + 8), 16) >>> 0);
  return out;
};
const bigFromWords = words => words.reduce((value, word) => (value << 32n) | BigInt(word >>> 0), 0n) & MASK128;
const wordsFromBig = value => [
  Number((value >> 96n) & MASK64), Number((value >> 64n) & 0xffffffffn),
  Number((value >> 32n) & 0xffffffffn), Number(value & 0xffffffffn)
].map(u32);
const MASK64 = 0xffffffffffffffffn;

export function clefiaExpandKey(keyHex) {
  if (typeof keyHex !== 'string' || !/^[0-9a-fA-F]+$/.test(keyHex) || keyHex.length % 2) {
    throw new TypeError('key must be an even-length hexadecimal string');
  }
  const hex = keyHex.toLowerCase();
  const keyBits = hex.length * 4;
  if (![128, 192, 256].includes(keyBits)) {
    throw new TypeError('CLEFIA key must be 128, 192 or 256 bits');
  }
  const rounds = GFN_ROUNDS[keyBits];
  const con = clefiaConstants(keyBits);
  const keyWords = wordsFromHex(hex);
  let whitening;
  const roundKeys = [];
  let initialL = null;
  let initialLL = null;
  let initialLR = null;

  if (keyBits === 128) {
    const k = bigFromWords(keyWords);
    const lWords = gfn4(con.slice(0, 24), keyWords, 12);
    let l = bigFromWords(lWords);
    initialL = l;
    whitening = keyWords.slice();
    for (let index = 0; index < 9; index += 1) {
      const offset = 24 + 4 * index;
      const constant = bigFromWords(con.slice(offset, offset + 4));
      let t = l ^ constant;
      l = sigma(l);
      if (index % 2 === 1) t ^= k;
      roundKeys.push(...wordsFromBig(t));
    }
  } else {
    const KL = keyWords.slice(0, 4);
    const KR = keyBits === 192
      ? [keyWords[4], keyWords[5], u32(~keyWords[0]), u32(~keyWords[1])]
      : keyWords.slice(4, 8);
    const kl = bigFromWords(KL);
    const kr = bigFromWords(KR);
    const lWords = gfn8(con.slice(0, 40), [...KL, ...KR], 10);
    let ll = bigFromWords(lWords.slice(0, 4));
    let lr = bigFromWords(lWords.slice(4, 8));
    initialLL = ll;
    initialLR = lr;
    whitening = KL.map((word, index) => u32(word ^ KR[index]));
    const iterations = keyBits === 192 ? 11 : 13;
    for (let index = 0; index < iterations; index += 1) {
      const offset = 40 + 4 * index;
      const constant = bigFromWords(con.slice(offset, offset + 4));
      let t;
      if (index % 4 === 0 || index % 4 === 1) {
        t = ll ^ constant;
        ll = sigma(ll);
        if (index % 2 === 1) t ^= kr;
      } else {
        t = lr ^ constant;
        lr = sigma(lr);
        if (index % 2 === 1) t ^= kl;
      }
      roundKeys.push(...wordsFromBig(t));
    }
  }

  return {keyBits, rounds, whitening, roundKeys, con, L: initialL, LL: initialLL, LR: initialLR};
}

function fDetails(kind, roundKey, input) {
  const keyAdd = u32(roundKey ^ input);
  const bytes = bytesOf(keyAdd);
  const substituted = kind === 0
    ? [S0[bytes[0]], S1[bytes[1]], S0[bytes[2]], S1[bytes[3]]]
    : [S1[bytes[0]], S0[bytes[1]], S1[bytes[2]], S0[bytes[3]]];
  const mixed = kind === 0 ? m0(substituted) : m1(substituted);
  return {
    kind: kind === 0 ? 'F0' : 'F1',
    input,
    roundKey,
    keyAdd,
    afterS: wordOf(substituted),
    afterM: wordOf(mixed)
  };
}

export function clefiaEncryptRounds(plaintextHex, keyHex) {
  const schedule = clefiaExpandKey(keyHex);
  const p = wordsFromHex(requireHex(plaintextHex, 32, 'plaintext'));
  let t = [p[0], u32(p[1] ^ schedule.whitening[0]), p[2], u32(p[3] ^ schedule.whitening[1])];
  const whitened = [...t];
  const rounds = [];
  for (let index = 0; index < schedule.rounds; index += 1) {
    const input = [...t];
    const f0 = fDetails(0, schedule.roundKeys[2 * index], t[0]);
    const f1 = fDetails(1, schedule.roundKeys[2 * index + 1], t[2]);
    t[1] = u32(t[1] ^ f0.afterM);
    t[3] = u32(t[3] ^ f1.afterM);
    t = [t[1], t[2], t[3], t[0]];
    rounds.push({round: index + 1, input, f0, f1, next: [...t]});
  }
  const c = [t[3], u32(t[0] ^ schedule.whitening[2]), t[1], u32(t[2] ^ schedule.whitening[3])];
  return {whitened, rounds, ciphertext: c.map(word => word.toString(16).padStart(8, '0')).join('')};
}

export function clefiaEncryptBlock(plaintextHex, keyHex) {
  const schedule = clefiaExpandKey(keyHex);
  const p = wordsFromHex(requireHex(plaintextHex, 32, 'plaintext'));
  const t = [p[0], u32(p[1] ^ schedule.whitening[0]), p[2], u32(p[3] ^ schedule.whitening[1])];
  const y = gfn4(schedule.roundKeys, t, schedule.rounds);
  const c = [y[0], u32(y[1] ^ schedule.whitening[2]), y[2], u32(y[3] ^ schedule.whitening[3])];
  return c.map(word => word.toString(16).padStart(8, '0')).join('');
}

export function clefiaDecryptBlock(ciphertextHex, keyHex) {
  const schedule = clefiaExpandKey(keyHex);
  const c = wordsFromHex(requireHex(ciphertextHex, 32, 'ciphertext'));
  const t = [c[0], u32(c[1] ^ schedule.whitening[2]), c[2], u32(c[3] ^ schedule.whitening[3])];
  const y = gfninv4(schedule.roundKeys, t, schedule.rounds);
  const p = [y[0], u32(y[1] ^ schedule.whitening[0]), y[2], u32(y[3] ^ schedule.whitening[1])];
  return p.map(word => word.toString(16).padStart(8, '0')).join('');
}

export const VECTORS = Object.freeze([
  {
    key: 'ffeeddccbbaa99887766554433221100',
    keyBits: 128,
    rounds: 18,
    plaintext: '000102030405060708090a0b0c0d0e0f',
    ciphertext: 'de2bf2fd9b74aacdf1298555459494fd'
  },
  {
    key: 'ffeeddccbbaa99887766554433221100f0e0d0c0b0a09080',
    keyBits: 192,
    rounds: 22,
    plaintext: '000102030405060708090a0b0c0d0e0f',
    ciphertext: 'e2482f649f028dc480dda184fde181ad'
  },
  {
    key: 'ffeeddccbbaa99887766554433221100f0e0d0c0b0a090807060504030201000',
    keyBits: 256,
    rounds: 26,
    plaintext: '000102030405060708090a0b0c0d0e0f',
    ciphertext: 'a1397814289de80c10da46d1fa48b38a'
  }
]);
