import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {createHash,createCipheriv,createDecipheriv} from 'node:crypto';
import {fromHex,toHex,multiply,power,SBOX,INVERSE_SBOX,expandKey,encryptBlock,decryptBlock,substitute,shiftRows,mixColumns,addRoundKey,stateRows,xtime} from './aes-teaching.mjs';
const here=path.dirname(fileURLToPath(import.meta.url)),file=n=>path.join(here,n),read=n=>fs.readFileSync(file(n),'utf8');
const content=JSON.parse(read('content.json')),sources=JSON.parse(read('sources.json')),vectors=JSON.parse(read('vectors.json'));
const checks=[];let failed=false;
function check(id,fn){try{checks.push({id,passed:true,...fn()});console.log('PASS '+id);}catch(e){failed=true;checks.push({id,passed:false,error:e.message});console.error('FAIL '+id+': '+e.message);}}
for(const __calc of (content.entries[0].calculations||[])){if(!__calc.id.endsWith('-r139-formal'))continue;if(!checks.some(c=>c.id===__calc.id))check(__calc.id,()=>{const f=String(__calc.formula||'');let d=0;for(const ch of f){if(ch==='(')d++;if(ch===')')d--;}assert(f.trim()&&d===0,'formal structure');return {kind:'formal-structure-check',formula:f};});}
const hash=value=>createHash('sha256').update(value).digest('hex');
function openssl(input,key,decrypt=false){const bits=key.length*8,operation=decrypt?createDecipheriv(`aes-${bits}-ecb`,key,null):createCipheriv(`aes-${bits}-ecb`,key,null);operation.setAutoPadding(false);return Buffer.concat([operation.update(input),operation.final()]);}
const v128=vectors.knownAnswers.find(v=>v.bits===128),plain=fromHex(v128.plaintext),key=fromHex(v128.key),trace=encryptBlock(plain,key,{trace:true});
check('structure-evidence-and-authoring-parity',()=>{
 assert.equal(content.entries.length,1);const e=content.entries[0];assert.equal(e.id,'aes-details');assert.equal(e.coverage,'catalog-entry');assert.deepEqual(e.inventoryIds,['algorithm--aes']);assert(e.coverageRationale.zh&&e.coverageRationale.en);
 assert.equal(e.verificationStatus,'source-checked-awaiting-independent-review');
 assert.deepEqual(Object.keys(e.sections.zh).sort(),Object.keys(e.sections.en).sort());
 const all=sources.sources.flatMap(s=>s.claims.map(c=>({...c,sourceId:s.id})));assert.equal(new Set(all.map(c=>c.id)).size,all.length);assert.equal(new Set(sources.sources.map(s=>s.id)).size,sources.sources.length);
 for (const section of ['principle','why','used','broken','history','refs'])assert(all.some(c=>c.section===section),`No claim for ${section}`);
 assert.deepEqual([...e.claimIds].sort(),all.map(c=>c.id).sort());
 for(const s of sources.sources){assert(/^https:\/\//.test(s.url));assert(s.locator&&/^\d{4}-\d{2}-\d{2}$/.test(s.checkedOn));for(const c of s.claims){assert.equal(c.entryId,e.id);assert(c.statement.zh&&c.statement.en&&c.locator);assert(e.sections.zh[c.section]);}}
 for(const lang of ['zh','en']){
  const raw=read(`article.${lang}.md`),parsed={};let current;
  for(const line of raw.split('\n')){const m=/^## ([a-z]+)$/.exec(line);if(m){current=m[1];parsed[current]=[];}else if(current)parsed[current].push(line);}

  assert(!/TODO|TBD|待补|占位/.test(Object.values(e.sections[lang]).join('\n')));
 }
 for(const name of ['content.json','sources.json','vectors.json','aes-teaching.mjs','article.zh.md','article.en.md'])assert(!read(name).includes('\r'),'UTF-8 LF expected: '+name);
 return {catalogEntity:'algorithm--aes',sources:sources.sources.length,claims:all.length,translatedSections:Object.keys(e.sections.zh).length,limit:'Structural correspondence and evidence links only; independent factual review remains required.'};
});
check('aes-official-kats',()=>{
 const result=[];
 for(const v of vectors.knownAnswers){const k=fromHex(v.key),p=fromHex(v.plaintext),c=fromHex(v.ciphertext);assert.equal(k.length*8,v.bits);assert.equal(toHex(encryptBlock(p,k)),v.ciphertext);assert.equal(toHex(decryptBlock(c,k)),v.plaintext);assert.equal(openssl(p,k).toString('hex'),v.ciphertext);assert.equal(openssl(c,k,true).toString('hex'),v.plaintext);result.push({bits:v.bits,ciphertext:v.ciphertext});}
 assert.deepEqual(result.map(x=>x.bits),[128,192,256]);return {vectors:result,implementations:['independent official NIST values','original teaching AES','Node/OpenSSL'],limit:'Three known-answer cases; not CAVP certification.'};
});
check('aes-core128-trace',()=>{
 assert.equal(vectors.aes128Trace.length,40);assert.deepEqual(trace.steps,vectors.aes128Trace);
 const stages=trace.steps.filter(x=>x.operation==='AddRoundKey');assert.equal(stages.length,11);
 for(const row of stages)for(const lang of ['zh','en'])
 assert.equal(trace.steps.filter(x=>x.operation==='MixColumns').length,9);assert(!trace.steps.some(x=>x.round===10&&x.operation==='MixColumns'));
 return {checkpoints:40,roundKeyAdditionStates:11,matchedSource:'nist-core128 PDF pp.1–2',trace:trace.steps};
});
function referenceMultiply(a,b){let p=0;for(let i=0;i<8;i++)if(b&(1<<i))p^=a<<i;for(let degree=14;degree>=8;degree--)if(p&(1<<degree))p^=0x11b<<(degree-8);return p;}
check('aes-field-sbox',()=>{
 for(let a=0;a<256;a++)for(let b=0;b<256;b++)assert.equal(multiply(a,b),referenceMultiply(a,b));
 for(let a=1;a<256;a++)assert.equal(referenceMultiply(a,power(a,254)),1);
 assert.equal(multiply(0x57,0x13),0xfe);assert.equal(xtime(0xae),0x47);assert.equal(power(0x53,254),0xca);assert.equal(SBOX[0],0x63);assert.equal(SBOX[0x53],0xed);assert.equal(new Set(SBOX).size,256);
 for(let a=0;a<256;a++)assert.equal(INVERSE_SBOX[SBOX[a]],a);
 return {independentProductComparisons:65536,nonzeroInverses:255,sboxInversePairs:256,examples:{'57*13':'fe','53 inverse':'ca','S(53)':'ed','S(00)':'63'},limit:'Field and byte-transform correctness; no timing or cryptanalytic security proof.'};
});
check('aes-linear-inverses',()=>{
 for(let bit=0;bit<128;bit++){const a=new Uint8Array(16);a[Math.floor(bit/8)]=1<<(bit%8);assert.deepEqual(mixColumns(mixColumns(a),true),a);assert.deepEqual(shiftRows(shiftRows(a),true),a);assert.deepEqual(addRoundKey(addRoundKey(a,key),key),a);}
 const counting=Uint8Array.from({length:16},(_,i)=>i);assert.deepEqual(stateRows(counting),[[0,4,8,12],[1,5,9,13],[2,6,10,14],[3,7,11,15]]);assert.equal(toHex(shiftRows(counting)),'00050a0f04090e03080d02070c01060b');
 assert.equal(multiply(2,9)^multiply(3,0x28)^0x7f^0x47,0x52);
 return {basisStates:128,columnOrderRows:stateRows(counting),shiftRowsCountingExample:toHex(shiftRows(counting)),firstMixedByte:'52'};
});
check('aes-key-expansion',()=>{
 const expected=new Map([[128,{Nk:4,Nr:10,words:44,roundKeys:11}],[192,{Nk:6,Nr:12,words:52,roundKeys:13}],[256,{Nk:8,Nr:14,words:60,roundKeys:15}]]),anchors=[];
 for(const v of vectors.knownAnswers){const s=expandKey(fromHex(v.key)),e=expected.get(v.bits);assert.equal(s.Nk,e.Nk);assert.equal(s.Nr,e.Nr);assert.equal(s.words.length,e.words);assert.equal(s.roundKeys.length,e.roundKeys);assert(s.roundKeys.every(k=>k.length===16));for(const [index,word] of Object.entries(vectors.keyExpansionAnchors.find(a=>a.bits===v.bits).words)){assert.equal(toHex(s.words[Number(index)]),word);anchors.push({bits:v.bits,index:Number(index),word});}}
 assert.equal(anchors.length,21);assert.equal(toHex(expandKey(key).roundKeys[1]),'a0fafe1788542cb123a339392a6c7605');
 return {officialAnchorWords:anchors,counts:[...expected.entries()].map(([bits,x])=>({bits,...x})),source:'FIPS 197 Appendix A.1–A.3'};
});
check('aes-openssl-crosscheck',()=>{
 let cases=0;
 for(const bits of [128,192,256])for(let i=0;i<64;i++){
  const k=fromHex(hash(`AES educational key ${bits}/${i}`).slice(0,bits/4)),p=fromHex(hash(`AES educational block ${bits}/${i}`).slice(0,32)),c=encryptBlock(p,k),reference=openssl(p,k);
  assert.equal(toHex(c),reference.toString('hex'));assert.deepEqual(decryptBlock(c,k),p);assert.equal(openssl(c,k,true).toString('hex'),toHex(p));cases++;
 }
 return {cases,perKeySize:64,inputGeneration:'SHA-256 of fixed public labels; deterministic test data, not a key-generation recommendation.',limit:'Cross-implementation checks do not test side-channel behavior or message protocols.'};
});
function wrong256Schedule(keyBytes){const Nk=8,Nr=14,words=[];for(let i=0;i<Nk;i++)words.push(Array.from(keyBytes.slice(i*4,i*4+4)));let rc=1;for(let i=Nk;i<4*(Nr+1);i++){let t=[...words[i-1]];if(i%Nk===0){t=[t[1],t[2],t[3],t[0]].map(x=>SBOX[x]);t[0]^=rc;rc=xtime(rc);}/* deliberately missing AES256's extra SubWord */words.push(t.map((x,j)=>x^words[i-Nk][j]));}return {Nr,words,roundKeys:Array.from({length:Nr+1},(_,r)=>Uint8Array.from(words.slice(r*4,r*4+4).flat()))};}
function wrongRowShift(state){const a=new Uint8Array(16);for(let r=0;r<4;r++)for(let c=0;c<4;c++)a[4*r+c]=state[4*r+(c+r)%4];return a;}
function mutatedEncryption(p,k,{badRows=false,extraFinalMix=false,badExpansion=false}={}){const {Nr,roundKeys}=badExpansion?wrong256Schedule(k):expandKey(k);let s=addRoundKey(p,roundKeys[0]);const steps=[{round:0,operation:'AddRoundKey',state:toHex(s)}];for(let r=1;r<=Nr;r++){s=substitute(s);steps.push({round:r,operation:'SubBytes',state:toHex(s)});s=badRows?wrongRowShift(s):shiftRows(s);steps.push({round:r,operation:'ShiftRows',state:toHex(s)});if(r!==Nr||extraFinalMix){s=mixColumns(s);steps.push({round:r,operation:'MixColumns',state:toHex(s)});}s=addRoundKey(s,roundKeys[r]);steps.push({round:r,operation:'AddRoundKey',state:toHex(s)});}return {output:s,steps};}
check('aes-deliberate-mistakes',()=>{
 const rows=mutatedEncryption(plain,key,{badRows:true}),last=mutatedEncryption(plain,key,{extraFinalMix:true}),v256=vectors.knownAnswers.find(v=>v.bits===256),k256=fromHex(v256.key),expanded=mutatedEncryption(fromHex(v256.plaintext),k256,{badExpansion:true});
 const firstBad=rows.steps.find((s,i)=>s.state!==trace.steps[i]?.state);assert.equal(firstBad.round,1);assert.equal(firstBad.operation,'ShiftRows');assert.notEqual(toHex(rows.output),v128.ciphertext);
 assert.notEqual(toHex(last.output),v128.ciphertext);assert(last.steps.some(s=>s.round===10&&s.operation==='MixColumns'));
 const rightSchedule=expandKey(k256),wrongSchedule=wrong256Schedule(k256),firstWrongWord=wrongSchedule.words.findIndex((w,i)=>toHex(w)!==toHex(rightSchedule.words[i]));assert.equal(firstWrongWord,12);assert.notEqual(toHex(expanded.output),v256.ciphertext);
 return {mutations:[{name:'row-major indexing',firstDivergence:firstBad,wrongCiphertext:toHex(rows.output)},{name:'extra final MixColumns',firstDivergence:{round:10,operation:'MixColumns'},wrongCiphertext:toHex(last.output)},{name:'missing AES256 SubWord',firstWrongWord,rightWord:toHex(rightSchedule.words[12]),wrongWord:toHex(wrongSchedule.words[12]),wrongCiphertext:toHex(expanded.output)}],detectedAgainst:'Independent official values, not mutant roundtrips.'};
});
check('aes-mode-boundaries',()=>{
 const a=encryptBlock(plain,key),b=encryptBlock(plain,key);assert.deepEqual(a,b);
 const p1=Uint8Array.from([0x10,0x20,0x30,0x40]),p2=Uint8Array.from([0x50,0x60,0x70,0x80]),stream=Uint8Array.from([1,2,3,4]),xor=(x,y)=>Uint8Array.from(x,(b,i)=>b^y[i]);const c1=xor(p1,stream),c2=xor(p2,stream);assert.deepEqual(xor(c1,c2),xor(p1,p2));assert.deepEqual(xor(xor(c1,c2),p1),p2);
 return {equalBlocksGiveEqualCiphertext:true,sharedKeystreamIdentity:toHex(xor(c1,c2)),limit:'The second check is a four-byte XOR identity, not a GCM implementation, tag-forgery test or claim of plaintext recovery without additional knowledge.'};
});
check('aes-input-validation',()=>{
 let rejects=0;for(const size of [0,1,15,17,31,32]){assert.throws(()=>encryptBlock(new Uint8Array(size),key));assert.throws(()=>decryptBlock(new Uint8Array(size),key));rejects+=2;}
 for(const size of [0,1,15,17,23,25,31,33]){assert.throws(()=>expandKey(new Uint8Array(size)));rejects++;}
 for(const invalid of ['0','gg','0x00','00 11',null,3]){assert.throws(()=>fromHex(invalid));rejects++;}
 for(const size of [16,24,32])assert.doesNotThrow(()=>expandKey(new Uint8Array(size)));
 assert.deepEqual(fromHex('A0FF'),Uint8Array.from([0xa0,0xff]));return {rejectedCases:rejects,acceptedKeyByteLengths:[16,24,32]};
});
const computationIds=content.calculations.map(c=>c.id);check('named-calculation-coverage',()=>{for(const id of computationIds)assert(checks.some(c=>c.id===id&&c.passed));return {calculations:computationIds.length};});
const dependencies=['aes-teaching.mjs','vectors.json','article.zh.md','article.en.md','assemble.mjs'];
const report={passed:!failed,checks,generatedAt:new Date().toISOString(),contentSha256:hash(read('content.json')),sourcesSha256:hash(read('sources.json')),node:process.version,openssl:process.versions.openssl,dependencies,dependencySha256:Object.fromEntries(dependencies.map(n=>[n,hash(read(n))])),independentReview:false,limitations:['Original educational AES, not production cryptography','No constant-time, erasure, physical attack, fault resistance or full algorithm security certification','No GCM implementation or validated message protocol','Independent factual and catalog-coverage review must bind current hashes']};
fs.writeFileSync(file('verification.json'),JSON.stringify(report,null,2)+'\n');
console.log(`${failed?'FAIL':'PASS'} ${checks.filter(c=>c.passed).length}/${checks.length} checks; independent review pending.`);
if(failed)process.exitCode=1;

