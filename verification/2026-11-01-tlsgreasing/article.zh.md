# TLS GREasing 扩展性保活

## principle

**协议**：TLS GREasing 扩展性保活（TLS GREasing Extensibility）。机制是预留一批永不协商的取值供随机通告：§1「To avoid this problem, this document reserves some currently unused values for TLS implementations to advertise at random.」并解释正确的对端会忽略它们，而不宽容的对端会立刻失败——「Peers that do not tolerate unknown values will fail to interoperate, revealing the mistake before it is widespread.」§2 对扩展、命名组、签名算法与版本给出成对重复字节的取值集合（0x0A0A 0x1A1A 0x2A2A…），而 PskKeyExchangeModes 另有一套单字节预留值：「The following values are reserved as GREASE values for PskKeyExchangeModes: 0x0B 0x2A 0x49 0x68 0x87 0xA6 0xC5 0xE4」。

## why

要防的是扩展性锈蚀。§1 说明 TLS 依赖「The responding side must ignore unknown values so that new capabilities may be introduced to the ecosystem while maintaining interoperability.」但缺陷会静默扩散：「However, bugs may cause an implementation to reject unknown values.」并指出后果——「updated peers will discover that the metaphorical joint in the protocol has rusted shut and the new values cannot be deployed without interoperability failures.」命名由此而来：「this technique is called “GREASE” (Generate Random Extensions And Sustain Extensibility)」。

## used

客户侧在 ClientHello 里随机插入各类 GREASE 值（§3.1 用一串 MAY 逐项列出套件、扩展、命名组、签名算法、版本、PSK 模式与 ALPN）；服务器侧在 CertificateRequest 与 NewSessionTicket 里同理（§4.1）。发送策略由 §5 规定：「Implementations advertising GREASE values SHOULD select them at random.」以避免只对单个取值宽容，同时要求「Implementations MUST honor protocol specifications when sending GREASE values.」并提醒确定性与多样性的权衡。

## broken

边界与风险都写在文档里。协商结果里出现 GREASE 值必须判死：客户侧「Clients MUST reject GREASE values when negotiated by the server.」服务器侧「Servers MUST reject GREASE values when negotiated by the client.」§7 说明这些值本身不参与协商，因此「GREASE values cannot be negotiated, so they do not directly impact the security of TLS connections.」但回退重试会削弱它——「Implementations SHOULD NOT retry with GREASE disabled on connection failure.」并且固定取值会带来指纹化风险。

## history

RFC 8701 由 D.Benjamin（Google LLC）署名，2020 年 1 月发布，Category 标注 Informational。§2 记录预留值的连带后果：这些值「The values allocated above are thus no longer available for use as TLS or DTLS [RFC6347] version numbers.」分配刻意稀疏，「These values were allocated sparsely to discourage server implementations from conditioning on them.」

## refs

- Wikipedia search entry for TLS GREasing 扩展性保活. https://zh.wikipedia.org/w/index.php?search=TLS%20GREasing%20%E6%89%A9%E5%B1%95%E6%80%A7%E4%BF%9D%E6%B4%BB
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**形式模型与复算步骤**

\[\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\]

TLS GREasing 扩展性保活的公开参数、密钥/随机数与消息；变量说明：Π 协议，A 敌手，n 会话数，PRF/AEAD 为底层原语。1.把协议消息序列写成状态机。2.用混合论证逐个替换原语。3.把剩余优势归约到 PRF/AEAD 安全。边界：公式只覆盖已登记的参数与假设；参数取值、标准版本和实现细节仍以来源为准。
