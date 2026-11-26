# SM3 Cryptographic Hash Function

## principle

**Algorithm**: SM3 (SM3 国密杂凑). What this workspace can attest is narrow but explicit (§1.1): "SM3 is a hash function that produces an output of 256 bits." That is RFC 8998's entire positive description - algorithm class and digest length. The internal compression function, message expansion and iteration structure belong to GB/T 32905-2016, which is neither retained here nor reachable from this workspace, so this entry does not restate those details or fill them in from outside memory.

## why

Why an IETF document was needed is visible in the §1.1 standardization sentence: "SM3 has already been accepted by ISO in ISO/IEC 10118-3:2018 [ISO-SM3] and has also been described by [GBT.32905-2016]." A hash already inside an ISO standard and defined by a Chinese national document had no algorithm identity in TLS; RFC 8998 closes that interoperability gap rather than redefining SM3's strength.

## used

Use lands in TLS 1.3, per the §1 introduction: "This document describes two new cipher suites, a signature algorithm and a key exchange mechanism for the Transport Layer Security (TLS) protocol version 1.3 (TLS 1.3) ([RFC8446]). These all utilize several ShangMi (SM) cryptographic algorithms to fulfill the authentication and confidentiality requirements of TLS 1.3." SM3's practical role is therefore the hash behind those suites and the signature algorithm; the suites are registered as TLS_SM4_GCM_SM3 and TLS_SM4_CCM_SM3.

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

There are two limits, the second documentary. The first is applicability, in two normative sentences: "The new cipher suites defined in this document are only applicable to TLS 1.3. Implementations of this document MUST NOT apply these cipher suites to any older versions of TLS." The second is an evidence boundary: SM3's normative internal structure is in GB/T 32905-2016, which this workspace neither retains nor could retrieve; properties depending on it - compression function, message expansion, round count - are asserted nowhere in this entry, and anyone checking implementation detail must return to the national standard text.

## history

The lineage follows the document's two standardization statements: SM3 was described first by the Chinese national file [GBT.32905-2016] and then accepted internationally - "SM3 has already been accepted by ISO in ISO/IEC 10118-3:2018 [ISO-SM3]". Its companion signature algorithm took the same path: the text records that those pieces "have already been added to ISO/IEC 14888-3:2018 [ISO-SM2] (as well as to [GBT.32918.2-2016])". The header prints Request for Comments: 8998, Category: Informational, March 2021 (restated outside quotes per house rule).

## refs

- Wikipedia search entry for SM3 国密杂凑. https://zh.wikipedia.org/w/index.php?search=SM3%20%E5%9B%BD%E5%AF%86%E6%9D%82%E5%87%91
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[C=E_K(P;r),\qquad P=D_K(C)\]

SM3: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
