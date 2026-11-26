import {createCipheriv} from 'node:crypto';

const bytes = hex => Buffer.from(hex, 'hex');
const hex = buffer => buffer.toString('hex');

export function xorHex(a, b) {
  const left = bytes(a), right = bytes(b);
  if (left.length !== right.length) throw Error('XOR length mismatch');
  return hex(Buffer.from(left.map((value, index) => value ^ right[index])));
}

function ctrTransform(keyHex, initialCounterHex, inputHex) {
  if (bytes(initialCounterHex).length !== 16) throw Error('CTR initial counter must be 16 bytes');
  const cipher = createCipheriv('aes-128-ctr', bytes(keyHex), bytes(initialCounterHex));
  cipher.setAutoPadding(false);
  return hex(Buffer.concat([cipher.update(bytes(inputHex)), cipher.final()]));
}

export function ctrEncrypt(keyHex, initialCounterHex, plaintextHex) {
  return ctrTransform(keyHex, initialCounterHex, plaintextHex);
}

export function ctrDecrypt(keyHex, initialCounterHex, ciphertextHex) {
  return ctrTransform(keyHex, initialCounterHex, ciphertextHex);
}

export function incrementRightmost(counterHex, bits) {
  if (bits % 8 !== 0) throw Error('Teaching increment supports whole-byte fields only');
  const width = bits / 8;
  const input = bytes(counterHex);
  if (width > input.length) throw Error('Counter field is wider than the block');
  const mask = (1n << BigInt(bits)) - 1n;
  const field = BigInt('0x' + hex(input.subarray(input.length - width))) + 1n;
  const wrapped = field & mask;
  const replacement = bytes(wrapped.toString(16).padStart(width * 2, '0'));
  return hex(Buffer.concat([input.subarray(0, input.length - width), replacement]));
}

export const CTR_VECTOR = {
  key: '2b7e151628aed2a6abf7158809cf4f3c',
  initialCounter: 'f0f1f2f3f4f5f6f7f8f9fafbfcfdfeff',
  plaintext:
    '6bc1bee22e409f96e93d7e117393172a' +
    'ae2d8a571e03ac9c9eb76fac45af8e51' +
    '30c81c46a35ce411e5fbc1191a0a52ef' +
    'f69f2445df4f9b17ad2b417be66c3710',
  ciphertext:
    '874d6191b620e3261bef6864990db6ce' +
    '9806f66b7970fdff8617187bb9fffdff' +
    '5ae4df3edbd5d35e5b4f09020db03eab' +
    '1e031dda2fbe03d1792170a0f3009cee'
};
