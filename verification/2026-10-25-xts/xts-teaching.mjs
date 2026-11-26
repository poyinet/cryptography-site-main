import {createCipheriv, createDecipheriv} from 'node:crypto';

const bytes = hex => Buffer.from(hex, 'hex');
const hex = buffer => buffer.toString('hex');

function aesBlockEncrypt(keyHex, block) {
  const cipher = createCipheriv('aes-128-ecb', bytes(keyHex), null);
  cipher.setAutoPadding(false);
  return Buffer.concat([cipher.update(block), cipher.final()]);
}

function aesBlockDecrypt(keyHex, block) {
  const decipher = createDecipheriv('aes-128-ecb', bytes(keyHex), null);
  decipher.setAutoPadding(false);
  return Buffer.concat([decipher.update(block), decipher.final()]);
}

function xor(a, b) {
  if (a.length !== b.length) throw Error('XOR length mismatch');
  return Buffer.from(a.map((value, index) => value ^ b[index]));
}

function alpha(tweak) {
  const next = Buffer.alloc(16);
  let carry = 0;
  for (let index = 0; index < 16; index += 1) {
    const outgoing = (tweak[index] >> 7) & 1;
    next[index] = ((tweak[index] << 1) & 0xff) | carry;
    carry = outgoing;
  }
  if (carry) next[0] ^= 0x87;
  return next;
}

function splitKey(keyHex) {
  if (keyHex.length !== 64) throw Error('XTS-AES-128 key must be 32 bytes');
  return {k1: keyHex.slice(0, 32), k2: keyHex.slice(32)};
}

function tweakSequence(k2, tweakHex, count) {
  const tweaks = [aesBlockEncrypt(k2, bytes(tweakHex))];
  for (let index = 1; index < count; index += 1) {
    tweaks.push(alpha(tweaks[index - 1]));
  }
  return tweaks;
}

function encryptBlock(k1, block, tweak) {
  return xor(aesBlockEncrypt(k1, xor(block, tweak)), tweak);
}

function decryptBlock(k1, block, tweak) {
  return xor(aesBlockDecrypt(k1, xor(block, tweak)), tweak);
}

export function xtsEncrypt(keyHex, tweakHex, plaintextHex) {
  const {k1, k2} = splitKey(keyHex);
  const plaintext = bytes(plaintextHex);
  if (plaintext.length < 16) throw Error('XTS needs at least one complete block');
  const complete = Math.floor(plaintext.length / 16);
  const partial = plaintext.length % 16;
  const tweaks = tweakSequence(k2, tweakHex, complete + 1);
  const output = [];
  for (let index = 0; index < complete - 1; index += 1) {
    const block = plaintext.subarray(index * 16, (index + 1) * 16);
    output.push(encryptBlock(k1, block, tweaks[index]));
  }
  const lastComplete = plaintext.subarray((complete - 1) * 16, complete * 16);
  if (partial === 0) {
    output.push(encryptBlock(k1, lastComplete, tweaks[complete - 1]));
    return hex(Buffer.concat(output));
  }
  const partialBlock = plaintext.subarray(complete * 16);
  const stolen = encryptBlock(k1, lastComplete, tweaks[complete - 1]);
  const truncated = stolen.subarray(0, partial);
  const paddedPartial = Buffer.concat([partialBlock, stolen.subarray(partial)]);
  const lastFull = encryptBlock(k1, paddedPartial, tweaks[complete]);
  output.push(lastFull, truncated);
  return hex(Buffer.concat(output));
}

export function xtsDecrypt(keyHex, tweakHex, ciphertextHex) {
  const {k1, k2} = splitKey(keyHex);
  const ciphertext = bytes(ciphertextHex);
  if (ciphertext.length < 16) throw Error('XTS needs at least one complete block');
  const complete = Math.floor(ciphertext.length / 16);
  const partial = ciphertext.length % 16;
  const tweaks = tweakSequence(k2, tweakHex, complete + 1);
  const output = [];
  for (let index = 0; index < complete - 1; index += 1) {
    const block = ciphertext.subarray(index * 16, (index + 1) * 16);
    output.push(decryptBlock(k1, block, tweaks[index]));
  }
  if (partial === 0) {
    const lastFull = ciphertext.subarray((complete - 1) * 16, complete * 16);
    output.push(decryptBlock(k1, lastFull, tweaks[complete - 1]));
    return hex(Buffer.concat(output));
  }
  const lastFull = ciphertext.subarray((complete - 1) * 16, complete * 16);
  const truncated = ciphertext.subarray(complete * 16);
  const recovered = decryptBlock(k1, lastFull, tweaks[complete]);
  const partialBlock = recovered.subarray(0, partial);
  const stolen = Buffer.concat([truncated, recovered.subarray(partial)]);
  const lastComplete = decryptBlock(k1, stolen, tweaks[complete - 1]);
  output.push(lastComplete, partialBlock);
  return hex(Buffer.concat(output));
}

export const XTS_VECTOR = {
  key: 'b7b93f516aef295eff3a29d837cf1f135347e8a21dae616ff5062b2e8d78ce5e',
  tweak: '873edea653b643bd8bcf51403197ed14',
  plaintext: '236f8a5b58dd55f6194ed70c4ac1a17f1fe60ec9a6c454d087ccb77d6b638c47',
  ciphertext: '22e6a3c6379dcf7599b052b5a749c7f78ad8a11b9f1aa9430cf3aef445682e19'
};
