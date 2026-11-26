# Argon2 Memory-Hard KDF

## principle

**Algorithm**: Argon2 (Argon2 口令派生). Section 1 gives the character: "Argon2 is a memory-hard function [HARD]. It is a streamlined design." The family structure is printed in the same passage: "Argon2 has one primary variant, Argon2id, and two supplementary variants, Argon2d and Argon2i." So Argon2 is a family with exactly one primary member.

## why

The goal is stated in cost-model terms: "It aims at the highest memory-filling rate and effective use of multiple computing units, while still providing defense against trade-off attacks." The metric is not hashes per second but how completely memory is filled and how many compute units are used, without letting time-memory trade-offs win. The hardware posture follows: "Argon2 is optimized for the x86 architecture and exploits the cache and memory organization of the recent Intel and AMD processors."

## used

Selection and implementation duty are both in the text. The division of labour: "Argon2i uses data-independent memory access, which is preferred for password hashing and password-based key derivation." The normative floor: "Argon2id MUST be supported by any implementation of this document, whereas Argon2d and Argon2i MAY be supported." So any implementation claiming conformance must support the primary variant; the other two are optional.

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

The limits fall out of the same division: Argon2d's data-dependent access is precisely the side-channel timing surface, which is why the text confines it to scenarios "with no threats from side-channel timing attacks". The text does claim complete prevention of one family, conditionally: to completely prevent the time-memory trade-offs of the cited work the number of passes must exceed the binary logarithm of memory minus 26 - so this entry reads the position as a conditional defence rather than a claim that trade-offs are eliminated in general - the wording is "providing defense against trade-off attacks", defence rather than proof - and Argon2i additionally "makes more passes over the memory to protect from trade-off attacks", buying safety with extra passes and therefore extra cost.

## history

Version facts: the abstract pins the algorithm release - "corresponds to version 1.3 of the Argon2 hash function." The header prints Request for Comments: 9106, Category: Informational, March 2021, by Bassham and Liu (restated outside quotes per house rule). So RFC 9106 standardises version 1.3 of the Password-Hashing Competition winner, not its original submission.

## refs

- Wikipedia search entry for Argon2 口令派生. https://zh.wikipedia.org/w/index.php?search=Argon2%20%E5%8F%A3%E4%BB%A4%E6%B4%BE%E7%94%9F
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[C=E_K(P;r),\qquad P=D_K(C)\]

Argon2: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
