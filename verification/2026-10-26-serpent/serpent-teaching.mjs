// Teaching implementation of Serpent (Serpent-1), following the AES submission
// "Serpent: A Proposal for the Advanced Encryption Standard" (Anderson, Biham,
// Knudsen) and the authors' reference implementation (floppy1 in serpent.tar.gz).
// Bitslice-domain description: no IP/FP, 32 rounds, 33 subkeys.
// Not constant-time, not audited, not for protecting real data.

export const PHI = 0x9E3779B9;
export const ROUNDS = 32;

export const SBOX = [
  [0x3, 0x8, 0xF, 0x1, 0xA, 0x6, 0x5, 0xB, 0xE, 0xD, 0x4, 0x2, 0x7, 0x0, 0x9, 0xC],
  [0xF, 0xC, 0x2, 0x7, 0x9, 0x0, 0x5, 0xA, 0x1, 0xB, 0xE, 0x8, 0x6, 0xD, 0x3, 0x4],
  [0x8, 0x6, 0x7, 0x9, 0x3, 0xC, 0xA, 0xF, 0xD, 0x1, 0xE, 0x4, 0x0, 0xB, 0x5, 0x2],
  [0x0, 0xF, 0xB, 0x8, 0xC, 0x9, 0x6, 0x3, 0xD, 0x1, 0x2, 0x4, 0xA, 0x7, 0x5, 0xE],
  [0x1, 0xF, 0x8, 0x3, 0xC, 0x0, 0xB, 0x6, 0x2, 0x5, 0x4, 0xA, 0x9, 0xE, 0x7, 0xD],
  [0xF, 0x5, 0x2, 0xB, 0x4, 0xA, 0x9, 0xC, 0x0, 0x3, 0xE, 0x8, 0xD, 0x6, 0x7, 0x1],
  [0x7, 0x2, 0xC, 0x5, 0x8, 0x4, 0x6, 0xB, 0xE, 0x9, 0x1, 0xF, 0xD, 0x3, 0xA, 0x0],
  [0x1, 0xD, 0xF, 0x0, 0xE, 0x8, 0x2, 0xB, 0x7, 0x4, 0xC, 0xA, 0x9, 0x3, 0x5, 0x6]
];

export const SBOX_INVERSE = SBOX.map(box => {
  const inverse = new Array(16);
  box.forEach((value, input) => {
    inverse[value] = input;
  });
  return inverse;
});

export const rotl32 = (value, amount) => ((value << amount) | (value >>> (32 - amount))) >>> 0;
export const rotr32 = (value, amount) => ((value >>> amount) | (value << (32 - amount))) >>> 0;

export function hexToBytes(hex) {
  const clean = hex.replace(/\s+/g, '');
  if (clean.length % 2 || !/^[0-9a-fA-F]*$/.test(clean)) throw new Error('Expected an even-length hex string');
  return Uint8Array.from(clean.match(/../g).map(pair => parseInt(pair, 16)));
}

export const bytesToHex = bytes => Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');

export function hexToWords(hex) {
  const bytes = hexToBytes(hex);
  if (bytes.length !== 16) throw new Error('Serpent blocks are 16 bytes');
  return [0, 1, 2, 3].map(index => (bytes[4 * index] | (bytes[4 * index + 1] << 8) | (bytes[4 * index + 2] << 16) | (bytes[4 * index + 3] << 24)) >>> 0);
}

export function wordsToHex(words) {
  if (words.length !== 4) throw new Error('Serpent blocks are four 32-bit words');
  const bytes = [];
  for (const word of words) bytes.push(word & 0xFF, (word >>> 8) & 0xFF, (word >>> 16) & 0xFF, (word >>> 24) & 0xFF);
  return bytesToHex(bytes);
}

export const wordsToParts = words => words.map(word => (word >>> 0).toString(16).padStart(8, '0').toUpperCase());

// Serpent pads short keys by appending a 1 bit at position keyBits, then zeros
// up to 256 bits (paper section 2; reference shortToLongKey).
export function padKey(keyHex) {
  const bytes = hexToBytes(keyHex);
  if (bytes.length < 16 || bytes.length > 32) throw new Error('Serpent keys are 128, 192 or 256 bits');
  const padded = new Uint8Array(32);
  padded.set(bytes);
  if (bytes.length < 32) {
    const bit = bytes.length * 8;
    padded[bit / 8] |= 1 << (bit % 8);
  }
  return bytesToHex(padded);
}

export function keyWords(keyHex) {
  const padded = hexToBytes(padKey(keyHex));
  return [0, 1, 2, 3, 4, 5, 6, 7].map(index => (padded[4 * index] | (padded[4 * index + 1] << 8) | (padded[4 * index + 2] << 16) | (padded[4 * index + 3] << 24)) >>> 0);
}

