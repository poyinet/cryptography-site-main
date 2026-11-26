# Extensible Authentication Protocol

## principle

**Protocol**: Extensible Authentication Protocol (EAP 认证框架). EAP is a framework rather than a mechanism: §1 defines it as "This document defines the Extensible Authentication Protocol (EAP), an authentication framework which supports multiple authentication methods."

## why

Extensibility comes from the authenticator not needing to know the methods: §1 explains "Rather than requiring the authenticator to be updated to support each new authentication method, EAP permits the use of a backend authentication server, which may implement some or all authentication methods, with the authenticator acting as a pass-through for some or all methods and peers."

## used

A pass-through authenticator checks little and forwards: §2.3 states "Compliant pass-through authenticator implementations MUST by default forward EAP packets of any Type." while §2.1 requires that "the peer and authenticator MUST utilize only one authentication method (Type 4 or greater) within an EAP conversation, after which the authenticator MUST send a Success or Failure packet."

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

The framework does not secure lower-layer negotiation or carry extra data: §7.11 warns "if the lower layer performs ciphersuite negotiation, it should be understood that EAP does not provide by itself integrity protection of that negotiation." and §2.2 forbids reuse of result packets: "the Success, Failure, Nak Response(s), and Notification Request/Response messages MUST NOT be used to carry data destined for delivery to other EAP methods."

## history

RFC 3748 is a June 2004 Standards Track document carrying “Obsoletes: 2284”. Section 6.2 describes the scarce identifier space: "The original EAP method Type space has a range from 1 to 255, and is the scarcest resource in EAP, and thus must be allocated with care. Method Types 1-45 have been allocated, with 20 available for re-use."

## refs

- Wikipedia search entry for EAP 认证框架. https://zh.wikipedia.org/w/index.php?search=EAP%20%E8%AE%A4%E8%AF%81%E6%A1%86%E6%9E%B6
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/
- RFC 3748: Extensible Authentication Protocol. https://www.rfc-editor.org/rfc/rfc3748

## example

**Formal model and reproduction steps**

\[\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\]

Extensible Authentication Protocol: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
