import {createCipheriv, createDecipheriv} from 'node:crypto';

const bytes = hex => Buffer.from(hex, 'hex');
const hex = buffer => buffer.toString('hex');

function transform(algorithm, keyHex, ivHex, inputHex) {
  if (bytes(ivHex).length !== 16) throw Error('OFB IV must be 16 bytes');
  const cipher = createCipheriv(algorithm, bytes(keyHex), bytes(ivHex));
  cipher.setAutoPadding(false);
  return hex(Buffer.concat([cipher.update(bytes(inputHex)), cipher.final()]));
}

export function ofbEncrypt(keyHex, ivHex, plaintextHex) {
  return transform('aes-128-ofb', keyHex, ivHex, plaintextHex);
}

export function ofbDecrypt(keyHex, ivHex, ciphertextHex) {
  const decipher = createDecipheriv('aes-128-ofb', bytes(keyHex), bytes(ivHex));
  decipher.setAutoPadding(false);
  return hex(Buffer.concat([decipher.update(bytes(ciphertextHex)), decipher.final()]));
}

export function xorHex(a, b) {
  const left = bytes(a), right = bytes(b);
  if (left.length !== right.length) throw Error('XOR length mismatch');
  return hex(Buffer.from(left.map((value, index) => value ^ right[index])));
}

export const OFB_VECTOR = {
  key: '2b7e151628aed2a6abf7158809cf4f3c',
  iv: '000102030405060708090a0b0c0d0e0f',
  plaintext:
    '6bc1bee22e409f96e93d7e117393172a' +
    'ae2d8a571e03ac9c9eb76fac45af8e51' +
    '30c81c46a35ce411e5fbc1191a0a52ef' +
    'f69f2445df4f9b17ad2b417be66c3710',
  ciphertext:
    '3b3fd92eb72dad20333449f8e83cfb4a' +
    '7789508d16918f03f53c52dac54ed825' +
    '9740051e9c5fecf64344f7a82260edcc' +
    '304c6528f659c77866a510d9c1d6ae5e'
};
