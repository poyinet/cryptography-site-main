# AH 认证头

## principle

**协议**：AH 认证头（Authentication Header）。AH 的 §1 服务清单里没有加密：§1 写「The IP Authentication Header (AH) is used to provide connectionless integrity and data origin authentication for IP datagrams」并补「and to provide protection against replays.」§2 给出协议号「The protocol header (IPv4, IPv6, or IPv6 Extension) immediately preceding the AH header SHALL contain the value 51 in its Protocol (IPv4) or Next Header (IPv6, Extension) fields [DH98].」§2.4 说明索引字段：「The SPI is an arbitrary 32-bit value that is used by a receiver to identify the SA to which an incoming packet is bound.」

## why

覆盖范围是 AH 存在的理由，也是它的软肋：§1 说「AH provides authentication for as much of the IP header as possible, as well as for next level protocol data.」但途中可变的字段无法保护——「some IP header fields may change in transit and the value of these fields, when the packet arrives at the receiver, may not be predictable by the sender.」结论是「Thus, the protection provided to the IP header by AH is piecemeal.」同节把 AH 与 ESP 的差别定位在覆盖面：「ESP does not protect any IP header fields unless those fields are encapsulated by ESP」。

## used

序号字段是强制的，即便不启用反重放：§2.5 规定「The field is mandatory and MUST always be present even if the receiver does not elect to enable the anti-replay service for a specific SA.」递增义务的范围写得很清楚——「For a unicast SA or a single-sender multicast SA, the sender MUST increment this field for every transmitted packet.」§2.6 把校验参数交给算法规范：「The integrity algorithm specification MUST specify the length of the ICV and the comparison rules and processing steps for validation.」§3.1 同样只有两种用法——「AH may be employed in two ways: transport mode or tunnel mode.」§3.2 给出适用的算法类型：「suitable integrity algorithms include keyed Message Authentication Codes (MACs) based on symmetric encryption algorithms」。

## broken

多发送方直接使反重放不可用：§2.5 说「Thus, for a multi-sender SA, the anti-reply features of AH are not available」。启用反重放（默认）时序号也不允许回绕：「If anti-replay is enabled (the default), the transmitted sequence number must never be allowed to cycle.」§5 从工程角度给出对人工密钥的态度——若 ICV 密钥手工分发，反重放要求发送端持续维护计数器且溢出时没有自动恢复，因此「a compliant implementation SHOULD NOT provide this service in conjunction with SAs that are manually keyed.」同节还强调符合性要求覆盖语法与体系结构文档，并把算法清单外包给另一份 RFC：「The mandatory-to-implement algorithms for use with AH are described in a separate RFC [Eas04]」。

## history

RFC 4302 由 S.Kent（BBN Technologies）署名，2005 年 12 月发布，Standards Track，头部「Obsoletes: 2402」；摘要称其为「an updated version of the IP Authentication Header (AH)」、目标是「which is designed to provide authentication services in IPv4 and IPv6」。§5 记录强制算法已迁出本文另发 RFC，理由是便于独立更新算法要求。§7 列出与 RFC 2402 的差异，其中新序号选项的描述是「added a new option for a 64-bit sequence number for very high-speed communications.」

## refs

- Wikipedia search entry for AH 认证头. https://zh.wikipedia.org/w/index.php?search=AH%20%E8%AE%A4%E8%AF%81%E5%A4%B4
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/
- RFC 4302: IP Authentication Header. https://www.rfc-editor.org/rfc/rfc4302

## example

**形式模型与复算步骤**

\[\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\]

AH 认证头的公开参数、密钥/随机数与消息；变量说明：Π 协议，A 敌手，n 会话数，PRF/AEAD 为底层原语。1.把协议消息序列写成状态机。2.用混合论证逐个替换原语。3.把剩余优势归约到 PRF/AEAD 安全。边界：公式只覆盖已登记的参数与假设；参数取值、标准版本和实现细节仍以来源为准。
