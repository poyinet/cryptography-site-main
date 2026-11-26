# Certificate Transparency

## principle

**Protocol**: Certificate Transparency (证书透明度). RFC 6962 §1 defines the mechanism: "Certificate transparency aims to mitigate the problem of misissued certificates by providing publicly auditable, append-only, untrusted logs of all issued certificates." It does not block misissuance, only makes it visible: "The logs do not themselves prevent misissue, but they ensure that interested parties (particularly those named in certificates) can detect such misissuance." Submission yields a signed timestamp — "When a chain is submitted to a log, a signed timestamp is returned".

## why

Two design reasons. Spam resistance first: "In order to avoid logs being spammed into uselessness, it is required that each chain is rooted in a known CA certificate." Auditability second: §2.1 "Logs use a binary Merkle Hash Tree for efficient auditing." and §1 explains that the tree is what makes append-only provable — "The append-only property of each log is technically achieved using Merkle Trees". Checking is deliberately deferred: "The checking operation is asynchronous to allow TLS connections to proceed without delay".

## used

To account for certificates before issuance, §3.1 introduces the precertificate: "the CA submits a Precertificate that the log can use to create an entry that will be valid against the issued certificate." using a poison extension so ordinary validation rejects it, and treats intent as binding — "misissuance of the Precertificate is considered equal to misissuance of the final certificate". §5.2 covers TLS clients, which verify the SCT signature and "MUST reject SCTs whose timestamp is in the future." §5.3 defines monitors: "Monitors watch logs and check that they behave correctly."

## broken

Time is the hard bound: §7.1 says misissued certificates without a valid SCT are rejected by clients, while logged ones surface within the Maximum Merge Delay, so "the maximum period of time during which a misissued certificate can be used without being available for audit is the MMD." Logs themselves may misbehave, and §7.3 lists two forms — missing the MMD, or "by presenting two different, conflicting views of the Merkle Tree" — both publicly detectable, since two conflicting signed tree heads for one log are "cryptographic proof of that log's misbehavior."

## history

RFC 6962 was published in June 2013 with Category: Experimental. §1 fixes the scope: "Note that this is a general mechanism, but in this document, we only describe its use for public TLS server certificates issued by public certificate authorities (CAs)." §2.1 records that SHA-256 is fixed for this experiment with logs expected to choose their own hash later, and notes that distinct leaf and node hashing "is required to give second preimage resistance."

## refs

- Wikipedia search entry for 证书透明度. https://zh.wikipedia.org/w/index.php?search=%E8%AF%81%E4%B9%A6%E9%80%8F%E6%98%8E%E5%BA%A6
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\]

Certificate Transparency: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
