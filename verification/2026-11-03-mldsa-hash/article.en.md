# HashML-DSA Pre-Hash Signature Variant

## principle

**Algorithm**: HashML-DSA (HashML-DSA 混合签名). The variant's identity is two facts printed in its §3 definition: it "includes an additional pre-hashing step before signing" and "It consists of three main algorithms: ML-DSA.KeyGen (Algorithm 1), which is the same key generation algorithm used for ML-DSA; HashML-DSA.Sign (Algorithm 4); and HashML-DSA.Verify (Algorithm 5)." So the key layer is ML-DSA's, and only signing and verification are replaced by the pre-hashed versions.

## why

Why the extra step exists is stated as the variant's defining feature: the additional pre-hashing step quoted above. The §3 definition states this, so the engineering reading follows directly - the signature consumes a digest rather than an arbitrarily long message, so callers can fold large data into a fixed-size input before the internal encoding runs. That the standard specifies this branch alongside ML-DSA means pre-hashing is a normalised option, not an implementer's private modification.

## used

The compliance frame is defined in §1.4: a technique is approved when it is specified in a FIPS or NIST recommendation, adopted in one, or listed among NIST-approved security functions (restated in prose from the printed numbered list rather than quoted, to keep the numbering artefacts out of the article). For users this means HashML-DSA is wired in as an approved signature method inside FIPS 204's scope, on the same footing as ML-DSA - not as a post-quantum candidate.

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

Two limits. First, hash coupling: a pre-hashed variant's behaviour is set by the chosen hash, and the standard numbering its Sign/Verify separately from ML-DSA means a different hash or preprocessing is no longer the same algorithm and cannot be mixed. Second, the determinism caveat: the document's §2.1 pseudorandom definition reads "effectively random as long as the internal action of the process is hidden from observation", so if an implementation leaks intermediate values that argument no longer holds.

## history

Version facts, restated outside quotes per house rule: FIPS 204 was published and effective August 13, 2024, writing ML-DSA and the pre-hashed HashML-DSA into one standard; the retained copy prints a free-availability line with a digital object identifier, which is not quoted. What is worth recording for this entity is that the variant itself became standardised - from a competition-candidate scheme to Sign and Verify algorithms with their own numbers, in implementable and testable form.

## refs

- Wikipedia search entry for HashML-DSA 混合签名. https://zh.wikipedia.org/w/index.php?search=HashML-DSA%20%E6%B7%B7%E5%90%88%E7%AD%BE%E5%90%8D
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[h=H(M),\quad H:\{0,1\}^{*}\to\{0,1\}^{n}\]

HashML-DSA: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
