# TLS 1.0

## principle

**Protocol**: TLS 1.0 (TLS 1.0). RFC 2246 §1 gives the goal and the layering: "The primary goal of the TLS Protocol is to provide privacy and data integrity between two communicating applications. The protocol is composed of two layers: the TLS Record Protocol and the TLS Handshake Protocol." The record layer fragments, optionally compresses, MACs and encrypts; the handshake layer authenticates and agrees keys first.

## why

This was the first step in moving crypto out of each application into a shared layer: §3 gives the lineage "This document and the TLS protocol itself are based on the SSL 3.0 Protocol Specification as published by Netscape." and §6 fixes the record order: "The Record Protocol takes messages to be transmitted, fragments the data into manageable blocks, optionally compresses the data, applies a MAC, encrypts, and transmits the result."

## used

The specification sets one mandatory baseline: §9 says "In the absence of an application profile standard specifying otherwise, a TLS compliant application MUST implement the cipher suite TLS_DHE_DSS_WITH_3DES_EDE_CBC_SHA." On compression §6.2.2 only bounds size — "Compression must be lossless and may not increase the content length by more than 1024 bytes." This entry stays with the specification and makes no deployment claims.

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

Two weaknesses are visible inside the document: the CBC IV is implicit — §6.2.3.2 states "The IV for subsequent records is the last ciphertext block from the previous record.", making successive IVs predictable — and §3 concedes TLS 1.0 and SSL 3.0 "do not interoperate" while keeping a mechanism to back down to SSL 3.0. Appendix D.4 discourages 40-bit encryption and anonymous Diffie-Hellman only in non-normative prose; no suite is declared broken here.

## history

The RFC 2246 header lists T. Dierks and C. Allen (Certicom), Category: Standards Track, January 1999, with neither an Obsoletes nor an Updates line; the abstract says "This document specifies Version 1.0 of the Transport Layer Security (TLS) protocol." — the first document of the TLS family.

## refs

- Wikipedia search entry for TLS 1.0. https://zh.wikipedia.org/w/index.php?search=TLS%201.0
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/
- RFC 2246: The TLS Protocol Version 1.0. https://www.rfc-editor.org/rfc/rfc2246

## example

**Formal model and reproduction steps**

\[\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\]

TLS 1.0: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
