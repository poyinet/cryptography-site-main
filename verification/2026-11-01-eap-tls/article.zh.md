# EAP-TLS

## principle

**协议**：EAP-TLS（EAP-TLS）。摘要与 §1 给出同一界定：「This document defines EAP-TLS, which includes support for certificate-based mutual authentication and key derivation.」即它是 EAP 框架下的一个具体方法，把 TLS 用作认证与密钥派生的内核。

## why

双向认证依靠证书：§2.2 Identity Verification 写明「As part of the TLS negotiation, the server presents a certificate to the peer, and if mutual authentication is requested, the peer presents a certificate to the server.」

## used

部署侧的硬要求是吊销检查：§5.4 规定「EAP-TLS peer and server implementations MUST support the use of Certificate Revocation Lists (CRLs)」，并指向 RFC 3280 的相关小节。§2.1.4 的强制只针对支持隐私的场景：此类服务端「MUST request a client certificate」，并非无条件要求客户端证书。

## broken

保护范围有边界：§5.5 指出「The integrity protection of EAP-TLS packets does not extend to the EAP header fields (Code, Identifier, Length) or the Type or Flags fields.」§5.1 的安全声明表还把信道绑定记为「Channel binding:」后的 No。本文以 TLS 1.0 及以后为基线，并在 §5.1 的脚注里写明「EAP-TLS inherits the secure ciphersuite negotiation features of TLS, including key derivation function negotiation when utilized with TLS v1.2 [RFC4346bis]」。

## history

RFC 5216（2008 年 3 月，Standards Track，作者 Simon、Aboba、Hurst）头部标注「Obsoletes: 2716」，§1 说明「While this document obsoletes RFC 2716 [RFC2716], it remains backward compatible with it.」；§2.3 记录密钥来源：「In EAP-TLS, the MSK, EMSK, and Initialization Vector (IV) are derived from the TLS master secret via a one-way function.」文中没有 Updates 行，也未更新 RFC 3748。

**技术参数与复算边界**

该条目的形式模型是 \(\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\)。输入：输入：EAP-TLS的公开参数、密钥/随机数与消息；变量说明：Π 协议，A 敌手，n 会话数，PRF/AEAD 为底层原语。 预期输出：按 EAP-TLS 的规范执行后得到可验证的输出或可比较的优势界。 复算必须给出输入、步骤、输出和单位；示例只演示流程，不替代标准测试向量。

复杂度由密钥长度、分组/状态规模、轮数、随机数质量和敌手模型共同决定；参数越界、版本差异与实现侧信道都可能使公式结论失效。已登记限制：该条目只给出形式模型与可复算步骤，不声称已完成生产实现、侧信道认证或第三方安全评估。

## refs

- Wikipedia search entry for EAP-TLS. https://zh.wikipedia.org/w/index.php?search=EAP-TLS
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**形式模型与复算步骤**

\[\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\]

EAP-TLS的公开参数、密钥/随机数与消息；变量说明：Π 协议，A 敌手，n 会话数，PRF/AEAD 为底层原语。1.把协议消息序列写成状态机。2.用混合论证逐个替换原语。3.把剩余优势归约到 PRF/AEAD 安全。边界：公式只覆盖已登记的参数与假设；参数取值、标准版本和实现细节仍以来源为准。
