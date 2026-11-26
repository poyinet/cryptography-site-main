# PQ/T 混合方案术语

## principle

**协议**：PQ/T 混合方案术语（Terminology for Post-Quantum Traditional Hybrid Schemes）。可引用的权威文本是术语文件 RFC 9794，它把混合方案讲清楚：§4「PQ/T hybrid protocol: A protocol that uses two or more component algorithms providing the same cryptographic functionality, where at least one is a post-quantum algorithm and at least one is a traditional algorithm.」同节还给出复合式定义——字段与消息流与单算法版本相同的形态。

## why

混合的理由是后量子算法本身也可能被攻破：§2「it should not be assumed that an algorithm will not be compromised just because it is designed to provide post-quantum cryptography.」§1 记录先取后藏的威胁：「Data encrypted today (in 2025) with an algorithm vulnerable to a quantum computer can be stored for decryption by a future attacker with a CRQC.」§5 给出混合属性的定义式表述：只要有一个提供该功能的组件算法仍然安全，性质就成立。

## used

术语用于区分两种落地路径：§4 用「PQ/T hybrid protocol with composite key establishment」描述在协议字段与消息流不变的前提下引入混合 KEM，用 composite data authentication 描述把 PQ 与 traditional 签名一起呈现为单一接口的做法。§5 则给出选型提示：为互通而做的混合必须满足混合互通性，而为实现安全而做的混合「will likely require」混合机密性或混合认证——原文保留概率措辞。同节还强调「It is not possible for one PQ/T hybrid scheme or PQ/T hybrid protocol to achieve all of the properties in this section.」

## broken

限制集中在两点。第一，同时提供机密性与认证的协议未必两种混合性质都有：§5 说「PQ/T hybrid protocols that offer both confidentiality and authentication do not necessarily offer both hybrid confidentiality and hybrid authentication.」并举例基于 RFC 5280 单算法证书时只有单算法认证。第二，混合证书不是必然给出混合身份认证：§6「The use of a PQ/T hybrid certificate does not necessarily achieve hybrid authentication of the identity of the sender; this is determined by properties of the chain of trust.」

## history

**技术参数与复算边界**

该条目的形式模型是 \(\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\)。输入：输入：PQ/T 混合方案术语的公开参数、密钥/随机数与消息；变量说明：Π 协议，A 敌手，n 会话数，PRF/AEAD 为底层原语。 预期输出：按 PQ/T 混合方案术语 的规范执行后得到可验证的输出或可比较的优势界。 复算必须给出输入、步骤、输出和单位；示例只演示流程，不替代标准测试向量。

复杂度由密钥长度、分组/状态规模、轮数、随机数质量和敌手模型共同决定；参数越界、版本差异与实现侧信道都可能使公式结论失效。已登记限制：该条目只给出形式模型与可复算步骤，不声称已完成生产实现、侧信道认证或第三方安全评估。

## refs

- Wikipedia search entry for PQ/T 混合方案术语. https://zh.wikipedia.org/w/index.php?search=PQ%2FT%20%E6%B7%B7%E5%90%88%E6%96%B9%E6%A1%88%E6%9C%AF%E8%AF%AD
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**形式模型与复算步骤**

\[\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\]

PQ/T 混合方案术语的公开参数、密钥/随机数与消息；变量说明：Π 协议，A 敌手，n 会话数，PRF/AEAD 为底层原语。1.把协议消息序列写成状态机。2.用混合论证逐个替换原语。3.把剩余优势归约到 PRF/AEAD 安全。边界：公式只覆盖已登记的参数与假设；参数取值、标准版本和实现细节仍以来源为准。
