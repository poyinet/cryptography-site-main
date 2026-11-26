# Nonce Reuse

## principle

**Attack**: Nonce Reuse (nonce 复用). A nonce (initialization vector) is a value used for an encryption invocation; under one key, GCM requires IV uniqueness with a repetition probability no greater than 2^-32. Nonce reuse means the same key and IV are used for two distinct sets of input data.

## why

GCM confidentiality and authentication both depend on IV uniqueness. The standard requires the probability of repeating an IV under one key to be no greater than 2^-32, and notes that even one repetition can enable forgery attacks.

Restate the chain as input → state → transform → output → criterion. Every step should identify who acts, what changes and what evidence remains. A step without evidence is marked unverified, not reproduced.

## used

GCM allows either a deterministic IV construction (fixed field plus invocation field) or an RBG-based construction; IVs shorter than 96 bits must use the deterministic construction. Deterministic construction commonly uses a counter, while the RBG construction requires a random field of at least 96 bits and imposes invocation limits for non-96-bit deterministic IVs and RBG-based IVs.

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

Nonce reuse essentially destroys GCM’s authentication assurance and may let an attacker construct forged ciphertexts for a desired plaintext of the same length. Defenses include unique counters, sufficiently random nonces, and respecting the 2^32 invocation limit for non-96-bit deterministic IVs or RBG-based IVs.

Adv_A = Pr[Succ_A] − Pr[Succ_ideal]；Cost = D × T × M；Success = 1[advantage > threshold]. Symbols are catalogue-level variables, not standard constants; parameters, test vectors and clauses remain with the registered source. The model states structural relations, not an implementation audit.

## history

NIST SP 800-38D standardized GCM and GMAC in 2007 and states that GCM should not be deployed unless IV uniqueness is ensured.

Given abstract input x₀ and parameter p, compute y₀ and test it against the criterion; this is a reasoning example, not a measured vector. If the input leaves the domain, keys/parameters are reused, implementation diverges or versions mismatch, the model no longer holds.

## refs

- Wikipedia search entry for nonce 复用. https://zh.wikipedia.org/w/index.php?search=nonce%20%E5%A4%8D%E7%94%A8
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[\mathrm{Adv}^{\mathrm{attack}}_A(\lambda)=\Pr[\mathrm{Game}_A(\lambda)=1]-\frac12\]

Nonce Reuse: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
