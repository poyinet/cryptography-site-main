# Recommendation for Pair-Wise Key-Establishment Schemes

## principle

**Standard**: Pairwise Key Agreement Schemes (成对密钥协商方案). The abstract sets the range: "This Recommendation specifies key-establishment schemes based on the discrete logarithm problem over finite fields and elliptic curves, including several variations of Diffie-Hellman and Menezes-Qu-Vanstone (MQV) key establishment schemes." Its subject is the construction and preconditions of discrete-log key establishment.

## why

It gathers a family of constructions into one implementable specification: the abstract says "This Recommendation specifies key-establishment schemes based on the discrete logarithm problem over finite fields and elliptic curves", and the keyword line indexes the scope — "Diffie-Hellman; elliptic curve cryptography; finite field cryptography; key agreement; key confirmation; key derivation; key establishment; MQV." Agreement, confirmation and derivation are treated as one system.

## used

Its use is choosing among key-establishment schemes: the document grades schemes by how many static and ephemeral key pairs they consume (the keyword line closes the family with MQV) and §5 gives the algorithm steps for the FFC and ECC primitives — the contents list carries "MQV1 Form of the FFC MQV Primitive", "Full MQV" and "One-Pass Form of the ECC MQV Primitive". Conformance and the modality vocabulary sit in the front-matter Authority and Conformance Testing blocks: "The requirements of this Recommendation are indicated by the word “shall.”"

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

The first limit is the conditional wording: guidance of this kind "shall not apply to national security systems without the express approval of appropriate federal officials exercising policy authority over such systems" — application is not unconditional. The second is the validation boundary: the front matter concedes that some requirements "may be out-of-scope for CAVP or CMVP validation testing", and the omitted clause after that comma is the point — the responsibility falls on the entities using, implementing, installing or configuring the application.

## history

The title page gives authorship and edition: Elaine Barker, Lily Chen, Allen Roginsky, Apostol Vassilev and Richard Davis, with the heading "NIST Special Publication 800-56A Revision 3" and a DOI resolving to the rev3 file. Nothing in the document announces a later revision.

## refs

- Wikipedia search entry for 成对密钥协商方案. https://zh.wikipedia.org/w/index.php?search=%E6%88%90%E5%AF%B9%E5%AF%86%E9%92%A5%E5%8D%8F%E5%95%86%E6%96%B9%E6%A1%88
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[S=\min_i S_i,\quad S_i\in\{\text{密钥强度},\text{分组安全},\text{实现安全}\}\]

Pairwise Key Agreement Schemes: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
