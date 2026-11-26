/**
 * Educational CAST-128 (CAST5) block cipher.
 * NOT production cryptography: JavaScript operations are not constant-time,
 * secrets are copied and not reliably erased, and this has no mode or MAC.
 * C. Adams, "The CAST-128 Encryption Algorithm", RFC 2144, May 1997,
 * defines the algorithm, the S-boxes in Appendix A and the test vectors in
 * Appendix B. The S-box words in sboxes.json are those Appendix A values.
 * This is original teaching code, not a copy of a reference implementation.
 */

import fs from 'node:fs';

const rawBoxes = JSON.parse(fs.readFileSync(new URL('./sboxes.json', import.meta.url), 'utf8'));
export const SBOXES = Object.freeze({
  S1: Uint32Array.from(rawBoxes.S1),
  S2: Uint32Array.from(rawBoxes.S2),
  S3: Uint32Array.from(rawBoxes.S3),
  S4: Uint32Array.from(rawBoxes.S4),
  S5: Uint32Array.from(rawBoxes.S5),
  S6: Uint32Array.from(rawBoxes.S6),
  S7: Uint32Array.from(rawBoxes.S7),
  S8: Uint32Array.from(rawBoxes.S8)
});
const {S1, S2, S3, S4, S5, S6, S7, S8} = SBOXES;

export const ROUND_TYPES = Object.freeze([
  1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1
]);

const u = value => value >>> 0;
const add = (a, b) => (a + b) >>> 0;
const sub = (a, b) => (a - b) >>> 0;
const rotl = (value, shift) => {
  const s = shift & 31;
  return s === 0 ? u(value) : ((value << s) | (value >>> (32 - s))) >>> 0;
};

function hexToBytes(hex, label) {
  if (typeof hex !== 'string' || hex.length % 2 || !/^[0-9a-f]+$/i.test(hex)) {
    throw new TypeError(`${label} must be an even-length hexadecimal string`);
  }
  return Uint8Array.from(hex.match(/../g), byte => parseInt(byte, 16));
}

function bytesToHex(bytes) {
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}

function word(bytes, offset) {
  return ((bytes[offset] << 24) | (bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3]) >>> 0;
}

function putWord(bytes, offset, value) {
  bytes[offset] = (value >>> 24) & 0xff;
  bytes[offset + 1] = (value >>> 16) & 0xff;
  bytes[offset + 2] = (value >>> 8) & 0xff;
  bytes[offset + 3] = value & 0xff;
}

function wordsToKeyBytes(words) {
  const bytes = new Uint8Array(16);
  putWord(bytes, 0, words[0]);
  putWord(bytes, 4, words[1]);
  putWord(bytes, 8, words[2]);
  putWord(bytes, 12, words[3]);
  return bytes;
}

function deriveZ(x) {
  const z = new Uint8Array(16);
  putWord(z, 0, word(x, 0) ^ S5[x[13]] ^ S6[x[15]] ^ S7[x[12]] ^ S8[x[14]] ^ S7[x[8]]);
  putWord(z, 4, word(x, 8) ^ S5[z[0]] ^ S6[z[2]] ^ S7[z[1]] ^ S8[z[3]] ^ S8[x[10]]);
  putWord(z, 8, word(x, 12) ^ S5[z[7]] ^ S6[z[6]] ^ S7[z[5]] ^ S8[z[4]] ^ S5[x[9]]);
  putWord(z, 12, word(x, 4) ^ S5[z[10]] ^ S6[z[9]] ^ S7[z[11]] ^ S8[z[8]] ^ S6[x[11]]);
  return z;
}

function deriveX(x, z) {
  putWord(x, 0, word(z, 8) ^ S5[z[5]] ^ S6[z[7]] ^ S7[z[4]] ^ S8[z[6]] ^ S7[z[0]]);
  putWord(x, 4, word(z, 0) ^ S5[x[0]] ^ S6[x[2]] ^ S7[x[1]] ^ S8[x[3]] ^ S8[z[2]]);
  putWord(x, 8, word(z, 4) ^ S5[x[7]] ^ S6[x[6]] ^ S7[x[5]] ^ S8[x[4]] ^ S5[z[1]]);
  putWord(x, 12, word(z, 12) ^ S5[x[10]] ^ S6[x[9]] ^ S7[x[11]] ^ S8[x[8]] ^ S6[z[3]]);
}

