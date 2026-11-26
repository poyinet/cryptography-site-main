// Teaching implementation of Twofish, following the AES submission paper
// "Twofish: A 128-Bit Block Cipher" (Schneier, Kelsey, Whiting, Wagner, Hall,
// Ferguson, 1998), sections 4.1-4.4 and Appendix A.
// Not constant-time, not audited, not for protecting real data.

export const RHO = 0x01010101;

const MDS = [
  [0x01, 0xEF, 0x5B, 0x5B],
  [0x5B, 0xEF, 0xEF, 0x01],
  [0xEF, 0x5B, 0x01, 0xEF],
  [0xEF, 0x01, 0xEF, 0x5B]
];

const RS = [
  [0x01, 0xA4, 0x55, 0x87, 0x5A, 0x58, 0xDB, 0x9E],
  [0xA4, 0x56, 0x82, 0xF3, 0x1E, 0xC6, 0x68, 0xE5],
  [0x02, 0xA1, 0xFC, 0xC1, 0x47, 0xAE, 0x3D, 0x19],
  [0xA4, 0x55, 0x87, 0x5A, 0x58, 0xDB, 0x9E, 0x03]
];

// q0 and q1 are each built from four 4-bit permutations, as listed in section 4.3.5.
const Q0_T = [
  [0x8, 0x1, 0x7, 0xD, 0x6, 0xF, 0x3, 0x2, 0x0, 0xB, 0x5, 0x9, 0xE, 0xC, 0xA, 0x4],
  [0xE, 0xC, 0xB, 0x8, 0x1, 0x2, 0x3, 0x5, 0xF, 0x4, 0xA, 0x6, 0x7, 0x0, 0x9, 0xD],
  [0xB, 0xA, 0x5, 0xE, 0x6, 0xD, 0x9, 0x0, 0xC, 0x8, 0xF, 0x3, 0x2, 0x4, 0x7, 0x1],
  [0xD, 0x7, 0xF, 0x4, 0x1, 0x2, 0x6, 0xE, 0x9, 0xB, 0x3, 0x0, 0x8, 0x5, 0xC, 0xA]
];
const Q1_T = [
  [0x2, 0x8, 0xB, 0xD, 0xF, 0x7, 0x6, 0xE, 0x3, 0x1, 0x9, 0x4, 0x0, 0xA, 0xC, 0x5],
  [0x1, 0xE, 0x2, 0xB, 0x4, 0xC, 0x3, 0x7, 0x6, 0xD, 0xA, 0x5, 0xF, 0x9, 0x0, 0x8],
  [0x4, 0xC, 0x7, 0x5, 0x1, 0x6, 0x9, 0xA, 0x0, 0xE, 0xD, 0x8, 0x2, 0xB, 0x3, 0xF],
  [0xB, 0x9, 0x5, 0x1, 0xC, 0x3, 0xD, 0xE, 0x6, 0x4, 0x7, 0xF, 0x2, 0x0, 0x8, 0xA]
];

const ror4 = value => ((value >>> 1) | ((value & 1) << 3)) & 0xF;

function buildQ(tables) {
  const [t0, t1, t2, t3] = tables;
  const table = new Uint8Array(256);
  for (let x = 0; x < 256; x++) {
    const a0 = x >>> 4;
    const b0 = x & 0xF;
    const a1 = a0 ^ b0;
    const b1 = a0 ^ ror4(b0, 1) ^ ((8 * a0) & 0xF);
    const a2 = t0[a1];
    const b2 = t1[b1];
    const a3 = a2 ^ b2;
    const b3 = a2 ^ ror4(b2, 1) ^ ((8 * a2) & 0xF);
    const a4 = t2[a3];
    const b4 = t3[b3];
    table[x] = ((b4 << 4) | a4) & 0xFF;
  }
  return table;
}

export const Q0 = buildQ(Q0_T);
export const Q1 = buildQ(Q1_T);

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
  if (bytes.length !== 16) throw new Error('Expected a 16-byte block');
  const words = [];
  for (let index = 0; index < 4; index++) {
    words.push((bytes[4 * index] | (bytes[4 * index + 1] << 8) | (bytes[4 * index + 2] << 16) | (bytes[4 * index + 3] << 24)) >>> 0);
  }
  return words;
}

export function wordsToHex(words) {
  if (words.length !== 4) throw new Error('Expected four 32-bit words');
  const bytes = [];
  for (const word of words) {
    bytes.push(word & 0xFF, (word >>> 8) & 0xFF, (word >>> 16) & 0xFF, (word >>> 24) & 0xFF);
  }
  return bytesToHex(bytes);
}

