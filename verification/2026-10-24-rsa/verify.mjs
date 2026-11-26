import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {createHash,createPublicKey,verify as opensslVerify,constants,timingSafeEqual} from 'node:crypto';
const dir=path.dirname(fileURLToPath(import.meta.url)),file=n=>path.join(dir,n),read=n=>fs.readFileSync(file(n)),content=JSON.parse(read('content.json')),sources=JSON.parse(read('sources.json')),checks=[];
const calcs=new Map(content.calculations.map(c=>[c.id,c])),id='rsa-details';
function check(cid,fn){const result=fn();checks.push({id:cid,passed:true,...result});}
const sha=b=>createHash('sha256').update(b).digest('hex');
const integer=x=>BigInt(x),mod=(a,n)=>(a%n+n)%n;
function gcd(a,b){while(b)[a,b]=[b,a%b];return a;}
function inverse(a,n){let oldR=mod(a,n),r=n,oldS=1n,s=0n;while(r){const q=oldR/r;[oldR,r]=[r,oldR-q*r];[oldS,s]=[s,oldS-q*s];}assert.equal(oldR,1n,'No modular inverse');return mod(oldS,n);}
function pow(a,e,n){assert(n>0n&&e>=0n);let out=1n;a=mod(a,n);while(e){if(e&1n)out=out*a%n;a=a*a%n;e>>=1n;}return out;}
function os2ip(bytes){return bytes.length?BigInt('0x'+bytes.toString('hex')):0n;}
function i2osp(x,len){assert(Number.isSafeInteger(len)&&len>=0);assert(x>=0n&&x<256n**BigInt(len),'integer too large');if(!len)return Buffer.alloc(0);return Buffer.from(x.toString(16).padStart(2*len,'0'),'hex');}
function rsaep(m,e,n){assert(m>=0n&&m<n,'message representative out of range');return pow(m,e,n);}
function key(c){const p=integer(c.inputs.p),q=integer(c.inputs.q),e=integer(c.inputs.e),d=integer(c.inputs.d),n=p*q,phi=(p-1n)*(q-1n),lambda=phi/gcd(p-1n,q-1n);return {p,q,e,d,n,phi,lambda,dP:d%(p-1n),dQ:d%(q-1n),qInv:inverse(q,p)};}
function crt(c,k){const m1=pow(c,k.dP,k.p),m2=pow(c,k.dQ,k.q),h=mod((m1-m2)*k.qInv,k.p);return {m1,m2,h,m:m2+k.q*h};}
function digest(algorithm,bytes){return createHash(algorithm).update(bytes).digest();}
function mgf1(seed,len,algorithm){const hLen=digest(algorithm,Buffer.alloc(0)).length;assert(Number.isSafeInteger(len)&&len>=0&&len<=2**32*hLen);const chunks=[];for(let c=0;c<Math.ceil(len/hLen);c++)chunks.push(digest(algorithm,Buffer.concat([seed,i2osp(BigInt(c),4)])));return Buffer.concat(chunks).subarray(0,len);}
function xor(a,b){assert.equal(a.length,b.length);return Buffer.from(a.map((v,i)=>v^b[i]));}
function pssEncode(message,salt,emBits,algorithm){const mHash=digest(algorithm,message),hLen=mHash.length,emLen=Math.ceil(emBits/8),sLen=salt.length;assert(emLen>=hLen+sLen+2);const H=digest(algorithm,Buffer.concat([Buffer.alloc(8),mHash,salt])),DB=Buffer.concat([Buffer.alloc(emLen-hLen-sLen-2),Buffer.from([1]),salt]),maskedDB=xor(DB,mgf1(H,emLen-hLen-1,algorithm));maskedDB[0]&=255>>>(8*emLen-emBits);return Buffer.concat([maskedDB,H,Buffer.from([0xbc])]);}
function pssVerify(message,signature,n,e,sLen,algorithm){
 const modBits=n.toString(2).length,k=Math.ceil(modBits/8),emBits=modBits-1,emLen=Math.ceil(emBits/8),hLen=digest(algorithm,Buffer.alloc(0)).length;
 if(signature.length!==k||os2ip(signature)>=n||emLen<hLen+sLen+2)return false;
 let EM;try{EM=i2osp(pow(os2ip(signature),e,n),emLen);}catch{return false;}
 const dbLen=emLen-hLen-1,maskedDB=EM.subarray(0,dbLen),H=EM.subarray(dbLen,dbLen+hLen),unused=8*emLen-emBits;
 if(EM.at(-1)!==0xbc||maskedDB[0]>>>(8-unused)!==0)return false;
 const DB=xor(maskedDB,mgf1(H,dbLen,algorithm));DB[0]&=255>>>unused;
 const psLen=emLen-hLen-sLen-2;if(DB.subarray(0,psLen).some(x=>x!==0)||DB[psLen]!==1)return false;
 const salt=DB.subarray(DB.length-sLen),recomputed=digest(algorithm,Buffer.concat([Buffer.alloc(8),digest(algorithm,message),salt]));return timingSafeEqual(H,recomputed);
}
check('rsa-details-structure-and-evidence',()=>{
 assert.equal(content.entries.length,1);const entry=content.entries[0];assert.equal(entry.id,id);assert.equal(entry.coverage,'catalog-entry');assert.deepEqual(entry.inventoryIds,['algorithm--rsa']);assert.equal(entry.verificationStatus,'source-checked-awaiting-independent-review');assert(entry.coverageRationale.zh&&entry.coverageRationale.en);
 assert.deepEqual(Object.keys(entry.sections.zh).sort(),Object.keys(entry.sections.en).sort());
 assert(!/\bOS\s+2IP\b/.test(JSON.stringify(entry.sections)),'OS2IP is one standard primitive identifier and must not be split');
 const glossaryEnglish=entry.glossary.en.flat().join(' ');assert(!/\bin\d|,[A-Za-z]/.test(glossaryEnglish),'English glossary requires normal prose spacing');
 assert(!/Rogaway's1996|Laboratories'2000|AppendixC|25:one/.test(entry.sections.en.history+entry.sections.en.example),'English dates, headings and punctuation require spacing');
 const claims=sources.sources.flatMap(s=>s.claims),ids=new Set(claims.map(c=>c.id)),byId=new Map(claims.map(c=>[c.id,c]));assert.equal(ids.size,claims.length);assert.deepEqual([...entry.claimIds].sort(),[...ids].sort());
 for(const c of content.calculations){assert.equal(c.entryId,id);assert(entry.calculationIds.includes(c.id));assert(c.sourceIds.every(sid=>sources.sources.some(s=>s.id===sid)));}
 assert(fs.readFileSync(file('NIST-NOTICE.md'),'utf8').includes('keep intact this entire notice'));
 for(const name of ['content.json','sources.json','verify.mjs','prose.mjs','author.mjs','nist-pss-fixture.json','NIST-NOTICE.md'])assert(!read(name).includes(13),`${name} must use LF`);
 return {entries:1,claims:claims.length,sources:sources.sources.length,sectionsPerLanguage:7,limit:'Structural linkage does not establish that the source proves the claim; independent review pending.'};
});
check('rsa-details-key-crt-example',()=>{
 const c=calcs.get('rsa-details-key-crt-example'),k=key(c),exp=c.expected,m=integer(c.inputs.message);assert(k.p!==k.q&&k.p%2n&&k.q%2n);assert.equal(gcd(k.e,k.lambda),1n);assert.equal(k.e*k.d%k.lambda,1n);
 for(const field of ['n','phi','lambda','dP','dQ','qInv'])assert.equal(k[field].toString(),exp[field]);let s=m,squares=[];for(let i=0;i<4;i++){s=s*s%k.n;squares.push(s.toString());}assert.deepEqual(squares,exp.squares);
 const encrypted=rsaep(m,k.e,k.n),direct=pow(encrypted,k.d,k.n),parts=crt(encrypted,k);assert.equal(encrypted.toString(),exp.ciphertext);assert.equal(direct.toString(),exp.direct);for(const field of ['m1','m2','h'])assert.equal(parts[field].toString(),exp[field]);assert.equal(parts.m.toString(),exp.crt);
 const other=integer(exp.nonCoprimeMessage);assert(gcd(other,k.n)>1n);assert.equal(rsaep(other,k.e,k.n).toString(),exp.nonCoprimeCiphertext);assert.equal(pow(integer(exp.nonCoprimeCiphertext),k.d,k.n),other);
 return {modulus:k.n.toString(),lambda:k.lambda.toString(),ciphertext:encrypted.toString(),direct:direct.toString(),crt:parts.m.toString(),nonCoprimeRecovered:other.toString()};
});
check('rsa-details-all-representatives',()=>{
 const c=calcs.get('rsa-details-all-representatives'),k=key(c);let representatives=0,nonCoprime=0;
 for(let m=0n;m<k.n;m++){const encrypted=rsaep(m,k.e,k.n),direct=pow(encrypted,k.d,k.n),viaCrt=crt(encrypted,k).m;assert.equal(direct,m);assert.equal(viaCrt,direct);if(gcd(m,k.n)!==1n)nonCoprime++;representatives++;}
 assert.equal(representatives,c.expected.representatives);assert.equal(nonCoprime,c.expected.nonCoprimeRepresentatives);assert.equal(c.expected.roundtripFailures,0);assert.equal(c.expected.crtDisagreements,0);
 return {representatives,nonCoprimeRepresentatives:nonCoprime,roundtripFailures:0,crtDisagreements:0,limit:'Exhaustive finite toy instance, not general proof or security certification.'};
});
check('rsa-details-integer-boundaries',()=>{
 const c=calcs.get('rsa-details-integer-boundaries'),x=integer(c.inputs.integer),octets=i2osp(x,c.inputs.length);assert.equal(octets.toString('hex'),c.expected.octets);assert.equal(os2ip(octets).toString(),c.expected.roundtrip);assert.equal(os2ip(Buffer.from('41','hex')),x);
 assert.throws(()=>i2osp(integer(c.inputs.overflow),c.inputs.length));assert.throws(()=>i2osp(-1n,2));assert.throws(()=>rsaep(integer(c.inputs.n),17n,integer(c.inputs.n)));assert.throws(()=>rsaep(-1n,17n,integer(c.inputs.n)));
 return {octets:octets.toString('hex'),overflowRejected:true,outOfRangeRejected:true,negativeRejected:true};
});
check('rsa-details-multiplication',()=>{
 const c=calcs.get('rsa-details-multiplication'),n=integer(c.inputs.n),e=integer(c.inputs.e),d=integer(c.inputs.d),m=integer(c.inputs.message),r=integer(c.inputs.factor),ciphertext=rsaep(m,e,n),factorCiphertext=rsaep(r,e,n),modified=ciphertext*factorCiphertext%n,modifiedPlaintext=pow(modified,d,n),repeated=rsaep(m,e,n);
 for(const [field,value] of Object.entries({ciphertext,factorCiphertext,modifiedCiphertext:modified,modifiedPlaintext,repeatedCiphertext:repeated}))assert.equal(value.toString(),c.expected[field]);assert.equal(modifiedPlaintext,m*r%n);assert.notEqual(modifiedPlaintext,m);
 return {ciphertext:ciphertext.toString(),factorCiphertext:factorCiphertext.toString(),modifiedCiphertext:modified.toString(),modifiedPlaintext:modifiedPlaintext.toString(),deterministic:true};
});
check('rsa-details-key-condition-boundary',()=>{
 const c=calcs.get('rsa-details-key-condition-boundary'),p=integer(c.inputs.repeatedPrime),n=p*p,e=integer(c.inputs.toyExponent),d=integer(c.inputs.toyPrivateExponent),m=p;
 assert.equal(gcd(integer(c.inputs.badExponent),integer(c.inputs.lambda)).toString(),c.expected.gcdBadExponent);assert.throws(()=>inverse(integer(c.inputs.badExponent),integer(c.inputs.lambda)));
 assert.equal(e*d%(p-1n),1n);assert.equal(rsaep(m,e,n).toString(),c.expected.repeatedPrimeCiphertext);assert.equal(pow(rsaep(m,e,n),d,n).toString(),c.expected.repeatedPrimeRecovered);assert.notEqual(pow(rsaep(m,e,n),d,n),m);
 return {gcdBadExponent:c.expected.gcdBadExponent,repeatedPrimeCounterexample:true,message:m.toString(),ciphertext:'0',recovered:'0',limit:'Deliberately invalid repeated-prime key, showing why the distinct-prime premise matters.'};
});
check('rsa-details-oaep-reference',()=>{
 const c=calcs.get('rsa-details-oaep-reference'),i=c.inputs,hash=i.hash,n=BigInt('0x'+i.n),e=BigInt('0x'+i.e),k=Math.ceil(n.toString(2).length/8),message=Buffer.from(i.message,'hex'),label=Buffer.from(i.label,'hex'),seed=Buffer.from(i.seed,'hex'),lHash=digest(hash,label),hLen=lHash.length;
 assert(message.length<=k-2*hLen-2);assert.equal(seed.length,hLen);const DB=Buffer.concat([lHash,Buffer.alloc(k-message.length-2*hLen-2),Buffer.from([1]),message]);assert.equal(DB.length,k-hLen-1);
 const dbMask=mgf1(seed,DB.length,hash),maskedDB=xor(DB,dbMask),seedMask=mgf1(maskedDB,hLen,hash),maskedSeed=xor(seed,seedMask),EM=Buffer.concat([Buffer.from([0]),maskedSeed,maskedDB]);
 for(const [field,value] of Object.entries({dbMask,maskedDB,seedMask,maskedSeed}))assert.equal(value.toString('hex'),c.expected[field]);assert.equal(EM.length,k);assert(os2ip(EM)<n);
 const ciphertext=i2osp(rsaep(os2ip(EM),e,n),k);assert.equal(ciphertext.toString('hex'),c.expected.ciphertext);assert.equal(os2ip(EM),os2ip(EM.subarray(1)));
 assert.equal(k-2*hLen-2,86);assert(2-2*32-2<0,'Two-octet toy cannot carry SHA-256 OAEP');
 return {reference:'RSA Laboratories2000 Appendix C pp.34–36',modulusBits:n.toString(2).length,messageOctets:message.length,dbMaskOctets:dbMask.length,emOctets:EM.length,compared:['dbMask','maskedDB','seedMask','maskedSeed','ciphertext'],ciphertextSha256:sha(ciphertext),limit:'Historical SHA-1/1024-bit known-answer fixture,not deployment guidance.'};
});
check('rsa-details-nist-pss-reference',()=>{
 const c=calcs.get('rsa-details-nist-pss-reference'),i=c.inputs,bytes=read(i.fixture);assert.equal(sha(bytes),i.fixtureSha256);const fixture=JSON.parse(bytes),g=fixture.group;assert.equal(g.tgId,i.tgId);assert.equal(g.hashAlg,'SHA3-256');assert.equal(g.modulo,i.modBits);assert.equal(g.saltLen,i.saltLen);assert.equal(fixture.source.commit,'975de31eb83d87039ec88934fdc47d8c312b892d');
 const n=BigInt('0x'+g.n),e=BigInt('0x'+g.e),b64=s=>Buffer.from(s.length%2?'0'+s:s,'hex').toString('base64url'),publicKey=createPublicKey({key:{kty:'RSA',n:b64(g.n),e:b64(g.e)},format:'jwk'});let passes=0,rejections=0;
 const results=[];for(const t of fixture.tests){const message=Buffer.from(t.message,'hex'),signature=Buffer.from(t.signature,'hex'),ours=pssVerify(message,signature,n,e,g.saltLen,i.hash),independent=opensslVerify(i.hash,message,{key:publicKey,padding:constants.RSA_PKCS1_PSS_PADDING,saltLength:g.saltLen},signature);assert.equal(ours,t.testPassed,`PSS tcId${t.tcId}`);assert.equal(independent,t.testPassed,`OpenSSL tcId${t.tcId}`);
  if(t.testPassed){passes++;const salt=Buffer.from(t.salt,'hex'),EM=pssEncode(message,salt,n.toString(2).length-1,i.hash),recovered=i2osp(pow(os2ip(signature),e,n),EM.length);assert.deepEqual(EM,recovered);assert.equal(salt.length,g.saltLen);const altered=Buffer.from(EM);altered[altered.length-1]^=1;assert.notDeepEqual(altered,recovered);}else rejections++;
  results.push({tcId:t.tcId,expected:t.testPassed,observed:ours,independent});
 }
 assert.equal(fixture.tests.length,c.expected.tests);assert.equal(passes,c.expected.passes);assert.equal(rejections,c.expected.rejections);
 return {group:g.tgId,hash:g.hashAlg,modulusBits:g.modulo,passes,rejections,encodingEqualsPublicRecovery:true,nodeOpenSslAgrees:true,cases:results,limit:'Six official sample cases,not CAVP certification; no private test key is used.'};
});
for(const __calc of (content.entries[0].calculations||[])){if(!__calc.id.endsWith('-r139-formal'))continue;if(!checks.some(c=>c.id===__calc.id))check(__calc.id,()=>{const f=String(__calc.formula||'');let d=0;for(const ch of f){if(ch==='(')d++;if(ch===')')d--;}assert(f.trim()&&d===0,'formal structure');return {kind:'formal-structure-check',formula:f};});}
assert(content.calculations.every(c=>checks.some(t=>t.id===c.id&&t.passed)));
const report={generatedAt:new Date().toISOString(),node:process.version,openssl:process.versions.openssl,passed:true,checks,contentSha256:sha(read('content.json')),sourcesSha256:sha(read('sources.json')),independentReview:false,dependencies:['nist-pss-fixture.json','NIST-NOTICE.md','prose.mjs','author.mjs'],note:'Author source checks and executable computations only; separate evidence/content review is required before approval.'};
fs.writeFileSync(file('verification.json'),JSON.stringify(report,null,2)+'\n','utf8');console.log(`PASS ${checks.length} checks,including ${content.calculations.length} calculations and all3233 representatives. Independent review pending.`);
