/**
 * Educational ARIA block cipher.
 * NOT production cryptography: JavaScript operations are not constant-time,
 * table lookups leak memory-access patterns, secrets are not reliably erased,
 * and this file implements neither a mode of operation nor authentication.
 *
 * Specification: J. Lee, J. Lee, J. Kim, D. Kwon and C. Kim, "A Description
 * of the ARIA Encryption Algorithm", RFC 5794, March 2010. Section 2 defines
 * the key schedule, FO/FE round functions, SL1/SL2 substitution layers and
 * the A diffusion layer; Section 2.4.2 defines SB1-SB4; Appendix A gives the
 * 128/192/256-bit test data. RFC 5794 is Informational and describes ARIA as
 * the Korean standard block cipher KS X 1213:2004.
 * The tables in sboxes.json are SB1/SB2; SB3/SB4 are their inverses.
 */

import fs from 'node:fs';

const rawBoxes = JSON.parse(fs.readFileSync(new URL('./sboxes.json', import.meta.url), 'utf8'));
export const SBOXES = Object.freeze({
  SB1: Uint8Array.from(rawBoxes.SB1),
  SB2: Uint8Array.from(rawBoxes.SB2),
  SB3: Uint8Array.from(rawBoxes.SB3),
  SB4: Uint8Array.from(rawBoxes.SB4)
});
const {SB1, SB2, SB3, SB4} = SBOXES;

export const C = Object.freeze([
  0x517CC1B727220A94FE13ABE8FA9A6EE0n,
  0x6DB14ACC9E21C820FF28B1D5EF5DE2B0n,
  0xDB92371D2126E9700324977504E8C90En
]);

const MASK64 = 0xffffffffffffffffn;
const MASK128 = 0xffffffffffffffffffffffffffffffffn;

const rotl128 = (value, shift) => {
  const s = BigInt(((shift % 128) + 128) % 128);
  return s === 0n ? value & MASK128 : ((value << s) | (value >> (128n - s))) & MASK128;
};
const rotr128 = (value, shift) => {
  const s = BigInt(((shift % 128) + 128) % 128);
  return s === 0n ? value & MASK128 : ((value >> s) | (value << (128n - s))) & MASK128;
};

function requireHex(value, length, label) {
  const pattern = new RegExp(`^[0-9a-fA-F]{${length}}$`);
  if (typeof value !== 'string' || !pattern.test(value)) {
    throw new TypeError(`${label} must be a ${length}-digit hexadecimal string`);
  }
  return value.toLowerCase();
}

export function bytesToBigInt(bytes) {
  let value = 0n;
  for (const byte of bytes) value = (value << 8n) | BigInt(byte);
  return value;
}

export function bigIntToBytes(value) {
  const out = new Uint8Array(16);
  let v = value & MASK128;
  for (let index = 15; index >= 0; index -= 1) {
    out[index] = Number(v & 0xffn);
    v >>= 8n;
  }
  return out;
}

export function hexToBytes(hex) {
  return Uint8Array.from(hex.match(/../g), pair => parseInt(pair, 16));
}

export function bytesToHex(bytes) {
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}

const xorBytes = (a, b) => Uint8Array.from(a, (value, index) => value ^ b[index]);

export function ariaSL1(block) {
  const out = new Uint8Array(16);
  for (let index = 0; index < 16; index += 1) {
    const box = index % 4 === 0 ? SB1 : index % 4 === 1 ? SB2 : index % 4 === 2 ? SB3 : SB4;
    out[index] = box[block[index]];
  }
  return out;
}

export function ariaSL2(block) {
  const out = new Uint8Array(16);
  for (let index = 0; index < 16; index += 1) {
    const box = index % 4 === 0 ? SB3 : index % 4 === 1 ? SB4 : index % 4 === 2 ? SB1 : SB2;
    out[index] = box[block[index]];
  }
  return out;
}

