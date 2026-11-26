# 成对密钥协商方案

## principle

**标准**：成对密钥协商方案（Pairwise Key Agreement Schemes）。摘要给出范围：「This Recommendation specifies key-establishment schemes based on the discrete logarithm problem over finite fields and elliptic curves, including several variations of Diffie-Hellman and Menezes-Qu-Vanstone (MQV) key establishment schemes.」即它管的是离散对数类协商方案的构造与使用条件。

## why

它把一类构造集中成一份可实施的规范：摘要写「This Recommendation specifies key-establishment schemes based on the discrete logarithm problem over finite fields and elliptic curves」，关键词表列出「Diffie-Hellman; elliptic curve cryptography; finite field cryptography; key agreement; key confirmation; key derivation; key establishment; MQV.」——协商、确认与派生在同一份文件里成体系。

## used

落地的是密钥建立方案的选型：文件按使用静态/临时密钥的数量给方案分档（关键词表以 MQV 收束这一族），并在 §5 给出 FFC 与 ECC 两类原语的算法步骤——目录中可见「MQV1 Form of the FFC MQV Primitive」、「Full MQV」与「One-Pass Form of the ECC MQV Primitive」。符合性测试与用语规范位于前言的 Authority 与 Conformance Testing 段落（「The requirements of this Recommendation are indicated by the word “shall.”」）。

## broken

限度一是适用条件的原话：这类指南「shall not apply to national security systems without the express approval of appropriate federal officials exercising policy authority over such systems」，不是无条件适用于所有联邦系统。限度二是文本边界：前言承认部分要求「may be out-of-scope for CAVP or CMVP validation testing」，其后被省略的分句才是责任归属——由使用、实现、安装或配置应用的一方承担。

## history

署名与版次在标题页：作者为 Elaine Barker、Lily Chen、Allen Roginsky、Apostol Vassilev、Richard Davis 五人，标题行写「NIST Special Publication 800-56A Revision 3」，DOI 指向 rev3 版；本文件自身未声明被后续修订取代。

**技术参数与复算边界**

该条目的形式模型是 \(S=\min_i S_i,\quad S_i\in\{\text{密钥强度},\text{分组安全},\text{实现安全}\}\)。输入：输入：成对密钥协商方案的公开参数、密钥/随机数与消息；变量说明：S 为综合安全强度；各分量取最小值，不能只看密钥位数。 预期输出：按 成对密钥协商方案 的规范执行后得到可验证的输出或可比较的优势界。 复算必须给出输入、步骤、输出和单位；示例只演示流程，不替代标准测试向量。

复杂度由密钥长度、分组/状态规模、轮数、随机数质量和敌手模型共同决定；参数越界、版本差异与实现侧信道都可能使公式结论失效。已登记限制：该条目只给出形式模型与可复算步骤，不声称已完成生产实现、侧信道认证或第三方安全评估。

## refs

- Wikipedia search entry for 成对密钥协商方案. https://zh.wikipedia.org/w/index.php?search=%E6%88%90%E5%AF%B9%E5%AF%86%E9%92%A5%E5%8D%8F%E5%95%86%E6%96%B9%E6%A1%88
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**形式模型与复算步骤**

\[S=\min_i S_i,\quad S_i\in\{\text{密钥强度},\text{分组安全},\text{实现安全}\}\]

成对密钥协商方案的公开参数、密钥/随机数与消息；变量说明：S 为综合安全强度；各分量取最小值，不能只看密钥位数。1.读取标准规定的密钥/分组/模式参数。2.按标准表换算等效强度。3.取最弱分量作为系统强度。边界：公式只覆盖已登记的参数与假设；参数取值、标准版本和实现细节仍以来源为准。
