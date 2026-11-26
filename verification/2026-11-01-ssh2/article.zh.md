# SSH 2.0 协议族

## principle

**协议**：SSH 2.0 协议族（SSH Protocol Version 2）。SSH 2.0 的传输层先交换版本串与 KEXINIT，再做 DH 得到共享秘密 K。交换哈希 H 把版本串、双方 KEXINIT 原始 payload、主机密钥、DH 的 e/f 与 K 按固定顺序拼接后哈希；首次 KEX 的 H 就是 session_id。随后用 K1=HASH(K||H||X||session_id) 起步，X 取 A–F 分别派生 c→s IV、s→c IV、c→s 加密键、s→c 加密键、c→s 完整性键、s→c 完整性键；长度不够时继续链式哈希扩展。

## why

H 同时绑定算法协商、主机身份和 DH 值，防止中间人替换其中任何一项；session_id 在 rekey 后保持不变，把整条连接的历史绑定在一起。六向密钥把方向与用途分开，避免用同一密钥同时做加密和 MAC；序列号隐式进入 MAC，让重放、重排和丢包都能被接收端发现。

## used

实现按 RFC 4253 §7.2 的顺序扩展密钥：先算 K1，再算 K2、K3，直到六个密钥都够长；AES-128-CTR 取 16 字节加密键，HMAC-SHA256 取 32 字节完整性键。包层先组明文包，再算 MAC=MAC(K_mac, seq||packet_without_mac)，最后加密；AEAD 模式把 MAC 与加密合并，但仍要维护序列号。

## broken

独立 MAC 与加密的顺序决定安全边界：先加密再 MAC 更稳，先 MAC 再加密会给填充 oracle 留空间；CBC 模式与 SHA-1 已不应在新部署中使用。序列号回绕后不能重用旧 nonce；rekey 只换密钥，不重置序列号。主机密钥信任不在传输层内完成，known_hosts 或证书校验仍需单独做。### 形式模型

## history

SSH-1 在 1995 年前后出现，因 CRC 补偿攻击与协议缺陷被 SSH-2 取代；RFC 4250–4254 在 2006 年 1 月把 SSH-2 定型为传输层、认证、连接与架构四份文档。RFC 6668 在 2012 年增补 hmac-sha2-256 与 hmac-sha2-512；OpenSSH 等实现后续加入 AEAD、strict KEX 与后量子 KEX 扩展，但包层公式仍沿用 RFC 4253。

**技术参数与复算边界**

该条目的形式模型是 \(\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\)。输入：输入：SSH 2.0 协议族的公开参数、密钥/随机数与消息；变量说明：Π 协议，A 敌手，n 会话数，PRF/AEAD 为底层原语。 预期输出：按 SSH 2.0 协议族 的规范执行后得到可验证的输出或可比较的优势界。 复算必须给出输入、步骤、输出和单位；示例只演示流程，不替代标准测试向量。

复杂度由密钥长度、分组/状态规模、轮数、随机数质量和敌手模型共同决定；参数越界、版本差异与实现侧信道都可能使公式结论失效。已登记限制：该条目只给出形式模型与可复算步骤，不声称已完成生产实现、侧信道认证或第三方安全评估。

**参数与状态规模**

公式 \(\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\) 的输入、输出和单位必须逐项登记；复算顺序为：1. 把协议消息序列写成状态机 2. 用混合论证逐个替换原语 3. 把剩余优势归约到 PRF/AEAD 安全。

状态规模、密钥长度、分组长度和轮数决定复杂度；这些量不能从标题推断，必须以标准或实现文档为准。

## refs

- Wikipedia search entry for SSH 2.0 协议族. https://zh.wikipedia.org/w/index.php?search=SSH%202.0%20%E5%8D%8F%E8%AE%AE%E6%97%8F
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/
- RFC 4251: The Secure Shell (SSH) Protocol Architecture. https://www.rfc-editor.org/rfc/rfc4251
- Published standard/RFC for SSH 2.0 协议族. https://www.rfc-editor.org/rfc/rfc4251

## example

**形式模型与复算步骤**

\[\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\]

SSH 2.0 协议族的公开参数、密钥/随机数与消息；变量说明：Π 协议，A 敌手，n 会话数，PRF/AEAD 为底层原语。1.把协议消息序列写成状态机。2.用混合论证逐个替换原语。3.把剩余优势归约到 PRF/AEAD 安全。边界：公式只覆盖已登记的参数与假设；参数取值、标准版本和实现细节仍以来源为准。
