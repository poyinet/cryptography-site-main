# Recommendation for Key Derivation Using Pseudorandom Functions

## principle

**Standard**: Recommendation for Key Derivation Using Pseudorandom Functions (基于 PRF 的密钥派生). The mechanism is expanding one already-held key into several: "This Recommendation specifies techniques for the derivation of additional keying material from a secret key … using pseudorandom functions: HMAC, CMAC, and KMAC." The omitted clause bounds the input — "either established through a key-establishment scheme or shared through some other manner". This is a description of a withdrawn text.

## why

The rationale is key-reuse pressure, stated minimally in §1: "When a party obtains a cryptographic key, additional keys will often be needed." §3 gives the input shape — the fixed input data is "a concatenation of a Label, a separation indicator 0x00, the Context, and [L]2" — label, separator, context and output length; omitting the context is exactly how two derivations become indistinguishable.

## used

The status comes first: the banner at the head of the file states "The attached publication has been withdrawn (archived), and is provided solely for historical purposes." — the live document is SP 800-108r1-upd1 (Chen, February 2024). While this text was current, its inputs came from the three routes §2 lists: keys established under SP 800-56A and SP 800-56B, and keys previously generated.

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

The first limit is currency: the banner records a withdrawal date of 2 February 2024 with SP 800-108r1-upd1 as the update, so implementing from this text today means citing a withdrawn publication; the current requirements must be read in the update, whose contents are not in this corpus and are therefore not asserted here. The second limit is scope: it specifies KDF structures, not the security of the key establishment feeding them, and it does not fix the label and context values a protocol must choose.

## history

Four dates are inside the file: Appendix A states "The original version of this document was published in November 2008."; the banner page gives the supersession line "Supersedes NIST Special Publication 800-108 (October 2009)" with the Revision 1 date August 2022, and the withdrawal date 2 February 2024 naming SP 800-108r1-upd1 as the update. The author line is Lily Chen.

## refs

- Wikipedia search entry for 基于 PRF 的密钥派生. https://zh.wikipedia.org/w/index.php?search=%E5%9F%BA%E4%BA%8E%20PRF%20%E7%9A%84%E5%AF%86%E9%92%A5%E6%B4%BE%E7%94%9F
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[S=\min_i S_i,\quad S_i\in\{\text{密钥强度},\text{分组安全},\text{实现安全}\}\]

Recommendation for Key Derivation Using Pseudorandom Functions: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
