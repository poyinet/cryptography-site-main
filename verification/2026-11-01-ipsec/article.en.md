# Internet Protocol Security

## principle

**Protocol**: Internet Protocol Security (IPsec 安全协议族). RFC 4301 is the architecture document rather than a protocol line itself: §1 states "This document specifies the base architecture for IPsec-compliant systems." and it defines how security services are provided at the IP layer. §3.2 gives the protocol pair "IPsec uses two protocols to provide traffic security services -- Authentication Header (AH) and Encapsulating Security Payload (ESP)." and sets the baseline "IPsec implementations MUST support ESP and MAY support AH." — which protocol protects a security association follows from these documents, while policy and key management are handled elsewhere.

## why

The design choice is to place protection at the IP layer: §2.1 says "IPsec is designed to provide interoperable, high quality, cryptographically-based security for IPv4 and IPv6." and stresses "These services are provided at the IP layer, offering protection in a standard fashion for all protocols that may be carried over IP (including IP itself)." §3.1 turns that into a boundary — "IPsec creates a boundary between unprotected and protected interfaces, for a host or a network" — where packets may pass unimpeded, get AH/ESP protection, or be discarded. §4.1 fixes the granularity: "An SA is a simplex “connection” that affords security services to the traffic carried by it." and "Security services are afforded to an SA by the use of AH, or ESP, but not both."

## used

The implementation surface is defined by three databases: §4.4 states "There are three nominal databases in this model: the Security Policy Database (SPD), the Security Association Database (SAD), and the Peer Authorization Database (PAD)." §4.5 requires "All IPsec implementations MUST support both manual and automated SA and cryptographic key management." and §4.5.2 adds "Widespread deployment and use of IPsec requires an Internet-standard, scalable, automated, SA management protocol." naming the default — "The default automated key management protocol selected for use with IPsec is IKEv2 [Kau05]." AH's standing is downgraded in §3.2 with a reason: "Support for AH has been downgraded to MAY because experience has shown that there are very few contexts in which ESP cannot provide the requisite security services."

## broken

The document draws three limits itself. §2.2 hands the outcome to implementations: "the security offered by use of these protocols ultimately depends on the quality of their implementation". §4.5 admits the ceiling on authentication strength — "In general, data origin authentication in AH and ESP is limited by the extent to which secrets used with the integrity algorithm" — the more parties share a secret, the weaker the origin claim. §11 gives a concrete configuration trap: "If an IPsec implementation is configured to pass ICMP error messages over SAs based on the ICMP header values, without checking the header information from the ICMP message payload, serious vulnerabilities may arise." and judges the resulting chain "This is a very efficient DoS attack that could have been prevented if the ICMP error messages were subjected to the checks that IPsec provides".

## history

RFC 4301 is signed by S. Kent and K. Seo (BBN Technologies), published December 2005 as a Standards Track document with an “Obsoletes: 2401” header line; the abstract calls it "an updated version of the “Security Architecture for IP”". §13 assesses the relation to the older document: "This architecture document differs substantially from RFC 2401 [RFC2401] in detail and in organization, but the fundamental notions are unchanged." and singles out the new store — "There is also a new database, the Peer Authorization Database (PAD)." §10 states the same conformance duty for each protocol family: "All IPv4 IPsec implementations MUST comply with all requirements of this document." and "All IPv6 implementations MUST comply with all requirements of this document."

## refs

- Wikipedia search entry for IPsec 安全协议族. https://zh.wikipedia.org/w/index.php?search=IPsec%20%E5%AE%89%E5%85%A8%E5%8D%8F%E8%AE%AE%E6%97%8F
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/
- RFC 4301: Security Architecture for the Internet Protocol. https://www.rfc-editor.org/rfc/rfc4301
- Published standard/RFC for IPsec 安全协议族. https://www.rfc-editor.org/rfc/rfc4301

## example

**Formal model and reproduction steps**

\[\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\]

Internet Protocol Security: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
