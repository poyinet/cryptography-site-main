# 肖尔算法

## principle

**攻击**：肖尔算法（Shor's Algorithm）。NIST IR 8547 对肖尔算法的作用对象给出明确结论。§2.1.1 在列出 ECDSA、RSA（RFC 8017）与 EdDSA（RFC 8032）以及 SP 800-186 指定的曲线之后写道：「These algorithms are vulnerable to Shor's Algorithm on a cryptanalytically relevant quantum computer.」§2.1.2 对 SP 800-56A（有限域与椭圆曲线离散对数，含 Diffie-Hellman 与 MQV 变体）与 SP 800-56B（基于 RSA 的密钥建立）给出同一判断：「The key-establishment algorithms in both of these Special Publications are vulnerable to Shor's Algorithm on a cryptanalytically relevant quantum computer.」

## why

FIPS 186-5 在 §1 给出同一立场的标准文本：「Note that the algorithms in this standard are not expected to provide resistance to attacks from a large-scale quantum computer.Digital signature algorithms that will provide security from quantum computers will be specified in future NIST publications.」这正是把 RSA、ECDSA 与 EdDSA 归入量子脆弱一类并需要更换的原因陈述。

## used

该算法覆盖的范围可从标准自身的分类读出：FIPS 186-5 附录 A 引言说明「Discrete logarithm cryptography (DLC) is divided into finite field cryptography (FFC) and elliptic curve cryptography (ECC).… DSA is an example of FFC, and ECDSA is an example of ECC.Other examples of DLC are the Diffie-Hellman and MQV key agreement algorithms」，并说明「The most common example of integer factorization cryptography (IFC) is RSA.」IR 8547 在算法清单段落与末尾总结两处都把离散对数与整数分解两类写成在够用的量子机上会被肖尔算法攻破，覆盖的正是上面这两类。

## broken

IR 8547 只给结论、不给复杂度：全文“Shor”仅出现两次（§2.1.1 与 §2.1.2），未给出多项式时间或量子比特数的表述，该条目也不超出该范围。

## history

标准文本的时间线是：FIPS 186-5（2023 年 2 月）承认本标准的算法不预期抵抗大规模量子计算机，并说量子安全签名将由后续 NIST 出版物规定；NIST IR 8547（2026 年 10 月）把这一判断具体到算法清单与迁移日期，明确两类公钥机（§2.1.1 签名、§2.1.2 密钥建立）都可被肖尔算法攻破。

**技术参数与复算边界**

该条目的形式模型是 \(T=\mathrm{poly}(\log N)\)。输入：输入：肖尔算法的公开参数、密钥/随机数与消息；变量说明：N 待分解整数；Shor 算法在量子计算机上多项式时间分解。 预期输出：按 肖尔算法 的规范执行后得到可验证的输出或可比较的优势界。 复算必须给出输入、步骤、输出和单位；示例只演示流程，不替代标准测试向量。

复杂度由密钥长度、分组/状态规模、轮数、随机数质量和敌手模型共同决定；参数越界、版本差异与实现侧信道都可能使公式结论失效。已登记限制：该条目只给出形式模型与可复算步骤，不声称已完成生产实现、侧信道认证或第三方安全评估。

**参数与状态规模**

公式 \(T=\mathrm{poly}(\log N)\) 的输入、输出和单位必须逐项登记；复算顺序为：1. 随机选 a，求 gcd 2. 量子求阶 r 3. 由 r 推导因子。

状态规模、密钥长度、分组长度和轮数决定复杂度；这些量不能从标题推断，必须以标准或实现文档为准。

## refs

- Wikipedia search entry for 肖尔算法. https://zh.wikipedia.org/w/index.php?search=%E8%82%96%E5%B0%94%E7%AE%97%E6%B3%95
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**形式模型与复算步骤**

\[T=\mathrm{poly}(\log N)\]

肖尔算法的公开参数、密钥/随机数与消息；变量说明：N 待分解整数；Shor 算法在量子计算机上多项式时间分解。1.随机选 a，求 gcd。2.量子求阶 r。3.由 r 推导因子。边界：公式只覆盖已登记的参数与假设；参数取值、标准版本和实现细节仍以来源为准。
