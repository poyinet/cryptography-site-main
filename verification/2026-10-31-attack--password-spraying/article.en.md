# Password Spraying

## principle

**Attack**: Password Spraying (口令喷洒). Password spraying uses one or a small list of common passwords against many different accounts to obtain valid credentials; it is the opposite of brute-forcing one account with many passwords.

## why

This order avoids triggering lockouts from repeated failures on one account; attackers may choose common passwords that satisfy the domain complexity policy to improve the hit rate.

Restate the chain as input → state → transform → output → criterion. Every step should identify who acts, what changes and what evidence remains. A step without evidence is marked unverified, not reproduced.

## used

Common targets include management services, single sign-on and federated authentication, cloud applications and externally facing email systems; attackers may throttle attempts to avoid detection thresholds and use LDAP or Kerberos authentication that generates fewer high-visibility events.

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

Defenses include account lockout or conditional access, blocking anonymizing proxies, requiring multi-factor authentication, using NIST-style password policy, and monitoring failures of one password across many accounts; strict lockout can itself be abused for denial of service.

Adv_A = Pr[Succ_A] − Pr[Succ_ideal]；Cost = D × T × M；Success = 1[advantage > threshold]. Symbols are catalogue-level variables, not standard constants; parameters, test vectors and clauses remain with the registered source. The model states structural relations, not an implementation audit.

## history

MITRE ATT&CK lists password spraying as brute-force sub-technique T1110.003 for credential attacks against multiple accounts.

Given abstract input x₀ and parameter p, compute y₀ and test it against the criterion; this is a reasoning example, not a measured vector. If the input leaves the domain, keys/parameters are reused, implementation diverges or versions mismatch, the model no longer holds.

## refs

- Wikipedia search entry for 口令喷洒. https://zh.wikipedia.org/w/index.php?search=%E5%8F%A3%E4%BB%A4%E5%96%B7%E6%B4%92
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[T=\frac{|\mathcal{K}|}{v},\qquad |\mathcal{K}|=2^{\kappa}\]

Password Spraying: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
