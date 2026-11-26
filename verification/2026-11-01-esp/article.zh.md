# ESP 封装安全载荷

## principle

**协议**：ESP 封装安全载荷（Encapsulating Security Payload）。ESP 的报文位置与字段在 RFC 4303 里钉死：§1 说「The ESP header is inserted after the IP header and before the next layer protocol header (transport mode) or before an encapsulated IP header (tunnel mode).」§2 规定前导协议号「The (outer) protocol header (IPv4, IPv6, or Extension) that immediately precedes the ESP header SHALL contain the value 50 in its Protocol (IPv4) or Next Header (IPv6, Extension) field」并描述布局「The packet begins with two 4-byte fields (Security Parameters Index (SPI) and Sequence Number).」§2.8 补上可选尾部：「The Integrity Check Value is a variable-length field computed over the ESP header, Payload, and ESP trailer fields.」且「The ICV field is optional.」

## why

服务是可选组合，但有一条底线：§1 列出「ESP can be used to provide confidentiality, data origin authentication, connectionless integrity, an anti-replay service (a form of partial sequence integrity), and (limited) traffic flow confidentiality.」并强调服务集合取决于建 SA 时的选项与实现位置。§3.2 收口成一句硬性要求：「although both confidentiality and integrity are optional, at least one of these services MUST be selected, hence both algorithms MUST NOT be simultaneously NULL.」对纯加密，§1 先给警告「Using encryption-only for confidentiality is allowed by ESP.」再指出「this will provide defense only against passive attackers.」

## used

加密-only 并非被禁：§1 解释「ESP allows encryption-only SAs because this may offer considerably better performance and still provide adequate security」同时保留一句「However, this standard does not require ESP implementations to offer an encryption-only service.」流量掩蔽是显式设计的可选功能：§2.7 规定「An IPsec implementation SHOULD be capable of padding traffic by adding bytes after the end of the Payload Data, prior to the beginning of the Padding field.」并要求「if TFC padding is added, the field containing the specification of the length of the IP datagram MUST NOT be modified to reflect this padding.」模式选择在 §3.1 一句话交代：「ESP may be employed in two ways: transport mode or tunnel mode.」

## broken

重放保护有明确失效条件：§2.2 说「for a multi-sender SA, the anti-replay features of ESP are not available」。新特性受协商约束，§2.7 要求「the SA management protocol MUST negotiate this service prior to a transmitter employing it, to ensure backward compatibility」。§3.4 给出处理顺序的安全理由：入站并行时「integrity checking MUST be completed before the decrypted packet is passed on for further processing.」最硬的边界在 §8：「There is no version number in ESP and no mechanism enabling IPsec peers to discover or negotiate which version of ESP each is using or should use.」——版本只能靠协商出来的算法组合间接体现。

## history

RFC 4303 由 S.Kent（BBN Technologies）署名，2005 年 12 月发布，Standards Track，头部「Obsoletes: 2406」；摘要称其为「an updated version of the Encapsulating Security Payload (ESP) protocol」并说明「ESP is used to provide confidentiality, data origin authentication, connectionless integrity, an anti-replay service」。§8 交代与旧版的兼容关系：「if none of the new features available in ESP v3 are employed, then the format of an ESP packet is identical in ESP v2 and v3.」组合模式加密则只在 v3 语境中定义。

## refs

- Wikipedia search entry for ESP 封装安全载荷. https://zh.wikipedia.org/w/index.php?search=ESP%20%E5%B0%81%E8%A3%85%E5%AE%89%E5%85%A8%E8%BD%BD%E8%8D%B7
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/
- RFC 4303: IP Encapsulating Security Payload. https://www.rfc-editor.org/rfc/rfc4303

## example

**形式模型与复算步骤**

\[\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\]

ESP 封装安全载荷的公开参数、密钥/随机数与消息；变量说明：Π 协议，A 敌手，n 会话数，PRF/AEAD 为底层原语。1.把协议消息序列写成状态机。2.用混合论证逐个替换原语。3.把剩余优势归约到 PRF/AEAD 安全。边界：公式只覆盖已登记的参数与假设；参数取值、标准版本和实现细节仍以来源为准。
