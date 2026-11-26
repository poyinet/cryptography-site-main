# SPAKE2+ Password-Authenticated Key Exchange

## principle

**Protocol**: SPAKE2+, an Augmented Password-Authenticated Key Exchange (PAKE) Protocol (SPAKE2+ 口令认证密钥交换). The abstract defines the mechanism: "This document describes SPAKE2+, a Password-Authenticated Key Exchange (PAKE) protocol run between two parties for deriving a strong shared key with no risk of disclosing the password." and states the variant: "SPAKE2+ is an augmented PAKE protocol, as only one party has knowledge of the password."

## why

The motivation is that a password must not be exposed by the exchange: the abstract states the goal as "deriving a strong shared key with no risk of disclosing the password" and bundles the engineering claims with it — "This method is simple to implement, compatible with any prime-order group, and computationally efficient."

## used

The placement is in §1: the augmented property is valuable where execution is constrained and the adversary cannot query the salt of the password-hashing function ahead of the attack, and the document names two constraints — "a constraint may be when physical proximity through a local network is required or when a first authentication factor is required for initiation of the protocol." The abstract gives the general shape: only one party holds the password, yet authentication and a session key result.

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

The first limit is the identity model: "SPAKE2+ is the asymmetric or augmented version of SPAKE2, wherein only one party has knowledge of the password." — the other side still stores the salt or record. The second is standing: the document states "Neither SPAKE2 nor SPAKE2+ was selected as the result of the Crypto Forum Research Group (CFRG) PAKE selection competition." and its masthead Category is Informational, not Standards Track.

## history

The masthead gives the history: the Independent Submission stream with Category: Informational, dated September 2023 and authored by T. Taubert (Apple Inc.) and C. A. Wood. Clause 1 records the lineage — the content was split out from "[RFC9382], which specifies SPAKE2", because symmetric and augmented PAKEs serve different use cases and so warrant different specifications.

## refs

- Wikipedia search entry for SPAKE2+ 口令认证密钥交换. https://zh.wikipedia.org/w/index.php?search=SPAKE2%2B%20%E5%8F%A3%E4%BB%A4%E8%AE%A4%E8%AF%81%E5%AF%86%E9%92%A5%E4%BA%A4%E6%8D%A2
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\]

SPAKE2+, an Augmented Password-Authenticated Key Exchange (PAKE) Protocol: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
