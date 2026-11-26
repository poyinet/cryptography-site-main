# Integral Attack

## principle

**Attack**: Integral Attack (积分攻击). Integral cryptanalysis sums all values in a multiset and predicts whether the sum after some rounds is zero or a constant; a higher-order integral sums over a product set S1×…×Ss and is related to, but distinct from, higher-order differentials.

## why

Integrals can be seen as a dual to differential cryptanalysis: they exploit relationships among many encryptions simultaneously, are especially suited to ciphers built from bijective components, and can attack ciphers not vulnerable to differential analysis.

Restate the chain as input → state → transform → output → criterion. Every step should identify who acts, what changes and what evidence remains. A step without evidence is marked unverified, not reproduced.

## used

The paper applies integrals to MISTY1, MISTY2 and generalized Feistel networks; for example, a 5-round MISTY1 attack uses 2^34 chosen plaintexts and 2^48 time, while MISTY2 attacks use 2^9 data for 4 rounds and 2^34 data for 6 rounds.

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

Integral attacks require chosen plaintexts and sufficient data; their effectiveness depends on the cipher’s algebraic structure and integral propagation, and higher-order integrals increase data and computation requirements.

Adv_A = Pr[Succ_A] − Pr[Succ_ideal]；Cost = D × T × M；Success = 1[advantage > threshold]. Symbols are catalogue-level variables, not standard constants; parameters, test vectors and clauses remain with the registered source. The model states structural relations, not an implementation audit.

## history

Knudsen and Wagner unified related ideas under the name integral cryptanalysis in their 2002 FSE paper, incorporating earlier techniques such as the square attack into one framework.

Given abstract input x₀ and parameter p, compute y₀ and test it against the criterion; this is a reasoning example, not a measured vector. If the input leaves the domain, keys/parameters are reused, implementation diverges or versions mismatch, the model no longer holds.

## refs

- Wikipedia search entry for 积分攻击. https://zh.wikipedia.org/w/index.php?search=%E7%A7%AF%E5%88%86%E6%94%BB%E5%87%BB
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[\mathrm{Adv}^{\mathrm{diff}}_A(\lambda)=\Pr[E_K(x)\oplus E_K(x\oplus\alpha)=\beta]\]

Integral Attack: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
