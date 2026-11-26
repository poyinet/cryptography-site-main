# Manger’s Attack

## principle

**Attack**: Manger's Attack (Manger 攻击). Manger’s attack is an adaptive chosen-ciphertext attack against PKCS#1 v2.0 RSA-OAEP. It uses an oracle that indicates whether the decrypted value is below B=2^{8(k−1)}, recovering the plaintext rather than the private key.

## why

The OAEP specification requires integer-to-octet conversion errors and OAEP decoding errors to return the same information, but implementation differences in spelling, logs or timing can still distinguish the two stages; once distinguishable, the attack narrows the plaintext range step by step.

Restate the chain as input → state → transform → output → criterion. Every step should identify who acts, what changes and what evidence remains. A step without evidence is marked unverified, not reproduced.

## used

The attack targets RSAES-OAEP implementations; for a 1024-bit RSA key it needs about 1100 oracle queries, on the order of log2 n queries.

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

Defenses require integer-conversion failures and OAEP integrity failures to be indistinguishable in error messages, logs and timing; using OAEP without removing this distinguishability remains vulnerable.

Adv_A = Pr[Succ_A] − Pr[Succ_ideal]；Cost = D × T × M；Success = 1[advantage > threshold]. Symbols are catalogue-level variables, not standard constants; parameters, test vectors and clauses remain with the registered source. The model states structural relations, not an implementation audit.

## history

Manger introduced the attack in his 2001 CRYPTO paper as a new chosen-ciphertext attack on OAEP, following Bleichenbacher’s 1998 attack on PKCS#1 v1.5.

Given abstract input x₀ and parameter p, compute y₀ and test it against the criterion; this is a reasoning example, not a measured vector. If the input leaves the domain, keys/parameters are reused, implementation diverges or versions mismatch, the model no longer holds.

## refs

- Wikipedia search entry for Manger 攻击. https://zh.wikipedia.org/w/index.php?search=Manger%20%E6%94%BB%E5%87%BB
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[\mathrm{Adv}^{\mathrm{attack}}_A(\lambda)=\Pr[\mathrm{Game}_A(\lambda)=1]-\frac12\]

Manger's Attack: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
