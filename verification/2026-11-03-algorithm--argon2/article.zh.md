# Argon2 记忆密集密钥派生函数

## principle

**算法**：Argon2 口令派生（Argon2）。§1 给出定性：「Argon2 is a memory-hard function [HARD].It is a streamlined design.」变体结构同段印明：「Argon2 has one primary variant, Argon2id, and two supplementary variants, Argon2d and Argon2i.」也即它不是单一函数而是一个家族，且主变体只有一个。

## why

设计目标写在成本模型上：「It aims at the highest memory-filling rate and effective use of multiple computing units, while still providing defense against trade-off attacks.」衡量它的不是单次哈希的算力，而是能否把可用内存真正填满、并用多核抬高攻击者成本，同时不让时间-内存折抵占便宜。硬件取向也一并交代：「Argon2 is optimized for the x86 architecture and exploits the cache and memory organization of the recent Intel and AMD processors.」

## used

选型与实现义务都在原文里。用途分工是「Argon2i uses data-independent memory access, which is preferred for password hashing and password-based key derivation.」实现层面的底线是规范性一句：「Argon2id MUST be supported by any implementation of this document, whereas Argon2d and Argon2i MAY be supported.」也即任何声称符合本文件的实现都必须支持主变体，另外两支是可选。

## broken

限度由变体分工反出：Argon2d 的数据相关内存访问正是侧信道计时攻击的面，所以原文把它的适用场景限定为「with no threats from side-channel timing attacks」。文本另在一处给出彻底阻止的条件：要完全阻止所引工作的时空间折抵，趟数必须大于内存容量以 2 为底的对数减 26（这是有条件的防御，不是普遍消除），文本的说法是「providing defense against trade-off attacks」——防御而非证明不存在；Argon2i 还「makes more passes over the memory to protect from trade-off attacks」，用额外的趟数换安全性，成本因此上升。

## history

版本事实：摘要段印明本文件对应哪一个算法版本 -「corresponds to version 1.3 of the Argon2 hash function.」头部信息为 Request for Comments: 9106、Category: Informational、March 2021，作者行是 Bassham 与 Liu（头部按项目口径复述于引号外）。也即 RFC 9106 标准化的是 Argon2 的 1.3 版，而不是它的原始竞赛提交版。

**技术参数与复算边界**

该条目的形式模型是 \(C=E_K(P;r),\qquad P=D_K(C)\)。输入：输入：Argon2 口令派生的公开参数、密钥/随机数与消息；变量说明：P 明文，C 密文，K 密钥，r 随机化参数。 预期输出：按 Argon2 口令派生 的规范执行后得到可验证的输出或可比较的优势界。 复算必须给出输入、步骤、输出和单位；示例只演示流程，不替代标准测试向量。

复杂度由密钥长度、分组/状态规模、轮数、随机数质量和敌手模型共同决定；参数越界、版本差异与实现侧信道都可能使公式结论失效。已登记限制：该条目只给出形式模型与可复算步骤，不声称已完成生产实现、侧信道认证或第三方安全评估。

**参数与状态规模**

公式 \(C=E_K(P;r),\qquad P=D_K(C)\) 的输入、输出和单位必须逐项登记；复算顺序为：1. 按算法规范编码输入 2. 在密钥控制下执行轮函数 3. 输出密文并检查长度与格式。

状态规模、密钥长度、分组长度和轮数决定复杂度；这些量不能从标题推断，必须以标准或实现文档为准。

## refs

- Wikipedia search entry for Argon2 口令派生. https://zh.wikipedia.org/w/index.php?search=Argon2%20%E5%8F%A3%E4%BB%A4%E6%B4%BE%E7%94%9F
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**形式模型与复算步骤**

\[C=E_K(P;r),\qquad P=D_K(C)\]

Argon2 口令派生的公开参数、密钥/随机数与消息；变量说明：P 明文，C 密文，K 密钥，r 随机化参数。1.按算法规范编码输入。2.在密钥控制下执行轮函数。3.输出密文并检查长度与格式。边界：公式只覆盖已登记的参数与假设；参数取值、标准版本和实现细节仍以来源为准。
