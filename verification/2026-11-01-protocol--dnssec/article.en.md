# DNSSEC

## principle

**Protocol**: DNS Security Extensions (DNSSEC 域名安全). The abstract states what the extensions add: "The Domain Name System Security Extensions (DNSSEC) add data origin authentication and data integrity to the Domain Name System." This document is the introduction and requirements; the new records and protocol modifications are specified by the companion document set.

## why

Section 1 gives both the capability and the disclaimer: "The DNS security extensions provide origin authentication and integrity protection for DNS data, as well as a means of public key distribution. These extensions do not provide confidentiality." Origin and integrity are added; confidentiality is excluded by design.

## used

Section 3 lists the protocol changes: "DNSSEC adds four new resource record types: Resource Record Signature (RRSIG), DNS Public Key (DNSKEY), Delegation Signer (DS), and Next Secure (NSEC). It also adds two new message header bits: Checking Disabled (CD) and Authenticated Data (AD)." The starting point is defined in §2: "Trust Anchor: A configured DNSKEY RR or DS RR hash of a DNSKEY RR."

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

Two limits are stated outright: §4 says "Accordingly, DNSSEC is not designed to provide confidentiality, access control lists, or other means of differentiating between inquirers.", and availability is not claimed either — "DNSSEC provides no protection against denial of service attacks." — with signature verification itself creating a new denial-of-service surface.

## history

The RFC 4033 header lists R. Arends (Telematica Instituut), R. Austein (ISC), M. Larson (VeriSign), D. Massey (Colorado State University) and S. Rose (NIST), Category: Standards Track, March 2005; the same block lists nine obsoleted documents starting with 2535 and nine updated ones starting with 1034 and 1035, and since those lists interleave with the author column in the text file they are paraphrased rather than quoted.

## refs

- Wikipedia search entry for DNSSEC 域名安全. https://zh.wikipedia.org/w/index.php?search=DNSSEC%20%E5%9F%9F%E5%90%8D%E5%AE%89%E5%85%A8
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\]

DNS Security Extensions: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
