# Impossible Differential Attack

## principle

**Attack**: Impossible Differential Attack (不可能差分). An impossible differential is a differential with probability zero: some input difference cannot produce a particular output difference after a number of rounds. The attacker uses this impossible event to discard wrong keys that propose it.

## why

Traditional differential cryptanalysis relies on high-probability differentials; when whole-cipher differentials have low probability, impossible differentials still provide strong filters, extending the range of ciphers to which differential techniques apply.

Restate the chain as input → state → transform → output → criterion. Every step should identify who acts, what changes and what evidence remains. A step without evidence is marked unverified, not reproduced.

## used

The paper gives a 24-round impossible differential for Skipjack and breaks 31-round Skipjack (one round removed from 32) with 2^34 chosen plaintexts and 2^64 memory, slightly faster than exhaustive search.

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

The attack needs enough chosen plaintext pairs and large memory to filter wrong keys; it targets reduced-round ciphers, involves data/time/memory trade-offs, and is not universal.

Adv_A = Pr[Succ_A] − Pr[Succ_ideal]；Cost = D × T × M；Success = 1[advantage > threshold]. Symbols are catalogue-level variables, not standard constants; parameters, test vectors and clauses remain with the registered source. The model states structural relations, not an implementation audit.

## history

Biham, Biryukov and Shamir developed impossible differentials into a systematic cryptanalytic technique in their 1999 EUROCRYPT paper and applied it to Skipjack.

Given abstract input x₀ and parameter p, compute y₀ and test it against the criterion; this is a reasoning example, not a measured vector. If the input leaves the domain, keys/parameters are reused, implementation diverges or versions mismatch, the model no longer holds.

## refs

- Wikipedia search entry for 不可能差分. https://zh.wikipedia.org/w/index.php?search=%E4%B8%8D%E5%8F%AF%E8%83%BD%E5%B7%AE%E5%88%86
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[\mathrm{Adv}^{\mathrm{diff}}_A(\lambda)=\Pr[E_K(x)\oplus E_K(x\oplus\alpha)=\beta]\]

Impossible Differential Attack: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
