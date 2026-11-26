# MASQUE CONNECT-UDP

## principle

**Protocol**: MASQUE Proxying UDP over HTTP (MASQUE CONNECT-UDP). The defining sentence sits in the abstract: "This document describes how to proxy UDP in HTTP, similar to how the HTTP CONNECT method allows proxying TCP in HTTP." — quoted exactly as "This document describes how to proxy UDP in HTTP, similar to how the HTTP CONNECT method allows proxying TCP in HTTP." — and it is immediately narrowed: "More specifically, this document defines a protocol that allows an HTTP client to create a tunnel for UDP communications through an HTTP server that acts as a proxy." The subject is a UDP tunnel carried by HTTP, not a new transport.

## why

The gap is stated in the abstract: "This document describes how to proxy UDP in HTTP, similar to how the HTTP CONNECT method allows proxying TCP in HTTP." Clause 1 shows the carriage is not tied to one HTTP version — "This protocol supports all existing versions of HTTP by using HTTP Datagrams", with Extended CONNECT for HTTP/2 and HTTP/3 and Upgrade for HTTP/1.x. The status statement in the front matter records the consensus provenance: "This document is a product of the Internet Engineering Task Force (IETF). It represents the consensus of the IETF community."

## used

The usage shape is a client building a UDP tunnel through a proxying server: the abstract says "this document defines a protocol that allows an HTTP client to create a tunnel for UDP communications through an HTTP server that acts as a proxy." From §3 onward the document gives the protocol and message formats, while the safety of the carried content is left to the upper layer — §1 expects that "UDP tunnels are commonly used to create an end-to-end virtual connection, which can then be secured using QUIC [QUIC] or another protocol running over UDP."

## broken

The first limit is that only the tunnel is specified: whether the forwarded payload is confidential depends on the protocol run above UDP (§1), and this document adds no confidentiality or integrity to the payload. The second is the abuse risk of the proxy position, handled in §7 (§9 is the References): "There are significant risks in allowing arbitrary clients to establish a tunnel to arbitrary targets, as that could allow bad actors to send traffic and have it attributed to the UDP proxy." together with the advice that "HTTP servers that support UDP proxying ought to restrict its use to authenticated users."

## history

The history sits in the masthead and copyright block: D. Schinazi (Google LLC), dated August 2022, Category Standards Track, under "Copyright (c) 2022 IETF Trust and the persons identified as the document authors." The successor RFC 9484 (CONNECT-IP, October 2023) carries Updates: 9298 in its own masthead, making this the base of that update; this document claims no update of its own.

## refs

- Wikipedia search entry for MASQUE CONNECT-UDP. https://zh.wikipedia.org/w/index.php?search=MASQUE%20CONNECT-UDP
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/
- RFC 9298: Proxying UDP in HTTP. https://www.rfc-editor.org/rfc/rfc9298

## example

**Formal model and reproduction steps**

\[\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\]

MASQUE Proxying UDP over HTTP: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
