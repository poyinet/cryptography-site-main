# Cold Boot Attack

## principle

**Attack**: Cold Boot Attack (冷启动攻击). A cold boot attack exploits DRAM remanence: after cutting power, the attacker quickly reboots the machine (or transplants the memory chips into another computer), images memory and recovers keys from it. The paper defeated disk encryption systems including BitLocker, TrueCrypt and FileVault by recovering keys from memory images.

## why

DRAM contents do not vanish immediately after power loss but decay gradually: at normal temperatures they typically persist for several seconds before rapid decay, and at low temperatures they can persist for minutes or even hours. The paper also found that decay timing and ground states are often predictable, allowing key reconstruction with error correction.

Restate the chain as input → state → transform → output → criterion. Every step should identify who acts, what changes and what evidence remains. A step without evidence is marked unverified, not reproduced.

## used

The paper recovered keys from disk encryption systems, as well as a Mac OS X login password and RSA private keys from an Apache server. The authors note that any sensitive data present in memory when an attacker gains physical access may be affected.

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

Cold boot attacks require physical access rather than remote execution; defenses include scrubbing or obscuring keys before losing physical control, restricting boot from network or removable media, protecting DRAM chips and making memory decay faster. The paper concludes that these measures only partially mitigate the risk and that no simple remedy eliminates it.

Adv_A = Pr[Succ_A] − Pr[Succ_ideal]；Cost = D × T × M；Success = 1[advantage > threshold]. Symbols are catalogue-level variables, not standard constants; parameters, test vectors and clauses remain with the registered source. The model states structural relations, not an implementation audit.

## history

Halderman et al. systematically studied DRAM remanence and its impact on encryption systems in the 2008 USENIX Security paper “Lest We Remember: Cold Boot Attacks on Encryption Keys”.

Given abstract input x₀ and parameter p, compute y₀ and test it against the criterion; this is a reasoning example, not a measured vector. If the input leaves the domain, keys/parameters are reused, implementation diverges or versions mismatch, the model no longer holds.

## refs

- Wikipedia search entry for 冷启动攻击. https://zh.wikipedia.org/w/index.php?search=%E5%86%B7%E5%90%AF%E5%8A%A8%E6%94%BB%E5%87%BB
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[\mathrm{Adv}^{\mathrm{attack}}_A(\lambda)=\Pr[\mathrm{Game}_A(\lambda)=1]-\frac12\]

Cold Boot Attack: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
