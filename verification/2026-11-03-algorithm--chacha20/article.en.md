# ChaCha20 Stream Cipher

## principle

**Algorithm**: ChaCha20 (ChaCha20 流密码). Section 2.4 gives the identity and lineage: "ChaCha20 is a stream cipher designed by D. Bernstein. It is a refinement of the Salsa20 algorithm, and it uses a 256-bit key." The same section describes the mechanism: "ChaCha20 successively calls the ChaCha20 block function, with the same key and nonce, and with successively increasing block counter parameters." So it is not one permutation per message: under one key and nonce, an increasing block counter stitches block-function outputs into a keystream.

## why

The parameter list lays out the constraints: "A 256-bit key, treated as a concatenation of eight 32-bit…integers." and "A 96-bit nonce, treated as a concatenation of three 32-bit…integers." (the retained file breaks the word little-endian at a line end; the ellipsis marks only that break and no wording is altered). §2.3 then states the one hard requirement on that nonce: "Words 13-15 are a nonce, which MUST not be repeated for the same key." The security condition is handed to the caller - the cipher does not detect repeats, so a repeat is the protocol's problem.

## used

In use the cipher is length-agnostic: "There is no requirement for the plaintext to be an integral multiple of 512 bits. If there is extra keystream from the last block, it is discarded." The same section permits streaming: "each keystream block can be XORed with a plaintext block before proceeding to create the next block, saving some memory." Length and padding rules therefore belong to the protocol, not the algorithm.

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

Two limits. §2.6.2 volunteers the first: "Chacha20 could be used as a key-derivation function, by generating an arbitrarily long keystream. However, that is not what protocols such as IKEv2 require." (the document prints the name as Chacha20 here, quoted as printed) - so it is not a KDF. The second follows from the §2.3 nonce condition: repeating a nonce under one key repeats the keystream, so two plaintexts leak their difference, and nothing in the cipher detects the repeat.

## history

Version facts: §2.3 states the choice this document makes - "The ChaCha algorithm described here uses a 256-bit key." - pinning the divergence from Bernstein's paper to key length. The header prints Request for Comments: 8439, Category: Informational, August 2018, by Nir and Woodbury (header furniture is restated outside quotes and never presented as an algorithm property). What entered IETF specification is the 256-bit-key branch, not every variant in the paper.

## refs

- Wikipedia search entry for ChaCha20 流密码. https://zh.wikipedia.org/w/index.php?search=ChaCha20%20%E6%B5%81%E5%AF%86%E7%A0%81
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[C=E_K(P;r),\qquad P=D_K(C)\]

ChaCha20: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
