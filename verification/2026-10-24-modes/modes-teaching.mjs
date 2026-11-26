// 分组密码工作模式教学实现：直接调用 Node/OpenSSL 的 AES 引擎。
// 只用于公开测试向量和结构演示，不处理密钥管理、协议或侧信道。

import {createCipheriv, createDecipheriv} from 'node:crypto';

const bytes = hex => Buffer.from(String(hex).replace(/\s+/g, ''), 'hex');
const hex = buffer => Buffer.from(buffer).toString('hex');

export function ecbEncrypt(keyHex, plaintextHex) {
  const cipher = createCipheriv('aes-128-ecb', bytes(keyHex), null);
  cipher.setAutoPadding(false);
  return hex(Buffer.concat([cipher.update(bytes(plaintextHex)), cipher.final()]));
}
export function ecbDecrypt(keyHex, ciphertextHex) {
  const decipher = createDecipheriv('aes-128-ecb', bytes(keyHex), null);
  decipher.setAutoPadding(false);
  return hex(Buffer.concat([decipher.update(bytes(ciphertextHex)), decipher.final()]));
}

export function cbcEncrypt(keyHex, ivHex, plaintextHex) {
  const cipher = createCipheriv('aes-128-cbc', bytes(keyHex), bytes(ivHex));
  cipher.setAutoPadding(false);
  return hex(Buffer.concat([cipher.update(bytes(plaintextHex)), cipher.final()]));
}
export function cbcDecrypt(keyHex, ivHex, ciphertextHex) {
  const decipher = createDecipheriv('aes-128-cbc', bytes(keyHex), bytes(ivHex));
  decipher.setAutoPadding(false);
  return hex(Buffer.concat([decipher.update(bytes(ciphertextHex)), decipher.final()]));
}

export function ctrEncrypt(keyHex, ivHex, plaintextHex) {
  const cipher = createCipheriv('aes-128-ctr', bytes(keyHex), bytes(ivHex));
  return hex(Buffer.concat([cipher.update(bytes(plaintextHex)), cipher.final()]));
}

export function cfbEncrypt(keyHex, ivHex, plaintextHex) {
  const cipher = createCipheriv('aes-128-cfb', bytes(keyHex), bytes(ivHex));
  return hex(Buffer.concat([cipher.update(bytes(plaintextHex)), cipher.final()]));
}
export function ofbEncrypt(keyHex, ivHex, plaintextHex) {
  const cipher = createCipheriv('aes-128-ofb', bytes(keyHex), bytes(ivHex));
  return hex(Buffer.concat([cipher.update(bytes(plaintextHex)), cipher.final()]));
}

export function gcmEncrypt(keyHex, ivHex, plaintextHex, aadHex = '') {
  const cipher = createCipheriv('aes-128-gcm', bytes(keyHex), bytes(ivHex));
  if (aadHex) cipher.setAAD(bytes(aadHex));
  const ciphertext = Buffer.concat([cipher.update(bytes(plaintextHex)), cipher.final()]);
  return {ciphertext: hex(ciphertext), tag: cipher.getAuthTag().toString('hex')};
}
export function gcmDecrypt(keyHex, ivHex, ciphertextHex, tagHex, aadHex = '') {
  const decipher = createDecipheriv('aes-128-gcm', bytes(keyHex), bytes(ivHex));
  if (aadHex) decipher.setAAD(bytes(aadHex));
  decipher.setAuthTag(bytes(tagHex));
  return hex(Buffer.concat([decipher.update(bytes(ciphertextHex)), decipher.final()]));
}

export function pkcs7Pad(plaintextHex, blockBytes = 16) {
  const data = bytes(plaintextHex);
  const padding = blockBytes - (data.length % blockBytes);
  return hex(Buffer.concat([data, Buffer.alloc(padding, padding)]));
}

export const AES128_VECTORS = {
  key: '2b7e151628aed2a6abf7158809cf4f3c',
  iv: '000102030405060708090a0b0c0d0e0f',
  ctrIv: 'f0f1f2f3f4f5f6f7f8f9fafbfcfdfeff',
  plaintext: '6bc1bee22e409f96e93d7e117393172a',
  ecb: '3ad77bb40d7a3660a89ecaf32466ef97',
  cbc: '7649abac8119b246cee98e9b12e9197d',
  cfb: '3b3fd92eb72dad20333449f8e83cfb4a',
  ofb: '3b3fd92eb72dad20333449f8e83cfb4a',
  ctr: '874d6191b620e3261bef6864990db6ce'
};

export const GCM_VECTOR = {
  key: '7fddb57453c241d03efbed3ac44e371c',
  iv: 'ee283a3fc75575e33efd4887',
  plaintext: 'd5de42b461646c255c87bd2962d3b9a2',
  ciphertext: '2ccda4a5415cb91e135c2a0f78c9b2fd',
  tag: 'b36d1df9b9d5e596f83e8b7f52971cb3'
};
