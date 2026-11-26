# DTLS Connection ID

## principle

**Protocol**: DTLS Connection ID (DTLS 连接 ID). RFC 9146 states the job in §1: "This document defines an extension to DTLS 1.2 to add a Connection ID (CID) to the DTLS record layer." Negotiation uses the extension defined in §3, "enum { connection_id(54), (65535) } ExtensionType;", and §4 marks the records: "connections that have negotiated this extension use a distinguished record type tls12_cid(25)." with the real content type moved inside the ciphertext.

## why

The reason is that records pick associations by 5-tuple: the abstract says "selecting a security association of an incoming DTLS record is accomplished with the help of the 5-tuple", and §1 says "In DTLS as specified in RFC 6347, the IP address and port of the peer are used to identify the DTLS association." and "Unfortunately, in some cases, such as NAT rebinding, these values are insufficient." naming the worst-affected setting — "This is a particular issue in the Internet of Things when devices enter extended sleep periods to increase their battery lifetime." Following TLS 1.3 practice, the record type is encrypted and padding is provided.

## used

Direction is expressed with zero length: §3 states "A zero-length CID value indicates that the client is prepared to send using a CID but does not wish the server to use one when sending." and plaintext records are untouched — §4 "Plaintext records are not impacted by this extension." Address updates are gated: on receiving a record from a different source address §6 says "the receiver MUST NOT replace the address it uses for sending records to its peer with the source address specified in the received datagram" unless the datagram verified cryptographically, is newer than the latest known, and there is a way to confirm the new address is reachable.

## broken

Three limits. There is no mid-session rotation — §3: "There is no dedicated “CID update” message that allows new CIDs to be established mid-session". §8 states the privacy cost: "The CID replaces the previously used 5-tuple and, as such, introduces an identifier that remains persistent during the lifetime of a DTLS connection." and recommends DTLS 1.3 for multihoming — "The lack of a CID update mechanism in DTLS 1.2 makes this extension unsuitable for mobility scenarios where correlation must be considered." §9 admits the reflection surface: a peer cannot tell a genuine address update from a malicious one.

## history

RFC 9146 is signed by E. Rescorla (Ed., Mozilla), H. Tschofenig (Ed., Arm Limited), T. Fossati and A. Kraus (Bosch.IO GmbH), published March 2022 as a Standards Track document with “Updates: 6347” in the header. §4 notes the division of labour with its successor: "[DTLS13] specifies how to carry the CID in DTLS 1.3." — this document covers only the DTLS 1.2 record-layer change.

## refs

- Wikipedia search entry for DTLS 连接 ID. https://zh.wikipedia.org/w/index.php?search=DTLS%20%E8%BF%9E%E6%8E%A5%20ID
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\]

DTLS Connection ID: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
