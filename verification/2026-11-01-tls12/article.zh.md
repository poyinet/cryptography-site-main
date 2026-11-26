# TLS 1.2

## principle

**协议**：TLS 1.2（TLS 1.2）。摘要同样是版本声明：「This document specifies Version 1.2 of the Transport Layer Security (TLS) protocol.The TLS protocol provides communications security over the Internet.」§1 保留同一分层描述「The protocol is composed of two layers: the TLS Record Protocol and the TLS Handshake Protocol.」

## why

本版主题是算法协商自由度：§1.2 写明「The MD5/SHA-1 combination in the pseudorandom function (PRF) has been replaced with cipher-suite-specified PRFs.All cipher suites in this document use P_SHA256.」并加入「Addition of support for authenticated encryption with additional data modes.」

## used

记录层把 IV 写成硬性要求：「The Initialization Vector (IV) SHOULD be chosen at random, and MUST be unpredictable.」同时回顾旧版问题——1.1 之前没有 IV 字段而使用 CBC 残值。填充错误从 1.1 的 SHOULD 升为 MUST：「The receiver MUST check this padding and MUST use the bad_record_mac alert to indicate padding errors.」§9 的强制套件是 TLS_RSA_WITH_AES_128_CBC_SHA。

## broken

本版本没有清理旧套件与静态密钥风险：§1.2 只说「Removed IDEA and DES cipher suites.They are now deprecated and will be documented in a separate document.」，对 RC4、MD5 或静态 RSA 未作否定，而强制套件本身就是静态 RSA；§7.4.1.4 劝阻用扩展大改设计——「This is not recommended; it would be more appropriate to define a new version of TLS」；前向保密仍是建议句「TLS users desiring Perfect Forward Secrecy should use DHE cipher suites.」

## history

RFC 5246 头部为 T.Dierks 与 E.Rescorla（RTFM, Inc.），类别 Standards Track，2008 年 8 月，同时标注「Obsoletes: 3268, 4346, 4366」与「Updates: 4492」；§1.2 自陈是 TLS 1.1 的修订，重点是「improved flexibility, particularly for negotiation of cryptographic algorithms」。

**技术参数与复算边界**

该条目的形式模型是 \(\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\)。输入：输入：TLS 1.2的公开参数、密钥/随机数与消息；变量说明：Π 协议，A 敌手，n 会话数，PRF/AEAD 为底层原语。 预期输出：按 TLS 1.2 的规范执行后得到可验证的输出或可比较的优势界。 复算必须给出输入、步骤、输出和单位；示例只演示流程，不替代标准测试向量。

复杂度由密钥长度、分组/状态规模、轮数、随机数质量和敌手模型共同决定；参数越界、版本差异与实现侧信道都可能使公式结论失效。已登记限制：该条目只给出形式模型与可复算步骤，不声称已完成生产实现、侧信道认证或第三方安全评估。

## refs

- Wikipedia search entry for TLS 1.2. https://zh.wikipedia.org/w/index.php?search=TLS%201.2
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/
- RFC 5246: The Transport Layer Security (TLS) Protocol Version 1.2. https://www.rfc-editor.org/rfc/rfc5246
- Published standard/RFC for TLS 1.2. https://www.rfc-editor.org/rfc/rfc5246

## example

**形式模型与复算步骤**

\[\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\]

TLS 1.2的公开参数、密钥/随机数与消息；变量说明：Π 协议，A 敌手，n 会话数，PRF/AEAD 为底层原语。1.把协议消息序列写成状态机。2.用混合论证逐个替换原语。3.把剩余优势归约到 PRF/AEAD 安全。边界：公式只覆盖已登记的参数与假设；参数取值、标准版本和实现细节仍以来源为准。
