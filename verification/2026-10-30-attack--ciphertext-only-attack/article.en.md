# Ciphertext-Only Attack

## principle

**Attack**: Ciphertext-Only Attack (唯密文攻击). A ciphertext-only attack observes only ciphertext and tries to recover plaintext or the decryption key.

## why

HAC considers any encryption scheme vulnerable to a ciphertext-only attack to be completely insecure.

Restate the chain as input → state → transform → output → criterion. Every step should identify who acts, what changes and what evidence remains. A step without evidence is marked unverified, not reproduced.

## used

The ciphertext-only attack is one of the basic cryptanalytic attack models.

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

A ciphertext-only attack does not assume that the adversary has plaintext-ciphertext pairs; it is weaker than a known-plaintext attack.

Adv_A = Pr[Succ_A] − Pr[Succ_ideal]；Cost = D × T × M；Success = 1[advantage > threshold]. Symbols are catalogue-level variables, not standard constants; parameters, test vectors and clauses remain with the registered source. The model states structural relations, not an implementation audit.

## history

HAC lists the ciphertext-only attack first among attacks on encryption schemes in §1.13.1.

Given abstract input x₀ and parameter p, compute y₀ and test it against the criterion; this is a reasoning example, not a measured vector. If the input leaves the domain, keys/parameters are reused, implementation diverges or versions mismatch, the model no longer holds.

## refs

- Wikipedia search entry for 唯密文攻击. https://zh.wikipedia.org/w/index.php?search=%E5%94%AF%E5%AF%86%E6%96%87%E6%94%BB%E5%87%BB
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[\mathrm{Adv}^{\mathrm{attack}}_A(\lambda)=\Pr[\mathrm{Game}_A(\lambda)=1]-\frac12\]

Ciphertext-Only Attack: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
