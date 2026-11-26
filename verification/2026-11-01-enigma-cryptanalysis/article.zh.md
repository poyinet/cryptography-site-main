# 恩尼格玛破译

## principle

**攻击**：恩尼格玛破译（Enigma Cryptanalysis）。计算机历史博物馆时间线对英国“Bombe”的条目写道：「Built as an electro-mechanical means of decrypting Nazi ENIGMA-based military communications during World War II, the British Bombe is conceived of by computer pioneer Alan Turing and Harold Keen of the British Tabulating Machine Company.Hundreds of allied bombes were built in order to determine the daily rotor start positions of Enigma cipher machines, which in turn allowed the Allies to decrypt German messages.」破译的关键目标是复原每日转子起始位置。

## why

同一时间线条目把方法来源写清楚：「The basic idea for bombes came from Polish code-breaker Marian Rejewski's 1938 "Bomba."」——英国装置是在波兰先行工作之上扩展的。布莱奇利园官方网站的 Enigma 摘要则说明机器本身：「The Enigma machine was invented by a German engineer Arthur Scherbius shortly after WW1.The machine (of which a number of varying types were produced) …」，即机型多样、需按型号处理。

## used

规模是两个来源共同强调的：布莱奇利园页面写明「Nearly 10,000 people worked in the wider Bletchley Park organisation」，其 Bombe 摘要称「These Alan Turing-designed devices changed the course of the Second World War, saving millions of lives in the process」；CHM 条目则给出机器数量与效果：「Hundreds of allied bombes were built … which in turn allowed the Allies to decrypt German messages」。

## broken

这条路径的局限也写在文本里：Bombe 的工作方式是搜索「daily rotor start positions」，即逐日确定转子起始位置；同时布莱奇利园页面是面向公众的导览摘要（站点保存内容为摘要布局，完整叙事文本不在该页），该条目因此只采用其中可核对的句子，不把它当作技术论文的替代。

## history

时间线上的锚点是 1941 年：「The first Bombe is completed」，且波兰 1938 年的 Bomba 提供了基本思想；布莱奇利园自身的介绍页面把图灵列为在该园工作过的最知名破译人员之一，并把整段历史概括为这处园区对盟军胜利至关重要。

**技术参数与复算边界**

该条目的形式模型是 \(\mathrm{Adv}^{\mathrm{attack}}_A(\lambda)=\Pr[\mathrm{Game}_A(\lambda)=1]-\frac12\)。输入：输入：恩尼格玛破译的公开参数、密钥/随机数与消息；变量说明：λ 安全参数；Game 把攻击目标写成挑战-响应游戏。 预期输出：按 恩尼格玛破译 的规范执行后得到可验证的输出或可比较的优势界。 复算必须给出输入、步骤、输出和单位；示例只演示流程，不替代标准测试向量。

复杂度由密钥长度、分组/状态规模、轮数、随机数质量和敌手模型共同决定；参数越界、版本差异与实现侧信道都可能使公式结论失效。已登记限制：该条目只给出形式模型与可复算步骤，不声称已完成生产实现、侧信道认证或第三方安全评估。

## refs

- Wikipedia search entry for 恩尼格玛破译. https://zh.wikipedia.org/w/index.php?search=%E6%81%A9%E5%B0%BC%E6%A0%BC%E7%8E%9B%E7%A0%B4%E8%AF%91
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**形式模型与复算步骤**

\[\mathrm{Adv}^{\mathrm{attack}}_A(\lambda)=\Pr[\mathrm{Game}_A(\lambda)=1]-\frac12\]

恩尼格玛破译的公开参数、密钥/随机数与消息；变量说明：λ 安全参数；Game 把攻击目标写成挑战-响应游戏。1.定义挑战与获胜条件。2.给攻击者 oracle 访问。3.计算优势并与目标界比较。边界：公式只覆盖已登记的参数与假设；参数取值、标准版本和实现细节仍以来源为准。
