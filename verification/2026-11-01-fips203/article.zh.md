# 模块格基密钥封装机制标准（FIPS 203）

## principle

**标准**：模块格基密钥封装机制标准（FIPS 203）（Module-Lattice-Based Key-Encapsulation Mechanism Standard (ML-KEM)）。FIPS 203 自述机制类别：「This standard specifies a set of algorithms for establishing a shared secret key.While there are many methods for establishing a shared secret key, the particular method described in this standard is a key-encapsulation mechanism (KEM).」——它规定的是 KEM 这一类协商方式，而非通用密钥管理。

## why

参数化是为权衡而设：§1.1 写「This standard specifies three parameter sets for ML-KEM that offer different trade-offs in security strength versus performance.」摘要同时给出安全前提与批准范围——「At present, ML-KEM is believed to be secure, even against adversaries who possess a quantum computer.」以及「All three parameter sets of ML-KEM are approved to protect sensitive, non-classified communication systems of the U.S.Federal Government.」

## used

标准名与类别就是它的用途声明写在适用范围：「This standard, or other FIPS or NIST Special Publications that specify alternative mechanisms, shall be used wherever the establishment of a shared secret key … is required for federal applications」。标准名与类别即「Module-Lattice-Based Key-Encapsulation Mechanism Standard (FIPS 203)」与「Computer Security.Subcategory.Cryptography.」。

## broken

两处限度：其一，符合标准不等于系统安全，正文写「the use of a product containing an implementation that conforms to this standard does not guarantee the security of the overall system in which the product is used.」；其二，KEM 的安全保证有条件——「the security guarantees of a KEM only hold under certain conditions」，且豁免空间被关掉——「The Federal Information Security Management Act (FISMA) does not allow for waivers to Federal Information Processing Standards (FIPS) that are made mandatory by the Secretary of Commerce.」

## history

身份与法源在文首成套出现：「Announcing the Module-Lattice-Based Key-Encapsulation Mechanism Standard」为标题行，制定依据写「Federal Information Processing Standards (FIPS) publications are developed by the National Institute of Standards and Technology (NIST) under 15 U.S.C.278g-3 and issued by the Secretary of Commerce under 40 U.S.C.11331.」这是 NIST 后量子标准化产出的 FIPS 之一；本文件自身只在参考文献里列出 CRYSTALS-Kyber 提交件，候选到标准的沿革由 R4 轮的算法与事件条目承载，本文只报文档自身的表述。

## refs

- Wikipedia search entry for 模块格基密钥封装机制标准（FIPS 203）. https://zh.wikipedia.org/w/index.php?search=%E6%A8%A1%E5%9D%97%E6%A0%BC%E5%9F%BA%E5%AF%86%E9%92%A5%E5%B0%81%E8%A3%85%E6%9C%BA%E5%88%B6%E6%A0%87%E5%87%86%EF%BC%88FIPS%20203%EF%BC%89
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/
- NIST FIPS 203: ML-KEM. https://csrc.nist.gov/pubs/fips/203/final
- Published standard/RFC for 模块格基密钥封装机制标准（FIPS 203）. https://csrc.nist.gov/pubs/fips/203/final

## example

**形式模型与复算步骤**

\[S=\min_i S_i,\quad S_i\in\{\text{密钥强度},\text{分组安全},\text{实现安全}\}\]

模块格基密钥封装机制标准（FIPS 203）的公开参数、密钥/随机数与消息；变量说明：S 为综合安全强度；各分量取最小值，不能只看密钥位数。1.读取标准规定的密钥/分组/模式参数。2.按标准表换算等效强度。3.取最弱分量作为系统强度。边界：公式只覆盖已登记的参数与假设；参数取值、标准版本和实现细节仍以来源为准。
