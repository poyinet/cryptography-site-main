# Encapsulating Security Payload

## principle

**Protocol**: Encapsulating Security Payload (ESP 封装安全载荷). RFC 4303 pins the packet position and fields: §1 says "The ESP header is inserted after the IP header and before the next layer protocol header (transport mode) or before an encapsulated IP header (tunnel mode)." §2 fixes the protocol number — "The (outer) protocol header (IPv4, IPv6, or Extension) that immediately precedes the ESP header SHALL contain the value 50 in its Protocol (IPv4) or Next Header (IPv6, Extension) field" — and the layout "The packet begins with two 4-byte fields (Security Parameters Index (SPI) and Sequence Number)." §2.8 adds the optional trailer: "The Integrity Check Value is a variable-length field computed over the ESP header, Payload, and ESP trailer fields." and "The ICV field is optional."

## why

The services are a menu, but with a floor: §1 lists "ESP can be used to provide confidentiality, data origin authentication, connectionless integrity, an anti-replay service (a form of partial sequence integrity), and (limited) traffic flow confidentiality." and stresses that the set depends on the options chosen when the SA is established and on where the implementation sits. §3.2 closes it as a hard rule: "although both confidentiality and integrity are optional, at least one of these services MUST be selected, hence both algorithms MUST NOT be simultaneously NULL." On encryption-only, §1 first notes "Using encryption-only for confidentiality is allowed by ESP." then warns "this will provide defense only against passive attackers."

## used

Encryption-only is not forbidden: §1 explains "ESP allows encryption-only SAs because this may offer considerably better performance and still provide adequate security" while adding "However, this standard does not require ESP implementations to offer an encryption-only service." Traffic-flow concealment is an explicitly designed option: §2.7 requires "An IPsec implementation SHOULD be capable of padding traffic by adding bytes after the end of the Payload Data, prior to the beginning of the Padding field." and "if TFC padding is added, the field containing the specification of the length of the IP datagram MUST NOT be modified to reflect this padding." The mode choice is one line in §3.1: "ESP may be employed in two ways: transport mode or tunnel mode."

## broken

Anti-replay has an explicit failure condition: §2.2 states "for a multi-sender SA, the anti-replay features of ESP are not available". New features are gated on negotiation, and §2.7 requires "the SA management protocol MUST negotiate this service prior to a transmitter employing it, to ensure backward compatibility". §3.4 gives the security reason for the inbound order: when the two checks run in parallel, "integrity checking MUST be completed before the decrypted packet is passed on for further processing." The hardest boundary is in §8: "There is no version number in ESP and no mechanism enabling IPsec peers to discover or negotiate which version of ESP each is using or should use." — version shows up only indirectly through the negotiated algorithms.

## history

RFC 4303 is signed by S. Kent (BBN Technologies), published December 2005 as a Standards Track document with “Obsoletes: 2406” in the header; the abstract calls it "an updated version of the Encapsulating Security Payload (ESP) protocol" and says "ESP is used to provide confidentiality, data origin authentication, connectionless integrity, an anti-replay service". §8 sets out compatibility with the older line: "if none of the new features available in ESP v3 are employed, then the format of an ESP packet is identical in ESP v2 and v3." Combined-mode ciphers are defined only in the ESP v3 context.

## refs

- Wikipedia search entry for ESP 封装安全载荷. https://zh.wikipedia.org/w/index.php?search=ESP%20%E5%B0%81%E8%A3%85%E5%AE%89%E5%85%A8%E8%BD%BD%E8%8D%B7
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/
- RFC 4303: IP Encapsulating Security Payload. https://www.rfc-editor.org/rfc/rfc4303

## example

**Formal model and reproduction steps**

\[\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\]

Encapsulating Security Payload: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
