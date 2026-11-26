const P = 0xb7e15163;
const Q = 0x9e3779b9;

const rotl = (value, shift) => {
  const s = shift & 31;
  return ((value << s) | (value >>> (32 - s))) >>> 0;
};

const rotr = (value, shift) => {
  const s = shift & 31;
  return ((value >>> s) | (value << (32 - s))) >>> 0;
};

const parseKey = keyHex => {
  if (keyHex.length % 8 !== 0) throw Error('RC5 key must be a whole number of 32-bit words');
  const words = [];
  for (let index = 0; index < keyHex.length; index += 8) {
    const bytes = keyHex.slice(index, index + 8).match(/../g);
    words.push((parseInt(bytes[0], 16) | (parseInt(bytes[1], 16) << 8) | (parseInt(bytes[2], 16) << 16) | (parseInt(bytes[3], 16) << 24)) >>> 0);
  }
  return words;
};

export function rc5KeySchedule(keyHex, rounds) {
  const L = parseKey(keyHex);
  const T = 2 * (rounds + 1);
  const S = new Array(T);
  S[0] = P;
  for (let index = 1; index < T; index += 1) {
    S[index] = (S[index - 1] + Q) >>> 0;
  }
  let A = 0;
  let B = 0;
  let i = 0;
  let j = 0;
  const iterations = 3 * Math.max(L.length, T);
  for (let k = 0; k < iterations; k += 1) {
    A = rotl((S[i] + A + B) >>> 0, 3);
    S[i] = A;
    B = rotl((L[j] + A + B) >>> 0, A + B);
    L[j] = B;
    i = (i + 1) % T;
    j = (j + 1) % L.length;
  }
  return S;
}

export function rc5EncryptBlock(plaintextHex, keyHex, rounds) {
  if (plaintextHex.length !== 16) throw Error('RC5-32 block must be 64 bits');
  const S = rc5KeySchedule(keyHex, rounds);
  const bytes = plaintextHex.match(/../g).map(value => parseInt(value, 16));
  let A = (bytes[0] | (bytes[1] << 8) | (bytes[2] << 16) | (bytes[3] << 24)) >>> 0;
  let B = (bytes[4] | (bytes[5] << 8) | (bytes[6] << 16) | (bytes[7] << 24)) >>> 0;
  A = (A + S[0]) >>> 0;
  B = (B + S[1]) >>> 0;
  for (let round = 1; round <= rounds; round += 1) {
    A = (rotl(A ^ B, B) + S[2 * round]) >>> 0;
    B = (rotl(B ^ A, A) + S[2 * round + 1]) >>> 0;
  }
  return [A, B].flatMap(value => [value & 255, (value >>> 8) & 255, (value >>> 16) & 255, (value >>> 24) & 255])
    .map(value => value.toString(16).padStart(2, '0')).join('');
}

export function rc5DecryptBlock(ciphertextHex, keyHex, rounds) {
  if (ciphertextHex.length !== 16) throw Error('RC5-32 block must be 64 bits');
  const S = rc5KeySchedule(keyHex, rounds);
  const bytes = ciphertextHex.match(/../g).map(value => parseInt(value, 16));
  let A = (bytes[0] | (bytes[1] << 8) | (bytes[2] << 16) | (bytes[3] << 24)) >>> 0;
  let B = (bytes[4] | (bytes[5] << 8) | (bytes[6] << 16) | (bytes[7] << 24)) >>> 0;
  for (let round = rounds; round >= 1; round -= 1) {
    B = rotr((B - S[2 * round + 1]) >>> 0, A) ^ A;
    A = rotr((A - S[2 * round]) >>> 0, B) ^ B;
  }
  B = (B - S[1]) >>> 0;
  A = (A - S[0]) >>> 0;
  return [A, B].flatMap(value => [value & 255, (value >>> 8) & 255, (value >>> 16) & 255, (value >>> 24) & 255])
    .map(value => value.toString(16).padStart(2, '0')).join('');
}

export const RC5_VECTOR = {
  key: '000102030405060708090a0b0c0d0e0f',
  plaintext: '0001020304050607',
  ciphertext: '2a0edc0e9431ff73',
  rounds: 20
};
