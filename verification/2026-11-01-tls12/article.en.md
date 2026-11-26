# TLS 1.2

## principle

**Protocol**: TLS 1.2 (TLS 1.2). The abstract is again a version statement: "This document specifies Version 1.2 of the Transport Layer Security (TLS) protocol. The TLS protocol provides communications security over the Internet." Section 1 keeps the same layering, "The protocol is composed of two layers: the TLS Record Protocol and the TLS Handshake Protocol."

## why

The theme is algorithm flexibility: §1.2 records "The MD5/SHA-1 combination in the pseudorandom function (PRF) has been replaced with cipher-suite-specified PRFs. All cipher suites in this document use P_SHA256." and adds "Addition of support for authenticated encryption with additional data modes."

## used

The record layer hardens the IV: "The Initialization Vector (IV) SHOULD be chosen at random, and MUST be unpredictable." — with a retrospective note that before TLS 1.1 there was no IV field and the CBC residue was used. Padding handling moves from the 1.1 SHOULD to "The receiver MUST check this padding and MUST use the bad_record_mac alert to indicate padding errors." The §9 mandatory suite is TLS_RSA_WITH_AES_128_CBC_SHA.

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

This version does not clear the legacy suites or static keys: §1.2 says only "Removed IDEA and DES cipher suites. They are now deprecated and will be documented in a separate document." — nothing invalidates RC4, MD5 or static RSA, and the mandatory suite is itself static RSA; §7.4.1.4 argues against redesign through extensions, "This is not recommended; it would be more appropriate to define a new version of TLS"; and forward secrecy stays advisory, "TLS users desiring Perfect Forward Secrecy should use DHE cipher suites."

## history

The RFC 5246 header lists T. Dierks and E. Rescorla (RTFM, Inc.), Category: Standards Track, August 2008, with "Obsoletes: 3268, 4346, 4366" and “Updates: 4492”; §1.2 presents it as a revision of TLS 1.1 offering "improved flexibility, particularly for negotiation of cryptographic algorithms".

## refs

- Wikipedia search entry for TLS 1.2. https://zh.wikipedia.org/w/index.php?search=TLS%201.2
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/
- RFC 5246: The Transport Layer Security (TLS) Protocol Version 1.2. https://www.rfc-editor.org/rfc/rfc5246
- Published standard/RFC for TLS 1.2. https://www.rfc-editor.org/rfc/rfc5246

## example

**Formal model and reproduction steps**

\[\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\]

TLS 1.2: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
