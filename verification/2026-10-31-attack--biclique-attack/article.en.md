# Biclique Attack

## principle

**Attack**: Biclique Attack (双团攻击). A biclique attack organizes internal cipher states as a complete bipartite graph (biclique) and connects the two sides through matching, amortizing key-recovery computation.

## why

The biclique structure lets the attacker process many key candidates at once and lowers complexity slightly below exhaustive search; the paper gives the first single-key key-recovery methods for full AES-128/192/256.

Restate the chain as input → state → transform → output → criterion. Every step should identify who acts, what changes and what evidence remains. A step without evidence is marked unverified, not reproduced.

## used

The complexities are 2^126.1 for full AES-128, 2^189.7 for AES-192 and 2^254.4 for AES-256; the paper also covers reduced-round AES and preimage search for AES-based compression functions.

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

Complexity remains close to exhaustive search and a practical attack requires enormous computation; biclique construction and matching dominate the cost, with small data volume and low memory, so this does not mean AES has been practically broken.

Adv_A = Pr[Succ_A] − Pr[Succ_ideal]；Cost = D × T × M；Success = 1[advantage > threshold]. Symbols are catalogue-level variables, not standard constants; parameters, test vectors and clauses remain with the registered source. The model states structural relations, not an implementation audit.

## history

Bogdanov, Khovratovich and Rechberger introduced the biclique attack in their 2011 ASIACRYPT paper, the first in the single-key model to push full-AES key recovery below exhaustive search.

Given abstract input x₀ and parameter p, compute y₀ and test it against the criterion; this is a reasoning example, not a measured vector. If the input leaves the domain, keys/parameters are reused, implementation diverges or versions mismatch, the model no longer holds.

## refs

- Wikipedia search entry for 双团攻击. https://zh.wikipedia.org/w/index.php?search=%E5%8F%8C%E5%9B%A2%E6%94%BB%E5%87%BB
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[\mathrm{Adv}^{\mathrm{attack}}_A(\lambda)=\Pr[\mathrm{Game}_A(\lambda)=1]-\frac12\]

Biclique Attack: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
