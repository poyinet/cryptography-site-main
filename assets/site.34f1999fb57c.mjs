const data=JSON.parse(document.querySelector('#page-data').textContent),en=data.lang==='en',L=(zh,eng)=>en?eng:zh,root=new URL(data.root,location.href),$=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const store={get(k){try{return localStorage.getItem(k);}catch{return null;}},set(k,v){try{localStorage.setItem(k,v);}catch{}}};
const media=matchMedia('(prefers-color-scheme:dark)');let choice=store.get('poyi_knowledge_theme')||'system',opener;
function applyTheme(value,persist=false){choice=['system','light','dark'].includes(value)?value:'system';document.documentElement.dataset.theme=choice==='dark'||choice==='system'&&media.matches?'dark':'light';$('meta[name="theme-color"]').content=document.documentElement.dataset.theme==='dark'?'#171b2f':'#faf9f5';for(const b of $$('[data-theme-choice]'))b.setAttribute('aria-pressed',String(b.dataset.themeChoice===choice));if(persist)store.set('poyi_knowledge_theme',choice);}
applyTheme(choice);media.addEventListener('change',()=>{if(choice==='system')applyTheme(choice);});for(const b of $$('[data-theme-choice]'))b.addEventListener('click',()=>applyTheme(b.dataset.themeChoice,true));
const settings=$('#settings-dialog');function closeSettings(){settings.close();opener?.focus({preventScroll:true});}
for(const b of $$('[data-settings]'))b.addEventListener('click',()=>{opener=b;settings.showModal();offline(true);});settings.querySelector('[data-close]').addEventListener('click',closeSettings);settings.addEventListener('cancel',e=>{e.preventDefault();closeSettings();});settings.addEventListener('click',e=>{if(e.target===settings){const r=settings.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeSettings();}});
for(const a of $$('[data-language]')){const u=new URL(a.href);u.search=location.search;u.hash=location.hash;a.href=u.href;a.addEventListener('click',()=>store.set('poyi_knowledge_language',en?'zh':'en'));}
let shift=3;$('#turn-wheel')?.addEventListener('click',()=>{shift=(shift+1)%26;const letter=String.fromCharCode(65+shift);$('#wheel-letter').textContent=letter;$('[data-shift-output]').textContent=letter;$('#letter-ring').setAttribute('transform',`rotate(${(shift-3)*360/26} 300 223)`);});
for(const input of $$('[data-read]')){input.checked=store.get('poyi_knowledge_read_'+input.dataset.read)==='1';input.addEventListener('change',()=>store.set('poyi_knowledge_read_'+input.dataset.read,input.checked?'1':'0'));}
for(const label of $$('[data-read-label]'))label.textContent=store.get('poyi_knowledge_read_'+label.dataset.readLabel)==='1'?L('本机已标记已读','Marked as read'):'';
document.addEventListener('keydown',e=>{if(e.key==='/'&&!e.ctrlKey&&!e.metaKey&&!settings.open&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)&&!document.activeElement.isContentEditable){const input=$('#search')||$('#home-search');if(input){e.preventDefault();input.focus();}}});
let installPrompt;addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;$('#install').hidden=false;});$('#install').addEventListener('click',async()=>{if(!installPrompt)return;try{await installPrompt.prompt();await installPrompt.userChoice;}finally{installPrompt=null;$('#install').hidden=true;}});
const offlineState=$('#offline-state');let checking=false;
function ask(worker,type,ms=12000){return new Promise((resolve,reject)=>{const channel=new MessageChannel(),timer=setTimeout(()=>{channel.port1.close();reject(Error('timeout'));},ms);channel.port1.onmessage=e=>{clearTimeout(timer);channel.port1.close();resolve(e.data?.ready===true);};worker.postMessage({type},[channel.port2]);});}
async function offline(repair=false){
 if(checking)return;checking=true;offlineState.textContent=L('正在检查首页与专题稿缓存…','Checking cached homepages and articles…');
 try{
  if(!('serviceWorker'in navigator)||!isSecureContext)throw Error('unsupported');
  const reg=await navigator.serviceWorker.register(new URL('sw.js',root),{scope:root.pathname,updateViaCache:'none'});let worker=reg.installing||reg.waiting||reg.active;
  if(worker&&worker.state!=='activated')await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('activation')),14000),changed=()=>{if(worker.state==='activated'){clearTimeout(timer);worker.removeEventListener('statechange',changed);resolve();}else if(worker.state==='redundant'){clearTimeout(timer);reject(Error('install'));}};worker.addEventListener('statechange',changed);changed();});
  worker=reg.active;if(!worker)throw Error('missing');let ready=await ask(worker,'STATUS');if(!ready&&repair&&navigator.onLine)ready=await ask(worker,'REPAIR',30000);
  offlineState.textContent=ready?L('首页、专题稿及检索索引已可离线使用。','Homepages, articles and search index are ready offline.'):L('缓存尚未完整，请联网后检查并补齐。','Cache is incomplete. Reconnect, then check and repair.');
 }catch{offlineState.textContent=navigator.onLine?L('此环境尚未完成离线准备；在线阅读正常。','Offline preparation is unavailable here. Online reading still works.'):L('缓存状态尚未确认；请联网后重试。','Cache readiness is unconfirmed. Reconnect and retry.');}
 finally{checking=false;}
}
$('#offline-retry').addEventListener('click',()=>offline(true));const network=()=>$('#offline-toast').hidden=navigator.onLine;addEventListener('offline',network);addEventListener('online',()=>{network();offline(true);});network();if(!store.get('poyi_knowledge_offline_checked')){store.set('poyi_knowledge_offline_checked','1');setTimeout(()=>offline(true),1200);}

