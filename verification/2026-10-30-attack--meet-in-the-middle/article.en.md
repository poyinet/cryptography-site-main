# Meet-in-the-Middle Attack

## principle

**Attack**: Meet-in-the-Middle Attack (中间相遇攻击). A meet-in-the-middle attack on double encryption uses one or two known plaintext-ciphertext pairs and recovers the key with about 2^k operations and 2^k storage.

## why

It reduces the 2^{2k} exhaustive search on double encryption to about 2^k time and 2^k space.

Restate the chain as input → state → transform → output → criterion. Every step should identify who acts, what changes and what evidence remains. A step without evidence is marked unverified, not reproduced.

## used

The attack encrypts P under all K1 candidates to build a table, then decrypts C under all K2 candidates and checks for matches.

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

The attack requires substantial storage; its cost grows with the number of encryption stages.

Adv_A = Pr[Succ_A] − Pr[Succ_ideal]；Cost = D × T × M；Success = 1[advantage > threshold]. Symbols are catalogue-level variables, not standard constants; parameters, test vectors and clauses remain with the registered source. The model states structural relations, not an implementation audit.

## history

HAC discusses the meet-in-the-middle attack on double encryption in Fact 7.33 of §7.2.

Given abstract input x₀ and parameter p, compute y₀ and test it against the criterion; this is a reasoning example, not a measured vector. If the input leaves the domain, keys/parameters are reused, implementation diverges or versions mismatch, the model no longer holds.

## refs

- Wikipedia search entry for 中间相遇攻击. https://zh.wikipedia.org/w/index.php?search=%E4%B8%AD%E9%97%B4%E7%9B%B8%E9%81%87%E6%94%BB%E5%87%BB
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[\mathrm{Adv}^{\mathrm{attack}}_A(\lambda)=\Pr[\mathrm{Game}_A(\lambda)=1]-\frac12\]

Meet-in-the-Middle Attack: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
