# RC4 流密码

## principle

**算法**：RC4 流密码（RC4）。身份由标准术语表给：RFC 4949 对 RC4 的定义是「A proprietary, variable-key-length stream cipher invented by Ron Rivest for RSA Data Security, Inc.」——专有的、密钥长度可变的流密码，由 Ron Rivest 为 RSA Data Security, Inc.所造；同一份文件另把缩写展开为 Rivest Cipher #4。该条目不写构造：状态表怎样初始化、每步怎样推进，在这三份留存文件里都没有——6229 只出版向量，7465 只谈禁用，4949 只给定义与用途注记。

## why

为什么实现要额外处理这段输出：RFC 6229 的理由就在开篇一段——它先列分析进展，接着写下「initial parts of the stream output need to be discarded」，也就是开头的密钥流已成需要丢掉的负担。这份文件自己的目的止于给实现者可比对的向量：它说测试向量对实现者有用，并记下该密码可用不同长度的密钥、向量覆盖若干长度与偏移。因此这里记的是使用侧的约束，不是设计理由；设计的动因留存件没有给出，该条目不猜。

## used

该条目用于OTP 与流密码中的对象定位与步骤复述；引用时先确认输入、参数与版本，再判断结论是否仍适用。

## broken

破的地方在密钥流本身：RFC 7465 说新的分析结果「exploit biases in the RC4 keystream to recover repeatedly encrypted plaintexts」，并给出该结果当时的成本——文中印的数字是 2^26 个会话，以及 13x2^30 次加密。同一节也说 RC4 早已被知有一系列密码学弱点，而 6229 把更早的分析列进它的参考条目。分寸在于：留存件给的是需要多少会话与多少次加密，没给恢复的做法，该条目也不补。

## history

断代落在分析它的那篇论文自己印的话上：第 21 行写「The RC4 keystream generator was created by RSA Data Security, Inc.」，即密钥流生成器出自 RSA Data Security, Inc.；该文第六条参考条目把 Rivest 自己那份题为 The RC4 encryption algorithm 的报告记作 1992 年 3 月；题头行的出版信息显示这是 FSE 2000 的会议论文集一章（讲义编号 1978， Springer，2001 年），但那一行的页码区间短横在这份抽取里丢了字形，故只转述不引用。同一篇论文通篇用 alleged 称呼这套算法，因为设计未由所有者公布，该条目沿用。时代轴由此在本轮把该行的值从 e14-standardization（论文出版年 2001 落在其 1977–2001 窗口）改为另加 e16-quantum-turn（其 1984–2019 窗口容纳 2011 与 2015 两份 TLS 文件的年份），并如实说明后一窗口的主题是量子转向——现存时代轴里没有更贴切的一个。

**技术参数与复算边界**

该条目的形式模型是 \(C=E_K(P;r),\qquad P=D_K(C)\)。输入：输入：RC4 流密码的公开参数、密钥/随机数与消息；变量说明：P 明文，C 密文，K 密钥，r 随机化参数。 预期输出：按 RC4 流密码 的规范执行后得到可验证的输出或可比较的优势界。 复算必须给出输入、步骤、输出和单位；示例只演示流程，不替代标准测试向量。

复杂度由密钥长度、分组/状态规模、轮数、随机数质量和敌手模型共同决定；参数越界、版本差异与实现侧信道都可能使公式结论失效。已登记限制：该条目只给出形式模型与可复算步骤，不声称已完成生产实现、侧信道认证或第三方安全评估。

**参数与状态规模**

公式 \(C=E_K(P;r),\qquad P=D_K(C)\) 的输入、输出和单位必须逐项登记；复算顺序为：1. 按算法规范编码输入 2. 在密钥控制下执行轮函数 3. 输出密文并检查长度与格式。

状态规模、密钥长度、分组长度和轮数决定复杂度；这些量不能从标题推断，必须以标准或实现文档为准。

## refs

- Wikipedia search entry for RC4 流密码. https://zh.wikipedia.org/w/index.php?search=RC4%20%E6%B5%81%E5%AF%86%E7%A0%81
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**形式模型与复算步骤**

\[C=E_K(P;r),\qquad P=D_K(C)\]

RC4 流密码的公开参数、密钥/随机数与消息；变量说明：P 明文，C 密文，K 密钥，r 随机化参数。1.按算法规范编码输入。2.在密钥控制下执行轮函数。3.输出密文并检查长度与格式。边界：公式只覆盖已登记的参数与假设；参数取值、标准版本和实现细节仍以来源为准。
