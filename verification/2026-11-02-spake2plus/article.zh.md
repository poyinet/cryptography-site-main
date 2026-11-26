# SPAKE2+ 口令认证密钥交换

## principle

**协议**：SPAKE2+ 口令认证密钥交换（SPAKE2+, an Augmented Password-Authenticated Key Exchange (PAKE) Protocol）。RFC 9383 摘要给出机制定义：「This document describes SPAKE2+, a Password-Authenticated Key Exchange (PAKE) protocol run between two parties for deriving a strong shared key with no risk of disclosing the password.」并说明它是增强型：「SPAKE2+ is an augmented PAKE protocol, as only one party has knowledge of the password.」

## why

动机是口令不能裸奔于交换过程：摘要把目标写成「deriving a strong shared key with no risk of disclosing the password」，并把工程卖点列在一起——「This method is simple to implement, compatible with any prime-order group, and computationally efficient.」

## used

使用位置写在 §1：增补性质在执行受限、攻击者无法提前查询口令散列盐值的场景特别有价值，文件举出两类约束——「a constraint may be when physical proximity through a local network is required or when a first authentication factor is required for initiation of the protocol.」摘要给出通用形态：只有一侧持有口令，仍完成认证并得到会话密钥。

## broken

限度一是身份模型：「SPAKE2+ is the asymmetric or augmented version of SPAKE2, wherein only one party has knowledge of the password.」服务器侧仍需保存盐值/记录。限度二是标准地位：文件自陈「Neither SPAKE2 nor SPAKE2+ was selected as the result of the Crypto Forum Research Group (CFRG) PAKE selection competition.」，页眉 Category 为 Informational，不是 Standards Track。

## history

版本信息在页眉：流别为 Independent Submission，Category 标注 Informational，日期 September 2023，作者 T.Taubert（Apple Inc.）与 C.A.Wood。§1 交代血缘：本文内容从「[RFC9382], which specifies SPAKE2」拆出，因对称与增补 PAKE 的用例不同而分别规范。

**技术参数与复算边界**

该条目的形式模型是 \(\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\)。输入：输入：SPAKE2+ 口令认证密钥交换的公开参数、密钥/随机数与消息；变量说明：Π 协议，A 敌手，n 会话数，PRF/AEAD 为底层原语。 预期输出：按 SPAKE2+ 口令认证密钥交换 的规范执行后得到可验证的输出或可比较的优势界。 复算必须给出输入、步骤、输出和单位；示例只演示流程，不替代标准测试向量。

复杂度由密钥长度、分组/状态规模、轮数、随机数质量和敌手模型共同决定；参数越界、版本差异与实现侧信道都可能使公式结论失效。已登记限制：该条目只给出形式模型与可复算步骤，不声称已完成生产实现、侧信道认证或第三方安全评估。

## refs

- Wikipedia search entry for SPAKE2+ 口令认证密钥交换. https://zh.wikipedia.org/w/index.php?search=SPAKE2%2B%20%E5%8F%A3%E4%BB%A4%E8%AE%A4%E8%AF%81%E5%AF%86%E9%92%A5%E4%BA%A4%E6%8D%A2
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**形式模型与复算步骤**

\[\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\]

SPAKE2+ 口令认证密钥交换的公开参数、密钥/随机数与消息；变量说明：Π 协议，A 敌手，n 会话数，PRF/AEAD 为底层原语。1.把协议消息序列写成状态机。2.用混合论证逐个替换原语。3.把剩余优势归约到 PRF/AEAD 安全。边界：公式只覆盖已登记的参数与假设；参数取值、标准版本和实现细节仍以来源为准。
