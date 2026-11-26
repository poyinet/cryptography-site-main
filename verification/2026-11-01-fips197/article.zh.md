# 高级加密标准（FIPS 197）

## principle

**标准**：高级加密标准（FIPS 197）（Advanced Encryption Standard (FIPS 197)）。FIPS 197 的说明节一句话定性：「The Advanced Encryption Standard (AES) … a FIPS-approved cryptographic algorithm that can be used to protect electronic data」并补充「The AES algorithm is a symmetric block cipher that can encrypt (encipher) and decrypt (decipher) digital information.」参数被钉死在块长与密钥长上：「The AES algorithm is capable of using cryptographic keys of 128, 192, and 256 bits to encrypt and decrypt data in blocks of 128 bits.」

## why

标准的由来写在摘要里：「In 2000, NIST announced the selection of the Rijndael block cipher family as the winner of the Advanced Encryption Standard (AES) competition.」——这是一次公开竞赛的结果，而不是内部指定；摘要还说明分组密码是很多密码服务的基础。

## used

结构层面的口径很窄：§3.5 定义字与块——「A word is a sequence of four bytes; a block consists of four words.」实现义务则是「An implementation of the AES algorithm shall support at least one of the three key lengths … 128, 192, or 256 bits (i.e., Nk = 4, 6, or 8, respectively).」，其余档位只是可选项：「Implementations may optionally support two or three key lengths, which may promote the interoperability of algorithm implementations.」

## broken

FIPS 197 只管算法本体：§8 实现注意要求「The algorithm shall be used in conjunction with a FIPS-approved or NIST-recommended mode of operation.」，模式与工作方式是另一批文件；§6.3 把本版取值写死——「the allowed values for the key length (Nk), block size (Nb), and number of rounds (Nr)」——但同段立刻留了口子：「However, future revisions of this Standard could include changes or additions to the allowed values for those parameters.」封闭的是本版参数集，不是未来版本。

## history

版本史与身份在文首：文档名为「Advanced Encryption Standard (AES) (FIPS 197)」，类别行是「Computer Security Standard, Cryptography」，批准权属写明「4.Approving Authority.Secretary of Commerce.」，维护机构为 NIST 的信息技术实验室；本轮所读即 2023 年更新的 upd1 版本，摘要仍把入选时间记为 2000 年；文件末尾的修订说明写明这是一次编辑性更新：原 197 号经 NIST 加密出版物评审委员会复审，公开意见与 NIST IR 8319 所描述的 AES 安全性分析构成`保持技术规定不变`这一决定的依据。

## refs

- Wikipedia search entry for 高级加密标准（FIPS 197）. https://zh.wikipedia.org/w/index.php?search=%E9%AB%98%E7%BA%A7%E5%8A%A0%E5%AF%86%E6%A0%87%E5%87%86%EF%BC%88FIPS%20197%EF%BC%89
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/
- NIST FIPS 197: Advanced Encryption Standard (AES). https://csrc.nist.gov/pubs/fips/197/final
- Published standard/RFC for 高级加密标准（FIPS 197）. https://csrc.nist.gov/pubs/fips/197/final

## example

**形式模型与复算步骤**

\[S=\min_i S_i,\quad S_i\in\{\text{密钥强度},\text{分组安全},\text{实现安全}\}\]

高级加密标准（FIPS 197）的公开参数、密钥/随机数与消息；变量说明：S 为综合安全强度；各分量取最小值，不能只看密钥位数。1.读取标准规定的密钥/分组/模式参数。2.按标准表换算等效强度。3.取最弱分量作为系统强度。边界：公式只覆盖已登记的参数与假设；参数取值、标准版本和实现细节仍以来源为准。
