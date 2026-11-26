const SBOX = [0xc, 0x5, 0x6, 0xb, 0x9, 0x0, 0xa, 0xd, 0x3, 0xe, 0xf, 0x8, 0x4, 0x7, 0x1, 0x2];
const INVERSE_SBOX = [0x5, 0xe, 0xf, 0x8, 0xc, 0x1, 0x2, 0xd, 0xb, 0x4, 0x6, 0x3, 0x0, 0x7, 0x9, 0xa];
const P = [
  0, 16, 32, 48, 1, 17, 33, 49, 2, 18, 34, 50, 3, 19, 35, 51,
  4, 20, 36, 52, 5, 21, 37, 53, 6, 22, 38, 54, 7, 23, 39, 55,
  8, 24, 40, 56, 9, 25, 41, 57, 10, 26, 42, 58, 11, 27, 43, 59,
  12, 28, 44, 60, 13, 29, 45, 61, 14, 30, 46, 62, 15, 31, 47, 63
];

const bytesToBigInt = hex => BigInt('0x' + hex);
const bigIntToHex = (value, hexDigits) => value.toString(16).padStart(hexDigits, '0');

function substitute(value, box) {
  let output = 0n;
  for (let index = 0; index < 16; index += 1) {
    const shift = BigInt(60 - 4 * index);
    output |= BigInt(box[Number((value >> shift) & 0xfn)]) << shift;
  }
  return output;
}

function permute(value) {
  let output = 0n;
  for (let index = 0; index < 64; index += 1) {
    output |= ((value >> BigInt(63 - index)) & 1n) << BigInt(63 - P[index]);
  }
  return output;
}

function inversePermute(value) {
  let output = 0n;
  for (let index = 0; index < 64; index += 1) {
    output |= ((value >> BigInt(63 - P[index])) & 1n) << BigInt(63 - index);
  }
  return output;
}

function substituteKeyNibbles(state, keyBits, count) {
  let output = state;
  for (let index = 0; index < count; index += 1) {
    const shift = BigInt(keyBits - 4 * (index + 1));
    const nibble = Number((output >> shift) & 0xfn);
    output = (output & ~(0xfn << shift)) | (BigInt(SBOX[nibble]) << shift);
  }
  return output;
}

function keySchedule80(keyHex) {
  const mask = (1n << 80n) - 1n;
  let state = bytesToBigInt(keyHex) & mask;
  const keys = [];
  for (let round = 0; round <= 31; round += 1) {
    if (round > 0) {
      state = ((state << 61n) | (state >> 19n)) & mask;
      state = substituteKeyNibbles(state, 80, 1);
      state ^= BigInt(round) << 15n;
    }
    keys.push(state >> 16n);
  }
  return keys;
}

function keySchedule128(keyHex) {
  const mask = (1n << 128n) - 1n;
  let state = bytesToBigInt(keyHex) & mask;
  const keys = [];
  for (let round = 0; round <= 31; round += 1) {
    if (round > 0) {
      state = ((state << 61n) | (state >> 67n)) & mask;
      state = substituteKeyNibbles(state, 128, 2);
      state ^= BigInt(round) << 62n;
    }
    keys.push(state >> 64n);
  }
  return keys;
}

export function presentKeySchedule(keyHex) {
  if (keyHex.length === 20) return keySchedule80(keyHex);
  if (keyHex.length === 32) return keySchedule128(keyHex);
  throw Error('PRESENT key must be 80 or 128 bits');
}

export function presentSboxLayer(hex) {
  return bigIntToHex(substitute(bytesToBigInt(hex), SBOX), 16);
}

export function presentInverseSboxLayer(hex) {
  return bigIntToHex(substitute(bytesToBigInt(hex), INVERSE_SBOX), 16);
}

export function presentPLayer(hex) {
  return bigIntToHex(permute(bytesToBigInt(hex)), 16);
}

export function presentInversePLayer(hex) {
  return bigIntToHex(inversePermute(bytesToBigInt(hex)), 16);
}

export function presentEncrypt(plaintextHex, keyHex) {
  let state = bytesToBigInt(plaintextHex);
  const keys = presentKeySchedule(keyHex);
  for (let round = 0; round < 31; round += 1) {
    state ^= keys[round];
    state = substitute(state, SBOX);
    state = permute(state);
  }
  state ^= keys[31];
  return bigIntToHex(state, 16);
}

export function presentDecrypt(ciphertextHex, keyHex) {
  const keys = presentKeySchedule(keyHex);
  let state = bytesToBigInt(ciphertextHex) ^ keys[31];
  for (let round = 30; round >= 0; round -= 1) {
    state = inversePermute(state);
    state = substitute(state, INVERSE_SBOX);
    state ^= keys[round];
  }
  return bigIntToHex(state, 16);
}

export const PRESENT_VECTORS = [
  {
    plaintext: '0000000000000000',
    key: '00000000000000000000',
    ciphertext: '5579c1387b228445'
  },
  {
    plaintext: '0000000000000000',
    key: 'ffffffffffffffffffff',
    ciphertext: 'e72c46c0f5945049'
  },
  {
    plaintext: 'ffffffffffffffff',
    key: '00000000000000000000',
    ciphertext: 'a112ffc72f68417b'
  },
  {
    plaintext: 'ffffffffffffffff',
    key: 'ffffffffffffffffffff',
    ciphertext: '3333dcd3213210d2'
  }
];
