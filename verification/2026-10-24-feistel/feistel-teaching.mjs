// Feistel 网络教学实现：16 位块（8+8），可替换的轮函数。
// 只用于结构性质核证，不是任何实际密码。

export const HALF_BITS = 8;
export const BLOCK_BITS = 16;

export const toyFNonInjective = (right, key = 0) => (right + key) % 4;

export const toyFPermutation = (right, key = 1) => ((right * 37 + key * 11) & 0xff);

export function feistelEncrypt(block, keys, f = toyFNonInjective) {
  if (!Number.isInteger(block) || block < 0 || block > 0xffff) throw Error('Block must be 16 bits');
  let left = (block >> 8) & 0xff;
  let right = block & 0xff;
  for (const key of keys) {
    [left, right] = [right, left ^ f(right, key)];
  }
  return ((right << 8) | left) >>> 0;
}

export function feistelDecrypt(block, keys, f = toyFNonInjective) {
  if (!Number.isInteger(block) || block < 0 || block > 0xffff) throw Error('Block must be 16 bits');
  let left = block & 0xff;
  let right = (block >> 8) & 0xff;
  for (let index = keys.length - 1; index >= 0; index--) {
    [left, right] = [right ^ f(left, keys[index]), left];
  }
  return ((left << 8) | right) >>> 0;
}