const FILTER_KEY='poyi_knowledge_view_filter';
function loadFilterState(){try{return JSON.parse(store.get(FILTER_KEY)||'{}')||{};}catch{return{};}}
function saveFilterState(state){try{store.set(FILTER_KEY,JSON.stringify(state));}catch{}}
for(const form of $$('[data-filters]')){
 const fields=(form.dataset.filterField||'').split(/\s+/).filter(Boolean);
 const status=form.querySelector('[data-filter-status]'),shareUrl=form.querySelector('[data-filter-url]');
 const scope=form.dataset.filters,stored=loadFilterState();
 const controls=fields.map(f=>form.querySelector(`[name="${f}"]`)).filter(Boolean);
 const params=new URLSearchParams(location.search);
 for(const ctl of controls){const fromUrl=params.get(ctl.name),fromStore=scope?stored[ctl.name]:null;ctl.value=fromUrl??fromStore??ctl.value;}
 function apply(){
  const known=(ctl)=>ctl?[...ctl.options].map(o=>o.value).filter(Boolean):[];
  const safe=(ctl,v)=>v&&known(ctl).includes(v)?v:'';
  const state={},out=new URLSearchParams(location.search);
  for(const ctl of controls){const v=ctl.value;state[ctl.name]=v;if(v)out.set(ctl.name,v);else out.delete(ctl.name);}
  saveFilterState({...stored,...state});
  history.replaceState(null,'',location.pathname+(out.size?'?'+out:'')+location.hash);
  if(shareUrl)shareUrl.value=location.href;
  if(scope==='matrix'){
   const era=safe(controls[0],state.era||''),domain=safe(controls[1],state.domain||'');let total=0,hits=0;
   for(const cell of document.querySelectorAll('td[data-era]')){
    const match=(!era||cell.dataset.era===era)&&(!domain||cell.dataset.domain===domain);
    cell.classList.toggle('is-selected',match&&(era||domain));cell.classList.toggle('is-muted',!match&&(era||domain));
    total++;if(match&&cell.querySelector('a')){hits++;const link=cell.querySelector('a');if(era&&domain&&!link.dataset.count)link.dataset.count=link.textContent;}
   }
   const link=era&&domain?document.querySelector(`td[data-era="${era}"][data-domain="${domain}"] a`):null;
   const count=link?link.textContent:'0';
   status.textContent=era||domain
    ?(en?`${hits} cells match the selection. ${era&&domain?`${count} records in this intersection.`:'Narrow both axes to open one intersection.'}`
          :`已选中 ${hits} 个格子。${era&&domain?`该交集有 ${count} 条登记记录。`:'把两个轴都选定后可直接打开交集。'}`)
    :(en?`${total} cells read straight from the catalog. Density is not completion.`:`共 ${total} 个格子，数字直接来自登记目录；密度不代表完成度。`);
  } else if(scope==='crystal'){
   const era=state.era||'',domain=state.domain||'';
   const nodes=[...document.querySelectorAll('[data-crystal-nodes] li')];
   const eraV=safe(controls[0],era),domainV=safe(controls[1],domain);
   let shown=0;
   for(const li of nodes){const match=(!eraV||li.dataset.era===eraV)&&(!domainV||li.dataset.domain===domainV);li.hidden=!match;if(match)shown++;}
   const link=eraV&&domainV?`<a href="${(new URL(`intersections/${eraV}--${domainV}/`,root)).href}">${en?'open the exact intersection page':'打开精确交集页'}</a>`:'';
   status.innerHTML=(en?`${shown} of ${nodes.length} lattice nodes match the two axes. `:`两条轴命中 ${shown} / ${nodes.length} 个晶格节点。`)+link;
  } else if(fields.length===1&&document.querySelector(`li[data-${fields[0]}]`)){
   const field=fields[0],want=safe(controls[0],state[field]||'');let rows=0,visible=0,total=0;
   for(const li of document.querySelectorAll(`li[data-${field}]`)){const match=!want||li.dataset[field]===want;li.hidden=!match;if(match)rows++;}
   for(const box of document.querySelectorAll('details.data-group, details[data-group]')){
    const live=[...box.querySelectorAll('li[data-'+field+']')].filter(li=>!li.hidden).length;
    if(box.querySelector('li[data-'+field+']')){total++;if(live||!want)visible++;box.hidden=Boolean(want)&&live===0;}
   }
   const noun={type:en?'record type':'记录类型',level:en?'registered difficulty value':'登记难度值'}[field]||(en?'axis':'轴');
   status.textContent=want?(en?`${rows} ${noun} ${want} rows in ${visible} of ${total} groups.`:`${noun} ${want}：${visible} / ${total} 个分组内共 ${rows} 行。`):(en?`${rows} rows across ${total} groups.`:`${total} 个分组、合计 ${rows} 行记录。`);
  } else if(scope==='standards'){
   const body=document.querySelector('[data-standards-body]');
   const rows=body?[...body.querySelectorAll('tr[data-type]')]:[];
   const type=safe(controls[0],state.type||''),sort=(controls[1]?state.sort:'')||'name';
   let shown=0;
   for(const tr of rows){const match=!type||tr.dataset.type===type;tr.hidden=!match;if(match)shown++;}
   const order=(a,b)=>sort==='type'?(a.dataset.type.localeCompare(b.dataset.type)||a.dataset.name.localeCompare(b.dataset.name))
    :sort==='name-desc'?b.dataset.name.localeCompare(a.dataset.name)
    :a.dataset.name.localeCompare(b.dataset.name);
   if(body&&rows.length)for(const tr of rows.slice().sort(order))body.append(tr);
   status.textContent=(en?`${shown} of ${rows.length} rows shown`:`显示 ${shown} / ${rows.length} 行`)
    +(type?(en?` (type ${type})`:`（类型 ${type}）`):'')
    +(sort&&sort!=='name'?(en?`, ordered by ${sort.replace('-',' ')}`:`，按${sort==='type'?'类型':'名称倒序'}排列`):'');
  } else if(scope==='timeline'){
   const bands=[...document.querySelectorAll('details[data-group="era"]')];
   const type=safe(controls[0],state.type||''),anchor=state.era||'',span=state.span||'all',track=state.track||'off';
   let start=0,width=bands.length;
   if(anchor){const idx=bands.findIndex(g=>g.dataset.eraId===anchor);if(idx>=0){start=idx;if(span!=='all')width=Math.min(Number(span),bands.length-start);}}
   bands.forEach((g,i)=>{g.hidden=!(i>=start&&i<start+width);});
   const visible=bands.filter(g=>!g.hidden);
   let rows=0,shown=0,tracks=0;
   for(const g of bands){
    const list=g.querySelector('[data-timeline-items]');if(!list)continue;
    const lis=[...list.querySelectorAll('li')];
    list.replaceChildren();
    for(const li of lis){const match=!type||li.dataset.type===type;li.hidden=!match;rows++;if(match&&!g.hidden)shown++;}
    if(track==='type'){
     const byLabel=new Map();
     for(const li of lis){const label=(li.querySelector('span')?.textContent||'').trim();if(!byLabel.has(label))byLabel.set(label,[]);byLabel.get(label).push(li);}
     for(const [label,items] of [...byLabel.entries()].sort((a,b)=>a[0].localeCompare(b[0]))){
      const wrap=document.createElement('div');wrap.className='era-track';wrap.dataset.track=label;
      const name=document.createElement('p');name.className='track-name';name.textContent=label;
      const ul=document.createElement('ul');ul.className='entry-list';ul.append(...items);
      wrap.append(name,ul);list.append(wrap);tracks++;
     }
    } else list.append(...lis);
   }
   status.textContent=en?`${visible.length} of ${bands.length} era bands shown${span!=='all'?` (window of ${span}${anchor?` from ${anchor}`:''})`:''}; ${shown} of ${rows} rows visible${track==='type'?`; ${tracks} type tracks built`:''}.`
    :`时代带显示 ${visible.length} / ${bands.length}${span!=='all'?`（窗口宽 ${span}${anchor?`，起自 ${anchor}`:''}）`:''}；可见记录 ${shown} / ${rows}${track==='type'?`；已分 ${tracks} 条类型轨道`:''}。`;
  } else if(fields.length===1){
   const field=fields[0],want=state[field]||'',open=form.querySelector('[name="open"]')?.checked;
   const groups=[...document.querySelectorAll(`details[data-group="${field}"]`)];
   let shown=0,items=0;
   for(const g of groups){const match=!want||g.dataset.value===want;g.hidden=!match;if(match){shown++;items+=g.querySelectorAll('a').length;}g.open=Boolean(open)||(want&&match);}
   const noun={app:en?'application field':'应用场景',kind:en?'source kind':'出处类型',letter:en?'initial letter':'首字母'}[field]||(en?'group':'分组');
   status.textContent=want?(en?`${want}: ${items} entries in this ${noun}.`:`「${want}」：${items} 条记录。`):(en?`${shown} ${noun}s, ${items} entries in total.`:`共 ${shown} 个${noun}，合计 ${items} 条记录。`);
  }
 }
 form.addEventListener('submit',e=>e.preventDefault());
 for(const ctl of controls)ctl.addEventListener('change',apply);
 const openBox=form.querySelector('[name="open"]');openBox?.addEventListener('change',apply);
 apply();
}

