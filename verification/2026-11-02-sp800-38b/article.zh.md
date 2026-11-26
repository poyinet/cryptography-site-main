# CMAC 认证模式

## principle

**标准**：CMAC 认证模式（The CMAC Mode for Authentication）。摘要首句给出对象：「This Recommendation specifies a message authentication code (MAC) algorithm based on a symmetric key block cipher.」次句给出用途与产出：「This block cipher-based MAC algorithm, called CMAC, may be used to provide assurance of the authenticity and, hence, the integrity of binary data.」§1 把它安放在系列文件之中：「This publication is the second Part in a series of Recommendations regarding modes of operation of symmetric key block ciphers.」关键词行同样只列认证一面：「KEY WORDS: authentication; block cipher; cryptography; information security; integrity; message authentication code; mode of operation.」本文件规定 MAC 的生成与验证，不规定加密，也不规定密钥如何建立。

## why

缺口是既有构造不可用：§3 写「The basic Cipher Block Chaining MAC algorithm (CBC-MAC) has security deficiencies [9].」并交代替代来源：「The core of the CMAC algorithm is a variation of CBC-MAC that Black and Rogaway proposed and analyzed under the name XCBC in Ref.[2] and submitted to NIST in Ref.[1].」改进链随后两句：「Iwata and Kurosawa proposed an improvement of XCBC and named the resulting algorithm One-Key CBC-MAC (OMAC) in Ref.[6] and in Ref.[5], their initial submission to NIST」与收束的「The OMAC1 variation efficiently reduces the key size of XCBC.CMAC is equivalent to OMAC1.」适用场景另有一句：「CMAC may be appropriate for information systems in which an approved block cipher is more readily available than an approved hash function.」即本文件的理由是补上分组密码侧的认证构造，而不是再造一种散列基 MAC。

## used

义务写在编号章节，措辞分三级。§5.2 的两条 shall 限定底层密码与密钥：「The underlying block cipher shall be approved, and the key shall be generated uniformly at random, or close to uniformly at random, i.e., so that each possible key is (nearly) equally likely to be generated.」与「The key shall be secret and shall be used exclusively for the CMAC mode of the chosen block cipher.」密钥建立只到建议级：「To fulfill the requirements on the key, the key should be established among the parties to the information within an approved key management structure」。碰撞风险归运行系统：「For any system in which CMAC is implemented, the risk that an attacker can detect and exploit a collision shall be limited to a level that is appropriate to the value of the data.」三级措辞因此可分：算法与密钥是硬要求，密钥建立只是建议，把碰撞概率压到与数据价值相称的水准则落在部署一方的工程判断。

## broken

四处限度各自不同层。§2 划出适用边界：「such standards and guidelines shall not apply to national security systems.」§5.2 把密钥工作交出去：「the details of the establishment and management of keys are outside the scope of this Recommendation.」附录 A.1 承认认证保证有上限：「however, this assurance, as for any MAC algorithm, is not absolute.」并把短标签的条件写明：「A value of Tlen that is less than 64 shall only be used in conjunction with a careful analysis of the risks of accepting an inauthentic message as authentic.」附录 C 更直接说明本算法不管重放：「In some protocols an attacker may even be able to present to a verifier a message-MAC pair that the verifier itself generated earlier in the protocol.」即认证有效不等于来源方就是出示者，防重放须由协议另加序号、时间戳或 nonce。

## history

这份文本顶部就是 NIST 的归档横幅：「The attached publication has been archived (withdrawn), and is provided solely for historical purposes.」横幅记下取代关系「The attached publication has been superseded by the following publication(s)」，其后继条目仍是 800-38B 与同一分册标题，作者与日期两行连读为「M.Dworkin Publication Date(s): October 6, 2016」；更新说明为「SP 800-38B is updated by the October 6, 2016 release of 800-38B, which includes editorial changes (as of October 6, 2016).」本体扉页连读为「NIST Special Publication 800-38B Recommendation for Block Cipher Modes of Operation: The CMAC Mode for Authentication Morris Dworkin」，日期行是 May 2005，引用行为「Natl.Inst.Stand.Technol.Spec.Publ.800-38B, 23 pages (May 2005) CODEN: NSPUE2」。本份正文不含免费获取的 DOI 行，横幅给出的标识符为 DOI 10.6028/NIST.SP.800-38B。

## refs

- Wikipedia search entry for CMAC 认证模式. https://zh.wikipedia.org/w/index.php?search=CMAC%20%E8%AE%A4%E8%AF%81%E6%A8%A1%E5%BC%8F
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**形式模型与复算步骤**

\[S=\min_i S_i,\quad S_i\in\{\text{密钥强度},\text{分组安全},\text{实现安全}\}\]

CMAC 认证模式的公开参数、密钥/随机数与消息；变量说明：S 为综合安全强度；各分量取最小值，不能只看密钥位数。1.读取标准规定的密钥/分组/模式参数。2.按标准表换算等效强度。3.取最弱分量作为系统强度。边界：公式只覆盖已登记的参数与假设；参数取值、标准版本和实现细节仍以来源为准。
