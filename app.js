"use strict";
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
let chartMode = "bar";
function drawChart(mode) {
  chartMode = mode;
  const w = Math.max(300, Math.min(740, $('#chart').clientWidth || 740));
  const narrow = w < 500, h = narrow ? 340 : 310, left = 35, right = 15, top = 30, bottom = narrow ? 72 : 49;
  const cw = w-left-right, ch = h-top-bottom, max = 5;
  const x = (i) => left + cw * (i+.5)/birthRateData.length;
  const y = (v) => top + ch*(1-v/max);
  const barWidth = Math.min(36, cw / birthRateData.length * .55);
  let svg = `<svg viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="chart-heading chart-description"><title id="chart-heading">2016至2025年15至19歲女性生育率${mode==='bar'?'長條圖':'折線圖'}</title><desc id="chart-description">單位為每千名15至19歲女性人口對應的官方該組活產數；活產分子含未滿15歲生母所生嬰兒。2016至2020年各4，2021至2024年各3，2025年2。資料取自內政部官方整數精度，非未成年懷孕比例。</desc>`;
  for(let v=0;v<=max;v++) svg += `<line x1="${left}" x2="${w-right}" y1="${y(v)}" y2="${y(v)}" stroke="#d4dfed"/><text x="${left-12}" y="${y(v)+5}" text-anchor="end" font-size="15" fill="#52627b">${v}</text>`;
  if(mode==='line') svg+=`<polyline points="${birthRateData.map((d,i)=>`${x(i)},${y(d.value)}`).join(' ')}" fill="none" stroke="#194dbe" stroke-width="3"/>`;
  birthRateData.forEach((d,i)=>{
    svg+=mode==='bar'?`<rect x="${x(i)-barWidth/2}" y="${y(d.value)}" width="${barWidth}" height="${y(0)-y(d.value)}" rx="4" fill="${i===9?'#142b52':'#366bca'}"><title>${d.year}年：${d.value}‰</title></rect>`:`<circle cx="${x(i)}" cy="${y(d.value)}" r="6" fill="#194dbe"><title>${d.year}年：${d.value}‰</title></circle>`;
    svg+=`<text x="${x(i)}" y="${y(d.value)-13}" text-anchor="middle" font-size="${narrow?14:17}" font-weight="700" fill="#172c49">${d.value}</text><text x="${x(i)}" y="${h-(narrow?48:21)}" text-anchor="${narrow?'end':'middle'}" transform="${narrow?`rotate(-50 ${x(i)} ${h-48})`:''}" font-size="${narrow?12:14}" fill="#52627b">${d.year}</text>`;
  });
  $("#chart").innerHTML=svg+'</svg>';
  $$('[data-chart]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.chart===mode)));
}
$$('[data-chart]').forEach(b=>b.addEventListener('click',()=>drawChart(b.dataset.chart)));
drawChart(chartMode);
window.addEventListener('resize',()=>drawChart(chartMode));
const scenarios=[
 {tag:'01 / 數據判讀',question:'看到「2025年15–19歲女性生育率2‰」，哪個解讀最恰當？',choices:['全台未滿18歲學生，有2%曾經懷孕。','這是每千名同齡女性的活產指標，不能直接當作未滿18歲懷孕比例。','出生數下降，就能確定所有未成年懷孕都下降。'],answer:1,explain:'2‰是千分之二，分母是同齡女性年中人口，不是所有學生。活產與懷孕是不同指標；15–19歲口徑包含18、19歲，官方活產分子另併入未滿15歲生母所生嬰兒。',source:'#data',link:'再看一次資料定義'},
 {tag:'02 / 學校支持',question:'虛構情境：一名17歲學生懷孕，擔心學校要她退學。朋友可以怎麼回應？',choices:['先休學吧，懷孕的人本來就不能上課。','把她的事傳到班群，讓大家一起評斷。','懷孕不會讓妳失去受教權。我們可以一起詢問輔導室的支持和保密規則。'],answer:2,explain:'學校不得因懷孕歧視，或明示暗示學生休學、退學。可以討論彈性請假、評量及就學支持，也要尊重當事人隱私。',source:'#source-6',link:'核對教育部受教權要點'},
 {tag:'03 / 安全求助',question:'虛構情境：朋友說保險套破了，已超過72小時，而且怕家人知道會動手。哪個回應較安全？',choices:['儘快找婦產科評估，也向社工或113說明安全風險；不要自行判定已經來不及。','超過72小時什麼都不能做，不用看醫師了。','向老師或醫師說了，都能保證絕不通報、絕不通知別人。'],answer:0,explain:'緊急避孕依方法有不同時限，部分產品可在120小時內使用，仍須儘快由醫師評估。保密有法定通報例外；遇到家庭安全風險，先找社工或113一起安排下一步。',source:'#health',link:'閱讀緊急避孕與安全求助'}
];
let currentScenario=0;
const answers=new Map();
function renderScenario(index){
 currentScenario=index;
 const s=scenarios[index];
 $('#scenario-counter').textContent=s.tag+' · 虛構匿名教學';
 $('#scenario-question').textContent=s.question;
 $('#scenario-feedback').replaceChildren();
 $('#scenario-choices').replaceChildren();
 s.choices.forEach((text,i)=>{const b=document.createElement('button');b.className='choice';b.textContent=String.fromCharCode(65+i)+'．'+text;b.addEventListener('click',()=>answerScenario(i));$('#scenario-choices').append(b);});
 $$('[data-scenario]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.scenario)===index)));
 $('#scenario-next').textContent=index===scenarios.length-1?'回到第一個情境':'下一個情境';
 if(answers.has(index))showAnswer(answers.get(index));
 $('#scenario-progress').textContent=`已練習 ${answers.size} / ${scenarios.length} 題`;
}
function showAnswer(selected){
 const s=scenarios[currentScenario];
 $$('#scenario-choices button').forEach((b,i)=>{b.disabled=true;b.classList.toggle('correct',i===s.answer);b.classList.toggle('incorrect',i===selected&&selected!==s.answer);});
 const result=document.createElement('p');const strong=document.createElement('strong');strong.textContent=selected===s.answer?'這個回應有抓到重點。':'再想一想：'+String.fromCharCode(65+s.answer)+'較恰當。';result.append(strong);
 const why=document.createElement('p');why.textContent=s.explain;
 const link=document.createElement('a');link.href=s.source;link.textContent=s.link;
 $('#scenario-feedback').replaceChildren(result,why,link);
}
function answerScenario(i){if(answers.has(currentScenario))return;answers.set(currentScenario,i);showAnswer(i);$('#scenario-progress').textContent=`已練習 ${answers.size} / ${scenarios.length} 題`;}
$$('[data-scenario]').forEach(b=>b.addEventListener('click',()=>renderScenario(Number(b.dataset.scenario))));
$('#scenario-next').addEventListener('click',()=>renderScenario((currentScenario+1)%scenarios.length));
$('#scenario-reset').addEventListener('click',()=>{answers.delete(currentScenario);renderScenario(currentScenario);});
renderScenario(0);
function updateActive(){const hash=location.hash;$$('.sidebar a').forEach(a=>a.classList.toggle('active',a.getAttribute('href')===hash));}
function openDeepLink(){const target=document.getElementById(decodeURIComponent(location.hash.slice(1)));if(target){let node=target;while(node){if(node.tagName==='DETAILS')node.open=true;node=node.parentElement;}}updateActive();}
window.addEventListener('hashchange',openDeepLink);openDeepLink();
