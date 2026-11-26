# DSA 数字签名算法

## principle

**算法**：DSA 数字签名算法（Digital Signature Algorithm）。数字签名用于检测数据是否被未授权修改并认证签署者身份，即所谓不可否认性。数字签名算法（DSA）由 FIPS 186 系列的早期版本批准用于签名生成；FIPS 186-5 写明「This standard no longer approves the DSA for digital signature generation」，但「the DSA may be used to verify signatures generated prior to the implementation date of this standard」，并把 DSA 的完整规范指回 FIPS 186-4。

## why

FIPS 186-5 批准三种签名技术：RSA（按 IETF RFC 8017）、ECDSA（含 RFC 6979 的确定性 ECDSA）以及 RFC 8032 的 EdDSA 与 HashEdDSA。标准把 ECDSA 描述为「the elliptic curve analog of DSA」，即同一思路的椭圆曲线版本，并把签名生成集中到这些方案，同时在 §4 保留 DSA 的验证用途。

## used

现行用途是验证在标准实施日之前已经生成的 DSA 签名；新的签名生成按标准批准的方案进行，其中 ECDSA 的生成与验证流程写在 §6.4.1 与 §6.4.2，RSA 签名则交由 RFC 8017。标准在 §3 规定用于签名生成与验证的密钥对「shall not be used for any other purpose」，并在 §5 与 §6 分别对 RSA 与 ECDSA 重复了同一限制。

## broken

FIPS 186-5 直接声明「the algorithms in this standard are not expected to provide resistance to attacks from a large-scale quantum computer」，这是签名生成方案更换、DSA 退出生成的原因；DSA 原先的有限域参数与离散对数设定属于 FIPS 186-4，本标准只在 §4 保留其验证角色。标准另在 §6 提示椭圆曲线方案的实现须防范「side-channel attacks or fault attacks」。

## history

FIPS 186-5 于 2023 年 2 月 3 日发布并即时生效，取代 FIPS 186-4；附录 E 记录 DSA 不再批准用于签名生成，发布公告还说明 FIPS 186-4 在标准发布后一年内继续有效、随后撤回。DSA 由此从生成算法转为只保留验证旧签名的角色。

**技术参数与复算边界**

该条目的形式模型是 \(s=k^{-1}\big(H(m)+r d\big)\bmod n\)。输入：输入：DSA 数字签名算法的公开参数、密钥/随机数与消息；变量说明：k 一次性随机数，r 为承诺点横坐标，d 私钥，n 子群阶。 预期输出：按 DSA 数字签名算法 的规范执行后得到可验证的输出或可比较的优势界。 复算必须给出输入、步骤、输出和单位；示例只演示流程，不替代标准测试向量。

复杂度由密钥长度、分组/状态规模、轮数、随机数质量和敌手模型共同决定；参数越界、版本差异与实现侧信道都可能使公式结论失效。已登记限制：该条目只给出形式模型与可复算步骤，不声称已完成生产实现、侧信道认证或第三方安全评估。

**参数与状态规模**

公式 \(s=k^{-1}\big(H(m)+r d\big)\bmod n\) 的输入、输出和单位必须逐项登记；复算顺序为：1. 选择随机 k，计算 R=kG 与 r 2. 计算 s=k^{-1}(H(m)+rd) mod n 3. 输出 (r,s)，验证者检查签名方程。

状态规模、密钥长度、分组长度和轮数决定复杂度；这些量不能从标题推断，必须以标准或实现文档为准。

**测试向量与实现边界**

标准测试向量只证明某组输入在某个实现中产生了预期输出，不证明所有参数都安全。记录测试向量时至少要写：算法/模式、密钥、明文或消息、随机数/IV、输出长度、实现版本。该条目已登记的限制是：该条目只给出形式模型与可复算步骤，不声称已完成生产实现、侧信道认证或第三方安全评估。

如果实现使用查表、分支或可变时间操作，算法层的证明不能替代侧信道评估；如果协议层没有认证，算法层的机密性也不能阻止替换或重放。

## refs

- Wikipedia search entry for DSA 数字签名算法. https://zh.wikipedia.org/w/index.php?search=DSA%20%E6%95%B0%E5%AD%97%E7%AD%BE%E5%90%8D%E7%AE%97%E6%B3%95
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**形式模型与复算步骤**

\[s=k^{-1}\big(H(m)+r d\big)\bmod n\]

DSA 数字签名算法的公开参数、密钥/随机数与消息；变量说明：k 一次性随机数，r 为承诺点横坐标，d 私钥，n 子群阶。1.选择随机 k，计算 R=kG 与 r。2.计算 s=k^{-1}(H(m)+rd) mod n。3.输出 (r,s)，验证者检查签名方程。边界：公式只覆盖已登记的参数与假设；参数取值、标准版本和实现细节仍以来源为准。
