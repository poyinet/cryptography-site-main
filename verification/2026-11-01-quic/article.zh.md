# QUIC 传输协议

## principle

**协议**：QUIC 传输协议（QUIC）。RFC 9000 §1 说明承载方式与目的：「QUIC packets are carried in UDP datagrams [UDP] to better facilitate deployment in existing systems and networks.」QUIC 因此是运行在 UDP 之上、自带安全与多路复用的传输协议，而不是 TCP 之上的一个加密层。

## why

安全与传输参数一次协商：§1 写明「The QUIC handshake combines negotiation of cryptographic and transport parameters.QUIC integrates the TLS handshake [TLS13], although using a customized framing for protecting packets.」

## used

保护职责由 RFC 9001 规定：「This document describes how QUIC [QUIC-TRANSPORT] is secured using TLS [TLS13].」并说明「QUIC [QUIC-TRANSPORT] assumes responsibility for the confidentiality and integrity protection of packets.」密钥有明确的丢弃时点：客户端首次发送 Handshake 包、服务器首次成功处理 Handshake 包时「MUST discard Initial keys」。

## broken

版本协商是不受保护的一环：§12.1 记载「Version Negotiation packets have no cryptographic protection」，Retry 包只用 AEAD 函数防偶然修改；§6.2 对本版本留下「How to perform version negotiation is left as future work」的说明，即版本 1 没有可证明不被降级的版本协商。

## history

RFC 9000 与配套的 RFC 9001 同为 2021 年 5 月的 Standards Track 文件（前者编辑为 J.Iyengar 与 M.Thomson，后者为 M.Thomson 与 S.Turner），两份头部都没有 Updates 或 Obsoletes 行；本文件定义的是「version 1 of QUIC」。

**技术参数与复算边界**

该条目的形式模型是 \(\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\)。输入：输入：QUIC 传输协议的公开参数、密钥/随机数与消息；变量说明：Π 协议，A 敌手，n 会话数，PRF/AEAD 为底层原语。 预期输出：按 QUIC 传输协议 的规范执行后得到可验证的输出或可比较的优势界。 复算必须给出输入、步骤、输出和单位；示例只演示流程，不替代标准测试向量。

复杂度由密钥长度、分组/状态规模、轮数、随机数质量和敌手模型共同决定；参数越界、版本差异与实现侧信道都可能使公式结论失效。已登记限制：该条目只给出形式模型与可复算步骤，不声称已完成生产实现、侧信道认证或第三方安全评估。

**参数与状态规模**

公式 \(\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\) 的输入、输出和单位必须逐项登记；复算顺序为：1. 把协议消息序列写成状态机 2. 用混合论证逐个替换原语 3. 把剩余优势归约到 PRF/AEAD 安全。

状态规模、密钥长度、分组长度和轮数决定复杂度；这些量不能从标题推断，必须以标准或实现文档为准。

## refs

- Wikipedia search entry for QUIC 传输协议. https://zh.wikipedia.org/w/index.php?search=QUIC%20%E4%BC%A0%E8%BE%93%E5%8D%8F%E8%AE%AE
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/
- RFC 9000: QUIC: A UDP-Based Multiplexed and Secure Transport. https://www.rfc-editor.org/rfc/rfc9000
- Published standard/RFC for QUIC 传输协议. https://www.rfc-editor.org/rfc/rfc9000

## example

**形式模型与复算步骤**

\[\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\]

QUIC 传输协议的公开参数、密钥/随机数与消息；变量说明：Π 协议，A 敌手，n 会话数，PRF/AEAD 为底层原语。1.把协议消息序列写成状态机。2.用混合论证逐个替换原语。3.把剩余优势归约到 PRF/AEAD 安全。边界：公式只覆盖已登记的参数与假设；参数取值、标准版本和实现细节仍以来源为准。