export const wordsToParts = words => words.map(word => word.toString(16).padStart(8, '0').toUpperCase());

export function gfMul(a, b, polynomial) {
  let left = a & 0xFF;
  let right = b & 0xFF;
  let result = 0;
  while (right) {
    if (right & 1) result ^= left;
    left <<= 1;
    if (left & 0x100) left ^= polynomial;
    right >>>= 1;
  }
  return result & 0xFF;
}

const GF_MDS = 0x169; // x^8 + x^6 + x^5 + x^3 + 1
const GF_RS = 0x14D;  // x^8 + x^6 + x^3 + x^2 + 1

function multiplyMatrix(matrix, vector, polynomial) {
  return matrix.map(row => row.reduce((sum, coefficient, index) => sum ^ gfMul(coefficient, vector[index], polynomial), 0));
}

export function mdsMultiply(bytes) {
  return multiplyMatrix(MDS, bytes, GF_MDS);
}

function rsMultiply(bytes) {
  return multiplyMatrix(RS, bytes, GF_RS);
}

const byteAt = (word, index) => (word >>> (8 * index)) & 0xFF;

export function hWord(X, L) {
  if (![2, 3, 4].includes(L.length)) throw new Error('h expects a list of 2, 3 or 4 words');
  let y = [byteAt(X, 0), byteAt(X, 1), byteAt(X, 2), byteAt(X, 3)];
  if (L.length === 4) {
    const l3 = [byteAt(L[3], 0), byteAt(L[3], 1), byteAt(L[3], 2), byteAt(L[3], 3)];
    y = [Q1[y[0]] ^ l3[0], Q0[y[1]] ^ l3[1], Q0[y[2]] ^ l3[2], Q1[y[3]] ^ l3[3]];
  }
  if (L.length >= 3) {
    const l2 = [byteAt(L[2], 0), byteAt(L[2], 1), byteAt(L[2], 2), byteAt(L[2], 3)];
    y = [Q1[y[0]] ^ l2[0], Q1[y[1]] ^ l2[1], Q0[y[2]] ^ l2[2], Q0[y[3]] ^ l2[3]];
  }
  const l1 = [byteAt(L[1], 0), byteAt(L[1], 1), byteAt(L[1], 2), byteAt(L[1], 3)];
  const l0 = [byteAt(L[0], 0), byteAt(L[0], 1), byteAt(L[0], 2), byteAt(L[0], 3)];
  y = [
    Q1[Q0[Q0[y[0]] ^ l1[0]] ^ l0[0]],
    Q0[Q0[Q1[y[1]] ^ l1[1]] ^ l0[1]],
    Q1[Q1[Q0[y[2]] ^ l1[2]] ^ l0[2]],
    Q0[Q1[Q1[y[3]] ^ l1[3]] ^ l0[3]]
  ];
  const z = mdsMultiply(y);
  return (z[0] | (z[1] << 8) | (z[2] << 16) | (z[3] << 24)) >>> 0;
}

export function keySchedule(keyHex) {
  const bytes = hexToBytes(keyHex);
  if (![16, 24, 32].includes(bytes.length)) throw new Error('Twofish keys are 16, 24 or 32 bytes after zero padding');
  const k = bytes.length / 8;
  const M = [];
  for (let index = 0; index < 2 * k; index++) {
    M.push((bytes[4 * index] | (bytes[4 * index + 1] << 8) | (bytes[4 * index + 2] << 16) | (bytes[4 * index + 3] << 24)) >>> 0);
  }
  const Me = M.filter((_, index) => index % 2 === 0);
  const Mo = M.filter((_, index) => index % 2 === 1);
  const S = [];
  for (let index = 0; index < k; index++) {
    const s = rsMultiply(Array.from(bytes.slice(8 * index, 8 * index + 8)));
    S.push((s[0] | (s[1] << 8) | (s[2] << 16) | (s[3] << 24)) >>> 0);
  }
  S.reverse();
  const K = [];
  for (let i = 0; i < 20; i++) {
    const A = hWord(((2 * i * RHO) >>> 0), Me);
    const B = rotl32(hWord((((2 * i + 1) * RHO) >>> 0), Mo), 8);
    K.push((A + B) >>> 0);
    K.push(rotl32((A + 2 * B) >>> 0, 9));
  }
  return {bytes, k, Me, Mo, S, K};
}

export function gWord(X, S) {
  return hWord(X, S);
}

