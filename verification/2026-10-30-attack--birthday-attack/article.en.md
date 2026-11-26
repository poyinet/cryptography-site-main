# Birthday Attack

## principle

**Attack**: Birthday Attack (生日攻击). A birthday attack exploits the birthday paradox: when drawing randomly with replacement from N elements, a repeat appears with high probability after about O(√N) selections.

## why

For an n-bit hash, finding a collision costs about O(2^{n/2}).

Restate the chain as input → state → transform → output → criterion. Every step should identify who acts, what changes and what evidence remains. A step without evidence is marked unverified, not reproduced.

## used

Birthday attacks are used in hash-collision analysis.

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

A birthday attack finds collisions; it does not directly find a preimage of a specified value, and collision is not the same as preimage attack.

Adv_A = Pr[Succ_A] − Pr[Succ_ideal]；Cost = D × T × M；Success = 1[advantage > threshold]. Symbols are catalogue-level variables, not standard constants; parameters, test vectors and clauses remain with the registered source. The model states structural relations, not an implementation audit.

## history

HAC discusses Yuval’s birthday attack in §9.7.1.

Given abstract input x₀ and parameter p, compute y₀ and test it against the criterion; this is a reasoning example, not a measured vector. If the input leaves the domain, keys/parameters are reused, implementation diverges or versions mismatch, the model no longer holds.

## refs

- Wikipedia search entry for 生日攻击. https://zh.wikipedia.org/w/index.php?search=%E7%94%9F%E6%97%A5%E6%94%BB%E5%87%BB
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[P\approx 1-\exp\!\left(-\frac{q(q-1)}{2\,2^n}\right)\]

Birthday Attack: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
