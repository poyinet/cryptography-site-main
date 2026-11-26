# CBOR 二进制编码

## principle

**协议**：CBOR 二进制编码（Concise Binary Object Representation）。摘要定义目标：「The Concise Binary Object Representation (CBOR) is a data format whose design goals include the possibility of extremely small code size, fairly small message size, and extensibility without the need for version negotiation.」§1 交代数据模型——「The underlying data model is an extended version of the JSON data model [RFC8259].」§3.1 列出主类型，例如「Major type 0: An unsigned integer in the range 0..2^(64)-1 inclusive.」「Major type 2: A byte string.」「Major type 5: A map of pairs of data items.」§3.2.1 说明终止符性质：「It is not itself a data item: it is just a syntactic feature to close an indefinite-length item.」§3.4 给出扩展机制：「In CBOR, a data item can be enclosed by a tag to give it some additional semantics」。

## why

它针对的是既有格式没满足的目标。§1 承认 IETF 里最知名的通用二进制格式是「In the IETF, probably the best-known formats in the latter category are ASN.1's BER and DER [ASN.1].」§1.1 按重要性递减列出目标：「The representation must be able to unambiguously encode most common data formats used in Internet standards.」「The code for an encoder or decoder must be able to be compact in order to support systems with very limited memory, processor power, and instruction sets.」「Data must be able to be decoded without a schema description.」以及「The format must be extensible, and the extended data must be decodable by earlier decoders.」

## used

同一数据可有多种合法编码，§4.1 说明取舍：「it is desirable that an encoder always chooses a preferred serialization (preferred encoding); however, the present specification does not put the burden of enforcing this preference on either the encoder or decoder.」扩展由注册表管理，§9.2 记录「IANA has created the “Concise Binary Object Representation (CBOR) Tags” registry」。摘要还交代版本策略：「It does not create a new version of the format.」——它与 RFC 7049 的交换格式完全兼容，因此部署里的 CBOR 报文不需要协商版本。

## broken

歧义编码是可被利用的面，因此确定性格式给出三条限制：§4.2.1 要求「Preferred serialization MUST be used.」「Indefinite-length items MUST NOT appear.」以及「The keys in every map MUST be sorted in the bytewise lexicographic order of their deterministic encodings.」§5.3 指出合法但无效的数据项必须交由理解语义的那一层处理：「A well-formed but invalid CBOR data item (Section 1.2) presents a problem with interpreting the data encoded in it in the CBOR data model.」§10 把风险落到解析器：「Complex parsers are well known as a likely source of such vulnerabilities, such as the ability to remotely crash a node, or even remotely execute arbitrary code on it.」并要求解码器假定输入敌对——「A CBOR decoder needs to assume that all input may be hostile even if it has been checked by a firewall, has come over a secure channel such as TLS」。

## history

RFC 8949 署名 C.Bormann（Universität Bremen TZI）与 P.Hoffman（ICANN），2020 年 12 月发布，头部标「STD: 94」与「Obsoletes: 7049」。摘要说明替换的性质：「This document obsoletes RFC 7049, providing editorial improvements, new details, and errata fixes while keeping full compatibility with the interchange format of RFC 7049.」

## refs

- Wikipedia search entry for CBOR 二进制编码. https://zh.wikipedia.org/w/index.php?search=CBOR%20%E4%BA%8C%E8%BF%9B%E5%88%B6%E7%BC%96%E7%A0%81
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/
- RFC 8949: Concise Binary Object Representation. https://www.rfc-editor.org/rfc/rfc8949
- Published standard/RFC for CBOR 二进制编码. https://www.rfc-editor.org/rfc/rfc8949

## example

**形式模型与复算步骤**

\[\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\]

CBOR 二进制编码的公开参数、密钥/随机数与消息；变量说明：Π 协议，A 敌手，n 会话数，PRF/AEAD 为底层原语。1.把协议消息序列写成状态机。2.用混合论证逐个替换原语。3.把剩余优势归约到 PRF/AEAD 安全。边界：公式只覆盖已登记的参数与假设；参数取值、标准版本和实现细节仍以来源为准。
