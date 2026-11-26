# Truncated Differential Attack

## principle

**Attack**: Truncated Differential Attack (截断差分). A truncated differential predicts only part of the difference rather than the full output difference; the attacker uses this partial predictability to filter candidate keys. The paper also discusses higher-order differentials as a related tool.

## why

A cipher may resist all full first-order differentials yet still leak partial difference information; truncated and higher-order differentials can therefore attack Feistel structures that appear secure.

Restate the chain as input → state → transform → output → criterion. Every step should identify who acts, what changes and what evidence remains. A step without evidence is marked unverified, not reproduced.

## used

The paper gives a truncated differential attack on 6-round DES using only 46 chosen plaintexts with an expected running time of about 3,500 encryptions.

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

The attack requires chosen plaintexts and enough data to observe the partial difference; its effectiveness depends on the cipher’s differential propagation, and higher-order differentials increase data and computation requirements.

Adv_A = Pr[Succ_A] − Pr[Succ_ideal]；Cost = D × T × M；Success = 1[advantage > threshold]. Symbols are catalogue-level variables, not standard constants; parameters, test vectors and clauses remain with the registered source. The model states structural relations, not an implementation audit.

## history

Knudsen introduced truncated differentials in his 1994 FSE paper and applied Lai’s higher-order derivative ideas to block ciphers; the paper laid groundwork for later truncated-differential and higher-order differential research.

Given abstract input x₀ and parameter p, compute y₀ and test it against the criterion; this is a reasoning example, not a measured vector. If the input leaves the domain, keys/parameters are reused, implementation diverges or versions mismatch, the model no longer holds.

## refs

- Wikipedia search entry for 截断差分. https://zh.wikipedia.org/w/index.php?search=%E6%88%AA%E6%96%AD%E5%B7%AE%E5%88%86
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[\mathrm{Adv}^{\mathrm{diff}}_A(\lambda)=\Pr[E_K(x)\oplus E_K(x\oplus\alpha)=\beta]\]

Truncated Differential Attack: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
