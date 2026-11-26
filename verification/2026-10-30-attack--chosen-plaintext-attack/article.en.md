# Chosen-Plaintext Attack

## principle

**Attack**: Chosen-Plaintext Attack (选择明文攻击). In a chosen-plaintext attack, the adversary chooses plaintext and is given the corresponding ciphertext.

## why

The adversary uses the obtained plaintext-ciphertext information to recover plaintext for previously unseen ciphertext.

Restate the chain as input → state → transform → output → criterion. Every step should identify who acts, what changes and what evidence remains. A step without evidence is marked unverified, not reproduced.

## used

A chosen-plaintext attack evaluates a scheme when the adversary can encrypt arbitrary plaintext.

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

A chosen-plaintext attack gives the adversary more capability than a known-plaintext attack, but it is still a specific model.

Adv_A = Pr[Succ_A] − Pr[Succ_ideal]；Cost = D × T × M；Success = 1[advantage > threshold]. Symbols are catalogue-level variables, not standard constants; parameters, test vectors and clauses remain with the registered source. The model states structural relations, not an implementation audit.

## history

HAC lists the chosen-plaintext attack in §1.13.1.

Given abstract input x₀ and parameter p, compute y₀ and test it against the criterion; this is a reasoning example, not a measured vector. If the input leaves the domain, keys/parameters are reused, implementation diverges or versions mismatch, the model no longer holds.

## refs

- Wikipedia search entry for 选择明文攻击. https://zh.wikipedia.org/w/index.php?search=%E9%80%89%E6%8B%A9%E6%98%8E%E6%96%87%E6%94%BB%E5%87%BB
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[\mathrm{Adv}^{\mathrm{attack}}_A(\lambda)=\Pr[\mathrm{Game}_A(\lambda)=1]-\frac12\]

Chosen-Plaintext Attack: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
