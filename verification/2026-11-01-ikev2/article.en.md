# Internet Key Exchange Version 2

## principle

**Protocol**: Internet Key Exchange Version 2 (IKEv2 密钥交换). IKEv2 starts with IKE_SA_INIT: both sides exchange SA proposals, Ni/Nr and DH public keys, negotiating PRF, encryption, integrity and DH group. It then computes SKEYSEED=prf(Ni|Nr, g^ir), where g^ir is the DH shared secret. prf+(SKEYSEED, Ni|Nr|SPIi|SPIr) expands into SK_d, SK_ai, SK_ar, SK_ei, SK_er, SK_pi and SK_pr. SK_d is the long-lived key that derives Child SA key material, SK_a protects integrity, SK_e protects confidentiality and SK_p protects identity.

## why

SKEYSEED binds both nonces, the DH shared secret and the SPIs, so any difference yields different session keys; prf+ stretches a fixed-length PRF output into the required key stream and avoids reusing one segment for different purposes.

IKE_AUTH uses AUTH to bind the real message, the peer nonce and the identity, stopping a man-in-the-middle from replacing the ID or replaying an old message; a Child SA can add fresh DH for PFS.

## used

Implement RFC 7296 §2.14: choose the PRF, for example HMAC-SHA-256 with 32-byte output, then slice the prf+ output by key length; SK_d is at least the PRF output length.

Child SA KEYMAT=prf+(SK_d, Ni|Nr), or prf+(SK_d, g^ir(new)|Ni|Nr) with PFS; AUTH SignedOctets contains RealMessage, the peer nonce and prf(SK_p, ID).

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

PFS is optional: a Child SA without fresh DH relies only on SK_d and nonces, so a long-lived SK_d leak reaches that SA’s keys. Nonce reuse repeats SKEYSEED and destroys session-key uniqueness.

PSK mode must apply the Key Pad inner prf first, and a low-entropy password still falls to offline dictionary attacks; PPK only mixes an extra key and does not replace a strong shared secret. IKEv2 protects negotiation and SAs, not application data by itself.

## history

IKEv2 first appeared in RFC 4306 in December 2005, was revised by RFC 5996 in 2010, and became Internet Standard STD 79 in RFC 7296 in October 2014.

RFC 8784 added PPK in 2020 to mix a post-quantum pre-shared key into IKEv2; RFC 7383 added message fragmentation and RFC 7815 gives a minimal implementation example.

## refs

- Wikipedia search entry for IKEv2 密钥交换. https://zh.wikipedia.org/w/index.php?search=IKEv2%20%E5%AF%86%E9%92%A5%E4%BA%A4%E6%8D%A2
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\]

Internet Key Exchange Version 2: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
