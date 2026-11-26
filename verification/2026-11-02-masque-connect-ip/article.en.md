# MASQUE CONNECT-IP

## principle

**Protocol**: MASQUE Proxying IP over HTTP (MASQUE CONNECT-IP). The self-description comes in three sentences: "This document describes how to proxy IP packets in HTTP.", "This protocol is similar to UDP proxying in HTTP but allows transmitting arbitrary IP packets.", and "More specifically, this document defines a protocol that allows an HTTP client to create an IP tunnel through an HTTP server that acts as an IP proxy." The granularity rises from datagrams to IP packets.

## why

It closes the generality gap left by CONNECT-UDP: the abstract says the protocol "allows transmitting arbitrary IP packets", so protocol families beyond UDP can be carried. The same block states the relationship to the base document: "This document updates RFC 9298."

## used

The use cases are listed in §1: "This can be used for various use cases, such as remote access VPN, site-to-site VPN, secure point-to-point communication, or general-purpose packet tunnelling." The abstract frames it as proxying IP through an HTTP server, and §1 places it in the same family: "IP proxying operates similarly to UDP proxying [CONNECT-UDP]".

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

The document specifies how IP packets are proxied and leaves deployment duty to the operator: §11 states a recommendation-level requirement — "HTTP servers that support IP proxying SHOULD restrict its use to authenticated users" — and §4.6 supplies the means to narrow a request to a specific IP prefix or IP protocol. What a proxy ought to permit is therefore carried by SHOULD-level configuration plus scope limiting, not by a hard rule in this specification.

## history

The masthead names the editor and dates the file: T. Pauly, Ed. (Apple Inc.) with D. Schinazi, A. Chernyakhovsky, M. Kühlewind and M. Westerlund, October 2023, Standards Track, marked "Updates: 9298", under the 2023 IETF Trust copyright line.

## refs

- Wikipedia search entry for MASQUE CONNECT-IP. https://zh.wikipedia.org/w/index.php?search=MASQUE%20CONNECT-IP
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/
- RFC 9484: Proxying IP in HTTP. https://www.rfc-editor.org/rfc/rfc9484

## example

**Formal model and reproduction steps**

\[\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\]

MASQUE Proxying IP over HTTP: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
