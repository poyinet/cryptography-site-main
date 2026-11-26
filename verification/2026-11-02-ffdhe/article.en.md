# Finite Field Diffie-Hellman Ephemeral (FFDHE)

## principle

**Algorithm**: Finite Field Diffie-Hellman Ephemeral (FFDHE 有限域 DH). The opening sentence of §1 gives the mechanism being extended: "Traditional TLS [RFC5246] offers a Diffie-Hellman Ephemeral (DHE) key exchange mode that provides forward secrecy for the connection." FFDHE is Diffie-Hellman performed over a finite field in ephemeral mode, giving the connection forward secrecy. Section 1.2 assigns the vocabulary (that sentence ASCII-quotes DHE and FFDHE and is not quoted here), so the principle rests on the sentence above: each party takes an ephemeral private key, computes a shared secret over agreed finite-field group parameters, and that ephemerality is what yields forward secrecy.

## why

The abstract gives the gap: "Traditional finite-field-based Diffie-Hellman (DH) key exchange during the Transport Layer Security (TLS) handshake suffers from a number of security, interoperability, and efficiency shortcomings." and lays the root cause on unclear parameters: "These shortcomings arise from lack of clarity about which DH group parameters TLS servers should offer and clients should accept." Section 2 explains why the defined groups are built the way they are, deriving the modulus from the base of the natural logarithm so its middle bits carry no secretly chosen structure: "The goal is to guarantee that the bits in the middle of the modulus are effectively random, while avoiding any suspicion that the primes have secretly been selected to be weak according to some secret criteria." The motive is therefore twofold: turn which groups to offer and accept into negotiable named groups, and give the group parameters a checkable nothing-up-my-sleeve origin.

## used

The actions and their strengths sit in three sections at different wording levels. The extension-sending in §2 is MAY: "This extension MAY be sent by the client when either FFDHE or ECDHE cipher suites are listed." The server rule in §4 is MUST NOT: "A TLS server MUST NOT select a named FFDHE group that was not offered by a compatible client." The strength guidance in §8.2 is should: "TLS implementations using FFDHE key exchange should consider the strength of the group they negotiate." Together these give the picture of use: a client may advertise the named FFDHE groups it is willing to negotiate via the Supported Groups extension, the server may only pick from that list, and implementers should weigh group strength against their confidentiality needs. may, MUST NOT and should are not interchangeable here and are recorded at their printed levels.

## broken

There are three limits. Section 8.3 first draws the scope (a boundary, not a weakness): "Note that this document specifically targets only finite field Diffie-Hellman ephemeral key exchange mechanisms." and then a relative shortfall: "Measured by computational cost to the TLS peers, ECDHE appears today to offer a much stronger key exchange mechanism than FFDHE." by computational cost, ECDHE is today stronger than FFDHE. Section 8.4 records future decay: "Advances in hardware or in finite field cryptanalysis may cause some of the negotiated groups to not provide the desired security margins" hardware or cryptanalysis may leave some groups short, and "Revisions of this document should mark known weak groups as explicitly deprecated for use in TLS" known-weak groups are to be marked deprecated by a future revision. So the acknowledged fragility is a per-bit efficiency disadvantage against ECDHE and group value eroding over time, with the deprecation decision left to a should-level revision.

## history

The front matter prints identity and strength: the title line Negotiated Finite Field Diffie-Hellman Ephemeral Parameters for Transport Layer Security (TLS), the author line D. Gillmor, and the header Request for Comments: 7919, Category: Standards Track, Updates: 2246, 4346, 4492, 5246, and the date August 2016 (header lines stated outside the quotes). The first Status sentence is "This is an Internet Standards Track document." and the last abstract sentence gives the update relation: "This document updates TLS versions 1.0 (RFC 2246), 1.1 (RFC 4346), and 1.2 (RFC 5246), as well as the TLS Elliptic Curve Cryptography (ECC) extensions (RFC 4492)." both reported inside the Abstract/Status block. On this the file is standards-track and explicitly updates the TLS and ECC-extension documents named there.

## refs

- Wikipedia search entry for FFDHE 有限域 DH. https://zh.wikipedia.org/w/index.php?search=FFDHE%20%E6%9C%89%E9%99%90%E5%9F%9F%20DH
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[K=g^{ab}\bmod p\quad\text{或}\quad K=[ab]G\]

Finite Field Diffie-Hellman Ephemeral: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
