'use strict';
const input=document.querySelector('#search');
const topic=document.querySelector('#topic');
const results=document.querySelector('#results');
if(input&&topic&&results){
 let index=[];
 const render=()=>{
  const q=input.value.toLowerCase().trim(), t=topic.value;
  const rows=index.filter(r=>(!q||r.search.includes(q))&&(!t||r.topics.includes(t)));
  results.replaceChildren();
  for(const r of rows.slice(0,200)){
   const article=document.createElement('article');article.className='card';
   const heading=document.createElement('h2'),link=document.createElement('a');
   link.href=r.url;link.textContent=r.full_name;heading.append(link);
   const desc=document.createElement('p');desc.textContent=r.description;
   const meta=document.createElement('p');meta.className='meta';meta.textContent=`${r.language||'Mixed'} · ★ ${r.stars} · ${r.topics.join(', ')}`;
   article.append(heading,desc,meta);results.append(article);
  }
  document.querySelector('#count').textContent=`${rows.length} repositories${rows.length>200?' (first 200 shown)':''}`;
 };
 fetch(input.dataset.index).then(r=>{if(!r.ok)throw new Error();return r.json();}).then(data=>{index=data;input.addEventListener('input',render);topic.addEventListener('change',render);}).catch(()=>{document.querySelector('#count').textContent='Search unavailable; browse the recent discoveries below.';});
}
