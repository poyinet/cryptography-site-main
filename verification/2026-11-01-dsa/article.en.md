# DSA (Digital Signature Algorithm)

## principle

**Algorithm**: Digital Signature Algorithm (DSA 数字签名算法). Digital signatures are used to detect unauthorised modification of data and to authenticate the signatory, which is the non-repudiation property. The DSA was approved for signature generation by earlier versions of the FIPS 186 series. FIPS 186-5 states: "This standard no longer approves the DSA for digital signature generation", while "the DSA may be used to verify signatures generated prior to the implementation date of this standard", and refers the full DSA specification back to FIPS 186-4.

## why

FIPS 186-5 approves three techniques: RSA (through IETF RFC 8017), ECDSA (including deterministic ECDSA from RFC 6979) and the EdDSA of RFC 8032 together with HashEdDSA. The standard describes ECDSA as "the elliptic curve analog of DSA" and concentrates signature generation on those schemes, while §4 retains the verification-only role for the DSA.

## used

Its current role is verifying DSA signatures generated before the implementation date of the standard, while new signing uses an approved scheme: ECDSA generation and verification are given in §6.4.1 and §6.4.2, and RSA signing is delegated to RFC 8017. Section 3 states that a key pair used for signature generation and verification "shall not be used for any other purpose", a restriction repeated for RSA in §5 and for ECDSA in §6.

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

FIPS 186-5 states plainly that "the algorithms in this standard are not expected to provide resistance to attacks from a large-scale quantum computer", which is why signature generation moved on and the DSA left it. The finite-field parameters and discrete-logarithm setting of the DSA belong to FIPS 186-4, of which this standard keeps only the verification role in §4. Section 6 separately warns that implementations of the elliptic-curve schemes must be protected against "side-channel attacks or fault attacks".

## history

FIPS 186-5 was published and became effective on 3 February 2023, superseding FIPS 186-4. Appendix E records that the DSA is no longer approved for signature generation, and the announcement adds that FIPS 186-4 stays in effect for one year after publication and is then withdrawn. The DSA therefore keeps only the verification of older signatures.

## refs

- Wikipedia search entry for DSA 数字签名算法. https://zh.wikipedia.org/w/index.php?search=DSA%20%E6%95%B0%E5%AD%97%E7%AD%BE%E5%90%8D%E7%AE%97%E6%B3%95
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[s=k^{-1}\big(H(m)+r d\big)\bmod n\]

Digital Signature Algorithm: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
