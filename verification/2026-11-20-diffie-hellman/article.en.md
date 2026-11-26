# Diffie-Hellman Key Agreement

## principle

**Algorithm**: Diffie-Hellman Key Agreement (Diffie-Hellman 密钥协商). The paper proposes a public key distribution system, not a key wrapped by one party and transported to the other. It says: “Public key distribution systems offer a different approach to eliminating the need for a secure key distribution channel.” In such a system, “two users who wish to exchange a key communicate back and forth until they arrive at a key in common”, while “A third party eavesdropping on this exchange must find it computationally infeasible to compute the key from the information overheard”. The mechanism rests on discrete logarithms over a finite field: “The new technique makes use of the apparent difficulty of computing logarithms over a finite field GF(q) with a prime number q of elements.”

## why

The design avoids dependence on a secure key-distribution channel set up in advance. The paper calls public key distribution “a different approach to eliminating the need for a secure key distribution channel”: the two parties need no prior shared secret, and can arrive at a common key by exchanging public values. Its security is computational, not information-theoretic perfect secrecy: “The security of our technique depends crucially on the difficulty of computing logarithms mod q”, and the paper treats q^(1/2) as “a good measure of the problem's complexity” — a 1976 estimate.

## used

The procedure is: each user independently generates a random secret exponent, keeps it secret, and places the corresponding public value in a public file. The paper says: “Each user generates an independent random number”; “Each keeps Xi secret, but places”; the public value “in a public file with his name and address”. The two parties then each use their own secret exponent with the other's public value to compute the same key. This entry describes only that key-agreement step; it is not a digital signature, certificate issuance, or a complete deployed protocol, and the paper does not supply a PKI for maintaining the public file.

## broken

The paper grounds security in the hardness of discrete logarithms and explicitly treats it as an assumption: “The security of our technique depends crucially on the difficulty of computing logarithms mod q”; if logs are easy, “the system can be broken”. The authors also write: “we do not currently have a proof of the converse” — there is no proof that hard discrete logs imply a secure system. This entry therefore cannot turn the 1976 q^(1/2) estimate into a modern security proof; the paper supplies neither a concrete attack nor a reduction. The difficulty of computing the key from public values for a passive eavesdropper remains the scheme's central boundary.

## history

The paper is titled “New Directions in Cryptography” by “WHITFIELD DIFFIE AND MARTIN E. HELLMAN, MEMBER, IEEE”, published in IEEE Transactions on Information Theory 22(6), November 1976, pages 644–654; the first page records “Manuscript received June 3,1976.” It proposes public-key distribution and discusses public-key cryptosystems, but the authors themselves write: “We propose some techniques for developing public key cryptosystems, but the problem is still largely open.” This entry therefore dates the 1976 paper as a public proposal of key distribution; it is not a deployed protocol, a delivered digital signature, or a proven-secure system.

## refs

- Wikipedia search entry for Diffie-Hellman 密钥协商. https://zh.wikipedia.org/w/index.php?search=Diffie-Hellman%20%E5%AF%86%E9%92%A5%E5%8D%8F%E5%95%86
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/
- Diffie, Hellman: New Directions in Cryptography. https://ee.stanford.edu/~hellman/publications/24.pdf

## example

**Formal model and reproduction steps**

\[K=g^{ab}\bmod p\quad\text{或}\quad K=[ab]G\]

Diffie-Hellman Key Agreement: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
