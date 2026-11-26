# Multiple Linear Cryptanalysis

## principle

**Attack**: Multiple Linear Cryptanalysis (多重线性). Multiple linear cryptanalysis uses several linear approximations at once, combines the information from each, and recovers the key by maximum likelihood or linear-system methods.

## why

A single approximation exploits only one bias and wastes other available information; multiple approximations can significantly reduce data and time complexity, and the paper gives unified gain formulas for Algorithms 1 and 2.

Restate the chain as input → state → transform → output → criterion. Every step should identify who acts, what changes and what evidence remains. A step without evidence is marked unverified, not reproduced.

## used

The paper benchmarks the method on reduced-round DES: Algorithm 1 reduces data and time complexity by several orders of magnitude, while Algorithm 2 roughly halves the data and reduces the search phase by several orders, which the paper suggests may outperform the best full-DES attacks at the time.

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

Effectiveness depends on the number, bias and statistical independence of available approximations; it needs sufficient data and a correct maximum-likelihood model, and correlation among approximations or model errors reduce the gain.

Adv_A = Pr[Succ_A] − Pr[Succ_ideal]；Cost = D × T × M；Success = 1[advantage > threshold]. Symbols are catalogue-level variables, not standard constants; parameters, test vectors and clauses remain with the registered source. The model states structural relations, not an implementation audit.

## history

Biryukov, De Cannière and Quisquater gave a unified statistical framework and gain formulas for multiple linear approximations in their 2004 CRYPTO paper.

Given abstract input x₀ and parameter p, compute y₀ and test it against the criterion; this is a reasoning example, not a measured vector. If the input leaves the domain, keys/parameters are reused, implementation diverges or versions mismatch, the model no longer holds.

## refs

- Wikipedia search entry for 多重线性. https://zh.wikipedia.org/w/index.php?search=%E5%A4%9A%E9%87%8D%E7%BA%BF%E6%80%A7
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[\mathrm{Adv}^{\mathrm{diff}}_A(\lambda)=\Pr[E_K(x)\oplus E_K(x\oplus\alpha)=\beta]\]

Multiple Linear Cryptanalysis: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
