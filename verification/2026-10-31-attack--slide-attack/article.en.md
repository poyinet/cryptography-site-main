# Slide Attack

## principle

**Attack**: Slide Attack (滑动攻击). A slide attack looks for a slid pair (P,C) and (P′,C′) such that one round maps P to P′ and C to C′; this one-round relation can be used to recover round subkeys.

## why

When the round function and key schedule are self-similar, the attack can be independent of the number of rounds; it usually uses known plaintext and sometimes chosen plaintext, and some Feistel structures allow complexity to drop to about 2^{n/4}.

Restate the chain as input → state → transform → output → criterion. Every step should identify who acts, what changes and what evidence remains. A step without evidence is marked unverified, not reproduced.

## used

The paper gives practical attacks on TREYFER, 2K-DES and a Blowfish variant; for example, TREYFER uses 2^32 known plaintexts and 2^44 work, while 2K-DES uses 2^32 known plaintexts and 2^50 work. WAKE-ROFB is analyzed only under restrictive IV/resynchronization assumptions, and the paper explicitly says it is not broken.

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

Slide attacks usually need close to 2^{n/2} known plaintexts; iteration counters, fixed random constants or breaking the key schedule’s periodicity remove the simplest self-similarity, but more sophisticated variants remain hard to defend against.

Adv_A = Pr[Succ_A] − Pr[Succ_ideal]；Cost = D × T × M；Success = 1[advantage > threshold]. Symbols are catalogue-level variables, not standard constants; parameters, test vectors and clauses remain with the registered source. The model states structural relations, not an implementation audit.

## history

Biryukov and Wagner introduced slide attacks in their 1999 FSE paper, showing that adding rounds does not always resist attacks that exploit self-similarity.

Given abstract input x₀ and parameter p, compute y₀ and test it against the criterion; this is a reasoning example, not a measured vector. If the input leaves the domain, keys/parameters are reused, implementation diverges or versions mismatch, the model no longer holds.

## refs

- Wikipedia search entry for 滑动攻击. https://zh.wikipedia.org/w/index.php?search=%E6%BB%91%E5%8A%A8%E6%94%BB%E5%87%BB
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[\mathrm{Adv}^{\mathrm{diff}}_A(\lambda)=\Pr[E_K(x)\oplus E_K(x\oplus\alpha)=\beta]\]

Slide Attack: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
