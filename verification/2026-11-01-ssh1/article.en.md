# SSH 1.x

## principle

**Protocol**: Secure Shell (SSH) Protocol Version 1.x (SSH 1.x). The status of SSH 1.x is set by the retrospective description in the newer documents: RFC 4253 §5 says "Earlier versions of this protocol have not been formally documented, but it is widely known that they use 'protoversion' of “1.x” (e.g., “1.5” or “1.3”)." It is a protocol line that existed without a standardised text.

## why

The reason for the 2.0 rewrite is in the architecture document's abstract: "The SSH protocol consists of three major components: The Transport Layer Protocol provides server authentication, confidentiality, and integrity with perfect forward secrecy." The architecture abstract presents forward secrecy as a property the 2.0 transport layer provides, and the older line has no standardised description to lean on.

## used

Section 5 narrows its own scope: "Information in this section is only relevant for implementations supporting compatibility with SSH versions 1.x." The compatibility trick is a version string the newer server offers to older clients (§5.1, headed Old Client, New Server): it says "the server SHOULD identify its 'protoversion' as “1.99”." and requires clients on protocol 2.0 to treat that value as identical to 2.0.

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

Both the missing documentation and the compatibility procedure are problems: §5 records that "the only known documentation of the 1.x protocol is contained in README files that are shipped along with the source code [ssh-1.2.30]." and §5.2 notes a new client may send data first, so "the old protocol may already be corrupt when the client learns that the server is old", after which it should close and reconnect under the old protocol.

## history

RFC 4253 and RFC 4251 are both January 2006 Standards Track publications (signed T. Ylonen, SSH Communications Security Corp, and C. Lonvick, Ed., Cisco Systems) with no Obsoletes or Updates line; §5 records the reality of the time — many implementations used 2.0, "but it is known that there are still devices using the previous versions".

## refs

- Wikipedia search entry for SSH 1.x. https://zh.wikipedia.org/w/index.php?search=SSH%201.x
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\]

Secure Shell (SSH) Protocol Version 1.x: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
