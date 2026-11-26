# Credential Stuffing

## principle

**Attack**: Credential Stuffing (凭据填充). Credential stuffing uses username/password pairs obtained from breaches of unrelated accounts to log into target accounts, exploiting users’ tendency to reuse passwords across services.

## why

Large numbers of breached credential pairs become available online; if a target user reused a password, the attacker may log in without cracking anything.

Restate the chain as input → state → transform → output → criterion. Every step should identify who acts, what changes and what evidence remains. A step without evidence is marked unverified, not reproduced.

## used

Common targets include management services, single sign-on and federated authentication, cloud applications and externally facing email systems; attackers can automate large numbers of attempts.

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

Credential stuffing is risky because it can cause numerous authentication failures and account lockouts; defenses include multi-factor authentication, resetting known-breached accounts, account lockout policy, NIST-style password policy, and monitoring many failures across identities.

Adv_A = Pr[Succ_A] − Pr[Succ_ideal]；Cost = D × T × M；Success = 1[advantage > threshold]. Symbols are catalogue-level variables, not standard constants; parameters, test vectors and clauses remain with the registered source. The model states structural relations, not an implementation audit.

## history

MITRE ATT&CK lists credential stuffing as brute-force sub-technique T1110.004 for attacks exploiting credential overlap.

Given abstract input x₀ and parameter p, compute y₀ and test it against the criterion; this is a reasoning example, not a measured vector. If the input leaves the domain, keys/parameters are reused, implementation diverges or versions mismatch, the model no longer holds.

## refs

- Wikipedia search entry for 凭据填充. https://zh.wikipedia.org/w/index.php?search=%E5%87%AD%E6%8D%AE%E5%A1%AB%E5%85%85
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[\mathrm{Adv}^{\mathrm{attack}}_A(\lambda)=\Pr[\mathrm{Game}_A(\lambda)=1]-\frac12\]

Credential Stuffing: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
