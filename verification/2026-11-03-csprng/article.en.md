# Cryptographically Secure Pseudorandom Number Generator (DRBG)

## principle

**Algorithm**: Cryptographically Secure PRNG (密码学安全伪随机数发生器). Section 1 opens with the characterisation: "This Recommendation specifies techniques for the generation of random bits that may then be used directly or converted to random numbers when random values are required by applications using cryptography." It specifies bit generation; numbers are a downstream conversion. The document's own footnote fixes the naming: "DRBGs have also been called Pseudorandom Number (or Bit) Generators", so what is loosely called a CSPRNG is normalised here under the name DRBG.

## why

The rationale is legible in the definitions. Live Entropy Source is defined as "A bitstring output from an entropy source, an NRBG or a DRBG that has access to a Live Entropy Source that is being used to provide prediction resistance", so prediction resistance is what forces a live entropy input. Approved entropy source is defined as "An entropy source that has been validated as conforming to [SP 800-90B]". A DRBG exists to expand a validated entropy stream into bits on demand, not to manufacture entropy.

## used

The usage boundary is printed in §4. Approved entropy source requires an entropy source "validated as conforming to [SP 800-90B]", so a deployment's duty is to have the source validated rather than to assert it. The same section describes the generator as comprising instantiation, uninstantiation, pseudorandom-bit generation, optional reseeding and health testing, which is the interface through which key and nonce generation consume it.

## broken

The limit is printed in §1 as a systems statement: "The security provided by an RBG that uses a DRBG mechanism is a system implementation issue; both the DRBG mechanism and its randomness source must be considered when determining whether the RBG is appropriate for use by consuming applications." A conforming mechanism is not by itself a conforming generator; the upstream randomness source must be assessed with it. §4 supplies the yardstick: "In the context of random bit generation, an output bit is unpredictable if an adversary has only a negligible advantage (that is, essentially not much better than chance) in predicting it correctly." Once entropy input is missing or reseeding lapses, that condition no longer holds.

## history

Version facts: the retained title line reads "Recommendation for Random Number Generation Using Deterministic RBGs" — SP 800-90A Rev. 1 (June 2015) — with keyword line "Deterministic random bit generator (DRBG); entropy; hash function; random number generator." The text then notes that "NIST Special Publication (SP) 800-90B [SP 800-90B] provides guidance on designing and validating entropy sources", so the 2015 document governs deterministic generators while entropy-source validation moved to SP 800-90B.

## refs

- Wikipedia search entry for 密码学安全伪随机数发生器. https://zh.wikipedia.org/w/index.php?search=%E5%AF%86%E7%A0%81%E5%AD%A6%E5%AE%89%E5%85%A8%E4%BC%AA%E9%9A%8F%E6%9C%BA%E6%95%B0%E5%8F%91%E7%94%9F%E5%99%A8
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[C=E_K(P;r),\qquad P=D_K(C)\]

Cryptographically Secure PRNG: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
