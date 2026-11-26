// Manually authored RSA prose; not a catalog-wide template.
export const zh={
principle:`RSA 先是一对整数上的模幂运算；保密加密和数字签名还必须各自配上不同的编码、参数与验证规则。本条解释目录实体 algorithm--rsa，限定为两素数 RSA，再说明 OAEP/PSS 怎样使用这些原语。它不替代 RFC 8017 标准条目的详解，也不是可部署的密码服务。

### 消息字节与整数代表

设 n 的位数为 modBits，k=ceil(modBits/8) 是模数字节长度。RSAEP 的输入 m、输出 c 都属于 0…n−1；RSADP 对同样范围的密文代表求逆。0 和与 n 不互素的代表没有被排除。超出范围应报错，不能擅自先取模，让不同输入悄悄变成同一个代表。

用户消息 M 则是字节串。OS2IP 按大端把字节串解释成非负整数；I2OSP(x,len) 输出指定长度的大端字节串，不够时补前导零，x≥256^len 时失败。它们只负责表示转换，不负责保密、填充或认证。00 41 与 41 都表示整数 65，因此长度还须由上层约定。RSAES 密文和 RSASSA 签名使用固定 k 字节，内部编码长度另按具体方案计算。

### 两素数密钥条件

取互不相同的奇素数 p、q，令 n=pq，φ(n)=(p−1)(q−1)，λ(n)=lcm(p−1,q−1)。RFC 8017 的有效公钥条件包括 3≤e<n 与 gcd(e,λ(n))=1；私钥指数满足 0<d<n 和 ed≡1 modλ(n)。d 是 e 关于 λ(n) 的逆元，不是普通分数 1/e。用 φ(n) 求逆也可得到正确指数，因为 λ(n) 整除 φ(n)，但两个模数不能混写。

这些是数学及表示层条件，不是完整的安全密钥生成流程。互异、奇素数、指数互素等条件要验证；现实还涉及随机源、素性验证、参数约束及密钥生命周期。这里不从旧论文或教学数字推导当前部署应选的位数，也不把“能往返”当作安全密钥证明。

### 正确性为什么覆盖非互素代表

写 ed=1+tλ(n)。对 r=p 或 q 分情况：若 r 整除 m，则 m^ed 与 m 都模 r 为0；否则费马小定理给 m^(r−1)≡1，而 r−1 整除 λ(n)，所以 m^ed≡m modr。两种情况都成立。因为 p、q 互素，CRT 保证两者在 0…n−1 中对应唯一整数，因此 (m^e)^d modn=m。

这个证明没有把 m 当成必然可逆元；直接在所有 m 上套欧拉定理会漏掉素因子整除 m 的情形。附带穷举检查全部3233个代表，其中113个与n不互素（包括0）。有限穷举只复核本例，不替代一般证明。

### 直接计算与 CRT

模幂可用重复平方、按指数位选择相乘，并持续模 n 化简，不必先构造巨大的 m^e。私钥也可保存 dP=d mod(p−1)、dQ=d mod(q−1)、qInv=q^(−1) modp。给定 c，计算 m1=c^dP modp、m2=c^dQ modq，h=((m1−m2)qInv) modp，最后 m=m2+qh。

h 取 0…p−1，故 m 落在0…pq−1；它模p等于m1、模q等于m2。qInv 的方向是 q 对 p 的逆，不能把相反的 CRT 约定直接代入。CRT 减小运算模数，确切速度取决于实现，不无条件承诺“固定快四倍”。`,
why:`### 可公开的计算与需要保护的逆运算

知道(n,e)就能做公共方向模幂，掌握正确私钥材料则能做逆运算。这把公开地址与需要保密的能力分开。知道因子p、q可求λ(n)并恢复相应d，因此因子必须保密；但“已有分解即可求逆”不等于“任何RSA求逆算法都等价于分解”。后一个等价关系不能当作已证明的普遍定理。

### 一条清楚的工程分界

整数置换、加密方案、签名方案、证书和协议解决不同问题。OAEP把消息编码后送入加密原语；PSS为签名构造可检查的代表。身份归属还要靠密钥认证与协议上下文。把层次分清，才能解释为何裸RSA的正确性不产生现代保密性，也不自动产生不可伪造的签名结论。`,
used:`### RSAES-OAEP：先编码，再求公共方向模幂

按RFC8017字节约定，给定哈希Hash（输出hLen字节）、MGF及标签L，消息须满足mLen≤k−2hLen−2。先算lHash=Hash(L)，形成DB=lHash || PS || 01 || M，PS为使长度吻合的零字节。生成hLen字节随机seed；用MGF(seed,k−hLen−1)掩码DB，再用MGF(maskedDB,hLen)掩码seed。最终EM=00 || maskedSeed || maskedDB，转成整数后计算c=m^e modn，输出C=I2OSP(c,k)。

MGF1把四字节大端计数器0、1、…附在输入后散列，连接输出并截取所需长度；它是确定的，不是随机数发生器。OAEP随机性来自seed。标签是双方另行约定且须检查哈希的参数，不是额外消息正文。密文仍为k字节，消息容量却扣掉编码开销，不能把任意长文件直接当一段RSA消息。

### RSASSA-PSS：编码可验证的签名代表

PSS不是把OAEP或明文拿来“私钥加密”。令emBits=modBits−1、emLen=ceil(emBits/8)。计算mHash=Hash(M)，选择配置长度sLen的salt，H=Hash(8个零字节 || mHash || salt)。构造DB=PS || 01 || salt，用MGF(H,emLen−hLen−1)掩码，按emBits清除最左多余位，最后EM=maskedDB || H || bc。需有emLen≥hLen+sLen+2。签名原语把OS2IP(EM)变为s，输出k字节S。

验签者同时需要M和S；公共模幂恢复的是编码代表，不是从签名中取回原始消息。它检查签名长度与范围、尾字节、最左限制位、PS与分隔符、salt长度，并重新计算H。只比较末尾哈希或忽略参数不是完整PSS验签。PSS原论文的安全证明有RSA求逆困难性与理想化哈希等前提；标准编码与原论文版本也有差别，不能把证明名称当作任意实现的无条件保证。

### 协议决定具体角色

按2026-10-24核对的TLS1.3规范RFC9846，TLS1.3不使用静态RSA密钥传输，但保留RSA-PSS认证签名。对应PSS方案约束摘要、MGF1摘要和salt长度。所以“不用RSA密钥交换”不能改写成“不使用RSA”。证书链、主机身份、协商参数和握手上下文另需按协议验证；单次RSA验签成功不自动证明某个名字属于某把钥匙。`,
broken:`### 正确且可逆，仍可能没有保密性

裸RSA在固定密钥下是确定的：同一代表总得到同一密文。消息若只有少数已知候选，任何人都可用公钥加密候选后比较。乘法结构又给E(m1)E(m2) modn=E(m1m2 modn)。例子中不知私钥也可把65的密文变成130的密文。这说明可篡改性，不是普遍的免费解密算法；经过OAEP后，不能把等式直接解释成用户消息也这样相乘。

### 不能把全部风险归结为分解n

重复或不合条件的素因子、错误指数条件、私钥泄漏、弱随机源、错误编码检查都可能破坏系统。小指数若直接作用于未预处理的小消息，还可能在未模回绕时暴露普通整数幂。某个e的名字不是单独安全开关，分解困难也不能修复这些方案和实现错误。

### 错误反馈可能变成信息

OAEP解码须检查长度、范围、前导字节、标签哈希及DB结构。不同失败原因若经响应或时间被区分，就可能给选择密文攻击提供信息。PKCS#1v1.5加密与PSS签名不是同一方案，不能因为共享PKCS#1名称就共用解析规则。Shoup的研究区分一般陷门置换的OAEP与具有特殊代数结构的RSA-OAEP；早期一般证明的缺口不是“已证明RSA-OAEP不安全”。

### 数学之外：侧信道与故障

Kocher的计时研究表明，某些实现的私钥运算时间会泄漏秘密相关信息。私钥运算不能直接照搬教学用变时BigInt循环；加盲、与秘密无关的执行路径等防护需要专门设计，也不意味着所有物理泄漏自动消失。

CRT还有故障边界：若输出在一个素数分支正确、另一个分支出错，错误结果可与公开关系一起暴露因子。Boneh、DeMillo、Lipton研究了某些CRT-RSA实现的这种故障攻击。错误输出检查与故障防护是实现责任；正常正确性证明不保证错误计算也安全。本文程序只处理公开玩具数和公开向量，不承担密钥保管、恒时或故障安全服务。`,
history:`Rivest、Shamir、Adleman的原始论文《A Method for Obtaining Digital Signatures and Public-Key Cryptosystems》发表于1978年的Communications of the ACM。它展示模幂方法、公私钥关系与签名设想。原文关于难以伪造、参数或计算能力的安全口吻属于当时语境，不能直接当作今天的保证；OAEP、PSS及后来协议的编码要求须分别阅读规范。

Bellare与Rogaway的1996年PSS论文研究精确签名安全性。Shoup的2001年修订研究提醒我们，证明依赖具体假设与构造。RFC8017在2016年重新发布PKCS#1v2.2并取代RFC3447，类别是Informational，不能把RFC三个字自动当作Internet Standard。

本轮重新核对TLS文档状态：RFC9846于2026年7月发布并明确取代RFC8446。本稿用它说明RSA在TLS1.3里的角色，同时保留核查日期。协议文档状态、算法有效条件和具体产品可用性是不同问题。`,
example:`### 完整的公开玩具例

取p=61、q=53，则n=3233、φ(n)=3120、λ(n)=lcm(60,52)=780。令e=17、d=2753：17×2753=46801=60×780+1=15×3120+1。固定d是为了复算；d≡413 mod780说明逆元有同余表示，并非现实选参建议。

对m=65，重复平方得到65²、65⁴、65⁸、65¹⁶模3233分别为992、1232、1547、789；再乘65得到c=2790。直接求2790^2753 mod3233=65。

CRT参数dP=53、dQ=49、qInv=38，因为53×38 mod61=1。c=2790对应m1=4、m2=12；h=((4−12)×38) mod61=1，故m=12+53=65。与n不互素的m=61也仍有61^17 mod3233=610、610^2753 mod3233=61。verify.mjs对全部0…3232比较往返与CRT/直接结果，而不只测这两个值。

### 两个可亲手推翻的误解

字节转换不是方案：I2OSP(65,2)=00 41，OS2IP(00 41)=65；I2OSP(65536,2)须失败。n=3233只有k=2字节，放不下常见OAEP哈希的开销，所以玩具例不运行真实消息编码方案。

裸RSA可被代数变换：E(65)=2790，E(2)=1752，两者相乘模3233得3017，恢复成130，而非65。再次加密65仍是2790。两者分别展示可篡改性与确定性，不是安全功能。

### 独立发布的编码向量

RSA Laboratories 2000年OAEP文档附录C给出固定消息d436…2c49、固定seed aafd…b58f。本批逐字节比较两段MGF1掩码、maskedDB、maskedSeed、编码代表及最终公共模幂密文。旧文把EM写成k−1字节，脚本显式补上RFC8017的00前缀；前导零不改变整数。向量里的SHA-1与1024位模数是历史互操作样本，不是当前部署建议。

NIST ACVP-Server固定提交的PSS/SHA3-256第25组又给出1个应通过、5个应拒绝的公钥/消息/签名样本。对通过样本，用给定salt重算EMSA-PSS，比较签名经公共模幂恢复的EM，再由Node/OpenSSL独立验签。它是通用PSS算子测试，不是前述TLS配置。已知答案一致不等于CAVP认证，也不证明所有输入、侧信道或故障安全。`
};
export const en={
principle:`RSA begins with paired modular-exponentiation operations on integers. Encryption and signatures need different encodings, parameters and validation rules on top. This article covers algorithm--rsa, restricted to two-prime RSA, then explains its use by OAEP and PSS. It does not complete the RFC 8017 catalog entry or provide a deployable cryptographic service.

### Octet strings and integer representatives

Let modBits be n's bit length and k=ceil(modBits/8) its octet length. RSAEP accepts m and returns c in 0…n−1; RSADP inverts ciphertext representatives in that range. Zero and representatives sharing a factor with n are not excluded. An out-of-range value is an error: silently reducing it would alias distinct supplied inputs.

The user message M is an octet string. OS2IP interprets it as a nonnegative big-endian integer. I2OSP(x, len) returns exactly len big-endian octets, including leading zeroes, and fails if x≥256^len. These are representation conversions, not confidentiality, padding or authentication. Both 00 41 and 41 represent 65, so a separate length convention matters. RSAES ciphertexts and RSASSA signatures use k octets; internal encoded-message lengths depend on the scheme.

### Conditions on a two-prime key

Take distinct odd primes p, q, set n=pq, φ(n)=(p−1)(q−1) and λ(n)=lcm(p−1, q−1). RFC 8017 requires 3≤e<n and gcd(e,λ(n))=1, with private exponent 0<d<n satisfying ed≡1 modulo λ(n). This inverse is modular, not the fraction 1/e. Inversion modulo φ(n) also supplies a correct exponent because λ(n) divides φ(n), but the moduli should not be conflated.

These arithmetic and representation conditions are not a complete secure key-generation procedure. Distinctness, primality and exponent coprimality need checking; real generation also involves randomness, prime testing, parameter constraints and key lifecycle. Neither historical size suggestions nor successful round trips establish secure deployment parameters.

### Correctness includes non-coprime representatives

Write ed=1+t λ(n). For r=p or q, split the argument. If r divides m, both m^ed and m are zero modulo r. Otherwise Fermat's theorem gives m^(r−1)≡1; since r−1 divides λ(n), m^ed≡m modulo r. Coprimality of p, q lets CRT give a unique corresponding integer in 0…n−1, hence (m^e)^d modn=m.

This never assumes every message is invertible. Applying Euler's theorem indiscriminately would miss multiples of a prime factor. The program exhausts all 3233 representatives, including 113 non-coprime ones counting zero. This checks the finite example, not the general theorem.

### Direct exponentiation and CRT

Repeated squaring evaluates modular powers while reducing intermediate values, without constructing the full unreduced power. A private representation can store dP=d mod(p−1), dQ=d mod(q−1), qInv=q^(−1) modp. Compute m1=c^dP modp, m2=c^dQ modq, then h=((m1−m2)qInv) modp and m=m2+qh.

With h in 0…p−1, m is in 0…pq−1 and has the required residues. Here qInv is q's inverse modulo p; another CRT convention must be transformed before these equations are used. Smaller moduli can accelerate operations, but no fixed fourfold speedup is universally guaranteed.`,
why:`### A public computation and a protected inverse

Anyone knowing(n, e) can compute the public-direction power, while correct private material enables inversion. Knowing p, q yields λ(n) and an appropriate d, so the factors must remain secret. This implication does not prove that every RSA inversion algorithm is equivalent to factoring. The latter must not be presented as a general established theorem.

### An engineering boundary

An integer permutation, encryption scheme, signature scheme, certificate and protocol solve different problems. OAEP encodes before encryption; PSS builds a checkable signature representative. Binding an identity to a key needs authentication and protocol context. Raw RSA correctness therefore yields neither modern confidentiality nor an unforgeability guarantee.`,
used:`### RSAES-OAEP: encoding before the public-direction power

In RFC 8017's convention choose Hash with hLen-octet output, an MGF and label L. Require mLen≤k−2hLen−2. Form lHash=Hash(L) and DB=lHash || PS ||01|| M, with zero padding PS. Generate an hLen-octet random seed; mask DB using MGF(seed, k−hLen−1), then seed using MGF(maskedDB, hLen). Set EM=00||maskedSeed||maskedDB, convert it to m, compute c=m^e modn, and output C=I2OSP(c, k).

MGF1 hashes its input followed by four-octet big-endian counters 0,1,…, concatenates outputs and truncates. It is deterministic, not an RNG; the OAEP seed supplies randomness. L is a separately agreed, hash-checked parameter rather than extra message content. The ciphertext has k octets but the message loses capacity to encoding overhead; arbitrary files are not single RSA messages.

### RSASSA-PSS: encoding a verifiable signature representative

PSS is not OAEP or plaintext “encrypted with the private key”. Set emBits=modBits−1 and emLen=ceil(emBits/8). Hash M to mHash, use an sLen-octet salt and compute H=Hash(eight zero octets||mHash||salt). Form DB=PS||01||salt, mask with MGF(H, emLen−hLen−1), clear the excess high bits, and set EM=maskedDB||H||bc. Require emLen≥hLen+sLen+2. The private primitive maps OS2IP(EM) to s, serialized as k-octet S.

Verification needs M as well as S. The public power recovers an encoded representative, not the original message from the signature. Signature length/range, trailer, high bits, padding, delimiter, salt length and recomputed H all matter. Merely checking a trailing digest or ignoring parameters is not PSS verification. Original PSS security arguments assume RSA inversion hardness and idealized hashes; standardized encoding differs from the original. A proof name is no unconditional guarantee for arbitrary implementations.

### The protocol determines the role

TLS 1.3's specification checked on 2026-10-24, RFC 9846, excludes static RSA key transport while retaining RSA-PSS authentication. The corresponding PSS schemes constrain the digest, MGF1 digest and salt length. Thus “no RSA key exchange” does not mean “no RSA”. Certificate paths, host identity, negotiated parameters and handshake context need their own protocol checks; a valid RSA signature alone does not bind a name to a key.`,
broken:`### Reversibility is not confidentiality

Raw RSA is deterministic for a fixed key. For a small set of candidate messages, anyone can encrypt each publicly and compare. Also E(m1)E(m2) modn=E(m1m2 modn). The example changes a ciphertext of 65 into one of 130 without the private key. This is malleability, not a general free-decryption algorithm. With OAEP, the equation cannot simply be interpreted as multiplication of user messages.

### Failure need not require factoring

Repeated or invalid prime factors, invalid exponent conditions, key exposure, poor randomness and incorrect encoding checks can break a system. A small public exponent applied directly to a small unprocessed message can expose an ordinary integer power before modular wraparound. No exponent name alone is a security switch; hard factoring cannot repair scheme or implementation mistakes.

### Error behaviour can disclose information

OAEP decoding checks length, range, leading octet, label hash and DB structure. Distinguishable responses or timing for different failures can provide chosen-ciphertext information. PKCS #1v1.5 encryption and PSS signatures are different schemes despite their common PKCS #1 label. Shoup distinguishes general trapdoor-permutation OAEP from RSA-OAEP's special algebraic case: a gap in an early general proof is not proof of RSA-OAEP insecurity.

### Beyond the equation: side channels and faults

Kocher's timing research shows secret-related leakage from some private-operation implementations. A variable-time teaching BigInt loop is not private-key implementation code. Blinding and secret-independent execution paths need dedicated design; neither implies that all physical leakage disappears.

CRT also adds a fault boundary. An output correct modulo one prime and wrong modulo the other can reveal a factor through a public algebraic relation. Boneh, DeMillo and Lipton studied this for certain CRT-RSA implementations. Output checking and fault resistance are implementation duties; a normal-operation correctness proof does not secure incorrect calculations. This batch processes only public toy numbers and public fixtures, without key-custody, constant-time or fault-resistant service claims.`,
history:`Rivest, Shamir and Adleman's original paper, A Method for Obtaining Digital Signatures and Public-Key Cryptosystems, appeared in Communications of the ACM in 1978. It presents modular exponentiation, key relations and a signature proposal. Its discussion of forgery, parameters and computing resources belongs to its research era and cannot simply become present-day guarantees. OAEP, PSS and later protocol encodings require separate specifications.

Bellare and Rogaway's 1996 PSS paper studies exact signature security. Shoup's revised 2001 analysis illustrates the importance of a proof's assumptions and construction. RFC 8017 republished PKCS #1 v2.2 in 2016 and obsoleted RFC 3447. It is Informational; an RFC label does not automatically mean Internet Standard.

This review rechecked TLS status: RFC 9846 appeared in July 2026 and explicitly obsoletes RFC 8446. It is used here for RSA's TLS 1.3 role, with the checking date retained. Protocol-document status, algorithm validity and availability in a particular product remain separate matters.`,
example:`### A complete public toy example

Use p=61, q=53, giving n=3233,φ(n)=3120,λ(n)=lcm(60,52)=780. Set e=17, d=2753:17×2753=46801=60×780+1=15×3120+1. The fixed d supports reproduction, not deployment; d≡413 modulo 780 illustrates congruent inverse representatives.

For m=65, repeated squares 65²,65⁴,65⁸,65¹⁶ give residues 992,1232,1547,789 modulo 3233. Multiplying the last by 65 yields c=2790. Direct exponentiation gives 2790^2753 mod 3233=65.

CRT uses dP=53, dQ=49, qInv=38 since 53×38 mod 61=1. At c=2790, m1=4, m2=12 and h=((4−12)×38) mod 61=1, giving m=12+53=65. The non-coprime m=61 also works:61^17 mod 3233=610 and 610^2753 mod 3233=61. verify.mjs compares round trips and direct/CRT results for every representative 0…3232, not just these two cases.

### Two misconceptions to falsify by hand

Conversion is not a scheme: I2OSP(65,2)=00 41, OS2IP(00 41)=65, and I2OSP(65536,2) must fail. This n has only k=2 octets, insufficient for common OAEP hash overhead, so the toy does not run practical message-encoding schemes.

Raw ciphertexts can be changed algebraically: E(65)=2790, E(2)=1752; their product modulo 3233 is 3017, decrypting to 130 rather than 65. Encrypting 65 again still gives 2790. These demonstrate malleability and determinism, not security features.

### Independently published encoding vectors

Appendix C of RSA Laboratories' 2000 OAEP document gives fixed message d436…2c49 and seed aafd…b58f. This batch compares both MGF1 masks, maskedDB, maskedSeed, the encoded representative and public-power ciphertext byte for byte. The historical document uses a k−1-octet EM; the script explicitly adds RFC 8017's leading 00, which does not change the integer. SHA-1 and the 1024-bit modulus are historical interoperability fixtures, not deployment advice.

A pinned NIST ACVP-Server commit supplies PSS/SHA3-256 group 25: one expected pass and five expected rejects, with complete public keys, messages and signatures. The supplied salt reproduces EMSA-PSS for the passing case and matches the EM recovered by public exponentiation. Node/OpenSSL separately verifies all cases. This is a generic PSS test, not the preceding TLS profile. Known-answer agreement is neither CAVP certification nor proof of all-input correctness, side-channel resistance or fault security.`
};
