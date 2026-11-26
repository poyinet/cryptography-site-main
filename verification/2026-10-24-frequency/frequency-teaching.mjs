import assert from 'node:assert/strict';

export const HAC_ENGLISH_PERCENTAGES = [8.04, 1.54, 3.06, 3.99, 12.51, 2.30, 1.96, 5.49, 7.26, 0.16, 0.67, 4.14, 2.53, 7.09, 7.60, 2.00, 0.11, 6.12, 6.54, 9.25, 2.71, 0.99, 1.92, 0.19, 1.73, 0.09];

export function lettersOnly(text) {
  return text.toUpperCase().replace(/[^A-Z]/g, '');
}

export function counts(text) {
  const out = Array(26).fill(0);
  for (const ch of lettersOnly(text)) out[ch.charCodeAt(0) - 65]++;
  return out;
}

export function relativeFrequencies(text) {
  const f = counts(text);
  const n = f.reduce((sum, x) => sum + x, 0);
  assert(n > 0, 'At least one letter is required');
  return f.map(x => x / n);
}

export function indexOfCoincidence(text) {
  const f = counts(text);
  const n = f.reduce((sum, x) => sum + x, 0);
  assert(n >= 2, 'Index of coincidence needs at least two letters');
  let pairs = 0;
  for (const x of f) pairs += x * (x - 1);
  return pairs / (n * (n - 1));
}

export function chiSquare(text, percentages = HAC_ENGLISH_PERCENTAGES) {
  assert.equal(percentages.length, 26);
  const f = counts(text);
  const n = f.reduce((sum, x) => sum + x, 0);
  assert(n > 0, 'At least one letter is required');
  let total = 0;
  for (let i = 0; i < 26; i++) {
    const expected = n * percentages[i] / 100;
    total += (f[i] - expected) ** 2 / expected;
  }
  return total;
}

export function shiftLetters(text, k) {
  assert(Number.isInteger(k));
  return lettersOnly(text).replace(/[A-Z]/g, ch => {
    const value = ch.charCodeAt(0) - 65;
    return String.fromCharCode(65 + ((value + k) % 26 + 26) % 26);
  });
}

export function caesarCandidates(ciphertext) {
  return Array.from({length: 26}, (_, k) => ({k, plaintext: shiftLetters(ciphertext, -k), score: chiSquare(shiftLetters(ciphertext, -k))}));
}

export function caesarRanking(ciphertext) {
  return caesarCandidates(ciphertext).sort((a, b) => a.score - b.score || a.k - b.k);
}

export function digrams(text, limit = 15) {
  const s = lettersOnly(text), map = new Map();
  for (let i = 0; i + 1 < s.length; i++) {
    const key = s.slice(i, i + 2);
    map.set(key, (map.get(key) || 0) + 1);
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, limit);
}

export function vigenereEncrypt(text, key) {
  const s = lettersOnly(text), k = lettersOnly(key);
  assert(k.length > 0, 'Key must contain letters');
  return [...s].map((ch, i) => {
    const value = ch.charCodeAt(0) - 65 + k.charCodeAt(i % k.length) - 65;
    return String.fromCharCode(65 + value % 26);
  }).join('');
}

export function columns(text, period) {
  assert(Number.isInteger(period) && period > 0);
  const out = Array.from({length: period}, () => '');
  [...lettersOnly(text)].forEach((ch, i) => { out[i % period] += ch; });
  return out;
}
