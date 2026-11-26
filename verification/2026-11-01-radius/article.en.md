# Remote Authentication Dial-In User Service

## principle

**Protocol**: Remote Authentication Dial-In User Service (RADIUS 认证协议). RADIUS is a client/server protocol between the NAS and a backend server: §1 states "A Network Access Server (NAS) operates as a client of RADIUS." and §3 fixes the carriage: "Exactly one RADIUS packet is encapsulated in the UDP Data field [4], where the UDP Destination Port field indicates 1812 (decimal)."

## why

Trust rests on a pre-shared secret: §1 Network Security says "Transactions between the client and RADIUS server are authenticated through the use of a shared secret, which is never sent over the network." Authentication therefore does not rely on the channel.

## used

Attributes carry the details a request and reply need: §5 states "RADIUS Attributes carry the specific authentication, authorization, information and configuration details for the request and reply." Section 2 sets a hard rule for unknown clients: "A request from a client for which the RADIUS server does not have a shared secret MUST be silently discarded."

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

The weak points are password hiding and MD5: §2 explains the password "is hidden using a method based on the RSA Message Digest Algorithm MD5 [3]." and §8 concedes "The User-Password hiding mechanism described in Section 5.2 has not been subjected to significant amounts of cryptanalysis in the published literature." Neither RFC 2865 nor 2866 mentions the Message-Authenticator attribute (that is RFC 2869), and neither declares MD5 broken.

## history

Both documents date from June 2000: RFC 2865 is Standards Track and its header obsoletes RFC 2138, while RFC 2866 (RADIUS Accounting) is Informational, obsoletes RFC 2139, and states "All transactions are comprised of variable length Attribute-Length-Value 3-tuples." Neither header carries an Updates line.

## refs

- Wikipedia search entry for RADIUS 认证协议. https://zh.wikipedia.org/w/index.php?search=RADIUS%20%E8%AE%A4%E8%AF%81%E5%8D%8F%E8%AE%AE
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\]

Remote Authentication Dial-In User Service: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
