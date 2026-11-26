# Side-Channel Attack

## principle

**Attack**: Side-Channel Attack (侧信道攻击). A side-channel attack infers keys or secrets from physical leakage of a cryptographic implementation, such as execution time, rather than attacking the algorithm’s mathematical structure. Kocher’s timing attack showed that carefully measuring private-key operation time can recover keys.

## why

Implementation time varies with keys and data, so measuring those differences can bypass the algorithm’s mathematical security. Timing differences come from branches, caches and non-fixed-time instructions.

Restate the chain as input → state → transform → output → criterion. Every step should identify who acts, what changes and what evidence remains. A step without evidence is marked unverified, not reproduced.

## used

Power analysis can target tamper-resistant devices such as smart cards and almost any symmetric or asymmetric algorithm, and can even reverse-engineer unknown algorithms and protocols. The authors also stress that the attacks were not limited to smart cards in their lab: they extracted keys from almost 50 different products.

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

Power-analysis defenses include reducing signal size, adding noise and randomizing timing, and leak-tolerant design. The paper notes that signal reduction generally cannot reduce leakage to zero; noise raises the sample count, timing randomization can be bypassed or compensated, and high-order DPA can still defeat many countermeasures.

Adv_A = Pr[Succ_A] − Pr[Succ_ideal]；Cost = D × T × M；Success = 1[advantage > threshold]. Symbols are catalogue-level variables, not standard constants; parameters, test vectors and clauses remain with the registered source. The model states structural relations, not an implementation audit.

## history

Kocher introduced timing attacks in 1996, and Kocher, Jaffe and Jun introduced differential power analysis systematically in 1999; these two papers laid the foundation for side-channel analysis.

Given abstract input x₀ and parameter p, compute y₀ and test it against the criterion; this is a reasoning example, not a measured vector. If the input leaves the domain, keys/parameters are reused, implementation diverges or versions mismatch, the model no longer holds.

## refs

- Wikipedia search entry for 侧信道攻击. https://zh.wikipedia.org/w/index.php?search=%E4%BE%A7%E4%BF%A1%E9%81%93%E6%94%BB%E5%87%BB
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[\mathrm{Adv}^{\mathrm{attack}}_A(\lambda)=\Pr[\mathrm{Game}_A(\lambda)=1]-\frac12\]

Side-Channel Attack: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
