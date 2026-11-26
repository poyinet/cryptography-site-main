# Differential-Linear Cryptanalysis

## principle

**Attack**: Differential-Linear Cryptanalysis (差分线性). A differential-linear attack splits a block cipher into two parts: a high-probability differential covers the first part, a high-bias linear approximation covers the second, and chosen plaintexts connect the two to recover key bits.

## why

The goal is not simply to cover more rounds, but to reduce the required text by an order of magnitude at comparable speed; combining a differential with a linear approximation lets 8-round DES use only hundreds of chosen plaintexts.

Restate the chain as input → state → transform → output → criterion. Every step should identify who acts, what changes and what evidence remains. A step without evidence is marked unverified, not reproduced.

## used

The paper attacks 8-round DES: 512 chosen plaintexts recover 10 key bits with 80% success probability, 768 chosen plaintexts raise success to 95%, and the attack runs in under 10 seconds on a SUN-4 workstation.

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

Effectiveness depends on the differential probability, linear bias and number of chosen plaintexts; it recovers only some key bits, success varies with data volume, and it does not directly generalize to full key recovery for all round counts.

Adv_A = Pr[Succ_A] − Pr[Succ_ideal]；Cost = D × T × M；Success = 1[advantage > threshold]. Symbols are catalogue-level variables, not standard constants; parameters, test vectors and clauses remain with the registered source. The model states structural relations, not an implementation audit.

## history

Langford and Hellman introduced differential-linear cryptanalysis in their 1994 CRYPTO paper and showed on 8-round DES that it needs an order of magnitude less text than existing attacks.

Given abstract input x₀ and parameter p, compute y₀ and test it against the criterion; this is a reasoning example, not a measured vector. If the input leaves the domain, keys/parameters are reused, implementation diverges or versions mismatch, the model no longer holds.

## refs

- Wikipedia search entry for 差分线性. https://zh.wikipedia.org/w/index.php?search=%E5%B7%AE%E5%88%86%E7%BA%BF%E6%80%A7
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[\mathrm{Adv}^{\mathrm{diff}}_A(\lambda)=\Pr[E_K(x)\oplus E_K(x\oplus\alpha)=\beta]\]

Differential-Linear Cryptanalysis: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
