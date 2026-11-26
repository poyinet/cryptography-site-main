# GCM 与 GMAC 模式

## principle

**标准**：GCM 与 GMAC 模式（Galois/Counter Mode and GMAC）。文件标题即定义：「NIST Special Publication 800-38D Recommendation for Block Cipher Modes of Operation: Galois/Counter Mode (GCM) and GMAC」，作者 Morris Dworkin，日期行「November 2007」。它把 GCM 与 GMAC 一并规范化：前者是加密+认证的模式，后者是只产出认证码的用法。

## why

它解决的是`加密又要认证又要可验证`的合并需求：文件给出 GCM 与 GMAC 两种用法，并把唯一性要求单列一节——§8 名为「Uniqueness Requirement on IVs and Keys」。§2 只把符合性放在 CMVP 框架里，未提及其它验证计划。

## used

使用面是作为经验证的分组密码模式来部署：§2 要求实现按 CMVP 路径验证，§8 给出的是可算的下界：「The probability that the authenticated encryption function ever will be invoked with the same IV and the same key on two (or more) distinct sets of input data shall be no greater than 2-32.」；被转发协议如何组织密钥与 IV，不在本文件之内。

## broken

限度一是那条`几乎完全失效`的警告，但它是有条件的：原文写「a breach of the requirement in Sec.8 for the uniqueness of the initialization strings may compromise the security assurance almost entirely」，并结论式建议「this mode of operation should not be deployed unless compliance with this uniqueness requirement is ensured」。限度二是文件其实两边都谈：8.1 节标题就是 Key Establishment，指向 TLS、IKE v1/v2 与 SSH 的密钥导出函数；8.2 节标题是 IV Constructions，给出确定式与基于随机数生成器两种构造。它没有做的是定义一个密钥协商协议、或规定某个具体协议如何取用初始向量——那部分机制留在本建议的范围之外。

## history

时间线：标题块日期为 2007 年 11 月，作者 Morris Dworkin；参考文献列出 McGrew 与 Viega 的 INDOCRYPT ’04 论文（该条目已核对的编号 [7]）与 2005 年的 gcm-revised-spec 网页链接——设计公布与标准化之间存在数年间隔，本文件是后者。

**技术参数与复算边界**

该条目的形式模型是 \(S=\min_i S_i,\quad S_i\in\{\text{密钥强度},\text{分组安全},\text{实现安全}\}\)。输入：输入：GCM 与 GMAC 模式的公开参数、密钥/随机数与消息；变量说明：S 为综合安全强度；各分量取最小值，不能只看密钥位数。 预期输出：按 GCM 与 GMAC 模式 的规范执行后得到可验证的输出或可比较的优势界。 复算必须给出输入、步骤、输出和单位；示例只演示流程，不替代标准测试向量。

复杂度由密钥长度、分组/状态规模、轮数、随机数质量和敌手模型共同决定；参数越界、版本差异与实现侧信道都可能使公式结论失效。已登记限制：该条目只给出形式模型与可复算步骤，不声称已完成生产实现、侧信道认证或第三方安全评估。

**参数与状态规模**

公式 \(S=\min_i S_i,\quad S_i\in\{\text{密钥强度},\text{分组安全},\text{实现安全}\}\) 的输入、输出和单位必须逐项登记；复算顺序为：1. 读取标准规定的密钥/分组/模式参数 2. 按标准表换算等效强度 3. 取最弱分量作为系统强度。

状态规模、密钥长度、分组长度和轮数决定复杂度；这些量不能从标题推断，必须以标准或实现文档为准。

## refs

- Wikipedia search entry for GCM 与 GMAC 模式. https://zh.wikipedia.org/w/index.php?search=GCM%20%E4%B8%8E%20GMAC%20%E6%A8%A1%E5%BC%8F
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**形式模型与复算步骤**

\[S=\min_i S_i,\quad S_i\in\{\text{密钥强度},\text{分组安全},\text{实现安全}\}\]

GCM 与 GMAC 模式的公开参数、密钥/随机数与消息；变量说明：S 为综合安全强度；各分量取最小值，不能只看密钥位数。1.读取标准规定的密钥/分组/模式参数。2.按标准表换算等效强度。3.取最弱分量作为系统强度。边界：公式只覆盖已登记的参数与假设；参数取值、标准版本和实现细节仍以来源为准。
