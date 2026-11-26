# HPKE 混合公钥加密

## principle

**协议**：HPKE 混合公钥加密（Hybrid Public Key Encryption）。RFC 9180 §5 说明各模式的共同接口：「All variants take a recipient public key and a sequence of plaintexts pt and produce an encapsulated key enc and a sequence of ciphertexts ct.」混合即公钥封装 + 对称 AEAD的组合。

## why

动机是既有方案不统一：§1 指出「Currently, there are numerous competing and non-interoperable standards and variants for hybrid encryption, mostly variants on the Elliptic Curve Integrated Encryption Scheme (ECIES)」，并说明「All these existing schemes have problems, e.g., because they rely on outdated primitives, lack proofs of indistinguishable (adaptive) chosen-ciphertext attack (IND-CCA2) security, or fail to provide test vectors.」§5.3 另外提供从加密上下文中导出密钥的接口。

## used

最常见用法是单条消息加密：§6.1 说明「In many cases, applications encrypt only a single message to a recipient's public key.」并给出无状态模板；套件标识由三部分拼接，§4 规定在 KEM 内部使用时「suite_id MUST start with」KEM 前缀，在 HPKE 其余部分「MUST start with」HPKE 前缀以标识整套密码套件。

## broken

边界写在安全分析里：§9.1 直说「HPKE does not provide forward secrecy with respect to recipient compromise.」§9.7.4 强调「HPKE ciphertexts are not forward secret with respect to recipient compromise in any mode.」文档另列非目标（不含降级与重放防护、不隐藏明文长度），且未登记任何后量子 KEM 套件。

## history

RFC 9180 于 2022 年 2 月发布，头部标注为 IRTF 与 Informational，并说明「This document is a product of the Crypto Forum Research Group (CFRG) in the IRTF.」；算法标识表在 §7（标题为 Algorithm Identifiers），本文没有 Obsoletes 行。

**技术参数与复算边界**

该条目的形式模型是 \(\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\)。输入：输入：HPKE 混合公钥加密的公开参数、密钥/随机数与消息；变量说明：Π 协议，A 敌手，n 会话数，PRF/AEAD 为底层原语。 预期输出：按 HPKE 混合公钥加密 的规范执行后得到可验证的输出或可比较的优势界。 复算必须给出输入、步骤、输出和单位；示例只演示流程，不替代标准测试向量。

复杂度由密钥长度、分组/状态规模、轮数、随机数质量和敌手模型共同决定；参数越界、版本差异与实现侧信道都可能使公式结论失效。已登记限制：该条目只给出形式模型与可复算步骤，不声称已完成生产实现、侧信道认证或第三方安全评估。

## refs

- Wikipedia search entry for HPKE 混合公钥加密. https://zh.wikipedia.org/w/index.php?search=HPKE%20%E6%B7%B7%E5%90%88%E5%85%AC%E9%92%A5%E5%8A%A0%E5%AF%86
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/
- RFC 9180: Hybrid Public Key Encryption. https://www.rfc-editor.org/rfc/rfc9180
- Published standard/RFC for HPKE 混合公钥加密. https://www.rfc-editor.org/rfc/rfc9180

## example

**形式模型与复算步骤**

\[\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\]

HPKE 混合公钥加密的公开参数、密钥/随机数与消息；变量说明：Π 协议，A 敌手，n 会话数，PRF/AEAD 为底层原语。1.把协议消息序列写成状态机。2.用混合论证逐个替换原语。3.把剩余优势归约到 PRF/AEAD 安全。边界：公式只覆盖已登记的参数与假设；参数取值、标准版本和实现细节仍以来源为准。
