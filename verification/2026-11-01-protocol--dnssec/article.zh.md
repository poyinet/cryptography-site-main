# DNSSEC 安全扩展

## principle

**协议**：DNSSEC 域名安全（DNS Security Extensions）。摘要一句话说清扩展对象：「The Domain Name System Security Extensions (DNSSEC) add data origin authentication and data integrity to the Domain Name System.」本文件是介绍与需求文档，新记录与协议改动由配套文档族规定。

## why

§1 同时给出能力与不自称的能力：「The DNS security extensions provide origin authentication and integrity protection for DNS data, as well as a means of public key distribution.These extensions do not provide confidentiality.」即补齐的是来源与完整性，机密性被排除在设计之外。

## used

§3 列出协议改动：「DNSSEC adds four new resource record types: Resource Record Signature (RRSIG), DNS Public Key (DNSKEY), Delegation Signer (DS), and Next Secure (NSEC).It also adds two new message header bits: Checking Disabled (CD) and Authenticated Data (AD).」验证起点由 §2 的术语定义给出：「Trust Anchor: A configured DNSKEY RR or DS RR hash of a DNSKEY RR.」

## broken

自陈的边界有两处：§4 说明「Accordingly, DNSSEC is not designed to provide confidentiality, access control lists, or other means of differentiating between inquirers.」；可用性同样没有承诺——「DNSSEC provides no protection against denial of service attacks.」并指出验证签名会给解析器与权威服务器带来新的一类拒绝服务面。

## history

RFC 4033 头部为 R.Arends（Telematica Instituut）、R.Austein（ISC）、M.Larson（VeriSign）、D.Massey（Colorado State University）与 S.Rose（NIST），类别 Standards Track，2005 年 3 月；头部同时列出取代的九份文档（以 2535 开头）与更新的九份文档（以 1034、1035 开头），这两串清单在文本里与作者栏交错排版，故此处不逐字引用。

**技术参数与复算边界**

该条目的形式模型是 \(\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\)。输入：输入：DNSSEC 域名安全的公开参数、密钥/随机数与消息；变量说明：Π 协议，A 敌手，n 会话数，PRF/AEAD 为底层原语。 预期输出：按 DNSSEC 域名安全 的规范执行后得到可验证的输出或可比较的优势界。 复算必须给出输入、步骤、输出和单位；示例只演示流程，不替代标准测试向量。

复杂度由密钥长度、分组/状态规模、轮数、随机数质量和敌手模型共同决定；参数越界、版本差异与实现侧信道都可能使公式结论失效。已登记限制：该条目只给出形式模型与可复算步骤，不声称已完成生产实现、侧信道认证或第三方安全评估。

## refs

- Wikipedia search entry for DNSSEC 域名安全. https://zh.wikipedia.org/w/index.php?search=DNSSEC%20%E5%9F%9F%E5%90%8D%E5%AE%89%E5%85%A8
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**形式模型与复算步骤**

\[\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\]

DNSSEC 域名安全的公开参数、密钥/随机数与消息；变量说明：Π 协议，A 敌手，n 会话数，PRF/AEAD 为底层原语。1.把协议消息序列写成状态机。2.用混合论证逐个替换原语。3.把剩余优势归约到 PRF/AEAD 安全。边界：公式只覆盖已登记的参数与假设；参数取值、标准版本和实现细节仍以来源为准。
