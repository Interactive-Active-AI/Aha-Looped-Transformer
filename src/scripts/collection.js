const root=document.getElementById('atlas');
const $=s=>root.querySelector(s),$$=s=>[...root.querySelectorAll(s)];
const grid=$('#cards'),cards=$$('#cards .paper'),boxes=$$('[data-compare]');
const valid=new Set(cards.map(c=>c.dataset.paper));
const topicKeys=new Set($$('[data-topic]').map(b=>b.dataset.topic));
const search=$('#q'),sortSelect=$('#sort'),yearSelect=$('#year');
const PAGE=24;
const state={view:'explore',family:'all',topics:new Set(),has:new Set(),year:'',sort:'newest',layout:'grid',q:'',compare:new Set(),shown:PAGE};

function readURL(){
 const p=new URLSearchParams(location.search);
 state.view=['timeline','compare'].includes(p.get('view'))?p.get('view'):'explore';
 state.family=['adaptive','core','full'].includes(p.get('filter'))?p.get('filter'):'all';
 state.topics=new Set((p.get('topic')||'').split(',').filter(t=>topicKeys.has(t)));
 state.has=new Set((p.get('has')||'').split(',').filter(h=>h==='code'||h==='weights'));
 state.year=['2026','2025','older'].includes(p.get('year'))?p.get('year'):'';
 state.sort=['oldest','name'].includes(p.get('sort'))?p.get('sort'):'newest';
 state.layout=p.get('layout')==='list'?'list':'grid';
 state.q=p.get('q')||'';
 state.compare=new Set((p.get('compare')||'').split(',').filter(id=>valid.has(id)).slice(0,3));
 search.value=state.q;sortSelect.value=state.sort;yearSelect.value=state.year;
}
function saveURL(push=false){
 const p=new URLSearchParams();
 if(state.view!=='explore')p.set('view',state.view);
 if(state.family!=='all')p.set('filter',state.family);
 if(state.topics.size)p.set('topic',[...state.topics].join(','));
 if(state.has.size)p.set('has',[...state.has].join(','));
 if(state.year)p.set('year',state.year);
 if(state.sort!=='newest')p.set('sort',state.sort);
 if(state.layout!=='grid')p.set('layout',state.layout);
 if(state.q)p.set('q',state.q);
 if(state.compare.size)p.set('compare',[...state.compare].join(','));
 history[push?'pushState':'replaceState'](null,'',location.pathname+(p.size?'?'+p:''));
}
function matches(c){
 const d=c.dataset,words=state.q.toLowerCase().split(/\s+/).filter(Boolean);
 if(state.family!=='all'&&d.family!==state.family)return false;
 if(state.topics.size&&!d.topics.split(' ').some(t=>state.topics.has(t)))return false;
 for(const h of state.has)if(!d[h])return false;
 if(state.year==='older'?d.published>='2025':state.year&&!d.published.startsWith(state.year))return false;
 return words.every(w=>d.search.includes(w));
}
function sortCards(){
 const by={newest:(a,b)=>b.dataset.published.localeCompare(a.dataset.published)||a.dataset.name.localeCompare(b.dataset.name),oldest:(a,b)=>a.dataset.published.localeCompare(b.dataset.published)||a.dataset.name.localeCompare(b.dataset.name),name:(a,b)=>a.dataset.name.localeCompare(b.dataset.name)}[state.sort];
 [...cards].sort(by).forEach(c=>grid.appendChild(c));
}
const filtered=()=>state.family!=='all'||state.topics.size||state.has.size||state.year||state.q;
function render(){
 let n=0;
 for(const c of grid.children){if(!c.dataset.paper)continue;if(matches(c)){n++;c.hidden=n>state.shown;}else c.hidden=true;}
 const more=$('#more');more.hidden=n<=state.shown;more.textContent=`Show ${Math.min(PAGE,n-state.shown)} more · ${n-state.shown} remaining`;
 $('#results').textContent=`${n} ${n===1?'work':'works'}${filtered()?' match':''}${n>state.shown?` · showing ${state.shown}`:''}`;
 $('#empty').hidden=n!==0;$('#clear').hidden=!filtered();
 $$('[data-family-btn]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.familyBtn===state.family)));
 $$('[data-topic]').forEach(b=>b.setAttribute('aria-pressed',String(state.topics.has(b.dataset.topic))));
 $$('[data-has]').forEach(b=>b.setAttribute('aria-pressed',String(state.has.has(b.dataset.has))));
 $$('[data-layout]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.layout===state.layout)));
 grid.classList.toggle('is-list',state.layout==='list');
 $$('[data-panel]').forEach(el=>el.hidden=el.dataset.panel!==state.view);
 $('[data-intro]').hidden=state.view!=='explore';
 $$('[data-view]').forEach(a=>a.dataset.view===state.view?a.setAttribute('aria-current','page'):a.removeAttribute('aria-current'));
 boxes.forEach(b=>{b.checked=state.compare.has(b.dataset.compare);b.disabled=state.compare.size===3&&!b.checked;});
 $$('[data-comparison]').forEach(c=>c.hidden=!state.compare.has(c.dataset.comparison));
 $('#compare-count').textContent=String(state.compare.size);
 $('#compare-help').hidden=state.compare.size>0;$('#clear-compare').hidden=!state.compare.size;
 $('#selection').hidden=!state.compare.size||state.view==='compare';
 $('#selected-text').textContent=`${state.compare.size} of 3 selected`;
}
const update=(push=false)=>{state.shown=PAGE;saveURL(push);render();};

$$('[data-view]').forEach(a=>a.addEventListener('click',e=>{if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;e.preventDefault();state.view=a.dataset.view;saveURL(true);render();window.scrollTo({top:0});}));
$$('[data-family-btn]').forEach(b=>b.addEventListener('click',()=>{state.family=b.dataset.familyBtn;update();}));
$$('[data-family-link]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();state.family=a.dataset.familyLink;state.view='explore';update(true);$('#explore').scrollIntoView({block:'start'});}));
$$('[data-topic]').forEach(b=>b.addEventListener('click',()=>{const t=b.dataset.topic;state.topics.has(t)?state.topics.delete(t):state.topics.add(t);update();}));
$$('[data-has]').forEach(b=>b.addEventListener('click',()=>{const h=b.dataset.has;state.has.has(h)?state.has.delete(h):state.has.add(h);update();}));
$$('[data-layout]').forEach(b=>b.addEventListener('click',()=>{state.layout=b.dataset.layout;saveURL();render();}));
yearSelect.addEventListener('change',()=>{state.year=yearSelect.value;update();});
sortSelect.addEventListener('change',()=>{state.sort=sortSelect.value;sortCards();update();});
search.addEventListener('input',()=>{state.q=search.value;update();});
$('#more').addEventListener('click',()=>{state.shown+=PAGE;render();});
$('#clear').addEventListener('click',()=>{Object.assign(state,{family:'all',topics:new Set(),has:new Set(),year:'',q:''});search.value='';yearSelect.value='';update();});
boxes.forEach(b=>b.addEventListener('change',()=>{b.checked&&state.compare.size<3?state.compare.add(b.dataset.compare):state.compare.delete(b.dataset.compare);saveURL();render();}));
$$('[data-remove]').forEach(b=>b.addEventListener('click',()=>{state.compare.delete(b.dataset.remove);saveURL();render();}));
$('#clear-compare').addEventListener('click',()=>{state.compare.clear();saveURL();render();});
$('#open-compare').addEventListener('click',e=>{e.preventDefault();state.view='compare';saveURL(true);render();window.scrollTo({top:0});});
window.addEventListener('popstate',()=>{readURL();sortCards();render();});
readURL();sortCards();render();
if(location.hash==='#explore'&&state.view==='explore')requestAnimationFrame(()=>$('#explore').scrollIntoView({block:'start'}));