if(data.searchPage){
 const input=$('#search'),form=$('.full-search'),status=$('#search-status'),results=$('#search-results'),fallback=$('.catalog-fallback');let index=null,pending=0;
 const normalize=s=>String(s??'').normalize('NFKC').toLocaleLowerCase().trim();
 async function run(){
  const ticket=++pending,q=normalize(input.value).slice(0,120),params=new URLSearchParams(location.search);if(q)params.set('q',input.value.trim().slice(0,120));else params.delete('q');history.replaceState(null,'',location.pathname+(params.size?'?'+params:'')+location.hash);results.replaceChildren();
  if(!q){status.textContent=L('输入关键词检索目录和专题全文。','Enter a term to search the catalog and article text.');fallback.open=true;return;}
  status.textContent=L('正在检索…','Searching…');
  try{
   if(!index){const r=await fetch(new URL('data/search-index.json',root));if(!r.ok)throw Error('index');index=(await r.json()).items;}
   if(ticket!==pending)return;
   const terms=q.split(/\s+/).filter(Boolean),hits=index.filter(x=>x.lang===data.lang).map(x=>{const name=normalize(x.title),aliases=(x.aliases||[]).map(normalize),hay=normalize([x.title,...(x.aliases||[]),x.text].join(' '));let score=name===q?100:aliases.includes(q)?90:name.includes(q)?70:terms.every(k=>hay.includes(k))?20:0;return{x,score};}).filter(h=>h.score).sort((a,b)=>b.score-a.score||a.x.title.localeCompare(b.x.title));
   const ul=document.createElement('ul');ul.className='search-results-list';
 const appendMarked=(node,text,words)=>{
  const low=text.toLocaleLowerCase(),spans=[];
  for(const w of words){if(!w||w.length<2)continue;let at=-1;while((at=low.indexOf(w,at+1))>=0){spans.push([at,at+w.length]);if(spans.length>120)break;}}
  const merged=[];for(const s of spans.sort((a,b)=>a[0]-b[0]||b[1]-a[1])){const last=merged[merged.length-1];if(last&&s[0]<last[1]){if(s[1]>last[1])last[1]=s[1];}else merged.push([s[0],s[1]]);}
  let cur=0;for(const [a,b] of merged){if(a>cur)node.append(text.slice(cur,a));const k=document.createElement('mark');k.textContent=text.slice(a,b);node.append(k);cur=b;}
  if(cur<text.length)node.append(text.slice(cur));
 };
 for(const {x} of hits){const li=document.createElement('li'),a=document.createElement('a'),small=document.createElement('small'),p=document.createElement('p');a.href=new URL(x.url,root);a.textContent=x.title;small.textContent=x.type+' · '+(x.kind==='article'?L('专题全文','Article text'):L('目录元数据','Catalog metadata'));const source=x.text||'',i=normalize(source).indexOf(terms[0]),from=Math.max(0,i-50),cut=from+220;p.append(i>50?'…':'');appendMarked(p,source.slice(from,cut),terms);if(source.length>cut)p.append('…');li.append(a,small,p);ul.append(li);}results.append(ul);status.textContent=L(`找到 ${hits.length} 条结果。`,`Found ${hits.length} results.`);fallback.open=hits.length===0;
  }catch{if(ticket!==pending)return;status.textContent=L('检索索引暂不可用；仍可使用下面的完整静态目录。','The index is unavailable. Use the complete static catalog below.');fallback.open=true;}
 }
 input.value=(new URLSearchParams(location.search).get('q')||'').slice(0,120);form.addEventListener('submit',e=>{e.preventDefault();run();});let timer;input.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(run,100);});run();
}
// V1 three-dimensional lattice navigation. The node offsets come only from the registered era,
// domain and type axes; the rest state stays exactly the flat grid, so nothing overflows or claims
// geometry that the catalog does not hold.
const latticeViewer=$('[data-lattice-viewer]');
if(latticeViewer){
 const list=$('[data-crystal-nodes]');
 const nodes=list?[...list.querySelectorAll('li')]:[];
 const eraOrder=[...$$('select[name="era"] option')].map((o)=>o.value).filter(Boolean);
 const domainOrder=[...$$('select[name="domain"] option')].map((o)=>o.value).filter(Boolean);
 const depthLabels=[...new Set(nodes.map((li)=>(li.querySelector('span')?.textContent||'').trim()))].sort();
 const centre=(i,n)=>i-(n-1)/2;
 const offsets=new Map();
 for(const li of nodes){
  const d=domainOrder.indexOf(li.dataset.domain),e=eraOrder.indexOf(li.dataset.era),t=depthLabels.indexOf((li.querySelector('span')?.textContent||'').trim());
  offsets.set(li,`translate3d(${centre(Math.max(d,0),Math.max(domainOrder.length,1))*9}px, ${centre(Math.max(e,0),Math.max(eraOrder.length,1))*5}px, ${Math.max(t,0)*24}px)`);
 }
 const stage=document.createElement('div');stage.className='lattice-3d';stage.setAttribute('data-lattice-stage','');
 if(list&&list.parentNode){list.parentNode.insertBefore(stage,list);stage.append(list);list.style.transformStyle='preserve-3d';}
 let yaw=0,pitch=0;
 const orient=$('[data-lattice-orientation]');
 const apply=()=>{
  const posed=Boolean(yaw||pitch);
  for(const li of nodes)li.style.transform=posed?(offsets.get(li)||''):'';
  if(stage)stage.style.transform=posed?`rotateX(${pitch}deg) rotateY(${yaw}deg)`:'';
  if(orient)orient.textContent=posed
   ?(en?`3D pose: ${yaw}° yaw, ${pitch}° pitch over ${nodes.length} lattice nodes. The pose changes the viewpoint only.`:`三维姿态：${nodes.length} 个节点，偏航 ${yaw}°、俯仰 ${pitch}°；只改变观察角度。`)
   :L('当前是平面视图。按下方向键后，同一批节点按三维姿态呈现；视角不新增任何关系或核证状态。','Flat view now. The direction keys pose the same nodes in three dimensions; the pose adds no relations and no verification status.');
 };
 for(const button of $$('[data-orbit]'))button.addEventListener('click',()=>{
  const value=button.dataset.orbit;
  if(value==='reset'){yaw=0;pitch=0;}
  else{const kind=value.startsWith('yaw')?'yaw':'pitch',dir=value.endsWith('+')?1:-1;
   if(kind==='yaw')yaw=Math.max(-60,Math.min(60,yaw+dir*15));else pitch=Math.max(-50,Math.min(50,pitch+dir*10));}
  apply();
 });
 apply();
}
