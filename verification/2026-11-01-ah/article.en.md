# Authentication Header

## principle

**Protocol**: Authentication Header (AH 认证头). Encryption appears nowhere in the §1 service list for AH: §1 states "The IP Authentication Header (AH) is used to provide connectionless integrity and data origin authentication for IP datagrams" and adds "and to provide protection against replays." §2 gives the protocol number — "The protocol header (IPv4, IPv6, or IPv6 Extension) immediately preceding the AH header SHALL contain the value 51 in its Protocol (IPv4) or Next Header (IPv6, Extension) fields [DH98]." §2.4 explains the index field: "The SPI is an arbitrary 32-bit value that is used by a receiver to identify the SA to which an incoming packet is bound."

## why

Coverage is both AH's reason for existing and its weakness: §1 says "AH provides authentication for as much of the IP header as possible, as well as for next level protocol data." But fields that change en route cannot be covered — "some IP header fields may change in transit and the value of these fields, when the packet arrives at the receiver, may not be predictable by the sender." The conclusion is "Thus, the protection provided to the IP header by AH is piecemeal." The same section places the AH/ESP difference in coverage: "ESP does not protect any IP header fields unless those fields are encapsulated by ESP".

## used

The sequence field is mandatory even when anti-replay is off: §2.5 requires "The field is mandatory and MUST always be present even if the receiver does not elect to enable the anti-replay service for a specific SA." and the increment duty is scoped — "For a unicast SA or a single-sender multicast SA, the sender MUST increment this field for every transmitted packet." §2.6 delegates the verification parameters to the algorithm specification: "The integrity algorithm specification MUST specify the length of the ICV and the comparison rules and processing steps for validation." §3.1 again offers two usages — "AH may be employed in two ways: transport mode or tunnel mode." — and §3.2 names the algorithm classes: "suitable integrity algorithms include keyed Message Authentication Codes (MACs) based on symmetric encryption algorithms".

## broken

Multiple senders make anti-replay unavailable outright: §2.5 says "Thus, for a multi-sender SA, the anti-reply features of AH are not available". With anti-replay enabled — the default — the counter may not wrap: "If anti-replay is enabled (the default), the transmitted sequence number must never be allowed to cycle." §5 takes the engineering view on manually keyed SAs — if the ICV key is distributed by hand, anti-replay needs the sender to maintain counter state with no automatic recovery near overflow, so "a compliant implementation SHOULD NOT provide this service in conjunction with SAs that are manually keyed." The same section outsources the algorithm list: "The mandatory-to-implement algorithms for use with AH are described in a separate RFC [Eas04]".

## history

RFC 4302 is signed by S. Kent (BBN Technologies), published December 2005 as a Standards Track document with “Obsoletes: 2402” in the header; the abstract calls it "an updated version of the IP Authentication Header (AH)", "which is designed to provide authentication services in IPv4 and IPv6". §5 records that the mandatory algorithms moved to a separate RFC so the algorithm requirements can be updated independently. §7 lists the differences from RFC 2402, including the new counter option: "added a new option for a 64-bit sequence number for very high-speed communications."

## refs

- Wikipedia search entry for AH 认证头. https://zh.wikipedia.org/w/index.php?search=AH%20%E8%AE%A4%E8%AF%81%E5%A4%B4
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/
- RFC 4302: IP Authentication Header. https://www.rfc-editor.org/rfc/rfc4302

## example

**Formal model and reproduction steps**

\[\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\]

Authentication Header: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
