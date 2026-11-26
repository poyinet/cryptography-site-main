# XSL Attack

## principle

**Attack**: XSL Attack (XSL 攻击). XSL is an algebraic attack: it writes S-boxes as an overdefined system of polynomial equations, then uses linearization (XL) extended with S-box structure to eliminate variables and solve for key variables.

## why

AES and Serpent are built from small S-boxes and linear layers, and the S-box relations hold with probability 1; if an overdefined system can exploit this deterministic structure, security may no longer grow exponentially with rounds.

Restate the chain as input → state → transform → output → criterion. Every step should identify who acts, what changes and what evidence remains. A step without evidence is marked unverified, not reproduced.

## used

The paper applies XSL to Rijndael/AES and Serpent and argues that XL alone is inefficient. XSL over GF(2) gives complexity around 2^298 for 128-bit Rijndael with a 256-bit key and does not yet break it; for 256-bit Serpent it gives around 2^210 and seems to marginally break it (unproven); only the second variant using GF(256) equations yields the conditional estimate around 2^87 for AES-128.

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

XSL complexity estimates depend on assumptions about equation counts, linearization and elimination; the paper uses conditional language and does not validate at full scale (only small heuristic simulations are reported), so the predictions should not be treated as an achieved break.

Adv_A = Pr[Succ_A] − Pr[Succ_ideal]；Cost = D × T × M；Success = 1[advantage > threshold]. Symbols are catalogue-level variables, not standard constants; parameters, test vectors and clauses remain with the registered source. The model states structural relations, not an implementation audit.

## history

Courtois and Pieprzyk introduced XSL in their 2002 ASIACRYPT paper and analyzed the algebraic structure of AES and Serpent.

Given abstract input x₀ and parameter p, compute y₀ and test it against the criterion; this is a reasoning example, not a measured vector. If the input leaves the domain, keys/parameters are reused, implementation diverges or versions mismatch, the model no longer holds.

## refs

- Wikipedia search entry for XSL 攻击. https://zh.wikipedia.org/w/index.php?search=XSL%20%E6%94%BB%E5%87%BB
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[\mathrm{Adv}^{\mathrm{attack}}_A(\lambda)=\Pr[\mathrm{Game}_A(\lambda)=1]-\frac12\]

XSL Attack: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
