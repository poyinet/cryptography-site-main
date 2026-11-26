# SSH 1.x

## principle

**协议**：SSH 1.x（Secure Shell (SSH) Protocol Version 1.x）。SSH 1.x 的地位由新文档的回溯描述确定：RFC 4253 §5 写明「Earlier versions of this protocol have not been formally documented, but it is widely known that they use 'protoversion' of “1.x” (e.g., “1.5” or “1.3”).」它是一条存在过但没有正式标准化文本的旧协议线。

## why

2.0 重写的理由写在架构文档摘要里：「The SSH protocol consists of three major components: The Transport Layer Protocol provides server authentication, confidentiality, and integrity with perfect forward secrecy.」架构文档把前向保密描述为 2.0 传输层提供的属性，而旧协议线没有对应的标准化描述可依据。

## used

§5 把适用范围收窄：「Information in this section is only relevant for implementations supporting compatibility with SSH versions 1.x.」兼容做法由新服务器让步：§5.1 的小标题即 Old Client, New Server，规定「the server SHOULD identify its 'protoversion' as “1.99”.」并要求使用 2.0 的客户端把它认作与 2.0 等同。

## broken

文档缺失与兼容过程本身都是问题：§5 说「the only known documentation of the 1.x protocol is contained in README files that are shipped along with the source code [ssh-1.2.30].」；§5.2 说明新客户端可能先发数据，于是「the old protocol may already be corrupt when the client learns that the server is old」，此时应关闭连接并按旧协议重连。

## history

RFC 4253 与 RFC 4251 同为 2006 年 1 月的 Standards Track 文档（署名 T.Ylonen，SSH Communications Security Corp，与 C.Lonvick, Ed.，Cisco Systems），头部都没有 Obsoletes 或 Updates 行；§5 记录当时的现实——许多实现已用 2.0，「but it is known that there are still devices using the previous versions」。

**技术参数与复算边界**

该条目的形式模型是 \(\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\)。输入：输入：SSH 1.x的公开参数、密钥/随机数与消息；变量说明：Π 协议，A 敌手，n 会话数，PRF/AEAD 为底层原语。 预期输出：按 SSH 1.x 的规范执行后得到可验证的输出或可比较的优势界。 复算必须给出输入、步骤、输出和单位；示例只演示流程，不替代标准测试向量。

复杂度由密钥长度、分组/状态规模、轮数、随机数质量和敌手模型共同决定；参数越界、版本差异与实现侧信道都可能使公式结论失效。已登记限制：该条目只给出形式模型与可复算步骤，不声称已完成生产实现、侧信道认证或第三方安全评估。

**参数与状态规模**

公式 \(\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\) 的输入、输出和单位必须逐项登记；复算顺序为：1. 把协议消息序列写成状态机 2. 用混合论证逐个替换原语 3. 把剩余优势归约到 PRF/AEAD 安全。

状态规模、密钥长度、分组长度和轮数决定复杂度；这些量不能从标题推断，必须以标准或实现文档为准。

## refs

- Wikipedia search entry for SSH 1.x. https://zh.wikipedia.org/w/index.php?search=SSH%201.x
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**形式模型与复算步骤**

\[\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\]

SSH 1.x的公开参数、密钥/随机数与消息；变量说明：Π 协议，A 敌手，n 会话数，PRF/AEAD 为底层原语。1.把协议消息序列写成状态机。2.用混合论证逐个替换原语。3.把剩余优势归约到 PRF/AEAD 安全。边界：公式只覆盖已登记的参数与假设；参数取值、标准版本和实现细节仍以来源为准。
