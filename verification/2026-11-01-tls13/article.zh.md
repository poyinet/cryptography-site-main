# TLS 1.3

## principle

**协议**：TLS 1.3（TLS 1.3）。TLS 1.3 先把握手消息累积成 transcript，再用 HKDF 阶梯派生各阶段密钥。Transcript-Hash 对 ClientHello 到当前消息做哈希；Derive-Secret 把标签、transcript 哈希和当前 secret 绑定，输出下一层 secret。Early Secret 由 PSK 或全零 PSK 提取；Handshake Secret 把 Early 的 derived secret 与 (EC)DHE 共享秘密提取；Main Secret 再把 Handshake 的 derived secret 与全零 IKM 提取。之后 c hs traffic、s hs traffic、c ap traffic、s ap traffic 分别绑定握手或应用阶段的消息序列，最后扩展出 AEAD 的 key 与 IV。

## why

把密钥按阶段拆开，可以做到握手后段加密、前向保密和 0-RTT 分离：Handshake Secret 由临时 DH 提供前向保密，应用流量密钥再由 Main Secret 派生；PSK 只影响 Early Secret，不能替代证书或 Finished。每个 traffic secret 绑定 transcript，防止握手消息被剪接；Finished 再用 finished_key 对 transcript 做 HMAC，确认双方看到同一段握手。

## used

实现时按 RFC 9846 的 key schedule 顺序计算：先确定 Hash（如 SHA-256，输出 32 字节），再算 Early/Handshake/Main；每个 traffic secret 用 Derive-Secret 加标签；key 与 IV 用 HKDF-Expand-Label 扩展，AES-128-GCM 取 16 字节 key、12 字节 IV。记录层把 64 位序列号补零到 IV 长度后异或，得到 per-record nonce；AEAD 的 additional_data 是记录头，明文是内容。Finished 的 base key 是 handshake traffic secret，finished_key 再扩展 Hash.length 字节。

## broken

0-RTT 早期数据没有跨连接防重放，重放窗口由应用自己限制；PSK 泄漏会削弱 Early Secret，不能把它当长期身份。记录序列号耗尽必须 key update，不能回绕重用 nonce；AEAD 的 IV 复用会直接破坏机密性与完整性。TLS 1.3 不保护端点被攻破后的明文，也不替代证书校验、主机名验证和授权；RFC 9846 是对 RFC 8446 的小幅更新，引用时应以现行文本为准。

## history

TLS 1.3 由 RFC 8446 在 2018 年 8 月标准化，移除静态 RSA 与静态 DH 密钥交换，要求所有公钥交换提供前向保密，并把握手后段加密。RFC 9846 在 2026 年 7 月发布，替代 RFC 8446，但协议版本仍是 TLS 1.3；它禁止跨连接复用 KeyShare，把握手用量上限前的 key update 升为 MUST，并把 master 术语改为 main。

**技术参数与复算边界**

该条目的形式模型是 \(\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\)。输入：输入：TLS 1.3的公开参数、密钥/随机数与消息；变量说明：Π 协议，A 敌手，n 会话数，PRF/AEAD 为底层原语。 预期输出：按 TLS 1.3 的规范执行后得到可验证的输出或可比较的优势界。 复算必须给出输入、步骤、输出和单位；示例只演示流程，不替代标准测试向量。

复杂度由密钥长度、分组/状态规模、轮数、随机数质量和敌手模型共同决定；参数越界、版本差异与实现侧信道都可能使公式结论失效。已登记限制：该条目只给出形式模型与可复算步骤，不声称已完成生产实现、侧信道认证或第三方安全评估。

## refs

- Wikipedia search entry for TLS 1.3. https://zh.wikipedia.org/w/index.php?search=TLS%201.3
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/
- RFC 8446: The Transport Layer Security (TLS) Protocol Version 1.3. https://www.rfc-editor.org/rfc/rfc8446
- Published standard/RFC for TLS 1.3. https://www.rfc-editor.org/rfc/rfc8446

## example

**形式模型与复算步骤**

\[\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\]

TLS 1.3的公开参数、密钥/随机数与消息；变量说明：Π 协议，A 敌手，n 会话数，PRF/AEAD 为底层原语。1.把协议消息序列写成状态机。2.用混合论证逐个替换原语。3.把剩余优势归约到 PRF/AEAD 安全。边界：公式只覆盖已登记的参数与假设；参数取值、标准版本和实现细节仍以来源为准。
