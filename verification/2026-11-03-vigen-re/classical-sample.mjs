import { createHash } from 'node:crypto';
// A self-authored English sample used by the classical-cipher calculations in this dossier.
// It is original prose written for this repository, not a quotation, so no source claim rests on it.
// Length and letter distribution are chosen so that the index of coincidence is statistically usable.
export const SAMPLE_WORDS = `the cipher of a period keeps its alphabets turning under a keyword and each letter of the message is enciphered by whichever alphabet the keyword points at that moment which is why a single plaintext letter may appear as several different ciphertext letters and why the frequency profile of the whole message flattens toward a uniform distribution the analyst who suspects such a scheme begins by measuring how often two letters drawn from the sample happen to be the same because a monoalphabetic text preserves the roughness of the source language while a polyalphabetic one dilutes it in proportion to the number of alphabets in use a second route examines the distances between repeated segments of the ciphertext since a repeated fragment of plaintext that lands under the same part of a repeating keyword must produce an identical fragment of ciphertext and the distance between the two copies is then a multiple of the keyword length counting the common factors of many such distances leaves one factor standing out and that factor is the most likely length of the keyword a third route slides the ciphertext against itself and counts the positions where the letters agree which rises sharply at every shift that is a multiple of the period once the period is known the sample splits into that many interleaved subsequences each produced by one fixed alphabet and each may be attacked on its own as an ordinary single alphabet substitution and the letters recovered from the separate groups are then reassembled into a single keyword that explains the whole text the same reasoning also shows why a scheme that changes its alphabet without any regular period defeats all three routes because no interleaving into fixed groups is possible and the repeated segments no longer line up with anything that repeats the lesson recorded by the historical sources is that the strength of a classical polyalphabetic cipher lives almost entirely in the length and the irregularity of its period rather than in the ingenuity of the mechanism that supplies the alphabets a device that rotates on every letter offers far more protection than one that advances only after a fixed count and an operator who reuses the same long keyword in every message hands the analyst the very repetitions that make the distances meaningful in the first place this is why the notes on these ciphers insist that the period and the secrecy of the keyword matter together and why the same notes observe that running key material drawn from a book of sufficient length resists the method entirely since the lengths involved stop being short enough for the factor counting to converge the small arithmetic above remains the whole of the argument whichever mechanism is used to perform it`.repeat(2);

export function letters(text) {
  return text.toUpperCase().replace(/[^A-Z]/g, '');
}
export const SAMPLE = letters(SAMPLE_WORDS);

// English single-letter frequencies (per hundred letters) taken from the frequency table this repository
// already registers for the analysis entries; used only to score candidate keyword lengths.
export const PLAINTEXT_IC = (() => {
  const f = SAMPLE;
  const n = f.length;
  const counts = new Array(26).fill(0);
  for (const ch of f) counts[ch.charCodeAt(0) - 65]++;
  const sum = counts.reduce((s, c) => s + c * (c - 1), 0);
  return sum / (n * (n - 1));
})();

// A deterministic uniform letter stream: SHA-256 in counter mode, with rejection so that the modulo 26 does
// not inherit the bias of 256 mod 26 = 22. Deterministic, so a re-run reproduces every number in the record.
export function letterStream(seed, length) {
  const out = [];
  let counter = 0;
  while (out.length < length) {
    const block = createHash('sha256').update(`${seed}:${counter++}`).digest();
    for (const byte of block) {
      if (byte < 26 * 9) { out.push(String.fromCharCode(65 + (byte % 26))); if (out.length === length) break; }
    }
  }
  return out.join('');
}
