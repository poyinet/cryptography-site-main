# Internet X.509 Public Key Infrastructure

## principle

**Protocol**: Internet X.509 Public Key Infrastructure (PKIX 证书框架). RFC 5280 states its own place: §1 "This specification is one part of a family of standards for the X.509 Public Key Infrastructure (PKI) for the Internet." and "This specification profiles the format and semantics of certificates and certificate revocation lists (CRLs) for the Internet PKI." §4 puts the certificate side plainly — "This section presents a profile for public key certificates that will foster interoperability and a reusable PKI." — it fixes how fields and extensions are filled in and binds issuers to conformance duties, without describing CA operations or trust policy.

## why

A profile exists because free interpretation breaks both interoperability and trust decisions. Validity encoding is fixed: §4.1.2.5 "CAs conforming to this profile MUST always encode certificate validity dates through the year 2049 as UTCTime; certificate validity dates in 2050 or later MUST be encoded as GeneralizedTime." Basic constraints are mandatory and critical: §4.2.1.9 "Conforming CAs MUST include this extension in all CA certificates that contain public keys used to validate digital signatures on certificates and MUST mark the extension as critical in such certificates."

## used

§4.1.2.5 also gives the no-expiry convention: "To indicate that a certificate has no well-defined expiration date, the notAfter SHOULD be assigned the GeneralizedTime value of 99991231235959Z." §4.2.1.9 uses pathLenConstraint to bound chain depth: "A pathLenConstraint of zero indicates that no non-self-issued intermediate CA certificates may follow in a valid certification path." §6.1 sets the implementation duty: "A conforming implementation MUST include an X.509 path processing procedure that is functionally equivalent to the external behavior of this algorithm."

## broken

§6.1 draws the boundary: the algorithm "only includes checks to verify that the certification path is valid according to X.509 and does not include checks to verify that the certificates and CRLs conform to this profile." and it "RECOMMENDS against including such checks." Unknown critical extensions are a hard failure — "Note that clients MUST reject the certificate if it contains an unsupported critical extension." Conformance and validity are therefore separate matters, and the §6.1 algorithm governs only the latter.

## history

RFC 5280 is signed by D. Cooper, S. Santesson, S. Farrell, S. Boeyen, R. Housley and W. Polk, published May 2008 as a Standards Track document with "Obsoletes: 3280, 4325, 4630" in the header. §1 lists the departures from RFC 3280, one of them about path validation: "The path validation algorithm specified in Section 6 no longer tracks the criticality of the certificate policies extensions in a chain of certificates." and another about extension criticality: "Section 4.2.1.11 requires marking the policy constraints extension as critical."

## refs

- Wikipedia search entry for PKIX 证书框架. https://zh.wikipedia.org/w/index.php?search=PKIX%20%E8%AF%81%E4%B9%A6%E6%A1%86%E6%9E%B6
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/
- RFC 5280: Internet X.509 Public Key Infrastructure. https://www.rfc-editor.org/rfc/rfc5280
- Published standard/RFC for PKIX 证书框架. https://www.rfc-editor.org/rfc/rfc5280

## example

**Formal model and reproduction steps**

\[\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\]

Internet X.509 Public Key Infrastructure: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
