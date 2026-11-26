# The CMAC Mode for Authentication

## principle

**Standard**: The CMAC Mode for Authentication (CMAC 认证模式). The abstract names the object in its first sentence: "This Recommendation specifies a message authentication code (MAC) algorithm based on a symmetric key block cipher." and the use in its second: "This block cipher-based MAC algorithm, called CMAC, may be used to provide assurance of the authenticity and, hence, the integrity of binary data." Clause 1 places it in the series: "This publication is the second Part in a series of Recommendations regarding modes of operation of symmetric key block ciphers." The keyword line carries authentication but no confidentiality: "KEY WORDS: authentication; block cipher; cryptography; information security; integrity; message authentication code; mode of operation." The document specifies MAC generation and verification, not encryption, and not how the key is established.

## why

The gap is an unusable existing construction: §3 states "The basic Cipher Block Chaining MAC algorithm (CBC-MAC) has security deficiencies [9]." and names the replacement: "The core of the CMAC algorithm is a variation of CBC-MAC that Black and Rogaway proposed and analyzed under the name XCBC in Ref. [2] and submitted to NIST in Ref. [1]." The improvement chain follows: "Iwata and Kurosawa proposed an improvement of XCBC and named the resulting algorithm One-Key CBC-MAC (OMAC) in Ref. [6] and in Ref. [5], their initial submission to NIST" and closes with "The OMAC1 variation efficiently reduces the key size of XCBC. CMAC is equivalent to OMAC1." The setting is stated separately: "CMAC may be appropriate for information systems in which an approved block cipher is more readily available than an approved hash function." The argument is a block-cipher-side authentication construction, not another hash-based MAC.

## used

The obligations sit in numbered sections at three wording levels. Section 5.2 constrains the cipher and the key with two shall requirements: "The underlying block cipher shall be approved, and the key shall be generated uniformly at random, or close to uniformly at random, i.e., so that each possible key is (nearly) equally likely to be generated." and "The key shall be secret and shall be used exclusively for the CMAC mode of the chosen block cipher." Establishing the key is advice only: "To fulfill the requirements on the key, the key should be established among the parties to the information within an approved key management structure". Appendix B puts a duty on the operating system: "For any system in which CMAC is implemented, the risk that an attacker can detect and exploit a collision shall be limited to a level that is appropriate to the value of the data." The levels separate cleanly: cipher and key carry shall duties, key establishment is should-level advice, and holding the collision risk to a level matched to the value of the data is left to the judgement of whoever deploys the system.

## broken

The four limits work at different levels. Section 2 draws the applicability line: "such standards and guidelines shall not apply to national security systems." Section 5.2 hands the key work over: "the details of the establishment and management of keys are outside the scope of this Recommendation." Appendix A.1 concedes the ceiling on assurance: "however, this assurance, as for any MAC algorithm, is not absolute." and conditions short tags: "A value of Tlen that is less than 64 shall only be used in conjunction with a careful analysis of the risks of accepting an inauthentic message as authentic." Appendix C is the plainest statement of what the algorithm does not do: "In some protocols an attacker may even be able to present to a verifier a message-MAC pair that the verifier itself generated earlier in the protocol." A valid MAC therefore does not identify whoever presented it, and replay defence is left to sequence numbers, timestamps or nonces in the protocol.

## history

The file opens with the NIST archive banner: "The attached publication has been archived (withdrawn), and is provided solely for historical purposes." The banner records the successor relationship, "The attached publication has been superseded by the following publication(s)", and the superseding entry keeps the same 800-38B number and part title with the author and date lines reading "M. Dworkin Publication Date(s): October 6, 2016"; the update note reads "SP 800-38B is updated by the October 6, 2016 release of 800-38B, which includes editorial changes (as of October 6, 2016)." The publication masthead itself reads "NIST Special Publication 800-38B Recommendation for Block Cipher Modes of Operation: The CMAC Mode for Authentication Morris Dworkin", dated May 2005, with the citation line "Natl. Inst. Stand. Technol. Spec. Publ. 800-38B, 23 pages (May 2005) CODEN: NSPUE2". The body of this copy carries no free-of-charge DOI line; the identifier named on the banner is DOI 10.6028/NIST.SP.800-38B.

## refs

- Wikipedia search entry for CMAC 认证模式. https://zh.wikipedia.org/w/index.php?search=CMAC%20%E8%AE%A4%E8%AF%81%E6%A8%A1%E5%BC%8F
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[S=\min_i S_i,\quad S_i\in\{\text{密钥强度},\text{分组安全},\text{实现安全}\}\]

The CMAC Mode for Authentication: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
