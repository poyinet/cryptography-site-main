# ISO/IEC 19790 Security Requirements for Cryptographic Modules

## principle

**Standard**: Security requirements for cryptographic modules (密码模块安全要求). The positioning fact this entry can attest is printed in §1 of FIPS 140-3: "FIPS 140-3 supersedes FIPS140-2. FIPS 140-3 aligns with ISO/IEC 19790:2012(E) and includes modifications of the Annexes that are allowed to CMVP (as a validation authority)." The operative word is aligns, not replaces: the international and national requirements correspond clause by clause, with annex modifications reserved for the national validation authority.

## why

Why an international edition exists is implied by the division of labour the same section prints: "The testing for these requirements will be in accordance with ISO/IEC 24759:2017(E)" - requirements come from the 19790 line and the testing procedure from ISO/IEC 24759, with the permitted modifications stated alongside. Alignment lets one set of module requirements enter international recognition instead of each jurisdiction maintaining incomparable criteria.

## used

The decision rule is printed in the security-level sentence: "must be chosen to provide a level of security appropriate for the security requirements of the application and environment" Levels are not maximised but matched to the deployment, and validation proceeds against the aligned requirements, which is how procurement and compliance assessment read them.

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

Three limits follow from alignment itself. First, aligning is not identity: the sentence says aligns with and explicitly carries annex modifications, so validating against the national FIPS is not automatically clause-for-clause validation against the international edition. Second, this entry rests on FIPS 140-3's account; the ISO/IEC 19790 text is not retained in this workspace, so its internal clause numbers and annex structure are asserted nowhere. Third, the testing path depends on a separate document (24759), so the requirements text alone cannot settle a validation judgement.

## history

The lineage is the two version relations printed in the front matter: FIPS 140-3 supersedes FIPS 140-2 and aligns with the 2012 international edition, printed as ISO/IEC 19790:2012(E), while testing is named against ISO/IEC 24759:2017(E). The cover dates FIPS 140-3 to March 2019; header and retrieval lines are restated outside quotes per house rule. The timeline shows the international module requirements came first and the national third edition aligned to it, not the reverse.

## refs

- Wikipedia search entry for 密码模块安全要求. https://zh.wikipedia.org/w/index.php?search=%E5%AF%86%E7%A0%81%E6%A8%A1%E5%9D%97%E5%AE%89%E5%85%A8%E8%A6%81%E6%B1%82
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[S=\min_i S_i,\quad S_i\in\{\text{密钥强度},\text{分组安全},\text{实现安全}\}\]

Security requirements for cryptographic modules: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
