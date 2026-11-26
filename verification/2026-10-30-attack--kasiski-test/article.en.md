# Kasiski Examination

## principle

**Attack**: Kasiski Examination (卡斯基基检验). Kasiski’s method uses common factors of distances between repeated ciphertext segments to infer the keyword length.

## why

Repeated plaintext portions encrypted with the same keyword portion produce identical ciphertext segments.

Restate the chain as input → state → transform → output → criterion. Every step should identify who acts, what changes and what evidence remains. A step without evidence is marked unverified, not reproduced.

## used

Kasiski’s method analyzes polyalphabetic ciphers with repeated keywords, such as Vigenère.

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

Coincidental repetitions interfere with the analysis; repeated segments of length 4 or more are more useful.

Adv_A = Pr[Succ_A] − Pr[Succ_ideal]；Cost = D × T × M；Success = 1[advantage > threshold]. Symbols are catalogue-level variables, not standard constants; parameters, test vectors and clauses remain with the registered source. The model states structural relations, not an implementation audit.

## history

HAC discusses Kasiski’s method in §7.3.5(iv).

Given abstract input x₀ and parameter p, compute y₀ and test it against the criterion; this is a reasoning example, not a measured vector. If the input leaves the domain, keys/parameters are reused, implementation diverges or versions mismatch, the model no longer holds.

## refs

- Wikipedia search entry for 卡斯基基检验. https://zh.wikipedia.org/w/index.php?search=%E5%8D%A1%E6%96%AF%E5%9F%BA%E5%9F%BA%E6%A3%80%E9%AA%8C
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[\mathrm{Adv}^{\mathrm{attack}}_A(\lambda)=\Pr[\mathrm{Game}_A(\lambda)=1]-\frac12\]

Kasiski Examination: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
