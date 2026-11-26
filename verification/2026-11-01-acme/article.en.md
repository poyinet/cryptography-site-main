# Automatic Certificate Management Environment

## principle

**Protocol**: Automatic Certificate Management Environment (ACME 证书自动管理). ACME automates proof of domain control: §1 sets the premise "Certificates [RFC5280] in the Web PKI are most commonly used to authenticate domain names." the abstract describes the status quo it replaces — "As of this writing, this verification is done through a collection of ad hoc mechanisms." — and §4 gives the carrier: "ACME allows a client to request certificate management actions using a set of JavaScript Object Notation (JSON) messages [RFC8259] carried over HTTPS [RFC2818]." §6.2 sets request authentication: "All ACME requests with a non-empty body MUST encapsulate their payload in a JSON Web Signature (JWS) [RFC7515] object" and "The server MUST verify the JWS before processing the request."

## why

The document centres on domain validation for the Web PKI while leaving extension room on purpose: §1 states "while the focus of this document is on validating domain names for purposes of issuing certificates in the Web PKI, ACME supports extensions for uses with other identifiers in other PKI contexts." For DV certificates §1 also states "The only validation the CA is required to perform in the DV issuance process is to verify that the requester has effective control of the domain" and adds "The CA is not required to attempt to verify the requester's real-world identity." §2 explains why that can be fully automated: DV checks properties the issuer can observe online, so "all steps in the request, verification, and issuance process can be represented and performed by Internet protocols with no out-of-band human intervention."

## used

Authorization asserts two facts, listed in §7.5 as "That the client controls the private key of the account key pair" and "That the client controls the identifier in question." §7.1.4 enumerates the states: "Possible values are “pending”, “valid”, “invalid”, “deactivated”, “expired”, and “revoked”." §8.3's http-01 challenge works because "With HTTP validation, the client in an ACME transaction proves its control over a domain name by proving that it can provision HTTP resources on a server accessible under that domain name." and explains the cleartext port — "the challenge must be completed over HTTP, not HTTPS." §8.4's dns-01 instead lets a client "prove control of that domain by provisioning a TXT resource record containing a designated value for a specific validation domain name." §6.5 defines replay protection: "ACME POST requests have a mandatory anti-replay mechanism." Revocation travels the same channel: §7.6 states "To request that a certificate be revoked, the client sends a POST request to the ACME server's revokeCert URL." and notes its special status, "Revocation requests are different from other ACME requests in that they can be signed with either an account key pair or the key pair in the certificate."

## broken

Nonces are single use: §6.5 requires "Once a nonce value has appeared in an ACME request, the server MUST consider it invalid, in the same way as a value it had never issued." Tokens need entropy — §8.3 states "This value MUST have at least 128 bits of entropy." and §11.3 explains the two purposes, one being to make an unconfigured “naive” validation server hard to build. §10.4 records the SSRF exposure: the validation GET "This request is made before the server has verified that the client controls the domain, so any client can cause a query to any domain." and a redirect widens it — "then they can send the server an HTTP redirect (e.g., a 302 response) which will cause the server to query an arbitrary URL." §10.3 acknowledges the cost of these outbound connections and §6.6 provides the backstop: "Creation of resources can be rate limited by ACME servers to ensure fair usage and prevent abuse."

## history

RFC 8555 is signed by R. Barnes (Cisco), J. Hoffman-Andrews (EFF), D. McCarney (Let's Encrypt) and J. Kasten (University of Michigan), published March 2019 with Category: Standards Track and no Obsoletes line. §1 describes the status quo it replaces: "Existing Web PKI certification authorities tend to use a set of ad hoc protocols for certificate issuance and identity verification." and §2 records the earlier deployment experience: "Prior to ACME, when deploying an HTTPS server, a server operator typically gets a prompt to generate a self-signed certificate."

## refs

- Wikipedia search entry for ACME 证书自动管理. https://zh.wikipedia.org/w/index.php?search=ACME%20%E8%AF%81%E4%B9%A6%E8%87%AA%E5%8A%A8%E7%AE%A1%E7%90%86
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/
- RFC 8555: Automatic Certificate Management Environment. https://www.rfc-editor.org/rfc/rfc8555
- Published standard/RFC for ACME 证书自动管理. https://www.rfc-editor.org/rfc/rfc8555

## example

**Formal model and reproduction steps**

\[\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\]

Automatic Certificate Management Environment: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
