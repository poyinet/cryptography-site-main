import {createCipheriv, createDecipheriv} from 'node:crypto';

const bytes = hex => Buffer.from(hex, 'hex');
const hex = buffer => buffer.toString('hex');

export function pkcs7Pad(inputHex, blockSize = 16) {
  if (!Number.isInteger(blockSize) || blockSize < 1 || blockSize > 255) {
    throw Error('block size must be an integer from 1 to 255');
  }
  const data = bytes(inputHex);
  const padLength = blockSize - (data.length % blockSize);
  const padding = Buffer.alloc(padLength, padLength);
  return hex(Buffer.concat([data, padding]));
}

export function pkcs7Unpad(inputHex, blockSize = 16) {
  if (!Number.isInteger(blockSize) || blockSize < 1 || blockSize > 255) {
    throw Error('block size must be an integer from 1 to 255');
  }
  const data = bytes(inputHex);
  if (data.length === 0 || data.length % blockSize !== 0) {
    throw Error('invalid padded length');
  }
  const padLength = data[data.length - 1];
  if (padLength < 1 || padLength > blockSize) {
    throw Error('invalid padding length');
  }
  for (let index = data.length - padLength; index < data.length; index += 1) {
    if (data[index] !== padLength) throw Error('invalid padding byte');
  }
  return hex(data.subarray(0, data.length - padLength));
}

export function cbcEncryptNoPadding(keyHex, ivHex, plaintextHex) {
  const cipher = createCipheriv('aes-128-cbc', bytes(keyHex), bytes(ivHex));
  cipher.setAutoPadding(false);
  return hex(Buffer.concat([cipher.update(bytes(plaintextHex)), cipher.final()]));
}

export function cbcDecryptNoPadding(keyHex, ivHex, ciphertextHex) {
  const decipher = createDecipheriv('aes-128-cbc', bytes(keyHex), bytes(ivHex));
  decipher.setAutoPadding(false);
  return hex(Buffer.concat([decipher.update(bytes(ciphertextHex)), decipher.final()]));
}

export function paddingOracle(keyHex, ivHex, ciphertextHex) {
  const padded = cbcDecryptNoPadding(keyHex, ivHex, ciphertextHex);
  try {
    pkcs7Unpad(padded, 16);
    return true;
  } catch {
    return false;
  }
}

export function recoverLastByteWithOracle(keyHex, ivHex, ciphertextHex) {
  const ciphertext = bytes(ciphertextHex);
  if (ciphertext.length !== 32) throw Error('demo expects exactly two cipher blocks');
  const iv = bytes(ivHex);
  const first = ciphertext.subarray(0, 16);
  const second = ciphertext.subarray(16, 32);
  const candidates = [];
  for (let guess = 0; guess < 256; guess += 1) {
    const forged = Buffer.from(first);
    forged[15] = guess;
    if (!paddingOracle(keyHex, ivHex, hex(Buffer.concat([forged, second])))) continue;
    const disambiguated = Buffer.from(forged);
    disambiguated[14] ^= 0xff;
    if (!paddingOracle(keyHex, ivHex, hex(Buffer.concat([disambiguated, second])))) continue;
    candidates.push(guess);
  }
  if (candidates.length !== 1) {
    throw Error('padding oracle demo is ambiguous: ' + candidates.length + ' candidates');
  }
  const lastIntermediate = candidates[0] ^ 0x01;
  return {
    guess: candidates[0],
    recoveredLastByte: (lastIntermediate ^ first[15]).toString(16).padStart(2, '0')
  };
}

export const PADDING_VECTOR = {
  key: '000102030405060708090a0b0c0d0e0f',
  iv: '101112131415161718191a1b1c1d1e1f',
  plaintext:
    '4142434445464748494a4b4c4d4e4f50' +
    '5152535455565758595a5b5c5d5e5f60'
};
