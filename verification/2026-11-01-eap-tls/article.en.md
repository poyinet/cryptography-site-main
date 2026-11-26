# EAP-TLS

## principle

**Protocol**: EAP-TLS (EAP-TLS). The abstract and §1 give the same definition: "This document defines EAP-TLS, which includes support for certificate-based mutual authentication and key derivation." It is one concrete method inside the EAP framework, with TLS as its core.

## why

Mutual authentication rests on certificates: §2.2 says "As part of the TLS negotiation, the server presents a certificate to the peer, and if mutual authentication is requested, the peer presents a certificate to the server."

## used

The hard deployment requirement is revocation checking: §5.4 states that implementations "MUST support the use of Certificate Revocation Lists (CRLs)" The §2.1.4 mandate is scoped to privacy support, where servers "MUST request a client certificate" — client certificates are not required unconditionally.

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

The protection has edges: §5.5 notes "The integrity protection of EAP-TLS packets does not extend to the EAP header fields (Code, Identifier, Length) or the Type or Flags fields." and the §5.1 claims table records channel binding as No. The baseline is TLS version 1.0 or later, and a footnote in §5.1 adds that "EAP-TLS inherits the secure ciphersuite negotiation features of TLS, including key derivation function negotiation when utilized with TLS v1.2 [RFC4346bis]"; TLS 1.3 is not addressed.

## history

RFC 5216 (March 2008, Standards Track, Simon, Aboba and Hurst) carries “Obsoletes: 2716” and says in §1 that "While this document obsoletes RFC 2716 [RFC2716], it remains backward compatible with it." Section 2.3 records the key origin: "In EAP-TLS, the MSK, EMSK, and Initialization Vector (IV) are derived from the TLS master secret via a one-way function." There is no Updates line and no update to RFC 3748.

## refs

- Wikipedia search entry for EAP-TLS. https://zh.wikipedia.org/w/index.php?search=EAP-TLS
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\]

EAP-TLS: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
