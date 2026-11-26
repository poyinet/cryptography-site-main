# RADIUS over TLS

## principle

**Protocol**: RADIUS over TLS (RADIUS over TLS). The abstract gives mechanism and effect: "This document specifies a transport profile for RADIUS using Transport Layer Security (TLS) over TCP as the transport protocol. This enables dynamic trust relationships between RADIUS servers." RADIUS moves from UDP plus a provisioned shared secret into TLS over TCP.

## why

Section 1 is explicit: "However, RADIUS is experiencing several shortcomings, such as its dependency on the unreliable transport protocol UDP and the lack of security for large parts of its packet payload. RADIUS security is based on the MD5 algorithm, which has been proven to be insecure." The remedy is encapsulation — "RADIUS over TLS wraps the entire RADIUS packet payload into a TLS stream and thus mitigates the risk of attacks on MD5."

## used

Section 2 gives the port and the duties: "The default destination port number for RADIUS over TLS is TCP/2083. There are no separate ports for authentication, accounting, and dynamic authorization changes." and §2.3 requires "Support for certificate-based mutual authentication is REQUIRED." plus "Negotiation of mutual authentication is REQUIRED."

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

Hard clauses set the limits: the version floor "implementations MUST NOT negotiate TLS versions prior to 1.1"; §6 forbids integrity-only ciphersuites, which is decisive once the shared secret is a fixed well-known value; and §4 states "RADIUS/TLS does not specify any inherent backward compatibility to RADIUS/UDP or cross compatibility to the other transports".

## history

The RFC 6614 header lists S. Winter (RESTENA), M. McCauley (OSC), S. Venaas and K. Wierenga (Cisco), May 2012, Category: Experimental — not Standards Track — with no Obsoletes or Updates line; §7 records IANA updating the already-assigned TCP port 2083, previously used by the early RadSec implementation, for RADIUS/TLS.

## refs

- Wikipedia search entry for RADIUS over TLS. https://zh.wikipedia.org/w/index.php?search=RADIUS%20over%20TLS
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\]

RADIUS over TLS: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
