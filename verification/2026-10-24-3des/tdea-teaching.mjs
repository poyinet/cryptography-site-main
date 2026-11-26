// TDEA（3DES）教学实现：C = E_K3(D_K2(E_K1(P)))。
// 复用同批次的 DES 引擎 des-core.mjs；只用于教学与已知答案核证。

import { hexToBits, bitsToHex, encryptBlock } from './des-core.mjs';

export const KEYING_OPTIONS = {
  '1-key': { keys: ['K1', 'K1', 'K1'], nominalBits: 64, effectiveBits: 56, note: 'collapses to single DES' },
  '2-key': { keys: ['K1', 'K2', 'K1'], nominalBits: 128, effectiveBits: 112, note: 'K1 = K3' },
  '3-key': { keys: ['K1', 'K2', 'K3'], nominalBits: 192, effectiveBits: 168, note: 'three independent keys' }
};

export function keyBundleFor(option, key1, key2, key3) {
  const spec = KEYING_OPTIONS[option];
  if (!spec) throw Error('Unknown TDEA keying option');
  const byName = { K1: key1, K2: key2 ?? key1, K3: key3 ?? key1 };
  return spec.keys.map(name => byName[name]);
}

export function tdeaEncryptBlock(blockBits, keyBundle, { decrypt = false } = {}) {
  if (blockBits.length !== 64) throw Error('TDEA block must be 64 bits');
  if (!Array.isArray(keyBundle) || keyBundle.length !== 3) throw Error('TDEA needs a three-key bundle');
  const [key1, key2, key3] = keyBundle.map(key => (typeof key === 'string' ? hexToBits(key) : key));
  let state = blockBits;
  if (!decrypt) {
    state = encryptBlock(state, key1);
    state = encryptBlock(state, key2, { decrypt: true });
    state = encryptBlock(state, key3);
  } else {
    state = encryptBlock(state, key3, { decrypt: true });
    state = encryptBlock(state, key2);
    state = encryptBlock(state, key1, { decrypt: true });
  }
  return state;
}

export const tdeaEncryptHex = (plainHex, keyBundle, options) => {
  const clean = String(plainHex).replace(/\s+/g, '').toUpperCase();
  if (!clean || clean.length % 16) throw Error('TDEA ECB input must be one or more 64-bit blocks');
  const blocks = clean.match(/.{16}/g);
  return blocks.map(block => bitsToHex(tdeaEncryptBlock(hexToBits(block), keyBundle, options))).join('');
};

export const TDEA_VECTORS = {
  threeKey: {
    keys: ['0123456789ABCDEF', '23456789ABCDEF01', '456789ABCDEF0123'],
    plaintext: '6BC1BEE22E409F96E93D7E117393172AAE2D8A571E03AC9C9EB76FAC45AF8E51',
    ciphertext: '714772F339841D34267FCC4BD2949CC3EE11C22A576A303876183F99C0B6DE87',
    source: 'NIST TDES_ECB example, three-key TDEA'
  },
  twoKey: {
    keys: ['0123456789ABCDEF', '23456789ABCDEF01', '0123456789ABCDEF'],
    plaintext: '6BC1BEE22E409F96E93D7E117393172AAE2D8A571E03AC9C9EB76FAC45AF8E51',
    ciphertext: '06EDE3D82884090AFF322C19F0518486730576972A666E58B6C88CF107340D3D',
    source: 'NIST TDES_ECB example, two-key TDEA (K1 = K3)'
  }
};
