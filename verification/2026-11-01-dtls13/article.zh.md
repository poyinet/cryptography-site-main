# DTLS 1.3

## principle

**协议**：DTLS 1.3（DTLS 1.3）。摘要给出范围与继承：「This document specifies version 1.3 of the Datagram Transport Layer Security (DTLS) protocol.DTLS 1.3 allows client/server applications to communicate over the Internet in a way that is designed to prevent eavesdropping, tampering, and message forgery.」

## why

继承关系与安全例外写在同一段：「The DTLS 1.3 protocol is based on the Transport Layer Security (TLS) 1.3 protocol and provides equivalent security guarantees with the exception of order protection / non-replayability.」§3 说明必须改记录层的第一个理由：「TLS relies on an implicit sequence number on records.」序号错位会让后续记录解密失败，因此「DTLS solves this problem by adding sequence numbers to records.」

## used

§5 表明复用策略：DTLS 1.3 沿用 TLS 1.3 的握手消息与流程，并「reuses TLS 1.3's “cookie” extension to provide a return-routability check as part of connection establishment.」记录层则自成一格：「The DTLS 1.3 record layer is different from the TLS 1.3 record layer and also different from the DTLS 1.2 record layer.」

## broken

放大风险与握手消息弃用构成边界：§5.1 指出「Servers which process 0-RTT requests and send 0.5-RTT responses without a cookie exchange risk being used in an amplification attack if the size of outgoing messages greatly exceeds the size of those that are received.」并给出「A server SHOULD limit the amount of data it sends toward a client address to three times the amount of data sent by the client before it verifies that the client is able to receive data at that address.」§5.2 另规定「DTLS 1.3-compliant implementations MUST NOT use the HelloVerifyRequest to execute a return-routability check.」

## history

RFC 9147 头部为 E.Rescorla（Mozilla）、H.Tschofenig（Arm Limited）与 N.Modadugu（Google, Inc.），类别 Standards Track，2022 年 4 月，标注「Obsoletes: 6347」，没有 Updates 行；§1 简洁说明本文以 TLS 1.3 为基准的增量写法，并写明「It obsoletes DTLS 1.2.」

**技术参数与复算边界**

该条目的形式模型是 \(\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\)。输入：输入：DTLS 1.3的公开参数、密钥/随机数与消息；变量说明：Π 协议，A 敌手，n 会话数，PRF/AEAD 为底层原语。 预期输出：按 DTLS 1.3 的规范执行后得到可验证的输出或可比较的优势界。 复算必须给出输入、步骤、输出和单位；示例只演示流程，不替代标准测试向量。

复杂度由密钥长度、分组/状态规模、轮数、随机数质量和敌手模型共同决定；参数越界、版本差异与实现侧信道都可能使公式结论失效。已登记限制：该条目只给出形式模型与可复算步骤，不声称已完成生产实现、侧信道认证或第三方安全评估。

## refs

- Wikipedia search entry for DTLS 1.3. https://zh.wikipedia.org/w/index.php?search=DTLS%201.3
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**形式模型与复算步骤**

\[\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\]

DTLS 1.3的公开参数、密钥/随机数与消息；变量说明：Π 协议，A 敌手，n 会话数，PRF/AEAD 为底层原语。1.把协议消息序列写成状态机。2.用混合论证逐个替换原语。3.把剩余优势归约到 PRF/AEAD 安全。边界：公式只覆盖已登记的参数与假设；参数取值、标准版本和实现细节仍以来源为准。
