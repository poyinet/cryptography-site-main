# Adaptive Chosen-Ciphertext Attack

## principle

**Attack**: Adaptive Chosen-Ciphertext Attack (适应性选择密文攻击). In an adaptive chosen-ciphertext attack, the adversary’s later ciphertext choices may depend on plaintext received from previous requests.

## why

The adaptive capability lets the adversary adjust queries based on decryption results.

Restate the chain as input → state → transform → output → criterion. Every step should identify who acts, what changes and what evidence remains. A step without evidence is marked unverified, not reproduced.

## used

The adaptive chosen-ciphertext attack is the adaptive variant of CCA: ciphertext choices may depend on plaintext received earlier.

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

The model assumes the adversary can make adaptive decryption queries; HAC lists it only as an attack class.

Adv_A = Pr[Succ_A] − Pr[Succ_ideal]；Cost = D × T × M；Success = 1[advantage > threshold]. Symbols are catalogue-level variables, not standard constants; parameters, test vectors and clauses remain with the registered source. The model states structural relations, not an implementation audit.

## history

HAC lists the adaptive chosen-ciphertext attack in §1.13.1.

Given abstract input x₀ and parameter p, compute y₀ and test it against the criterion; this is a reasoning example, not a measured vector. If the input leaves the domain, keys/parameters are reused, implementation diverges or versions mismatch, the model no longer holds.

## refs

- Wikipedia search entry for 适应性选择密文攻击. https://zh.wikipedia.org/w/index.php?search=%E9%80%82%E5%BA%94%E6%80%A7%E9%80%89%E6%8B%A9%E5%AF%86%E6%96%87%E6%94%BB%E5%87%BB
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[\mathrm{Adv}^{\mathrm{attack}}_A(\lambda)=\Pr[\mathrm{Game}_A(\lambda)=1]-\frac12\]

Adaptive Chosen-Ciphertext Attack: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
