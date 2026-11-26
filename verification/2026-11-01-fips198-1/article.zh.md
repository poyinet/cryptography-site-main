# 键控散列消息认证码（FIPS 198-1）

## principle

**标准**：键控散列消息认证码（FIPS 198-1）（The Keyed-Hash Message Authentication Code (HMAC)）。摘要给出对象定义：「This Standard describes a keyed-hash message authentication code (HMAC), a mechanism for message authentication using cryptographic hash functions.」摘要再补一句用途条件——「HMAC can be used with any iterative Approved cryptographic hash function, in combination with a shared secret key.」

## why

为什么要 MAC 构造：标准把目标写成「The purpose of a MAC is to authenticate both the source of a message and its integrity without the use of any additional mechanisms.」并说明 HMAC 的两个参数彼此功能独立——「HMACs have two functionally distinct parameters, a message input and a secret key known only to the message originator and intended receiver(s).」

## used

使用形态按发送方计算、随消息送出：「An HMAC function is used by the message sender to produce a value (the MAC) that is formed by condensing the secret key and the message input.」标准还点名另一类用法——「Additional applications of keyed-hash functions include their use in challenge-response identification protocols for computing responses, which are a function of both a secret key and a challenge message.」

## broken

边界来自联邦口径：适用范围只到「This Standard is applicable to all Federal departments and agencies for the protection of sensitive unclassified information that is not subject to Title 10 United States Code Section 2315 (10 USC 2315) and that is not within a national security system as defined in Title 44 United States Code Section 3502(2) (44 USC 3502(2)).」同段另一句又把采用面放大：「The adoption and use of this Standard is available to private and commercial organizations.」，实现还须只用已批准件——§9「HMAC implementations that comply with this Standard shall employ cryptographic algorithms, cryptographic key generation algorithms and key management techniques that have been approved for protecting Federal government sensitive information.」密钥只有发信方与预期收信方知道，这既是特性也是运维负担。

## history

版本与身份写在文首：名称行「The Keyed-Hash Message Authentication Code (HMAC) (FIPS PUB 198-1)」，日期行为 2008 年 7 月，类别为「Computer Security Standard.Subcategory.Cryptography.」关键词栏列出「computer security, cryptography, HMAC, MAC, message authentication, Federal Information Processing Standards (FIPS)」；本标准是 198 号的修订版，编号 -1 即其身份标记。§9 把批准功能清单指向「the list of Approved security functions for FIPS 140-2」，说明它的批准口径仍锚定在 FIPS 140-2 一代，而本语料库中的 FIPS 140-3 已宣告完全取代 140-2。

## refs

- Wikipedia search entry for 键控散列消息认证码（FIPS 198-1）. https://zh.wikipedia.org/w/index.php?search=%E9%94%AE%E6%8E%A7%E6%95%A3%E5%88%97%E6%B6%88%E6%81%AF%E8%AE%A4%E8%AF%81%E7%A0%81%EF%BC%88FIPS%20198-1%EF%BC%89
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/
- NIST FIPS 198-1: The Keyed-Hash Message Authentication Code. https://csrc.nist.gov/pubs/fips/198-1/final
- Published standard/RFC for 键控散列消息认证码（FIPS 198-1）. https://csrc.nist.gov/pubs/fips/198-1/final

## example

**形式模型与复算步骤**

\[S=\min_i S_i,\quad S_i\in\{\text{密钥强度},\text{分组安全},\text{实现安全}\}\]

键控散列消息认证码（FIPS 198-1）的公开参数、密钥/随机数与消息；变量说明：S 为综合安全强度；各分量取最小值，不能只看密钥位数。1.读取标准规定的密钥/分组/模式参数。2.按标准表换算等效强度。3.取最弱分量作为系统强度。边界：公式只覆盖已登记的参数与假设；参数取值、标准版本和实现细节仍以来源为准。
