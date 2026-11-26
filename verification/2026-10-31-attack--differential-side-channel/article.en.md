# Differential Side-Channel Attack

## principle

**Attack**: Differential Side-Channel (差分侧信道). Differential side-channel analysis compares many measurement traces and statistically correlates guessed intermediate values with physical leakage such as power consumption to recover keys; differential power analysis is its canonical power-measurement form.

## why

Leakage in a single trace may be masked by noise; statistical differencing accumulates small data-dependent differences across many traces so the attacker can still recover keys.

Restate the chain as input → state → transform → output → criterion. Every step should identify who acts, what changes and what evidence remains. A step without evidence is marked unverified, not reproduced.

## used

The paper focuses on tamper-resistant devices such as smart cards and notes that DPA can break implementations of almost any symmetric or asymmetric algorithm, and can even reverse-engineer unknown algorithms and protocols.

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

Defenses include reducing signal size, adding noise and randomization, and leak-tolerant design; these raise the cost but signal reduction generally cannot reduce leakage to zero, and high-order DPA can still defeat many countermeasures.

Adv_A = Pr[Succ_A] − Pr[Succ_ideal]；Cost = D × T × M；Success = 1[advantage > threshold]. Symbols are catalogue-level variables, not standard constants; parameters, test vectors and clauses remain with the registered source. The model states structural relations, not an implementation audit.

## history

Kocher, Jaffe and Jun introduced differential power analysis systematically in their 1999 CRYPTO paper, laying the foundation for differential side-channel analysis.

Given abstract input x₀ and parameter p, compute y₀ and test it against the criterion; this is a reasoning example, not a measured vector. If the input leaves the domain, keys/parameters are reused, implementation diverges or versions mismatch, the model no longer holds.

## refs

- Wikipedia search entry for 差分侧信道. https://zh.wikipedia.org/w/index.php?search=%E5%B7%AE%E5%88%86%E4%BE%A7%E4%BF%A1%E9%81%93
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[\mathrm{Adv}^{\mathrm{diff}}_A(\lambda)=\Pr[E_K(x)\oplus E_K(x\oplus\alpha)=\beta]\]

Differential Side-Channel: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
