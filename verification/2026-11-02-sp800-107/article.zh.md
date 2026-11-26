# 批准哈希算法的使用建议（SP 800-107）

## principle

**标准**：批准哈希算法的使用建议（SP 800-107）（Recommendation for Applications Using Approved Hash Algorithms (SP 800-107 Rev.摘要交代它管什么：「This document provides security guidelines for achieving the required or desired security strengths when using cryptographic applications that employ the approved hash functions specified in Federal Information Processing Standard (FIPS) 180-4.」受影响的用法随即列出：「These include functions such as digital signatures, Keyed-hash Message Authentication Codes (HMACs) and Hash-based Key Derivation Functions (Hash-based KDFs).」它规定的是强度匹配，不规定哈希算法本身。引文的对象是强度而非算法本身：函数由 FIPS 180-4 指定，这份文件处理的是这些用法在达到所需强度时应当怎样取值与取舍。

## why

出发点是最基本的那一步：「A hash algorithm is used to map a message of arbitrary length to a fixed-length message digest.」风险在于强度的错觉，§4.2 给出一般规律：「the expected collision resistance strength of any approved hash function is, in general, half the length of its hash value.」并记下已被攻破的例外：「The latest cryptanalytic results for SHA-1 [SHA1 Attack] indicate that it may have a collision resistance strength that is considerably less than its expected strength of 80 bits.」三段连读即是理由：把任意长消息压成固定摘要本身不是问题，把摘要长度当作强度才是；一般规律是碰撞抗性为摘要长之一半，而文件对冲着说 SHA-1 的实测结果可能远低于其 80 位期望强度（原文 indicate that it may have），并未把它写成已经确认的事实。

## used

§5.3.2 是给实现者的硬性要求，三条连读即可：「An HMAC key shall have a security strength that meets or exceeds the security strength required to protect the data over which the HMAC is computed.」「The HMAC key shall be kept secret.」以及「HMAC keys shall be generated as specified in SP 800-133 [SP 800-133].」三条都是 shall 级：强度须不低于所保护数据的要求，密钥须保密，生成方法则交由另一份文件规定，密钥生成本身不在本文件内给出。

## broken

§2 的符合性段承认有些要求验证程序覆盖不到：「Some of these requirements may be out-of-scope for CAVP and CMVP validation testing, and thus are the responsibility of entities using, implementing, installing, or configuring applications that incorporate this Recommendation.」§1 又划出两份 KDF 文件不在讨论之列：「these documents sufficiently address the security aspects of their use, so discussions of SP 800-56C and SP 800-108 are not included herein.」§5.2 对 SHA-1 设了有时效的限制：「SHA-1 shall not be used in any new digital signature applications that require at least 80 bits of security strength.」三处限制的层次不同：验证程序覆盖不到的要求由使用与配置方负责，两类 KDF 文件被明确排除在讨论之外，对 SHA-1 的禁止按用途与强度门槛起算。

## history

扉页按本份文本自陈为「NIST Special Publication 800-107」的 Revision 1，标题行是「Recommendation for Applications Using Approved Hash Algorithms」，作者与部门两行连读为「Quynh Dang Computer Security Division Information Technology Laboratory」；题页标签按行序再连读即得日期「Information Technology Laboratory COMPUTER SECURITY August 2012」，也就是这份副本标注 2012 年 8 月，且不含 DOI 行。致谢页给出单作者与咨询者名单：「The author, Quynh Dang of the National Institute of Standards and Technology (NIST) gratefully appreciates the contributions and comments from Elaine Barker, William E.Burr, Shu-jen Chang, Lily Chen, Donna F.Dodson, Morris Dworkin, John Kelsey, Ray Perlner, W.Timothy Polk and Andrew Regenscheid.」附录 B 记下初版时间与本次修订内容：「The original version of this document was published in February 2009.」其条目之一为「Adding and addressing the security properties of SHA-512/224 and SHA-512/256.」

## refs

- Wikipedia search entry for 批准哈希算法的使用建议（SP 800-107）. https://zh.wikipedia.org/w/index.php?search=%E6%89%B9%E5%87%86%E5%93%88%E5%B8%8C%E7%AE%97%E6%B3%95%E7%9A%84%E4%BD%BF%E7%94%A8%E5%BB%BA%E8%AE%AE%EF%BC%88SP%20800-107%EF%BC%89
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**形式模型与复算步骤**

\[S=\min_i S_i,\quad S_i\in\{\text{密钥强度},\text{分组安全},\text{实现安全}\}\]

批准哈希算法的使用建议（SP 800-107）的公开参数、密钥/随机数与消息；变量说明：S 为综合安全强度；各分量取最小值，不能只看密钥位数。1.读取标准规定的密钥/分组/模式参数。2.按标准表换算等效强度。3.取最弱分量作为系统强度。边界：公式只覆盖已登记的参数与假设；参数取值、标准版本和实现细节仍以来源为准。
