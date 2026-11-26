# Bleichenbacher Attack

## principle

**Attack**: Bleichenbacher Attack (Bleichenbacher 攻击). The Bleichenbacher attack is an adaptive chosen-ciphertext attack against RSA PKCS#1 v1.5. The attacker uses an oracle that answers only whether a decrypted ciphertext is PKCS#1 conforming, and gradually recovers plaintext or forges signatures.

## why

Protocols that return different error messages after decryption leak one bit about format validity. That bit is enough to drive adaptive queries.

Restate the chain as input → state → transform → output → criterion. Every step should identify who acts, what changes and what evidence remains. A step without evidence is marked unverified, not reproduced.

## used

The paper uses SSL 3.0 as an example and notes that any server accepting RSA PKCS#1 v1.5 ciphertexts and leaking format errors may be affected.

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

For 512-bit and 1024-bit keys, the experiments required between 300 thousand and 2 million chosen ciphertexts. Defenses include uniform error responses, integrity checking immediately after decryption, and plaintext-aware encryption such as OAEP.

Adv_A = Pr[Succ_A] − Pr[Succ_ideal]；Cost = D × T × M；Success = 1[advantage > threshold]. Symbols are catalogue-level variables, not standard constants; parameters, test vectors and clauses remain with the registered source. The model states structural relations, not an implementation audit.

## history

Bleichenbacher introduced the attack in his 1998 CRYPTO paper and recommended plaintext-aware encryption and timely integrity checking in the conclusion.

Given abstract input x₀ and parameter p, compute y₀ and test it against the criterion; this is a reasoning example, not a measured vector. If the input leaves the domain, keys/parameters are reused, implementation diverges or versions mismatch, the model no longer holds.

## refs

- Wikipedia search entry for Bleichenbacher 攻击. https://zh.wikipedia.org/w/index.php?search=Bleichenbacher%20%E6%94%BB%E5%87%BB
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[\mathrm{Adv}^{\mathrm{attack}}_A(\lambda)=\Pr[\mathrm{Game}_A(\lambda)=1]-\frac12\]

Bleichenbacher Attack: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
