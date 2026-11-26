# 随机数发生器建议

## principle

**标准**：随机数发生器建议（Recommendation for Random Number Generation）。摘要一句话定性：「This Recommendation specifies mechanisms for the generation of random bits using deterministic methods.」并给出机制来源：「The methods provided are based on either hash functions or block cipher algorithms.」即它是确定性随机比特生成器的规范，而非熵源规范。

## why

要解决的问题是随机数发生机制的范围界定：摘要写「This Recommendation specifies mechanisms for the generation of random bits using deterministic methods.The methods provided are based on either hash functions or block cipher algorithms.」，§1 把责任压在种子上——「The seed used to instantiate the DRBG must contain sufficient entropy to provide an assurance of randomness.」关键词行是「Deterministic random bit generator (DRBG)…」，属检索入口而非论证。

## used

使用方式是作为被验证模块里的组件：文件对实现方提出的是要求而非引用关系——「A cryptographic module containing a DRBG mechanism shall be validated (see [FIPS 140]).」并且消费 DRBG 的应用或服务方要按文件自己关于熵源与预测阻力的规则提供两者。

## broken

限度一是责任分离：本文件只管 DRBG 机制本身，熵源质量与随机数收集在配套文件里，且其参考清单把 SP 800-90B 标为「(Draft)… August 2012」，并把构造级指南另交 SP 800-90C——所以`熵由 90B 解决`在这份文本里只是未定稿。限度二是它不评价具体实现的安全性，验证走 FIPS 140 路径。

## history

版本链在标题页与修订附录：原初版是 June 2006，Revision 1 的三个日期证据都写作 June 2015——页眉「…NIST.SP.800-90Ar1 June 2015」、引用行「Spec.Publ.800-90A Rev.1, 109 pages (June 2015)」与附录 E「In June 2015, the following substantive changes were made in Revision 1 of [SP 800-90A]」。修订记录里最重要的一条是删除：「The Dual_EC_DRBG has been removed, and section numbers adjusted accordingly.」并移除了原先含具体常量的附录。

**技术参数与复算边界**

该条目的形式模型是 \(S=\min_i S_i,\quad S_i\in\{\text{密钥强度},\text{分组安全},\text{实现安全}\}\)。输入：输入：随机数发生器建议的公开参数、密钥/随机数与消息；变量说明：S 为综合安全强度；各分量取最小值，不能只看密钥位数。 预期输出：按 随机数发生器建议 的规范执行后得到可验证的输出或可比较的优势界。 复算必须给出输入、步骤、输出和单位；示例只演示流程，不替代标准测试向量。

复杂度由密钥长度、分组/状态规模、轮数、随机数质量和敌手模型共同决定；参数越界、版本差异与实现侧信道都可能使公式结论失效。已登记限制：该条目只给出形式模型与可复算步骤，不声称已完成生产实现、侧信道认证或第三方安全评估。

## refs

- Wikipedia search entry for 随机数发生器建议. https://zh.wikipedia.org/w/index.php?search=%E9%9A%8F%E6%9C%BA%E6%95%B0%E5%8F%91%E7%94%9F%E5%99%A8%E5%BB%BA%E8%AE%AE
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**形式模型与复算步骤**

\[S=\min_i S_i,\quad S_i\in\{\text{密钥强度},\text{分组安全},\text{实现安全}\}\]

随机数发生器建议的公开参数、密钥/随机数与消息；变量说明：S 为综合安全强度；各分量取最小值，不能只看密钥位数。1.读取标准规定的密钥/分组/模式参数。2.按标准表换算等效强度。3.取最弱分量作为系统强度。边界：公式只覆盖已登记的参数与假设；参数取值、标准版本和实现细节仍以来源为准。
