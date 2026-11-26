# FPE 格式保留加密

## principle

**算法**：FPE 格式保留加密（Format-Preserving Encryption）。2016 年版的 SP 800-38G 说明格式保留加密「is designed for data that is not necessarily binary」：给定任意有限符号集（例如十进制数字），把由这些符号组成的数据加密后，密文「has the same format, including the length, as the original data」。文档把符号集称为 alphabet，其字符数为 radix（radix ≥ 2），小于基数的非负整数是 numeral，其有限有序序列是 numeral string。

## why

动机是普通加密会改变数据长度或字符集：文档以九位十进制的社会保险号为例，若密文变长就会超出格式。因此「FPE facilitates the targeting of encryption to sensitive information, as well as the retrofitting of encryption technology to legacy applications」，应用包括金融信息安全、数据净化以及遗留数据库字段的透明加密。

## used

该建议（2016 年 3 月，含 2016 年 8 月 4 日更新）给出 FF1 与 FF3 两种模式，即算法 7 到 10 的加密与解密。§4.3 要求底层分组密码被批准且块长为 128 位：「Currently, the AES block cipher, with key lengths of 128, 192, or 256 bits, is the only block cipher that fits this profile」；§4.5 说明 FF1 使用十轮、FF3 使用八轮；§4.4 与附录 C 强烈建议可变 tweak。

## broken

附录 A 指出输入空间足够小时「encrypted data may be vulnerable to guessing attacks」，并建议 radix 的 minlen 次方一般至少达到一百万以限制猜测，同时要求该值不小于 100「in order to preclude a generic meet-in-the-middle attack on the Feistel structure」。§6 规定 PRF 等组件函数「not approved for use independent of these four functions」；§2 的脚注提醒数据净化「does not necessarily provide strong assurance that individuals cannot be re-identified」。

## history

SP 800-38G 由 Morris Dworkin 撰写，2016 年 3 月发布（含 2016 年 8 月 4 日的页面更新）。§2 记录草案中的 FF2 模式被移除：NIST 收到国家安全局的一般性告知，认为草案中的 FF2「did not provide the expected 128 bits of security strength」，随后宣布删除。

**技术参数与复算边界**

该条目的形式模型是 \(C=E_K(P;r),\qquad P=D_K(C)\)。输入：输入：FPE 格式保留加密的公开参数、密钥/随机数与消息；变量说明：P 明文，C 密文，K 密钥，r 随机化参数。 预期输出：按 FPE 格式保留加密 的规范执行后得到可验证的输出或可比较的优势界。 复算必须给出输入、步骤、输出和单位；示例只演示流程，不替代标准测试向量。

复杂度由密钥长度、分组/状态规模、轮数、随机数质量和敌手模型共同决定；参数越界、版本差异与实现侧信道都可能使公式结论失效。已登记限制：该条目只给出形式模型与可复算步骤，不声称已完成生产实现、侧信道认证或第三方安全评估。

**参数与状态规模**

公式 \(C=E_K(P;r),\qquad P=D_K(C)\) 的输入、输出和单位必须逐项登记；复算顺序为：1. 按算法规范编码输入 2. 在密钥控制下执行轮函数 3. 输出密文并检查长度与格式。

状态规模、密钥长度、分组长度和轮数决定复杂度；这些量不能从标题推断，必须以标准或实现文档为准。

## refs

- Wikipedia search entry for FPE 格式保留加密. https://zh.wikipedia.org/w/index.php?search=FPE%20%E6%A0%BC%E5%BC%8F%E4%BF%9D%E7%95%99%E5%8A%A0%E5%AF%86
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**形式模型与复算步骤**

\[C=E_K(P;r),\qquad P=D_K(C)\]

FPE 格式保留加密的公开参数、密钥/随机数与消息；变量说明：P 明文，C 密文，K 密钥，r 随机化参数。1.按算法规范编码输入。2.在密钥控制下执行轮函数。3.输出密文并检查长度与格式。边界：公式只覆盖已登记的参数与假设；参数取值、标准版本和实现细节仍以来源为准。
