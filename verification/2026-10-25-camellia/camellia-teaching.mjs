/**
 * Educational Camellia block cipher.
 * NOT production cryptography: JavaScript BigInt operations are not
 * constant-time, table lookups leak memory-access patterns, secrets are not
 * reliably erased, and this file implements neither a mode of operation nor
 * authentication.
 *
 * Specification: K. Aoki, T. Ichikawa, M. Kanda, M. Matsui, S. Moriai,
 * J. Nakajima and T. Tokita, "Specification of Camellia - a 128-bit Block
 * Cipher", NTT / Mitsubishi Electric, 12 July 2000. Section 3 defines the
 * structure and key schedule, Section 4 the F/FL/FL^-1/S/P components and
 * Tables 4-7 the four s-boxes, and Appendix B the three test vectors.
 * RFC 3713 (April 2004) reproduces the same algorithm in a shorter form.
 * The tables in sboxes.json are the Section 4.5 values.
 * This is original teaching code, not a copy of a reference implementation.
 */

import fs from 'node:fs';

const rawBoxes = JSON.parse(fs.readFileSync(new URL('./sboxes.json', import.meta.url), 'utf8'));
export const SBOXES = Object.freeze({
  S1: Uint8Array.from(rawBoxes.S1),
  S2: Uint8Array.from(rawBoxes.S2),
  S3: Uint8Array.from(rawBoxes.S3),
  S4: Uint8Array.from(rawBoxes.S4)
});
const {S1, S2, S3, S4} = SBOXES;

export const SIGMA = Object.freeze([
  0xA09E667F3BCC908Bn,
  0xB67AE8584CAA73B2n,
  0xC6EF372FE94F82BEn,
  0x54FF53A5F1D36F1Cn,
  0x10E527FADE682D1Dn,
  0xB05688C2B3E6C1FDn
]);

const MASK32 = 0xffffffffn;
const MASK64 = 0xffffffffffffffffn;
const MASK128 = 0xffffffffffffffffffffffffffffffffn;

const u32 = value => value >>> 0;
const rotl32 = (value, shift) => {
  const s = shift & 31;
  return s === 0 ? u32(value) : ((value << s) | (value >>> (32 - s))) >>> 0;
};
const rotl128 = (value, shift) => {
  const s = BigInt(((shift % 128) + 128) % 128);
  return s === 0n ? value & MASK128 : ((value << s) | (value >> (128n - s))) & MASK128;
};
const hi64 = value => (value >> 64n) & MASK64;
const lo64 = value => value & MASK64;

function requireHex(value, length, label) {
  const pattern = new RegExp(`^[0-9a-fA-F]{${length}}$`);
  if (typeof value !== 'string' || !pattern.test(value)) {
    throw new TypeError(`${label} must be a ${length}-digit hexadecimal string`);
  }
  return value.toLowerCase();
}

export function camelliaKeyMaterial(keyHex) {
  if (typeof keyHex !== 'string' || !/^[0-9a-fA-F]+$/.test(keyHex) || keyHex.length % 2) {
    throw new TypeError('key must be an even-length hexadecimal string');
  }
  const hex = keyHex.toLowerCase();
  if (![32, 48, 64].includes(hex.length)) {
    throw new TypeError('Camellia key must be 128, 192 or 256 bits (32, 48 or 64 hex digits)');
  }
  const key = BigInt('0x' + hex);
  const keyBits = hex.length * 4;
  let KL;
  let KR;
  if (keyBits === 128) {
    KL = key;
    KR = 0n;
  } else if (keyBits === 192) {
    KL = (key >> 64n) & MASK128;
    const right = key & MASK64;
    KR = ((right << 64n) | ((~right) & MASK64)) & MASK128;
  } else {
    KL = (key >> 128n) & MASK128;
    KR = key & MASK128;
  }
  return {keyBits, key, KL, KR};
}

export function camelliaS(block) {
  const bytes = [];
  for (let index = 0; index < 8; index += 1) {
    bytes.push(Number((block >> BigInt(56 - 8 * index)) & 0xffn));
  }
  const order = [S1, S2, S3, S4, S2, S3, S4, S1];
  let out = 0n;
  for (let index = 0; index < 8; index += 1) {
    out = (out << 8n) | BigInt(order[index][bytes[index]]);
  }
  return out;
}

