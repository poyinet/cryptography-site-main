// MD5 teaching implementation following RFC 1321 exactly.
// Educational only: NOT constant-time, NOT secure, and MD5 collisions are practical.
// All 32-bit arithmetic is forced with >>> 0 so JS bitwise ops stay in range.

export const IV = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476];

// RFC 1321 section 3.4: T[i] = integer part of 4294967296 * abs(sin(i)), i in radians.
export function tTable() {
  const t = new Array(64);
  for (let i = 1; i <= 64; i++) t[i - 1] = Math.floor(4294967296 * Math.abs(Math.sin(i))) >>> 0;
  return t;
}
export const T = tTable();

// Message-word schedules and shift amounts per RFC 1321 section 3.4.
export const R1_K = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
export const R1_S = [7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22];
export const R2_K = [1, 6, 11, 0, 5, 10, 15, 4, 9, 14, 3, 8, 13, 2, 7, 12];
export const R2_S = [5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20];
export const R3_K = [5, 8, 11, 14, 1, 4, 7, 10, 13, 0, 3, 6, 9, 12, 15, 2];
export const R3_S = [4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23];
export const R4_K = [0, 7, 14, 5, 12, 3, 10, 1, 8, 15, 6, 13, 4, 11, 2, 9];
export const R4_S = [6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21];

// RFC 1321 section 3.4 auxiliary functions.
export const F = (x, y, z) => (x & y) | (~x & z);
export const G = (x, y, z) => (x & z) | (y & ~z);
export const H = (x, y, z) => x ^ y ^ z;
export const I = (x, y, z) => y ^ (x | ~z);

// RFC 1320's round-2 function, used only as a negative control here.
export const MD4_G = (x, y, z) => (x & y) | (x & z) | (y & z);

const rotl = (x, n) => ((x << n) | (x >>> (32 - n))) >>> 0;

export function toBytes(s) {
  return new TextEncoder().encode(s);
}

// Accept either a string or a byte array; a string must never reach the
// Uint8Array.set path, which would silently coerce characters to 0.
export function messageBytes(input) {
  return typeof input === "string" ? toBytes(input) : input;
}

export function bytesToHex(b) {
  return Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
}

export function hexToBytes(h) {
  const out = new Uint8Array(h.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(h.slice(i * 2, i * 2 + 2), 16);
  return out;
}

// Little-endian word decode, as in RFC 1321 section 2 / appendix Decode().
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

// RFC 1321 sections 3.1-3.2: 0x80 byte, zeros to length%64==56,
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

// RFC 1321 section 3.4. Every parameter is overridable so verify.mjs can run
// negative controls (MD4-style G, MD4 word order, MD4 shifts, shared constants,
// missing feed-forward). feedForward=false drops the section-3.4 final additions.
export function transform(h, block, opts = {}) {
  const {
    r1k = R1_K, r1s = R1_S,
    r2k = R2_K, r2s = R2_S,
    r3k = R3_K, r3s = R3_S,
    r4k = R4_K, r4s = R4_S,
    t = T,
    g = G,
    feedForward = true,
  } = opts;
  let [a, b, c, d] = h;
  const aa = a, bb = b, cc = c, dd = d;

  // RFC 1321 section 3.4 notation [abcd k s i]:
  //   a = b + ((a + fn(b,c,d) + X[k] + T[i]) <<< s)
  // The register in the second position is added AFTER the rotation; this is
  // MD4-to-MD5 difference 4 ("each step now adds in the result of the previous
  // step"), so it must not be dropped.
  const round = (fn, ks, ss, base) => {
    for (let i = 0; i < 16; i++) {
      const ki = ks[i], s = ss[i], ac = t[base + i];
      switch (i % 4) {
        case 0:
          a = (rotl((a + fn(b, c, d) + block[ki] + ac) >>> 0, s) + b) >>> 0;
          break;
        case 1:
          d = (rotl((d + fn(a, b, c) + block[ki] + ac) >>> 0, s) + a) >>> 0;
          break;
        case 2:
          c = (rotl((c + fn(d, a, b) + block[ki] + ac) >>> 0, s) + d) >>> 0;
          break;
        default:
          b = (rotl((b + fn(c, d, a) + block[ki] + ac) >>> 0, s) + c) >>> 0;
      }
    }
  };

  round(F, r1k, r1s, 0);
  const after1 = [a, b, c, d];
  round(g, r2k, r2s, 16);
  const after2 = [a, b, c, d];
  round(H, r3k, r3s, 32);
  const after3 = [a, b, c, d];
  round(I, r4k, r4s, 48);
  const after4 = [a, b, c, d];

  const out = feedForward
    ? [(a + aa) >>> 0, (b + bb) >>> 0, (c + cc) >>> 0, (d + dd) >>> 0]
    : [a, b, c, d];
  return { out, after1, after2, after3, after4 };
}

// Returns { digest, rounds: [after1..after4] } for the last block; digest is the
// 16 bytes in RFC order (low byte of A first, high byte of D last).
export function md5(input, opts = {}) {
  const padded = pad(messageBytes(input));
  let h = opts.iv ? [...opts.iv] : [...IV];
  let last = null;
  for (let off = 0; off < padded.length; off += 64) {
    const block = wordsFromBytesLE(padded.slice(off, off + 64));
    last = transform(h, block, opts);
    h = last.out;
  }
  return { digest: bytesFromWordsLE(h), rounds: last ? [last.after1, last.after2, last.after3, last.after4] : [] };
}

export function hashHex(message, opts = {}) {
  return bytesToHex(md5(message, opts).digest);
}

// RFC 1321 step notation [abcd k s i]: a = b + ((a + phi(b,c,d) + X[k] + T[i]) <<< s).
// Exposed so the worked example in the articles can be re-derived step by step.
export function stepTrace(input, steps = 1) {
  const padded = pad(messageBytes(input));
  const block = wordsFromBytesLE(padded.slice(0, 64));
  const schedules = [[R1_K, R1_S], [R2_K, R2_S], [R3_K, R3_S], [R4_K, R4_S]];
  const fns = [F, G, H, I];
  let [a, b, c, d] = IV;
  const trace = [];
  let n = 0;
  outer: for (let r = 0; r < 4; r++) {
    for (let i = 0; i < 16; i++) {
      const s = schedules[r][1][i], k = schedules[r][0][i], ac = T[r * 16 + i];
      const before = [a, b, c, d];
      switch (i % 4) {
        case 0:
          a = (rotl((a + fns[r](b, c, d) + block[k] + ac) >>> 0, s) + b) >>> 0;
          break;
        case 1:
          d = (rotl((d + fns[r](a, b, c) + block[k] + ac) >>> 0, s) + a) >>> 0;
          break;
        case 2:
          c = (rotl((c + fns[r](d, a, b) + block[k] + ac) >>> 0, s) + d) >>> 0;
          break;
        default:
          b = (rotl((b + fns[r](c, d, a) + block[k] + ac) >>> 0, s) + c) >>> 0;
      }
      trace.push({ step: n + 1, round: r + 1, k, s, t: T[r * 16 + i], before, after: [a, b, c, d] });
      n += 1;
      if (trace.length >= steps) break outer;
    }
  }
  return { block, trace };
}
