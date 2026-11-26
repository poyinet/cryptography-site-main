# Boomerang Attack

## principle

**Attack**: Boomerang Attack (回旋镖攻击). The boomerang attack splits the cipher into E0 and E1 and uses a high-probability differential for E0 and one for E1^{-1} to build a quartet P, P′, Q, Q′; when the first three differentials hold, Q and Q′ satisfy the E0^{-1} differential with high probability.

## why

The whole cipher may have no high-probability differential, while two short differentials can each have high probability, so the boomerang attack defeats the folk theorem that a low whole-cipher differential probability implies security.

Restate the chain as input → state → transform → output → criterion. Every step should identify who acts, what changes and what evidence remains. A step without evidence is marked unverified, not reproduced.

## used

The paper breaks COCONUT98 with 2^16 adaptively chosen texts and 2^38 work, and also gives Khufu-16 with 2^18 adaptively chosen texts, FEAL-6 with 4 adaptively chosen plaintext/ciphertext queries, and an inside-out dual attack on 16-round CAST-256 with 2^49.3 known texts.

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

The attack requires constructing quartets and the ability to obtain adaptively chosen plaintexts and ciphertexts; data and time complexity depend on the probabilities of the two short differentials and are not universal for all block ciphers.

Adv_A = Pr[Succ_A] − Pr[Succ_ideal]；Cost = D × T × M；Success = 1[advantage > threshold]. Symbols are catalogue-level variables, not standard constants; parameters, test vectors and clauses remain with the registered source. The model states structural relations, not an implementation audit.

## history

Wagner introduced the boomerang attack in his 1999 FSE paper and used it to show that eliminating high-probability whole-cipher differentials is not enough to guarantee differential security.

Given abstract input x₀ and parameter p, compute y₀ and test it against the criterion; this is a reasoning example, not a measured vector. If the input leaves the domain, keys/parameters are reused, implementation diverges or versions mismatch, the model no longer holds.

## refs

- Wikipedia search entry for 回旋镖攻击. https://zh.wikipedia.org/w/index.php?search=%E5%9B%9E%E6%97%8B%E9%95%96%E6%94%BB%E5%87%BB
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[\mathrm{Adv}^{\mathrm{diff}}_A(\lambda)=\Pr[E_K(x)\oplus E_K(x\oplus\alpha)=\beta]\]

Boomerang Attack: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
