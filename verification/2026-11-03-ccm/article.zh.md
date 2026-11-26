# CCM 计数器与 CBC-MAC 组合模式

## principle

**算法**：CCM 计数器 CBC 模式（Counter with CBC-MAC）。CCM 的构造要点是原语复用同一把密钥（§5.2）：「The same key, K, is used for both the CTR and CBC-MAC mechanisms within CCM.」。它保护两类对象：「The data that CCM protects consists of a message, i.e., a bit string, called the payload, denoted P, of bit length denoted Plen, and a bit string, called the associated data」——payload 加密、关联数据只认证，二者一起进 MAC。

## why

为什么要把两者合起来：§3 把 CCM 写成两个过程的组合，「CCM consists of two related processes: generation-encryption and decryption-verification, which combine two cryptographic primitives」」（跨页处以省略号标示）。合起来的动机是同一条分组密码同时提供机密性与真实性，不必再各跑一套；§5.2 的同一密钥句正是这一取舍的落地方式。

## used

部署面在 §3 的适用范围里以互操作意图给出：「This specification of CCM is intended to be compatible with the use of CCM within the draft amendment [4] to the IEEE Standard 802.11 for wireless local area networks [5].」也即这份建议是为对齐无线局域网标准里的既有用法。长度参数在附录 B 里被提升为安全量：「The length, Tlen, of the MAC within CCM is an important security parameter.」——截断多长在文件里被明确当作安全量看待。

## broken

限度系于两个参数。其一是 nonce 的唯一性：文件把 nonce 写成「a unique value, called a nonce, that is assigned to the payload and the associated data」——唯一性是规定条件，重用即把组合模式的机密性与真实性一起置于风险。其二是 Tlen：既然它被称作「an important security parameter」，把它截得过短就等于自己降低认证强度，而不是省下一笔无害的字节。

## history

版本事实：文件自陈是分组密码模式系列建议的一部分，并把动机落在与 IEEE 802.11 修正案草案的兼容性上（§1 所引）。留存件的扉页日期为 2004 年 5 月。也就是说，CCM 作为国家建议的规范化时间晚于它在无线标准草案里的使用——这份文件的工作是把既有的组合构造写成通用建议，而不是从零发明。头部信息按项目口径复述于引号外。

**技术参数与复算边界**

该条目的形式模型是 \(C=E_K(P;r),\qquad P=D_K(C)\)。输入：输入：CCM 计数器 CBC 模式的公开参数、密钥/随机数与消息；变量说明：P 明文，C 密文，K 密钥，r 随机化参数。 预期输出：按 CCM 计数器 CBC 模式 的规范执行后得到可验证的输出或可比较的优势界。 复算必须给出输入、步骤、输出和单位；示例只演示流程，不替代标准测试向量。

复杂度由密钥长度、分组/状态规模、轮数、随机数质量和敌手模型共同决定；参数越界、版本差异与实现侧信道都可能使公式结论失效。已登记限制：该条目只给出形式模型与可复算步骤，不声称已完成生产实现、侧信道认证或第三方安全评估。

**参数与状态规模**

公式 \(C=E_K(P;r),\qquad P=D_K(C)\) 的输入、输出和单位必须逐项登记；复算顺序为：1. 按算法规范编码输入 2. 在密钥控制下执行轮函数 3. 输出密文并检查长度与格式。

状态规模、密钥长度、分组长度和轮数决定复杂度；这些量不能从标题推断，必须以标准或实现文档为准。

## refs

- Wikipedia search entry for CCM 计数器 CBC 模式. https://zh.wikipedia.org/w/index.php?search=CCM%20%E8%AE%A1%E6%95%B0%E5%99%A8%20CBC%20%E6%A8%A1%E5%BC%8F
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**形式模型与复算步骤**

\[C=E_K(P;r),\qquad P=D_K(C)\]

CCM 计数器 CBC 模式的公开参数、密钥/随机数与消息；变量说明：P 明文，C 密文，K 密钥，r 随机化参数。1.按算法规范编码输入。2.在密钥控制下执行轮函数。3.输出密文并检查长度与格式。边界：公式只覆盖已登记的参数与假设；参数取值、标准版本和实现细节仍以来源为准。
