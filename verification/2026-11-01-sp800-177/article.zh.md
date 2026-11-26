# TLS 选型与配置指南

## principle

**标准**：TLS 选型与配置指南（Guidelines for the Selection, Configuration, and Use of TLS Implementations）。这份指南的身份写在标题里：「Guidelines for the Selection, Configuration, and Use of Transport Layer Security (TLS) Implementations」，由 NIST 以 SP 800-52 Rev.2 发布。§1.2 划清作用域：「These guidelines focus only on network security, and they focus directly on the small portion of the network communications stack that is referred to as the transport layer.」并说明它管的是互操作用场景与公钥证书认证：「These guidelines focus on the common use cases where clients and servers must interoperate with a wide variety of implementations, and authentication is performed using public-key certificates.」

## why

之所以按风险分层给要求，是因为安全性不是一枚开关：§1.2 写「Security is not a single property that is (or is not) possessed by a protocol.」并且「Adherence to these guidelines only protects the data in transit.」§3.1 因此把政务专用与面向公众的服务器分别规定：前者「should not be configured to use TLS 1.1 and shall not use TLS 1.0, SSL 3.0, or SSL 2.0.」后者允许在必要时保留 TLS 1.1/1.0 以维持互通——「The use of TLS versions 1.1 and 1.0 is generally discouraged, but these versions may be configured when necessary to enable interaction with citizens and businesses.」

## used

面向美国联邦系统的部署时限写得具体：§3.1「Agencies shall support TLS 1.3 by January 1, 2024.」并要求此后两类服务器都支持 1.3；同时给出兼容策略——「In general, servers that support TLS 1.3 should be configured to use TLS 1.2 as well.」允许在确认不需要互通时关掉 1.2。政务专用侧的基线是「shall be configured to use TLS 1.2 and should be configured to use TLS 1.3 as well」。

## broken

指南自陈两个限度。范围上它只管传输层：§1.2 说「Adherence to these guidelines only protects the data in transit.」并建议其余层面引用其他 NIST 标准与指南。实现质量上它不接受有缺陷的版本协商：§3.1 记录某些实现会在新版本被提出时直接断开，结论是「Servers that incorrectly implement TLS version negotiation shall not be used.」——即合规配置无法替代对实现行为的验证。

## history

**技术参数与复算边界**

该条目的形式模型是 \(S=\min_i S_i,\quad S_i\in\{\text{密钥强度},\text{分组安全},\text{实现安全}\}\)。输入：输入：TLS 选型与配置指南的公开参数、密钥/随机数与消息；变量说明：S 为综合安全强度；各分量取最小值，不能只看密钥位数。 预期输出：按 TLS 选型与配置指南 的规范执行后得到可验证的输出或可比较的优势界。 复算必须给出输入、步骤、输出和单位；示例只演示流程，不替代标准测试向量。

复杂度由密钥长度、分组/状态规模、轮数、随机数质量和敌手模型共同决定；参数越界、版本差异与实现侧信道都可能使公式结论失效。已登记限制：该条目只给出形式模型与可复算步骤，不声称已完成生产实现、侧信道认证或第三方安全评估。

## refs

- Wikipedia search entry for TLS 选型与配置指南. https://zh.wikipedia.org/w/index.php?search=TLS%20%E9%80%89%E5%9E%8B%E4%B8%8E%E9%85%8D%E7%BD%AE%E6%8C%87%E5%8D%97
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**形式模型与复算步骤**

\[S=\min_i S_i,\quad S_i\in\{\text{密钥强度},\text{分组安全},\text{实现安全}\}\]

TLS 选型与配置指南的公开参数、密钥/随机数与消息；变量说明：S 为综合安全强度；各分量取最小值，不能只看密钥位数。1.读取标准规定的密钥/分组/模式参数。2.按标准表换算等效强度。3.取最弱分量作为系统强度。边界：公式只覆盖已登记的参数与假设；参数取值、标准版本和实现细节仍以来源为准。