export function camelliaP(block) {
  const z = [];
  for (let index = 0; index < 8; index += 1) {
    z.push(Number((block >> BigInt(56 - 8 * index)) & 0xffn));
  }
  const y = [
    z[0] ^ z[2] ^ z[3] ^ z[5] ^ z[6] ^ z[7],
    z[0] ^ z[1] ^ z[3] ^ z[4] ^ z[6] ^ z[7],
    z[0] ^ z[1] ^ z[2] ^ z[4] ^ z[5] ^ z[7],
    z[1] ^ z[2] ^ z[3] ^ z[4] ^ z[5] ^ z[6],
    z[0] ^ z[1] ^ z[5] ^ z[6] ^ z[7],
    z[1] ^ z[2] ^ z[4] ^ z[6] ^ z[7],
    z[2] ^ z[3] ^ z[4] ^ z[5] ^ z[7],
    z[0] ^ z[3] ^ z[4] ^ z[5] ^ z[6]
  ];
  let out = 0n;
  for (const value of y) out = (out << 8n) | BigInt(value);
  return out;
}

export function camelliaF(block, subkey) {
  return camelliaP(camelliaS((block ^ subkey) & MASK64));
}

export function camelliaFL(block, subkey) {
  const x1 = Number((block >> 32n) & MASK32) >>> 0;
  let x2 = Number(block & MASK32) >>> 0;
  const k1 = Number((subkey >> 32n) & MASK32) >>> 0;
  const k2 = Number(subkey & MASK32) >>> 0;
  x2 = (x2 ^ rotl32(x1 & k1, 1)) >>> 0;
  const y1 = (x1 ^ (x2 | k2)) >>> 0;
  return (BigInt(y1) << 32n) | BigInt(x2);
}

export function camelliaFLINV(block, subkey) {
  let y1 = Number((block >> 32n) & MASK32) >>> 0;
  let y2 = Number(block & MASK32) >>> 0;
  const k1 = Number((subkey >> 32n) & MASK32) >>> 0;
  const k2 = Number(subkey & MASK32) >>> 0;
  y1 = (y1 ^ (y2 | k2)) >>> 0;
  y2 = (y2 ^ rotl32(y1 & k1, 1)) >>> 0;
  return (BigInt(y1) << 32n) | BigInt(y2);
}

export function camelliaDeriveKA(KL, KR) {
  let d1 = hi64(KL ^ KR);
  let d2 = lo64(KL ^ KR);
  d2 = (d2 ^ camelliaF(d1, SIGMA[0])) & MASK64;
  d1 = (d1 ^ camelliaF(d2, SIGMA[1])) & MASK64;
  d1 = (d1 ^ hi64(KL)) & MASK64;
  d2 = (d2 ^ lo64(KL)) & MASK64;
  d2 = (d2 ^ camelliaF(d1, SIGMA[2])) & MASK64;
  d1 = (d1 ^ camelliaF(d2, SIGMA[3])) & MASK64;
  return (d1 << 64n) | d2;
}

export function camelliaDeriveKB(KA, KR) {
  let d1 = hi64(KA ^ KR);
  let d2 = lo64(KA ^ KR);
  d2 = (d2 ^ camelliaF(d1, SIGMA[4])) & MASK64;
  d1 = (d1 ^ camelliaF(d2, SIGMA[5])) & MASK64;
  return (d1 << 64n) | d2;
}

