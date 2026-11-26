# Transitioning the Use of Cryptographic Algorithms and Key Lengths

## principle

**Standard**: Transitioning the Use of Cryptographic Algorithms and Key Lengths (密码算法与密钥长度过渡). The unit of this publication is security strength: "In SP 800-57, the security strength provided by an algorithm with a particular key length … is measured in bits and is a measure of the difficulty of subverting the cryptographic protection that is provided by the algorithm and key." It stresses that "Note that the length of the cryptographic keys is an integral part of these determinations." — algorithm and key length are judged together.

## why

Transitions need a written schedule because algorithms decay with computing power: the publication sets a floor for the federal government today — "For the Federal Government, a security strength of at least 112 bits is required at this time for applying cryptographic protection (e.g., for encrypting or signing data)." — and flags the future change in its own definitions, "When post-quantum cryptography is introduced in NIST standards, quantum security strength, i.e. the difficulty of subverting the protection using quantum computers, will be defined." while the note supplies the meaning itself, defining the measure as "a measure of the difficulty of subverting the cryptographic protection (e.g., discovering the key) using classical computers."

## used

The work is an algorithm-by-algorithm inventory: §2 opens with block ciphers — "Encryption is a cryptographic operation that is used to provide confidentiality for sensitive information, and decryption is the inverse operation." — and lists the families used federally, for instance "The Triple Data Encryption Algorithm (TDEA) (often referred to as Triple DES) is specified in SP 800-67, and has two variations, known as two-key TDEA and three-key TDEA."

## broken

The first limit is its standing: it is a recommendation, not a FIPS — the authority block says "such standards and guidelines shall not apply to national security systems without the express approval of appropriate federal officials exercising policy authority over such systems" and adds "Nothing in this publication should be taken to contradict the standards and guidelines made mandatory and binding on federal agencies by the Secretary of Commerce under statutory authority.", and the same block describes the publication as one that "may be used by nongovernmental organizations on a voluntary basis and is not subject to copyright in the United States". The second is timing: the 128-bit move is booked elsewhere — "SP 800-57, Part 1 includes a transition to a security strength of 128 bits in 2030" — and the text concedes its own scope — "However, this revision of SP 800-131A does not address this transition, but a future revision will include these considerations as well as transitions to post-quantum algorithms."

## history

Its history is legible from itself and its citations: this is Revision 2, titled "NIST Special Publication 800-131A Revision 2 Transitioning the Use of Cryptographic Algorithms and Key Lengths"; footnote 13 outsources curve approval — "Until SP 800-186 is published, approved elliptic curves are specified in FIPS 186-4." — and ties TDEA deprecation to a 2017 NIST announcement; that curve pointer was a 2019 placeholder only — SP 800-186 in this corpus is dated February 2023 and FIPS 186-5 superseded 186-4 on 3 February 2023, so the sentence no longer holds today.

## refs

- Wikipedia search entry for 密码算法与密钥长度过渡. https://zh.wikipedia.org/w/index.php?search=%E5%AF%86%E7%A0%81%E7%AE%97%E6%B3%95%E4%B8%8E%E5%AF%86%E9%92%A5%E9%95%BF%E5%BA%A6%E8%BF%87%E6%B8%A1
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[S=\min_i S_i,\quad S_i\in\{\text{密钥强度},\text{分组安全},\text{实现安全}\}\]

Transitioning the Use of Cryptographic Algorithms and Key Lengths: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
