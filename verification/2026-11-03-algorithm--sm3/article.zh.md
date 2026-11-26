# SM3 杂凑函数

## principle

**算法**：SM3 国密杂凑（SM3）。

## why

为什么需要一份 IETF 文件，理由写在 §1.1 的标准化状态句里：「SM3 has already been accepted by ISO in ISO/IEC 10118-3:2018 [ISO-SM3] and has also been described by [GBT.32905-2016].」一个已进 ISO 杂凑标准、又由中国国家文件定义的算法，在 TLS 里没有对应的算法标识；RFC 8998 补的是这一层互操作缺口，而不是替 SM3 另定强度指标。

## used

用途在 §1 落到 TLS 1.3 上：「This document describes two new cipher suites, a signature algorithm and a key exchange mechanism for the Transport Layer Security (TLS) protocol version 1.3 (TLS 1.3) ([RFC8446]).These all utilize several ShangMi (SM) cryptographic algorithms to fulfill the authentication and confidentiality requirements of TLS 1.3.」也即 SM3 在实践中的角色是这些套件与签名算法所用的杂凑；套件名以 TLS_SM4_GCM_SM3 与 TLS_SM4_CCM_SM3 注册。

## broken

限度有两层，第二层是文档层面的诚实。其一在适用面，原文两句话都是规范性的：「The new cipher suites defined in this document are only applicable to TLS 1.3.

## history

沿革按原文的两处标准化叙述：SM3 先由中国国家文件 [GBT.32905-2016] 描述，再被国际杂凑标准收录 -「SM3 has already been accepted by ISO in ISO/IEC 10118-3:2018 [ISO-SM3]」。同族里与 SM3 搭配的签名算法走同样路线，原文记其「have already been added to ISO/IEC 14888-3:2018 [ISO-SM2] (as well as to [GBT.32918.2-2016])」。RFC 8998 头部印作 Request for Comments: 8998、Category: Informational、March 2021（头部按项目口径复述于引号外）。

**技术参数与复算边界**

该条目的形式模型是 \(C=E_K(P;r),\qquad P=D_K(C)\)。输入：输入：SM3 国密杂凑的公开参数、密钥/随机数与消息；变量说明：P 明文，C 密文，K 密钥，r 随机化参数。 预期输出：按 SM3 国密杂凑 的规范执行后得到可验证的输出或可比较的优势界。 复算必须给出输入、步骤、输出和单位；示例只演示流程，不替代标准测试向量。

复杂度由密钥长度、分组/状态规模、轮数、随机数质量和敌手模型共同决定；参数越界、版本差异与实现侧信道都可能使公式结论失效。已登记限制：该条目只给出形式模型与可复算步骤，不声称已完成生产实现、侧信道认证或第三方安全评估。

**参数与状态规模**

公式 \(C=E_K(P;r),\qquad P=D_K(C)\) 的输入、输出和单位必须逐项登记；复算顺序为：1. 按算法规范编码输入 2. 在密钥控制下执行轮函数 3. 输出密文并检查长度与格式。

状态规模、密钥长度、分组长度和轮数决定复杂度；这些量不能从标题推断，必须以标准或实现文档为准。

**测试向量与实现边界**

标准测试向量只证明某组输入在某个实现中产生了预期输出，不证明所有参数都安全。记录测试向量时至少要写：算法/模式、密钥、明文或消息、随机数/IV、输出长度、实现版本。该条目已登记的限制是：该条目只给出形式模型与可复算步骤，不声称已完成生产实现、侧信道认证或第三方安全评估。

如果实现使用查表、分支或可变时间操作，算法层的证明不能替代侧信道评估；如果协议层没有认证，算法层的机密性也不能阻止替换或重放。

## refs

- Wikipedia search entry for SM3 国密杂凑. https://zh.wikipedia.org/w/index.php?search=SM3%20%E5%9B%BD%E5%AF%86%E6%9D%82%E5%87%91
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**形式模型与复算步骤**

\[C=E_K(P;r),\qquad P=D_K(C)\]

SM3 国密杂凑的公开参数、密钥/随机数与消息；变量说明：P 明文，C 密文，K 密钥，r 随机化参数。1.按算法规范编码输入。2.在密钥控制下执行轮函数。3.输出密文并检查长度与格式。边界：公式只覆盖已登记的参数与假设；参数取值、标准版本和实现细节仍以来源为准。
