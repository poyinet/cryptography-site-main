/**
 * Educational AES block transformation, written to expose intermediate states.
 * NOT production cryptography: JavaScript tables/branches are not constant-time,
 * secrets are copied and not reliably erased, and this has no authenticated mode.
 * FIPS 197-upd1 §§3–5 supplies the algorithm; this is original teaching code.
 */
export function fromHex(value){
 if(typeof value!=='string'||value.length%2||!/^[0-9a-f]*$/i.test(value))throw new TypeError('Expected an even-length hexadecimal string');
 return Uint8Array.from(value.match(/../g)||[],s=>parseInt(s,16));
}
export const toHex=bytes=>Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
function byteArray(value,length){
 if(!(value instanceof Uint8Array)||value.length!==length)throw new TypeError(`Expected ${length} bytes`);
 return Uint8Array.from(value);
}
export const xtime=b=>((b<<1)^((b&0x80)?0x11b:0))&0xff;
export function multiply(a,b){
 let result=0;
 for(let bit=0;bit<8;bit++){if(b&1)result^=a;a=xtime(a);b>>>=1;}
 return result;
}
export function power(a,n){let result=1;while(n){if(n&1)result=multiply(result,a);a=multiply(a,a);n>>>=1;}return result;}
const rotateByte=(b,n)=>((b<<n)|(b>>>(8-n)))&0xff;
export function substituteByte(b){
 const inverse=b===0?0:power(b,254);
 return inverse^rotateByte(inverse,1)^rotateByte(inverse,2)^rotateByte(inverse,3)^rotateByte(inverse,4)^0x63;
}
export const SBOX=Uint8Array.from({length:256},(_,i)=>substituteByte(i));
export const INVERSE_SBOX=new Uint8Array(256);
for(let i=0;i<256;i++)INVERSE_SBOX[SBOX[i]]=i;
export const substitute=(state,inverse=false)=>Uint8Array.from(state,b=>(inverse?INVERSE_SBOX:SBOX)[b]);
export function shiftRows(state,inverse=false){
 const next=new Uint8Array(16);
 for(let row=0;row<4;row++)for(let column=0;column<4;column++){
  const sourceColumn=(column+(inverse?-row:row)+4)%4;
  next[row+4*column]=state[row+4*sourceColumn];
 }
 return next;
}
const FORWARD_MIX=[[2,3,1,1],[1,2,3,1],[1,1,2,3],[3,1,1,2]];
const INVERSE_MIX=[[14,11,13,9],[9,14,11,13],[13,9,14,11],[11,13,9,14]];
export function mixColumns(state,inverse=false){
 const matrix=inverse?INVERSE_MIX:FORWARD_MIX,next=new Uint8Array(16);
 for(let c=0;c<4;c++)for(let r=0;r<4;r++)for(let k=0;k<4;k++)next[r+4*c]^=multiply(matrix[r][k],state[k+4*c]);
 return next;
}
export function expandKey(key){
 if(!(key instanceof Uint8Array)||![16,24,32].includes(key.length))throw new TypeError('AES key must contain 16, 24 or 32 bytes');
 const Nk=key.length/4,Nr=Nk+6,wordCount=4*(Nr+1),words=[];
 for(let i=0;i<Nk;i++)words.push(Uint8Array.from(key.slice(i*4,i*4+4)));
 let roundConstant=1;
 for(let i=Nk;i<wordCount;i++){
  let temp=Uint8Array.from(words[i-1]);
  if(i%Nk===0){temp=Uint8Array.from([temp[1],temp[2],temp[3],temp[0]],x=>SBOX[x]);temp[0]^=roundConstant;roundConstant=xtime(roundConstant);}
  else if(Nk===8&&i%Nk===4)temp=Uint8Array.from(temp,x=>SBOX[x]);
  words.push(Uint8Array.from(temp,(x,j)=>x^words[i-Nk][j]));
 }
 const roundKeys=Array.from({length:Nr+1},(_,r)=>Uint8Array.from(words.slice(4*r,4*r+4).flatMap(w=>Array.from(w))));
 return {Nk,Nr,words,roundKeys};
}
export const addRoundKey=(state,key)=>Uint8Array.from(state,(b,i)=>b^key[i]);
export function encryptBlock(input,key,{trace=false}={}){
 let state=byteArray(input,16);const {Nr,roundKeys}=expandKey(key),steps=[];
 function record(round,operation){if(trace)steps.push({round,operation,state:toHex(state)});}
 state=addRoundKey(state,roundKeys[0]);record(0,'AddRoundKey');
 for(let r=1;r<=Nr;r++){
  state=substitute(state);record(r,'SubBytes');
  state=shiftRows(state);record(r,'ShiftRows');
  if(r!==Nr){state=mixColumns(state);record(r,'MixColumns');}
  state=addRoundKey(state,roundKeys[r]);record(r,'AddRoundKey');
 }
 return trace?{output:state,steps}:state;
}
export function decryptBlock(input,key,{trace=false}={}){
 let state=byteArray(input,16);const {Nr,roundKeys}=expandKey(key),steps=[];
 function record(round,operation){if(trace)steps.push({round,operation,state:toHex(state)});}
 state=addRoundKey(state,roundKeys[Nr]);record(Nr,'AddRoundKey');
 for(let r=Nr-1;r>=0;r--){
  state=shiftRows(state,true);record(r,'InvShiftRows');
  state=substitute(state,true);record(r,'InvSubBytes');
  state=addRoundKey(state,roundKeys[r]);record(r,'AddRoundKey');
  if(r!==0){state=mixColumns(state,true);record(r,'InvMixColumns');}
 }
 return trace?{output:state,steps}:state;
}
export function stateRows(state){return Array.from({length:4},(_,r)=>Array.from({length:4},(_,c)=>state[r+4*c]));}
