# DTLS 1.3

## principle

**Protocol**: DTLS 1.3 (DTLS 1.3). The abstract gives scope and lineage: "This document specifies version 1.3 of the Datagram Transport Layer Security (DTLS) protocol. DTLS 1.3 allows client/server applications to communicate over the Internet in a way that is designed to prevent eavesdropping, tampering, and message forgery."

## why

The same abstract paragraph gives both the lineage and its exception: "The DTLS 1.3 protocol is based on the Transport Layer Security (TLS) 1.3 protocol and provides equivalent security guarantees with the exception of order protection / non-replayability." Section 3 names the first reason the record layer must change: "TLS relies on an implicit sequence number on records." — a lost record breaks later decryption — so "DTLS solves this problem by adding sequence numbers to records."

## used

Section 5 states the reuse strategy: DTLS 1.3 keeps the TLS 1.3 handshake messages and flows and "reuses TLS 1.3's “cookie” extension to provide a return-routability check as part of connection establishment." The record layer is its own design: "The DTLS 1.3 record layer is different from the TLS 1.3 record layer and also different from the DTLS 1.2 record layer."

## broken

Amplification risk and message deprecation form the boundary: §5.1 warns "Servers which process 0-RTT requests and send 0.5-RTT responses without a cookie exchange risk being used in an amplification attack if the size of outgoing messages greatly exceeds the size of those that are received." and sets "A server SHOULD limit the amount of data it sends toward a client address to three times the amount of data sent by the client before it verifies that the client is able to receive data at that address." Section 5.2 adds that "DTLS 1.3-compliant implementations MUST NOT use the HelloVerifyRequest to execute a return-routability check."

## history

The RFC 9147 header lists E. Rescorla (Mozilla), H. Tschofenig (Arm Limited) and N. Modadugu (Google, Inc.), Category: Standards Track, April 2022, marked “Obsoletes: 6347” with no Updates line; §1 describes the delta-on-TLS 1.3 presentation and states "It obsoletes DTLS 1.2."

## refs

- Wikipedia search entry for DTLS 1.3. https://zh.wikipedia.org/w/index.php?search=DTLS%201.3
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\]

DTLS 1.3: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
