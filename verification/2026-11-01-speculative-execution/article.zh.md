# 推测执行侧信道

## principle

**攻击**：推测执行侧信道（Speculative Execution Side-Channel）。Meltdown 论文摘要给出的机制是：「Meltdown exploits side effects of out-of-order execution on modern processors to read arbitrary kernel-memory locations including personal data and passwords」，并说明「Out-of-order execution is an indispensable performance feature and present in a wide range of modern processors」——性能特性本身的副作用被用作观察通道。

## why

摘要把根因定位在硬件而非软件：「The root cause of Meltdown is the hardware.The attack is independent of the operating system, and it does not rely on any software vulnerabilities.」，因此隔离失效不是某个程序的缺陷；摘要还说明在受影响系统上「Meltdown enables an adversary to read memory of other processes or virtual machines in the cloud without any permissions or privileges」。

## used

该论文同时给出部署结论：「We show that the KAISER defense mechanism for KASLR has the important (but inadvertent) side effect of impeding Meltdown.We stress that KAISER must be deployed immediately…」——即文中所称针对 KASLR 的 KAISER 防御机制顺带阻碍了该攻击，论文的部署结论是 KAISER 必须立即部署。

## broken

摘要对影响面只作有限声明：「The attack works on different Intel microarchitectures since at least 2010 and potentially other processors are affected」——文中点名的是 Intel 微架构，其他厂商只是`可能被影响`的表述；该条目据此不使用超出摘要范围的厂商结论。攻击的成立也依赖可被推测执行的乱序机制，因此无法通过软件漏洞修补，只能靠部署隔离与硬件修正。

## history

arXiv 记录 1801.01207《Meltdown》由 Moritz Lipp、Michael Schwarz、Daniel Gruss、Thomas Prescher、Werner Haas、Stefan Mangard、Paul Kocher、Daniel Genkin、Yuval Yarom 与 Mike Hamburg 撰写，提交于 2018 年 1 月 3 日（星期三），学科标注为 cs.CR；摘要本身即说明这是 2018 年初披露的一类推测执行读取攻击的原始文献记录。

**技术参数与复算边界**

该条目的形式模型是 \(\mathrm{Adv}^{\mathrm{attack}}_A(\lambda)=\Pr[\mathrm{Game}_A(\lambda)=1]-\frac12\)。输入：输入：推测执行侧信道的公开参数、密钥/随机数与消息；变量说明：λ 安全参数；Game 把攻击目标写成挑战-响应游戏。 预期输出：按 推测执行侧信道 的规范执行后得到可验证的输出或可比较的优势界。 复算必须给出输入、步骤、输出和单位；示例只演示流程，不替代标准测试向量。

复杂度由密钥长度、分组/状态规模、轮数、随机数质量和敌手模型共同决定；参数越界、版本差异与实现侧信道都可能使公式结论失效。已登记限制：该条目只给出形式模型与可复算步骤，不声称已完成生产实现、侧信道认证或第三方安全评估。

## refs

- Wikipedia search entry for 推测执行侧信道. https://zh.wikipedia.org/w/index.php?search=%E6%8E%A8%E6%B5%8B%E6%89%A7%E8%A1%8C%E4%BE%A7%E4%BF%A1%E9%81%93
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**形式模型与复算步骤**

\[\mathrm{Adv}^{\mathrm{attack}}_A(\lambda)=\Pr[\mathrm{Game}_A(\lambda)=1]-\frac12\]

推测执行侧信道的公开参数、密钥/随机数与消息；变量说明：λ 安全参数；Game 把攻击目标写成挑战-响应游戏。1.定义挑战与获胜条件。2.给攻击者 oracle 访问。3.计算优势并与目标界比较。边界：公式只覆盖已登记的参数与假设；参数取值、标准版本和实现细节仍以来源为准。
