# 弗里德里希·卡西斯基

## principle

**人物**：弗里德里希·卡西斯基（Friedrich Kasiski）。留存文献的概括是：「Kasiski's method provides a general technique for cryptanalyzing polyalphabetic ciphers with repeated keywords」，其观察基础是「repeated portions of plaintext encrypted with the same portion of the keyword result in identical ciphertext segments」。

## why

一旦可以观察到相同的密文片段，两段起点之间的距离就成为线索：它更可能是密钥长度的倍数而不是随机结果。周期因此可从密文推断，无需先掌握密钥内容。

## used

复算记在 calculations 中：先按留存件所印的观察构造对照——同一 20 字母片段在距离 30（周期 5 的倍数）下加密得到完全相同的密文片段，而在距离 29 下不同；再对 4598 字母样本的维吉尼亚密文提取 1603 个 4 字母重复窗口并分解其距离，其中 1594 个为 5 的倍数，因子排名首位即 5（本批次埋入而未告知分析的周期），其余 9 个为留存件同一句所承认的巧合重复；自相关路径对滞后 1..10 计数，5 与 10 的显著高于其余滞后均值，与例 7.77 所述一致；换成与明文等长且无周期的密钥流后，分析失去可算的原料：1500 字母里重复关键词留下 164 个 4 字母重复窗口——是均匀流期望值 2.45 的 66.9 倍——且因子首位为 5；而该密钥流留下 2 个，另外二十条无周期密钥流分别留下 0 到 7 个（均值 2.7），其首位因子只是寥寥两三个距离的巧合而非关键词长度，与留存件「running-key ciphers prevent cryptanalysis by the Kasiski method」相对照。

## broken

弱点同样来自留存文献的对照说明：「have an alphabet which changes continuously for a very long period before repeating; this provides protection against Kasiski analysis and methods based on the index of coincidence」。周期过长或偶然重复缺失时，方法失去可用信号。

## history

同章注记写道「The method of Kasiski (from West Prussia) was originally published」，把方法与出处相连；年份与出版细节按留存文本口径记录，不在此处补入未在源中出现的传记信息。

**可核角色与证据链**

弗里德里希·卡西斯基归入破译方法，登记时代为破译者时代。该条目只登记有来源支持的教育/任职机构、公开文本或专利、参与的标准/机器/事件与可核同行评价。来源账本包括：Wikipedia search entry for 弗里德里希·卡西斯基；MacTutor History of Mathematics Archive, University of St Andrews。

没有来源支持的出生、死亡、家庭、师承、奖项、论文数量和任职日期不补写；同名人物不合并；后人归功与本人文本分开。

## refs

- Wikipedia search entry for 弗里德里希·卡西斯基. https://zh.wikipedia.org/w/index.php?search=%E5%BC%97%E9%87%8C%E5%BE%B7%E9%87%8C%E5%B8%8C%C2%B7%E5%8D%A1%E8%A5%BF%E6%96%AF%E5%9F%BA
- MacTutor History of Mathematics Archive, University of St Andrews. https://mathshistory.st-andrews.ac.uk/

## example

**角色关系模型**

只登记四类关系：教育/任职机构、公开文本或专利、参与的标准/机器/事件、可核同行评价。每条关系都要有来源；没有来源的师承、奖项和私生活不进入模型。
