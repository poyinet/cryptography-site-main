# EAP-PWD

## principle

**协议**：EAP-PWD（EAP-PWD）。摘要给出定义：「This memo describes an Extensible Authentication Protocol (EAP) method, EAP-pwd, which uses a shared password for authentication.」并声明强度「The underlying key exchange is resistant to active attack, passive attack, and dictionary attack.」§2.8.2 说明消息构成——「EAP-pwd defines three message exchanges: an Identity exchange, a Commit exchange, and a Confirm exchange.」§2.8.3 交代核心中间量：双方用彼此身份与协商出的 ciphersuite「fix an element in the negotiated group called the Password Element」，且「From the point of view of an attacker who does not know the password, the Password Element will be a random element in the negotiated group.」

## why

RFC 5931 由 D.Harkins（Aruba Networks）与 G.Zorn（Network Zen）署名，2010 年 8 月发布，头部 Category 标注 Informational。动机是口令的现实形态：§1.1 说「Typically these passwords are not stored on a user's computer for security reasons and must be entered each time the human desires network access.」并承认熵不足——「They will likely not possess high-entropy, and it may be assumed that an adversary with access to a dictionary will have the ability to guess a user's password.」同节把问题谱系追到「This problem was first described by Bellovin and Merritt in [BM92] and [BM93].」§1.3 给出该问题域的门槛：任何声称解决口令认证密钥交换的协议「must be resistant to active, passive, and dictionary attack and have the quality of forward secrecy.」

## used

§2.8.2 说明 Commit 阶段做什么：「the peer and server exchange information to generate a shared key and also to bind each other to a particular guess of the password.」§2.10 定下互操作基线——「compliant EAP-pwd implementations SHALL support the following parameters」，其中包含「Diffie-Hellman Group: group 19 defined in [RFC5114]」与「PRF: HMAC-SHA256 defined in [RFC4634]」。§7 按 RFC 3748 的要求给出安全声明，机制是「mechanism: password.」，并声明「mutual authentication: the peer and server both authenticate each other by proving possession of a shared password.」同节把字典攻击抗性也列为 RFC 4017 强制项，理由是「The advantage gained by an attacker is through interaction not through computation.」

## broken

§6.1 描述被动攻击者的可见量：「A passive attacker will see Scalar_P, Element_P, Scalar_S, and Element_S.」§6.3 是关键论证：「She is able to make one guess and one guess only per attack.」并说明收益来源——「is solely through interaction with an honest protocol peer.」§6.4 交代前向保密如何成立：即使口令后来泄露，早期运行的随机值不可知，「This is the definition of Forward Secrecy.」§6.5 坦白强度上限来自群的离散对数难度：「The mandatory-to-implement group defined in this memo is group 19」，理由是「This group was chosen because the current best estimate of a symmetric key derived using this group is 128 bits」。

## history

RFC 8146 由 D.Harkins（HP Enterprise）署名，2017 年 4 月发布，Category: Informational，头部写明「Updates: 5931」，即在 RFC 5931 的方法之上补功能。摘要交代缺口：EAP-pwd「it does not include support for salted passwords.」并给出动机——「There are many existing databases of salted passwords, and it is desirable to allow their use with EAP-pwd.」同段还说明原方法已支持的范围：包含原始密钥与「double hashing of a password in the style of Microsoft Challenge Handshake Authentication Protocol version 2 (MSCHAPv2)」这条口令处理路径。

## refs

- Wikipedia search entry for EAP-PWD. https://zh.wikipedia.org/w/index.php?search=EAP-PWD
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**形式模型与复算步骤**

\[\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\]

EAP-PWD的公开参数、密钥/随机数与消息；变量说明：Π 协议，A 敌手，n 会话数，PRF/AEAD 为底层原语。1.把协议消息序列写成状态机。2.用混合论证逐个替换原语。3.把剩余优势归约到 PRF/AEAD 安全。边界：公式只覆盖已登记的参数与假设；参数取值、标准版本和实现细节仍以来源为准。