export function camelliaExpandKey(keyHex) {
  const {keyBits, KL, KR} = camelliaKeyMaterial(keyHex);
  const KA = camelliaDeriveKA(KL, KR);
  const KB = camelliaDeriveKB(KA, KR);
  const rounds = keyBits === 128 ? 18 : 24;
  const kw = [];
  const k = [];
  const ke = [];
  const at = (value, shift) => rotl128(value, shift);

  if (keyBits === 128) {
    kw.push(hi64(at(KL, 0)), lo64(at(KL, 0)), hi64(at(KA, 111)), lo64(at(KA, 111)));
    k.push(
      hi64(at(KA, 0)), lo64(at(KA, 0)),
      hi64(at(KL, 15)), lo64(at(KL, 15)),
      hi64(at(KA, 15)), lo64(at(KA, 15)),
      hi64(at(KL, 45)), lo64(at(KL, 45)),
      hi64(at(KA, 45)), lo64(at(KL, 60)),
      hi64(at(KA, 60)), lo64(at(KA, 60)),
      hi64(at(KL, 94)), lo64(at(KL, 94)),
      hi64(at(KA, 94)), lo64(at(KA, 94)),
      hi64(at(KL, 111)), lo64(at(KL, 111))
    );
    ke.push(hi64(at(KA, 30)), lo64(at(KA, 30)), hi64(at(KL, 77)), lo64(at(KL, 77)));
  } else {
    kw.push(hi64(at(KL, 0)), lo64(at(KL, 0)), hi64(at(KB, 111)), lo64(at(KB, 111)));
    k.push(
      hi64(at(KB, 0)), lo64(at(KB, 0)),
      hi64(at(KR, 15)), lo64(at(KR, 15)),
      hi64(at(KA, 15)), lo64(at(KA, 15)),
      hi64(at(KB, 30)), lo64(at(KB, 30)),
      hi64(at(KL, 45)), lo64(at(KL, 45)),
      hi64(at(KA, 45)), lo64(at(KA, 45)),
      hi64(at(KR, 60)), lo64(at(KR, 60)),
      hi64(at(KB, 60)), lo64(at(KB, 60)),
      hi64(at(KL, 77)), lo64(at(KL, 77)),
      hi64(at(KR, 94)), lo64(at(KR, 94)),
      hi64(at(KA, 94)), lo64(at(KA, 94)),
      hi64(at(KL, 111)), lo64(at(KL, 111))
    );
    ke.push(
      hi64(at(KR, 30)), lo64(at(KR, 30)),
      hi64(at(KL, 60)), lo64(at(KL, 60)),
      hi64(at(KA, 77)), lo64(at(KA, 77))
    );
  }
  return {
    keyBits,
    rounds,
    KL,
    KR,
    KA,
    KB,
    kw,
    k,
    ke,
    decryption: {
      kw: [kw[2], kw[3], kw[0], kw[1]],
      k: [...k].reverse(),
      ke: [...ke].reverse()
    }
  };
}

export function camelliaEncryptSchedule(plaintextHex, schedule) {
  const hex = requireHex(plaintextHex, 32, 'plaintext');
  const block = BigInt('0x' + hex);
  let d1 = hi64(block);
  let d2 = lo64(block);
  d1 = (d1 ^ schedule.kw[0]) & MASK64;
  d2 = (d2 ^ schedule.kw[1]) & MASK64;
  let layer = 0;
  for (let round = 1; round <= schedule.rounds; round += 1) {
    if (round % 2 === 1) {
      d2 = (d2 ^ camelliaF(d1, schedule.k[round - 1])) & MASK64;
    } else {
      d1 = (d1 ^ camelliaF(d2, schedule.k[round - 1])) & MASK64;
    }
    if (round === 6 || round === 12 || (schedule.rounds === 24 && round === 18)) {
      d1 = camelliaFL(d1, schedule.ke[layer]);
      d2 = camelliaFLINV(d2, schedule.ke[layer + 1]);
      layer += 2;
    }
  }
  d2 = (d2 ^ schedule.kw[2]) & MASK64;
  d1 = (d1 ^ schedule.kw[3]) & MASK64;
  return ((d2 << 64n) | d1).toString(16).padStart(32, '0');
}

export function camelliaEncryptBlock(plaintextHex, keyHex) {
  return camelliaEncryptSchedule(plaintextHex, camelliaExpandKey(keyHex));
}

export function camelliaDecryptBlock(ciphertextHex, keyHex) {
  const schedule = camelliaExpandKey(keyHex);
  return camelliaEncryptSchedule(ciphertextHex, {
    rounds: schedule.rounds,
    kw: schedule.decryption.kw,
    k: schedule.decryption.k,
    ke: schedule.decryption.ke
  });
}

export const VECTORS = Object.freeze([
  {
    key: '0123456789abcdeffedcba9876543210',
    keyBits: 128,
    rounds: 18,
    plaintext: '0123456789abcdeffedcba9876543210',
    ciphertext: '67673138549669730857065648eabe43'
  },
  {
    key: '0123456789abcdeffedcba98765432100011223344556677',
    keyBits: 192,
    rounds: 24,
    plaintext: '0123456789abcdeffedcba9876543210',
    ciphertext: 'b4993401b3e996f84ee5cee7d79b09b9'
  },
  {
    key: '0123456789abcdeffedcba987654321000112233445566778899aabbccddeeff',
    keyBits: 256,
    rounds: 24,
    plaintext: '0123456789abcdeffedcba9876543210',
    ciphertext: '9acc237dff16d76c20ef7c919e3a7509'
  }
]);
