# OCSP 装订

## principle

**协议**：OCSP 装订（OCSP Stapling）。机制是把手上的证书状态信息放进 TLS 握手：RFC 6066 §8（Certificate Status Request）说明「This extension allows for such information to be sent in the TLS handshake, saving roundtrips and resources.」

## why

动因是带宽与往返，而不是隐私：同节写道「Constrained clients may wish to use a certificate-status protocol such as OCSP [RFC2560] to check the validity of server certificates, in order to avoid transmission of CRLs and therefore save bandwidth on constrained networks.」

## used

服务端的应答是可选的：§8 规定「Servers that receive a client hello containing the "status_request" extension MAY return a suitable certificate status response to the client along with their certificate.」并且「Only one OCSP response may be sent.」；若真的返回 CertificateStatus，则此前必须在 ServerHello 里带上空的 status_request 扩展。

## broken

装订不能替代校验：§11.6 警告「If a client requests an OCSP response, it must take into account that an attacker's server using a compromised key could (and probably would) pretend not to support the extension.」并建议必须做 OCSP 校验的客户端「SHOULD either contact the OCSP server directly or abort the handshake」。

## history

该扩展由 2011 年 1 月的 Standards Track 文档 RFC 6066 规定，头部标注「Obsoletes: 4366」，§1 说明文件多为对 RFC 4366 材料的改编与编辑；nonce 的编码在此被钉死：「for clarification, the nonce MUST be a DER-encoded OCTET STRING」。

**技术参数与复算边界**

该条目的形式模型是 \(\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\)。输入：输入：OCSP 装订的公开参数、密钥/随机数与消息；变量说明：Π 协议，A 敌手，n 会话数，PRF/AEAD 为底层原语。 预期输出：按 OCSP 装订 的规范执行后得到可验证的输出或可比较的优势界。 复算必须给出输入、步骤、输出和单位；示例只演示流程，不替代标准测试向量。

复杂度由密钥长度、分组/状态规模、轮数、随机数质量和敌手模型共同决定；参数越界、版本差异与实现侧信道都可能使公式结论失效。已登记限制：该条目只给出形式模型与可复算步骤，不声称已完成生产实现、侧信道认证或第三方安全评估。

## refs

- Wikipedia search entry for OCSP 装订. https://zh.wikipedia.org/w/index.php?search=OCSP%20%E8%A3%85%E8%AE%A2
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/
- RFC 6960: Online Certificate Status Protocol. https://www.rfc-editor.org/rfc/rfc6960
- Published standard/RFC for OCSP 装订. https://www.rfc-editor.org/rfc/rfc6960

## example

**形式模型与复算步骤**

\[\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\]

OCSP 装订的公开参数、密钥/随机数与消息；变量说明：Π 协议，A 敌手，n 会话数，PRF/AEAD 为底层原语。1.把协议消息序列写成状态机。2.用混合论证逐个替换原语。3.把剩余优势归约到 PRF/AEAD 安全。边界：公式只覆盖已登记的参数与假设；参数取值、标准版本和实现细节仍以来源为准。
