# Distinguishing Attack

## principle

**Attack**: Distinguishing Attack (区分攻击). A distinguishing attack uses a statistical test to decide whether cipher output looks random or like the output of a particular cipher; it need not recover the key, but it demonstrates a detectable non-random bias.

## why

Any measurable deviation from a uniform random distribution lets an attacker distinguish; the larger the bias and the less output required, the stronger the distinguishing attack.

Restate the chain as input → state → transform → output → criterion. Every step should identify who acts, what changes and what evidence remains. A step without evidence is marked unverified, not reproduced.

## used

The paper computes digraph probabilities exactly for small output widths (n=3–5) and extrapolates to 8-bit RC4: about 2^30.6 bytes of output (at 10% false-positive/false-negative rates) suffice to distinguish RC4 from randomness; it also observes that parts of the internal state can sometimes be determined with non-trivial probability.

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

A distinguishing attack requires enough output and a correct statistical model; it is not equivalent to key recovery, more output strengthens the statistical test, and subsequent processing or parameter changes can alter the observable bias.

Adv_A = Pr[Succ_A] − Pr[Succ_ideal]；Cost = D × T × M；Success = 1[advantage > threshold]. Symbols are catalogue-level variables, not standard constants; parameters, test vectors and clauses remain with the registered source. The model states structural relations, not an implementation audit.

## history

Fluhrer and McGrew systematically computed RC4 digraph biases in their 2000 FSE paper and gave the RC4 distinguishing attack with the lowest output requirement at the time.

Given abstract input x₀ and parameter p, compute y₀ and test it against the criterion; this is a reasoning example, not a measured vector. If the input leaves the domain, keys/parameters are reused, implementation diverges or versions mismatch, the model no longer holds.

## refs

- Wikipedia search entry for 区分攻击. https://zh.wikipedia.org/w/index.php?search=%E5%8C%BA%E5%88%86%E6%94%BB%E5%87%BB
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[\mathrm{Adv}^{\mathrm{attack}}_A(\lambda)=\Pr[\mathrm{Game}_A(\lambda)=1]-\frac12\]

Distinguishing Attack: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
