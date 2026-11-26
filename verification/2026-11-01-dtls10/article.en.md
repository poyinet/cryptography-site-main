# DTLS 1.0

## principle

**Protocol**: DTLS 1.0 (DTLS 1.0). The abstract fixes version and object: "This document specifies Version 1.0 of the Datagram Transport Layer Security (DTLS) protocol. The DTLS protocol provides communications privacy for datagram protocols." — TLS-level protection over a transport that guarantees neither order nor delivery, preserving datagram semantics.

## why

The design aims at minimal change: §1 says "DTLS is deliberately designed to be as similar to TLS as possible, both to minimize new security invention and to maximize the amount of code and infrastructure reuse." Section 4 explains the presentation: "instead of presenting DTLS as a new protocol, we present it as a series of deltas from TLS 1.1 [TLS11]."

## used

Section 4.2 lists the three departures from TLS, first "A stateless cookie exchange has been added to prevent denial of service attacks.", then handshake-header changes for loss, reordering and fragmentation, plus retransmission timers. Section 4.1.1 adds a hard rule: "Each DTLS record MUST fit within a single datagram."

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

Replay detection is optional: §3.3 explains "The replay detection feature is optional, since packet duplication is not always malicious, but can also occur due to routing errors." Section 4.1.2.2 bans stream ciphers outright: "RC4 MUST NOT be used with DTLS." And the cookie answers only forged source addresses — §4.2.1 concedes "This mechanism does not provide any defense against DoS attacks mounted from valid IP addresses."

## history

The RFC 4347 header lists E. Rescorla (RTFM, Inc.) and N. Modadugu (Stanford University), Category: Standards Track, April 2006, with no Obsoletes or Updates line; the title line reads only "Datagram Transport Layer Security" and the version number appears in the abstract.

## refs

- Wikipedia search entry for DTLS 1.0. https://zh.wikipedia.org/w/index.php?search=DTLS%201.0
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\]

DTLS 1.0: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
