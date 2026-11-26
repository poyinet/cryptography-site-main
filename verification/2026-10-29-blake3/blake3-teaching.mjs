export const IV = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];

export const CHUNK_START = 1;
export const CHUNK_END = 2;
export const PARENT = 4;
export const ROOT = 8;
export const KEYED_HASH = 16;
export const DERIVE_KEY_CONTEXT = 32;
export const DERIVE_KEY_MATERIAL = 64;

export const MSG_PERMUTATION = [2, 6, 3, 10, 7, 0, 4, 13, 1, 11, 12, 5, 9, 14, 15, 8];

export const rotr = (x, n) => ((x >>> n) | (x << (32 - n))) >>> 0;
export const add = (...values) => values.reduce((sum, value) => (sum + value) >>> 0, 0);

export const toBytes = input => {
  if (typeof input === 'string') return new TextEncoder().encode(input);
  if (input instanceof Uint8Array) return input;
  throw TypeError('Expected a string or Uint8Array');
};

export const bytesToHex = bytes => [...bytes].map(byte => byte.toString(16).padStart(2, '0')).join('');
export const hexToBytes = hex => Uint8Array.from(Buffer.from(hex, 'hex'));

export const wordsFromBytesLE = bytes => {
  const out = new Array(Math.ceil(bytes.length / 4));
  for (let i = 0; i < out.length; i += 1) {
    out[i] = (bytes[i * 4] || 0) | ((bytes[i * 4 + 1] || 0) << 8) | ((bytes[i * 4 + 2] || 0) << 16) | ((bytes[i * 4 + 3] || 0) << 24);
    out[i] = out[i] >>> 0;
  }
  return out;
};

export const wordsToBytesLE = words => {
  const out = new Uint8Array(words.length * 4);
  words.forEach((word, index) => {
    out[index * 4] = word & 0xff;
    out[index * 4 + 1] = (word >>> 8) & 0xff;
    out[index * 4 + 2] = (word >>> 16) & 0xff;
    out[index * 4 + 3] = (word >>> 24) & 0xff;
  });
  return out;
};

function g(v, a, b, c, d, mx, my) {
  v[a] = add(v[a], v[b], mx);
  v[d] = rotr(v[d] ^ v[a], 16);
  v[c] = add(v[c], v[d]);
  v[b] = rotr(v[b] ^ v[c], 12);
  v[a] = add(v[a], v[b], my);
  v[d] = rotr(v[d] ^ v[a], 8);
  v[c] = add(v[c], v[d]);
  v[b] = rotr(v[b] ^ v[c], 7);
}

export function compress(cv, blockWords, counter, blockLen, flags, {rounds = 7, permutation = MSG_PERMUTATION, iv = IV} = {}) {
  const v = [
    ...cv,
    ...iv.slice(0, 4),
    counter >>> 0,
    Math.floor(counter / 0x100000000) >>> 0,
    blockLen >>> 0,
    flags >>> 0,
  ];
  let m = blockWords.slice(0, 16);
  for (let round = 0; round < rounds; round += 1) {
    g(v, 0, 4, 8, 12, m[0], m[1]);
    g(v, 1, 5, 9, 13, m[2], m[3]);
    g(v, 2, 6, 10, 14, m[4], m[5]);
    g(v, 3, 7, 11, 15, m[6], m[7]);
    g(v, 0, 5, 10, 15, m[8], m[9]);
    g(v, 1, 6, 11, 12, m[10], m[11]);
    g(v, 2, 7, 8, 13, m[12], m[13]);
    g(v, 3, 4, 9, 14, m[14], m[15]);
    m = permutation.map(index => m[index]);
  }
  const out = new Array(16);
  for (let i = 0; i < 8; i += 1) {
    out[i] = (v[i] ^ v[i + 8]) >>> 0;
    out[i + 8] = (v[i + 8] ^ cv[i]) >>> 0;
  }
  return out;
}

function chunkState(data, chunkIndex, keyWords, baseFlags) {
  const blocks = [];
  if (data.length === 0) {
    blocks.push({words: new Array(16).fill(0), len: 0});
  } else {
    for (let offset = 0; offset < data.length; offset += 64) {
      const slice = data.subarray(offset, Math.min(offset + 64, data.length));
      const words = new Array(16).fill(0);
      wordsFromBytesLE(slice).forEach((word, index) => { words[index] = word; });
      blocks.push({words, len: slice.length});
    }
  }
  let cv = keyWords.slice();
  let preLastCV = null;
  let lastBlock = null;
  for (let index = 0; index < blocks.length; index += 1) {
    const block = blocks[index];
    const first = index === 0;
    const last = index === blocks.length - 1;
    if (last) {
      preLastCV = cv.slice();
      lastBlock = block;
    }
    let flags = baseFlags;
    if (first) flags |= CHUNK_START;
    if (last) flags |= CHUNK_END;
    const out = compress(cv, block.words, chunkIndex, block.len, flags);
    cv = out.slice(0, 8);
  }
  return {type: 'chunk', cv, chunkIndex, keyWords, baseFlags, preLastCV, lastBlock};
}

function parentNode(left, right, keyWords, baseFlags) {
  const blockWords = [...left.cv, ...right.cv];
  const out = compress(keyWords, blockWords, 0, 64, baseFlags | PARENT);
  return {type: 'parent', cv: out.slice(0, 8), keyWords, baseFlags, blockWords, left, right};
}

