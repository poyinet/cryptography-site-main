# TLS 1.1

## principle

**Protocol**: TLS 1.1 (TLS 1.1). The abstract states version and purpose: "This document specifies Version 1.1 of the Transport Layer Security (TLS) protocol. The TLS protocol provides communications security over the Internet." The wording is now security rather than the 1.0 privacy phrasing; the two-layer structure stays, while the IV handling inside block-ciphered records changes as described in §6.2.3.2.

## why

The change list sits in §1.1 and its first two items are the point of the release: "The implicit Initialization Vector (IV) is replaced with an explicit IV to protect against CBC attacks [CBCATT]." and "Handling of padding errors is changed to use the bad_record_mac alert rather than the decryption_failed alert to protect against CBC attacks." The introduction describes itself as carrying "some small security improvements, clarifications, and editorial improvements".

## used

The record layer states two duties: the receiver "MUST check this padding and SHOULD use the bad_record_mac alert to indicate padding errors.", and against the Canvel timing work "implementations MUST ensure that record processing time is essentially the same whether or not the padding is correct." The §9 mandatory suite is now TLS_RSA_WITH_3DES_EDE_CBC_SHA, and Appendix F.3 says this version "uses an explicit IV in order to protect against this attack."

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

Downgrade and static-key exposure are only partly handled here: §7.4.7.1 makes the version check asymmetric — "Client implementations, MUST and Server implementations MAY, check the version number." — and plays down the risk, "since the TLS handshake MACs prevent downgrade and no good attacks are known on those MACs, ambiguity is not considered a serious security risk". The padding-error alert is still only a SHOULD, and the record order still compresses before encryption without forbidding compression.

## history

The RFC 4346 header lists T. Dierks and E. Rescorla (RTFM, Inc.), Category: Standards Track, April 2006, marked "Obsoletes: 2246" with no Updates line; §1.1 presents the document as a revision of TLS 1.0.

## refs

- Wikipedia search entry for TLS 1.1. https://zh.wikipedia.org/w/index.php?search=TLS%201.1
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/
- RFC 4346: The Transport Layer Security (TLS) Protocol Version 1.1. https://www.rfc-editor.org/rfc/rfc4346

## example

**Formal model and reproduction steps**

\[\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\]

TLS 1.1: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
