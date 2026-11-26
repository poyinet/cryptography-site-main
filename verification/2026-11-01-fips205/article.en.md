# Stateless Hash-Based Digital Signature Standard (SLH-DSA)

## principle

**Standard**: Stateless Hash-Based Digital Signature Standard (SLH-DSA) (无状态散列基数字签名标准（FIPS 205）). FIPS 205 approves parameter sets for hash-based signatures: "This standard specifies several parameter sets for SLH-DSA that are approved for use. Additional parameter sets may be specified and approved in future NIST Special Publications." — approval extends only as far as the listed sets.

## why

It rests on hash assumptions: clause 1 states "The security of the stateless hash-based digital signature algorithm (SLH-DSA) relies on the presumed difficulty of finding preimages for hash functions as well as several related properties of the same hash functions." and separates itself from the incumbent — "Unlike the algorithms specified in FIPS 186-5 …, SLH-DSA is designed to provide resistance against attacks from a large-scale quantum computer."

## used

The operational constraint matches the other signature standards: "Agencies are advised that digital signature key pairs shall not be used for other purposes." What the document itself says is structural: clause 3 states "Conceptually, an SLH-DSA key pair consists of a very large set of FORS key pairs." and characterises FORS as "a few-time signature scheme", adding that "The few-time signature scheme FORS allows each key pair to safely sign a small number of messages." — the standard supplies construction and parameter limits, without adding a separate prohibition on other uses.

## broken

First limit: whole-system security remains the deployer’s duty — "The responsible authority in each agency or department shall ensure that an overall implementation provides an acceptable level of security." Second, the approval scope is open-ended in one direction only: new parameter sets are left to "future NIST Special Publications", so this document promises no coverage of future forms.

## history

The announcement line is "Announcing the Stateless Hash-Based Digital Signature Standard", with number and name in the explanation clause and the standing authority sentence "Federal Information Processing Standards (FIPS) publications are developed by the National Institute of Standards and Technology (NIST) under 15 U.S.C. 278g-3 and issued by the Secretary of Commerce under 40 U.S.C. 11331." It was published with FIPS 203 and 204, and the abstract gives its lineage — "SLH-DSA is based on SPHINCS+, which was selected for standardization as part of the NIST Post-Quantum Cryptography Standardization process." The stateful branch is handled elsewhere, by SP 800-208, "Recommendation for Stateful Hash-Based Signature Schemes"; inside this standard the components are not approved stand-alone schemes, so modules should not expose WOTS+, XMSS, FORS and hypertree interfaces.

## refs

- Wikipedia search entry for 无状态散列基数字签名标准（FIPS 205）. https://zh.wikipedia.org/w/index.php?search=%E6%97%A0%E7%8A%B6%E6%80%81%E6%95%A3%E5%88%97%E5%9F%BA%E6%95%B0%E5%AD%97%E7%AD%BE%E5%90%8D%E6%A0%87%E5%87%86%EF%BC%88FIPS%20205%EF%BC%89
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/
- NIST FIPS 205: SLH-DSA. https://csrc.nist.gov/pubs/fips/205/final
- Published standard/RFC for 无状态散列基数字签名标准（FIPS 205）. https://csrc.nist.gov/pubs/fips/205/final

## example

**Formal model and reproduction steps**

\[S=\min_i S_i,\quad S_i\in\{\text{密钥强度},\text{分组安全},\text{实现安全}\}\]

Stateless Hash-Based Digital Signature Standard (SLH-DSA): the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
