# Bilinear Pairing (Tate and Modified Tate)

## principle

**Algorithm**: Bilinear Pairing (双线性配对). Section 2.1 of the retained text gives the defining trio: "a mathematical construction known as the Tate pairing provides an efficiently computable map e: G1' x G1'' -> G2 that is linear in both arguments and believed hard to invert [BF]." The three requirements are efficient computability, linearity in both arguments and conjectured inversion hardness - every use of pairings rests on that combination.

## why

Why it needs specifying at all: §1 of the retained text names the downstream purpose in one phrase - the document serves "identity-based encryption (IBE) systems based on bilinear pairings". Whether a curve can serve depends on extra structure printed in §2.1: "If an efficiently computable non-rational endomorphism phi: G1' ->…is available for the selected elliptic curve on which the Tate pairing is computed" (the sentence straddles a page break in the retained file; the ellipsis marks only the skipped header and footer). That endomorphism is what yields the modified pairing identity-based schemes use.

## used

Naming and selection are printed in §2.1 of the retained text: "called the modified Tate pairing. We generically call a pairing either the Tate pairing e or the modified Tate pairing e', depending on the chosen elliptic curve used in a particular implementation." Engineering-wise the choice is not free: the curve decides which of the two constructions an implementation can use.

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

The limits are in the wording and the notation. Inversion hardness is phrased as "believed hard to invert" - a conjecture, not a theorem. The notation list fixes the base field order p as a prime of 512 to 7680 bits (restated, not quoted, to keep one citation span per sentence), an order of magnitude beyond ordinary ECC groups. Together: the assumption rests on belief, and the curve and field parameters must be chosen as the document specifies rather than swapped for another group at will.

## history

Lineage and identity: this document specifies the Tate and modified Tate pairings together with curve implementations so identity-based systems can cite them, and its motive sentence names "identity-based encryption (IBE) systems based on bilinear pairings". The header prints Request for Comments: 5091, Category: Informational, December 2007, by Boyen, Martin and Wang (restated outside quotes per house rule). The mathematical objects come from an earlier line of pairing research; the document offers no history, only the boundary of what is usable.

## refs

- Wikipedia search entry for 双线性配对. https://zh.wikipedia.org/w/index.php?search=%E5%8F%8C%E7%BA%BF%E6%80%A7%E9%85%8D%E5%AF%B9
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[C=E_K(P;r),\qquad P=D_K(C)\]

Bilinear Pairing: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