export function ariaA(block) {
  const x = block;
  return Uint8Array.from([
    x[3] ^ x[4] ^ x[6] ^ x[8] ^ x[9] ^ x[13] ^ x[14],
    x[2] ^ x[5] ^ x[7] ^ x[8] ^ x[9] ^ x[12] ^ x[15],
    x[1] ^ x[4] ^ x[6] ^ x[10] ^ x[11] ^ x[12] ^ x[15],
    x[0] ^ x[5] ^ x[7] ^ x[10] ^ x[11] ^ x[13] ^ x[14],
    x[0] ^ x[2] ^ x[5] ^ x[8] ^ x[11] ^ x[14] ^ x[15],
    x[1] ^ x[3] ^ x[4] ^ x[9] ^ x[10] ^ x[14] ^ x[15],
    x[0] ^ x[2] ^ x[7] ^ x[9] ^ x[10] ^ x[12] ^ x[13],
    x[1] ^ x[3] ^ x[6] ^ x[8] ^ x[11] ^ x[12] ^ x[13],
    x[0] ^ x[1] ^ x[4] ^ x[7] ^ x[10] ^ x[13] ^ x[15],
    x[0] ^ x[1] ^ x[5] ^ x[6] ^ x[11] ^ x[12] ^ x[14],
    x[2] ^ x[3] ^ x[5] ^ x[6] ^ x[8] ^ x[13] ^ x[15],
    x[2] ^ x[3] ^ x[4] ^ x[7] ^ x[9] ^ x[12] ^ x[14],
    x[1] ^ x[2] ^ x[6] ^ x[7] ^ x[9] ^ x[11] ^ x[12],
    x[0] ^ x[3] ^ x[6] ^ x[7] ^ x[8] ^ x[10] ^ x[13],
    x[0] ^ x[3] ^ x[4] ^ x[5] ^ x[9] ^ x[11] ^ x[14],
    x[1] ^ x[2] ^ x[4] ^ x[5] ^ x[8] ^ x[10] ^ x[15]
  ]);
}

export const ariaFO = (block, roundKey) => ariaA(ariaSL1(xorBytes(block, roundKey)));
export const ariaFE = (block, roundKey) => ariaA(ariaSL2(xorBytes(block, roundKey)));

export function ariaKeyMaterial(keyHex) {
  if (typeof keyHex !== 'string' || !/^[0-9a-fA-F]+$/.test(keyHex) || keyHex.length % 2) {
    throw new TypeError('key must be an even-length hexadecimal string');
  }
  const hex = keyHex.toLowerCase();
  if (![32, 48, 64].includes(hex.length)) {
    throw new TypeError('ARIA key must be 128, 192 or 256 bits (32, 48 or 64 hex digits)');
  }
  const key = BigInt('0x' + hex);
  const keyBits = hex.length * 4;
  let KL;
  let KR;
  if (keyBits === 128) {
    KL = key;
    KR = 0n;
  } else if (keyBits === 192) {
    KL = key >> 64n;
    KR = (key & MASK64) << 64n;
  } else {
    KL = key >> 128n;
    KR = key & MASK128;
  }
  return {keyBits, key, KL, KR};
}

