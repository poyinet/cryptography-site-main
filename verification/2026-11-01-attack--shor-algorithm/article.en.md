# Shor's Algorithm

## principle

**Attack**: Shor's Algorithm (肖尔算法). NIST IR 8547 is explicit about what Shor's algorithm threatens. After listing ECDSA, RSA (RFC 8017) and EdDSA (RFC 8032) and the curves specified in SP 800-186, §2.1.1 states: "These algorithms are vulnerable to Shor's Algorithm on a cryptanalytically relevant quantum computer". Section 2.1.2 gives the same verdict for SP 800-56A — discrete-log key establishment over finite fields and elliptic curves, including Diffie-Hellman and MQV variants — and SP 800-56B's RSA-based schemes: "The key-establishment algorithms in both of these Special Publications are vulnerable to Shor's Algorithm on a cryptanalytically relevant quantum computer".

## why

FIPS 186-5 states the same position in §1: "Note that the algorithms in this standard are not expected to provide resistance to attacks from a large-scale quantum computer. Digital signature algorithms that will provide security from quantum computers will be specified in future NIST publications." That is the standards text explaining why RSA, ECDSA and EdDSA are classed as quantum-vulnerable and must be replaced.

## used

The reach of the algorithm follows from the standard's own taxonomy. The Appendix A introduction of FIPS 186-5 says "Discrete logarithm cryptography (DLC) is divided into finite field cryptography (FFC) and elliptic curve cryptography (ECC). … DSA is an example of FFC, and ECDSA is an example of ECC. Other examples of DLC are the Diffie-Hellman and MQV key agreement algorithms", and adds that "The most common example of integer factorization cryptography (IFC) is RSA". NIST IR 8547 says the same thing twice, in the algorithm list and again in its closing summary: both the discrete-logarithm and the integer-factorisation families fall to Shor's algorithm once a sufficiently capable quantum computer exists.

## broken

IR 8547 gives conclusions, not complexity: “Shor” appears only twice, in §2.1.1 and §2.1.2, with no polynomial-time or qubit-count statement, and this entry goes no further. The mitigation path is in the same document: §4 states that "NIST will deprecate quantum-vulnerable public-key cryptography after 2030 and disallow its use under NIST standards and guidelines after 2035", while the §1 introduction cites the "harvest now, decrypt later" threat — collecting ciphertext now and decrypting once such a machine exists — as the reason to act immediately.

## history

The standards timeline is: FIPS 186-5 (February 2023) concedes that its algorithms are not expected to resist a large-scale quantum computer and says quantum-safe signatures will come in future publications; NIST IR 8547 (October 2026) makes that concrete, naming both public-key families — signatures in §2.1.1 and key establishment in §2.1.2 — as vulnerable to Shor's algorithm and attaching migration dates in §4.

## refs

- Wikipedia search entry for 肖尔算法. https://zh.wikipedia.org/w/index.php?search=%E8%82%96%E5%B0%94%E7%AE%97%E6%B3%95
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[T=\mathrm{poly}(\log N)\]

Shor's Algorithm: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
