import fs from 'node:fs';
const c=JSON.parse(fs.readFileSync('content.json','utf8'));
let checked=0,bad=0;
for(const e of c.entries||[])for(const x of e.calculations||[]){
 checked++;const f=String(x.formula||'');
 let depth=0;for(const ch of f){if(ch==='(')depth++;if(ch===')')depth--;}
 if(!f.trim()||depth!==0)bad++;
}
console.log(JSON.stringify({checked,bad,kind:'formal-structure-only'}));
if(bad)process.exit(1);
