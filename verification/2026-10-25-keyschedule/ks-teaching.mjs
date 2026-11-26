const xtime = value => ((value << 1) ^ ((value & 0x80) ? 0x11b : 0)) & 0xff;

function multiply(a, b) {
  let result = 0;
  for (let bit = 0; bit < 8; bit += 1) {
    if (b & 1) result ^= a;
    a = xtime(a);
    b >>>= 1;
  }
  return result;
}

function power(a, exponent) {
  let result = 1;
  while (exponent) {
    if (exponent & 1) result = multiply(result, a);
    a = multiply(a, a);
    exponent >>>= 1;
  }
  return result;
}

const rotateByte = (value, amount) => ((value << amount) | (value >>> (8 - amount))) & 0xff;

function substituteByte(value) {
  const inverse = value === 0 ? 0 : power(value, 254);
  return inverse ^ rotateByte(inverse, 1) ^ rotateByte(inverse, 2) ^ rotateByte(inverse, 3) ^ rotateByte(inverse, 4) ^ 0x63;
}

const SBOX = Uint8Array.from({length: 256}, (_, index) => substituteByte(index));

const fromHex = hex => {
  if (typeof hex !== 'string' || hex.length % 2 || !/^[0-9a-f]*$/i.test(hex)) {
    throw new TypeError('Expected an even-length hexadecimal string');
  }
  return Uint8Array.from(hex.match(/../g) || [], value => parseInt(value, 16));
};

const toHex = bytes => Array.from(bytes, value => value.toString(16).padStart(2, '0')).join('');

export function aesKeySchedule(keyHex) {
  const key = fromHex(keyHex);
  if (![16, 24, 32].includes(key.length)) throw new TypeError('AES key must be 16, 24 or 32 bytes');
  const Nk = key.length / 4;
  const Nr = Nk + 6;
  const wordCount = 4 * (Nr + 1);
  const words = [];
  for (let index = 0; index < Nk; index += 1) {
    words.push(Uint8Array.from(key.slice(index * 4, index * 4 + 4)));
  }
  let roundConstant = 1;
  for (let index = Nk; index < wordCount; index += 1) {
    let temp = Uint8Array.from(words[index - 1]);
    if (index % Nk === 0) {
      temp = Uint8Array.from([temp[1], temp[2], temp[3], temp[0]], value => SBOX[value]);
      temp[0] ^= roundConstant;
      roundConstant = xtime(roundConstant);
    } else if (Nk === 8 && index % Nk === 4) {
      temp = Uint8Array.from(temp, value => SBOX[value]);
    }
    words.push(Uint8Array.from(temp, (value, byteIndex) => value ^ words[index - Nk][byteIndex]));
  }
  const roundKeys = Array.from({length: Nr + 1}, (_, round) =>
    Uint8Array.from(words.slice(4 * round, 4 * round + 4).flatMap(word => Array.from(word))));
  return {Nk, Nr, words, roundKeys};
}

export {fromHex, toHex};

export const KEY_VECTORS = {
  aes128: '2b7e151628aed2a6abf7158809cf4f3c',
  aes192: '8e73b0f7da0e6452c810f32b809079e562f8ead2522c6b7b',
  aes256: '603deb1015ca71be2b73aef0857d77811f352c073b6108d72d9810a30914dff4'
};
