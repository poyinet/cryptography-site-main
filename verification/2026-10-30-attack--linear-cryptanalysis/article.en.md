# Linear Cryptanalysis

## principle

**Attack**: Linear Cryptanalysis (线性密码分析). HAC describes linear cryptanalysis as the most powerful attack on DES; it uses large numbers of known plaintext pairs and can apply in a ciphertext-only setting when underlying redundancy is known.

## why

HAC calls it the most powerful attack on DES but does not consider it a practical threat.

Restate the chain as input → state → transform → output → criterion. Every step should identify who acts, what changes and what evidence remains. A step without evidence is marked unverified, not reproduced.

## used

HAC evaluates linear cryptanalysis against DES as a known-plaintext attack; if redundancy is known, it can also apply in a ciphertext-only setting.

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

HAC Table 7.7 gives the data and processing complexity against DES; it is not a practical threat there.

Adv_A = Pr[Succ_A] − Pr[Succ_ideal]；Cost = D × T × M；Success = 1[advantage > threshold]. Symbols are catalogue-level variables, not standard constants; parameters, test vectors and clauses remain with the registered source. The model states structural relations, not an implementation audit.

## history

HAC discusses linear and differential cryptanalysis of DES in §7.4.3(iv).

Given abstract input x₀ and parameter p, compute y₀ and test it against the criterion; this is a reasoning example, not a measured vector. If the input leaves the domain, keys/parameters are reused, implementation diverges or versions mismatch, the model no longer holds.

## refs

- Wikipedia search entry for 线性密码分析. https://zh.wikipedia.org/w/index.php?search=%E7%BA%BF%E6%80%A7%E5%AF%86%E7%A0%81%E5%88%86%E6%9E%90
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[\mathrm{Adv}^{\mathrm{diff}}_A(\lambda)=\Pr[E_K(x)\oplus E_K(x\oplus\alpha)=\beta]\]

Linear Cryptanalysis: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
