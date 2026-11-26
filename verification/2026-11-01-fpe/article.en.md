# Format-Preserving Encryption

## principle

**Algorithm**: Format-Preserving Encryption (FPE 格式保留加密). The 2016 edition of SP 800-38G says format-preserving encryption "is designed for data that is not necessarily binary": for any finite set of symbols such as decimal numerals, the encrypted form "has the same format, including the length, as the original data". The document calls the symbol set an alphabet, its size the radix (at least 2), a non-negative integer below the base a numeral, and a finite ordered sequence of them a numeral string.

## why

Ordinary encryption changes length or character set. The document uses the nine-decimal-digit Social Security number as its example: a longer ciphertext would no longer fit the format. So "FPE facilitates the targeting of encryption to sensitive information, as well as the retrofitting of encryption technology to legacy applications", with applications including financial-information security, data sanitization and transparent encryption of fields in legacy databases.

## used

The Recommendation (March 2016, with updates of 4 August 2016) provides the FF1 and FF3 modes, Algorithms 7 to 10 for encryption and decryption. Section 4.3 requires an approved block cipher with a 128-bit block: "Currently, the AES block cipher, with key lengths of 128, 192, or 256 bits, is the only block cipher that fits this profile". Section 4.5 states that ten rounds are specified for FF1 and eight for FF3, and §4.4 with Appendix C strongly recommend variable tweaks.

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

Appendix A notes that "encrypted data may be vulnerable to guessing attacks" when the input space is small, suggesting that radix raised to minlen should generally reach at least one million to limit guessing, and requiring that value to be at least 100 "in order to preclude a generic meet-in-the-middle attack on the Feistel structure". Section 6 states that component functions such as the PRF are "not approved for use independent of these four functions", and a footnote in §2 warns that sanitization "does not necessarily provide strong assurance that individuals cannot be re-identified".

## history

SP 800-38G, by Morris Dworkin, was published in March 2016 with updates as of 4 August 2016. Section 2 records the removal of the FF2 mode from the draft: NIST was advised by the National Security Agency in general terms that FF2 in the draft "did not provide the expected 128 bits of security strength", and announced its removal.

## refs

- Wikipedia search entry for FPE 格式保留加密. https://zh.wikipedia.org/w/index.php?search=FPE%20%E6%A0%BC%E5%BC%8F%E4%BF%9D%E7%95%99%E5%8A%A0%E5%AF%86
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[C=E_K(P;r),\qquad P=D_K(C)\]

Format-Preserving Encryption: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
