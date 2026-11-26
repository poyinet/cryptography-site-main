# TLS 1.0

## principle

**协议**：TLS 1.0（TLS 1.0）。RFC 2246 §1 给出目标与分层：「The primary goal of the TLS Protocol is to provide privacy and data integrity between two communicating applications.The protocol is composed of two layers: the TLS Record Protocol and the TLS Handshake Protocol.」记录层负责分块、可选压缩、加 MAC 与加密，握手层在此之前完成认证与密钥协商。

## why

它是把加密从各应用里搬进公共一层的第一步：§3 交代血统「This document and the TLS protocol itself are based on the SSL 3.0 Protocol Specification as published by Netscape.」，§6 则把记录层的处理顺序钉死：「The Record Protocol takes messages to be transmitted, fragments the data into manageable blocks, optionally compresses the data, applies a MAC, encrypts, and transmits the result.」

## used

规范给出的强制基线只有一条：§9 写明「In the absence of an application profile standard specifying otherwise, a TLS compliant application MUST implement the cipher suite TLS_DHE_DSS_WITH_3DES_EDE_CBC_SHA.」压缩方面 §6.2.2 只加尺寸限制——「Compression must be lossless and may not increase the content length by more than 1024 bytes.」该条目只述规范，不谈部署规模。

## broken

两处在文档内部就留下隐患：CBC 的 IV 是隐式的，§6.2.3.2 说明「The IV for subsequent records is the last ciphertext block from the previous record.」，使相邻记录的 IV 可被预测；§3 又承认 TLS 1.0 与 SSL 3.0「do not interoperate」，同时保留了可回落 SSL 3.0 的机制。附录 D.4 仅以非规范措辞劝阻 40 位加密与匿名 Diffie-Hellman，本文件没有把任何套件判死。

## history

RFC 2246 头部为 T.Dierks 与 C.Allen（Certicom），类别 Standards Track，日期 1999 年 1 月，既没有 Obsoletes 也没有 Updates 行；摘要自陈「This document specifies Version 1.0 of the Transport Layer Security (TLS) protocol.」，是 TLS 家族的第一份文档。

**技术参数与复算边界**

该条目的形式模型是 \(\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\)。输入：输入：TLS 1.0的公开参数、密钥/随机数与消息；变量说明：Π 协议，A 敌手，n 会话数，PRF/AEAD 为底层原语。 预期输出：按 TLS 1.0 的规范执行后得到可验证的输出或可比较的优势界。 复算必须给出输入、步骤、输出和单位；示例只演示流程，不替代标准测试向量。

复杂度由密钥长度、分组/状态规模、轮数、随机数质量和敌手模型共同决定；参数越界、版本差异与实现侧信道都可能使公式结论失效。已登记限制：该条目只给出形式模型与可复算步骤，不声称已完成生产实现、侧信道认证或第三方安全评估。

## refs

- Wikipedia search entry for TLS 1.0. https://zh.wikipedia.org/w/index.php?search=TLS%201.0
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/
- RFC 2246: The TLS Protocol Version 1.0. https://www.rfc-editor.org/rfc/rfc2246

## example

**形式模型与复算步骤**

\[\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\]

TLS 1.0的公开参数、密钥/随机数与消息；变量说明：Π 协议，A 敌手，n 会话数，PRF/AEAD 为底层原语。1.把协议消息序列写成状态机。2.用混合论证逐个替换原语。3.把剩余优势归约到 PRF/AEAD 安全。边界：公式只覆盖已登记的参数与假设；参数取值、标准版本和实现细节仍以来源为准。
