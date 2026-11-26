// Teaching implementation of the HMAC construction exactly as RFC 2104 §2 prints it, steps (1)-(7).
// It deliberately does NOT call crypto.createHmac: the only primitive used is the underlying hash H, so the
// nesting itself is what gets tested. verify.mjs compares (a) these outputs against the digests printed in
// the registered RFC 4231 text, and (b) these outputs against Node's own independent implementation.
import { createHash } from 'node:crypto';

export const BLOCK = { sha224: 64, sha256: 64, sha384: 128, sha512: 128 };
export const HASHLEN = { sha224: 28, sha256: 32, sha384: 48, sha512: 64 };
export const IPAD_BYTE = 0x36;
export const OPAD_BYTE = 0x5c;

const H = (algo, ...parts) => { const h = createHash(algo); for (const p of parts) h.update(p); return h.digest(); };

// trace=true returns every intermediate the printed steps name, so a reader can follow the derivation.
export function hmac(algo, key, data, { truncate = null, trace = false } = {}) {
  const B = BLOCK[algo];
  if (!B) throw new Error(`unknown hash ${algo}`);
  // "Applications that use keys longer than B bytes will first hash the key using H and then use the
  //  resultant L byte string as the actual key to HMAC." (RFC 2104 §2)
  const k = key.length > B ? H(algo, key) : Buffer.from(key);
  const padded = Buffer.alloc(B);           // step (1): append zeros to K to create a B byte string
  k.copy(padded);
  const ipadBlock = Buffer.alloc(B);        // step (2): XOR that B-byte string with ipad
  const opadBlock = Buffer.alloc(B);        // step (5): XOR that B-byte string with opad
  for (let i = 0; i < B; i++) { ipadBlock[i] = padded[i] ^ IPAD_BYTE; opadBlock[i] = padded[i] ^ OPAD_BYTE; }
  const inner = H(algo, ipadBlock, data);   // steps (3)+(4): append text, apply H
  const outer = H(algo, opadBlock, inner);  // steps (6)+(7): append the H result, apply H
  const full = outer;
  const out = truncate === null ? full : full.subarray(0, truncate);
  if (!trace) return out;
  return {
    keyWasHashed: key.length > B,
    hashedKeyHex: key.length > B ? k.toString('hex') : null,
    paddedKeyHex: padded.toString('hex'),
    ipadBlockHex: ipadBlock.toString('hex'),
    opadBlockHex: opadBlock.toString('hex'),
    innerHex: inner.toString('hex'),
    outerHex: full.toString('hex'),
    outputHex: out.toString('hex'),
    blockSize: B,
    keyLengthUsed: k.length,
    outputLength: out.length,
  };
}
