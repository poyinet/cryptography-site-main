# Module-Lattice-Based Digital Signature Standard (ML-DSA)

## principle

**Standard**: Module-Lattice-Based Digital Signature Standard (ML-DSA) (模块格基数字签名标准（FIPS 204）). FIPS 204 defines a lattice-based signature algorithm: the abstract opens with "This standard specifies ML-DSA, a set of algorithms that can be used to generate and verify digital signatures. ML-DSA is believed to be secure, even against adversaries in possession of a large-scale quantum computer." and clause 3 words the same object as "a lattice-based digital signature algorithm for applications that require a digital signature rather than a written signature." The title line names it "Module-Lattice-Based Digital Signature Standard". The approval definition is given in general terms — "An algorithm or technique that is either 1) specified in a FIPS or NIST recommendation, 2) adopted in a FIPS or NIST recommendation, or 3) specified in a list of NIST-approved security functions."

## why

The reason it exists is stated in clause 1 and its context subsection: many public-key systems "will be at risk if large-scale quantum computers are ever realized", including "key-establishment schemes and digital signatures that are based on integer factorization and discrete logarithms"; the replacement here is "the Module-Lattice-Based Digital Signature Algorithm (ML-DSA), which is based on the Module Learning With Errors problem" and "is believed to be strongly unforgeable".

## used

The operational boundary is key-pair exclusivity: "Agencies are advised that digital signature key pairs shall not be used for other purposes." The same advisory as FIPS 186-5 recurs here, again naming only "other purposes" rather than any specific reuse.

## broken

The limits match the companion documents: conformance does not secure the whole system — "the use of a product containing an implementation that conforms to this standard does not guarantee the security of the overall system in which the product is used. The responsible authority in each agency or department shall ensure that an overall implementation provides an acceptable level of security." — and mandatory FIPS carry no waiver — "The Federal Information Security Management Act (FISMA) does not allow for waivers to Federal Information Processing Standards (FIPS) that are made mandatory by the Secretary of Commerce." — placing responsibility on the deploying authority and validation process.

## history

The identity line is "Announcing the Module-Lattice-Based Digital Signature Standard", with name and number given as "Module-Lattice-Based Digital Signature Standard (FIPS 204)" under the category line "Computer Security. Subcategory. Cryptography." It was published with FIPS 203 and 205 in 2024 as the signature leg of NIST’s three post-quantum standards — a co-publication fact verifiable across the R5B document set already checked in this round.

## refs

- Wikipedia search entry for 模块格基数字签名标准（FIPS 204）. https://zh.wikipedia.org/w/index.php?search=%E6%A8%A1%E5%9D%97%E6%A0%BC%E5%9F%BA%E6%95%B0%E5%AD%97%E7%AD%BE%E5%90%8D%E6%A0%87%E5%87%86%EF%BC%88FIPS%20204%EF%BC%89
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/
- NIST FIPS 204: ML-DSA. https://csrc.nist.gov/pubs/fips/204/final
- Published standard/RFC for 模块格基数字签名标准（FIPS 204）. https://csrc.nist.gov/pubs/fips/204/final

## example

**Formal model and reproduction steps**

\[S=\min_i S_i,\quad S_i\in\{\text{密钥强度},\text{分组安全},\text{实现安全}\}\]

Module-Lattice-Based Digital Signature Standard (ML-DSA): the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
