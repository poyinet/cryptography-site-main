# Algebraic Attack

## principle

**Attack**: Algebraic Attack (代数攻击). An algebraic attack represents cipher operations and S-boxes as polynomial equations over a finite field, then solves for key variables using linearization or elimination methods.

## why

Classical differential and linear analysis rely on probabilistic characteristics; algebraic attacks use deterministic equations that hold with probability 1, potentially bypassing the intuition that security grows exponentially with each round.

Restate the chain as input → state → transform → output → criterion. Every step should identify who acts, what changes and what evidence remains. A step without evidence is marked unverified, not reproduced.

## used

The paper applies algebraic methods to Rijndael/AES and Serpent, discusses equation-system construction for XL and XSL, and analyzes their quadratic equation systems and equation counts.

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

The size, degree and solving complexity of the system determine feasibility; linearization can blow up quickly, and XSL predictions rely on unverified assumptions, so algebraic attacks are not practical for every cipher.

Adv_A = Pr[Succ_A] − Pr[Succ_ideal]；Cost = D × T × M；Success = 1[advantage > threshold]. Symbols are catalogue-level variables, not standard constants; parameters, test vectors and clauses remain with the registered source. The model states structural relations, not an implementation audit.

## history

Courtois and Pieprzyk systematically studied overdefined algebraic systems for block ciphers in their 2002 ASIACRYPT paper, stimulating later algebraic cryptanalysis research.

Given abstract input x₀ and parameter p, compute y₀ and test it against the criterion; this is a reasoning example, not a measured vector. If the input leaves the domain, keys/parameters are reused, implementation diverges or versions mismatch, the model no longer holds.

## refs

- Wikipedia search entry for 代数攻击. https://zh.wikipedia.org/w/index.php?search=%E4%BB%A3%E6%95%B0%E6%94%BB%E5%87%BB
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[\mathrm{Adv}^{\mathrm{attack}}_A(\lambda)=\Pr[\mathrm{Game}_A(\lambda)=1]-\frac12\]

Algebraic Attack: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
