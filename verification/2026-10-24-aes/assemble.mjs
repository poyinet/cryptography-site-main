import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url)),checkedOn='2026-10-24',entryId='aes-details';
const sources=[];
function source(id,title,url,locator){const s={id,title,url,locator,kind:'primary',checkedOn,method:'Author opened and read primary publication; independent review pending',claims:[]};sources.push(s);return s;}
const fips=source('fips197','NIST, FIPS 197-upd1, Advanced Encryption Standard (AES), May 9, 2023','https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.197-upd1.pdf','§§3–6; Appendices A–D');
const book=source('rijndael-design','Joan Daemen and Vincent Rijmen, The Design of Rijndael: AES — The Advanced Encryption Standard, published book 2002; consulted author-hosted first-edition PDF cover dated 2001-11-26','https://cs.ru.nl/~joan/papers/JDA_VRI_Rijndael_2002.pdf','Chapters 2–5 and 9; especially §§3.2–3.7 and wide trail discussion');
const core128=source('nist-core128','NIST, AES_Core128, Block Cipher Modes of Operation — Electronic Codebook examples','https://csrc.nist.gov/CSRC/media/Projects/Cryptographic-Standards-and-Guidelines/documents/examples/AES_Core128.pdf','First encryption block, PDF pp.1–2, from initial KeyAddition through final KeyAddition');
const core192=source('nist-core192','NIST, AES_Core192, Block Cipher Modes of Operation — Electronic Codebook examples','https://csrc.nist.gov/CSRC/media/Projects/Cryptographic-Standards-and-Guidelines/documents/examples/AES_Core192.pdf','First encryption block, PDF pp.1–3');
const core256=source('nist-core256','NIST, AES_Core256, Block Cipher Modes of Operation — Electronic Codebook examples','https://csrc.nist.gov/CSRC/media/Projects/Cryptographic-Standards-and-Guidelines/documents/examples/AES_Core256.pdf','First encryption block, PDF pp.1–3');
const mode=source('sp800-38a','Morris Dworkin, NIST SP 800-38A, Recommendation for Block Cipher Modes of Operation, 2001','https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-38a.pdf','§6.1; Appendix F.1');
const gcm=source('sp800-38d','Morris Dworkin, NIST SP 800-38D, GCM and GMAC, 2007','https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-38d.pdf','§§5.2,8; Appendix A');
const aead=source('rfc5116','David McGrew, RFC 5116, An Interface and Algorithms for Authenticated Encryption, January 2008','https://www.rfc-editor.org/info/rfc5116/','§2; §5.1.1');
const tls=source('rfc9846','Eric Rescorla, RFC 9846, The Transport Layer Security (TLS) Protocol Version 1.3; obsoletes RFC 8446','https://www.rfc-editor.org/info/rfc9846/','§1.2; §9.1; Appendix B.4');
const cache=source('osvik-shamir-tromer','Dag Arne Osvik, Adi Shamir and Eran Tromer, Cache Attacks and Countermeasures: the Case of AES, extended version revised 2005-11-20','https://www.cs.tau.ac.il/~tromer/papers/cache.pdf','Abstract and §1: data-dependent memory access and shared-cache leakage');
const review=source('nist-ir8319','Nicky Mouha, NIST IR 8319, Review of the Advanced Encryption Standard, July 2021','https://csrc.nist.gov/pubs/ir/8319/final','Publication metadata and abstract; treated as a dated review, not a present or perpetual security guarantee');
const history=source('nist-aes-history','NIST, AES Development archive','https://csrc.nist.gov/Projects/cryptographic-standards-and-guidelines/Archived-Crypto-Projects/AES-Development','1997 initiation and October 2, 2000 selection paragraphs');
const update=source('nist-fips197-update','NIST CSRC, FIPS 197 publication page','https://csrc.nist.gov/pubs/fips/197/final','Publication date and May 9, 2023 planning note');
book.editionNote={publishedBookYear:2002,consultedPdfCoverDate:'2001-11-26',bibliographicEvidenceUrl:'https://cs.ru.nl/~joan/JoanDaemenPapers.html',bibliographicLocator:'The Design of Rijndael entry, listed under 2002'};
function claim(s,suffix,section,zh,en,locator){s.claims.push({id:'aes-details-'+suffix,entryId,section,statement:{zh,en},locator:locator||s.locator});}
claim(fips,'definition','principle','AES是密钥参数化的128位分组变换；三种密钥长度对应10/12/14轮。','AES is a key-parameterized 128-bit block transformation with 10/12/14 rounds for its three key sizes.','§2 definitions; §5 Table 3');
claim(fips,'state-order','principle','状态为4×4字节数组，输入输出遵循s[r,c]=b[r+4c]列主序。','The state is a 4×4-byte array using s[r,c]=b[r+4c] for input/output.','§3.4, Eq.3.6–3.7');
claim(fips,'field','principle','AES字节按GF(2^8)多项式运算，加法为XOR，约减多项式为x^8+x^4+x^3+x+1。','AES bytes use GF(2^8) polynomial arithmetic, XOR addition, and reduction by x^8+x^4+x^3+x+1.','§4.1–4.2, Eq.4.1–4.7');
claim(fips,'sbox','principle','S盒由非零域逆元（零另作约定）及0x63常量的仿射变换组成。','The S-box combines nonzero field inversion (with a zero convention) and an affine map with constant 0x63.','§5.1.1, Eqs.5.2–5.4; Table 4');
claim(fips,'shift-rows','principle','AES第r行左移r字节，逆行移位向右。','AES row r rotates left by r bytes, with right rotations for inversion.','§5.1.2; §5.3.1');
claim(fips,'mix-matrix','principle','列混合和逆列混合使用正文列出的固定GF矩阵。','MixColumns and its inverse use the stated fixed field matrices.','§5.1.3 Eqs.5.6–5.8; §5.3.3 Eqs.5.14–5.15');
claim(fips,'round-key-add','principle','AddRoundKey按字节XOR四个字，且为自身的逆。','AddRoundKey XORs four words bytewise and is self-inverse.','§5.1.4; §5.3.4');
claim(fips,'schedule','principle','扩展密钥使用RotWord/SubWord/Rcon，AES256另有i mod 8=4的SubWord分支，轮密钥仍四字一组。','Expansion uses RotWord/SubWord/Rcon, adds the i mod 8=4 SubWord branch for AES-256, and groups round keys into four words.','§5.2, Algorithm 2; Table 5');
claim(fips,'round-order','principle','加密末轮不含MixColumns，直接逆算法的普通逆轮仍含InvMixColumns。','Encryption omits final-round MixColumns; ordinary rounds of the direct inverse still include InvMixColumns.','§5.1 Algorithm 1; §5.3 Algorithm 3');
claim(fips,'equivalent-inverse','principle','等价逆算法使用修改后的轮密钥，不能任意混用两种逆算法次序。','The equivalent inverse uses modified round keys; the two inverse sequences must not be mixed arbitrarily.','§5.3.5, Algorithms 4–5');
claim(book,'component-roles','why','设计者把非线性替换、线性扩散和密钥加组合，并用wide trail分析设计。','The designers combine nonlinear substitution, linear diffusion and key addition and analyze the wide trail design.','§§3.3–3.4; Chapters 5 and 9');
claim(fips,'correctness-scope','why','标准给出正向和逆向变换，使算法实现可按精确定义核验。','The standard defines forward and inverse transformations for precise implementation checks.','§5.1–5.3');
claim(mode,'modes','used','ECB/CBC/CFB/OFB/CTR是分组密码的外层模式，不是AES轮变换。','ECB/CBC/CFB/OFB/CTR are surrounding modes, not AES round transformations.','Abstract; §6');
claim(gcm,'gcm-purpose','used','GCM把保密与认证组合，具有额外输入要求。','GCM combines confidentiality and authentication and adds input requirements.','§5.2');
claim(tls,'tls-suites','used','当前查阅的RFC9846取代8446，列出AES-GCM/CCM及ChaCha20-Poly1305，不含AES-ECB。','Consulted RFC 9846 obsoletes 8446 and lists AES-GCM/CCM and ChaCha20-Poly1305, not AES-ECB.','Abstract; §1.2; Appendix B.4');
claim(mode,'ecb-equality','broken','同密钥ECB的相同输入块给出相同输出，泄露相等结构。','Under one ECB key, equal input blocks give equal output blocks, exposing equality.','§6.1');
claim(aead,'gcm-reuse','broken','GCM同密钥nonce重用会损害保密、真实性与完整性。','GCM nonce reuse under a key undermines confidentiality, authenticity and integrity.','§5.1.1');
claim(gcm,'gcm-conditions','broken','GCM安全依赖IV唯一性，攻击影响须保留其条件。','GCM security depends on IV uniqueness; attacks must retain their conditions.','§8; Appendix A');
claim(cache,'implementation-leakage','broken','数据相关查表的共享缓存访问模式可以泄露密码实现的信息。','Data-dependent lookup patterns in shared caches can leak cryptographic implementation information.','Abstract; §1.1');
claim(review,'dated-review','broken','NIST IR8319是2021年发布的AES回顾，不是无限期安全保证。','NIST IR 8319 is a 2021 review of AES, not an indefinite security guarantee.','Date Published; Abstract');
claim(history,'selection-history','history','NIST1997启动选择，2000-10-02选择Rijndael。','NIST initiated selection in 1997 and selected Rijndael on 2000-10-02.');
claim(update,'publication-history','history','FIPS197于2001-11-26发布，2023-05-09编辑更新未改变算法。','FIPS 197 was published on 2001-11-26; the 2023-05-09 editorial update did not alter the algorithm.');
claim(fips,'rijndael-scope','history','AES固定128位分组，不接纳更广Rijndael家族的其他分组配置。','AES fixes 128-bit blocks and does not adopt other block configurations of the wider Rijndael family.','§1; §5 Table 3');
claim(core128,'official-trace','example','AES128完整示例使用官方首分组，40操作中间态及最终密文对应官方Core128。','The complete AES-128 example uses the official first block, forty operation states and its final ciphertext.');
claim(core192,'official192','example','AES192官方首块密文为bd334f1d6e45f25ff712a214571fa5cc。','The official AES-192 first-block output is bd334f1d6e45f25ff712a214571fa5cc.');
claim(core256,'official256','example','AES256官方首块密文为f3eed1bdb5d2a03c064b5a7e3db181f8。','The official AES-256 first-block output is f3eed1bdb5d2a03c064b5a7e3db181f8.');
claim(fips,'expansion-anchors','example','扩展密钥示例的w4及三种长度的检查字可与官方附录A对照。','Expansion word w4 and the three key-size anchor sets can be checked against official Appendix A.','Appendices A.1–A.3');
claim(fips,'pseudocode-order','code','教学伪代码保留FIPS规定的初始轮密钥、普通轮、末轮及直接逆顺序。','The teaching flow preserves the specified initial key addition, ordinary/final rounds and direct inverse order.','Algorithms 1–3');
claim(fips,'diagram-terms','diagram','状态4×4字节，字为4字节，轮密钥4字，图的末轮省略列混合。','The state is 4×4 bytes, a word has four bytes, a round key has four words, and final mixing is omitted.','§2; §§3.4–3.5; Algorithm 1');
claim(aead,'associated-data','diagram','AEAD处理认证及不加密的关联数据，不是图中裸AES自动提供。','AEAD includes authentication of unencrypted associated data, not supplied by the bare AES drawing.','§§1–2');
function parse(name){const raw=fs.readFileSync(path.join(here,name),'utf8').replace(/\r\n/g,'\n'),out={};let key=null;
 for(const line of raw.split('\n')){const heading=/^## ([a-z]+)$/.exec(line);if(heading){key=heading[1];out[key]=[];}else if(key)out[key].push(line);}
 return Object.fromEntries(Object.entries(out).map(([k,v])=>[k,v.join('\n').trim()]));
}
const calculationIds=['aes-official-kats','aes-core128-trace','aes-field-sbox','aes-linear-inverses','aes-key-expansion','aes-openssl-crosscheck','aes-deliberate-mistakes','aes-mode-boundaries','aes-input-validation'];
const entry={id:entryId,inventoryIds:['algorithm--aes'],coverage:'catalog-entry',coverageRationale:{zh:'专门解释AES算法的状态、有限域、S盒、所有正逆步骤、三种扩展密钥、逐轮示例及实现边界；标准文档FIPS197只是关联来源，不据此完成标准实体。',en:'Covers the AES algorithm’s state, field, S-box, forward/inverse operations, three key schedules, full worked rounds and implementation limits. FIPS 197 is a related source, not an independently completed standard entity.'},title:{zh:'AES：从一个字节到完整分组变换',en:'AES: from a byte to the complete block transformation'},verificationStatus:'source-checked-awaiting-independent-review',sections:{zh:parse('article.zh.md'),en:parse('article.en.md')},claimIds:sources.flatMap(s=>s.claims.map(c=>c.id)),calculationIds,sourceIds:sources.map(s=>s.id),related:['standard--fips197'],relatedPolicy:'Related standard is not an alias and is not completed by this algorithm article.'};
const purposes={
 'aes-official-kats':['Three official AES key-size vectors','3 encrypt/decrypt results match independent NIST outputs'],
 'aes-core128-trace':['Official first AES-128 block','All 40 operation checkpoints match the transcribed official values'],
 'aes-field-sbox':['All 256×256 byte products; all nonzero inverses; S-box anchors','Separate polynomial long division agrees with multiplication; S-box is a permutation'],
 'aes-linear-inverses':['128 single-bit basis states and one column-order example','ShiftRows and MixColumns inverses restore each basis state'],
 'aes-key-expansion':['Official Appendix A anchors for 128/192/256-bit keys','Nk/Nr, word counts, round-key sizes and 21 anchor words agree'],
 'aes-openssl-crosscheck':['64 deterministic input/key pairs for each key size','192 teaching outputs agree with Node/OpenSSL and both decryptions invert'],
 'aes-deliberate-mistakes':['Wrong row indexing, final MixColumns, missing AES256 SubWord','Each mutation diverges from independent official data at a meaningful point'],
 'aes-mode-boundaries':['Repeated blocks and an explicitly shared toy keystream','Equal blocks repeat; XOR identity holds without claiming full GCM recovery or forgery'],
 'aes-input-validation':['Wrong block/key lengths and malformed hex','Rejected; valid 16/24/32-byte key sizes accepted']
};
const calculations=calculationIds.map(id=>({id,entryId,kind:id==='aes-mode-boundaries'?'original-identity-demonstration':'executable-algorithm-check',inputs:purposes[id][0],expected:purposes[id][1],sourceIds:entry.sourceIds,dependencies:['aes-teaching.mjs','vectors.json'],limitations:'Educational correctness/identity checks only; no production, side-channel or algorithm-security certification.'}));
fs.writeFileSync(path.join(here,'content.json'),JSON.stringify({version:1,checkedOn,scope:'Full AES algorithm article only; no completion claim for FIPS197, modes, protocols or the whole library',entries:[entry],calculations},null,2)+'\n');
fs.writeFileSync(path.join(here,'sources.json'),JSON.stringify({version:1,checkedOn,sources},null,2)+'\n');
console.log(`Assembled one catalog-entry draft; ${sources.length} primary sources; ${entry.claimIds.length} mapped claims.`);
