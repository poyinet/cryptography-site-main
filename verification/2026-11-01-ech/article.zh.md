# 加密客户端问候

## principle

**协议**：加密客户端问候（Encrypted Client Hello）。RFC 9849 §1 定义扩展：「This document specifies a new TLS extension called Encrypted Client Hello (ECH) that allows clients to encrypt their ClientHello to the TLS server.」保护对象是明文 SNI——文档称它「is perhaps the most sensitive information left unencrypted in TLS 1.3.」机制在 §3.2：客户端构造私有 ClientHelloInner 与公开 ClientHelloOuter，外层「contains innocuous values for sensitive extensions and an "encrypted_client_hello" extension」。§5 给出扩展码点「enum { encrypted_client_hello(0xfe0d), (65535) } ExtensionType;」。

## why

目标是让同一匿名集内的连接不可区分：§1「Usage of this mechanism reveals that a client is connecting to a particular service provider, but does not reveal which server from the anonymity set terminates the connection.」§3.2 复述主目标并要求「without affecting any existing security properties of TLS 1.3」。§10.1 把目标拆成三条，含「3.Downgrade resistance.An attacker cannot downgrade a connection that attempts to use ECH to one that does not use ECH.」同节也承认边界：§1「ECH is not in itself sufficient to protect the identity of the server.」

## used

配置依赖 HPKE：§4「ECH uses Hybrid Public Key Encryption (HPKE) for public key encryption」并规定「Clients MUST ignore any ECHConfig structure with a version they do not support.」客户端提供方式在 §6.1，其中内层问候「It MUST NOT offer to negotiate TLS 1.2 or below.」以避开版本不兼容；§6.2 的 GREASE ECH 让「a connection between an ECH-capable client and a non-ECH server to appear to use ECH」。§9 定强制实现：一套 HPKE 套件（DHKEM(X25519, HKDF-SHA256)、HKDF-SHA256、AES-128-GCM）。

## broken

§3.2 明确被拒时的后果：「When ECH is rejected, the resulting connection is not usable by the client for application data.」§8.1 承认与既有服务器的兼容性问题，并建议运营方「SHOULD ensure servers understand a given set of ECH keys before advertising them」。§10.2 指出配置经 DNS 分发时缺乏真实性——「any attacker which can inject DNS responses or poison DNS caches」可投毒或剥离配置，同时论证这与 IP 层被劫持的情形不比更坏。§10.5 提醒外层的任何字段都可能泄露内层属性：客户端「SHOULD NOT send values in the ClientHelloOuter which would reveal a sensitive ClientHelloInner property, such as the true server name.」

## history

RFC 9849 由 E.Rescorla（Independent）、奥一穂 K.Oku（Fastly）、N.Sullivan（Cryptography Consulting LLC）与 C.A.Wood（Apple）署名，2026 年 3 月发布，Category: Standards Track。§1 界定适用范围：「ECH is supported in TLS 1.3 [RFC8446], DTLS 1.3 [RFC9147], and newer versions of the TLS and DTLS protocols.」同节还点明配套依赖：域名可见性还需加密 DNS 等手段配合，SNI 加密并非孤立解。

## refs

- Wikipedia search entry for 加密客户端问候. https://zh.wikipedia.org/w/index.php?search=%E5%8A%A0%E5%AF%86%E5%AE%A2%E6%88%B7%E7%AB%AF%E9%97%AE%E5%80%99
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**形式模型与复算步骤**

\[\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\]

加密客户端问候的公开参数、密钥/随机数与消息；变量说明：Π 协议，A 敌手，n 会话数，PRF/AEAD 为底层原语。1.把协议消息序列写成状态机。2.用混合论证逐个替换原语。3.把剩余优势归约到 PRF/AEAD 安全。边界：公式只覆盖已登记的参数与假设；参数取值、标准版本和实现细节仍以来源为准。