function sboxBitslice(box, words) {
  const output = [0, 0, 0, 0];
  for (let bit = 0; bit < 32; bit++) {
    const input = (((words[0] >>> bit) & 1) | (((words[1] >>> bit) & 1) << 1) | (((words[2] >>> bit) & 1) << 2) | (((words[3] >>> bit) & 1) << 3));
    const value = box[input];
    for (let lane = 0; lane < 4; lane++) output[lane] |= ((value >>> lane) & 1) << bit;
  }
  return output.map(word => word >>> 0);
}

function sboxInverseBitslice(box, words) {
  const output = [0, 0, 0, 0];
  for (let bit = 0; bit < 32; bit++) {
    const input = (((words[0] >>> bit) & 1) | (((words[1] >>> bit) & 1) << 1) | (((words[2] >>> bit) & 1) << 2) | (((words[3] >>> bit) & 1) << 3));
    const value = box[input];
    for (let lane = 0; lane < 4; lane++) output[lane] |= ((value >>> lane) & 1) << bit;
  }
  return output.map(word => word >>> 0);
}

export function linearTransform(words) {
  let [x0, x1, x2, x3] = words;
  x0 = rotl32(x0, 13);
  x2 = rotl32(x2, 3);
  x1 = (x1 ^ x0 ^ x2) >>> 0;
  x3 = (x3 ^ x2 ^ ((x0 << 3) >>> 0)) >>> 0;
  x1 = rotl32(x1, 1);
  x3 = rotl32(x3, 7);
  x0 = (x0 ^ x1 ^ x3) >>> 0;
  x2 = (x2 ^ x3 ^ ((x1 << 7) >>> 0)) >>> 0;
  x0 = rotl32(x0, 5);
  x2 = rotl32(x2, 22);
  return [x0, x1, x2, x3];
}

export function linearTransformInverse(words) {
  let [x0, x1, x2, x3] = words;
  x2 = rotr32(x2, 22);
  x0 = rotr32(x0, 5);
  x2 = (x2 ^ x3 ^ ((x1 << 7) >>> 0)) >>> 0;
  x0 = (x0 ^ x1 ^ x3) >>> 0;
  x3 = rotr32(x3, 7);
  x1 = rotr32(x1, 1);
  x3 = (x3 ^ x2 ^ ((x0 << 3) >>> 0)) >>> 0;
  x1 = (x1 ^ x0 ^ x2) >>> 0;
  x0 = rotr32(x0, 13);
  x2 = rotr32(x2, 3);
  return [x0, x1, x2, x3];
}

export function keySchedule(keyHex) {
  const words = keyWords(keyHex);
  const w = words.slice();
  for (let index = 0; index < 132; index++) {
    const value = rotl32((w[index] ^ w[index + 3] ^ w[index + 5] ^ w[index + 7] ^ PHI ^ index) >>> 0, 11);
    w.push(value);
  }
  const prekeys = w.slice(8);
  const K = [];
  for (let index = 0; index <= 32; index++) {
    const box = SBOX[(((3 - index) % 8) + 8) % 8];
    K.push(sboxBitslice(box, prekeys.slice(4 * index, 4 * index + 4)));
  }
  return {words, padded: padKey(keyHex), prekeys, K};
}

export const xorWords = (left, right) => left.map((word, index) => (word ^ right[index]) >>> 0);

export function encryptWords(block, schedule) {
  let state = block.slice();
  for (let round = 0; round < 31; round++) {
    state = xorWords(state, schedule.K[round]);
    state = sboxBitslice(SBOX[round % 8], state);
    state = linearTransform(state);
  }
  state = xorWords(state, schedule.K[31]);
  state = sboxBitslice(SBOX[7], state);
  return xorWords(state, schedule.K[32]);
}

export function decryptWords(block, schedule) {
  let state = block.slice();
  state = xorWords(state, schedule.K[32]);
  state = sboxInverseBitslice(SBOX_INVERSE[7], state);
  state = xorWords(state, schedule.K[31]);
  for (let round = 30; round >= 0; round--) {
    state = linearTransformInverse(state);
    state = sboxInverseBitslice(SBOX_INVERSE[round % 8], state);
    state = xorWords(state, schedule.K[round]);
  }
  return state;
}

export function encryptBlock(plaintextHex, keyHex) {
  return wordsToHex(encryptWords(hexToWords(plaintextHex), keySchedule(keyHex)));
}

export function decryptBlock(ciphertextHex, keyHex) {
  return wordsToHex(decryptWords(hexToWords(ciphertextHex), keySchedule(keyHex)));
}

export const BLOCK_BYTES = 16;