function keysA1(z) {
  return [
    S5[z[8]] ^ S6[z[9]] ^ S7[z[7]] ^ S8[z[6]] ^ S5[z[2]],
    S5[z[10]] ^ S6[z[11]] ^ S7[z[5]] ^ S8[z[4]] ^ S6[z[6]],
    S5[z[12]] ^ S6[z[13]] ^ S7[z[3]] ^ S8[z[2]] ^ S7[z[9]],
    S5[z[14]] ^ S6[z[15]] ^ S7[z[1]] ^ S8[z[0]] ^ S8[z[12]]
  ].map(u);
}

function keysA2(z) {
  return [
    S5[z[3]] ^ S6[z[2]] ^ S7[z[12]] ^ S8[z[13]] ^ S5[z[9]],
    S5[z[1]] ^ S6[z[0]] ^ S7[z[14]] ^ S8[z[15]] ^ S6[z[12]],
    S5[z[7]] ^ S6[z[6]] ^ S7[z[8]] ^ S8[z[9]] ^ S7[z[2]],
    S5[z[5]] ^ S6[z[4]] ^ S7[z[10]] ^ S8[z[11]] ^ S8[z[6]]
  ].map(u);
}

function keysB1(x) {
  return [
    S5[x[3]] ^ S6[x[2]] ^ S7[x[12]] ^ S8[x[13]] ^ S5[x[8]],
    S5[x[1]] ^ S6[x[0]] ^ S7[x[14]] ^ S8[x[15]] ^ S6[x[13]],
    S5[x[7]] ^ S6[x[6]] ^ S7[x[8]] ^ S8[x[9]] ^ S7[x[3]],
    S5[x[5]] ^ S6[x[4]] ^ S7[x[10]] ^ S8[x[11]] ^ S8[x[7]]
  ].map(u);
}

function keysB2(x) {
  return [
    S5[x[8]] ^ S6[x[9]] ^ S7[x[7]] ^ S8[x[6]] ^ S5[x[3]],
    S5[x[10]] ^ S6[x[11]] ^ S7[x[5]] ^ S8[x[4]] ^ S6[x[7]],
    S5[x[12]] ^ S6[x[13]] ^ S7[x[3]] ^ S8[x[2]] ^ S7[x[8]],
    S5[x[14]] ^ S6[x[15]] ^ S7[x[1]] ^ S8[x[0]] ^ S8[x[13]]
  ].map(u);
}

/** CAST-128 key schedule: 16 key bytes expand to 32 32-bit subkeys K1..K32. */
export function cast128ScheduleFromBytes(keyBytes) {
  if (!(keyBytes instanceof Uint8Array) || keyBytes.length !== 16) {
    throw new TypeError('CAST-128 key schedule expects 16 key bytes');
  }
  const K = new Uint32Array(32);
  const x = Uint8Array.from(keyBytes);
  for (let group = 0; group < 4; group += 1) {
    const z = deriveZ(x);
    const a = group % 2 === 0 ? keysA1(z) : keysA2(z);
    K[group * 8] = a[0];
    K[group * 8 + 1] = a[1];
    K[group * 8 + 2] = a[2];
    K[group * 8 + 3] = a[3];
    deriveX(x, z);
    const b = group % 2 === 0 ? keysB1(x) : keysB2(x);
    K[group * 8 + 4] = b[0];
    K[group * 8 + 5] = b[1];
    K[group * 8 + 6] = b[2];
    K[group * 8 + 7] = b[3];
  }
  return K;
}

export function cast128ScheduleFromWords(words) {
  return cast128ScheduleFromBytes(wordsToKeyBytes(words));
}

/** RFC 2144 key preparation: 40..128 bits in one-byte steps, zero-padded. */
export function cast128PrepareKey(keyHex) {
  const bytes = hexToBytes(keyHex, 'CAST-128 key');
  if (bytes.length < 5 || bytes.length > 16) {
    throw new TypeError('CAST-128 key must be 5..16 bytes (40..128 bits)');
  }
  const padded = new Uint8Array(16);
  padded.set(bytes);
  return {padded, rounds: bytes.length <= 10 ? 12 : 16, keyBytes: bytes.length};
}

