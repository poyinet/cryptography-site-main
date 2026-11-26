# IKEv2 密钥交换

## principle

**协议**：IKEv2 密钥交换（Internet Key Exchange Version 2）。IKEv2 先做 IKE_SA_INIT：双方交换 SA 提案、Ni/Nr 与 DH 公钥，协商 PRF、加密、完整性算法和 DH 组。随后计算 SKEYSEED=prf(Ni|Nr, g^ir)，其中 g^ir 是 DH 共享秘密。再用 prf+(SKEYSEED, Ni|Nr|SPIi|SPIr) 扩展出 SK_d、SK_ai、SK_ar、SK_ei、SK_er、SK_pi、SK_pr。SK_d 是派生 Child SA 密钥材料的长期密钥，SK_a 保护完整性，SK_e 保护机密性，SK_p 保护身份信息。

## why

SKEYSEED 同时绑定双方 nonce、DH 共享秘密和 SPI，任何一项不同都会得到不同的会话密钥；prf+ 把固定长度 PRF 输出拉长成所需密钥流，避免不同用途复用同一段密钥。IKE_AUTH 用 AUTH 把真实消息、对端 nonce 和身份绑定起来，防止中间人替换 ID 或重放旧消息；Child SA 可加新 DH 实现 PFS。

## used

实现按 RFC 7296 §2.14 计算：先选 PRF（如 HMAC-SHA-256，输出 32 字节），再按密钥长度切分 prf+ 输出；SK_d 至少取 PRF 输出长度。Child SA 的 KEYMAT=prf+(SK_d, Ni|Nr)，带 PFS 时改为 prf+(SK_d, g^ir(new)|Ni|Nr)；AUTH 的 SignedOctets 包含 RealMessage、对端 nonce 和 prf(SK_p, ID)。

## broken

PFS 是可选项：不带新 DH 的 Child SA 只靠 SK_d 与 nonce，长期 SK_d 泄漏会回溯到该 SA 的密钥。nonce 重用会让 SKEYSEED 重复，直接破坏会话密钥唯一性。PSK 模式必须先做 Key Pad 内层 prf，低熵口令仍会遭受离线字典攻击；PPK 只是把额外密钥混入，不替代强共享秘密。IKEv2 保护协商与 SA，不自动保护应用数据。

## history

IKEv2 最早由 RFC 4306 在 2005 年 12 月提出，RFC 5996 在 2010 年修订，RFC 7296 在 2014 年 10 月成为 Internet Standard STD 79。RFC 8784 在 2020 年加入 PPK，用于把后量子预共享密钥混入 IKEv2；RFC 7383 加入消息分片，RFC 7815 给出最小实现示例。

**技术参数与复算边界**

该条目的形式模型是 \(\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\)。输入：输入：IKEv2 密钥交换的公开参数、密钥/随机数与消息；变量说明：Π 协议，A 敌手，n 会话数，PRF/AEAD 为底层原语。 预期输出：按 IKEv2 密钥交换 的规范执行后得到可验证的输出或可比较的优势界。 复算必须给出输入、步骤、输出和单位；示例只演示流程，不替代标准测试向量。

复杂度由密钥长度、分组/状态规模、轮数、随机数质量和敌手模型共同决定；参数越界、版本差异与实现侧信道都可能使公式结论失效。已登记限制：该条目只给出形式模型与可复算步骤，不声称已完成生产实现、侧信道认证或第三方安全评估。

**参数与状态规模**

公式 \(\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\) 的输入、输出和单位必须逐项登记；复算顺序为：1. 把协议消息序列写成状态机 2. 用混合论证逐个替换原语 3. 把剩余优势归约到 PRF/AEAD 安全。

状态规模、密钥长度、分组长度和轮数决定复杂度；这些量不能从标题推断，必须以标准或实现文档为准。

## refs

- Wikipedia search entry for IKEv2 密钥交换. https://zh.wikipedia.org/w/index.php?search=IKEv2%20%E5%AF%86%E9%92%A5%E4%BA%A4%E6%8D%A2
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**形式模型与复算步骤**

\[\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\]

IKEv2 密钥交换的公开参数、密钥/随机数与消息；变量说明：Π 协议，A 敌手，n 会话数，PRF/AEAD 为底层原语。1.把协议消息序列写成状态机。2.用混合论证逐个替换原语。3.把剩余优势归约到 PRF/AEAD 安全。边界：公式只覆盖已登记的参数与假设；参数取值、标准版本和实现细节仍以来源为准。
