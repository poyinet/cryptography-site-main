# RADIUS 认证协议

## principle

**协议**：RADIUS 认证协议（Remote Authentication Dial-In User Service）。RADIUS 是 NAS 与后端认证服务器之间的客户/服务器协议：§1 说明「A Network Access Server (NAS) operates as a client of RADIUS.」§3 则规定报文封装：「Exactly one RADIUS packet is encapsulated in the UDP Data field [4], where the UDP Destination Port field indicates 1812 (decimal).」

## why

信任建立在预共享密钥上：§1 Network Security 说明「Transactions between the client and RADIUS server are authenticated through the use of a shared secret, which is never sent over the network.」因此认证不依赖信道本身。

## used

属性承载请求与应答中的具体认证、授权、信息与配置细节：§5 说明「RADIUS Attributes carry the specific authentication, authorization, information and configuration details for the request and reply.」§2 对无共享秘密的请求给出硬性处置：「A request from a client for which the RADIUS server does not have a shared secret MUST be silently discarded.」

## broken

弱点在口令隐藏与 MD5 依赖：§2 说明口令「is hidden using a method based on the RSA Message Digest Algorithm MD5 [3].」§8 承认「The User-Password hiding mechanism described in Section 5.2 has not been subjected to significant amounts of cryptanalysis in the published literature.」RFC 2865/2866 都未记载 Message-Authenticator 扩展（那属 RFC 2869），也未宣布 MD5 已被攻破。

## history

两份文件同于 2000 年 6 月发布：RFC 2865 是 Standards Track，头部写明取代 RFC 2138；RFC 2866（RADIUS Accounting）是 Informational、标注 Obsoletes: 2139，并说明「All transactions are comprised of variable length Attribute-Length-Value 3-tuples.」两者都没有 Updates 行。

**技术参数与复算边界**

该条目的形式模型是 \(\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\)。输入：输入：RADIUS 认证协议的公开参数、密钥/随机数与消息；变量说明：Π 协议，A 敌手，n 会话数，PRF/AEAD 为底层原语。 预期输出：按 RADIUS 认证协议 的规范执行后得到可验证的输出或可比较的优势界。 复算必须给出输入、步骤、输出和单位；示例只演示流程，不替代标准测试向量。

复杂度由密钥长度、分组/状态规模、轮数、随机数质量和敌手模型共同决定；参数越界、版本差异与实现侧信道都可能使公式结论失效。已登记限制：该条目只给出形式模型与可复算步骤，不声称已完成生产实现、侧信道认证或第三方安全评估。

## refs

- Wikipedia search entry for RADIUS 认证协议. https://zh.wikipedia.org/w/index.php?search=RADIUS%20%E8%AE%A4%E8%AF%81%E5%8D%8F%E8%AE%AE
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**形式模型与复算步骤**

\[\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\]

RADIUS 认证协议的公开参数、密钥/随机数与消息；变量说明：Π 协议，A 敌手，n 会话数，PRF/AEAD 为底层原语。1.把协议消息序列写成状态机。2.用混合论证逐个替换原语。3.把剩余优势归约到 PRF/AEAD 安全。边界：公式只覆盖已登记的参数与假设；参数取值、标准版本和实现细节仍以来源为准。
