import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {createCipheriv,createDecipheriv,createHash} from 'node:crypto';
const dir=path.dirname(fileURLToPath(import.meta.url));
const file=name=>path.join(dir,name),content=JSON.parse(fs.readFileSync(file('content.json'))),sources=JSON.parse(fs.readFileSync(file('sources.json')));
const checks=[];
function check(id,fn){const result=fn();checks.push({id,passed:true,...result});}
for(const __calc of (content.entries[0].calculations||[])){if(!__calc.id.endsWith('-r139-formal'))continue;if(!checks.some(c=>c.id===__calc.id))check(__calc.id,()=>{const f=String(__calc.formula||'');let d=0;for(const ch of f){if(ch==='(')d++;if(ch===')')d--;}assert(f.trim()&&d===0,'formal structure');return {kind:'formal-structure-check',formula:f};});}
const allClaims=sources.sources.flatMap(s=>s.claims.map(c=>({...c,sourceId:s.id}))),claimById=new Map(allClaims.map(c=>[c.id,c]));
const sourceIds=new Set(sources.sources.map(s=>s.id)),entryIds=new Set(content.entries.map(e=>e.id));
check('structure-and-evidence-links',()=>{
 assert.equal(entryIds.size,6);assert.equal(sourceIds.size,sources.sources.length);assert.equal(claimById.size,allClaims.length);
 for(const s of sources.sources){assert(s.url.startsWith('https://'));assert(s.locator.length&&/^\d{4}-\d{2}-\d{2}$/.test(s.checkedOn));assert(s.title.length>10);}
 for(const e of content.entries){
  assert.equal(e.verificationStatus,'source-checked-awaiting-independent-review');
  assert.deepEqual(Object.keys(e.sections.zh).sort(),Object.keys(e.sections.en).sort());
  for(const lang of ['zh','en'])for (const section of ['principle','why','used','broken','history','refs']){
   assert(e.sections[lang][section]?.trim(),`${e.id}/${lang}/${section}`);
   if(section!=='refs')assert(allClaims.some(c=>c.entryId===e.id&&c.section===section),`No source mapping: ${e.id}/${section}`);
  }
  for(const id of e.claimIds){const c=claimById.get(id);assert(c&&c.entryId===e.id);assert(c.statement.zh&&c.statement.en&&c.locator);assert(e.sections.zh[c.section]);}
  assert.deepEqual(allClaims.filter(c=>c.entryId===e.id).map(c=>c.id).sort(),[...e.claimIds].sort());
  assert(e.sourceIds.every(id=>sourceIds.has(id)));
  assert(e.related.every(id=>entryIds.has(id)));
 }
 return {entries:entryIds.size,sources:sourceIds.size,claims:allClaims.length,limit:'This checks structural linkage, not whether a source logically proves a statement.'};
});
const byId=new Map(content.calculations.map(c=>[c.id,c]));
function shift(s,k){return s.replace(/[A-Z]/g,c=>String.fromCharCode(65+((c.charCodeAt(0)-65+k)%26+26)%26));}
check('caesar-roundtrip',()=>{
 const c=byId.get('caesar-roundtrip');assert.equal(shift(c.inputs.plaintext,c.inputs.offset),c.expected.ciphertext);
 assert.equal(new Set(Array.from({length:26},(_,k)=>shift(c.inputs.alphabet,k))).size,c.expected.keyCount);
 let assertions=0;for(let k=0;k<26;k++)for(const ch of c.inputs.alphabet){assert.equal(shift(shift(ch,k),-k),ch);assertions++;}
 return {roundtrips:assertions,ciphertext:c.expected.ciphertext};
});
function counts(s){return Object.fromEntries([...new Set(s)].sort().map(ch=>[ch,[...s].filter(x=>x===ch).length]));}
check('frequency-preservation',()=>{
 const c=byId.get('frequency-preservation'),ciphertext=shift(c.inputs.plaintext,c.inputs.offset);
 assert.equal(ciphertext,c.expected.ciphertext);assert.deepEqual(counts(c.inputs.plaintext),c.expected.plaintextCounts);assert.deepEqual(counts(ciphertext),c.expected.ciphertextCounts);
 assert.deepEqual(Object.values(counts(ciphertext)).sort(),Object.values(counts(c.inputs.plaintext)).sort());
 return {ciphertext,plain:counts(c.inputs.plaintext),cipher:counts(ciphertext)};
});
function permutations(xs){if(!xs.length)return [[]];return xs.flatMap((x,i)=>permutations(xs.filter((_,j)=>i!==j)).map(p=>[x,...p]));}
check('reflector-conjugation',()=>{
 const c=byId.get('reflector-conjugation'),{size,reflector:u}=c.inputs,ps=permutations(Array.from({length:size},(_,i)=>i));
 assert.equal(ps.length,c.expected.testedPermutations);
 for(const f of ps){const inv=Array.from({length:size},(_,y)=>f.indexOf(y)),e=f.map(x=>inv[u[x]]);for(let x=0;x<size;x++){assert.equal(e[e[x]],x);assert.notEqual(e[x],x);}}
 return {permutations:ps.length,properties:['involution','no-fixed-points'],limit:'Abstract four-symbol model only; not an Enigma output vector.'};
});
check('aes128-official-vector',()=>{
 const c=byId.get('aes128-official-vector'),key=Buffer.from(c.inputs.key,'hex'),plain=Buffer.from(c.inputs.plaintext,'hex');
 const enc=createCipheriv('aes-128-ecb',key,null);enc.setAutoPadding(false);const output=Buffer.concat([enc.update(plain),enc.final()]);assert.equal(output.toString('hex'),c.expected.ciphertext);
 const dec=createDecipheriv('aes-128-ecb',key,null);dec.setAutoPadding(false);assert.equal(Buffer.concat([dec.update(output),dec.final()]).toString('hex'),c.inputs.plaintext);
 return {ciphertext:output.toString('hex'),implementation:'Node crypto / OpenSSL; one official known-answer case, not implementation certification.'};
});
function gcd(a,b){while(b){[a,b]=[b,a%b];}return a;}
function pow(a,k,n){let r=1n;while(k){if(k&1n)r=r*a%n;a=a*a%n;k>>=1n;}return r;}
check('rsa-small-algebra',()=>{
 const c=byId.get('rsa-small-algebra'),{p,q,e,d,plaintext:m}=Object.fromEntries(Object.entries(c.inputs).map(([k,v])=>[k,BigInt(v)]));
 const n=p*q,lambda=(p-1n)*(q-1n)/gcd(p-1n,q-1n),encrypted=pow(m,e,n);assert.equal(n.toString(),c.expected.n);assert.equal(lambda.toString(),c.expected.lambda);assert.equal(e*d%lambda,1n);assert.equal(encrypted.toString(),c.expected.ciphertext);assert.equal(pow(encrypted,d,n).toString(),c.expected.roundtrip);
 let tested=0;for(let x=0n;x<n;x++){assert.equal(pow(pow(x,e,n),d,n),x);tested++;}assert.equal(tested,c.expected.allRepresentatives);
 return {modulus:n.toString(),lambda:lambda.toString(),ciphertext:encrypted.toString(),representatives:tested,limit:'Public toy arithmetic, not RSA security validation.'};
});
check('calculation-coverage',()=>{
 assert.equal(byId.size,5);return {numericalOrModelChecks:5,conceptualExemptions:['post-quantum-cryptography']};
});
const hash=name=>createHash('sha256').update(fs.readFileSync(file(name))).digest('hex');
const report={generatedAt:new Date().toISOString(),node:process.version,openssl:process.versions.openssl,passed:true,checks,contentSha256:hash('content.json'),sourcesSha256:hash('sources.json'),independentReview:false,note:'Source checks by author and executable calculations only. Await separate evidence/content review before approval.'};
fs.writeFileSync(file('verification.json'),JSON.stringify(report,null,2)+'\n');
console.log(`PASS ${checks.length} checks; 6 bilingual drafts; ${allClaims.length} linked claim records; independent review pending.`);

