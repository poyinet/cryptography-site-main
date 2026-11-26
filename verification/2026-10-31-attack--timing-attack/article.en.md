# Timing Attack

## principle

**Attack**: Timing Attack (计时攻击). A timing attack infers secrets by carefully measuring the execution time of private-key operations. Kocher showed that, against a vulnerable implementation, an attacker can recover fixed Diffie-Hellman exponents, factor RSA keys and break other cryptosystems; the attack is computationally inexpensive and often needs only known ciphertext.

## why

Cryptosystems take slightly different amounts of time for different inputs because of performance optimizations, branches and conditional statements, cache hits and processor instructions with non-fixed timing, and the time typically depends on both the key and the input data. Kocher argued that such unintentional timing characteristics can leak the entire key, not merely its Hamming weight.

Restate the chain as input → state → transform → output → criterion. Every step should identify who acts, what changes and what evidence remains. A step without evidence is marked unverified, not reproduced.

## used

The paper identifies cryptographic tokens, network-based cryptosystems and other applications where an attacker can make reasonably accurate timing measurements as potentially at risk, using Diffie-Hellman, RSA and DSS private-key operations as examples. An attacker can passively eavesdrop on an interactive protocol, record the messages and measure response times.

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

Defenses include fixed-time implementations, random delays and blinding. Kocher notes that fixed-time implementations are difficult and often slow; random delays can make measurements noisy enough to render an attack infeasible, though attackers can compensate with more samples; blinding is the better solution, but it does not provably prevent all timing attacks, and some systems need to be revised.

Adv_A = Pr[Succ_A] − Pr[Succ_ideal]；Cost = D × T × M；Success = 1[advantage > threshold]. Symbols are catalogue-level variables, not standard constants; parameters, test vectors and clauses remain with the registered source. The model states structural relations, not an implementation audit.

## history

Kocher introduced timing attacks in his 1996 CRYPTO paper, which also presented prevention techniques for RSA and Diffie-Hellman. The conclusion notes that timing channels can sometimes compromise keys and that new protocols and algorithms may need to incorporate countermeasures.

Given abstract input x₀ and parameter p, compute y₀ and test it against the criterion; this is a reasoning example, not a measured vector. If the input leaves the domain, keys/parameters are reused, implementation diverges or versions mismatch, the model no longer holds.

## refs

- Wikipedia search entry for 计时攻击. https://zh.wikipedia.org/w/index.php?search=%E8%AE%A1%E6%97%B6%E6%94%BB%E5%87%BB
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[\mathrm{Adv}^{\mathrm{attack}}_A(\lambda)=\Pr[\mathrm{Game}_A(\lambda)=1]-\frac12\]

Timing Attack: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
