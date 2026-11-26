# Galois/Counter Mode (GCM) and GMAC

## principle

**Standard**: Galois/Counter Mode and GMAC (GCM 与 GMAC 模式). The title is the definition: "NIST Special Publication 800-38D Recommendation for Block Cipher Modes of Operation: Galois/Counter Mode (GCM) and GMAC", by Morris Dworkin, dated "November 2007". It standardises GCM and GMAC together — the first an encrypting authenticated mode, the second the authentication-only use.

## why

The need it serves is encryption and authentication in one verifiable construction: the document gives GCM and GMAC and devotes a separate section to the uniqueness rule, §8 "Uniqueness Requirement on IVs and Keys". §2 places conformance in the Cryptographic Module Validation Program alone, naming no other validation programme.

## used

It is used as a validated block-cipher mode: §2 routes implementations through the CMVP, and §8 bounds the collision probability explicitly: "The probability that the authenticated encryption function ever will be invoked with the same IV and the same key on two (or more) distinct sets of input data shall be no greater than 2-32." How a calling protocol arranges its keys and IVs is outside this document.

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

The first limit is the caution itself, which is conditional: "a breach of the requirement in Sec. 8 for the uniqueness of the initialization strings may compromise the security assurance almost entirely", followed by the advice that "this mode of operation should not be deployed unless compliance with this uniqueness requirement is ensured". The second limit: the document does address both - section 8.1 is headed Key Establishment and points at the TLS, IKEv1/v2 and SSH key-derivation functions, section 8.2 is headed IV Constructions and gives deterministic and RBG-based ways to build them - what it does not do is define a key-agreement protocol or mandate how a given protocol draws its IV; that machinery stays outside its scope.

## history

Registered period: 标准化时代. Exact dates and institutions follow the source ledger.

## refs

- Wikipedia search entry for GCM 与 GMAC 模式. https://zh.wikipedia.org/w/index.php?search=GCM%20%E4%B8%8E%20GMAC%20%E6%A8%A1%E5%BC%8F
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[S=\min_i S_i,\quad S_i\in\{\text{密钥强度},\text{分组安全},\text{实现安全}\}\]

Galois/Counter Mode and GMAC: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
