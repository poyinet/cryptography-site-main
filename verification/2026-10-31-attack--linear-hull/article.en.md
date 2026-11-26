# Linear Hull

## principle

**Attack**: Linear Hull (线性壳). A linear hull is the family of all linear trails with the same input and output masks; its potential is the sum of squared trail correlations under the usual correlation convention, not the correlation of a single trail.

## why

Matsui’s Algorithm 2 actually uses a family of linear approximations rather than one trail; looking at a single trail underestimates success, and the linear hull provides a more accurate framework.

Restate the chain as input → state → transform → output → criterion. Every step should identify who acts, what changes and what evidence remains. A step without evidence is marked unverified, not reproduced.

## used

The paper uses linear hulls to analyze Algorithm 2 on DES-like ciphers, derives formulas for success rate and required known plaintexts, and discusses the influence of the plaintext distribution.

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

A linear hull’s correlation may depend on the key and round subkeys, so actual strength can be higher or lower than a single-trail estimate; proven resistance requires controlling the whole hull, not merely removing high-bias trails.

Adv_A = Pr[Succ_A] − Pr[Succ_ideal]；Cost = D × T × M；Success = 1[advantage > threshold]. Symbols are catalogue-level variables, not standard constants; parameters, test vectors and clauses remain with the registered source. The model states structural relations, not an implementation audit.

## history

Nyberg introduced linear hulls systematically in her 1994 EUROCRYPT paper, providing a theoretical foundation for Matsui’s linear cryptanalysis.

Given abstract input x₀ and parameter p, compute y₀ and test it against the criterion; this is a reasoning example, not a measured vector. If the input leaves the domain, keys/parameters are reused, implementation diverges or versions mismatch, the model no longer holds.

## refs

- Wikipedia search entry for 线性壳. https://zh.wikipedia.org/w/index.php?search=%E7%BA%BF%E6%80%A7%E5%A3%B3
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[\mathrm{Adv}^{\mathrm{diff}}_A(\lambda)=\Pr[E_K(x)\oplus E_K(x\oplus\alpha)=\beta]\]

Linear Hull: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
