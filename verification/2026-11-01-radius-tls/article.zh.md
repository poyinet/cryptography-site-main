# RADIUS over TLS

## principle

**协议**：RADIUS over TLS（RADIUS over TLS）。摘要给出机制与效果：「This document specifies a transport profile for RADIUS using Transport Layer Security (TLS) over TCP as the transport protocol.This enables dynamic trust relationships between RADIUS servers.」即把 RADIUS 从 UDP 加共享秘密的模型搬进 TLS/TCP。

## why

动机在 §1 里写得直白：「However, RADIUS is experiencing several shortcomings, such as its dependency on the unreliable transport protocol UDP and the lack of security for large parts of its packet payload.RADIUS security is based on the MD5 algorithm, which has been proven to be insecure.」对策是整体封装——「RADIUS over TLS wraps the entire RADIUS packet payload into a TLS stream and thus mitigates the risk of attacks on MD5.」

## used

端口与协商义务写在 §2：「The default destination port number for RADIUS over TLS is TCP/2083.There are no separate ports for authentication, accounting, and dynamic authorization changes.」§2.3 要求「Support for certificate-based mutual authentication is REQUIRED.」与「Negotiation of mutual authentication is REQUIRED.」

## broken

边界由几条硬条款划出：版本下限「implementations MUST NOT negotiate TLS versions prior to 1.1」；§6 指出只提供完整性不含加密的套件被本规范禁止，而这在共享秘密固定时尤其致命；§4 明确没有互操作——「RADIUS/TLS does not specify any inherent backward compatibility to RADIUS/UDP or cross compatibility to the other transports」。

## history

RFC 6614 头部为 S.Winter（RESTENA）、M.McCauley（OSC）、S.Venaas 与 K.Wierenga（Cisco），日期 2012 年 5 月，类别是 Experimental（不是 Standards Track），没有 Obsoletes 或 Updates 行；§7 记录 IANA 把早先为 RadSec 分配的 TCP 2083 更新为 RADIUS/TLS 用途。

**技术参数与复算边界**

该条目的形式模型是 \(\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\)。输入：输入：RADIUS over TLS的公开参数、密钥/随机数与消息；变量说明：Π 协议，A 敌手，n 会话数，PRF/AEAD 为底层原语。 预期输出：按 RADIUS over TLS 的规范执行后得到可验证的输出或可比较的优势界。 复算必须给出输入、步骤、输出和单位；示例只演示流程，不替代标准测试向量。

复杂度由密钥长度、分组/状态规模、轮数、随机数质量和敌手模型共同决定；参数越界、版本差异与实现侧信道都可能使公式结论失效。已登记限制：该条目只给出形式模型与可复算步骤，不声称已完成生产实现、侧信道认证或第三方安全评估。

## refs

- Wikipedia search entry for RADIUS over TLS. https://zh.wikipedia.org/w/index.php?search=RADIUS%20over%20TLS
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**形式模型与复算步骤**

\[\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\]

RADIUS over TLS的公开参数、密钥/随机数与消息；变量说明：Π 协议，A 敌手，n 会话数，PRF/AEAD 为底层原语。1.把协议消息序列写成状态机。2.用混合论证逐个替换原语。3.把剩余优势归约到 PRF/AEAD 安全。边界：公式只覆盖已登记的参数与假设；参数取值、标准版本和实现细节仍以来源为准。
