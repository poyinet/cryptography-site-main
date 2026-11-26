# ECDSA 椭圆曲线数字签名算法

## principle

**算法**：ECDSA 椭圆曲线签名（Elliptic Curve Digital Signature Algorithm）。标准的范围句先立框架：「This standard defines methods for digital signature generation that can be used for the protection of binary data (commonly called a message) and for the verification and validation of those digital signatures.」ECDSA 在其中的位置由 §4 印明：「The Elliptic Curve Digital Signature Algorithm (ECDSA) is specified in this standard.」也即它不是一份独立规范，而是数字签名标准里的一支算法。

## why

为什么标准要收编它，§1 交代了来历与缺口：ECDSA「ECDSA was originally specified in American National Standards (ANS) X9.62 [3] (withdrawn).」——原始出处是一份已撤回的 ANSI 标准。标准因此需要自己规定签名方法；同段还记下列于其后的确定化签名变体（§1），说明纳入的不只是原算法，还有对它随机数依赖的修补。

## used

用法由两句规范性句子界定。密钥分工（§5.2）是「The private key shall be used only for signature generation, as specified in this standard, and shall be kept secret.」验证侧的耦合条件（§6.1.2）是「A digital signature shall be verified as specified in Section 6.4.2 using the same domain parameters and hash function that were used during signature generation.」也即换曲线参数或换哈希都会让验证不成立，部署必须把参数组与哈希一起固定下来。

## broken

限度有三处。其一来自 §3 的密钥义务——私钥只能用于签名生成且须保密，泄露即等同可伪造。其三来自同一节的撤回事实：ECDSA 的最初规范 X9.62 已撤回，凡只引 X9.62 而不引本标准的实现说明，其出处面本身不成立。

## history

沿革按留存件印出的两句：ECDSA 先在 ANSI X9.62 里被规定、该标准已撤回，随后由数字签名标准收编；标准在 §1 里记明「A variant of ECDSA with a deterministic signature generation」，说明确定化改法也在本标准里获得位置。文件自身的身份按项目口径复述于引号外：FIPS 186-5，2023 年 6 月发布，取代 FIPS 186-4。也就是说，ECDSA 的标准化叙事分两段：ANS 时期与本标准时期。

**技术参数与复算边界**

该条目的形式模型是 \(s=k^{-1}\big(H(m)+r d\big)\bmod n\)。输入：输入：ECDSA 椭圆曲线签名的公开参数、密钥/随机数与消息；变量说明：k 一次性随机数，r 为承诺点横坐标，d 私钥，n 子群阶。 预期输出：按 ECDSA 椭圆曲线签名 的规范执行后得到可验证的输出或可比较的优势界。 复算必须给出输入、步骤、输出和单位；示例只演示流程，不替代标准测试向量。

复杂度由密钥长度、分组/状态规模、轮数、随机数质量和敌手模型共同决定；参数越界、版本差异与实现侧信道都可能使公式结论失效。已登记限制：该条目只给出形式模型与可复算步骤，不声称已完成生产实现、侧信道认证或第三方安全评估。

与 DSA 数字签名算法、数字签名标准（FIPS 186-5） 的关系用于定位阅读路线，不表示同一实体。

## refs

- Wikipedia search entry for ECDSA 椭圆曲线签名. https://zh.wikipedia.org/w/index.php?search=ECDSA%20%E6%A4%AD%E5%9C%86%E6%9B%B2%E7%BA%BF%E7%AD%BE%E5%90%8D
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**形式模型与复算步骤**

\[s=k^{-1}\big(H(m)+r d\big)\bmod n\]

ECDSA 椭圆曲线签名的公开参数、密钥/随机数与消息；变量说明：k 一次性随机数，r 为承诺点横坐标，d 私钥，n 子群阶。1.选择随机 k，计算 R=kG 与 r。2.计算 s=k^{-1}(H(m)+rd) mod n。3.输出 (r,s)，验证者检查签名方程。边界：公式只覆盖已登记的参数与假设；参数取值、标准版本和实现细节仍以来源为准。