function fFunction(R0, R1, round, schedule) {
  const T0 = hWord(R0, schedule.S);
  const T1 = hWord(rotl32(R1, 8), schedule.S);
  const F0 = (T0 + T1 + schedule.K[2 * round + 8]) >>> 0;
  const F1 = (T0 + 2 * T1 + schedule.K[2 * round + 9]) >>> 0;
  return {T0, T1, F0, F1};
}

export function encryptWords(words, schedule) {
  let [R0, R1, R2, R3] = [
    (words[0] ^ schedule.K[0]) >>> 0,
    (words[1] ^ schedule.K[1]) >>> 0,
    (words[2] ^ schedule.K[2]) >>> 0,
    (words[3] ^ schedule.K[3]) >>> 0
  ];
  for (let round = 0; round < 16; round++) {
    const {F0, F1} = fFunction(R0, R1, round, schedule);
    const next0 = rotr32((R2 ^ F0) >>> 0, 1);
    const next1 = (rotl32(R3, 1) ^ F1) >>> 0;
    R2 = R0;
    R3 = R1;
    R0 = next0;
    R1 = next1;
  }
  return [
    (R2 ^ schedule.K[4]) >>> 0,
    (R3 ^ schedule.K[5]) >>> 0,
    (R0 ^ schedule.K[6]) >>> 0,
    (R1 ^ schedule.K[7]) >>> 0
  ];
}

export function decryptWords(words, schedule) {
  let [R0, R1, R2, R3] = [
    (words[2] ^ schedule.K[6]) >>> 0,
    (words[3] ^ schedule.K[7]) >>> 0,
    (words[0] ^ schedule.K[4]) >>> 0,
    (words[1] ^ schedule.K[5]) >>> 0
  ];
  for (let round = 15; round >= 0; round--) {
    const previous0 = R2;
    const previous1 = R3;
    const {F0, F1} = fFunction(previous0, previous1, round, schedule);
    const previous2 = (rotl32(R0, 1) ^ F0) >>> 0;
    const previous3 = rotr32((R1 ^ F1) >>> 0, 1);
    [R0, R1, R2, R3] = [previous0, previous1, previous2, previous3];
  }
  return [
    (R0 ^ schedule.K[0]) >>> 0,
    (R1 ^ schedule.K[1]) >>> 0,
    (R2 ^ schedule.K[2]) >>> 0,
    (R3 ^ schedule.K[3]) >>> 0
  ];
}

export function encryptBlock(plaintextHex, keyHex) {
  return wordsToHex(encryptWords(hexToWords(plaintextHex), keySchedule(keyHex)));
}

export function decryptBlock(ciphertextHex, keyHex) {
  return wordsToHex(decryptWords(hexToWords(ciphertextHex), keySchedule(keyHex)));
}

// Reproduces Appendix A.1, whose reference implementation keeps the halves in
// place and applies F alternately instead of swapping them.
export function blockTrace(plaintextHex, keyHex) {
  const schedule = keySchedule(keyHex);
  const P = hexToWords(plaintextHex);
  const x = [
    (P[0] ^ schedule.K[0]) >>> 0,
    (P[1] ^ schedule.K[1]) >>> 0,
    (P[2] ^ schedule.K[2]) >>> 0,
    (P[3] ^ schedule.K[3]) >>> 0
  ];
  const rounds = [{round: -1, words: P.slice()}, {round: 0, words: x.slice()}];
  for (let round = 0; round < 16; round++) {
    const left = round % 2 === 0 ? 0 : 2;
    const right = round % 2 === 0 ? 2 : 0;
    const {T0, T1, F0, F1} = fFunction(x[left], x[left + 1], round, schedule);
    x[right] = rotr32((x[right] ^ F0) >>> 0, 1);
    x[right + 1] = (rotl32(x[right + 1], 1) ^ F1) >>> 0;
    rounds.push({round: round + 1, words: x.slice(), T0, T1});
  }
  const ciphertextWords = [
    (x[2] ^ schedule.K[4]) >>> 0,
    (x[3] ^ schedule.K[5]) >>> 0,
    (x[0] ^ schedule.K[6]) >>> 0,
    (x[1] ^ schedule.K[7]) >>> 0
  ];
  rounds.push({round: 17, words: ciphertextWords.slice()});
  return {schedule, rounds, ciphertextWords};
}

export const BLOCK_BYTES = 16;

export function padKey(keyHex) {
  const bytes = hexToBytes(keyHex);
  const targets = [16, 24, 32];
  const target = targets.find(size => bytes.length <= size);
  if (!target) throw new Error('Twofish keys are at most 32 bytes');
  const padded = new Uint8Array(target);
  padded.set(bytes);
  return bytesToHex(padded);
}
