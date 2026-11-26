import assert from 'node:assert/strict';

export const MLKEM = [
  {name: 'ML-KEM-512', n: 256, q: 3329, k: 2, eta1: 3, eta2: 2, du: 10, dv: 4, ek: 800, dk: 1632, ct: 768, shared: 32},
  {name: 'ML-KEM-768', n: 256, q: 3329, k: 3, eta1: 2, eta2: 2, du: 10, dv: 4, ek: 1184, dk: 2400, ct: 1088, shared: 32},
  {name: 'ML-KEM-1024', n: 256, q: 3329, k: 4, eta1: 2, eta2: 2, du: 11, dv: 5, ek: 1568, dk: 3168, ct: 1568, shared: 32}
];

export const MLDSA = [
  {name: 'ML-DSA-44', k: 4, sk: 2560, pk: 1312, sig: 2420},
  {name: 'ML-DSA-65', k: 6, sk: 4032, pk: 1952, sig: 3309},
  {name: 'ML-DSA-87', k: 8, sk: 4896, pk: 2592, sig: 4627}
];

export const SLHDSA = [
  {name: 'SLH-DSA-SHA2-128s', n: 16, pk: 32, sig: 7856},
  {name: 'SLH-DSA-SHA2-128f', n: 16, pk: 32, sig: 17088},
  {name: 'SLH-DSA-SHA2-192s', n: 24, pk: 48, sig: 16224},
  {name: 'SLH-DSA-SHA2-192f', n: 24, pk: 48, sig: 35664},
  {name: 'SLH-DSA-SHA2-256s', n: 32, pk: 64, sig: 29792},
  {name: 'SLH-DSA-SHA2-256f', n: 32, pk: 64, sig: 49856}
];

export function mlkemSizes(set) {
  return {
    ek: 384 * set.k + 32,
    dk: 768 * set.k + 96,
    ct: 32 * (set.du * set.k + set.dv),
    shared: 32
  };
}

export function mldsaPublicKey(k) {
  return 32 + 320 * k;
}

export function slhdsaPublicKey(n) {
  return 2 * n;
}

export function gcd(a, b) {
  let x = a < 0n ? -a : a, y = b < 0n ? -b : b;
  while (y) [x, y] = [y, x % y];
  return x;
}

export function powmod(a, e, n) {
  assert(n > 0n && e >= 0n);
  let out = 1n, base = a % n;
  while (e > 0n) {
    if (e & 1n) out = out * base % n;
    base = base * base % n;
    e >>= 1n;
  }
  return out;
}

export function multiplicativeOrder(a, n, limit = 10000) {
  assert(n > 1n);
  let value = a % n, order = 1;
  while (value !== 1n) {
    value = value * a % n;
    order++;
    if (order > limit) throw Error('Order search exceeded limit');
  }
  return order;
}

export function shorFactorFromOrder(a, n) {
  const order = multiplicativeOrder(a, n);
  if (order % 2 !== 0) return {order, factors: null, reason: 'odd order'};
  const x = powmod(a, BigInt(order / 2), n);
  const p = gcd(x - 1n, n), q = gcd(x + 1n, n);
  if (p > 1n && p < n && q > 1n && q < n) return {order, factors: [p, q]};
  return {order, factors: null, reason: 'trivial factor'};
}

export function squareRootExponent(bits) {
  assert(Number.isInteger(bits) && bits > 0 && bits % 2 === 0);
  return bits / 2;
}

export function groverExponentRelation(bits) {
  const half = squareRootExponent(bits);
  const full = 2n ** BigInt(bits), root = 2n ** BigInt(half);
  return {bits, half, identity: root * root === full};
}

const TOY_Q = 97;
const TOY_N = 4;
const TOY_A = [[5, 7, 11, 13], [17, 19, 23, 29], [31, 37, 41, 43], [47, 53, 59, 61]];
const TOY_S = [1, 0, 2, 3];

function mod(x, q = TOY_Q) {
  return ((x % q) + q) % q;
}

function matrixVector(matrix, vector) {
  return matrix.map(row => mod(row.reduce((sum, x, j) => sum + x * vector[j], 0)));
}

function vectorMatrix(vector, matrix) {
  return Array.from({length: TOY_N}, (_, j) => mod(vector.reduce((sum, x, i) => sum + x * matrix[i][j], 0)));
}

export function toyLweEncrypt(message, error, randomness) {
  assert(message === 0 || message === 1);
  assert.equal(error.length, TOY_N);
  assert.equal(randomness.length, TOY_N);
  const b = matrixVector(TOY_A, TOY_S).map((x, i) => mod(x + error[i]));
  const u = vectorMatrix(randomness, TOY_A);
  const v = mod(b.reduce((sum, x, i) => sum + x * randomness[i], 0) + message * 48);
  return {u, v};
}

export function toyLweDecrypt({u, v}) {
  const d = mod(v - TOY_S.reduce((sum, x, j) => sum + x * u[j], 0));
  return d < 24 || d > 72 ? 0 : 1;
}
