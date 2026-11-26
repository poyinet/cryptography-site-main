# Speculative Execution Side-Channel

## principle

**Attack**: Speculative Execution Side-Channel (推测执行侧信道). The Meltdown abstract gives the mechanism: "Meltdown exploits side effects of out-of-order execution on modern processors to read arbitrary kernel-memory locations including personal data and passwords", and notes that "Out-of-order execution is an indispensable performance feature and present in a wide range of modern processors" — the side effects of a performance feature become the observation channel.

## why

The abstract places the root cause in hardware rather than software: "The root cause of Meltdown is the hardware. The attack is independent of the operating system, and it does not rely on any software vulnerabilities." The isolation failure is therefore not a bug in one program, and on affected systems "Meltdown enables an adversary to read memory of other processes or virtual machines in the cloud without any permissions or privileges".

## used

The paper also delivers a deployment conclusion: "We show that the KAISER defense mechanism for KASLR has the important (but inadvertent) side effect of impeding Meltdown. We stress that KAISER must be deployed immediately…" — what the abstract calls the KAISER defense mechanism for KASLR incidentally impedes the attack, and the paper’s deployment conclusion is that KAISER must be deployed immediately.

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

The abstract makes only a bounded claim about scope: "The attack works on different Intel microarchitectures since at least 2010 and potentially other processors are affected" — Intel microarchitectures are named, other vendors appear only as potentially affected, and this entry draws no conclusion beyond that. Success also depends on out-of-order execution itself, so it is not a software bug that can be patched away; the abstract puts the root cause in the hardware.

## history

The arXiv record 1801.01207, "Meltdown", is authored by Moritz Lipp, Michael Schwarz, Daniel Gruss, Thomas Prescher, Werner Haas, Stefan Mangard, Paul Kocher, Daniel Genkin, Yuval Yarom and Mike Hamburg, submitted on Wednesday 3 January 2018 under cs.CR; the abstract itself is the primary record of this class of speculative-read attacks disclosed in early 2018.

## refs

- Wikipedia search entry for 推测执行侧信道. https://zh.wikipedia.org/w/index.php?search=%E6%8E%A8%E6%B5%8B%E6%89%A7%E8%A1%8C%E4%BE%A7%E4%BF%A1%E9%81%93
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[\mathrm{Adv}^{\mathrm{attack}}_A(\lambda)=\Pr[\mathrm{Game}_A(\lambda)=1]-\frac12\]

Speculative Execution Side-Channel: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