function buildTree(data, chunkStart, keyWords, baseFlags) {
  if (data.length <= 1024) return chunkState(data, chunkStart, keyWords, baseFlags);
  const chunkCount = Math.ceil(data.length / 1024);
  const leftChunks = 2 ** Math.floor(Math.log2(chunkCount - 1));
  const split = leftChunks * 1024;
  const left = buildTree(data.subarray(0, split), chunkStart, keyWords, baseFlags);
  const right = buildTree(data.subarray(split), chunkStart + leftChunks, keyWords, baseFlags);
  return parentNode(left, right, keyWords, baseFlags);
}

function rootBytes(node, keyWords, baseFlags, length) {
  const out = new Uint8Array(length);
  let written = 0;
  let counter = 0;
  while (written < length) {
    let block;
    let blockLen;
    let flags;
    let counterValue;
    if (node.type === 'chunk') {
      block = node.lastBlock.words;
      blockLen = node.lastBlock.len;
      flags = node.baseFlags | CHUNK_END | ROOT;
      if (node.singleBlock) flags |= CHUNK_START;
      counterValue = counter;
    } else {
      block = node.blockWords;
      blockLen = 64;
      flags = node.baseFlags | PARENT | ROOT;
      counterValue = counter;
    }
    const rootCV = node.type === 'chunk' ? node.preLastCV : keyWords;
    const outWords = compress(rootCV, block, counterValue, blockLen, flags);
    const bytes = wordsToBytesLE(outWords);
    const take = Math.min(64, length - written);
    out.set(bytes.subarray(0, take), written);
    written += take;
    counter += 1;
  }
  return out;
}

function makeNodeWithSingleFlag(data, chunkIndex, keyWords, baseFlags) {
  const node = chunkState(data, chunkIndex, keyWords, baseFlags);
  // A chunk is single-block when its data length is at most 64 (including empty).
  node.singleBlock = data.length <= 64;
  return node;
}

function buildTreeRoot(data, keyWords, baseFlags) {
  if (data.length <= 1024) return makeNodeWithSingleFlag(data, 0, keyWords, baseFlags);
  const chunkCount = Math.ceil(data.length / 1024);
  const leftChunks = 2 ** Math.floor(Math.log2(chunkCount - 1));
  const split = leftChunks * 1024;
  const left = buildTree(data.subarray(0, split), 0, keyWords, baseFlags);
  const right = buildTree(data.subarray(split), leftChunks, keyWords, baseFlags);
  return parentNode(left, right, keyWords, baseFlags);
}

export function blake3(input, {key = null, context = null, flags = 0, length = 32} = {}) {
  const data = toBytes(input);
  let keyWords = IV.slice();
  let baseFlags = flags;
  if (context !== null) {
    const contextHash = blake3(context, {length: 32, flags: DERIVE_KEY_CONTEXT});
    keyWords = wordsFromBytesLE(contextHash).slice(0, 8);
    baseFlags = DERIVE_KEY_MATERIAL;
  } else if (key !== null) {
    const keyBytes = typeof key === 'string' ? toBytes(key) : key;
    if (keyBytes.length !== 32) throw Error('BLAKE3 key must be 32 bytes');
    keyWords = wordsFromBytesLE(keyBytes).slice(0, 8);
    baseFlags = KEYED_HASH;
  }
  const root = buildTreeRoot(data, keyWords, baseFlags);
  return rootBytes(root, keyWords, baseFlags, length);
}

export const hash = (input, length = 32) => blake3(input, {length});
export const hashHex = (input, length = 32) => bytesToHex(hash(input, length));
export const keyedHash = (key, input, length = 32) => blake3(input, {key, length});
export const keyedHashHex = (key, input, length = 32) => bytesToHex(keyedHash(key, input, length));
export const deriveKey = (context, material, length = 32) => blake3(material, {context, length});
export const deriveKeyHex = (context, material, length = 32) => bytesToHex(deriveKey(context, material, length));

export function blake3Trace(input, {key = null, context = null, length = 32} = {}) {
  const data = toBytes(input);
  let keyWords = IV.slice();
  let baseFlags = 0;
  if (context !== null) {
    const contextHash = blake3(context, {length: 32, flags: DERIVE_KEY_CONTEXT});
    keyWords = wordsFromBytesLE(contextHash).slice(0, 8);
    baseFlags = DERIVE_KEY_MATERIAL;
  } else if (key !== null) {
    const keyBytes = typeof key === 'string' ? toBytes(key) : key;
    keyWords = wordsFromBytesLE(keyBytes).slice(0, 8);
    baseFlags = KEYED_HASH;
  }
  const root = buildTreeRoot(data, keyWords, baseFlags);
  const chunks = [];
  const collect = node => {
    if (node.type === 'chunk') {
      chunks.push({
        index: node.chunkIndex,
        cv: bytesToHex(wordsToBytesLE(node.cv)),
      });
    } else {
      collect(node.left);
      collect(node.right);
    }
  };
  collect(root);
  const flags = root.type === 'chunk'
    ? root.baseFlags | CHUNK_END | ROOT | (root.singleBlock ? CHUNK_START : 0)
    : root.baseFlags | PARENT | ROOT;
  return {
    inputLength: data.length,
    chunkCount: Math.max(1, Math.ceil(data.length / 1024)),
    rootType: root.type,
    rootFlags: flags,
    rootBlockLen: root.type === 'chunk' ? root.lastBlock.len : 64,
    rootCounter: 0,
    rootPreLastCV: root.type === 'chunk' ? bytesToHex(wordsToBytesLE(root.preLastCV)) : null,
    chunks,
    digest: bytesToHex(rootBytes(root, keyWords, baseFlags, length)),
  };
}
