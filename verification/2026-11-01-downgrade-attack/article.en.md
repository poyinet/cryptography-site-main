# Downgrade Attack

## principle

**Attack**: Downgrade Attack (降级攻击). A downgrade attack lets an on-path adversary force a connection onto an older protocol version. TLS 1.3 moved version negotiation into an extension: "the legacy_version field MUST be set to 0x0303, which is the version number for TLS 1.2. TLS 1.3 ClientHellos are identified as having a legacy_version of 0x0303 and a supported_versions extension present with 0x0304 as the highest version indicated therein". Section 4.1.3 adds that "TLS 1.3 has a downgrade protection mechanism embedded in the server's random value. TLS 1.3 servers which negotiate TLS 1.2 or below in response to a ClientHello MUST set the last 8 bytes of their Random value specially in their ServerHello", using the sentinel bytes 44 4F 57 4E 47 52 44 01 for TLS 1.2 and the same prefix ending 00 for TLS 1.1 or below.

## why

The Finished exchange already detects some tampering, but a version rollback needs an earlier and explicit signal: §1.3 states that "A version downgrade protection mechanism is described in Section 4.1.3", and §4.1.3 splits the duty: "TLS 1.3 clients receiving a ServerHello indicating TLS 1.2 or below MUST check that the last 8 bytes are not equal to either of these values", while "TLS 1.2 clients SHOULD also check that the last 8 bytes are not equal to the second value"; on a match "If a match is found, the client MUST abort the handshake" with an illegal_parameter alert. The same section admits that "This mechanism provides limited protection against downgrade attacks over and above what is provided by the Finished exchange" and that "It does not provide downgrade protection when static RSA is used".

## used

Forbidding fallback is a standards-level measure, not an implementation detail. RFC 7568 states that "The Secure Sockets Layer version 3.0 (SSLv3), as specified in RFC 6101, is not sufficiently secure. This document requires that SSLv3 not be used", and §3 says "SSLv3 MUST NOT be used. Negotiation of SSLv3 from any version of TLS MUST NOT be permitted", that clients "MUST NOT send a ClientHello with ClientHello.client_version set to {03,00}", and that although servers must still accept any {03,XX} record-layer version number "they MUST NOT negotiate SSLv3".

## broken

The mechanism has stated limits: the sentinel is mandatory only for "TLS 1.3 servers … MUST", while the SHOULD applies only to the TLS 1.1-or-below sentinel, which TLS 1.3 servers MUST and TLS 1.2 servers SHOULD set, static RSA suites get no protection, and clients must actually perform the check. TLS 1.3 therefore also removes exploitable legacy capability: "The list of supported symmetric encryption algorithms has been pruned of all algorithms that are considered legacy", "Static RSA and Diffie-Hellman cipher suites have been removed; all public-key based key exchange mechanisms now provide forward secrecy", plus the removal of compression, DSA and custom DHE groups. Section 6.2 lists the inappropriate_fallback alert, sent by a server in response to an invalid connection retry attempt from a client (citing RFC 7507), and the Appendix C.3 deployment checklist asks whether "all support for SSL, RC4, EXPORT ciphers, and MD5 … is completely removed".

## history

RFC 7568, by Barnes, Thomson, Pironti and Langley, was published in June 2015 on the Standards Track and updates RFC 5246. Section 4.1 gives the reason: SSLv3's CBC padding "trivially permits the recovery of plaintext [POODLE]" and RC4 "exhibits serious biases and is also no longer fit for use [RFC7465]", so "This leaves SSLv3 with no suitable record protection mechanism", while §4.2 adds that the SSLv3 key exchange is vulnerable to man-in-the-middle attacks when renegotiation or session resumption is used. RFC 8446 (Rescorla, August 2018) then deprecated the TLS 1.2 version-negotiation mechanism in favour of a version list in an extension.

## refs

- Wikipedia search entry for 降级攻击. https://zh.wikipedia.org/w/index.php?search=%E9%99%8D%E7%BA%A7%E6%94%BB%E5%87%BB
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[\mathrm{Adv}^{\mathrm{attack}}_A(\lambda)=\Pr[\mathrm{Game}_A(\lambda)=1]-\frac12\]

Downgrade Attack: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
