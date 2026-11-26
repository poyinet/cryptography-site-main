# 密码安全伪随机数发生器（DRBG）

## principle

**算法**：密码学安全伪随机数发生器（Cryptographically Secure PRNG）。§1 开篇给出这类机制的定性：「This Recommendation specifies techniques for the generation of random bits that may then be used directly or converted to random numbers when random values are required by applications using cryptography.」即它规定的是比特生成技术，随机数只是其下游转换物。同文档的脚注把命名口径写明：「DRBGs have also been called Pseudorandom Number (or Bit) Generators」，即密码学意义上的 CSPRNG 在这份建议里以 DRBG 之名规范。

## why

该条目单列，是因为它把随机数与 CSPRNG中的算法落到可核证据：有可指认的参与者、可复算的步骤，或有馆藏、档案、标准编号支撑的实物与文本。相邻条目只用于定位，不并入本条，也不替别条作证明。

## used

用法边界写在 §4 的定义里：Approved entropy source要求熵源「validated as conforming to [SP 800-90B]」，因此部署时的义务是把熵源送检而非自行宣称；同节还把随机比特发生器的组成说明为包含实例化、解除实例化、生成伪随机比特、可选地重播种以及健康检测等功能，即密钥生成、nonce 生成等应用都经由这几类接口使用它。

## broken

限度写在 §1 的系统性说明里：「The security provided by an RBG that uses a DRBG mechanism is a system implementation issue; both the DRBG mechanism and its randomness source must be considered when determining whether the RBG is appropriate for use by consuming applications.」也即机制本身合格并不等于整个发生器合格，上游随机源必须一并评估。§4 又给出判定口径：「In the context of random bit generation, an output bit is unpredictable if an adversary has only a negligible advantage (that is, essentially not much better than chance) in predicting it correctly.」可预测性是按优势是否可忽略来判定的，一旦熵输入缺失或未按期重播种，这个条件便不再成立。

## history

版本事实：本留存件标题行印为「Recommendation for Random Number Generation Using Deterministic RBGs」，即 SP 800-90A Rev.1（2015 年 6 月），关键词行为「Deterministic random bit generator (DRBG); entropy; hash function; random number generator.」。§4 的术语说明指出「NIST Special Publication (SP) 800-90B [SP 800-90B] provides guidance on designing and validating entropy sources」，即 2015 年这份只管确定性发生器，熵源核证另交 90B。

**技术参数与复算边界**

该条目的形式模型是 \(C=E_K(P;r),\qquad P=D_K(C)\)。输入：输入：密码学安全伪随机数发生器的公开参数、密钥/随机数与消息；变量说明：P 明文，C 密文，K 密钥，r 随机化参数。 预期输出：按 密码学安全伪随机数发生器 的规范执行后得到可验证的输出或可比较的优势界。 复算必须给出输入、步骤、输出和单位；示例只演示流程，不替代标准测试向量。

复杂度由密钥长度、分组/状态规模、轮数、随机数质量和敌手模型共同决定；参数越界、版本差异与实现侧信道都可能使公式结论失效。已登记限制：该条目只给出形式模型与可复算步骤，不声称已完成生产实现、侧信道认证或第三方安全评估。

## refs

- Wikipedia search entry for 密码学安全伪随机数发生器. https://zh.wikipedia.org/w/index.php?search=%E5%AF%86%E7%A0%81%E5%AD%A6%E5%AE%89%E5%85%A8%E4%BC%AA%E9%9A%8F%E6%9C%BA%E6%95%B0%E5%8F%91%E7%94%9F%E5%99%A8
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**形式模型与复算步骤**

\[C=E_K(P;r),\qquad P=D_K(C)\]

密码学安全伪随机数发生器的公开参数、密钥/随机数与消息；变量说明：P 明文，C 密文，K 密钥，r 随机化参数。1.按算法规范编码输入。2.在密钥控制下执行轮函数。3.输出密文并检查长度与格式。边界：公式只覆盖已登记的参数与假设；参数取值、标准版本和实现细节仍以来源为准。
