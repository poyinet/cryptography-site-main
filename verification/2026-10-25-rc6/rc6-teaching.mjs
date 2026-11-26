/**
 * Educational RC6 block cipher.
 * NOT production cryptography: JavaScript integer operations are not
 * constant-time, secrets are not reliably erased, and this file implements
 * neither a mode of operation nor authentication.
 *
 * Specification: R.L. Rivest, M.J.B. Robshaw, R. Sidney and Y.L. Yin,
 * "The RC6 Block Cipher", v1.1, 20 August 1998 (AES submission), Section 2
 * and the Appendix. The appendix test vectors are reproduced here.
 * A supplementary independent vector set is draft-krovetz-rc6-rc5-vectors-00.
 * This is original teaching code, not a copy of a reference implementation.
 */

const MASK32 = 0xffffffffn;
const u32 = value => value >>> 0;
const rotl32 = (value, shift) => {
  const s = shift & 31;
  return s === 0 ? u32(value) : ((value << s) | (value >>> (32 - s))) >>> 0;
};
const rotr32 = (value, shift) => rotl32(value, 32 - (shift & 31));

export const P32 = 0xB7E15163;
export const Q32 = 0x9E3779B9;

function requireHex(value, length, label) {
  const pattern = new RegExp(`^[0-9a-fA-F]{${length}}$`);
  if (typeof value !== 'string' || !pattern.test(value)) {
    throw new TypeError(`${label} must be a ${length}-digit hexadecimal string`);
  }
  return value.toLowerCase();
}

export function hexToBytes(hex) {
  return Uint8Array.from(hex.match(/../g), pair => parseInt(pair, 16));
}

export function bytesToHex(bytes) {
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}

export function bytesToWordsLE(bytes) {
  const words = [];
  for (let offset = 0; offset < bytes.length; offset += 4) {
    words.push(u32(
      bytes[offset] |
      (bytes[offset + 1] << 8) |
      (bytes[offset + 2] << 16) |
      (bytes[offset + 3] << 24)
    ));
  }
  return words;
}

export function wordsToBytesLE(words) {
  const bytes = new Uint8Array(words.length * 4);
  words.forEach((word, index) => {
    bytes[index * 4] = word & 0xff;
    bytes[index * 4 + 1] = (word >>> 8) & 0xff;
    bytes[index * 4 + 2] = (word >>> 16) & 0xff;
    bytes[index * 4 + 3] = (word >>> 24) & 0xff;
  });
  return bytes;
}

export function rc6KeySchedule(keyBytes, rounds = 20) {
  if (keyBytes.length !== 16 && keyBytes.length !== 24 && keyBytes.length !== 32) {
    throw new TypeError('RC6 key must be 16, 24 or 32 bytes');
  }
  const words = bytesToWordsLE(keyBytes);
  const S = new Uint32Array(2 * rounds + 4);
  S[0] = P32;
  for (let index = 1; index < S.length; index += 1) {
    S[index] = u32(S[index - 1] + Q32);
  }
  let A = 0;
  let B = 0;
  let i = 0;
  let j = 0;
  for (let step = 0; step < 3 * Math.max(words.length, S.length); step += 1) {
    A = S[i] = rotl32(u32(S[i] + A + B), 3);
    const shift = (A + B) & 31;
    B = words[j] = rotl32(u32(words[j] + A + B), shift);
    i = (i + 1) % S.length;
    j = (j + 1) % words.length;
  }
  return {rounds, S, L: words};
}

function encryptWords(block, schedule) {
  const {S, rounds} = schedule;
  let [A, B, C, D] = block;
  B = u32(B + S[0]);
  D = u32(D + S[1]);
  for (let round = 1; round <= rounds; round += 1) {
    const t = rotl32(u32(Math.imul(B, u32(2 * B + 1))), 5);
    const u = rotl32(u32(Math.imul(D, u32(2 * D + 1))), 5);
    A = u32(rotl32(u32(A ^ t), u & 31) + S[2 * round]);
    C = u32(rotl32(u32(C ^ u), t & 31) + S[2 * round + 1]);
    [A, B, C, D] = [B, C, D, A];
  }
  A = u32(A + S[2 * rounds + 2]);
  C = u32(C + S[2 * rounds + 3]);
  return [A, B, C, D];
}

function decryptWords(block, schedule) {
  const {S, rounds} = schedule;
  let [A, B, C, D] = block;
  C = u32(C - S[2 * rounds + 3]);
  A = u32(A - S[2 * rounds + 2]);
  for (let round = rounds; round >= 1; round -= 1) {
    [A, B, C, D] = [D, A, B, C];
    const u = rotl32(u32(Math.imul(D, u32(2 * D + 1))), 5);
    const t = rotl32(u32(Math.imul(B, u32(2 * B + 1))), 5);
    C = u32(rotr32(u32(C - S[2 * round + 1]), t & 31) ^ u);
    A = u32(rotr32(u32(A - S[2 * round]), u & 31) ^ t);
  }
  B = u32(B - S[0]);
  D = u32(D - S[1]);
  return [A, B, C, D];
}

export function rc6EncryptBlock(plaintextHex, keyHex) {
  const keyBytes = hexToBytes(requireHex(keyHex, keyHex.length, 'key'));
  const block = bytesToWordsLE(hexToBytes(requireHex(plaintextHex, 32, 'plaintext')));
  return bytesToHex(wordsToBytesLE(encryptWords(block, rc6KeySchedule(keyBytes))));
}

export function rc6DecryptBlock(ciphertextHex, keyHex) {
  const keyBytes = hexToBytes(requireHex(keyHex, keyHex.length, 'key'));
  const block = bytesToWordsLE(hexToBytes(requireHex(ciphertextHex, 32, 'ciphertext')));
  return bytesToHex(wordsToBytesLE(decryptWords(block, rc6KeySchedule(keyBytes))));
}

export const VECTORS = Object.freeze([
  {
    key: '00000000000000000000000000000000',
    keyBits: 128,
    plaintext: '00000000000000000000000000000000',
    ciphertext: '8fc3a53656b1f778c129df4e9848a41e'
  },
  {
    key: '0123456789abcdef0112233445566778',
    keyBits: 128,
    plaintext: '02132435465768798a9bacbdcedfe0f1',
    ciphertext: '524e192f4715c6231f51f6367ea43f18'
  },
  {
    key: '000000000000000000000000000000000000000000000000',
    keyBits: 192,
    plaintext: '00000000000000000000000000000000',
    ciphertext: '6cd61bcb190b30384e8a3f168690ae82'
  },
  {
    key: '0123456789abcdef0112233445566778899aabbccddeeff0',
    keyBits: 192,
    plaintext: '02132435465768798a9bacbdcedfe0f1',
    ciphertext: '688329d019e505041e52e92af95291d4'
  },
  {
    key: '0000000000000000000000000000000000000000000000000000000000000000',
    keyBits: 256,
    plaintext: '00000000000000000000000000000000',
    ciphertext: '8f5fbd0510d15fa893fa3fda6e857ec2'
  },
  {
    key: '0123456789abcdef0112233445566778899aabbccddeeff01032547698badcfe',
    keyBits: 256,
    plaintext: '02132435465768798a9bacbdcedfe0f1',
    ciphertext: 'c8241816f0d7e48920ad16a1674e5d48'
  }
]);
