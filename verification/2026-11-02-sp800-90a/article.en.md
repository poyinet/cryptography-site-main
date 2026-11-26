# Recommendation for Random Number Generation Using Deterministic RBGs

## principle

**Standard**: Recommendation for Random Number Generation (随机数发生器建议). The abstract defines it in one sentence: "This Recommendation specifies mechanisms for the generation of random bits using deterministic methods." with the construction basis: "The methods provided are based on either hash functions or block cipher algorithms." This is a deterministic bit-generator specification, not an entropy-source specification.

## why

The problem is verifiable random-number generators: the abstract states the scope — "This Recommendation specifies mechanisms for the generation of random bits using deterministic methods. The methods provided are based on either hash functions or block cipher algorithms." — and §1 puts the burden on the seed — "The seed used to instantiate the DRBG must contain sufficient entropy to provide an assurance of randomness." The keyword line reads "Deterministic random bit generator (DRBG)" — an index entry, not an argument.

## used

It is used as a component inside a validated module, and the direction of the citation runs the other way around: the document states a requirement rather than citing one — "A cryptographic module containing a DRBG mechanism shall be validated (see [FIPS 140])." — while the consuming application or service must supply entropy and prediction resistance under the document’s own rules for entropy and prediction resistance.

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

The first limit is division of responsibility: this document covers the DRBG mechanism only, and its own reference list carries SP 800-90B as "(Draft)… August 2012" while construction guidance is assigned to SP 800-90C — so within this text the entropy source is settled nowhere. The second is that it does not judge a given implementation; validation runs through FIPS 140.

## history

The lineage is on the title page and in the change appendix: the original was June 2006 and three separate lines date Revision 1 to June 2015 — the masthead "…NIST.SP.800-90Ar1 June 2015", the citation "Spec. Publ. 800-90A Rev. 1, 109 pages (June 2015)", and Appendix E "In June 2015, the following substantive changes were made in Revision 1 of [SP 800-90A]". The most consequential recorded change is a removal: "The Dual_EC_DRBG has been removed, and section numbers adjusted accordingly." together with the appendix that carried its application-specific constants.

## refs

- Wikipedia search entry for 随机数发生器建议. https://zh.wikipedia.org/w/index.php?search=%E9%9A%8F%E6%9C%BA%E6%95%B0%E5%8F%91%E7%94%9F%E5%99%A8%E5%BB%BA%E8%AE%AE
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[S=\min_i S_i,\quad S_i\in\{\text{密钥强度},\text{分组安全},\text{实现安全}\}\]

Recommendation for Random Number Generation: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
