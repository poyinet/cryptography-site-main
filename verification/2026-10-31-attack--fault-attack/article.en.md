# Fault Injection Attack

## principle

**Attack**: Fault Attack (故障注入攻击). A fault attack exploits errors produced by hardware during computation. For CRT-based RSA signatures, if the fault occurs in the computation for only one CRT prime, a correct and a faulty signature of the same message, or a single faulty signature on a known message, can reveal the factorization of N through a greatest common divisor; non-CRT implementations generally require many more faults.

## why

Hardware faults are rare but do occur, and an attacker with physical access can also induce them; faulty outputs let the attacker bypass the difficulty of directly factoring the modulus.

Restate the chain as input → state → transform → output → criterion. Every step should identify who acts, what changes and what evidence remains. A step without evidence is marked unverified, not reproduced.

## used

The paper attacks specific CRT-RSA and Rabin signature implementations using single-prime computation faults, and also breaks the Fiat-Shamir and Schnorr identification protocols; a certification authority issuing faulty certificates is a realistic scenario.

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

Defenses include verifying the result before releasing a signature, using error-detection bits or CRCs, and random padding; the paper stresses that unverified results should not be sent out, and notes that verification alone does not fix register faults in Fiat-Shamir or Schnorr.

Adv_A = Pr[Succ_A] − Pr[Succ_ideal]；Cost = D × T × M；Success = 1[advantage > threshold]. Symbols are catalogue-level variables, not standard constants; parameters, test vectors and clauses remain with the registered source. The model states structural relations, not an implementation audit.

## history

Boneh, DeMillo and Lipton introduced fault attacks in their 1997 EUROCRYPT paper and extended them to several signature and identification protocols.

Given abstract input x₀ and parameter p, compute y₀ and test it against the criterion; this is a reasoning example, not a measured vector. If the input leaves the domain, keys/parameters are reused, implementation diverges or versions mismatch, the model no longer holds.

## refs

- Wikipedia search entry for 故障注入攻击. https://zh.wikipedia.org/w/index.php?search=%E6%95%85%E9%9A%9C%E6%B3%A8%E5%85%A5%E6%94%BB%E5%87%BB
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[\mathrm{Adv}^{\mathrm{attack}}_A(\lambda)=\Pr[\mathrm{Game}_A(\lambda)=1]-\frac12\]

Fault Attack: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
