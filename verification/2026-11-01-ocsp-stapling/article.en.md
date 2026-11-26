# OCSP Stapling

## principle

**Protocol**: OCSP Stapling (OCSP 装订). The mechanism carries certificate status information inside the handshake: RFC 6066 §8 (Certificate Status Request) says "This extension allows for such information to be sent in the TLS handshake, saving roundtrips and resources."

## why

The stated reason is bandwidth and round-trips, not privacy: the same section says "Constrained clients may wish to use a certificate-status protocol such as OCSP [RFC2560] to check the validity of server certificates, in order to avoid transmission of CRLs and therefore save bandwidth on constrained networks."

## used

The server answers optionally: §8 covers a client hello "containing the “status_request” extension" and says such servers "MAY return a suitable certificate status response to the client along with their certificate." and that "Only one OCSP response may be sent." A server that does send a CertificateStatus message must earlier have included the extension with empty data in the server hello.

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

Stapling does not replace validation: §11.6 warns that "If a client requests an OCSP response, it must take into account that an attacker's server using a compromised key could (and probably would) pretend not to support the extension." and advises a client that requires OCSP validation to "SHOULD either contact the OCSP server directly or abort the handshake".

## history

The extension is specified by RFC 6066, a Standards Track document from January 2011 whose header carries “Obsoletes: 4366” and whose §1 says the text is largely an adaptation of RFC 4366 material. The nonce encoding is pinned here: "for clarification, the nonce MUST be a DER-encoded OCTET STRING".

## refs

- Wikipedia search entry for OCSP 装订. https://zh.wikipedia.org/w/index.php?search=OCSP%20%E8%A3%85%E8%AE%A2
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/
- RFC 6960: Online Certificate Status Protocol. https://www.rfc-editor.org/rfc/rfc6960
- Published standard/RFC for OCSP 装订. https://www.rfc-editor.org/rfc/rfc6960

## example

**Formal model and reproduction steps**

\[\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\]

OCSP Stapling: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
