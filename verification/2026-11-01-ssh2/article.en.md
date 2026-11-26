# SSH Protocol Version 2

## principle

**Protocol**: SSH Protocol Version 2 (SSH 2.0 协议族). The SSH 2.0 transport first exchanges version strings and KEXINIT, then runs DH to obtain the shared secret K. The exchange hash H concatenates the version strings, both raw KEXINIT payloads, the host key, DH e/f and K in a fixed order, then hashes them; the first KEX H is session_id. Key expansion starts with K1=HASH(K||H||X||session_id), where X from A to F derives the c→s IV, s→c IV, c→s encryption key, s→c encryption key, c→s integrity key and s→c integrity key; if a key is too short, the hash chain continues.

## why

H binds algorithm negotiation, host identity and DH values, so a man-in-the-middle cannot replace any one of them; session_id stays unchanged across rekeys and ties the connection history together.

The six keys separate direction and purpose, avoiding one key for both encryption and MAC; the sequence number enters the MAC implicitly, so replay, reordering and loss are visible to the receiver.

## used

Implement the RFC 4253 §7.2 expansion order: compute K1, then K2 and K3, until all six keys are long enough; AES-128-CTR takes a 16-byte encryption key and HMAC-SHA256 a 32-byte integrity key.

The packet layer assembles the plaintext packet, computes MAC=MAC(K_mac, seq||packet_without_mac), then encrypts; AEAD modes merge MAC and encryption but still maintain the sequence number.

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

The order of MAC and encryption defines the boundary: encrypt-then-MAC is safer, while MAC-then-encrypt leaves room for padding oracles; CBC modes and SHA-1 should not be used in new deployments.

After sequence wrap, old nonces must not be reused; rekey changes keys but not the sequence number. Host-key trust is outside the transport layer and still needs known_hosts or certificate validation.

Session = (Auth, KeyExchange, Record)；State ∈ {init, established, closed}；Invariant: fresh_key ∧ bound_auth. Symbols are catalogue-level variables, not standard constants; parameters, test vectors and clauses remain with the registered source. The model states structural relations, not an implementation audit.

## history

SSH-1 appeared around 1995 and was replaced by SSH-2 because of the CRC compensation attack and protocol flaws; RFC 4250–4254 in January 2006 fixed SSH-2 as transport, authentication, connection and architecture documents.

RFC 6668 added hmac-sha2-256 and hmac-sha2-512 in 2012; OpenSSH and other implementations later added AEAD, strict KEX and post-quantum KEX extensions, while the packet formulas still follow RFC 4253.

## refs

- Wikipedia search entry for SSH 2.0 协议族. https://zh.wikipedia.org/w/index.php?search=SSH%202.0%20%E5%8D%8F%E8%AE%AE%E6%97%8F
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/
- RFC 4251: The Secure Shell (SSH) Protocol Architecture. https://www.rfc-editor.org/rfc/rfc4251
- Published standard/RFC for SSH 2.0 协议族. https://www.rfc-editor.org/rfc/rfc4251

## example

**Formal model and reproduction steps**

\[\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\]

SSH Protocol Version 2: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
