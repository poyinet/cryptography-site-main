# ACME Renewal Information

## principle

**Protocol**: ACME Renewal Information (ACME 续期信息). §1 defines the extension: "This document specifies the ACME Renewal Information (ARI) extension", where servers publish suggested renewal windows and clients signal that a certificate was replaced. §3 gives discovery: "An ACME server that wishes to provide renewal information MUST include a new field, “renewalInfo”, in its directory object." §4.1 fixes the query shape — "the client sends an unauthenticated GET request to a path under the server's renewalInfo URL." — with the path identifier built from the AKI keyIdentifier and the DER serial, and "All trailing “=” characters MUST be stripped from both parts of the unique identifier."

## why

The motivation is rigid client scheduling. §1 notes "Most ACME [RFC8555] clients today choose when to attempt to renew a certificate in one of three ways", criticises the first two — "The first two create significant barriers against the issuing Certification Authority (CA) changing certificate lifetimes." — and the shared consequence "All three ways may lead to load clustering for the issuing CA due to its inability to schedule renewal requests." The stated benefit is "Allowing issuing CAs to suggest a period in which clients should renew their certificates enables dynamic time-based load balancing." The abstract compresses the goal: "This allows servers to mitigate load spikes and ensures that clients do not make false assumptions about appropriate certificate renewal periods."

## used

The core field is suggestedWindow, defined in §4.2 by "which bound the window of time in which the CA recommends renewing the certificate." Client behaviour is required: "Clients MUST attempt renewal at a time of their choosing based on the suggested renewal window." The six-step RECOMMENDED algorithm in §4.2 begins with "Make a renewalInfo request to get a suggested renewal window." and only then "Select a uniform random time within the suggested window." Polling is governed by Retry-After, with §4.3 clarifying the meaning: "In this protocol, it indicates the desired (i.e., both requested minimum and maximum) amount of time to wait." §5 adds the replaces field to the Order object: "A string uniquely identifying a previously issued certificate that this order is intended to replace."

## broken

Windows can be malformed, and §4.2 sets the rule: "A RenewalInfo object in which the end timestamp equals or precedes the start timestamp is invalid." — a client must treat such a response as if nothing arrived. §4.3 bounds when the resource is useful: "Clients MUST NOT check a certificate's RenewalInfo after the certificate has expired." §6 records two costs: moving to unauthenticated GETs is "a departure from the requirement in RFC 8555 that clients send POST-as-GET requests to fetch resources from the server." so "servers should take measures to ensure that unauthenticated requests for renewal information cannot result in denial-of-service attacks." and clock error matters: "this protocol could exhibit undesired behavior in the presence of significant clock skew between the ACME client and server."

## history

RFC 9773 is signed by A. Gable (Internet Security Research Group), published June 2025 with Category: Standards Track and no Obsoletes line; it extends RFC 8555. §2 fixes vocabulary — “renewal” covers any combination of Renewal, Re-Key and Modification as defined in RFC 3647. §4.2 also leaves an operational handle: explanationURL points at a page explaining the window, and the specification says "Clients SHOULD provide this URL to their operator, if present."

## refs

- Wikipedia search entry for ACME 续期信息. https://zh.wikipedia.org/w/index.php?search=ACME%20%E7%BB%AD%E6%9C%9F%E4%BF%A1%E6%81%AF
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\]

ACME Renewal Information: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
