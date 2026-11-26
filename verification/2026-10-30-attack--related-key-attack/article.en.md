# Related-Key Attack

## principle

**Attack**: Related-Key Attack (相关密钥攻击). In a related-key attack, the adversary is assumed to have access to encryptions of plaintexts under an unknown key and under unknown keys chosen or known to have certain relationships with it.

## why

HAC lists the related-key attack as an additional attack class; it is somewhat more hypothetical but useful for analyzing and comparing ciphers.

Restate the chain as input → state → transform → output → criterion. Every step should identify who acts, what changes and what evidence remains. A step without evidence is marked unverified, not reproduced.

## used

Related-key attacks are used to analyze and compare how resistant ciphers are to related keys.

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

The model assumes encryption access under related keys; this is a model assumption, not a deployment fact.

Adv_A = Pr[Succ_A] − Pr[Succ_ideal]；Cost = D × T × M；Success = 1[advantage > threshold]. Symbols are catalogue-level variables, not standard constants; parameters, test vectors and clauses remain with the registered source. The model states structural relations, not an implementation audit.

## history

HAC discusses the related-key attack in Note 7.6.

Given abstract input x₀ and parameter p, compute y₀ and test it against the criterion; this is a reasoning example, not a measured vector. If the input leaves the domain, keys/parameters are reused, implementation diverges or versions mismatch, the model no longer holds.

## refs

- Wikipedia search entry for 相关密钥攻击. https://zh.wikipedia.org/w/index.php?search=%E7%9B%B8%E5%85%B3%E5%AF%86%E9%92%A5%E6%94%BB%E5%87%BB
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[\mathrm{Adv}^{\mathrm{attack}}_A(\lambda)=\Pr[\mathrm{Game}_A(\lambda)=1]-\frac12\]

Related-Key Attack: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
