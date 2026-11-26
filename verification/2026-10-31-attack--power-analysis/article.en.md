# Power Analysis

## principle

**Attack**: Power Analysis (功耗分析). Power analysis infers keys or intermediate values from the power consumption of a cryptographic device during computation. Simple power analysis (SPA) directly interprets power traces, while differential power analysis (DPA) statistically correlates guessed intermediate values with many traces.

## why

Semiconductor logic gates consume power and emit electromagnetic radiation as charge is applied or removed, so power consumption depends on the instructions executed and the data processed. Even constant-execution-path code can have serious power leakage on some microprocessors, and DPA can recover keys from noisy measurements using statistical methods.

Restate the chain as input → state → transform → output → criterion. Every step should identify who acts, what changes and what evidence remains. A step without evidence is marked unverified, not reproduced.

## used

The paper focuses on tamper-resistant devices such as smart cards and notes that DPA can break implementations of almost any symmetric or asymmetric algorithm, and can even reverse-engineer unknown algorithms and protocols. The authors also stress that the attacks were not limited to smart cards in their lab: they extracted keys from almost 50 different products.

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

Countermeasures fall into three categories: reducing signal size (constant execution path, balanced Hamming weights, shielding), adding noise and randomizing timing, and leak-tolerant design such as key updates and key-use counters. The paper notes that signal-size reduction generally cannot reduce the signal to zero; noise and timing randomization raise the number of required samples but can be bypassed or compensated; leak-tolerant design is the more reliable approach, and high-order DPA can still defeat many countermeasures.

Adv_A = Pr[Succ_A] − Pr[Succ_ideal]；Cost = D × T × M；Success = 1[advantage > threshold]. Symbols are catalogue-level variables, not standard constants; parameters, test vectors and clauses remain with the registered source. The model states structural relations, not an implementation audit.

## history

Kocher, Jaffe and Jun introduced differential power analysis systematically in their 1999 CRYPTO paper, presenting experimental SPA/DPA results and a taxonomy of countermeasures. The work helped establish side-channel evaluation for devices such as smart cards.

Given abstract input x₀ and parameter p, compute y₀ and test it against the criterion; this is a reasoning example, not a measured vector. If the input leaves the domain, keys/parameters are reused, implementation diverges or versions mismatch, the model no longer holds.

## refs

- Wikipedia search entry for 功耗分析. https://zh.wikipedia.org/w/index.php?search=%E5%8A%9F%E8%80%97%E5%88%86%E6%9E%90
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[\mathrm{Adv}^{\mathrm{attack}}_A(\lambda)=\Pr[\mathrm{Game}_A(\lambda)=1]-\frac12\]

Power Analysis: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
