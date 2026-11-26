/**
 * Educational SEED block cipher.
 * NOT production cryptography: JavaScript integer operations are not
 * constant-time, table lookups leak memory-access patterns, secrets are not
 * reliably erased, and this file implements neither a mode of operation nor
 * authentication.
 *
 * Specification: H.J. Lee, S.J. Lee, J.H. Yoon, D.H. Cheon and J.I. Lee,
 * "The SEED Encryption Algorithm", RFC 4269, December 2005. Section 2 defines
 * the 16-round Feistel structure, F and G, the key schedule and KC constants;
 * Appendix A defines S0/S1 and SS0-SS3; Appendix B gives the test vectors and
 * per-round intermediate values. RFC 4269 obsoletes RFC 4009 to correct
 * ambiguous F and SS-box definitions; the algorithm itself is unchanged.
 * The tables in sboxes.json are the Appendix A values.
 * This is original teaching code, not a copy of a reference implementation.
 */

import fs from 'node:fs';

const rawBoxes = JSON.parse(fs.readFileSync(new URL('./sboxes.json', import.meta.url), 'utf8'));
export const SBOXES = Object.freeze({
  S0: Uint8Array.from(rawBoxes.S0),
  S1: Uint8Array.from(rawBoxes.S1),
  SS0: Uint32Array.from(rawBoxes.SS0),
  SS1: Uint32Array.from(rawBoxes.SS1),
  SS2: Uint32Array.from(rawBoxes.SS2),
  SS3: Uint32Array.from(rawBoxes.SS3)
});
const {SS0, SS1, SS2, SS3} = SBOXES;

export const KC = Object.freeze([
  0x9E3779B9,
  0x3C6EF373,
  0x78DDE6E6,
  0xF1BBCDCC,
  0xE3779B99,
  0xC6EF3733,
  0x8DDE6E67,
  0x1BBCDCCF,
  0x3779B99E,
  0x6EF3733C,
  0xDDE6E678,
  0xBBCDCCF1,
  0x779B99E3,
  0xEF3733C6,
  0xDE6E678D,
  0xBCDCCF1B
]);

const u32 = value => value >>> 0;
const MASK32 = 0xffffffffn;
const MASK64 = 0xffffffffffffffffn;

function requireHex(value, length, label) {
  const pattern = new RegExp(`^[0-9a-fA-F]{${length}}$`);
  if (typeof value !== 'string' || !pattern.test(value)) {
    throw new TypeError(`${label} must be a ${length}-digit hexadecimal string`);
  }
  return value.toLowerCase();
}

function wordFromHex(hex, offset) {
  return parseInt(hex.slice(offset, offset + 8), 16) >>> 0;
}

export function seedG(input) {
  const x = u32(input);
  return (SS0[x & 0xff] ^ SS1[(x >>> 8) & 0xff] ^ SS2[(x >>> 16) & 0xff] ^ SS3[(x >>> 24) & 0xff]) >>> 0;
}

export function seedF(ki0, ki1, r0, r1) {
  const t0 = u32(r0 ^ ki0);
  const t1 = u32(r1 ^ ki1);
  const g1 = seedG(u32(t0 ^ t1));
  const g2 = seedG(u32(g1 + t0));
  const g3 = seedG(u32(g2 + g1));
  return {r0: u32(g3 + g2), r1: g3};
}

export function seedExpandKey(keyHex) {
  const hex = requireHex(keyHex, 32, 'key');
  let key0 = wordFromHex(hex, 0);
  let key1 = wordFromHex(hex, 8);
  let key2 = wordFromHex(hex, 16);
  let key3 = wordFromHex(hex, 24);
  const roundKeys = [];
  for (let round = 1; round <= 16; round += 1) {
    const kc = KC[round - 1];
    const ki0 = seedG(u32(key0 + key2 - kc));
    const ki1 = seedG(u32(key1 - key3 + kc));
    roundKeys.push({ki0, ki1});
    if (round % 2 === 1) {
      const old0 = key0;
      const old1 = key1;
      key0 = u32((old0 >>> 8) | ((old1 & 0xff) << 24));
      key1 = u32((old1 >>> 8) | ((old0 & 0xff) << 24));
    } else {
      const old2 = key2;
      const old3 = key3;
      key2 = u32((old2 << 8) | (old3 >>> 24));
      key3 = u32((old3 << 8) | (old2 >>> 24));
    }
  }
  return roundKeys;
}

function cryptBlock(blockHex, roundKeys) {
  const block = BigInt('0x' + blockHex);
  let L = (block >> 64n) & MASK64;
  let R = block & MASK64;
  const rounds = [];
  for (let index = 0; index < 16; index += 1) {
    const key = roundKeys[index];
    const r0 = Number((R >> 32n) & 0xffffffffn) >>> 0;
    const r1 = Number(R & 0xffffffffn) >>> 0;
    const f = seedF(key.ki0, key.ki1, r0, r1);
    const f64 = (BigInt(f.r0) << 32n) | BigInt(f.r1);
    const oldL = L;
    const oldR = R;
    if (index < 15) {
      L = oldR;
      R = (oldL ^ f64) & MASK64;
    } else {
      L = (oldL ^ f64) & MASK64;
      R = oldR;
    }
    rounds.push({
      round: index + 1,
      ki0: key.ki0,
      ki1: key.ki1,
      l0: Number((L >> 32n) & 0xffffffffn) >>> 0,
      l1: Number(L & 0xffffffffn) >>> 0,
      r0: Number((R >> 32n) & 0xffffffffn) >>> 0,
      r1: Number(R & 0xffffffffn) >>> 0
    });
  }
  return {ciphertext: ((L << 64n) | R).toString(16).padStart(32, '0'), rounds};
}

export function seedEncryptRounds(plaintextHex, keyHex) {
  return cryptBlock(requireHex(plaintextHex, 32, 'plaintext'), seedExpandKey(keyHex)).rounds;
}

export function seedEncryptBlock(plaintextHex, keyHex) {
  return cryptBlock(requireHex(plaintextHex, 32, 'plaintext'), seedExpandKey(keyHex)).ciphertext;
}

export function seedDecryptBlock(ciphertextHex, keyHex) {
  const schedule = seedExpandKey(keyHex);
  const hex = requireHex(ciphertextHex, 32, 'ciphertext');
  return cryptBlock(hex, [...schedule].reverse()).ciphertext;
}

export const VECTORS = Object.freeze([
  {
    key: '00000000000000000000000000000000',
    plaintext: '000102030405060708090a0b0c0d0e0f',
    ciphertext: '5ebac6e0054e166819aff1cc6d346cdb'
  },
  {
    key: '000102030405060708090a0b0c0d0e0f',
    plaintext: '00000000000000000000000000000000',
    ciphertext: 'c11f22f20140505084483597e4370f43'
  },
  {
    key: '4706480851e61be85d74bfb3fd956185',
    plaintext: '83a2f8a288641fb9a4e9a5cc2f131c7d',
    ciphertext: 'ee54d13ebcae706d226bc3142cd40d4a'
  },
  {
    key: '28dbc3bc49ffd87dcfa509b11d422be7',
    plaintext: 'b41e6be2eba84a148e2eed84593c5ec7',
    ciphertext: '9b9b7bfcd1813cb95d0b3618f40f5122'
  }
]);
