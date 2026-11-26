# bcrypt password hash

## principle

**Algorithm**: bcrypt (bcrypt 自适应口令散列). The mechanism is printed as-is in Section 5: “Bcrypt uses a 128-bit salt and encrypts a 192-bit magic value.” The next sentence names what it leans on, “It takes advantage of the expensive key setup in eksblow sh.” — the retained text really prints eksblow sh, the ligature was lost in extraction, so it is quoted in that form rather than repaired.

## why

The rationale sits in the abstract: the paper will “show that the computational cost of any secure password scheme must increase as hardware improves”, and the same paragraph names the two adaptable-cost algorithms together, “cost|eksblow sh, a block cipher with a purposefully expensive key schedule, and bcrypt, a related hash function” — in this file the em dash there is printed as a vertical bar |, and the span carries it.

## used

Use and implementation venue come from the paper’s own roadmap sentence, “Section 5 introduces the variable-cost bcrypt password hashing function and describes our implementation in the OpenBSD operating system”, and the name is explained at the head of that section, where the text prints “bcrypt, referring to the Blow” followed by the cipher’s name.

A shared name may belong to an algorithm, standard, event, person or term; this entry is responsible only for its catalogue binding and does not absorb adjacent records. If versions, regions or institutions define the name differently, the differences stay side by side.

## broken

The limit is not a break but a failure mode, printed as one claim: “the big aw in UNIX password security is not its openly readable password le. Rather, it is the choice of a hash function that cannot adapt to a 50,000 fold increase in the speed of hardware and software.” The aw and le are the extraction’s own glyphs, copied verbatim, and the case for changing the hash follows from that sentence.

## history

The dating evidence is on one line: “At the time of deployment in 1976, crypt could hash fewer than 4 passwords per second.” and later “over 200,000 crypt operations per second” — both the year 1976 and the two rates are printed by the retained file, so this entry speaks only to the speed comparison in the 1999 paper and says nothing about inventors or earlier origins, which this text does not provide.

## refs

- Wikipedia search entry for bcrypt 自适应口令散列. https://zh.wikipedia.org/w/index.php?search=bcrypt%20%E8%87%AA%E9%80%82%E5%BA%94%E5%8F%A3%E4%BB%A4%E6%95%A3%E5%88%97
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[C=E_K(P;r),\qquad P=D_K(C)\]

bcrypt: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
