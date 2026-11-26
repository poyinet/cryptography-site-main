# 数字签名标准（FIPS 186-5）

## principle

**标准**：数字签名标准（FIPS 186-5）（Digital Signature Standard (FIPS 186-5)）。FIPS 186-5 的任务写在 §1：「This standard defines methods for digital signature generation that can be used for the protection of binary data (commonly called a message) and for the verification and validation of those digital signatures.」并把批准数量固定：「Three techniques are approved.」

## why

三种技术里只有两种引外部规范：§1 记「The RSA digital signature algorithm is specified in the Internet Engineering Task Force Request for Comments (IETF RFC) 8017 [1] and was previously specified in Public Key Cryptography Standard (PKCS) #1 [2]」，并写明批准的是「the use of implementations of either or both of these standards」，另就「key pair generation, as well as additional requirements」作出规定；ECDSA 则写明「The Elliptic Curve Digital Signature Algorithm (ECDSA) is specified in this standard.」——它不是外部规范的采用件；第三种是「The Edwards Curve Digital Signature Algorithm (EdDSA) is specified in IETF RFC 8032」。公告块的说明节（cl.3）还预告可扩展性——「In the future, additional digital signature schemes may be specified and approved in FIPS publications or in NIST Special Publications.」

## used

使用面是联邦系统的签名与验证；对密钥的使用有一句明确劝告：「Agencies are advised that digital signature key pairs shall not be used for other purposes.」原文只写 other purposes、未列举具体用途；这一句在 186-5、204 与 205 的通告文里逐字重复。

## broken

限度写得很直：符合标准不等于系统安全——「the use of a product containing an implementation that conforms to this standard does not guarantee the security of the overall system in which the product is used.The responsible authority in each agency or department shall ensure that an overall implementation provides an acceptable level of security.」合规判断因此留在使用方，而不在文本里。

## history

版本关系与日期写在文首：日期行是「Federal Information Processing Standards Publication 186-5 Published: February 3, 2023」，名称行为「Digital Signature Standard (DSS) (FIPS 186-5)」，公告块说明节一句了结替代关系——「This standard supersedes FIPS 186-4.」§1 同时写下 DSA 的退场：「The Digital Signature Algorithm (DSA) is no longer specified in this standard and may only be used to verify previously generated digital signatures.」

## refs

- Wikipedia search entry for 数字签名标准（FIPS 186-5）. https://zh.wikipedia.org/w/index.php?search=%E6%95%B0%E5%AD%97%E7%AD%BE%E5%90%8D%E6%A0%87%E5%87%86%EF%BC%88FIPS%20186-5%EF%BC%89
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/
- NIST FIPS 186-5: Digital Signature Standard. https://csrc.nist.gov/pubs/fips/186-5/final
- Published standard/RFC for 数字签名标准（FIPS 186-5）. https://csrc.nist.gov/pubs/fips/186-5/final

## example

**形式模型与复算步骤**

\[S=\min_i S_i,\quad S_i\in\{\text{密钥强度},\text{分组安全},\text{实现安全}\}\]

数字签名标准（FIPS 186-5）的公开参数、密钥/随机数与消息；变量说明：S 为综合安全强度；各分量取最小值，不能只看密钥位数。1.读取标准规定的密钥/分组/模式参数。2.按标准表换算等效强度。3.取最弱分量作为系统强度。边界：公式只覆盖已登记的参数与假设；参数取值、标准版本和实现细节仍以来源为准。
