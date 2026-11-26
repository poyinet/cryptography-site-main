// Local copy of the Vigenere encipherment used by the IC calculations in this dossier.
// Dependencies have to live inside the dossier folder, so the function is repeated rather than imported
// from another batch; verify.mjs in this folder checks it against the printed ciphertext from
// rutgers-classical.txt:131, so a divergence here cannot go unnoticed.
const A = 65;
const idx = (ch) => ch.charCodeAt(0) - A;
export function encipherVigenere(pt, key) {
  return [...pt].map((ch, i) => String.fromCharCode(A + (idx(ch) + idx(key[i % key.length])) % 26)).join('');
}
