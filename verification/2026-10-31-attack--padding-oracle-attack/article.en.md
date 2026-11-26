# Padding Oracle Attack

## principle

**Attack**: Padding Oracle Attack (填充预言攻击). A padding oracle attack targets CBC mode: after decryption the receiver checks whether the padding is valid. The attacker modifies the preceding ciphertext block, observes padding validity and gradually recovers intermediate values and plaintext.

## why

Receivers typically report padding errors with an acknowledgment or error message, which leaks one bit about padding validity. Vaudenay calls this a side channel and shows that one bit is enough to drive decryption.

Restate the chain as input → state → transform → output → criterion. Every step should identify who acts, what changes and what evidence remains. A step without evidence is marked unverified, not reproduced.

## used

The paper lists standards using CBC and padding, including SSL/TLS, IPsec and WTLS, as application scenarios; the attacker needs chosen ciphertexts and an observable padding-validity signal. For 8-byte blocks and a 256-character alphabet, about 1024N oracle calls decrypt N blocks on average.

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

The recommended fix authenticates the padded plaintext before encryption; on decryption, decrypt first, verify the authentication tag, and only then check padding. It notes that merely making error messages identical is not sufficient to remove distinguishability, and does not propose authenticating the ciphertext or authenticating before decryption.

Adv_A = Pr[Succ_A] − Pr[Succ_ideal]；Cost = D × T × M；Success = 1[advantage > threshold]. Symbols are catalogue-level variables, not standard constants; parameters, test vectors and clauses remain with the registered source. The model states structural relations, not an implementation audit.

## history

Vaudenay introduced the padding oracle attack systematically in his 2002 EUROCRYPT paper and analyzed its practical risk in SSL, IPsec, WTLS and related protocols.

Given abstract input x₀ and parameter p, compute y₀ and test it against the criterion; this is a reasoning example, not a measured vector. If the input leaves the domain, keys/parameters are reused, implementation diverges or versions mismatch, the model no longer holds.

## refs

- Wikipedia search entry for 填充预言攻击. https://zh.wikipedia.org/w/index.php?search=%E5%A1%AB%E5%85%85%E9%A2%84%E8%A8%80%E6%94%BB%E5%87%BB
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[\mathrm{Adv}^{\mathrm{attack}}_A(\lambda)=\Pr[\mathrm{Game}_A(\lambda)=1]-\frac12\]

Padding Oracle Attack: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
