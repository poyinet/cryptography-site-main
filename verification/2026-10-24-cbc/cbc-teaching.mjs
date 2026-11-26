import {createCipheriv, createDecipheriv} from 'node:crypto';

const BLOCK = 16;
const bytes = hex => Buffer.from(hex, 'hex');
const hex = buffer => buffer.toString('hex');

export function xorHex(a, b) {
  const left = bytes(a), right = bytes(b);
  if (left.length !== right.length) throw Error('XOR length mismatch');
  return hex(Buffer.from(left.map((value, index) => value ^ right[index])));
}

export function cbcEncrypt(keyHex, ivHex, plaintextHex) {
  if (bytes(plaintextHex).length % BLOCK !== 0) throw Error('CBC plaintext must be a multiple of 16 bytes');
  if (bytes(ivHex).length !== BLOCK) throw Error('CBC IV must be 16 bytes');
  const cipher = createCipheriv('aes-128-cbc', bytes(keyHex), bytes(ivHex));
  cipher.setAutoPadding(false);
  return hex(Buffer.concat([cipher.update(bytes(plaintextHex)), cipher.final()]));
}

export function cbcDecrypt(keyHex, ivHex, ciphertextHex) {
  if (bytes(ciphertextHex).length % BLOCK !== 0) throw Error('CBC ciphertext must be a multiple of 16 bytes');
  if (bytes(ivHex).length !== BLOCK) throw Error('CBC IV must be 16 bytes');
  const decipher = createDecipheriv('aes-128-cbc', bytes(keyHex), bytes(ivHex));
  decipher.setAutoPadding(false);
  return hex(Buffer.concat([decipher.update(bytes(ciphertextHex)), decipher.final()]));
}

export function pkcs7Pad(plaintextHex) {
  const input = bytes(plaintextHex);
  const count = BLOCK - (input.length % BLOCK);
  return hex(Buffer.concat([input, Buffer.alloc(count, count)]));
}

export function pkcs7Unpad(paddedHex) {
  const input = bytes(paddedHex);
  if (input.length === 0 || input.length % BLOCK !== 0) throw Error('Invalid padded length');
  const count = input[input.length - 1];
  if (count < 1 || count > BLOCK) throw Error('Invalid padding value');
  for (let index = input.length - count; index < input.length; index++) {
    if (input[index] !== count) throw Error('Invalid padding bytes');
  }
  return hex(input.subarray(0, input.length - count));
}

export function birthdayProbability(blocks, bits = 64) {
  const n = Number(blocks);
  return 1 - Math.exp(-(n * (n - 1)) / (2 * 2 ** bits));
}

export const CBC_VECTOR = {
  key: '2b7e151628aed2a6abf7158809cf4f3c',
  iv: '000102030405060708090a0b0c0d0e0f',
  plaintext:
    '6bc1bee22e409f96e93d7e117393172a' +
    'ae2d8a571e03ac9c9eb76fac45af8e51' +
    '30c81c46a35ce411e5fbc1191a0a52ef' +
    'f69f2445df4f9b17ad2b417be66c3710',
  ciphertext:
    '7649abac8119b246cee98e9b12e9197d' +
    '5086cb9b507219ee95db113a917678b2' +
    '73bed6b8e3c1743b7116e69e22229516' +
    '3ff1caa1681fac09120eca307586e1a7'
};
