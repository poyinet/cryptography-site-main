# DTLS 连接 ID

## principle

**协议**：DTLS 连接 ID（DTLS Connection ID）。RFC 9146 的作用写在其 §1：「This document defines an extension to DTLS 1.2 to add a Connection ID (CID) to the DTLS record layer.」协商通过 §3 定义的扩展完成，「enum { connection_id(54), (65535) } ExtensionType;」；记录层用新的内容类型区分：§4「connections that have negotiated this extension use a distinguished record type tls12_cid(25).」真实内容类型被移到密文内部。

## why

根因是记录层靠五元组挑选安全关联：摘要说「selecting a security association of an incoming DTLS record is accomplished with the help of the 5-tuple」，而§1 说「In DTLS as specified in RFC 6347, the IP address and port of the peer are used to identify the DTLS association.」并指出「Unfortunately, in some cases, such as NAT rebinding, these values are insufficient.」以及受影响最大的场景：「This is a particular issue in the Internet of Things when devices enter extended sleep periods to increase their battery lifetime.」顺带按 TLS 1.3 的实践收紧元数据——记录类型被加密，并提供了填充。

## used

方向语义由零长度值表达：§3「A zero-length CID value indicates that the client is prepared to send using a CID but does not wish the server to use one when sending.」明文记录不受影响（§4「Plaintext records are not impacted by this extension.」）。地址更新被严格设条件：§6 收到源地址不同的记录时「the receiver MUST NOT replace the address it uses for sending records to its peer with the source address specified in the received datagram」除非该报文通过密码学校验、比已知最新报文更新、且有手段确认新地址可达。

## broken

三个限制。其一没有中途换号能力：§3「There is no dedicated “CID update” message that allows new CIDs to be established mid-session」。其二隐私代价明写在 §8：「The CID replaces the previously used 5-tuple and, as such, introduces an identifier that remains persistent during the lifetime of a DTLS connection.」并据此建议多宿主与移动场景改用 DTLS 1.3——「The lack of a CID update mechanism in DTLS 1.2 makes this extension unsuitable for mobility scenarios where correlation must be considered.」其三 §9 承认反射攻击面：对端无法分辨真实地址更新与伪造更新。

## history

RFC 9146 由 E.Rescorla（Ed.，Mozilla）、H.Tschofenig（Ed.，Arm Limited）、T.Fossati 与 A.

## refs

- Wikipedia search entry for DTLS 连接 ID. https://zh.wikipedia.org/w/index.php?search=DTLS%20%E8%BF%9E%E6%8E%A5%20ID
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**形式模型与复算步骤**

\[\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\]

DTLS 连接 ID的公开参数、密钥/随机数与消息；变量说明：Π 协议，A 敌手，n 会话数，PRF/AEAD 为底层原语。1.把协议消息序列写成状态机。2.用混合论证逐个替换原语。3.把剩余优势归约到 PRF/AEAD 安全。边界：公式只覆盖已登记的参数与假设；参数取值、标准版本和实现细节仍以来源为准。
