# 格罗弗算法

## principle

**攻击**：格罗弗算法（Grover's Algorithm）。Grover 的论文题为「A fast quantum mechanical algorithm for database search」，用随机排列的电话簿作例子：「Imagine a phone directory containing N names arranged in completely random order.In order to find someone's phone number with a 50% probability, any classical algorithm (whether deterministic or probabilistic) will need to look at a minimum of N/2 names」，而量子方案「the desired phone number can be obtained in only O(sqrt(N)) steps」。v3 的备注说明证明被简化为使用称作「inversion about average」的新解释，算法本身不变。

## why

论文对搜索的相对优势给出定位：「The algorithm is within a small constant factor of the fastest possible quantum mechanical algorithm」。对密码学而言，意义在于把对称密钥穷举的尝试次数从与密钥长度成正比降到平方根量级，因此安全强度按比特数折算时减半。

## used

论文原文把用途界定为数据库/无结构搜索问题，以电话簿查找作为唯一示例，并给出 O(sqrt(N)) 的评估次数；评论字段说明该文是 1996 年 STOC 会议论文「This is an updated version of a paper that was originally presented at STOC 1996」。密码参数选择中的`对称密钥加倍以抵消平方根搜索`是对该结果的应用推论，论文本身未在密码算法参数上作规定。

## broken

该算法的保证是概率性的：文中以「with a 50% probability」表述成功条件，并把经典下界写成「a minimum of N/2 names」；同时它只主张与最快的量子算法相差「a small constant factor」，并非无条件的绝对最优声明。文本也未使用`二次加速`、`无结构搜索`、`OPTIMAL`这些术语。

## history

arXiv 记录显示该文编号 quant-ph/9605043，作者为 Lov K.Grover（Bell Labs, Murray Hill NJ），v1 提交于 1996 年 5 月 29 日，v2 于次日被撤回，当前 v3 修订于 1996 年 11 月 19 日；期刊引用为「Proceedings, 28th Annual ACM Symposium on the Theory of Computing (STOC), May 1996, pages 212-219」。摘要中给出的量子结果是与经典 N/2 下界对照的 O(sqrt(N))。

**技术参数与复算边界**

该条目的形式模型是 \(Q=\Theta\!\left(\sqrt{|\mathcal{K}|}\right)=\Theta(2^{\kappa/2})\)。输入：输入：格罗弗算法的公开参数、密钥/随机数与消息；变量说明：κ 密钥位数，Q 量子查询复杂度。 预期输出：按 格罗弗算法 的规范执行后得到可验证的输出或可比较的优势界。 复算必须给出输入、步骤、输出和单位；示例只演示流程，不替代标准测试向量。

复杂度由密钥长度、分组/状态规模、轮数、随机数质量和敌手模型共同决定；参数越界、版本差异与实现侧信道都可能使公式结论失效。已登记限制：该条目只给出形式模型与可复算步骤，不声称已完成生产实现、侧信道认证或第三方安全评估。

**参数与状态规模**

公式 \(Q=\Theta\!\left(\sqrt{|\mathcal{K}|}\right)=\Theta(2^{\kappa/2})\) 的输入、输出和单位必须逐项登记；复算顺序为：1. 把搜索问题写成 oracle 2. 执行 Grover 迭代 3. 测量并验证候选解。

状态规模、密钥长度、分组长度和轮数决定复杂度；这些量不能从标题推断，必须以标准或实现文档为准。

## refs

- Wikipedia search entry for 格罗弗算法. https://zh.wikipedia.org/w/index.php?search=%E6%A0%BC%E7%BD%97%E5%BC%97%E7%AE%97%E6%B3%95
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**形式模型与复算步骤**

\[Q=\Theta\!\left(\sqrt{|\mathcal{K}|}\right)=\Theta(2^{\kappa/2})\]

格罗弗算法的公开参数、密钥/随机数与消息；变量说明：κ 密钥位数，Q 量子查询复杂度。1.把搜索问题写成 oracle。2.执行 Grover 迭代。3.测量并验证候选解。边界：公式只覆盖已登记的参数与假设；参数取值、标准版本和实现细节仍以来源为准。
