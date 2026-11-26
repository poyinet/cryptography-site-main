# DTLS 1.0

## principle

**协议**：DTLS 1.0（DTLS 1.0）。摘要界定版本与对象：「This document specifies Version 1.0 of the Datagram Transport Layer Security (DTLS) protocol.The DTLS protocol provides communications privacy for datagram protocols.」即在不保证顺序与交付的传输上提供 TLS 级保护，并保留数据报语义。

## why

设计取向是最小改动：§1 写明「DTLS is deliberately designed to be as similar to TLS as possible, both to minimize new security invention and to maximize the amount of code and infrastructure reuse.」§4 说明写法：「instead of presenting DTLS as a new protocol, we present it as a series of deltas from TLS 1.1 [TLS11].」

## used

§4.2 列出相对 TLS 的三处改动，第一条是「A stateless cookie exchange has been added to prevent denial of service attacks.」，随后是握手头的分片与乱序处理和重传计时器。§4.1.1 另给出一条硬性约束：「Each DTLS record MUST fit within a single datagram.」

## broken

重放检测是可选的：§3.3 说明「The replay detection feature is optional, since packet duplication is not always malicious, but can also occur due to routing errors.」§4.1.2.2 直接禁掉流密码：「RC4 MUST NOT be used with DTLS.」cookie 只解决伪造源地址，§4.2.1 自陈「This mechanism does not provide any defense against DoS attacks mounted from valid IP addresses.」

## history

RFC 4347 头部为 E.Rescorla（RTFM, Inc.）与 N.Modadugu（Stanford University），类别 Standards Track，2006 年 4 月，没有 Obsoletes 或 Updates 行；标题行只写「Datagram Transport Layer Security」，Version 1.0 出现在摘要里。

**技术参数与复算边界**

该条目的形式模型是 \(\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\)。输入：输入：DTLS 1.0的公开参数、密钥/随机数与消息；变量说明：Π 协议，A 敌手，n 会话数，PRF/AEAD 为底层原语。 预期输出：按 DTLS 1.0 的规范执行后得到可验证的输出或可比较的优势界。 复算必须给出输入、步骤、输出和单位；示例只演示流程，不替代标准测试向量。

复杂度由密钥长度、分组/状态规模、轮数、随机数质量和敌手模型共同决定；参数越界、版本差异与实现侧信道都可能使公式结论失效。已登记限制：该条目只给出形式模型与可复算步骤，不声称已完成生产实现、侧信道认证或第三方安全评估。

**参数与状态规模**

公式 \(\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\) 的输入、输出和单位必须逐项登记；复算顺序为：1. 把协议消息序列写成状态机 2. 用混合论证逐个替换原语 3. 把剩余优势归约到 PRF/AEAD 安全。

状态规模、密钥长度、分组长度和轮数决定复杂度；这些量不能从标题推断，必须以标准或实现文档为准。

## refs

- Wikipedia search entry for DTLS 1.0. https://zh.wikipedia.org/w/index.php?search=DTLS%201.0
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**形式模型与复算步骤**

\[\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\]

DTLS 1.0的公开参数、密钥/随机数与消息；变量说明：Π 协议，A 敌手，n 会话数，PRF/AEAD 为底层原语。1.把协议消息序列写成状态机。2.用混合论证逐个替换原语。3.把剩余优势归约到 PRF/AEAD 安全。边界：公式只覆盖已登记的参数与假设；参数取值、标准版本和实现细节仍以来源为准。
