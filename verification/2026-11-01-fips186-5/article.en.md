# Digital Signature Standard (FIPS 186-5)

## principle

**Standard**: Digital Signature Standard (FIPS 186-5) (数字签名标准（FIPS 186-5）). The job is stated in §1: "This standard defines methods for digital signature generation that can be used for the protection of binary data (commonly called a message) and for the verification and validation of those digital signatures." and the count is fixed: "Three techniques are approved."

## why

Only two of the three techniques lean on an outside specification — RSA on RFC 8017/PKCS #1 and EdDSA on RFC 8032: §1 records "The RSA digital signature algorithm is specified in the Internet Engineering Task Force Request for Comments (IETF RFC) 8017 [1] and was previously specified in Public Key Cryptography Standard (PKCS) #1 [2]", with FIPS 186-5 approving "the use of implementations of either or both of these standards" while specifying "key pair generation, as well as additional requirements", while ECDSA is stated as "The Elliptic Curve Digital Signature Algorithm (ECDSA) is specified in this standard." and the third is "The Edwards Curve Digital Signature Algorithm (EdDSA) is specified in IETF RFC 8032 [6]." The explanation clause of the announcement block also anticipates growth — "In the future, additional digital signature schemes may be specified and approved in FIPS publications or in NIST Special Publications."

## used

The use is signing and verifying for federal systems, with one explicit advisory on keys: "Agencies are advised that digital signature key pairs shall not be used for other purposes." — the sentence names no specific alternative use, only "other purposes", and recurs verbatim in the notices of 186-5, 204 and 205.

## broken

The limit is stated bluntly: conformance is not system security — "the use of a product containing an implementation that conforms to this standard does not guarantee the security of the overall system in which the product is used. The responsible authority in each agency or department shall ensure that an overall implementation provides an acceptable level of security." The judgement stays with the deploying authority, not the document.

## history

Version and dating are at the head: the date line reads "Federal Information Processing Standards Publication 186-5 Published: February 3, 2023", the name line "Digital Signature Standard (DSS) (FIPS 186-5)", and the explanation clause of the announcement block closes the replacement in one sentence — "This standard supersedes FIPS 186-4." — while §1 retires DSA: "The Digital Signature Algorithm (DSA) is no longer specified in this standard and may only be used to verify previously generated digital signatures."

## refs

- Wikipedia search entry for 数字签名标准（FIPS 186-5）. https://zh.wikipedia.org/w/index.php?search=%E6%95%B0%E5%AD%97%E7%AD%BE%E5%90%8D%E6%A0%87%E5%87%86%EF%BC%88FIPS%20186-5%EF%BC%89
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/
- NIST FIPS 186-5: Digital Signature Standard. https://csrc.nist.gov/pubs/fips/186-5/final
- Published standard/RFC for 数字签名标准（FIPS 186-5）. https://csrc.nist.gov/pubs/fips/186-5/final

## example

**Formal model and reproduction steps**

\[S=\min_i S_i,\quad S_i\in\{\text{密钥强度},\text{分组安全},\text{实现安全}\}\]

Digital Signature Standard (FIPS 186-5): the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
