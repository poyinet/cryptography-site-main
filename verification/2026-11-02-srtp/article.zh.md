# SRTP 安全实时传输

## principle

**协议**：SRTP 安全实时传输（Secure Real-time Transport Protocol）。RFC 3711 摘要给出定位与能力清单：「This document describes the Secure Real-time Transport Protocol (SRTP), a profile of the Real-time Transport Protocol (RTP), which can provide confidentiality, message authentication, and replay protection to the RTP traffic and to the control traffic for RTP, the Real-time Transport Control Protocol (RTCP).」即它是 RTP 的密码学剖面，同时管媒体与控制流量。

## why

摘要说明它给 RTP 与 RTCP 控制流量补上安全服务：「a profile of the Real-time Transport Protocol (RTP), which can provide confidentiality, message authentication, and replay protection to the RTP traffic and to the control traffic for RTP, the Real-time Transport Control Protocol (RTCP).」注意措辞是 can provide——能力取决于所选密码套件与密钥管理，不是默认全开。

## used

使用面是音视频与实时会话的承载加密：文档以「a profile of the Real-time Transport Protocol (RTP)」界定其作用位置，并在框架一节定义密码上下文与包处理流程；语音、视频会议等实现按该剖面套用在既有 RTP 报文之上。

## broken

限度一是它不规定密钥管理协议：§1 明确安全性有条件——「With appropriate key management (Sections 7 and 8), SRTP is secure (Sections 9) for unicast and multicast RTP applications (Section 11).」§8 名为 Key Management Considerations，对所使用的密钥管理提出约束，却不定义协商协议。限度二是保护范围只到 RTP/RTCP 流量，与应用层协议无关。

## history

版本信息在页眉与版权块：Request for Comments 3711，Network Working Group，日期 March 2004，版权行为「Copyright (C) The Internet Society (2004).All Rights Reserved.」（IETF Trust 的版权样式属于此后的文件）。本文件的自我定位是 RTP 的一个 profile，而非新的传输协议。

**技术参数与复算边界**

该条目的形式模型是 \(\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\)。输入：输入：SRTP 安全实时传输的公开参数、密钥/随机数与消息；变量说明：Π 协议，A 敌手，n 会话数，PRF/AEAD 为底层原语。 预期输出：按 SRTP 安全实时传输 的规范执行后得到可验证的输出或可比较的优势界。 复算必须给出输入、步骤、输出和单位；示例只演示流程，不替代标准测试向量。

复杂度由密钥长度、分组/状态规模、轮数、随机数质量和敌手模型共同决定；参数越界、版本差异与实现侧信道都可能使公式结论失效。已登记限制：该条目只给出形式模型与可复算步骤，不声称已完成生产实现、侧信道认证或第三方安全评估。

## refs

- Wikipedia search entry for SRTP 安全实时传输. https://zh.wikipedia.org/w/index.php?search=SRTP%20%E5%AE%89%E5%85%A8%E5%AE%9E%E6%97%B6%E4%BC%A0%E8%BE%93
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/
- RFC 3711: The Secure Real-time Transport Protocol. https://www.rfc-editor.org/rfc/rfc3711

## example

**形式模型与复算步骤**

\[\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\]

SRTP 安全实时传输的公开参数、密钥/随机数与消息；变量说明：Π 协议，A 敌手，n 会话数，PRF/AEAD 为底层原语。1.把协议消息序列写成状态机。2.用混合论证逐个替换原语。3.把剩余优势归约到 PRF/AEAD 安全。边界：公式只覆盖已登记的参数与假设；参数取值、标准版本和实现细节仍以来源为准。
