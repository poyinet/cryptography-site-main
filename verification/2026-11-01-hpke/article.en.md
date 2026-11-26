# Hybrid Public Key Encryption

## principle

**Protocol**: Hybrid Public Key Encryption (HPKE 混合公钥加密). Section 5 gives the common shape: "All variants take a recipient public key and a sequence of plaintexts pt and produce an encapsulated key enc and a sequence of ciphertexts ct." Hybrid here means a public-key encapsulation combined with a symmetric AEAD.

## why

The motive is fragmentation: §1 says "Currently, there are numerous competing and non-interoperable standards and variants for hybrid encryption, mostly variants on the Elliptic Curve Integrated Encryption Scheme (ECIES)" and that "All these existing schemes have problems, e.g., because they rely on outdated primitives, lack proofs of indistinguishable (adaptive) chosen-ciphertext attack (IND-CCA2) security, or fail to provide test vectors." Section 5.3 adds an interface for exporting secrets from the encryption context.

## used

The common case is one message: §6.1 states "In many cases, applications encrypt only a single message to a recipient's public key." and supplies the stateless single-shot templates. Section 4 pins the identifiers, requiring that inside a KEM "suite_id MUST start with" the KEM prefix while in the rest of HPKE it "MUST start with" the HPKE prefix identifying the whole ciphersuite.

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

The limits are stated with the analysis: §9.1 says "HPKE does not provide forward secrecy with respect to recipient compromise." and §9.7.4 that "HPKE ciphertexts are not forward secret with respect to recipient compromise in any mode." The document also lists non-goals (no downgrade or replay prevention, no hiding of the plaintext length) and registers no post-quantum KEM suite.

## history

RFC 9180 dates from February 2022, is labelled IRTF and Informational, and states "This document is a product of the Crypto Forum Research Group (CFRG) in the IRTF." The algorithm identifiers table is §7, titled Algorithm Identifiers, and the document carries no Obsoletes line.

## refs

- Wikipedia search entry for HPKE 混合公钥加密. https://zh.wikipedia.org/w/index.php?search=HPKE%20%E6%B7%B7%E5%90%88%E5%85%AC%E9%92%A5%E5%8A%A0%E5%AF%86
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/
- RFC 9180: Hybrid Public Key Encryption. https://www.rfc-editor.org/rfc/rfc9180
- Published standard/RFC for HPKE 混合公钥加密. https://www.rfc-editor.org/rfc/rfc9180

## example

**Formal model and reproduction steps**

\[\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\]

Hybrid Public Key Encryption: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
