# Secure Real-time Transport Protocol

## principle

**Protocol**: Secure Real-time Transport Protocol (SRTP 安全实时传输). The abstract supplies both placement and capability list: "This document describes the Secure Real-time Transport Protocol (SRTP), a profile of the Real-time Transport Protocol (RTP), which can provide confidentiality, message authentication, and replay protection to the RTP traffic and to the control traffic for RTP, the Real-time Transport Control Protocol (RTCP)." It is a cryptographic profile of RTP, covering media and control traffic.

## why

The abstract states the services it adds to RTP and its control protocol: "a profile of the Real-time Transport Protocol (RTP), which can provide confidentiality, message authentication, and replay protection to the RTP traffic and to the control traffic for RTP, the Real-time Transport Control Protocol (RTCP)." The wording is can provide — the services depend on the selected cipher suite and on key management rather than being unconditional.

## used

In practice it secures audio, video and interactive sessions: the document places itself as "a profile of the Real-time Transport Protocol (RTP)" and its framework section defines cryptographic contexts and packet processing, applied on top of existing RTP payloads by voice and video-conferencing implementations.

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

The first limit: no key-management protocol is specified. §1 makes security conditional — "With appropriate key management (Sections 7 and 8), SRTP is secure (Sections 9) for unicast and multicast RTP applications (Section 11)." — and §8, Key Management Considerations, constrains whatever key management is used without defining an agreement protocol. The second limit is scope: protection covers RTP and RTCP traffic, not the application protocols carried inside them.

## history

The masthead and copyright block carry the history: Request for Comments 3711 from the Network Working Group, dated March 2004, under "Copyright (C) The Internet Society (2004). All Rights Reserved." — the IETF Trust copyright wording belongs to later documents. The file defines SRTP as a profile of RTP rather than a new transport protocol.

## refs

- Wikipedia search entry for SRTP 安全实时传输. https://zh.wikipedia.org/w/index.php?search=SRTP%20%E5%AE%89%E5%85%A8%E5%AE%9E%E6%97%B6%E4%BC%A0%E8%BE%93
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/
- RFC 3711: The Secure Real-time Transport Protocol. https://www.rfc-editor.org/rfc/rfc3711

## example

**Formal model and reproduction steps**

\[\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\]

Secure Real-time Transport Protocol: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
