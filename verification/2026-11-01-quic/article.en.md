# QUIC

## principle

**Protocol**: QUIC (QUIC 传输协议). Section 1 gives the carrier and the motive: "QUIC packets are carried in UDP datagrams [UDP] to better facilitate deployment in existing systems and networks." QUIC is thus a transport over UDP with security and multiplexing built in, not an encryption layer on top of TCP.

## why

One handshake negotiates both halves: §1 states "The QUIC handshake combines negotiation of cryptographic and transport parameters. QUIC integrates the TLS handshake [TLS13], although using a customized framing for protecting packets."

## used

RFC 9001 carries the protection rules: "This document describes how QUIC [QUIC-TRANSPORT] is secured using TLS [TLS13]." and "QUIC [QUIC-TRANSPORT] assumes responsibility for the confidentiality and integrity protection of packets." Key discarding is explicit: a client and a server "MUST discard Initial keys" at the first Handshake packet sent or successfully processed.

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

Version negotiation is the unprotected part: §12.1 records that "Version Negotiation packets have no cryptographic protection", Retry packets only carry an AEAD integrity function against modification, and §6.2 notes for this version that "How to perform version negotiation is left as future work" — so version 1 offers no downgrade-proof negotiation.

## history

RFC 9000 and its companion RFC 9001 are both May 2021 Standards Track documents (edited by Iyengar and Thomson, and by Thomson and Turner respectively); neither header carries an Updates or Obsoletes line, and the document defines version 1 of QUIC.

## refs

- Wikipedia search entry for QUIC 传输协议. https://zh.wikipedia.org/w/index.php?search=QUIC%20%E4%BC%A0%E8%BE%93%E5%8D%8F%E8%AE%AE
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/
- RFC 9000: QUIC: A UDP-Based Multiplexed and Secure Transport. https://www.rfc-editor.org/rfc/rfc9000
- Published standard/RFC for QUIC 传输协议. https://www.rfc-editor.org/rfc/rfc9000

## example

**Formal model and reproduction steps**

\[\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\]

QUIC: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
