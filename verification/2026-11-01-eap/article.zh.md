# EAP 认证框架

## principle

**协议**：EAP 认证框架（Extensible Authentication Protocol）。EAP 是框架而非某一机制：RFC 3748 §1 定义「This document defines the Extensible Authentication Protocol (EAP), an authentication framework which supports multiple authentication methods.」

## why

可扩展性来自`认证器不必认识方法`：§1 说明「Rather than requiring the authenticator to be updated to support each new authentication method, EAP permits the use of a backend authentication server, which may implement some or all authentication methods, with the authenticator acting as a pass-through for some or all methods and peers.」

## used

透传认证器只做有限的检查与转发：§2.3 规定「Compliant pass-through authenticator implementations MUST by default forward EAP packets of any Type.」而 §2.1 要求一次会话中「the peer and authenticator MUST utilize only one authentication method (Type 4 or greater) within an EAP conversation, after which the authenticator MUST send a Success or Failure packet.」

## broken

框架不承担下层协商与消息承载的安全：§7.11 指出「if the lower layer performs ciphersuite negotiation, it should be understood that EAP does not provide by itself integrity protection of that negotiation.」§2.2 另外禁止把结果与通知消息用于他途：「the Success, Failure, Nak Response(s), and Notification Request/Response messages MUST NOT be used to carry data destined for delivery to other EAP methods.」

## history

RFC 3748 于 2004 年 6 月发布为 Standards Track 并标注「Obsoletes: 2284」；§6.2 说明方法类型空间的稀缺：「The original EAP method Type space has a range from 1 to 255, and is the scarcest resource in EAP, and thus must be allocated with care.Method Types 1-45 have been allocated, with 20 available for re-use.」

**技术参数与复算边界**

该条目的形式模型是 \(\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\)。输入：输入：EAP 认证框架的公开参数、密钥/随机数与消息；变量说明：Π 协议，A 敌手，n 会话数，PRF/AEAD 为底层原语。 预期输出：按 EAP 认证框架 的规范执行后得到可验证的输出或可比较的优势界。 复算必须给出输入、步骤、输出和单位；示例只演示流程，不替代标准测试向量。

复杂度由密钥长度、分组/状态规模、轮数、随机数质量和敌手模型共同决定；参数越界、版本差异与实现侧信道都可能使公式结论失效。已登记限制：该条目只给出形式模型与可复算步骤，不声称已完成生产实现、侧信道认证或第三方安全评估。

## refs

- Wikipedia search entry for EAP 认证框架. https://zh.wikipedia.org/w/index.php?search=EAP%20%E8%AE%A4%E8%AF%81%E6%A1%86%E6%9E%B6
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/
- RFC 3748: Extensible Authentication Protocol. https://www.rfc-editor.org/rfc/rfc3748

## example

**形式模型与复算步骤**

\[\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\]

EAP 认证框架的公开参数、密钥/随机数与消息；变量说明：Π 协议，A 敌手，n 会话数，PRF/AEAD 为底层原语。1.把协议消息序列写成状态机。2.用混合论证逐个替换原语。3.把剩余优势归约到 PRF/AEAD 安全。边界：公式只覆盖已登记的参数与假设；参数取值、标准版本和实现细节仍以来源为准。
