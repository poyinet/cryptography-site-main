# bcrypt 口令散列

## principle

**算法**：bcrypt 自适应口令散列（bcrypt）。机制本身由第 5 节直接印出：「Bcrypt uses a 128-bit salt and encrypts a 192-bit magic value.」紧接的一句给出它依赖的部件，「It takes advantage of the expensive key setup in eksblow sh.」——注意件里就印作 eksblow sh，连字在抽取时丢了，这里按原字形引用而不改写。

## why

设计理由写在摘要里：论文「show that the computational cost of any secure password scheme must increase as hardware improves」，并在同一段给出两种可调配价的算法；该段把两个算法印在一处，「cost|eksblow sh, a block cipher with a purposefully expensive key schedule, and bcrypt, a related hash function」——注意这里的破折号在件里就印作竖线 |，跨度照原样带上它。

## used

用途与实现位置由论文自己的结构句给出：「Section 5 introduces the variable-cost bcrypt password hashing function and describes our implementation in the OpenBSD operating system」，即这套可变代价的口令散列是随 OpenBSD 实现一起提出的；名称由来在同一节首句里印作「bcrypt, referring to the Blow」后面的加密算法名。

## broken

边界不是被攻破，而是旧方案为何失效，论文把这一点印成一句：「the big aw in UNIX password security is not its openly readable password le.Rather, it is the choice of a hash function that cannot adapt to a 50,000 fold increase in the speed of hardware and software.」件里 aw 与 le 是丢连字后的原字形，跨度照抄；换算法的理由据此成立。

## history

断代证据写在同一行：「At the time of deployment in 1976, crypt could hash fewer than 4 passwords per second.」与「over 200,000 crypt operations per second」——1976 与两端的速率都由件本身印出，因此该条目只谈这份 1999 年论文给出的速率对比，不谈发明者与更早的来历（留存件没有提供）。

**技术参数与复算边界**

该条目的形式模型是 \(C=E_K(P;r),\qquad P=D_K(C)\)。输入：输入：bcrypt 自适应口令散列的公开参数、密钥/随机数与消息；变量说明：P 明文，C 密文，K 密钥，r 随机化参数。 预期输出：按 bcrypt 自适应口令散列 的规范执行后得到可验证的输出或可比较的优势界。 复算必须给出输入、步骤、输出和单位；示例只演示流程，不替代标准测试向量。

复杂度由密钥长度、分组/状态规模、轮数、随机数质量和敌手模型共同决定；参数越界、版本差异与实现侧信道都可能使公式结论失效。已登记限制：该条目只给出形式模型与可复算步骤，不声称已完成生产实现、侧信道认证或第三方安全评估。

**参数与状态规模**

公式 \(C=E_K(P;r),\qquad P=D_K(C)\) 的输入、输出和单位必须逐项登记；复算顺序为：1. 按算法规范编码输入 2. 在密钥控制下执行轮函数 3. 输出密文并检查长度与格式。

状态规模、密钥长度、分组长度和轮数决定复杂度；这些量不能从标题推断，必须以标准或实现文档为准。

**测试向量与实现边界**

标准测试向量只证明某组输入在某个实现中产生了预期输出，不证明所有参数都安全。记录测试向量时至少要写：算法/模式、密钥、明文或消息、随机数/IV、输出长度、实现版本。该条目已登记的限制是：该条目只给出形式模型与可复算步骤，不声称已完成生产实现、侧信道认证或第三方安全评估。

如果实现使用查表、分支或可变时间操作，算法层的证明不能替代侧信道评估；如果协议层没有认证，算法层的机密性也不能阻止替换或重放。

## refs

- Wikipedia search entry for bcrypt 自适应口令散列. https://zh.wikipedia.org/w/index.php?search=bcrypt%20%E8%87%AA%E9%80%82%E5%BA%94%E5%8F%A3%E4%BB%A4%E6%95%A3%E5%88%97
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**形式模型与复算步骤**

\[C=E_K(P;r),\qquad P=D_K(C)\]

bcrypt 自适应口令散列的公开参数、密钥/随机数与消息；变量说明：P 明文，C 密文，K 密钥，r 随机化参数。1.按算法规范编码输入。2.在密钥控制下执行轮函数。3.输出密文并检查长度与格式。边界：公式只覆盖已登记的参数与假设；参数取值、标准版本和实现细节仍以来源为准。
