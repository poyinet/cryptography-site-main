# Hash Collision Attack

## principle

**Attack**: Hash Collision Attack (哈希碰撞攻击). A hash collision attack finds two distinct inputs that hash to the same value.

## why

A collision breaks signature or integrity binding because one hash can correspond to two messages.

Restate the chain as input → state → transform → output → criterion. Every step should identify who acts, what changes and what evidence remains. A step without evidence is marked unverified, not reproduced.

## used

Collision attacks are used to assess a hash function’s collision resistance.

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

A collision attack is not the same as a preimage attack; collision resistance does not guarantee preimage resistance/one-wayness.

Adv_A = Pr[Succ_A] − Pr[Succ_ideal]；Cost = D × T × M；Success = 1[advantage > threshold]. Symbols are catalogue-level variables, not standard constants; parameters, test vectors and clauses remain with the registered source. The model states structural relations, not an implementation audit.

## history

HAC Chapter 9 discusses birthday attacks and collision resistance.

Given abstract input x₀ and parameter p, compute y₀ and test it against the criterion; this is a reasoning example, not a measured vector. If the input leaves the domain, keys/parameters are reused, implementation diverges or versions mismatch, the model no longer holds.

## refs

- Wikipedia search entry for 哈希碰撞攻击. https://zh.wikipedia.org/w/index.php?search=%E5%93%88%E5%B8%8C%E7%A2%B0%E6%92%9E%E6%94%BB%E5%87%BB
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[P\approx 1-\exp\!\left(-\frac{q(q-1)}{2\,2^n}\right)\]

Hash Collision Attack: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
