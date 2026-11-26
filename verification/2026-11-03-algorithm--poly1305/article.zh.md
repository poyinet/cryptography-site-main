# Poly1305 一次性认证器

## principle

**算法**：Poly1305 通用 MAC（Poly1305）。§2.5 一语道破输入输出：「Poly1305 is a one-time authenticator designed by D.J.Bernstein.Poly1305 takes a 32-byte one-time key and a message and produces a 16-byte tag.This tag is used to authenticate the message.」关键限定词是 one-time：它不是可反复使用的 MAC 密钥，而是每条消息一个新的 32 字节输入。

## why

为什么要改写原作者的构造，§2.5 交代了原型的成本：那版 MAC 需要一把 AES 密钥、一把附加密钥与一个非秘密的 128 位 nonce（`附加密钥`一词在留存件里带 ASCII 引号，故此处不逐字引用），并解释 AES 的角色：「AES is used there for encrypting the nonce, so as to get a unique (and secret) 128-bit string」。RFC 8439 的目标正是去掉对 AES 的依赖，把一次性密钥的生成交给 ChaCha20，让没有硬件 AES 的平台也能安全使用。

## used

用法与 ChaCha20 绑定（§2.6 与其小节 §2.6.2）：AEAD 构造里先跑一遍块函数，「And that output is also the 32-byte one-time key used for Poly1305.」同一节给出会话密钥的取法：「The 256-bit session integrity key is used as the ChaCha20 key.」也即部署时的正确姿势是密钥分层——协议提供 256 位完整性密钥，ChaCha20 用它派生每条消息的一次性 Poly1305 密钥。

## broken

限度写在 §2.6.2 里，直白得很：「Poly1305 is not a suitable choice for a PRF.Poly1305 prohibits using the same key twice, whereas the PRF in IKEv2 is used multiple times with the same key.Additionally, unlike HMAC, Poly1305 is biased, so using it for key derivation would reduce the security of the symmetric encryption.」两条后果清楚：密钥重用即失守；它不能当伪随机函数或密钥派生用。

## history

沿革在 §2.5 以对照方式印出：原文标题指向 Poly1305-AES 论文（标题在留存件里带 ASCII 引号，故不逐字引用），并说明那版需要 AES 与两份 128 位密钥材料；RFC 8439 把它改写成不依赖 AES 的一次性认证器，并纳入 ChaCha20 的 AEAD 构造。头部印作 Request for Comments: 8439、Category: Informational、August 2018，作者 Nir 与 Woodbury（头部信息复述于引号外）。

**技术参数与复算边界**

该条目的形式模型是 \(T=\mathrm{MAC}_K(M),\quad \Pr[\mathrm{Forge}]\le\varepsilon(\lambda)\)。输入：输入：Poly1305 通用 MAC的公开参数、密钥/随机数与消息；变量说明：K 共享密钥，M 消息，T 认证标签。 预期输出：按 Poly1305 通用 MAC 的规范执行后得到可验证的输出或可比较的优势界。 复算必须给出输入、步骤、输出和单位；示例只演示流程，不替代标准测试向量。

复杂度由密钥长度、分组/状态规模、轮数、随机数质量和敌手模型共同决定；参数越界、版本差异与实现侧信道都可能使公式结论失效。已登记限制：该条目只给出形式模型与可复算步骤，不声称已完成生产实现、侧信道认证或第三方安全评估。

## refs

- Wikipedia search entry for Poly1305 通用 MAC. https://zh.wikipedia.org/w/index.php?search=Poly1305%20%E9%80%9A%E7%94%A8%20MAC
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**形式模型与复算步骤**

\[T=\mathrm{MAC}_K(M),\quad \Pr[\mathrm{Forge}]\le\varepsilon(\lambda)\]

Poly1305 通用 MAC的公开参数、密钥/随机数与消息；变量说明：K 共享密钥，M 消息，T 认证标签。1.密钥派生或分组处理。2.按构造压缩消息与密钥。3.输出固定长度标签并验证。边界：公式只覆盖已登记的参数与假设；参数取值、标准版本和实现细节仍以来源为准。
