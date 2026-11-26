# Rotational Attack

## principle

**Attack**: Rotational Attack (旋转攻击). A rotational attack exploits the rotational symmetry of ARX primitives. A rotational pair is an input pair of the form (X, X<<<r); XOR and rotation preserve the relation with probability 1, each modular addition preserves it with probability at most about 3/8, and round constants and key addition perturb it further.

## why

Modular addition, XOR and rotations commute with rotation when carries are ignored; this compatibility lets rotational relations pass through ARX rounds with some probability, but constants, round counters and key addition break the symmetry.

Restate the chain as input → state → transform → output → criterion. Every step should identify who acts, what changes and what evidence remains. A step without evidence is marked unverified, not reproduced.

## used

The paper applies rotational analysis to ARX systems, gives the best known attack at the time on reduced Threefish (the Skein core), and discusses the functional completeness of ARX with constants in §5.

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

The probability of a rotational pair depends on addition carries and round constants; constants perturb the symmetry, but in some designs the attacker can cancel them with key corrections, so the attack is not universal for all ARX ciphers.

Adv_A = Pr[Succ_A] − Pr[Succ_ideal]；Cost = D × T × M；Success = 1[advantage > threshold]. Symbols are catalogue-level variables, not standard constants; parameters, test vectors and clauses remain with the registered source. The model states structural relations, not an implementation audit.

## history

Khovratovich and Nikolić systematized rotational cryptanalysis of ARX in their 2010 FSE paper and gave reduced-round Threefish attacks and weak-key classes.

Given abstract input x₀ and parameter p, compute y₀ and test it against the criterion; this is a reasoning example, not a measured vector. If the input leaves the domain, keys/parameters are reused, implementation diverges or versions mismatch, the model no longer holds.

## refs

- Wikipedia search entry for 旋转攻击. https://zh.wikipedia.org/w/index.php?search=%E6%97%8B%E8%BD%AC%E6%94%BB%E5%87%BB
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[\mathrm{Adv}^{\mathrm{diff}}_A(\lambda)=\Pr[E_K(x)\oplus E_K(x\oplus\alpha)=\beta]\]

Rotational Attack: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
