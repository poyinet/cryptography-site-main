# Second Preimage Attack

## principle

**Attack**: Second Preimage Attack (第二原像攻击). A second-preimage attack, given x, looks for a different x′ such that h(x′)=h(x).

## why

Second-preimage resistance prevents an attacker from finding a substitute input with the same hash as a specified input.

Restate the chain as input → state → transform → output → criterion. Every step should identify who acts, what changes and what evidence remains. A step without evidence is marked unverified, not reproduced.

## used

Second-preimage attacks assess hash-substitution risk in signatures or integrity binding.

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

Collision resistance implies second-preimage resistance; second-preimage attacks are harder than collision attacks.

Adv_A = Pr[Succ_A] − Pr[Succ_ideal]；Cost = D × T × M；Success = 1[advantage > threshold]. Symbols are catalogue-level variables, not standard constants; parameters, test vectors and clauses remain with the registered source. The model states structural relations, not an implementation audit.

## history

HAC defines second-preimage resistance in §9.2.2 and gives its relation to collision resistance in Fact 9.18.

Given abstract input x₀ and parameter p, compute y₀ and test it against the criterion; this is a reasoning example, not a measured vector. If the input leaves the domain, keys/parameters are reused, implementation diverges or versions mismatch, the model no longer holds.

## refs

- Wikipedia search entry for 第二原像攻击. https://zh.wikipedia.org/w/index.php?search=%E7%AC%AC%E4%BA%8C%E5%8E%9F%E5%83%8F%E6%94%BB%E5%87%BB
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[\mathrm{Adv}^{\mathrm{attack}}_A(\lambda)=\Pr[\mathrm{Game}_A(\lambda)=1]-\frac12\]

Second Preimage Attack: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
