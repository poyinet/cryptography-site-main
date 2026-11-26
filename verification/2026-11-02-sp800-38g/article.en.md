# NIST SP 800-38G Methods for Format-Preserving Encryption

## principle

**Standard**: NIST SP 800-38G Format-Preserving Encryption Modes (NIST SP 800-38G 格式保留加密模式). The abstract gives methods and placement: "This Recommendation specifies two methods, called FF1 and FF3, for format-preserving encryption." and their relation to a cipher: "Both of these methods are modes of operation for an underlying, approved symmetric-key block cipher algorithm." Ciphertext keeps the plaintext’s format — length and alphabet.

## why

The motivation is in §2: format-preserving encryption is "designed for data that is not necessarily binary" and "FPE facilitates the targeting of encryption to sensitive information, as well as the retrofitting of encryption technology to legacy applications", where fields cannot easily change length or format. The keyword line is an index entry, not an argument: "Block cipher; confidentiality; encryption; FF1; FF3; format-preserving encryption".

## used

In use, FF1/FF3 are invoked over an approved block cipher; the conformance-testing section wires it into the validation framework, and the abstract requires "an underlying, approved symmetric-key block cipher algorithm", which in implementations means AES.

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

The first limit is the construction: both modes are Feistel permutations over digit strings in a fixed radix built on "an underlying, approved symmetric-key block cipher algorithm", not arbitrary formats. The second is the two registers of the parameter floors: Appendix A requires radix^minlen to be at least 100 to preclude a generic meet-in-the-middle attack, while the larger figure — "the value radix minlen should generally be at least one million" — is stated as suggested rather than required.

## history

The version marks are on the title page: the date line "March 2016", the citation "Spec. Publ. 800-38G, 28 pages (March 2016)", and the masthead note "INCLUDES UPDATES AS OF 08-04-2016: PAGE I" — the edition carrying the patent-disclosure note added on 4 August 2016. §2 records one more piece of history: a third mode, FF2 (submitted as VAES3), was in the initial draft and removed after public review.

## refs

- Wikipedia search entry for NIST SP 800-38G 格式保留加密模式. https://zh.wikipedia.org/w/index.php?search=NIST%20SP%20800-38G%20%E6%A0%BC%E5%BC%8F%E4%BF%9D%E7%95%99%E5%8A%A0%E5%AF%86%E6%A8%A1%E5%BC%8F
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[S=\min_i S_i,\quad S_i\in\{\text{密钥强度},\text{分组安全},\text{实现安全}\}\]

NIST SP 800-38G Format-Preserving Encryption Modes: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
