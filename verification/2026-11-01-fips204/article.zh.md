# 模块格基数字签名标准（FIPS 204）

## principle

**标准**：模块格基数字签名标准（FIPS 204）（Module-Lattice-Based Digital Signature Standard (ML-DSA)）。FIPS 204 的定义句写在摘要里：摘要以「This standard specifies ML-DSA, a set of algorithms that can be used to generate and verify digital signatures.」同段另一句给出后量子定位——「ML-DSA is believed to be secure, even against adversaries in possession of a large-scale quantum computer.」；说明节则把同一对象写成「a lattice-based digital signature algorithm for applications that require a digital signature rather than a written signature.」，标题行则把标准名为「Module-Lattice-Based Digital Signature Standard」；批准口径也给出通用定义——「An algorithm or technique that is either 1) specified in a FIPS or NIST recommendation, 2) adopted in a FIPS or NIST recommendation, or 3) specified in a list of NIST-approved security functions.」

## why

它要解决的问题写在 §1 与 §1.2：许多公钥体制「will be at risk if large-scale quantum computers are ever realized」，包括「key-establishment schemes and digital signatures that are based on integer factorization and discrete logarithms」；本标准的替代件是「the Module-Lattice-Based Digital Signature Algorithm (ML-DSA), which is based on the Module Learning With Errors problem」，并「is believed to be strongly unforgeable」。

## used

用途边界是签名密钥对的专属性：「Agencies are advised that digital signature key pairs shall not be used for other purposes.」与 FIPS 186-5 同一句劝告在此重现，后量子签名沿用同一措辞的专属性提醒，原文同样只写 other purposes。

## broken

限度与配套文本一致：符合标准不保证整体系统安全——「the use of a product containing an implementation that conforms to this standard does not guarantee the security of the overall system in which the product is used.The responsible authority in each agency or department shall ensure that an overall implementation provides an acceptable level of security.」且强制适用不留豁免：「The Federal Information Security Management Act (FISMA) does not allow for waivers to Federal Information Processing Standards (FIPS) that are made mandatory by the Secretary of Commerce.」——强制 FIPS 不留豁免，责任因此落在部署方与验证流程上。

## history

标准身份行是「Announcing the Module-Lattice-Based Digital Signature Standard」，名称与编号在「Module-Lattice-Based Digital Signature Standard (FIPS 204)」一句里给出，类别行为「Computer Security.Subcategory.Cryptography.」它与 FIPS 203、205 同批发布于 2024 年，构成 NIST 后量子三标准的签名一支（同批性在本轮已核证的 R5B 文档集内可比对）。

## refs

- Wikipedia search entry for 模块格基数字签名标准（FIPS 204）. https://zh.wikipedia.org/w/index.php?search=%E6%A8%A1%E5%9D%97%E6%A0%BC%E5%9F%BA%E6%95%B0%E5%AD%97%E7%AD%BE%E5%90%8D%E6%A0%87%E5%87%86%EF%BC%88FIPS%20204%EF%BC%89
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/
- NIST FIPS 204: ML-DSA. https://csrc.nist.gov/pubs/fips/204/final
- Published standard/RFC for 模块格基数字签名标准（FIPS 204）. https://csrc.nist.gov/pubs/fips/204/final

## example

**形式模型与复算步骤**

\[S=\min_i S_i,\quad S_i\in\{\text{密钥强度},\text{分组安全},\text{实现安全}\}\]

模块格基数字签名标准（FIPS 204）的公开参数、密钥/随机数与消息；变量说明：S 为综合安全强度；各分量取最小值，不能只看密钥位数。1.读取标准规定的密钥/分组/模式参数。2.按标准表换算等效强度。3.取最弱分量作为系统强度。边界：公式只覆盖已登记的参数与假设；参数取值、标准版本和实现细节仍以来源为准。
