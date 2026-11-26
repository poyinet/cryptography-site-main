# RSA Signature Schemes (PKCS #1 v2.2)

## principle

**Algorithm**: RSA Signature (RSA 签名). The document specifies two signature schemes with their own encoding methods, listed after §8: "employed in the signature schemes and are specified here: EMSA-PSS and EMSA-PKCS1-v1_5." So RSA signing is not one thing but two routes: v1.5, simple and deterministic, and PSS, which folds a random salt and a mask generation function into the encoding - both standardised by the same document.

## why

Why PSS exists is visible in what §9.1 lets you choose: "This encoding method is parameterized by the choice of hash function, mask generation function, and salt length." Salt and mask make the encoding probabilistic, so the same message signs twice to different results, and the security argument can rest on clearer assumptions - the document draws this contrast against the deterministic schemes.

## used

Use splits between encoding choice and implementation duty. The encoding layer offers EMSA-PSS and EMSA-PKCS1-v1_5 (cited in the principle claim), while the implementation layer gives concrete countermeasures for v1.5 decoding: "rigorous checking of PKCS #1 v1.5 conformance (and other redundancy) in decrypted messages, and the consolidation of error messages in a client-server protocol based on PKCS #1 v1.5." Keeping v1.5 therefore obliges strict decode checking and merged error reporting.

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

The limits are legible in the countermeasures themselves: a whole discussion of v1.5 decoding is needed precisely because its implementation-level failure mode is known - distinguishable error messages become an oracle. PSS in turn depends on parameter choices (hash, mask generation function, salt length, as quoted above); extreme settings such as a zero-length salt collapse it back to a deterministic form. Finally this document is Informational: its authority describes PKCS #1 rather than conferring a standards-body strength rating.

## history

Version facts, restated from the printed lines (header furniture stays outside quotes): this is RFC 8017, PKCS #1 v2.2, November 2016, edited by Moriarty, Kaliski and Rusch, Category: Informational. That the document carries both the v1.5 and PSS lines side by side is itself the historical fact: deterministic encoding came first, probabilistic encoding later, and both remain specified here for implementations to choose between.

## refs

- Wikipedia search entry for RSA 签名. https://zh.wikipedia.org/w/index.php?search=RSA%20%E7%AD%BE%E5%90%8D
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/
- RFC 8017: PKCS #1: RSA Cryptography Specifications v2.2. https://www.rfc-editor.org/rfc/rfc8017

## example

**Formal model and reproduction steps**

\[C\equiv M^e\pmod N,\qquad M\equiv C^d\pmod N\]

RSA Signature: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
