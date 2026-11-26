# One-Time Pad Reuse

## principle

**Attack**: One-Time Pad Reuse (一次性密码本重用). One-time pad reuse is the use of the same keystream to encrypt more than one message.

## why

HAC states that reusing the key string provides ways to attack the system.

Restate the chain as input → state → transform → output → criterion. Every step should identify who acts, what changes and what evidence remains. A step without evidence is marked unverified, not reproduced.

## used

XORing two ciphertexts produced under the same keystream cancels the keystream and leaves the XOR of the two plaintexts.

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

The one-time pad requires a randomly chosen key that is never reused; reuse breaks its theoretical unbreakability.

Adv_A = Pr[Succ_A] − Pr[Succ_ideal]；Cost = D × T × M；Success = 1[advantage > threshold]. Symbols are catalogue-level variables, not standard constants; parameters, test vectors and clauses remain with the registered source. The model states structural relations, not an implementation audit.

## history

HAC discusses the one-time pad and keystream reuse in §1.5.4.

Given abstract input x₀ and parameter p, compute y₀ and test it against the criterion; this is a reasoning example, not a measured vector. If the input leaves the domain, keys/parameters are reused, implementation diverges or versions mismatch, the model no longer holds.

## refs

- Wikipedia search entry for 一次性密码本重用. https://zh.wikipedia.org/w/index.php?search=%E4%B8%80%E6%AC%A1%E6%80%A7%E5%AF%86%E7%A0%81%E6%9C%AC%E9%87%8D%E7%94%A8
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[\mathrm{Adv}^{\mathrm{attack}}_A(\lambda)=\Pr[\mathrm{Game}_A(\lambda)=1]-\frac12\]

One-Time Pad Reuse: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