export function ariaExpandKey(keyHex) {
  const {keyBits, KL, KR} = ariaKeyMaterial(keyHex);
  const rounds = keyBits === 128 ? 12 : keyBits === 192 ? 14 : 16;
  const cks = keyBits === 128 ? [C[0], C[1], C[2]] : keyBits === 192 ? [C[1], C[2], C[0]] : [C[2], C[0], C[1]];
  const W0 = KL;
  const W1 = bytesToBigInt(ariaFO(bigIntToBytes(W0), bigIntToBytes(cks[0]))) ^ KR;
  const W2 = bytesToBigInt(ariaFE(bigIntToBytes(W1), bigIntToBytes(cks[1]))) ^ W0;
  const W3 = bytesToBigInt(ariaFO(bigIntToBytes(W2), bigIntToBytes(cks[2]))) ^ W1;
  const roundKeys = [
    W0 ^ rotr128(W1, 19),
    W1 ^ rotr128(W2, 19),
    W2 ^ rotr128(W3, 19),
    rotr128(W0, 19) ^ W3,
    W0 ^ rotr128(W1, 31),
    W1 ^ rotr128(W2, 31),
    W2 ^ rotr128(W3, 31),
    rotr128(W0, 31) ^ W3,
    W0 ^ rotl128(W1, 61),
    W1 ^ rotl128(W2, 61),
    W2 ^ rotl128(W3, 61),
    rotl128(W0, 61) ^ W3,
    W0 ^ rotl128(W1, 31),
    W1 ^ rotl128(W2, 31),
    W2 ^ rotl128(W3, 31),
    rotl128(W0, 31) ^ W3,
    W0 ^ rotl128(W1, 19)
  ].slice(0, rounds + 1).map(bigIntToBytes);
  const decryption = new Array(rounds + 1);
  decryption[0] = roundKeys[rounds];
  for (let index = 1; index < rounds; index += 1) {
    decryption[index] = ariaA(roundKeys[rounds - index]);
  }
  decryption[rounds] = roundKeys[0];
  return {keyBits, rounds, KL, KR, W: [W0, W1, W2, W3], roundKeys, decryption};
}

export function ariaEncryptRounds(plaintextHex, keyHex) {
  const schedule = ariaExpandKey(keyHex);
  const plaintext = hexToBytes(requireHex(plaintextHex, 32, 'plaintext'));
  const states = [];
  let state = plaintext;
  for (let index = 0; index < schedule.rounds - 1; index += 1) {
    state = index % 2 === 0 ? ariaFO(state, schedule.roundKeys[index]) : ariaFE(state, schedule.roundKeys[index]);
    states.push({round: index + 1, state: Uint8Array.from(state)});
  }
  const preFinal = xorBytes(state, schedule.roundKeys[schedule.rounds - 1]);
  const ciphertext = xorBytes(ariaSL2(preFinal), schedule.roundKeys[schedule.rounds]);
  return {ciphertext, states, preFinal};
}

export function ariaEncryptBlock(plaintextHex, keyHex) {
  return bytesToHex(ariaEncryptRounds(plaintextHex, keyHex).ciphertext);
}

export function ariaDecryptBlock(ciphertextHex, keyHex) {
  const schedule = ariaExpandKey(keyHex);
  const ciphertext = hexToBytes(requireHex(ciphertextHex, 32, 'ciphertext'));
  let state = ciphertext;
  for (let index = 0; index < schedule.rounds - 1; index += 1) {
    state = index % 2 === 0 ? ariaFO(state, schedule.decryption[index]) : ariaFE(state, schedule.decryption[index]);
  }
  const preFinal = xorBytes(state, schedule.decryption[schedule.rounds - 1]);
  return bytesToHex(xorBytes(ariaSL2(preFinal), schedule.decryption[schedule.rounds]));
}

export const VECTORS = Object.freeze([
  {
    key: '000102030405060708090a0b0c0d0e0f',
    keyBits: 128,
    rounds: 12,
    plaintext: '00112233445566778899aabbccddeeff',
    ciphertext: 'd718fbd6ab644c739da95f3be6451778'
  },
  {
    key: '000102030405060708090a0b0c0d0e0f1011121314151617',
    keyBits: 192,
    rounds: 14,
    plaintext: '00112233445566778899aabbccddeeff',
    ciphertext: '26449c1805dbe7aa25a468ce263a9e79'
  },
  {
    key: '000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f',
    keyBits: 256,
    rounds: 16,
    plaintext: '00112233445566778899aabbccddeeff',
    ciphertext: 'f92bd7c79fb72e2f2b8f80c1972d24fc'
  }
]);
