# Counter with CBC-MAC (CCM)

## principle

**Algorithm**: Counter with CBC-MAC (CCM 计数器 CBC 模式). CCM's construction reuses one key across both primitives, printed in §5.2 as the same key: "The same key, K, is used for both the CTR and CBC-MAC mechanisms within CCM.". It protects two kinds of input: "The data that CCM protects consists of a message, i.e., a bit string, called the payload, denoted P, of bit length denoted Plen, and a bit string, called the associated data" - the payload is encrypted, the associated data is only authenticated, and both enter the MAC.

## why

Why combine them: §3 specifies CCM as a pairing of processes - "CCM consists of two related processes: generation-encryption and decryption-verification, which combine two cryptographic primitives". One block cipher therefore delivers both confidentiality and authenticity instead of two separate machinery sets, and the shared-key sentence in §5.2 is how that choice is realised.

## used

The deployment motive is stated in §3 as interoperability: "This specification of CCM is intended to be compatible with the use of CCM within the draft amendment [4] to the IEEE Standard 802.11 for wireless local area networks [5]." The recommendation exists to align with how CCM was already used in wireless LAN standardisation. Truncation is a mandatory design decision, stated in Appendix B: "The length, Tlen, of the MAC within CCM is an important security parameter."

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

The limits hang on two parameters. Nonce uniqueness: the document requires "a unique value, called a nonce, that is assigned to the payload and the associated data" - repeating it puts both the confidentiality and the authenticity of the combined mode at risk. Tag length: since Tlen is named "an important security parameter", truncating it hard is a self-inflicted reduction of authentication strength, not a harmless byte saving.

## history

Version facts: the document presents itself as part of the block cipher modes series and grounds its motive in compatibility with the IEEE 802.11 draft amendment (quoted from §1). The retained copy is dated May 2004. So CCM was already in use in wireless standardisation before it became a federal recommendation; this publication generalises an existing combined construction rather than inventing one. Header furniture is restated outside quotes per house rule.

## refs

- Wikipedia search entry for CCM 计数器 CBC 模式. https://zh.wikipedia.org/w/index.php?search=CCM%20%E8%AE%A1%E6%95%B0%E5%99%A8%20CBC%20%E6%A8%A1%E5%BC%8F
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[C=E_K(P;r),\qquad P=D_K(C)\]

Counter with CBC-MAC: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
