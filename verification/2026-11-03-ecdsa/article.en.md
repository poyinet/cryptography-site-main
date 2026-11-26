# Elliptic Curve Digital Signature Algorithm (ECDSA)

## principle

**Algorithm**: Elliptic Curve Digital Signature Algorithm (ECDSA 椭圆曲线签名). The scope sentence sets the frame: "This standard defines methods for digital signature generation that can be used for the protection of binary data (commonly called a message) and for the verification and validation of those digital signatures." §4 then fixes ECDSA's place in it: "The Elliptic Curve Digital Signature Algorithm (ECDSA) is specified in this standard." So ECDSA is not a standalone specification but one algorithm inside the Digital Signature Standard.

## why

Why the standard takes it up is told in §1 as provenance plus a gap: "ECDSA was originally specified in American National Standards (ANS) X9.62 [3] (withdrawn)." - the original home is a withdrawn ANSI standard. The standard therefore has to specify the method itself, and the same passage records a deterministic variant, showing that what is folded in is not only the algorithm but also the repair of its dependence on a per-signature random value.

## used

Usage is bounded by two normative sentences. Key division: "The private key shall be used only for signature generation, as specified in this standard, and shall be kept secret." Verification coupling: "A digital signature shall be verified as specified in Section 6.4.2 using the same domain parameters and hash function that were used during signature generation." Changing curve parameters or the hash breaks verification, so deployments must pin the parameter set and hash together.

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

Three limits. First, the §3 key duty: the private key is only for signature generation and must stay secret, so disclosure is equivalent to forgery. Second, the deterministic variant recorded in §4 exists because the basic form needs a secure random value per signature - the standard lists the repair separately. Third is the withdrawn fact in the same section: X9.62, ECDSA's original specification, is withdrawn, so any implementation note citing only X9.62 rests on a source that no longer stands.

## history

The lineage follows two printed sentences: ECDSA was first specified in the now-withdrawn ANSI X9.62 and was then folded into the Digital Signature Standard, while "A variant of ECDSA with a deterministic signature generation" is listed in the same passage, giving the deterministic reform a place in this standard too. The document's own identity - FIPS 186-5, published June 2023, superseding FIPS 186-4 - is restated outside quotes per house rule. ECDSA's standardisation story therefore has two chapters: the ANSI period and this standard's period.

## refs

- Wikipedia search entry for ECDSA 椭圆曲线签名. https://zh.wikipedia.org/w/index.php?search=ECDSA%20%E6%A4%AD%E5%9C%86%E6%9B%B2%E7%BA%BF%E7%AD%BE%E5%90%8D
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[s=k^{-1}\big(H(m)+r d\big)\bmod n\]

Elliptic Curve Digital Signature Algorithm: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
