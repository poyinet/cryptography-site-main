# Higher-Order Differential Attack

## principle

**Attack**: Higher-Order Differential Attack (高阶差分). A higher-order differential takes the k-th derivative of a function over a k-dimensional subspace; if the algebraic degree is less than k, the derivative is zero. The attacker covers the subspace with 2^k chosen plaintexts to exploit this property.

## why

High nonlinearity does not automatically guarantee resistance to higher-order differentials: the Walsh spectrum of almost bent functions has divisibility properties that lower the degree bound of compositions, making 5-round Feistel structures potentially vulnerable.

Restate the chain as input → state → transform → output → criterion. Every step should identify who acts, what changes and what evidence remains. A step without evidence is marked unverified, not reproduced.

## used

The paper gives a higher-order differential attack on 5-round Feistel ciphers using almost bent substitution boxes, excluding almost bent functions of maximum degree, and shows that the known weakness of a reduced MISTY1 version follows directly from almost bent S-boxes.

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

The attack requires a degree bound for the reduced cipher and 2^k chosen plaintexts; designers can improve resistance by controlling the Walsh spectrum and composition degree, but not by increasing nonlinearity alone.

Adv_A = Pr[Succ_A] − Pr[Succ_ideal]；Cost = D × T × M；Success = 1[advantage > threshold]. Symbols are catalogue-level variables, not standard constants; parameters, test vectors and clauses remain with the registered source. The model states structural relations, not an implementation audit.

## history

Knudsen applied higher-order derivatives to block ciphers and systematized higher-order differential cryptanalysis; Canteaut and Videau gave a new degree bound and a 5-round Feistel attack in their 2002 EUROCRYPT paper.

Given abstract input x₀ and parameter p, compute y₀ and test it against the criterion; this is a reasoning example, not a measured vector. If the input leaves the domain, keys/parameters are reused, implementation diverges or versions mismatch, the model no longer holds.

## refs

- Wikipedia search entry for 高阶差分. https://zh.wikipedia.org/w/index.php?search=%E9%AB%98%E9%98%B6%E5%B7%AE%E5%88%86
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[\mathrm{Adv}^{\mathrm{diff}}_A(\lambda)=\Pr[E_K(x)\oplus E_K(x\oplus\alpha)=\beta]\]

Higher-Order Differential Attack: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
