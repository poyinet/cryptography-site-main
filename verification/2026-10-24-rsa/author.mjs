// Bounded, manually authored RSA article. No catalog-wide prose generation.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {zh,en} from './prose.mjs';
const dir=path.dirname(fileURLToPath(import.meta.url)),id='rsa-details',date='2026-10-24';
// Prose typography is edited deliberately; do not split technical identifiers by generic rewrites.
const sources=[];
function source(sid,title,url,locator,method='Read in web research from the primary document or author-hosted copy; independent second review pending.'){
 const s={id:sid,title,url,locator,kind:'primary',checkedOn:date,method,claims:[]};sources.push(s);return s;
}
const rfc=source('rsa-rfc8017','K. Moriarty et al., RFC 8017, PKCS #1 v2.2, November 2016','https://www.rfc-editor.org/rfc/rfc8017.txt','§§2–9 and Appendix B.2.1; front-matter document status');
const labs=source('rsa-labs-oaep','RSA Laboratories, RSAES-OAEP Encryption Scheme, 2000; author submission to NESSIE, preserved PDF copy','https://webencrypt.org/resource/RSA-oaep_spec.pdf','§§1.1–1.4; Appendix B pp.31–33; Appendix C pp.34–36');
const original=source('rsa-original-paper','R. L. Rivest, A. Shamir, L. Adleman, A Method for Obtaining Digital Signatures and Public-Key Cryptosystems, CACM 21(2), 1978, pp.120–126','https://people.csail.mit.edu/rivest/Rsapaper.pdf','Author-hosted paper, §§II–VI; publication year cross-checked in Shoup OAEP Reconsidered reference [RSA78]');
const pss=source('rsa-pss-paper','M. Bellare, P. Rogaway, The Exact Security of Digital Signatures — How to Sign with RSA and Rabin, EUROCRYPT 1996','https://www.cs.ucdavis.edu/~rogaway/papers/exact.pdf','First-page venue/date and abstract; PSS construction and security model');
const shoup=source('rsa-oaep-shoup','V. Shoup, OAEP Reconsidered, revised 18 September 2001','https://www.shoup.net/papers/oaep.pdf','Abstract, §1 and reference [RSA78]');
const timing=source('rsa-kocher-timing','P. Kocher, Timing Attacks on Implementations of Diffie-Hellman, RSA, DSS, and Other Systems, CRYPTO 1996','https://www.paulkocher.com/doc/TimingAttacks.pdf','§§1–2 on data/key-dependent timing; §10 on prevention');
const faults=source('rsa-bdl-faults','D. Boneh, R. DeMillo, R. Lipton, On the importance of checking cryptographic protocols for faults; author publication abstract','https://crypto.stanford.edu/~dabo/abstracts/faults.html','Author abstract, single erroneous CRT signature statement; journal citation Vol.14 No.2 pp.101–119 (2001)');
const course=source('rsa-boneh-course','D. Boneh, CS255: The RSA Trapdoor Permutation, Winter 2023 slides','https://crypto.stanford.edu/~dabo/courses/cs255_winter23/lectures/rsa.pdf','Slides9,16–17,21 and CRT fault slides; old parameter suggestions are not deployment guidance');
const factoring=source('rsa-factoring-distinction','D. Boneh, R. Venkatesan, Breaking RSA may not be equivalent to factoring, EUROCRYPT 1998; author abstract','https://crypto.stanford.edu/~dabo/pubs/abstracts/no_rsa_red.html','Author abstract: reduction evidence and explicit limitations');
const tls=source('rsa-tls9846','E. Rescorla, RFC 9846, The Transport Layer Security (TLS) Protocol Version 1.3, July 2026','https://www.rfc-editor.org/rfc/rfc9846.txt','Front matter; §§1.2–1.3,4.3.3,4.5,9.1 and Appendix F.10');
const nist=source('rsa-nist-pss','NIST ACVP-Server, RSA-SigVer-FIPS186-5/internalProjection.json, commit 975de31eb83d87039ec88934fdc47d8c312b892d','https://raw.githubusercontent.com/usnistgov/ACVP-Server/975de31eb83d87039ec88934fdc47d8c312b892d/gen-val/json-files/RSA-SigVer-FIPS186-5/internalProjection.json','tgId25: pss,SHA3-256,modulo2048,saltLen32; tcId145–150','Downloaded primary NIST repository JSON over HTTPS via Python; retained minimal unmodified group and tests with pinned commit and full upstream-file hash. Independently checked using Node/OpenSSL.');
const refs=sources.map(s=>'- '+s.title+'; '+s.locator).join('\n');zh.refs=refs;en.refs=refs;
const claimIds=[];
function claim(s,short,section,z,e,locator,extra={}){const cid='rsa-details-'+short;claimIds.push(cid);s.claims.push({id:cid,entryId:id,section,statement:{zh:z,en:e},locator,...extra});}
claim(rfc,'layers','principle','RSA整数原语与加密/签名方案分层，签名不是私钥加密。','RSA integer primitives differ from encryption/signature schemes; signing is not private-key encryption.','§§5–8');
claim(rfc,'representatives','principle','原语范围是0…n−1，转换采用大端和指定长度。','Primitives use0…n−1; octet conversions are big-endian with prescribed length.','§§4,5.1,5.2');
claim(rfc,'key-conditions','principle','两素数有效密钥要求互异奇素数和λ(n)上的逆元条件。','Two-prime valid keys require distinct odd primes and inverse-exponent conditions modulo λ(n).','§§3.1–3.2');
claim(labs,'correctness-all','principle','对每个素因子分零与非零情况，CRT可证明非互素代表也恢复。','Splitting zero/nonzero prime residues and using CRT proves recovery for non-coprime representatives.','Appendix B, Proposition1 and Theorem2, pp.31–33',{derivation:'Article gives an explicit two-case proof; finite computation only corroborates its toy instance.'});
claim(original,'modular-power','principle','重复平方可求模幂，不先构造完整大整数幂。','Repeated squaring evaluates modular exponentiation without the full unreduced power.','§V, exponentiation procedure');
claim(rfc,'crt-form','principle','CRT形式使用q对p的逆和m=m2+qh。','The CRT form uses q inverse modulo p and m=m2+qh.','§3.2 note1; §5.1.2');
claim(original,'public-private','why','公钥给出公共运算；知道因子可导出逆指数。','The public key enables the public operation; factors allow derivation of a private exponent.','§§II,V');
claim(factoring,'factoring-not-equivalent','why','知道分解可求逆不证明一般RSA求逆与分解等价。','Inversion given factors does not prove a general equivalence between RSA inversion and factoring.','Author abstract and limitations');
claim(rfc,'scheme-boundary','why','编码和方案要求不能由裸模幂正确性替代。','Raw modular-exponentiation correctness does not supply encoding or scheme requirements.','§§5–8');
claim(rfc,'oaep-octets','used','OAEP采用00前缀、标签哈希和两次MGF，消息上限为k−2hLen−2。','OAEP uses leading00,label hash,two MGF masks and message bound k−2hLen−2.','§7.1.1 steps1–2; Appendix B.2.1');
claim(labs,'mgf-deterministic','used','MGF以四字节大端计数器展开，OAEP随机性来自seed。','The MGF expands with four-octet big-endian counters; OAEP randomness comes from seed.','§§1.3.1,1.3.3');
claim(rfc,'pss-structure','used','PSS使用mHash、salt、八个零字节、掩码和bc尾字节，emBits=modBits−1。','PSS uses mHash,salt,eight zero octets,masking,bc trailer and emBits=modBits−1.','§8.1.1; §9.1.1');
claim(rfc,'pss-checks','used','PSS验签需消息、签名以及结构和哈希一致性检查。','PSS verification requires message,signature,structure and hash-consistency checks.','§8.1.2; §9.1.2');
claim(pss,'pss-proof-scope','used','原PSS证明有RSA与理想化哈希前提，不是任意实现保证。','The original PSS proof assumes RSA hardness and idealized hashes; it is not an arbitrary implementation guarantee.','Abstract and security model',{supportingSourceIds:['rsa-rfc8017']});
claim(tls,'tls-role','used','所查现行TLS1.3不使用RSA密钥传输，仍定义PSS认证和参数约束。','The checked current TLS1.3 specification omits RSA key transport but retains PSS authentication and parameter constraints.','§1.3; §4.3.3; Appendix F.10');
claim(tls,'identity-context','used','证书身份与握手上下文的判断不等于单次RSA验签。','Certificate identity and handshake-context checks are not the RSA signature operation alone.','§§4.5.1–4.5.3');
claim(course,'raw-deterministic','broken','裸RSA确定，可公开比较候选消息。','Raw RSA is deterministic, allowing public candidate-message comparison.','Slides9,16–17',{derivation:'Explicit fixed-key equality and candidate computation are reproduced locally.'});
claim(course,'raw-multiplicative','broken','裸RSA保留乘法关系，这不直接表示OAEP用户消息相乘。','Raw RSA preserves multiplication; this is not multiplication of OAEP user messages.','Slides17,21; public-power equation',{derivation:'Article computes E(65)E(2), resulting ciphertext and changed plaintext.'});
claim(rfc,'validity-v-generation','broken','密钥数学条件、编码和完整生成/实现安全是不同层次。','Arithmetic validity,encoding and complete generation/implementation security are different layers.','§1 scope; §§3,7,8');
claim(rfc,'decoding-oracle','broken','OAEP不同解码错误不能经消息或时间被区分。','OAEP decoding errors must not be distinguishable through messages or timing.','§7.1.2 final note; §7.2.2 note');
claim(shoup,'oaep-proof-limits','broken','一般OAEP证明缺口不构成RSA-OAEP不安全结论。','A gap in a general OAEP proof does not establish RSA-OAEP insecurity.','Abstract and §1');
claim(timing,'timing','broken','某些私钥实现的时间差会泄漏秘密，需要实现防护。','Timing differences in some private-operation implementations leak secret-related information and need implementation protection.','§§1–2,10');
claim(faults,'faults','broken','某些CRT实现的错误签名暴露因子；正常正确性不是故障安全。','Faulty signatures in some CRT implementations expose factors; ordinary correctness is not fault resistance.','Author abstract',{supportingSourceIds:['rsa-boneh-course']});
claim(original,'original-history','history','原论文由Rivest、Shamir、Adleman署名，历史讨论不替代现代编码。','The original paper is by Rivest,Shamir,Adleman; historical discussion does not replace modern encoding.','Title and §§II–VI; publication venue/year cross-check in Shoup [RSA78]',{supportingSourceIds:['rsa-oaep-shoup']});
claim(pss,'pss-history','history','PSS论文发表于EUROCRYPT1996并研究精确安全性。','The PSS paper appeared at EUROCRYPT1996 and studies exact security.','First-page date/venue and abstract');
claim(shoup,'oaep-history','history','2001年修订说明证明依赖构造与假设。','The revised2001 work explains dependence on the construction and assumptions.','First-page date,abstract,§1');
claim(rfc,'rfc-status','history','RFC8017在2016重新发布PKCS1v2.2、取代3447，类别Informational。','RFC8017 republishes PKCS1v2.2 in2016,obsoletes3447 and is Informational.','Front matter and Status of This Memo');
claim(tls,'tls-current','history','RFC9846于2026年7月发布并取代8446。','RFC9846 appeared in July2026 and obsoletes8446.','Front matter; §1.2');
claim(labs,'toy-derivation','example','给定玩具输入可用模幂、CRT及字节转换复算。','The chosen toy inputs can be reproduced through modular powers,CRT and octet conversion.','§§1.1–1.2; Appendix B',{derivation:'Original numerical example; the source supplies rules,not these chosen numerical inputs.'});
claim(labs,'oaep-kat','example','附录C给出固定消息、seed、掩码和密文；旧EM不含RFC8017的00。','AppendixC gives fixed message,seed,masks and ciphertext; old EM omits RFC8017 leading00.','Appendix C pp.34–36; §1.4.1',{supportingSourceIds:['rsa-rfc8017']});
claim(nist,'pss-kat','example','固定第25组有1个通过、5个拒绝的PSS/SHA3-256样本。','Pinned group25 has one pass and five rejects for PSS/SHA3-256.','tgId25,tcId145–150,testPassed fields');
const hex=s=>s.replace(/\s/g,'');
const oaep={hash:'sha1',n:hex(`bb f8 2f 09 06 82 ce 9c 23 38 ac 2b 9d a8 71 f7 36 8d 07 ee d4 10 43 a4
40 d6 b6 f0 74 54 f5 1f b8 df ba af 03 5c 02 ab 61 ea 48 ce eb 6f cd 48
76 ed 52 0d 60 e1 ec 46 19 71 9d 8a 5b 8b 80 7f af b8 e0 a3 df c7 37 72
3e e6 b4 b7 d9 3a 25 84 ee 6a 64 9d 06 09 53 74 88 34 b2 45 45 98 39 4e
e0 aa b1 2d 7b 61 a5 1f 52 7a 9a 41 f6 c1 68 7f e2 53 72 98 ca 2a 8f 59
46 f8 e5 fd 09 1d bd cb`),e:'11',message:'d436e99569fd32a7c8a05bbc90d32c49',label:'',seed:'aafd12f659cae63489b479e5076ddec2f06cb58f'};
const oaepExpected={dbMask:hex(`06 e1 de b2 36 9a a5 a5 c7 07 d8 2c 8e 4e 93 24 8a c7 83 de e0 b2 c0 46
26 f5 af f9 3e dc fb 25 c9 c2 b3 ff 8a e1 0e 83 9a 2d db 4c dc fe 4f f4
77 28 b4 a1 b7 c1 36 2b aa d2 9a b4 8d 28 69 d5 02 41 21 43 58 11 59 1b
e3 92 f9 82 fb 3e 87 d0 95 ae b4 04 48 db 97 2f 3a c1 4e af f4 9c 8c 3b
7c fc 95 1a 51 ec d1 dd e6 12 64`),maskedDB:hex(`dc d8 7d 5c 68 f1 ee a8 f5 52 67 c3 1b 2e 8b b4 25 1f 84 d7 e0 b2 c0 46
26 f5 af f9 3e dc fb 25 c9 c2 b3 ff 8a e1 0e 83 9a 2d db 4c dc fe 4f f4
77 28 b4 a1 b7 c1 36 2b aa d2 9a b4 8d 28 69 d5 02 41 21 43 58 11 59 1b
e3 92 f9 82 fb 3e 87 d0 95 ae b4 04 48 db 97 2f 3a c1 4f 7b c2 75 19 52
81 ce 32 d2 f1 b7 6d 4d 35 3e 2d`),seedMask:'41870b5ab029e657d95750b54c283c08725dbea9',maskedSeed:'eb7a19ace9e3006350e329504b45e2ca82310b26',ciphertext:hex(`12 53 e0 4d c0 a5 39 7b b4 4a 7a b8 7e 9b f2 a0 39 a3 3d 1e 99 6f c8 2a
94 cc d3 00 74 c9 5d f7 63 72 20 17 06 9e 52 68 da 5d 1c 0b 4f 87 2c f6
53 c1 1d f8 23 14 a6 79 68 df ea e2 8d ef 04 bb 6d 84 b1 c3 1d 65 4a 19
70 e5 78 3b d6 eb 96 a0 24 c2 ca 2f 4a 90 fe 9f 2e f5 c9 c1 40 e5 bb 48
da 95 36 ad 87 00 c8 4f c9 13 0a de a7 4e 55 8d 51 a7 4d df 85 d8 b5 0d
e9 68 38 d6 06 3e 09 55`)};
const fixtureHash=createHash('sha256').update(fs.readFileSync(path.join(dir,'nist-pss-fixture.json'))).digest('hex');
const calculations=[
 {id:'rsa-details-key-crt-example',entryId:id,inputs:{p:'61',q:'53',e:'17',d:'2753',message:'65'},expected:{n:'3233',phi:'3120',lambda:'780',dP:'53',dQ:'49',qInv:'38',squares:['992','1232','1547','789'],ciphertext:'2790',direct:'65',m1:'4',m2:'12',h:'1',crt:'65',nonCoprimeMessage:'61',nonCoprimeCiphertext:'610'},sourceIds:['rsa-rfc8017','rsa-labs-oaep'],classification:'original-toy-calculation'},
 {id:'rsa-details-all-representatives',entryId:id,inputs:{p:'61',q:'53',e:'17',d:'2753'},expected:{representatives:3233,nonCoprimeRepresentatives:113,roundtripFailures:0,crtDisagreements:0},sourceIds:['rsa-labs-oaep'],classification:'exhaustive-finite-example'},
 {id:'rsa-details-integer-boundaries',entryId:id,inputs:{integer:'65',length:2,overflow:'65536',n:'3233'},expected:{octets:'0041',roundtrip:'65',overflowRejected:true,outOfRangeRejected:true},sourceIds:['rsa-rfc8017'],classification:'representation-and-rejection-checks'},
 {id:'rsa-details-multiplication',entryId:id,inputs:{n:'3233',e:'17',d:'2753',message:'65',factor:'2'},expected:{ciphertext:'2790',factorCiphertext:'1752',modifiedCiphertext:'3017',modifiedPlaintext:'130',repeatedCiphertext:'2790'},sourceIds:['rsa-boneh-course'],classification:'original-toy-counterexample'},
 {id:'rsa-details-key-condition-boundary',entryId:id,inputs:{repeatedPrime:'61',badExponent:'12',lambda:'780',toyExponent:'17',toyPrivateExponent:'53'},expected:{gcdBadExponent:'12',repeatedPrimeMessage:'61',repeatedPrimeCiphertext:'0',repeatedPrimeRecovered:'0'},sourceIds:['rsa-rfc8017','rsa-labs-oaep'],classification:'invalid-key-counterexample'},
 {id:'rsa-details-oaep-reference',entryId:id,inputs:oaep,expected:oaepExpected,sourceIds:['rsa-labs-oaep','rsa-rfc8017'],classification:'author-published-independent-known-answer'},
 {id:'rsa-details-nist-pss-reference',entryId:id,inputs:{fixture:'nist-pss-fixture.json',fixtureSha256:fixtureHash,hash:'sha3-256',tgId:25,modBits:2048,saltLen:32},expected:{tests:6,passes:1,rejections:5,encodingEqualsPublicRecovery:true,nodeOpenSslAgrees:true},sourceIds:['rsa-nist-pss','rsa-rfc8017'],classification:'pinned-independent-known-answer-and-negative-cases'}
];
const glossary={zh:[['代表','供整数原语处理、处于0…n−1的数，不等于用户消息字节串。'],['模数n','本条为互异奇素数p、q的乘积。'],['λ(n)','lcm(p−1,q−1)，用于逆元指数条件。'],['CRT','由模p、模q的余数恢复唯一模pq整数的中国剩余定理。'],['I2OSP / OS2IP','整数与大端字节串的表示转换，不是安全编码。'],['OAEP标签L','双方约定并经哈希检查的编码参数，不是身份认证。'],['MGF1','利用哈希和四字节计数器做确定性掩码展开。'],['PSS salt','签名编码使用的字节串，长度和生成规则属于方案或协议参数。'],['预言机','暴露计算或判断结果的抽象接口，错误区分也可能构成信息源。']],en:[['Representative','An integer in 0…n−1 processed by a primitive, not the user-message octets.'],['Modulus n','Here the product of distinct odd primes p and q.'],['λ(n)','lcm(p−1, q−1), used in the inverse-exponent condition.'],['CRT','Reconstructs a unique residue modulo pq from residues modulo p and q.'],['I2OSP / OS2IP','Representation conversion between integers and big-endian octets, not secure encoding.'],['OAEP label L','An agreed, hash-checked encoding parameter, not peer identity authentication.'],['MGF1','Deterministic expansion using a hash and four-octet counters.'],['PSS salt','Octets in signature encoding; length and generation rules depend on the scheme/profile.'],['Oracle','An interface exposing a result or predicate; distinguishable errors can supply one.']]};
const content={version:1,checkedOn:date,scope:'One full algorithm-entry draft: two-prime RSA and encoding boundaries; not full-library completion',verificationStatus:'source-checked-awaiting-independent-review',entries:[{id,inventoryIds:['algorithm--rsa'],coverage:'catalog-entry',coverageRationale:{zh:'对应algorithm--rsa的算法机制、正确性、表示与使用边界；OAEP/PSS及TLS仅为方案/协议上下文，不将RFC、协议、其他算法或旧入门稿计完成。',en:'Covers the mechanism, correctness, representations and use boundaries of algorithm--rsa. OAEP/PSS and TLS provide scheme/protocol context; no RFC, protocol, other algorithm or old introduction is counted as completed.'},title:{zh:'RSA：整数原语、CRT正确性与编码方案',en:'RSA: integer primitives, CRT correctness and encoding schemes'},verificationStatus:'source-checked-awaiting-independent-review',sections:{zh,en},claimIds,calculationIds:calculations.map(c=>c.id),related:[],sourceIds:sources.map(s=>s.id),glossary}],calculations};
const evidence={version:1,checkedOn:date,sources,limitations:['Authored source checks and calculations await independent review.','The author-hosted RSA paper and preserved author OAEP document are primary texts; URLs and locators are retained.','Known-answer fixtures do not certify an implementation or recommend deployment parameters.']};
for(const [name,value] of [['content.json',content],['sources.json',evidence]])fs.writeFileSync(path.join(dir,name),JSON.stringify(value,null,2)+'\n','utf8');
console.log(`Wrote one bilingual RSA draft, ${claimIds.length} mapped claims and ${calculations.length} calculations; no acceptance granted.`);
