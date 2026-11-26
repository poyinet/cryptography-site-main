// MD4 teaching implementation following RFC 1320 exactly.
// Educational only: NOT constant-time, NOT secure, and MD4 itself is broken.
// All 32-bit arithmetic is forced with >>> 0 so JS bitwise ops stay in range.

export const IV = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476];
export const K2 = 0x5a827999; // round 2 constant: RFC 1320 says it represents sqrt(2), octal 013240474631
export const K3 = 0x6ed9eba1; // round 3 constant: RFC 1320 says it represents sqrt(3), octal 015666365641

// Message-word schedules per RFC 1320 section 3.4.
export const R1_K = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
export const R1_S = [3, 7, 11, 19, 3, 7, 11, 19, 3, 7, 11, 19, 3, 7, 11, 19];
export const R2_K = [0, 4, 8, 12, 1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15];
export const R2_S = [3, 5, 9, 13, 3, 5, 9, 13, 3, 5, 9, 13, 3, 5, 9, 13];
export const R3_K = [0, 8, 4, 12, 2, 10, 6, 14, 1, 9, 5, 13, 3, 11, 7, 15];
export const R3_S = [3, 9, 11, 15, 3, 9, 11, 15, 3, 9, 11, 15, 3, 9, 11, 15];

const F = (x, y, z) => (x & y) | (~x & z);
const G = (x, y, z) => (x & y) | (x & z) | (y & z);
const H = (x, y, z) => x ^ y ^ z;

const rotl = (x, n) => ((x << n) | (x >>> (32 - n))) >>> 0;

export function toBytes(s) {
  return new TextEncoder().encode(s);
}

export function bytesToHex(b) {
  return Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
}

export function hexToBytes(h) {
  const out = new Uint8Array(h.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(h.slice(i * 2, i * 2 + 2), 16);
  return out;
}

// Little-endian word decode, as in RFC 1320 section 2 / appendix Decode().
export function wordsFromBytesLE(bytes) {
  const w = new Array(bytes.length / 4);
  for (let i = 0; i < w.length; i++) {
    const j = i * 4;
    w[i] = (bytes[j] | (bytes[j + 1] << 8) | (bytes[j + 2] << 16) | (bytes[j + 3] << 24)) >>> 0;
  }
  return w;
}

export function bytesFromWordsLE(words) {
  const out = new Uint8Array(words.length * 4);
  for (let i = 0; i < words.length; i++) {
    const j = i * 4;
    out[j] = words[i] & 0xff;
    out[j + 1] = (words[i] >>> 8) & 0xff;
    out[j + 2] = (words[i] >>> 16) & 0xff;
    out[j + 3] = (words[i] >>> 24) & 0xff;
  }
  return out;
}

// RFC 1320 section 3.4 with optional schedule/constant overrides for
// negative controls. feedForward=false drops the section-3.4 final additions.
export function transform(h, block, opts = {}) {
  const {
    r1k = R1_K, r1s = R1_S,
    r2k = R2_K, r2s = R2_S,
    r3k = R3_K, r3s = R3_S,
    k2 = K2, k3 = K3,
    feedForward = true,
  } = opts;
  let [a, b, c, d] = h;
  const aa = a, bb = b, cc = c, dd = d;

  const round = (fn, ks, ss, k) => {
    for (let i = 0; i < 16; i++) {
      const ki = ks[i], s = ss[i];
      switch (i % 4) {
        case 0:
          a = rotl((a + fn(b, c, d) + block[ki] + k) >>> 0, s);
          break;
        case 1:
          d = rotl((d + fn(a, b, c) + block[ki] + k) >>> 0, s);
          break;
        case 2:
          c = rotl((c + fn(d, a, b) + block[ki] + k) >>> 0, s);
          break;
        default:
          b = rotl((b + fn(c, d, a) + block[ki] + k) >>> 0, s);
      }
    }
  };

  round(F, r1k, r1s, 0);
  const after1 = [a, b, c, d];
  round(G, r2k, r2s, k2);
  const after2 = [a, b, c, d];
  round(H, r3k, r3s, k3);
  const after3 = [a, b, c, d];

  const out = feedForward
    ? [(a + aa) >>> 0, (b + bb) >>> 0, (c + cc) >>> 0, (d + dd) >>> 0]
    : [a, b, c, d];
  return { out, after1, after2, after3 };
}

// RFC 1320 sections 3.1-3.2: 0x80 byte, zeros to length%64==56,
// then 64-bit little-endian bit length (low word first).
export function pad(messageBytes) {
  const bitLen = BigInt(messageBytes.length) * 8n;
  const padLen = (56 - ((messageBytes.length + 1) % 64) + 64) % 64;
  const out = new Uint8Array(messageBytes.length + 1 + padLen + 8);
  out.set(messageBytes);
  out[messageBytes.length] = 0x80;
  const dv = new DataView(out.buffer);
  dv.setUint32(out.length - 8, Number(bitLen & 0xffffffffn), true);
  dv.setUint32(out.length - 4, Number(bitLen >> 32n), true);
  return out;
}

// Returns { digest, rounds: [[after1,after2,after3], ...] } for the last block
// when trace=true; digest is the 16 bytes in RFC order (low byte of A first).
export function md4(messageBytes, opts = {}) {
  const padded = pad(messageBytes);
  let h = opts.iv ? [...opts.iv] : [...IV];
  let last = null;
  for (let off = 0; off < padded.length; off += 64) {
    const block = wordsFromBytesLE(padded.slice(off, off + 64));
    last = transform(h, block, opts);
    h = last.out;
  }
  return { digest: bytesFromWordsLE(h), rounds: last ? [last.after1, last.after2, last.after3] : [] };
}

export function hashHex(message, opts = {}) {
  const bytes = typeof message === "string" ? toBytes(message) : message;
  return bytesToHex(md4(bytes, opts).digest);
}
