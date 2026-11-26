# Brute Force Attack

## principle

**Attack**: Brute Force Attack (穷举攻击). A brute-force attack tries all possible keys until the correct key is found.

## why

The size of the key space determines the feasibility of exhaustive search.

Restate the chain as input → state → transform → output → criterion. Every step should identify who acts, what changes and what evidence remains. A step without evidence is marked unverified, not reproduced.

## used

Brute-force attacks are used to assess key-space and exhaustive-search feasibility.

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

A large key space makes exhaustive search infeasible, but a large key space is necessary and usually not sufficient for security.

Adv_A = Pr[Succ_A] − Pr[Succ_ideal]；Cost = D × T × M；Success = 1[advantage > threshold]. Symbols are catalogue-level variables, not standard constants; parameters, test vectors and clauses remain with the registered source. The model states structural relations, not an implementation audit.

## history

HAC discusses exhaustive key search in §1.5.5.

Given abstract input x₀ and parameter p, compute y₀ and test it against the criterion; this is a reasoning example, not a measured vector. If the input leaves the domain, keys/parameters are reused, implementation diverges or versions mismatch, the model no longer holds.

## refs

- Wikipedia search entry for 穷举攻击. https://zh.wikipedia.org/w/index.php?search=%E7%A9%B7%E4%B8%BE%E6%94%BB%E5%87%BB
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[T=\frac{|\mathcal{K}|}{v},\qquad |\mathcal{K}|=2^{\kappa}\]

Brute Force Attack: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
