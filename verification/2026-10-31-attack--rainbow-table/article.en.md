# Rainbow Table

## principle

**Attack**: Rainbow Table (彩虹表). A rainbow table alternates hashing with a different reduction function in each column, building many chains and storing only each chain’s start and end points. Different columns use different reductions, so only collisions in the same column merge; lookup reduces the target column by column, and a matching endpoint allows the chain to be regenerated.

## why

It trades precomputation and storage for online cracking time: about half the calculations of Hellman’s method, roughly 7–12 times fewer than distinguished points, and avoids the overhead of variable-length chains.

Restate the chain as input → state → transform → output → criterion. Every step should identify who acts, what changes and what evidence remains. A step without evidence is marked unverified, not reproduced.

## used

The paper implemented an attack on MS-Windows password hashes: 1.4GB of tables cracked 99.9% of alphanumeric passwords (2^37 candidates). Sequential rainbow took 13.6 seconds, ordinary rainbow 66.3 seconds, and the classic distinguished-points method 101 seconds.

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

Chain merges and collisions cause false alarms and reduce the number of distinct keys actually covered; precomputation and storage are costly, and a table applies only to a specific hash and character set.

Adv_A = Pr[Succ_A] − Pr[Succ_ideal]；Cost = D × T × M；Success = 1[advantage > threshold]. Symbols are catalogue-level variables, not standard constants; parameters, test vectors and clauses remain with the registered source. The model states structural relations, not an implementation audit.

## history

Hellman proposed the time-memory trade-off in 1980, Rivest later introduced distinguished points, and Oechslin proposed the rainbow-table structure with faster results in 2003.

Given abstract input x₀ and parameter p, compute y₀ and test it against the criterion; this is a reasoning example, not a measured vector. If the input leaves the domain, keys/parameters are reused, implementation diverges or versions mismatch, the model no longer holds.

## refs

- Wikipedia search entry for 彩虹表. https://zh.wikipedia.org/w/index.php?search=%E5%BD%A9%E8%99%B9%E8%A1%A8
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[\mathrm{Adv}^{\mathrm{attack}}_A(\lambda)=\Pr[\mathrm{Game}_A(\lambda)=1]-\frac12\]

Rainbow Table: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
