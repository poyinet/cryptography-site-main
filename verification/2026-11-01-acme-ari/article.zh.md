# ACME 续期信息

## principle

**协议**：ACME 续期信息（ACME Renewal Information）。§1 定义扩展：「This document specifies the ACME Renewal Information (ARI) extension」，服务器提供建议窗口、客户回报已替换旧证。§3 给出发现方式：「An ACME server that wishes to provide renewal information MUST include a new field, “renewalInfo”, in its directory object.」§4.1 规定查询形态——「the client sends an unauthenticated GET request to a path under the server's renewalInfo URL.」路径标识由 AKI keyIdentifier 与 DER 序列号拼成，并要求「All trailing “=” characters MUST be stripped from both parts of the unique identifier.」

## why

动机是客户端排期方式太僵。§1 说「Most ACME [RFC8555] clients today choose when to attempt to renew a certificate in one of three ways」并批评前两种「The first two create significant barriers against the issuing Certification Authority (CA) changing certificate lifetimes.」以及共同的后果「All three ways may lead to load clustering for the issuing CA due to its inability to schedule renewal requests.」给出的收益是「Allowing issuing CAs to suggest a period in which clients should renew their certificates enables dynamic time-based load balancing.」摘要把目标压成一句：「This allows servers to mitigate load spikes and ensures that clients do not make false assumptions about appropriate certificate renewal periods.」

## used

核心对象是 suggestedWindow，§4.2 定义为「which bound the window of time in which the CA recommends renewing the certificate.」客户行为被要求为「Clients MUST attempt renewal at a time of their choosing based on the suggested renewal window.」§4.2 给出的 RECOMMENDED 算法共六步，第一步是「Make a renewalInfo request to get a suggested renewal window.」第二步才是「Select a uniform random time within the suggested window.」轮询节奏由 Retry-After 控制，§4.3 特别澄清语义：「In this protocol, it indicates the desired (i.e., both requested minimum and maximum) amount of time to wait.」§5 在 Order 对象上加 replaces 字段——「A string uniquely identifying a previously issued certificate that this order is intended to replace.」

## broken

窗口本身可能被写坏，§4.2 立规矩：「A RenewalInfo object in which the end timestamp equals or precedes the start timestamp is invalid.」客户在拿到这种响应时须当作没收到。§4.3 限定使用时机——「Clients MUST NOT check a certificate's RenewalInfo after the certificate has expired.」§6 记录两处代价：其一，改用无认证 GET 是「a departure from the requirement in RFC 8555 that clients send POST-as-GET requests to fetch resources from the server.」因此「servers should take measures to ensure that unauthenticated requests for renewal information cannot result in denial-of-service attacks.」其二，时钟不同步会带来偏差：「this protocol could exhibit undesired behavior in the presence of significant clock skew between the ACME client and server.」

## history

RFC 9773 署名 A.Gable（Internet Security Research Group），2025 年 6 月发布，Category: Standards Track，头部无 Obsoletes 行，是 RFC 8555 之上的扩展。§2 约定术语覆盖范围——「renewal」包含 RFC 3647 定义的 Renewal、Re-Key 与 Modification 的任意组合。§4.2 还留了运维接口：explanationURL 指向可解释窗口成因的页面，规范要求「Clients SHOULD provide this URL to their operator, if present.」

## refs

- Wikipedia search entry for ACME 续期信息. https://zh.wikipedia.org/w/index.php?search=ACME%20%E7%BB%AD%E6%9C%9F%E4%BF%A1%E6%81%AF
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**形式模型与复算步骤**

\[\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\]

ACME 续期信息的公开参数、密钥/随机数与消息；变量说明：Π 协议，A 敌手，n 会话数，PRF/AEAD 为底层原语。1.把协议消息序列写成状态机。2.用混合论证逐个替换原语。3.把剩余优势归约到 PRF/AEAD 安全。边界：公式只覆盖已登记的参数与假设；参数取值、标准版本和实现细节仍以来源为准。
