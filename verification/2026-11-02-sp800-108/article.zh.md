# 基于 PRF 的密钥派生

## principle

**标准**：基于 PRF 的密钥派生（Recommendation for Key Derivation Using Pseudorandom Functions）。它的机制是`从一把已有密钥扩出多把密钥`：正文写「This Recommendation specifies techniques for the derivation of additional keying material from a secret key … using pseudorandom functions: HMAC, CMAC, and KMAC.」被省略的分句限定了来源——「either established through a key-establishment scheme or shared through some other manner」。请注意这是一份已废止文本的机制描述。

## why

理由从密钥的复用压力而来：§1 只写「When a party obtains a cryptographic key, additional keys will often be needed.」§3 则给出输入形状——固定输入是「a concatenation of a Label, a separation indicator 0x00, the Context, and [L]2」，即标签、分隔符、上下文与输出长度四项，缺一项就无法区分用途。

## used

使用状态要先说清楚：本文件顶部的废止横幅写「The attached publication has been withdrawn (archived), and is provided solely for historical purposes.」其时活文档是 SP 800-108r1-upd1（Chen，2024 年 2 月）。在该文本生效期间，密钥派生的输入来自 §2 所列三条路径——SP 800-56A、SP 800-56B 建立的密钥，以及先前已生成的密钥。

## broken

限度一是时效：横幅记下 Withdrawal Date 为 2024 年 2 月 2 日，替代件为 800-108r1-upd1，因此今天按本文件的表述实施就是引用废止文本；要落实必须去读 upd1（本语料库尚无该文件，故其改动内容不作断言）。限度二是它只规定 KDF 结构，不保证密钥建立本身的安全，也不定义协议层的标签与上下文取值。

## history

四段时间都在文件里：附录 A 的修订表写「The original version of this document was published in November 2008.」；横幅页记下 Revision 1 的 supersedes 行「Supersedes NIST Special Publication 800-108 (October 2009)」与发布日期 August 2022；横幅同时给出 Withdrawal Date February 2, 2024 与替代件 800-108r1-upd1。作者栏为 Lily Chen。

**技术参数与复算边界**

该条目的形式模型是 \(S=\min_i S_i,\quad S_i\in\{\text{密钥强度},\text{分组安全},\text{实现安全}\}\)。输入：输入：基于 PRF 的密钥派生的公开参数、密钥/随机数与消息；变量说明：S 为综合安全强度；各分量取最小值，不能只看密钥位数。 预期输出：按 基于 PRF 的密钥派生 的规范执行后得到可验证的输出或可比较的优势界。 复算必须给出输入、步骤、输出和单位；示例只演示流程，不替代标准测试向量。

复杂度由密钥长度、分组/状态规模、轮数、随机数质量和敌手模型共同决定；参数越界、版本差异与实现侧信道都可能使公式结论失效。已登记限制：该条目只给出形式模型与可复算步骤，不声称已完成生产实现、侧信道认证或第三方安全评估。

**参数与状态规模**

公式 \(S=\min_i S_i,\quad S_i\in\{\text{密钥强度},\text{分组安全},\text{实现安全}\}\) 的输入、输出和单位必须逐项登记；复算顺序为：1. 读取标准规定的密钥/分组/模式参数 2. 按标准表换算等效强度 3. 取最弱分量作为系统强度。

状态规模、密钥长度、分组长度和轮数决定复杂度；这些量不能从标题推断，必须以标准或实现文档为准。

## refs

- Wikipedia search entry for 基于 PRF 的密钥派生. https://zh.wikipedia.org/w/index.php?search=%E5%9F%BA%E4%BA%8E%20PRF%20%E7%9A%84%E5%AF%86%E9%92%A5%E6%B4%BE%E7%94%9F
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**形式模型与复算步骤**

\[S=\min_i S_i,\quad S_i\in\{\text{密钥强度},\text{分组安全},\text{实现安全}\}\]

基于 PRF 的密钥派生的公开参数、密钥/随机数与消息；变量说明：S 为综合安全强度；各分量取最小值，不能只看密钥位数。1.读取标准规定的密钥/分组/模式参数。2.按标准表换算等效强度。3.取最弱分量作为系统强度。边界：公式只覆盖已登记的参数与假设；参数取值、标准版本和实现细节仍以来源为准。
