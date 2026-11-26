# Lorenz Cryptanalysis

## principle

**Attack**: Lorenz Cryptanalysis (洛伦兹破译). The Computer History Museum timeline entry for 1944 names the machine and its target: "First Colossus operational at Bletchley Park … Designed by British engineer Tommy Flowers, the Colossus is designed to break the complex Lorenz ciphers used by the Nazis during World War II." Breaking Lorenz ciphertext was the job of this electronic machine.

## why

The same entry supplies the reason in terms of speed and scale: "Colossus reduced the time to break Lorenz messages from weeks to hours", and "A total of ten Colossi were delivered, each using as many as 2,500 vacuum tubes". Moving from weeks to hours was achieved by this purpose-built electronics, using thousands of valves.

## used

The entry closes with its assessed use: "Most historians believe that the use of Colossus machines significantly shortened the war by providing evidence of enemy intentions and beliefs" — the output served strategic decision-making by evidencing enemy intentions and beliefs, not merely making individual messages readable.

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

The entry also records a distinctive limit: "The machine's existence was not made public until the 1970s." Long secrecy kept this work out of published computing history for decades, so early literature is scarce; this entry uses only what the timeline states and adds no detail about the breaking process beyond the source.

## history

Registered period: 第二次世界大战. Exact dates and institutions follow the source ledger.

## refs

- Wikipedia search entry for 洛伦兹破译. https://zh.wikipedia.org/w/index.php?search=%E6%B4%9B%E4%BC%A6%E5%85%B9%E7%A0%B4%E8%AF%91
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[\mathrm{Adv}^{\mathrm{attack}}_A(\lambda)=\Pr[\mathrm{Game}_A(\lambda)=1]-\frac12\]

Lorenz Cryptanalysis: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
