# KECCAK Message Authentication Code (KMAC)

## principle

**Algorithm**: KMAC (KMAC 基于散列的 MAC). The construction is printed in §4.3: "KMAC concatenates a padded version of the key K with the input X and an encoding of the requested output length L. The result is then passed to cSHAKE, along with the requested output length L, the name N" — the key is byte-aligned and padded, then the input and an encoding of the output length go to cSHAKE with the function name as domain separation. §1 groups it with the other derived functions: "All four functions defined in this Recommendation--cSHAKE, KMAC, TupleHash, and ParallelHash--have these properties in common:"

## why

Two sentences carry the rationale. §1 characterises KMAC as a member of the keyed, variable-output pseudorandom-function family the document defines. §5 states the comparison explicitly: "To illustrate the security properties of KMAC for given parameter settings, Table 1 lists a few other approved MAC algorithms along with equivalent settings" — so KMAC exists to offer choices aligned with HMAC and CMAC inside the SHA-3 family rather than to invent a new strength yardstick.

## used

Section 4 prints both uses. The fixed-length use is the function itself, KMAC128(K, X, L, S), whose second step returns the cSHAKE128 result directly. The variable-length use is spelled out: "Some applications of KMAC may not know the number of output bits they will need until after the outputs begin to be produced. For these applications, KMAC can also be used as a XOF (i.e., the output can be extended to any desired length)" - KMACXOF serves consumers that do not know their bit requirement up front.

## broken

The limit is a normative sentence with teeth: "Approved uses of KMAC require the length of K to be at least the required security strength, as discussed in Sec. 8.4.1." An undersized key defeats approved use outright. The validity conditions printed alongside it, "Validity Conditions: len(K) < 22040 and 0  L < 22040 and len(S) < 22040" (this copy flattens the superscripts into running digits); outside those bounds the function is undefined.

## history

The version facts come from the retained text itself: the title line reads "SHA-3 DERIVED FUNCTIONS: CSHAKE, KMAC, TUPLEHASH, AND PARALLELHASH", so SP 800-185 (December 2022) is where these four derived functions were standardised together. §2.1 supplies the earlier link while defining the KECCAK family: "KECCAK was originally specified in [2], and standardized in FIPS 202." The same section records that KMAC stands for KECCAK Message Authentication Code. The retained copy also prints a free-availability line with a digital object identifier on every page; by house rule that line is not quoted into the article.

## refs

- Wikipedia search entry for KMAC 基于散列的 MAC. https://zh.wikipedia.org/w/index.php?search=KMAC%20%E5%9F%BA%E4%BA%8E%E6%95%A3%E5%88%97%E7%9A%84%20MAC
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[T=\mathrm{MAC}_K(M),\quad \Pr[\mathrm{Forge}]\le\varepsilon(\lambda)\]

KMAC: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
