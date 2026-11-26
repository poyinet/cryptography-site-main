# 分组密码工作模式建议

## principle

**标准**：分组密码工作模式建议（Recommendation for Block Cipher Modes of Operation）。SP 800-38A 的摘要列出五种保密模式：「This recommendation defines five confidentiality modes of operation for use with an underlying symmetric key block cipher algorithm: Electronic Codebook (ECB), Cipher Block Chaining (CBC), Cipher Feedback (CFB), Output Feedback (OFB), and Counter (CTR).」——它不定义新算法，只规定算法的使用方式。

## why

目的句只有一句：§1「This publication provides recommendations regarding modes of operation to be used with symmetric key block cipher algorithms.」摘要则说明它给出的五档模式能做什么——「The five modes--the Electronic Codebook (ECB), Cipher Block Chaining (CBC), Cipher Feedback (CFB), Output Feedback (OFB), and Counter (CTR) modes--can provide data confidentiality.」需要多档模式的理由不在本文里另加铺陈，本文件只做这一件事。

## used

使用面是联邦密码模块的验证依据：§2（Authority）里的符合性测试段落写明「Conformance testing for implementations of the modes of operation that are specified in this recommendation will be conducted within the framework of the Cryptographic Module Validation Program (CMVP), a joint effort of the NIST and the Communications Security Establishment of the Government of Canada.」——即选定模式后按本建议校验实现。

## broken

限度一是范围：摘要把可提供的服务限定在 confidentiality 一项，本文件不涉及认证加密模式，也不在此列出后续模式文件。限度二是权威：§2 明确「Nor should this recommendation be interpreted as altering or superseding the existing authorities of the Secretary of Commerce, the Director of the Office of Management and Budget, or any other Federal official.」它不改变既有强制力，也不覆盖国家安全系统。

## history

版本与前置关系：官方引用行为「Natl.Inst.Stand.Technol.Spec.Publ.800-38A 2001 ED, 66 pages (December 2001)」；§2 记下此前已有两份标准管过模式——「FIPS Pub.81 [4] specifies the ECB, CBC, CFB, and OFB modes of the Data Encryption Standard (DES).」以及 FIPS 46-3 对 TDEA 七档模式的规定。本文件并未宣称取代 FIPS 81，它把自己放进既有权威之下。

**技术参数与复算边界**

该条目的形式模型是 \(S=\min_i S_i,\quad S_i\in\{\text{密钥强度},\text{分组安全},\text{实现安全}\}\)。输入：输入：分组密码工作模式建议的公开参数、密钥/随机数与消息；变量说明：S 为综合安全强度；各分量取最小值，不能只看密钥位数。 预期输出：按 分组密码工作模式建议 的规范执行后得到可验证的输出或可比较的优势界。 复算必须给出输入、步骤、输出和单位；示例只演示流程，不替代标准测试向量。

复杂度由密钥长度、分组/状态规模、轮数、随机数质量和敌手模型共同决定；参数越界、版本差异与实现侧信道都可能使公式结论失效。已登记限制：该条目只给出形式模型与可复算步骤，不声称已完成生产实现、侧信道认证或第三方安全评估。

## refs

- Wikipedia search entry for 分组密码工作模式建议. https://zh.wikipedia.org/w/index.php?search=%E5%88%86%E7%BB%84%E5%AF%86%E7%A0%81%E5%B7%A5%E4%BD%9C%E6%A8%A1%E5%BC%8F%E5%BB%BA%E8%AE%AE
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**形式模型与复算步骤**

\[S=\min_i S_i,\quad S_i\in\{\text{密钥强度},\text{分组安全},\text{实现安全}\}\]

分组密码工作模式建议的公开参数、密钥/随机数与消息；变量说明：S 为综合安全强度；各分量取最小值，不能只看密钥位数。1.读取标准规定的密钥/分组/模式参数。2.按标准表换算等效强度。3.取最弱分量作为系统强度。边界：公式只覆盖已登记的参数与假设；参数取值、标准版本和实现细节仍以来源为准。
