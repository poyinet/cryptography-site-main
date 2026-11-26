import {createCipheriv, createDecipheriv} from 'node:crypto';

const BLOCK = 16;
const bytes = hex => Buffer.from(hex, 'hex');
const hex = buffer => buffer.toString('hex');

export function ecbEncrypt(keyHex, plaintextHex) {
  if (bytes(plaintextHex).length % BLOCK !== 0) throw Error('ECB plaintext must be a multiple of 16 bytes');
  const cipher = createCipheriv('aes-128-ecb', bytes(keyHex), null);
  cipher.setAutoPadding(false);
  return hex(Buffer.concat([cipher.update(bytes(plaintextHex)), cipher.final()]));
}

export function ecbDecrypt(keyHex, ciphertextHex) {
  if (bytes(ciphertextHex).length % BLOCK !== 0) throw Error('ECB ciphertext must be a multiple of 16 bytes');
  const decipher = createDecipheriv('aes-128-ecb', bytes(keyHex), null);
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

export const ECB_VECTOR = {
  key: '2b7e151628aed2a6abf7158809cf4f3c',
  plaintext:
    '6bc1bee22e409f96e93d7e117393172a' +
    'ae2d8a571e03ac9c9eb76fac45af8e51' +
    '30c81c46a35ce411e5fbc1191a0a52ef' +
    'f69f2445df4f9b17ad2b417be66c3710',
  ciphertext:
    '3ad77bb40d7a3660a89ecaf32466ef97' +
    'f5d3d58503b9699de785895a96fdbaaf' +
    '43b1cd7f598ece23881b00e3ed030688' +
    '7b0c785e27e8ad3f8223207104725dd4'
};
