# TLS 1.1

## principle

**协议**：TLS 1.1（TLS 1.1）。摘要只声明版本与用途：「This document specifies Version 1.1 of the Transport Layer Security (TLS) protocol.The TLS protocol provides communications security over the Internet.」注意用词已是 communications security 而非 1.0 的 privacy；分层不变，但块加密记录的 IV 处理按本版改动（见 §6.2.3.2）。

## why

改动清单在 §1.1，头两条就是本版的目的：「The implicit Initialization Vector (IV) is replaced with an explicit IV to protect against CBC attacks [CBCATT].」与「Handling of padding errors is changed to use the bad_record_mac alert rather than the decryption_failed alert to protect against CBC attacks.」前言自陈这只是「some small security improvements, clarifications, and editorial improvements」。

## used

记录层写下两条义务：接收方「MUST check this padding and SHOULD use the bad_record_mac alert to indicate padding errors.」；面对 Canvel 等人的计时攻击，「implementations MUST ensure that record processing time is essentially the same whether or not the padding is correct.」§9 的强制套件此时已是 TLS_RSA_WITH_3DES_EDE_CBC_SHA，附录 F.3 则说明本版「uses an explicit IV in order to protect against this attack.」

## broken

降级与静态密钥只剩部分处置：§7.4.7.1 写明版本回退检查是不对称的——「Client implementations, MUST and Server implementations MAY, check the version number.」，并把风险轻描淡写为「since the TLS handshake MACs prevent downgrade and no good attacks are known on those MACs, ambiguity is not considered a serious security risk」；填充错误的告警仍只是 SHOULD。压缩顺序也与 1.0 相同，未作禁止。

## history

RFC 4346 头部为 T.Dierks 与 E.Rescorla（RTFM, Inc.），类别 Standards Track，2006 年 4 月，标注「Obsoletes: 2246」，没有 Updates 行；§1.1 自陈是 TLS 1.0 的修订版。

**技术参数与复算边界**

该条目的形式模型是 \(\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\)。输入：输入：TLS 1.1的公开参数、密钥/随机数与消息；变量说明：Π 协议，A 敌手，n 会话数，PRF/AEAD 为底层原语。 预期输出：按 TLS 1.1 的规范执行后得到可验证的输出或可比较的优势界。 复算必须给出输入、步骤、输出和单位；示例只演示流程，不替代标准测试向量。

复杂度由密钥长度、分组/状态规模、轮数、随机数质量和敌手模型共同决定；参数越界、版本差异与实现侧信道都可能使公式结论失效。已登记限制：该条目只给出形式模型与可复算步骤，不声称已完成生产实现、侧信道认证或第三方安全评估。

## refs

- Wikipedia search entry for TLS 1.1. https://zh.wikipedia.org/w/index.php?search=TLS%201.1
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/
- RFC 4346: The Transport Layer Security (TLS) Protocol Version 1.1. https://www.rfc-editor.org/rfc/rfc4346

## example

**形式模型与复算步骤**

\[\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\]

TLS 1.1的公开参数、密钥/随机数与消息；变量说明：Π 协议，A 敌手，n 会话数，PRF/AEAD 为底层原语。1.把协议消息序列写成状态机。2.用混合论证逐个替换原语。3.把剩余优势归约到 PRF/AEAD 安全。边界：公式只覆盖已登记的参数与假设；参数取值、标准版本和实现细节仍以来源为准。
