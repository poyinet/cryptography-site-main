# 洛伦兹破译

## principle

**攻击**：洛伦兹破译（Lorenz Cryptanalysis）。计算机历史博物馆时间线的 1944 年条目写明对象与装置：「First Colossus operational at Bletchley Park … Designed by British engineer Tommy Flowers, the Colossus is designed to break the complex Lorenz ciphers used by the Nazis during World War II.」即洛伦兹密文的破译由 Colossus 这一电子设备承担。

## why

同一条目给出速度与规模的理由：「Colossus reduced the time to break Lorenz messages from weeks to hours」，并说明「A total of ten Colossi were delivered, each using as many as 2,500 vacuum tubes」——把破译时间从数周降到数小时，靠的是这类专用电子设备与大量真空管。

## used

其用途与评价写在条目结尾：「Most historians believe that the use of Colossus machines significantly shortened the war by providing evidence of enemy intentions and beliefs」，即产出的是关于敌方意图与判断的证据材料，服务于战略层面的决策，而不只是单条消息的可读性。

## broken

模型只在登记的输入域与参数假设内成立；越界输入、密钥复用、实现偏离规范与版本差异都会使结论失效。

## history

时间线把事件定为 1944 年「First Colossus operational at Bletchley Park」，设计者是英国工程师 Tommy Flowers，交付量为十台、每台最多使用 2,500 个真空管；同一页的 1941 年条目则记录了面向 Enigma 的第一台 Bombe，两者构成布莱奇利园从机电设备走向电子设备的阶段划分。

**技术参数与复算边界**

该条目的形式模型是 \(\mathrm{Adv}^{\mathrm{attack}}_A(\lambda)=\Pr[\mathrm{Game}_A(\lambda)=1]-\frac12\)。输入：输入：洛伦兹破译的公开参数、密钥/随机数与消息；变量说明：λ 安全参数；Game 把攻击目标写成挑战-响应游戏。 预期输出：按 洛伦兹破译 的规范执行后得到可验证的输出或可比较的优势界。 复算必须给出输入、步骤、输出和单位；示例只演示流程，不替代标准测试向量。

复杂度由密钥长度、分组/状态规模、轮数、随机数质量和敌手模型共同决定；参数越界、版本差异与实现侧信道都可能使公式结论失效。已登记限制：该条目只给出形式模型与可复算步骤，不声称已完成生产实现、侧信道认证或第三方安全评估。

**参数与状态规模**

公式 \(\mathrm{Adv}^{\mathrm{attack}}_A(\lambda)=\Pr[\mathrm{Game}_A(\lambda)=1]-\frac12\) 的输入、输出和单位必须逐项登记；复算顺序为：1. 定义挑战与获胜条件 2. 给攻击者 oracle 访问 3. 计算优势并与目标界比较。

状态规模、密钥长度、分组长度和轮数决定复杂度；这些量不能从标题推断，必须以标准或实现文档为准。

**测试向量与实现边界**

标准测试向量只证明某组输入在某个实现中产生了预期输出，不证明所有参数都安全。记录测试向量时至少要写：算法/模式、密钥、明文或消息、随机数/IV、输出长度、实现版本。该条目已登记的限制是：该条目只给出形式模型与可复算步骤，不声称已完成生产实现、侧信道认证或第三方安全评估。

如果实现使用查表、分支或可变时间操作，算法层的证明不能替代侧信道评估；如果协议层没有认证，算法层的机密性也不能阻止替换或重放。

## refs

- Wikipedia search entry for 洛伦兹破译. https://zh.wikipedia.org/w/index.php?search=%E6%B4%9B%E4%BC%A6%E5%85%B9%E7%A0%B4%E8%AF%91
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**形式模型与复算步骤**

\[\mathrm{Adv}^{\mathrm{attack}}_A(\lambda)=\Pr[\mathrm{Game}_A(\lambda)=1]-\frac12\]

洛伦兹破译的公开参数、密钥/随机数与消息；变量说明：λ 安全参数；Game 把攻击目标写成挑战-响应游戏。1.定义挑战与获胜条件。2.给攻击者 oracle 访问。3.计算优势并与目标界比较。边界：公式只覆盖已登记的参数与假设；参数取值、标准版本和实现细节仍以来源为准。
