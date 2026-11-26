# Module-Lattice-Based Digital Signature (ML-DSA)

## principle

**Algorithm**: Module-Lattice-Based Digital Signature Standard (ML-DSA 格基签名). FIPS 204, published 13 August 2024, states: "ML-DSA is a digital signature scheme based on CRYSTALS-DILITHIUM". Section 6.1 gives the public key pk as a byte encoding of the public random seed and the compressed polynomial vector t1, where t1 is produced from the uncompressed public-key polynomial t by dropping the d least significant bits of each coefficient and t = As1 + s2. The same section gives the private key sk as a byte encoding of the public random seed, a private random seed for use during signing, a 64-byte hash of the public key, the secret polynomial vectors s1 and s2, and a polynomial vector t0 encoding the d least significant bits of each coefficient of t, and notes that an implementation may store only the 32-byte seed and regenerate the rest of the private key.

## why

The standard says "The ML-DSA scheme uses the Fiat-Shamir With Aborts construction". To correct a bias, the signer applies rejection sampling to z; if coefficients of z fall outside of a specified range, the signing process is aborted, so signing is largely a rejection-sampling loop whose iterations either produce a valid signature or "an invalid signature whose release would leak information about the private key". Section 3.3 adds that, to ensure correctness, a second stage of rejection sampling must be included at line 28 of Algorithm 7.

## used

The parameter sets are ML-DSA-44, ML-DSA-65 and ML-DSA-87, where the numerical suffix refers to the dimension of the matrix A — for ML-DSA-65 the matrix A is 6 by 5 — and the three are claimed to be in security strength categories 2, 3 and 5.

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

Signing randomness is the main failure point: for ML-DSA to be secure, the signer's commitment value y must not be used to sign more than one message, and it must not be easily guessed by an attacker. This requires randomness. The standard says fresh randomness helps mitigate side-channel attacks, while for the deterministic variant "the lack of randomness in the deterministic variant makes the risk of side-channel attacks (particularly fault attacks) more difficult to mitigate. Therefore, this variant should not be used on platforms where side-channel attacks are a concern and where they cannot be otherwise mitigated". Section 3.6.1 adds that with an RBG of at least 128 but less than 192 bits of security, the claimed category of ML-DSA-44 drops from 2 to 1.

## history

NIST IR 8547 (October 2026) records that FIPS 204 and 205 each specify a quantum-resistant digital signature scheme, with ML-DSA in §2.1.1 derived from the CRYSTALS-Dilithium submission, and its §4 timeline requires the government's most sensitive systems to complete post-quantum key establishment by 31 December 2030 and to adopt post-quantum digital signatures by 31 December 2031.

## refs

- Wikipedia search entry for ML-DSA 格基签名. https://zh.wikipedia.org/w/index.php?search=ML-DSA%20%E6%A0%BC%E5%9F%BA%E7%AD%BE%E5%90%8D
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/
- NIST FIPS 204: ML-DSA. https://csrc.nist.gov/pubs/fips/204/final

## example

**Formal model and reproduction steps**

\[s=k^{-1}\big(H(m)+r d\big)\bmod n\]

Module-Lattice-Based Digital Signature Standard: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
