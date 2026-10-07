'use strict';
(() => {
 const input=document.querySelector('#search'),topic=document.querySelector('#topic'),results=document.querySelector('#results');
 if(!input||!topic||!results)return;
 const count=document.querySelector('#count'),language=document.querySelector('#language'),sort=document.querySelector('#sort');
 const previous=document.querySelector('#previous'),next=document.querySelector('#next'),pageLabel=document.querySelector('#page-label');
 const all=document.querySelector('#all-projects'),savedButton=document.querySelector('#saved-projects'),reset=document.querySelector('#reset');
 const tiles=[...document.querySelectorAll('[data-category]')],labels=JSON.parse(input.dataset.categories);
 let index=[],related={},page=1,active='',savedOnly=false,saved=new Set();
 try {const stored=JSON.parse(localStorage.getItem('reposcout-saved')||'[]');if(Array.isArray(stored))saved=new Set(stored.filter(Number.isInteger));}catch(_error){}
 const size=6;
 const element=(tag,text,className)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(className)node.className=className;return node;};
 const saveState=()=>{try{localStorage.setItem('reposcout-saved',JSON.stringify([...saved]));}catch(_error){}};
 const card=r=>{
  const article=element('article',undefined,'card'),top=element('div',undefined,'card-top');
  const save=element('button',saved.has(r.id)?'★':'☆','save');save.type='button';
  save.setAttribute('aria-label',`${saved.has(r.id)?'Unsave':'Save'} ${r.full_name}`);save.setAttribute('aria-pressed',String(saved.has(r.id)));
  save.addEventListener('click',()=>{if(saved.has(r.id))saved.delete(r.id);else saved.add(r.id);saveState();render();});
  top.append(element('span',labels[r.category],'badge'),save);
  const heading=element('h2'),link=element('a',r.full_name.split('/').slice(1).join('/'));
  link.href=r.url;link.target='_blank';link.rel='noopener noreferrer';heading.append(link);
  const bottom=element('div',undefined,'card-bottom');bottom.append(element('span',r.language||'Mixed','language'),element('span',`★ ${r.stars.toLocaleString()}`));
  const details=element('details'),tags=element('div',undefined,'topic-tags');
  for(const t of r.topics.slice(0,5))tags.append(element('span',t,'tag'));
  details.append(element('summary','Topics & related projects'),tags);
  const peers=(related[String(r.id)]||[]).map(id=>index.find(p=>p.id===id)).filter(Boolean).slice(0,3);
  for(const peer of peers){const p=element('p'),a=element('a',`${peer.full_name} ↗`);a.href=peer.url;a.target='_blank';a.rel='noopener noreferrer';p.append(a);details.append(p);}
  if(!peers.length)details.append(element('p','No related projects in this selection yet.'));
  article.append(top,heading,element('p',r.full_name.split('/')[0],'card-owner'),element('p',r.description,'card-description'),bottom,details);
  return article;
 };
 const render=()=>{
  const q=input.value.toLowerCase().trim(),t=topic.value,l=language.value;
  let rows=index.filter(r=>(!q||r.search.includes(q))&&(!t||r.topics.includes(t))&&(!l||r.language===l)&&(!active||r.category===active)&&(!savedOnly||saved.has(r.id)));
  rows.sort(sort.value==='name'?(a,b)=>a.full_name.localeCompare(b.full_name):(a,b)=>b.stars-a.stars||a.full_name.localeCompare(b.full_name));
  const pages=Math.max(1,Math.ceil(rows.length/size));page=Math.min(page,pages);
  results.replaceChildren();
  for(const r of rows.slice((page-1)*size,page*size))results.append(card(r));
  if(!rows.length){const empty=element('div',undefined,'empty');empty.append(element('h2',savedOnly?'Your collection starts here':'No projects match yet'),element('p',savedOnly?'Save a project using the star on its card.':'Try another category, language or search term.'));results.append(empty);}
  count.textContent=rows.length?`Showing ${(page-1)*size+1}–${Math.min(page*size,rows.length)} of ${rows.length} projects`:'0 projects';
  pageLabel.textContent=`Page ${page} of ${pages}`;previous.disabled=page<=1;next.disabled=page>=pages;
  document.querySelector('#pagination').hidden=!rows.length;
  all.setAttribute('aria-pressed',String(!savedOnly));savedButton.setAttribute('aria-pressed',String(savedOnly));
  savedButton.textContent=`Saved (${index.filter(r=>saved.has(r.id)).length})`;
  for(const tile of tiles)tile.setAttribute('aria-pressed',String(tile.dataset.category===active));
  document.querySelector('#collection-title').textContent=active?labels[active]:'Discover your next building block';
 };
 const refresh=()=>{page=1;render();};
 input.addEventListener('input',refresh);topic.addEventListener('change',refresh);language.addEventListener('change',refresh);sort.addEventListener('change',refresh);
 for(const tile of tiles)tile.addEventListener('click',()=>{active=tile.dataset.category;refresh();document.querySelector('#catalog').scrollIntoView({behavior:'smooth',block:'start'});});
 all.addEventListener('click',()=>{savedOnly=false;refresh();});savedButton.addEventListener('click',()=>{savedOnly=true;refresh();});
 reset.addEventListener('click',()=>{input.value='';topic.value='';language.value='';sort.value='stars';active='';savedOnly=false;refresh();});
 previous.addEventListener('click',()=>{page--;render();});next.addEventListener('click',()=>{page++;render();});
 fetch(input.dataset.index).then(response=>{if(!response.ok)throw new Error();return response.json();}).then(data=>{
  index=data;
  for(const name of [...new Set(index.map(r=>r.language).filter(Boolean))].sort()){const option=element('option',name);option.value=name;language.append(option);}
  const params=new URLSearchParams(window.location.search);if(Object.hasOwn(labels,params.get('category')))active=params.get('category');
  render();
  return fetch(input.dataset.related).then(response=>{if(!response.ok)throw new Error();return response.json();}).then(data=>{related=data;render();}).catch(()=>{});
 }).catch(()=>{count.textContent='Interactive search is unavailable. Featured projects are shown below.';document.querySelector('#pagination').hidden=true;for(const control of [input,topic,language,sort,all,savedButton,reset,...tiles])control.disabled=true;});
})();
