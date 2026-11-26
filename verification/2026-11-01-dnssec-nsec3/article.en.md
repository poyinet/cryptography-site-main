# NSEC3

## principle

**Protocol**: NSEC3 (NSEC3 哈希化否定证明). Section 3 defines the record: "The NSEC3 Resource Record (RR) provides authenticated denial of existence for DNS Resource Record Sets." It answers the claim that a name or type is absent, signed like the rest of DNSSEC.

## why

The motive is a side effect of the older record: §1.1 says "Though the NSEC RR meets the requirements for authenticated denial of existence, it introduces a side-effect in that the contents of a zone can be enumerated." Section 3 answers with hashed names: "To provide protection against zone enumeration, the owner names used in the NSEC3 RR are cryptographic hashes of the original owner name prepended as a single label to the name of the zone."

## used

Three parameters set the behaviour. Iterations "defines the number of additional times the hash function has been performed", buying resilience against dictionary attacks; the salt "is appended to the original owner name before hashing in order to defend against pre-calculated dictionary attacks"; and "If the Opt-Out flag is set, the NSEC3 record covers zero or more unsigned delegations."

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

Cost is raised, not risk removed: §12.1.1 concedes "The NSEC3 RRs are still susceptible to dictionary attacks", advising that "The salt SHOULD be at least 64 bits long and unpredictable" and be changed regularly; §12.1.2 notes that on a collision "it will be impossible to prove the non-existence of the colliding QNAME". SHA-1 is the only hash algorithm defined.

## history

RFC 5155 is a March 2008 Standards Track document (Laurie, Sisson, Arends and Blacka) with neither an Obsoletes nor an Updates line. The abstract presents NSEC3 as "an alternative resource record" that keeps authenticated denial while it "provides measures against zone enumeration and permits gradual expansion of delegation-centric zones"; its type number is 50.

## refs

- Wikipedia search entry for NSEC3 哈希化否定证明. https://zh.wikipedia.org/w/index.php?search=NSEC3%20%E5%93%88%E5%B8%8C%E5%8C%96%E5%90%A6%E5%AE%9A%E8%AF%81%E6%98%8E
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\]

NSEC3: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
