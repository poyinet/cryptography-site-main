# Unicity Distance

## principle

**Attack**: Unicity Distance (唯一解距离). The unicity distance is the minimum amount of ciphertext required to allow a computationally unlimited adversary to recover the unique encryption key.

## why

Unicity distance is primarily a theoretical measure, useful in relation to unconditional security.

Restate the chain as input → state → transform → output → criterion. Every step should identify who acts, what changes and what evidence remains. A step without evidence is marked unverified, not reproduced.

## used

Unicity distance is used to estimate how much ciphertext is needed to determine the key uniquely.

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

A small unicity distance does not necessarily imply practical insecurity; practical security also depends on computational feasibility.

Adv_A = Pr[Succ_A] − Pr[Succ_ideal]；Cost = D × T × M；Success = 1[advantage > threshold]. Symbols are catalogue-level variables, not standard constants; parameters, test vectors and clauses remain with the registered source. The model states structural relations, not an implementation audit.

## history

HAC defines unicity distance in Definition 7.69 of §7.3.5(ii).

Given abstract input x₀ and parameter p, compute y₀ and test it against the criterion; this is a reasoning example, not a measured vector. If the input leaves the domain, keys/parameters are reused, implementation diverges or versions mismatch, the model no longer holds.

## refs

- Wikipedia search entry for 唯一解距离. https://zh.wikipedia.org/w/index.php?search=%E5%94%AF%E4%B8%80%E8%A7%A3%E8%B7%9D%E7%A6%BB
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[\mathrm{Adv}^{\mathrm{attack}}_A(\lambda)=\Pr[\mathrm{Game}_A(\lambda)=1]-\frac12\]

Unicity Distance: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
