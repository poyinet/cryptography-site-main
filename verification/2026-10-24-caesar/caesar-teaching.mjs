import assert from 'node:assert/strict';

const A = 65;
const a = 97;
const mod26 = n => ((n % 26) + 26) % 26;

export function shiftText(text, k) {
  assert(Number.isInteger(k));
  return [...text].map(ch => {
    const code = ch.charCodeAt(0);
    if (code >= A && code <= A + 25) return String.fromCharCode(A + mod26(code - A + k));
    if (code >= a && code <= a + 25) return String.fromCharCode(a + mod26(code - a + k));
    return ch;
  }).join('');
}

export function lettersOnly(text) {
  return text.toUpperCase().replace(/[^A-Z]/g, '');
}

export function counts(text) {
  const out = Array(26).fill(0);
  for (const ch of lettersOnly(text)) out[ch.charCodeAt(0) - A]++;
  return out;
}

export function indexOfCoincidence(text) {
  const f = counts(text);
  const n = f.reduce((sum, x) => sum + x, 0);
  if (n < 2) throw Error('Index of coincidence needs at least two letters');
  let pairs = 0;
  for (const x of f) pairs += x * (x - 1);
  return pairs / (n * (n - 1));
}

export function countLetterSequence(text, sequence) {
  const hay = lettersOnly(text);
  const needle = lettersOnly(sequence);
  let count = 0;
  for (let i = 0; i + needle.length <= hay.length; i++) {
    if (hay.slice(i, i + needle.length) === needle) count++;
  }
  return count;
}
