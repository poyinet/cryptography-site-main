# Security Requirements for Cryptographic Modules (FIPS 140-3)

## principle

**Standard**: Security Requirements for Cryptographic Modules (FIPS 140-3) (密码模块安全要求（FIPS 140-3）). FIPS 140-3 places itself in its explanation clause: "This standard specifies the security requirements that will be satisfied by a cryptographic module utilized within a security system protecting sensitive but unclassified information", and states the grading at once — "The standard provides four increasing, qualitative levels of security: Level 1, Level 2, Level 3, and Level 4." What is regulated is the module, not a single algorithm.

## why

Why a module standard at all: a correct algorithm does not imply a safe implementation, so the requirements span the whole design-and-operation chain. The abstract lists the scope: "These areas include cryptographic module specification; cryptographic module interfaces; roles, services, and authentication; software/firmware security; operating environment; physical security; non-invasive security; sensitive security parameter management; self-tests; life-cycle assurance; and mitigation of other attacks."

## used

Applicability sits in clause 6: "This standard shall be used in designing and implementing cryptographic modules that Federal departments and agencies operate or are operated for them under contract." That clause leaves two exits — "Cryptographic modules that have been approved for classified use may be used in lieu of modules that have been validated against this standard." and "The adoption and use of this standard is available to private and commercial organizations." Conforming modules must use approved pieces: §10 "Cryptographic modules that conform to this standard shall employ Approved security functions such as cryptographic algorithms, cryptographic key management techniques, and authentication techniques that have been approved for protecting Federal government sensitive information."

## broken

Two limits are legible in the text. It is a federal procurement and validation instrument: the standard frames its use as "a security system protecting sensitive but unclassified information", and clause 6 offers two exits — "Cryptographic modules that have been approved for classified use may be used in lieu of modules that have been validated against this standard." and "The adoption and use of this standard is available to private and commercial organizations." Conformance is expressed through validation: "The Cryptographic Module Validation Program (CMVP) validates cryptographic modules to Federal Information Processing Standard (FIPS) 140-3 and other cryptography-based standards." and "Cryptographic modules that are validated under the CMVP will be considered as conforming to this standard."

## history

The version relationship is on the title page and in the explanation: the title page carries "(Supersedes FIPS PUB 140-2)" and the date line reads "Federal Information Processing Standards Publication 140-3 March 22, 2019"; the body states "This standard supersedes FIPS 140-2, Security Requirements for Cryptographic Modules, in its entirety." The keyword line also names the parallel international documents — "ISO/IEC 19790; ISO/IEC 24759".

## refs

- Wikipedia search entry for 密码模块安全要求（FIPS 140-3）. https://zh.wikipedia.org/w/index.php?search=%E5%AF%86%E7%A0%81%E6%A8%A1%E5%9D%97%E5%AE%89%E5%85%A8%E8%A6%81%E6%B1%82%EF%BC%88FIPS%20140-3%EF%BC%89
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/
- NIST FIPS 140-3: Security Requirements for Cryptographic Modules. https://csrc.nist.gov/pubs/fips/140-3/final
- Published standard/RFC for 密码模块安全要求（FIPS 140-3）. https://csrc.nist.gov/pubs/fips/140-3/final

## example

**Formal model and reproduction steps**

\[S=\min_i S_i,\quad S_i\in\{\text{密钥强度},\text{分组安全},\text{实现安全}\}\]

Security Requirements for Cryptographic Modules (FIPS 140-3): the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
