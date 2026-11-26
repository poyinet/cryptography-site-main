# Recommendation for Block Cipher Modes of Operation

## principle

**Standard**: Recommendation for Block Cipher Modes of Operation (分组密码工作模式建议). The abstract enumerates the five confidentiality modes: "This recommendation defines five confidentiality modes of operation for use with an underlying symmetric key block cipher algorithm: Electronic Codebook (ECB), Cipher Block Chaining (CBC), Cipher Feedback (CFB), Output Feedback (OFB), and Counter (CTR)." No new algorithm is defined — only ways to run one.

## why

The purpose is one sentence: §1 reads "This publication provides recommendations regarding modes of operation to be used with symmetric key block cipher algorithms." The abstract states what the five modes do — "The five modes--the Electronic Codebook (ECB), Cipher Block Chaining (CBC), Cipher Feedback (CFB), Output Feedback (OFB), and Counter (CTR) modes--can provide data confidentiality." The document adds no further rationale for needing several modes; it does this one job.

## used

Its use is as a validation basis — the conformance-testing paragraph inside §2 (Authority) reads: "Conformance testing for implementations of the modes of operation that are specified in this recommendation will be conducted within the framework of the Cryptographic Module Validation Program (CMVP), a joint effort of the NIST and the Communications Security Establishment of the Government of Canada." Once a mode is chosen, implementations are checked against this recommendation.

## broken

The first limit is scope: the abstract confines the offering to confidentiality, and no authenticated-encryption mode appears in this document. The second is authority: §2 states "Nor should this recommendation be interpreted as altering or superseding the existing authorities of the Secretary of Commerce, the Director of the Office of Management and Budget, or any other Federal official." It neither changes existing mandates nor reaches national security systems.

## history

The citation line reads "Natl. Inst. Stand. Technol. Spec. Publ. 800-38A 2001 ED, 66 pages (December 2001)". §2 records the earlier arrangements: "FIPS Pub. 81 [4] specifies the ECB, CBC, CFB, and OFB modes of the Data Encryption Standard (DES)." plus FIPS 46-3 for the seven Triple DES modes. The document never claims to supersede FIPS 81; it positions itself under the existing authorities.

## refs

- Wikipedia search entry for 分组密码工作模式建议. https://zh.wikipedia.org/w/index.php?search=%E5%88%86%E7%BB%84%E5%AF%86%E7%A0%81%E5%B7%A5%E4%BD%9C%E6%A8%A1%E5%BC%8F%E5%BB%BA%E8%AE%AE
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[S=\min_i S_i,\quad S_i\in\{\text{密钥强度},\text{分组安全},\text{实现安全}\}\]

Recommendation for Block Cipher Modes of Operation: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
