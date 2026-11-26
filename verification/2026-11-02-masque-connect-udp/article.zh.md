# MASQUE CONNECT-UDP

## principle

**协议**：MASQUE CONNECT-UDP（MASQUE Proxying UDP over HTTP）。RFC 9298 的定义句写在摘要：「This document describes how to proxy UDP in HTTP, similar to how the HTTP CONNECT method allows proxying TCP in HTTP.」并立刻限定形状——「More specifically, this document defines a protocol that allows an HTTP client to create a tunnel for UDP communications through an HTTP server that acts as a proxy.」即它约定的是 HTTP 之下的 UDP 隧道，不是新的传输协议。

## why

要补的缺口写在摘要：「This document describes how to proxy UDP in HTTP, similar to how the HTTP CONNECT method allows proxying TCP in HTTP.」§1 说明承载方式并不绑在某个 HTTP 版本上——「This protocol supports all existing versions of HTTP by using HTTP Datagrams」，HTTP/2 与 HTTP/3 用 Extended CONNECT，HTTP/1.x 用 Upgrade。文首的状态声明自陈它是共识产物：「This document is a product of the Internet Engineering Task Force (IETF).It represents the consensus of the IETF community.」

## used

使用形态是客户端经服务器建一条 UDP 隧道：摘要写「this document defines a protocol that allows an HTTP client to create a tunnel for UDP communications through an HTTP server that acts as a proxy.」§3 起给出的是协议与消息格式，被转发内容的安全由上层协议负责——§1 预期「UDP tunnels are commonly used to create an end-to-end virtual connection, which can then be secured using QUIC [QUIC] or another protocol running over UDP.」

## broken

限度一是它只规定隧道本身，转发内容是否机密取决于上层协议（§1 的 QUIC 句），本文件不给被转发负载添加机密性或完整性。限度二是代理位置的滥用风险，安全考量在 §7（§9 是参考文献）：「There are significant risks in allowing arbitrary clients to establish a tunnel to arbitrary targets, as that could allow bad actors to send traffic and have it attributed to the UDP proxy.」并建议「HTTP servers that support UDP proxying ought to restrict its use to authenticated users.」

## history

版本史在页眉与版权块：作者栏 D.Schinazi（Google LLC），页眉日期 August 2022，Category 为 Standards Track，版权行为「Copyright (c) 2022 IETF Trust and the persons identified as the document authors.」其后续件 RFC 9484（CONNECT-IP，2023 年 10 月）在自己的页眉标注 Updates: 9298，即本文件是那轮更新的底座；本文件自身未声明更新任何 RFC。

## refs

- Wikipedia search entry for MASQUE CONNECT-UDP. https://zh.wikipedia.org/w/index.php?search=MASQUE%20CONNECT-UDP
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/
- RFC 9298: Proxying UDP in HTTP. https://www.rfc-editor.org/rfc/rfc9298

## example

**形式模型与复算步骤**

\[\mathrm{Adv}^{\Pi}_A(\lambda)\le n\cdot\mathrm{Adv}^{\mathrm{prf}}_F(\lambda)+\varepsilon_{\mathrm{aead}}(\lambda)\]

MASQUE CONNECT-UDP的公开参数、密钥/随机数与消息；变量说明：Π 协议，A 敌手，n 会话数，PRF/AEAD 为底层原语。1.把协议消息序列写成状态机。2.用混合论证逐个替换原语。3.把剩余优势归约到 PRF/AEAD 安全。边界：公式只覆盖已登记的参数与假设；参数取值、标准版本和实现细节仍以来源为准。
