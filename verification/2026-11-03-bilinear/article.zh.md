# 双线性对（Tate 与修正 Tate）

## principle

**算法**：双线性配对（Bilinear Pairing）。留存件的 §2.1 给出对象的定义性三性：「a mathematical construction known as the Tate pairing provides an efficiently computable map e: G1' x G1'' -> G2 that is linear in both arguments and believed hard to invert [BF].」三要件是可高效计算、双变量线性、以及被认为难以求逆——双线性对的全部用途都建立在这三条的组合上。

## why

为什么要专门规范它，§1 一句话点出下游：文件服务于「identity-based encryption (IBE) systems based on bilinear pairings」。而能不能用，取决于曲线是否给出额外结构：「If an efficiently computable non-rational endomorphism phi: G1' ->…is available for the selected elliptic curve on which the Tate pairing is computed」（该句在留存件里跨页，省略号只标示被跳过的页眉页脚）——有了这个自同态才有修正版配对，才有可用于标识加密的群配对。

## used

命名与选型规则印在留存件的 §2.1（本文件的目录用另一套编号，正文节号以留存件为准）：「called the modified Tate pairing.We generically call a pairing either the Tate pairing e or the modified Tate pairing e', depending on the chosen elliptic curve used in a particular implementation.」也即工程上没有自由选项——用哪一版本由所选曲线的性质决定，实现在两条路里被曲线二选一。

## broken

限度写在用词与记号里。求逆难度在本文件里的措辞是「believed hard to invert」——是被相信的困难性，不是被证明的困难性。记号表把底域阶 p 规定为 512 位到 7680 位的素数（该量级按原样复述、不逐字引用），说明这一族构造的规模远大于普通 ECC 群。合起来的结论是：安全假设立在猜测之上，且曲线与域参数必须按文件挑，不能随手替换成别的群。

## history

沿革与身份：本文件把 Tate 与修正 Tate 两种配对连同曲线实现写成可被标识加密体系引用的规范，动机句是服务于「identity-based encryption (IBE) systems based on bilinear pairings」。头部印作 Request for Comments: 5091、Category: Informational、December 2007，作者行是 Boyen、Martin 与 Wang（头部按项目口径复述于引号外）。其数学对象本身来自更早的配对研究线，本文不做史学叙述，只交代可用构造的边界。

**技术参数与复算边界**

该条目的形式模型是 \(C=E_K(P;r),\qquad P=D_K(C)\)。输入：输入：双线性配对的公开参数、密钥/随机数与消息；变量说明：P 明文，C 密文，K 密钥，r 随机化参数。 预期输出：按 双线性配对 的规范执行后得到可验证的输出或可比较的优势界。 复算必须给出输入、步骤、输出和单位；示例只演示流程，不替代标准测试向量。

复杂度由密钥长度、分组/状态规模、轮数、随机数质量和敌手模型共同决定；参数越界、版本差异与实现侧信道都可能使公式结论失效。已登记限制：该条目只给出形式模型与可复算步骤，不声称已完成生产实现、侧信道认证或第三方安全评估。

**参数与状态规模**

公式 \(C=E_K(P;r),\qquad P=D_K(C)\) 的输入、输出和单位必须逐项登记；复算顺序为：1. 按算法规范编码输入 2. 在密钥控制下执行轮函数 3. 输出密文并检查长度与格式。

状态规模、密钥长度、分组长度和轮数决定复杂度；这些量不能从标题推断，必须以标准或实现文档为准。

## refs

- Wikipedia search entry for 双线性配对. https://zh.wikipedia.org/w/index.php?search=%E5%8F%8C%E7%BA%BF%E6%80%A7%E9%85%8D%E5%AF%B9
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**形式模型与复算步骤**

\[C=E_K(P;r),\qquad P=D_K(C)\]

双线性配对的公开参数、密钥/随机数与消息；变量说明：P 明文，C 密文，K 密钥，r 随机化参数。1.按算法规范编码输入。2.在密钥控制下执行轮函数。3.输出密文并检查长度与格式。边界：公式只覆盖已登记的参数与假设；参数取值、标准版本和实现细节仍以来源为准。
