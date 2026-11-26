# KMAC 基于 KECCAK 的消息认证码

## principle

**算法**：KMAC 基于散列的 MAC（KMAC）。构造在 §4.3 印出：「KMAC concatenates a padded version of the key K with the input X and an encoding of the requested output length L.The result is then passed to cSHAKE, along with the requested output length L, the name N」，即密钥先按字节对齐填充，再把输入与输出长度编码一并喂给 cSHAKE，函数名 KMAC 用作域分隔。§1 把它归入四类派生函数之一：「All four functions defined in this Recommendation--cSHAKE, KMAC, TupleHash, and ParallelHash--have these properties in common:」

## why

存在理由有两句支撑。§1 把 KMAC 定性为带密钥、可变长输出的伪随机函数族成员（该节列出的就是这几类功能）。§8.2.2 用对照表说明与既有 MAC 的等价关系：「To illustrate the security properties of KMAC for given parameter settings, Table 1 lists a few other approved MAC algorithms along with equivalent settings」，即 KMAC 的动机是在 SHA-3 体系内提供与 HMAC/CMAC 可对齐的参数化选择，而不是另造一套强度口径。

## used

§4 印出两条用法。定长用法就是函数本体「KMAC128(K, X, L, S)」，其第二步直接返回 cSHAKE128 的结果；变长用法由文本单独说明：「Some applications of KMAC may not know the number of output bits they will need until after the outputs begin to be produced.For these applications, KMAC can also be used as a XOF (i.e., the output can be extended to any desired length)」，即 KMACXOF 用于事先不知道要多少比特的场合。

## broken

限度由同一节的规范性句子给出，且是强约束：「Approved uses of KMAC require the length of K to be at least the required security strength, as discussed in Sec.8.4.1.」即密钥长度不足直接使`经批准`的用法不成立。同一节还印有有效性条件「Validity Conditions: len(K) < 22040 and 0  L < 22040 and len(S) < 22040」（该行在本副本里把上标拉平成连排数字），超出即不在函数定义域内。

## history

版本事实来自留存文本自身：题头行为「SHA-3 DERIVED FUNCTIONS: CSHAKE, KMAC, TUPLEHASH, AND PARALLELHASH」，即 SP 800-185（2022 年 12 月）首次把这四个派生函数一并标准化。§2.1 在定义 KECCAK 家族时交代了上一环：「KECCAK was originally specified in [2], and standardized in FIPS 202.」名称来历由同节脚注写明 KMAC 即 KECCAK Message Authentication Code 的缩写。本留存件每页还印有一行免费获取提示并给出数字对象标识符，该行按本项目口径不在正文里逐字引用。

**技术参数与复算边界**

该条目的形式模型是 \(T=\mathrm{MAC}_K(M),\quad \Pr[\mathrm{Forge}]\le\varepsilon(\lambda)\)。输入：输入：KMAC 基于散列的 MAC的公开参数、密钥/随机数与消息；变量说明：K 共享密钥，M 消息，T 认证标签。 预期输出：按 KMAC 基于散列的 MAC 的规范执行后得到可验证的输出或可比较的优势界。 复算必须给出输入、步骤、输出和单位；示例只演示流程，不替代标准测试向量。

复杂度由密钥长度、分组/状态规模、轮数、随机数质量和敌手模型共同决定；参数越界、版本差异与实现侧信道都可能使公式结论失效。已登记限制：该条目只给出形式模型与可复算步骤，不声称已完成生产实现、侧信道认证或第三方安全评估。

## refs

- Wikipedia search entry for KMAC 基于散列的 MAC. https://zh.wikipedia.org/w/index.php?search=KMAC%20%E5%9F%BA%E4%BA%8E%E6%95%A3%E5%88%97%E7%9A%84%20MAC
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**形式模型与复算步骤**

\[T=\mathrm{MAC}_K(M),\quad \Pr[\mathrm{Forge}]\le\varepsilon(\lambda)\]

KMAC 基于散列的 MAC的公开参数、密钥/随机数与消息；变量说明：K 共享密钥，M 消息，T 认证标签。1.密钥派生或分组处理。2.按构造压缩消息与密钥。3.输出固定长度标签并验证。边界：公式只覆盖已登记的参数与假设；参数取值、标准版本和实现细节仍以来源为准。
