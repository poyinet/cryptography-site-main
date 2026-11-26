# 格式保留加密模式

## principle

**标准**：NIST SP 800-38G 格式保留加密模式（NIST SP 800-38G Format-Preserving Encryption Modes）。摘要给出方法与定位：「This Recommendation specifies two methods, called FF1 and FF3, for format-preserving encryption.」并说明二者关系——「Both of these methods are modes of operation for an underlying, approved symmetric-key block cipher algorithm.」即密文保持明文格式（长度与字母表）。

## why

动机写在 §2：格式保留加密面向的不是二进制数据，而是「designed for data that is not necessarily binary」，并且「FPE facilitates the targeting of encryption to sensitive information, as well as the retrofitting of encryption technology to legacy applications」——老系统的数据字段不便改长度或格式。关键词表只给检索入口：「Block cipher; confidentiality; encryption; FF1; FF3; format-preserving encryption」。

## used

使用形态是在批准分组密码之上调用 FF1/FF3；一致性测试一节把它接入验证框架，文档要求底层算法为「an underlying, approved symmetric-key block cipher algorithm」，因此在实现里通常落到 AES。

## broken

限度一是构造前提：两个模式都是建立在分组密码之上的 Feistel 置换，作用在固定进制的数字串上，而非任意格式；「an underlying, approved symmetric-key block cipher algorithm」是必要条件。限度二是参数下限的两种语气：附录区分了硬性下限与推荐值——radix^minlen 至少 100 是为了排除一类通用 meet-in-the-middle 攻击，而「the value radix minlen should generally be at least one million」在原文里是 suggested rather than required。

## history

版本与更新痕迹在标题页：日期行「March 2016」，引用行「Spec.Publ.800-38G, 28 pages (March 2016)」，页眉还留有「INCLUDES UPDATES AS OF 08-04-2016: PAGE I」，即 2016 年 8 月 4 日并入专利披露说明的版次。§2 交代历史一笔：第三模式 FF2（提交时名 VAES3）曾列入初稿，公开评审后被撤下。

**技术参数与复算边界**

该条目的形式模型是 \(S=\min_i S_i,\quad S_i\in\{\text{密钥强度},\text{分组安全},\text{实现安全}\}\)。输入：输入：NIST SP 800-38G 格式保留加密模式的公开参数、密钥/随机数与消息；变量说明：S 为综合安全强度；各分量取最小值，不能只看密钥位数。 预期输出：按 NIST SP 800-38G 格式保留加密模式 的规范执行后得到可验证的输出或可比较的优势界。 复算必须给出输入、步骤、输出和单位；示例只演示流程，不替代标准测试向量。

复杂度由密钥长度、分组/状态规模、轮数、随机数质量和敌手模型共同决定；参数越界、版本差异与实现侧信道都可能使公式结论失效。已登记限制：该条目只给出形式模型与可复算步骤，不声称已完成生产实现、侧信道认证或第三方安全评估。

## refs

- Wikipedia search entry for NIST SP 800-38G 格式保留加密模式. https://zh.wikipedia.org/w/index.php?search=NIST%20SP%20800-38G%20%E6%A0%BC%E5%BC%8F%E4%BF%9D%E7%95%99%E5%8A%A0%E5%AF%86%E6%A8%A1%E5%BC%8F
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**形式模型与复算步骤**

\[S=\min_i S_i,\quad S_i\in\{\text{密钥强度},\text{分组安全},\text{实现安全}\}\]

NIST SP 800-38G 格式保留加密模式的公开参数、密钥/随机数与消息；变量说明：S 为综合安全强度；各分量取最小值，不能只看密钥位数。1.读取标准规定的密钥/分组/模式参数。2.按标准表换算等效强度。3.取最弱分量作为系统强度。边界：公式只覆盖已登记的参数与假设；参数取值、标准版本和实现细节仍以来源为准。
