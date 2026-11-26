# Time-Memory Trade-Off

## principle

**Attack**: Time-Memory Trade-Off (时间-存储权衡). A time-memory trade-off uses precomputed tables to exchange exhaustive-search time for memory. For a key space of size N=2^m, Hellman’s method uses O(N) precomputation and then about O(N^{2/3}) time and O(N^{2/3}) space to recover a key, with a chosen-plaintext attack.

## why

Precomputed tables store the endpoints of chains and regenerate them during search, so the search phase need not enumerate the whole key space from scratch for each target.

Restate the chain as input → state → transform → output → criterion. Every step should identify who acts, what changes and what evidence remains. A step without evidence is marked unverified, not reproduced.

## used

The method is used for exhaustive key search on block ciphers; Rivest’s distinguished points can further reduce search time.

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

Precomputation and storage are costly; with a constant time-memory product there is no asymptotic cost advantage over exhaustive search. A table covers only the precomputed key space, and changing the target space requires new precomputation.

Adv_A = Pr[Succ_A] − Pr[Succ_ideal]；Cost = D × T × M；Success = 1[advantage > threshold]. Symbols are catalogue-level variables, not standard constants; parameters, test vectors and clauses remain with the registered source. The model states structural relations, not an implementation audit.

## history

Hellman proposed the trade-off; HAC summarizes its O(N^{2/3}) time and space complexity in the §7.8 notes.

Given abstract input x₀ and parameter p, compute y₀ and test it against the criterion; this is a reasoning example, not a measured vector. If the input leaves the domain, keys/parameters are reused, implementation diverges or versions mismatch, the model no longer holds.

## refs

- Wikipedia search entry for 时间-存储权衡. https://zh.wikipedia.org/w/index.php?search=%E6%97%B6%E9%97%B4-%E5%AD%98%E5%82%A8%E6%9D%83%E8%A1%A1
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[\mathrm{Adv}^{\mathrm{attack}}_A(\lambda)=\Pr[\mathrm{Game}_A(\lambda)=1]-\frac12\]

Time-Memory Trade-Off: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
