# Grover's Algorithm

## principle

**Attack**: Grover's Algorithm (格罗弗算法). Grover's paper is titled "A fast quantum mechanical algorithm for database search" and uses a shuffled phone directory: "Imagine a phone directory containing N names arranged in completely random order. In order to find someone's phone number with a 50% probability, any classical algorithm (whether deterministic or probabilistic) will need to look at a minimum of N/2 names", whereas with the quantum scheme "the desired phone number can be obtained in only O(sqrt(N)) steps". The v3 comments record that the proof was simplified using a new interpretation termed "inversion about average", with the algorithm unchanged.

## why

The paper positions its advantage: "The algorithm is within a small constant factor of the fastest possible quantum mechanical algorithm". For cryptography this matters because exhaustive search over a symmetric key drops from a number proportional to the key space to a square-root order, so the security strength measured in bits halves.

## used

The paper frames its use as database and unstructured search, with the phone-directory lookup as its example, and gives the O(sqrt(N)) evaluation count. The comments field records that it "is an updated version of a paper that was originally presented at STOC 1996". Doubling symmetric key sizes to offset a square-root search is an applied consequence of this result; the paper itself sets no cryptographic parameter requirements.

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

The guarantee is probabilistic: the abstract states the success condition "with a 50% probability" and gives the classical floor as needing "a minimum of N/2 names". Its optimality claim is relative — within "a small constant factor of the fastest possible quantum mechanical algorithm" — rather than an unconditional statement of optimality. The words `quadratic speedup`, `unstructured search` and `OPTIMAL` do not appear in this text.

## history

The arXiv record is quant-ph/9605043 by Lov K. Grover (Bell Labs, Murray Hill NJ); v1 was submitted on 29 May 1996, v2 was withdrawn the next day, and the current v3 was revised on 19 November 1996. The journal reference is "Proceedings, 28th Annual ACM Symposium on the Theory of Computing (STOC), May 1996, pages 212-219". The abstract gives O(sqrt(N)) against the classical floor of N/2.

## refs

- Wikipedia search entry for 格罗弗算法. https://zh.wikipedia.org/w/index.php?search=%E6%A0%BC%E7%BD%97%E5%BC%97%E7%AE%97%E6%B3%95
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[Q=\Theta\!\left(\sqrt{|\mathcal{K}|}\right)=\Theta(2^{\kappa/2})\]

Grover's Algorithm: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
