# DTLS 1.2

## principle

**Protocol**: DTLS 1.2 (DTLS 1.2). The abstract sets the scope: "This document specifies version 1.2 of the Datagram Transport Layer Security (DTLS) protocol. The DTLS protocol provides communications privacy for datagram protocols." and adds "This document updates DTLS 1.0 to work with TLS version 1.2."

## why

Section 1 explains the numbering: "There is no DTLS 1.1; that version number was skipped in order to harmonize version numbers with TLS." The algorithm layer inherits TLS 1.2 outright — §4.1.2.4 says "The existing AEAD cipher suites, defined in [ECCGCM] and [RSAGCM], can be used with DTLS exactly as with TLS 1.2."

## used

The behavioural difference from TLS is fault tolerance: §4.1.2.7 says "In general, invalid records SHOULD be silently discarded, thus preserving the association; however, an error MAY be logged for diagnostic purposes." The record layer itself is near-identical, "The only change is the inclusion of an explicit sequence number in the record."

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

Choosing alerts is actively discouraged: such implementations "MUST generate fatal level alerts to avoid attacks where the attacker repeatedly probes the implementation to see how it responds to various types of error.", and over UDP "this practice is NOT RECOMMENDED for such transports." Section 4.1 adds that "implementations MUST NOT allow the same epoch value to be reused within two times the TCP maximum segment lifetime."

## history

The RFC 6347 header lists E. Rescorla (RTFM, Inc.) and N. Modadugu (Google, Inc.), Category: Standards Track, January 2012, with an ISSN line and “Obsoletes: 4347” and no Updates line; §8 "Changes since DTLS 1.0" enumerates the alignment with TLS 1.2, the new AEAD section and the rest.

## refs

- Wikipedia search entry for DTLS 1.2. https://zh.wikipedia.org/w/index.php?search=DTLS%201.2
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\]

DTLS 1.2: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
