# The Keyed-Hash Message Authentication Code (HMAC)

## principle

**Standard**: The Keyed-Hash Message Authentication Code (HMAC) (键控散列消息认证码（FIPS 198-1）). The abstract defines the object: "This Standard describes a keyed-hash message authentication code (HMAC), a mechanism for message authentication using cryptographic hash functions." The abstract also gives the operating condition — "HMAC can be used with any iterative Approved cryptographic hash function, in combination with a shared secret key."

## why

Why a MAC construction: the standard states the goal as "The purpose of a MAC is to authenticate both the source of a message and its integrity without the use of any additional mechanisms." and notes that HMAC has two functionally separate inputs — "HMACs have two functionally distinct parameters, a message input and a secret key known only to the message originator and intended receiver(s)."

## used

The usage shape is sender-computed and sent with the message: "An HMAC function is used by the message sender to produce a value (the MAC) that is formed by condensing the secret key and the message input." The standard also names another application — "Additional applications of keyed-hash functions include their use in challenge-response identification protocols for computing responses, which are a function of both a secret key and a challenge message.".

## broken

The boundary is set by sources, versions and implementation conditions: unregistered dates, quantities and roles are not filled in; parameters from different versions are not mixed; algorithm proofs do not replace side-channel and error-handling checks.

## history

Identity and dating are at the head: the name line reads "The Keyed-Hash Message Authentication Code (HMAC) (FIPS PUB 198-1)", the date line is July 2008 and the category line "Computer Security Standard. Subcategory. Cryptography." Keywords listed are "computer security, cryptography, HMAC, MAC, message authentication, Federal Information Processing Standards (FIPS)"; the -1 suffix marks this as the revision of FIPS 198, and clause 9 still points at "the list of Approved security functions for FIPS 140-2" — an anchoring in the FIPS 140-2 generation that FIPS 140-3 later supersedes in its entirety.

## refs

- Wikipedia search entry for 键控散列消息认证码（FIPS 198-1）. https://zh.wikipedia.org/w/index.php?search=%E9%94%AE%E6%8E%A7%E6%95%A3%E5%88%97%E6%B6%88%E6%81%AF%E8%AE%A4%E8%AF%81%E7%A0%81%EF%BC%88FIPS%20198-1%EF%BC%89
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/
- NIST FIPS 198-1: The Keyed-Hash Message Authentication Code. https://csrc.nist.gov/pubs/fips/198-1/final
- Published standard/RFC for 键控散列消息认证码（FIPS 198-1）. https://csrc.nist.gov/pubs/fips/198-1/final

## example

**Formal model and reproduction steps**

\[S=\min_i S_i,\quad S_i\in\{\text{密钥强度},\text{分组安全},\text{实现安全}\}\]

The Keyed-Hash Message Authentication Code (HMAC): the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
