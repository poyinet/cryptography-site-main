# Differential Cryptanalysis

## principle

**Attack**: Differential Cryptanalysis (差分密码分析). Differential cryptanalysis is one of the most general cryptanalytic tools against modern iterated block ciphers, as described by HAC.

## why

HAC describes differential cryptanalysis as a general tool against iterated ciphers such as DES, Lucifer and FEAL.

Restate the chain as input → state → transform → output → criterion. Every step should identify who acts, what changes and what evidence remains. A step without evidence is marked unverified, not reproduced.

## used

HAC treats differential cryptanalysis as primarily a chosen-plaintext attack.

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

HAC Table 7.7 gives the data and processing complexity against DES; specific parameters affect cost.

Adv_A = Pr[Succ_A] − Pr[Succ_ideal]；Cost = D × T × M；Success = 1[advantage > threshold]. Symbols are catalogue-level variables, not standard constants; parameters, test vectors and clauses remain with the registered source. The model states structural relations, not an implementation audit.

## history

HAC discusses differential cryptanalysis of DES in §7.4.3(iv).

Given abstract input x₀ and parameter p, compute y₀ and test it against the criterion; this is a reasoning example, not a measured vector. If the input leaves the domain, keys/parameters are reused, implementation diverges or versions mismatch, the model no longer holds.

## refs

- Wikipedia search entry for 差分密码分析. https://zh.wikipedia.org/w/index.php?search=%E5%B7%AE%E5%88%86%E5%AF%86%E7%A0%81%E5%88%86%E6%9E%90
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[\mathrm{Adv}^{\mathrm{diff}}_A(\lambda)=\Pr[E_K(x)\oplus E_K(x\oplus\alpha)=\beta]\]

Differential Cryptanalysis: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
