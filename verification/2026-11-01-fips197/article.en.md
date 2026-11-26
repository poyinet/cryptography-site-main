# Advanced Encryption Standard (FIPS 197)

## principle

**Standard**: Advanced Encryption Standard (FIPS 197) (高级加密标准（FIPS 197）). The explanation clause of FIPS 197 defines it in one sentence: "The Advanced Encryption Standard (AES) … a FIPS-approved cryptographic algorithm that can be used to protect electronic data." It adds "The AES algorithm is a symmetric block cipher that can encrypt (encipher) and decrypt (decipher) digital information." and pins the parameters: "The AES algorithm is capable of using cryptographic keys of 128, 192, and 256 bits to encrypt and decrypt data in blocks of 128 bits."

## why

The origin is in the abstract: "In 2000, NIST announced the selection of the Rijndael block cipher family as the winner of the Advanced Encryption Standard (AES) competition." — the outcome of an open competition rather than an internal designation; the abstract also notes that block ciphers underpin many cryptographic services.

## used

The structural vocabulary is narrow: §3.5 defines words and blocks — "A word is a sequence of four bytes; a block consists of four words." The implementation duty is stated as "An implementation of the AES algorithm shall support at least one of the three key lengths … 128, 192, or 256 bits (i.e., Nk = 4, 6, or 8, respectively)." while the other sizes stay optional: "Implementations may optionally support two or three key lengths, which may promote the interoperability of algorithm implementations."

## broken

FIPS 197 covers the algorithm only: clause 8 requires that "The algorithm shall be used in conjunction with a FIPS-approved or NIST-recommended mode of operation.", leaving modes and operation to other documents. §6.3 fixes this edition’s parameters — "the allowed values for the key length (Nk), block size (Nb), and number of rounds (Nr)" — but the very next sentence keeps the future open: "However, future revisions of this Standard could include changes or additions to the allowed values for those parameters." What is closed is this edition, not later ones.

## history

The identity and authority sit at the head of the file: the name line is "Advanced Encryption Standard (AES) (FIPS 197)", the category line reads "Computer Security Standard, Cryptography", approval is stated as "4. Approving Authority. Secretary of Commerce." with maintenance at NIST’s Information Technology Laboratory; the copy read here is the 2023 upd1 revision, whose abstract still dates the selection to 2000; the revision note at the end of the file records an editorial update: the original 197 was reviewed under NIST’s Crypto Publication Review Board, and public comments plus the AES security analyses in NIST IR 8319 were the basis for the decision to keep the technical specifications unchanged.

## refs

- Wikipedia search entry for 高级加密标准（FIPS 197）. https://zh.wikipedia.org/w/index.php?search=%E9%AB%98%E7%BA%A7%E5%8A%A0%E5%AF%86%E6%A0%87%E5%87%86%EF%BC%88FIPS%20197%EF%BC%89
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/
- NIST FIPS 197: Advanced Encryption Standard (AES). https://csrc.nist.gov/pubs/fips/197/final
- Published standard/RFC for 高级加密标准（FIPS 197）. https://csrc.nist.gov/pubs/fips/197/final

## example

**Formal model and reproduction steps**

\[S=\min_i S_i,\quad S_i\in\{\text{密钥强度},\text{分组安全},\text{实现安全}\}\]

Advanced Encryption Standard (FIPS 197): the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