export function cast128RoundFunction(type, data, km, kr) {
  let mixed;
  if (type === 1) mixed = rotl(add(km, data), kr);
  else if (type === 2) mixed = rotl((km ^ data) >>> 0, kr);
  else if (type === 3) mixed = rotl(sub(km, data), kr);
  else throw new TypeError('CAST-128 round type must be 1, 2 or 3');
  const ia = (mixed >>> 24) & 0xff;
  const ib = (mixed >>> 16) & 0xff;
  const ic = (mixed >>> 8) & 0xff;
  const id = mixed & 0xff;
  if (type === 1) return add(sub(S1[ia] ^ S2[ib], S3[ic]), S4[id]);
  if (type === 2) return (add(sub(S1[ia], S2[ib]), S3[ic]) ^ S4[id]) >>> 0;
  return sub((add(S1[ia], S2[ib]) ^ S3[ic]) >>> 0, S4[id]);
}

/** Encrypt one 64-bit block as two 32-bit words; returns the final swapped pair. */
export function cast128EncryptWords(left, right, schedule, rounds = 16) {
  let l = u(left);
  let r = u(right);
  for (let round = 1; round <= rounds; round += 1) {
    const next = (l ^ cast128RoundFunction(ROUND_TYPES[round - 1], r, schedule[round - 1], schedule[15 + round])) >>> 0;
    l = r;
    r = next;
  }
  return [r, l];
}

export function cast128DecryptWords(left, right, schedule, rounds = 16) {
  let l = u(left);
  let r = u(right);
  for (let round = rounds; round >= 1; round -= 1) {
    const next = (l ^ cast128RoundFunction(ROUND_TYPES[round - 1], r, schedule[round - 1], schedule[15 + round])) >>> 0;
    l = r;
    r = next;
  }
  return [r, l];
}

export function cast128EncryptBlock(plaintextHex, keyHex) {
  const block = hexToBytes(plaintextHex, 'CAST-128 plaintext');
  if (block.length !== 8) throw new TypeError('CAST-128 plaintext must be 8 bytes');
  const {padded, rounds} = cast128PrepareKey(keyHex);
  const schedule = cast128ScheduleFromBytes(padded);
  const [l, r] = cast128EncryptWords(word(block, 0), word(block, 4), schedule, rounds);
  return bytesToHex([l >>> 24, (l >>> 16) & 0xff, (l >>> 8) & 0xff, l & 0xff, r >>> 24, (r >>> 16) & 0xff, (r >>> 8) & 0xff, r & 0xff]);
}

export function cast128DecryptBlock(ciphertextHex, keyHex) {
  const block = hexToBytes(ciphertextHex, 'CAST-128 ciphertext');
  if (block.length !== 8) throw new TypeError('CAST-128 ciphertext must be 8 bytes');
  const {padded, rounds} = cast128PrepareKey(keyHex);
  const schedule = cast128ScheduleFromBytes(padded);
  const [l, r] = cast128DecryptWords(word(block, 0), word(block, 4), schedule, rounds);
  return bytesToHex([l >>> 24, (l >>> 16) & 0xff, (l >>> 8) & 0xff, l & 0xff, r >>> 24, (r >>> 16) & 0xff, (r >>> 8) & 0xff, r & 0xff]);
}

/** RFC 2144 Appendix B.2 maintenance test, run for the requested iterations. */
export function cast128MaintenanceTest(iterations = 1000000) {
  let a = [0x01234567, 0x12345678, 0x23456789, 0x3456789a];
  let b = [0x01234567, 0x12345678, 0x23456789, 0x3456789a];
  for (let count = 0; count < iterations; count += 1) {
    const scheduleB = cast128ScheduleFromWords(b);
    const [a0, a1] = cast128EncryptWords(a[0], a[1], scheduleB, 16);
    const [a2, a3] = cast128EncryptWords(a[2], a[3], scheduleB, 16);
    a = [a0, a1, a2, a3];
    const scheduleA = cast128ScheduleFromWords(a);
    const [b0, b1] = cast128EncryptWords(b[0], b[1], scheduleA, 16);
    const [b2, b3] = cast128EncryptWords(b[2], b[3], scheduleA, 16);
    b = [b0, b1, b2, b3];
  }
  const toHex = words => words.map(value => value.toString(16).padStart(8, '0')).join('');
  return {iterations, a: toHex(a), b: toHex(b)};
}

export const VECTORS = [
  {key: '0123456712345678234567893456789a', plaintext: '0123456789abcdef', ciphertext: '238b4fe5847e44b2', rounds: 16},
  {key: '01234567123456782345', plaintext: '0123456789abcdef', ciphertext: 'eb6a711a2c02271b', rounds: 12},
  {key: '0123456712', plaintext: '0123456789abcdef', ciphertext: '7ac816d16e9b302e', rounds: 12}
];
