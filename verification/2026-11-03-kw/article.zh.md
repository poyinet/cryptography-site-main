# 密钥包装 KW/KWP/TKW

## principle

**算法**：KW 密钥包装（Key Wrap）。§5.1 给出结构与密钥命名：「The transformations of the variants of KW feature a block cipher as the main component; thus, each variant is a mode of operation (mode, for short) of the block cipher.The key for the underlying block cipher is called the key encryption key (KEK), denoted K.」§4.1 对完整性校验值的定义说明了为什么包装不是普通加密：「A fixed string that is prepended to the plaintext within the authenticated-encryption function of a key-wrap algorithm, in order to enable the verification of the integrity of the plaintext within the authenticated-decryption function.」

## why

§1 直接写明目的：「The purpose of this part is to provide approved methods for key wrapping, i.e., the protection of cryptographic keys.」保护的对象是密钥本身，而 §3.1 又把适用面扩展开：「Similarly, KW, KWP, and TKW are each approved for the protection of general data, as well as cryptographic keys.」两条合起来给出动机：密钥在存储与传输时需要同时得到机密性与完整性保护，普通加密只给前者。

## used

用法由两句确定：§3.1 说「KW, KWP, and TKW are each approved for the protection of general data, as well as cryptographic keys」，即三种变体都可用于一般数据；§5.1 说「each variant is a mode of operation (mode, for short) of the block cipher」，即实现上以分组密码模式的方式接入。故密钥库、HSM 与密钥分发链路里用 KEK 包装待保护的密钥，KWP 与 TKW 分别覆盖需填充与非 AES 的情形。

## broken

限度写在解密函数的定义里：「A function that decrypts purported ciphertext into corresponding plaintext and verifies the authenticity and, therefore, the integrity of the data.The output is either the plaintext or an indication that the plaintext is not authentic.」即包装方案不提供`尽力解密`：校验失败就不返回明文，攻击者无法借部分解密结果试探；同一节还给出「authenticity」在密钥包装语境下的含义——来源是能持有该 KEK 认证加密实现的实体。

## history

§1 说明它在系列里的位置与年份口径：「This publication is the sixth part in a series of Recommendations regarding the modes of operation of block ciphers.」§3.1 给出与更早规范的接界：「In 2009, a different padding scheme was specified in RFC 5649 [4], referencing elements of the specification in [11].The resulting algorithm, called AES Key Wrap With Padding, is essentially equivalent to KWP as specified in this Recommendation.」即 2002 年的 RFC 3394 与 2009 年的 RFC 5649 先于本份 2012 年建议。

## refs

- Wikipedia search entry for KW 密钥包装. https://zh.wikipedia.org/w/index.php?search=KW%20%E5%AF%86%E9%92%A5%E5%8C%85%E8%A3%85
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**形式模型与复算步骤**

\[C=E_K(P;r),\qquad P=D_K(C)\]

KW 密钥包装的公开参数、密钥/随机数与消息；变量说明：P 明文，C 密文，K 密钥，r 随机化参数。1.按算法规范编码输入。2.在密钥控制下执行轮函数。3.输出密文并检查长度与格式。边界：公式只覆盖已登记的参数与假设；参数取值、标准版本和实现细节仍以来源为准。
