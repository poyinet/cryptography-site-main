# Man-in-the-Middle Attack

## principle

**Attack**: Man-in-the-Middle Attack (中间人攻击). A man-in-the-middle attack is an active wiretapping attack in which the attacker intercepts and selectively modifies communicated data to masquerade as one or more entities.

## why

Without data-origin authentication, an attacker can establish separate session keys with each party and proxy the communication.

Restate the chain as input → state → transform → output → criterion. Every step should identify who acts, what changes and what evidence remains. A step without evidence is marked unverified, not reproduced.

## used

A man-in-the-middle attack targets unauthenticated key exchange.

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

Data-origin authentication can prevent the attack; the RFC 4949 example assumes its absence.

Adv_A = Pr[Succ_A] − Pr[Succ_ideal]；Cost = D × T × M；Success = 1[advantage > threshold]. Symbols are catalogue-level variables, not standard constants; parameters, test vectors and clauses remain with the registered source. The model states structural relations, not an implementation audit.

## history

RFC 4949 (2007) defines the man-in-the-middle attack.

Given abstract input x₀ and parameter p, compute y₀ and test it against the criterion; this is a reasoning example, not a measured vector. If the input leaves the domain, keys/parameters are reused, implementation diverges or versions mismatch, the model no longer holds.

## refs

- Wikipedia search entry for 中间人攻击. https://zh.wikipedia.org/w/index.php?search=%E4%B8%AD%E9%97%B4%E4%BA%BA%E6%94%BB%E5%87%BB
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[\mathrm{Adv}^{\mathrm{attack}}_A(\lambda)=\Pr[\mathrm{Game}_A(\lambda)=1]-\frac12\]

Man-in-the-Middle Attack: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
