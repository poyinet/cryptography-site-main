# Guidelines for the Selection, Configuration, and Use of TLS Implementations

## principle

**Standard**: Guidelines for the Selection, Configuration, and Use of TLS Implementations (TLS 选型与配置指南). The document identifies itself in its title: "Guidelines for the Selection, Configuration, and Use of Transport Layer Security (TLS) Implementations", published as NIST SP 800-52 Rev. §1.2 bounds it: "These guidelines focus only on network security, and they focus directly on the small portion of the network communications stack that is referred to as the transport layer." and it targets broad-interop, certificate-authenticated cases — "These guidelines focus on the common use cases where clients and servers must interoperate with a wide variety of implementations, and authentication is performed using public-key certificates."

## why

Requirements are layered by risk because security is not a single switch: §1.2 says "Security is not a single property that is (or is not) possessed by a protocol." and "Adherence to these guidelines only protects the data in transit." §3.1 therefore treats government-only and public-facing servers differently: the former "should not be configured to use TLS 1.1 and shall not use TLS 1.0, SSL 3.0, or SSL 2.0." while the latter may keep older versions when interoperation demands it — "The use of TLS versions 1.1 and 1.0 is generally discouraged, but these versions may be configured when necessary to enable interaction with citizens and businesses."

## used

Federal deployment timing is concrete: §3.1 states "Agencies shall support TLS 1.3 by January 1, 2024." and requires both server classes to support TLS 1.3 thereafter. The compatibility rule is "In general, servers that support TLS 1.3 should be configured to use TLS 1.2 as well." with 1.2 allowed off once interoperability does not need it. For government-only servers the baseline is that they "shall be configured to use TLS 1.2 and should be configured to use TLS 1.3 as well".

## broken

Two limits are stated. In scope, it covers only the transport layer: §1.2 — "Adherence to these guidelines only protects the data in transit." — recommending other NIST publications for the rest. In implementation quality, it refuses broken negotiation: §3.1 records servers that terminate connections when a newer version is offered and concludes "Servers that incorrectly implement TLS version negotiation shall not be used." configuration compliance cannot substitute for verifying implementation behaviour.

## history

The registered source is corrected after verification: the inventory record read `NIST SP 800-177 Rev.1(2020)`, but SP 800-177 Rev. 1 is Trustworthy Email (February 2019). The TLS selection and configuration guidance is SP 800-52 Rev. 2, by Kerry A. McKay and David A. Cooper (Computer Security Division, Information Technology Laboratory), dated August 2019 with DOI 10.6028/NIST.SP.800-52r2.

## refs

- Wikipedia search entry for TLS 选型与配置指南. https://zh.wikipedia.org/w/index.php?search=TLS%20%E9%80%89%E5%9E%8B%E4%B8%8E%E9%85%8D%E7%BD%AE%E6%8C%87%E5%8D%97
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[S=\min_i S_i,\quad S_i\in\{\text{密钥强度},\text{分组安全},\text{实现安全}\}\]

Guidelines for the Selection, Configuration, and Use of TLS Implementations: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
