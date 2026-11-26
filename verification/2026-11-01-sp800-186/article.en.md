# Recommendations for Discrete Logarithm-based Cryptography: Elliptic Curve Domain Parameters

## principle

**Standard**: Recommendations for Discrete Logarithm-based Cryptography: Elliptic Curve Domain Parameters (椭圆曲线域参数建议). The scope of the recommendation is one sentence: "This Recommendation specifies the set of elliptic curves recommended for U.S. Government use." It is not a new algorithm but the recommended set of curves and their domain parameters.

## why

The new curves are justified by performance and implementation safety: "In addition to the previously recommended Weierstrass curves defined over prime fields and binary fields, this Recommendation includes two newly specified Edwards curves, which provide increased performance, side-channel resistance, and simpler implementation when compared to traditional curves." Alternative encodings are also allowed — "This Recommendation also specifies alternative representations for these new curves to allow more implementation flexibility."

## used

At the selection layer, §3.1 carries the title Recommended Curves for U.S. Federal Government Use — the heading line is unnumbered in our text, located by its 3.1.1/3.1.2 children — and its opening text says the section specifies the curves recommended for U.S. Federal Government use and gives the choices for private-key length and underlying fields — a pick-list — and the abstract adds interoperability framing: "The new curves are interoperable with those specified by the Crypto Forum Research Group (CFRG) of the Internet Engineering Task Force (IETF)."

## broken

The limits follow from its standing: it is a recommendation, not a mandatory FIPS — the authority block says "such standards and guidelines shall not apply to national security systems without the express approval of appropriate federal officials exercising policy authority over such systems" and adds "Nothing in this publication should be taken to contradict the standards and guidelines made mandatory and binding on federal agencies by the Secretary of Commerce under statutory authority." Clause 1 sets the real boundary: FIPS 186-4 curves short of the current bit-security requirements "are now legacy-use. They may be used to process already protected information (e.g., decrypt or verify) but not to apply protection to information (e.g., encrypt or sign)." The text also concedes that "Some of these requirements may be out of scope for CAVP or CMVP validation testing and are thus the responsibility of entities using, implementing, installing, or configuring applications that incorporate this Recommendation."

## history

Its place in the sequence is checkable: the title line is "Recommendations for Discrete Logarithm-based Cryptography: Elliptic Curve Domain Parameters" with Lily Chen among the authors, published in 2023. It takes over the curve list rather than the signature schemes: SP 800-131A Rev. 2 said approved curves remained specified in FIPS 186-4 until this recommendation was published, this document is the fulfilment of that placeholder, and the schemes stay with FIPS 186-5. The text points the old curves back where they belong — "This curve is for legacy-use only. See [FIPS_186-4] for the specification."

## refs

- Wikipedia search entry for 椭圆曲线域参数建议. https://zh.wikipedia.org/w/index.php?search=%E6%A4%AD%E5%9C%86%E6%9B%B2%E7%BA%BF%E5%9F%9F%E5%8F%82%E6%95%B0%E5%BB%BA%E8%AE%AE
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[S=\min_i S_i,\quad S_i\in\{\text{密钥强度},\text{分组安全},\text{实现安全}\}\]

Recommendations for Discrete Logarithm-based Cryptography: Elliptic Curve Domain Parameters: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
