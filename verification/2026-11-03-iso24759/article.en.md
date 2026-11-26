# ISO/IEC 24759 Testing Requirements for Cryptographic Modules

## principle

**Standard**: Test requirements for cryptographic modules (密码模块测试要求). The attestable first-hand fact is the relationship printed in FIPS 140-3: "The testing for these requirements will be in accordance with ISO/IEC 24759:2017(E)" - the same sentence then allows a validation authority to modify, add to or delete vendor evidence and testing. So where the 19790 line carries security requirements, 24759 carries the testing: it does not restate algorithm requirements, it specifies how conformance is tested.

## why

Why a separate testing document: the keyword line of FIPS 140-3 prints the two ISO companions side by side, "Federal Information Processing Standard (FIPS); ISO/IEC 19790; ISO/IEC 24759." and the body separates the requirement text from who performs testing: "accredited laboratories perform cryptographic module compliance/conformance testing." (in the retained file this phrase follows the NVLAP parenthetical) Splitting requirements from accredited test procedure is what lets one set of module requirements be applied consistently across laboratories.

## used

Use sits in the validation chain, stated in §1 and listed in §12: modules are assessed against the national requirements while the testing path comes from this document, and FIPS 140-3 expressly permits annex modifications by the validation authority - it says it "includes modifications of the Annexes" and its contents list carries a section titled "Documents Modifying ISO/IEC 24759:2017(E)". The point is that amendments are registered one by one and are therefore checkable rather than implicit.

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

The first limit is evidentiary: the ISO/IEC 24759 text is not retained in this workspace, so this entry rests on FIPS 140-3's account alone and asserts nothing about clause numbers, test items or verdict rules. The second is a version discrepancy: the retained text names "ISO/IEC 24759:2017(E)" while the catalog row's citation title reads ISO/IEC 24759:2025. Against the retained document that year needs separate attestation; it is therefore logged as an outstanding item rather than silently amended, since a title change has to go through the overlay layer and moves the row's entryHash.

## history

The lineage comes from the retained dates and pairings: FIPS 140-3 prints "Federal Information Processing Standards Publication 140-3 March 22, 2019", aligns with ISO/IEC 19790:2012(E) and names ISO/IEC 24759:2017(E) for testing - the international editions came first, and the national third edition aligned to them while reserving annex modifications. Retrieval and DOI lines stay outside the quotes per house rule and never enter the article text.

## refs

- Wikipedia search entry for 密码模块测试要求. https://zh.wikipedia.org/w/index.php?search=%E5%AF%86%E7%A0%81%E6%A8%A1%E5%9D%97%E6%B5%8B%E8%AF%95%E8%A6%81%E6%B1%82
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[S=\min_i S_i,\quad S_i\in\{\text{密钥强度},\text{分组安全},\text{实现安全}\}\]

Test requirements for cryptographic modules: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
