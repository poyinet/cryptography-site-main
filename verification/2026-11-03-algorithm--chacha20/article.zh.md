# ChaCha20 流密码

## principle

**算法**：ChaCha20 流密码（ChaCha20）。§2.4 给出身份与血脉：「ChaCha20 is a stream cipher designed by D.J.Bernstein.It is a refinement of the Salsa20 algorithm, and it uses a 256-bit key.」运行机制同节接着写：「ChaCha20 successively calls the ChaCha20 block function, with the same key and nonce, and with successively increasing block counter parameters.」也即它不是一条消息一次置换，而是同一（密钥，nonce）下靠递增的块计数器把块函数输出串成密钥流。

## why

参数一览把设计约束摊开。密钥一项是「A 256-bit key, treated as a concatenation of eight 32-bit…integers.」，nonce 一项是「A 96-bit nonce, treated as a concatenation of three 32-bit…integers.」（留存件把 little-endian 断在行末，省略号只标示该断行，用词未改）。§2.3 的状态说明对 nonce 立下唯一硬要求：「Words 13-15 are a nonce, which MUST not be repeated for the same key.」这条把安全条件交给调用方：算法不检测重复，重复的后果由协议承担。

## used

可用性上它不挑消息长度，§2.4 写明：「There is no requirement for the plaintext to be an integral multiple of 512 bits.If there is extra keystream from the last block, it is discarded.」同节还允许边生成边异或：「each keystream block can be XORed with a plaintext block before proceeding to create the next block, saving some memory.」长度与填充规则因此由协议自己规定，而不是由算法规定。

## broken

限度有两面。其一由 §2.6.2（谈 AEAD 用法的那一小节）自陈：「Chacha20 could be used as a key-derivation function, by generating an arbitrarily long keystream.However, that is not what protocols such as IKEv2 require.」（此处原文把算法名印作 Chacha20，按原样引用）也即别把它当 KDF 用。其二来自 §2.3 的 nonce 条件：同一密钥下 nonce 重复即密钥流重复，两段明文相减就能互相暴露，而算法侧没有任何检测机制。

## history

版本事实：§2.3 明写本文件的取舍「The ChaCha algorithm described here uses a 256-bit key.」把与原始论文的差异点钉在密钥长度上。头部印作 Request for Comments: 8439、Category: Informational、August 2018，作者 Nir 与 Woodbury（头部信息按项目口径复述于引号外，不作为算法性质）。也就是说，进入 IETF 规范的是 256 位密钥这一支，而不是论文里的全部变体。

**技术参数与复算边界**

该条目的形式模型是 \(C=E_K(P;r),\qquad P=D_K(C)\)。输入：输入：ChaCha20 流密码的公开参数、密钥/随机数与消息；变量说明：P 明文，C 密文，K 密钥，r 随机化参数。 预期输出：按 ChaCha20 流密码 的规范执行后得到可验证的输出或可比较的优势界。 复算必须给出输入、步骤、输出和单位；示例只演示流程，不替代标准测试向量。

复杂度由密钥长度、分组/状态规模、轮数、随机数质量和敌手模型共同决定；参数越界、版本差异与实现侧信道都可能使公式结论失效。已登记限制：该条目只给出形式模型与可复算步骤，不声称已完成生产实现、侧信道认证或第三方安全评估。

## refs

- Wikipedia search entry for ChaCha20 流密码. https://zh.wikipedia.org/w/index.php?search=ChaCha20%20%E6%B5%81%E5%AF%86%E7%A0%81
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**形式模型与复算步骤**

\[C=E_K(P;r),\qquad P=D_K(C)\]

ChaCha20 流密码的公开参数、密钥/随机数与消息；变量说明：P 明文，C 密文，K 密钥，r 随机化参数。1.按算法规范编码输入。2.在密钥控制下执行轮函数。3.输出密文并检查长度与格式。边界：公式只覆盖已登记的参数与假设；参数取值、标准版本和实现细节仍以来源为准。
