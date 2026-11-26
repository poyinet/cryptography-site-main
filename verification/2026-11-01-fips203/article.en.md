# Module-Lattice-Based Key-Encapsulation Mechanism Standard (ML-KEM)

## principle

**Standard**: Module-Lattice-Based Key-Encapsulation Mechanism Standard (ML-KEM) (模块格基密钥封装机制标准（FIPS 203）). FIPS 203 states its mechanism class: "This standard specifies a set of algorithms for establishing a shared secret key. While there are many methods for establishing a shared secret key, the particular method described in this standard is a key-encapsulation mechanism (KEM)." — a KEM, not key management in general.

## why

Parameterisation exists for trade-offs: §1.1 states "This standard specifies three parameter sets for ML-KEM that offer different trade-offs in security strength versus performance." and fixes both the safety premise and the approval scope — "At present, ML-KEM is believed to be secure, even against adversaries who possess a quantum computer." and "All three parameter sets of ML-KEM are approved to protect sensitive, non-classified communication systems of the U.S. Federal Government."

## used

The applicability clause is the use statement: "This standard, or other FIPS or NIST Special Publications that specify alternative mechanisms, shall be used wherever the establishment of a shared secret key … is required for federal applications", under the name "Module-Lattice-Based Key-Encapsulation Mechanism Standard (FIPS 203)" and the category line "Computer Security. Subcategory. Cryptography."

## broken

Two limits: conformance is not system security — "the use of a product containing an implementation that conforms to this standard does not guarantee the security of the overall system in which the product is used." — the qualification clause adds that "the security guarantees of a KEM only hold under certain conditions" — and the waiver door is shut: "The Federal Information Security Management Act (FISMA) does not allow for waivers to Federal Information Processing Standards (FIPS) that are made mandatory by the Secretary of Commerce."

## history

Identity and legal basis appear together at the head: the announcement line is "Announcing the Module-Lattice-Based Key-Encapsulation Mechanism Standard" and the authority sentence "Federal Information Processing Standards (FIPS) publications are developed by the National Institute of Standards and Technology (NIST) under 15 U.S.C. 278g-3 and issued by the Secretary of Commerce under 40 U.S.C. 11331." This is one of NIST’s post-quantum FIPS publications; the document itself only lists the CRYSTALS-Kyber submission in its references, so the candidate-to-standard lineage is carried by the algorithm and event entries reviewed in round R4 and is noted here as outside this document’s own wording.

## refs

- Wikipedia search entry for 模块格基密钥封装机制标准（FIPS 203）. https://zh.wikipedia.org/w/index.php?search=%E6%A8%A1%E5%9D%97%E6%A0%BC%E5%9F%BA%E5%AF%86%E9%92%A5%E5%B0%81%E8%A3%85%E6%9C%BA%E5%88%B6%E6%A0%87%E5%87%86%EF%BC%88FIPS%20203%EF%BC%89
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/
- NIST FIPS 203: ML-KEM. https://csrc.nist.gov/pubs/fips/203/final
- Published standard/RFC for 模块格基密钥封装机制标准（FIPS 203）. https://csrc.nist.gov/pubs/fips/203/final

## example

**Formal model and reproduction steps**

\[S=\min_i S_i,\quad S_i\in\{\text{密钥强度},\text{分组安全},\text{实现安全}\}\]

Module-Lattice-Based Key-Encapsulation Mechanism Standard (ML-KEM): the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
