import {steps,fresh,choose,ready,next,back,result} from './mission.mjs';
import {icon} from './icons.mjs';
export const esc=(s)=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const short=['Job','Priorities','Power','Rhythm','Timing','Next move'];
const spread=(i,salt=0)=>(i*.6180339887+salt)%1;
export function mountMission({onHandoff,go,paused}){
 const host=document.querySelector('#mission');let state=fresh(),revealed=false,leadId=null,signature=null;
 const check=(i)=>{const v=state.answers[steps[i].key];return Array.isArray(v)?v.length===2:!!v};
 function progress(){return '<div class="mission-top"><strong>THE MISSION BUILDER</strong><div class="mission-progress" aria-label="'+Object.keys(state.answers).filter((k,i)=>check(i)).length+' of 6 decisions"><i class="'+(check(0)?'done':'current')+'"></i>'+steps.slice(1).map((s,i)=>'<i class="'+(check(i+1)?'done':state.step===i+1?'current':'')+'"></i>').join('')+'</div><span>'+((state.complete?6:state.step)+1>6?'BRIEF COMPLETE':String(state.step+1).padStart(2,'0')+' / 06')+'</span></div>'}
 function blueprint(){
 const modules=['<path d="M14 80h140v9H14z"/>','<path d="M25 43h88v37H25z"/>','<path d="m25 43 15-19h76l19 19z"/>','<path d="M113 43h28v37h-28zM120 50h13m-13 7h13m-13 7h13"/>','<circle cx="49" cy="91" r="13"/><circle cx="49" cy="91" r="5"/><circle cx="125" cy="91" r="13"/><circle cx="125" cy="91" r="5"/>','<path d="M142 72h18v12h-8M36 52h30v16H36zM75 52h28m-28 7h28m-28 7h28"/>'];
 return '<aside class="blueprint"><div class="blueprint-title"><span>YOUR PROJECT BLUEPRINT</span><span>↗</span></div><div class="blueprint-machine" aria-hidden="true"><svg viewBox="0 0 178 116" fill="none" stroke="currentColor" stroke-width="1.4">'+modules.map((m,i)=>'<g class="module '+(check(i)?'built':'')+'">'+m+'</g>').join('')+'</svg></div><div class="blueprint-slots">'+steps.map((s,i)=>'<div class="blueprint-slot '+(check(i)?'done':'')+'"><i>'+(check(i)?'✓':String(i+1).padStart(2,'0'))+'</i><span><small>'+short[i]+'</small><strong>'+esc(Array.isArray(state.answers[s.key])?state.answers[s.key].join(' + '):state.answers[s.key]||'Waiting to be discovered')+'</strong></span></div>').join('')+'</div><div class="blueprint-footer">Each choice adds context.<br>Every useful detail stays with the brief.</div></aside>';
 }
 function rhythm(i){const bars=i===0?[15,80,20,15,10,90,20,10,15,75,15]:i===1?[70,80,70,75,85,80,70,80,75,90,80]:[50,85,60,90,55,85,55,90,60,95,50];return '<div class="rhythm" aria-hidden="true">'+bars.map((h,j)=>'<i style="--h:'+h+'%;--d:'+j*.08+'s"></i>').join('')+'</div>'}
 function insight(){
 const s=steps[state.step],a=state.answers[s.key];
 if(s.multi)return a?.length===2?'<strong>Priority pair locked.</strong> '+esc(a.join(' + '))+' will shape the specialist’s conversation.':a?.length===1?'One tile collected. Pick one more to complete your priority pair.':'Your priorities help a specialist understand what a good outcome looks like.';
 return s.options.find(o=>o[0]===a)?.[4]||'Choose a card to reveal what this tells us about your project.';
 }
 function rack(){const a=state.answers.priorities||[];return '<div class="priority-rack" aria-label="Your two priority tiles">'+[0,1].map(i=>'<div class="rack-slot '+(a[i]?'filled':'')+'">'+(a[i]?icon(steps[1].options.find(o=>o[0]===a[i])[1])+esc(a[i]):'PRIORITY 0'+(i+1))+'</div>').join('')+'</div>'}
 function challengeVisual(){
 if(state.step===2){const a=state.answers.power||'',power=a==='Electric available'?'electric':a==='No site power'?'independent':a?'open':'';
 return '<div class="power-board '+power+'" aria-label="Power path visualization"><span class="power-source">'+icon('bolt')+'<small>SITE POWER</small></span><i class="power-wire"></i><span class="power-destination">'+icon('construction')+'<small>'+(power==='electric'?'ELECTRIC PATH':power==='independent'?'INDEPENDENT PATH':power==='open'?'BOTH PATHS OPEN':'YOUR JOB')+'</small></span><i class="power-wire right-wire"></i><span class="power-source">'+icon('fuel')+'<small>INDEPENDENT</small></span></div>';
 }
 if(state.step===4){const index=steps[4].options.findIndex(o=>o[0]===state.answers.horizon);
 return '<div class="planning-track" aria-label="Project planning track">'+['THIS MONTH','NEXT QUARTER','EXPLORING'].map((l,i)=>'<div class="'+(i===index?'located':'')+'"><i>'+(i===index?'◆':'○')+'</i><span>'+l+'</span></div>').join('')+'</div>';
 }
 return '';
 }
 function render(animate=false){
 if(state.complete){renderResult();return}
 const s=steps[state.step],a=state.answers[s.key];
 host.innerHTML=progress()+'<div class="mission-body"><div class="game-stage '+(animate?'new-stage':'')+'"><span class="game-kicker">'+s.badge+'</span><h3 tabindex="-1" id="game-heading">'+s.title+'</h3><p class="game-hint">'+s.hint+'</p>'+(s.multi?rack():'')+challengeVisual()+'<div class="choice-grid '+(s.multi?'tiles':state.step>1?'path':'')+'">'+s.options.map((o,i)=>'<button class="choice" data-choice="'+i+'" aria-pressed="'+(s.multi?(a||[]).includes(o[0]):a===o[0])+'">'+icon(o[1])+'<span><strong>'+o[2]+'</strong><small>'+o[3]+'</small>'+(s.key==='cadence'?rhythm(i):'')+'</span></button>').join('')+'</div><div class="game-insight '+(a?'revealed':'')+'" role="status">'+icon(a?'check':'compass')+'<span>'+insight()+'</span></div><div class="game-actions"><button class="game-back" id="game-back" '+(state.step===0?'disabled':'')+'>← Previous choice</button><button id="game-next" class="btn" '+(ready(state)?'':'disabled')+'>'+(state.step===5?'Reveal my brief':'Lock it in')+' <span>→</span></button></div></div>'+blueprint()+'</div>';
 if(animate){document.querySelector('#game-heading').focus({preventScroll:true});scrollGame()}
 }
 function scrollGame(){const main=document.querySelector('#zw-main'),top=host.getBoundingClientRect().top-main.getBoundingClientRect().top+main.scrollTop-85;main.scrollTo({top,behavior:paused()?'auto':'smooth'})}
 function renderResult(){
 const r=result(state.answers);
 host.innerHTML=progress()+'<div class="mission-result"><div class="result-visual"><img src="../assets/'+r.image+'" alt="'+esc(r.family)+' illustration"><div class="result-stamp">MISSION<br>COMPLETE<br>06 / 06</div><div class="result-visual-copy"><span>'+esc(r.badge)+'</span><h3>'+esc(state.answers.application)+'<br>starts here.</h3></div></div><div class="result-body"><span class="mini-label">YOUR PERSONALIZED STARTING POINT</span><h3>'+r.title+'</h3><p>'+r.description+'</p><div class="result-chips">'+Object.values(state.answers).flat().map(v=>'<span>'+esc(v)+'</span>').join('')+'</div><div class="result-owner"><strong>'+r.route+'</strong>Your next conversation: validate airflow, pressure, site restrictions and the way you work.</div><div class="result-buttons"><button class="btn" id="game-handoff">'+(leadId?'View my sample lead':'Send to demo control room')+' <span>↗</span></button><button class="text-btn" id="game-edit">Refine my brief ↺</button></div><p class="result-foot">Illustrative guidance. Product fit requires specialist validation. This creates a local sample record only.</p></div></div>';
 if(!revealed)celebrate();
 }
 function celebrate(){
 let particles='';
 for(let i=0;i<26;i++)particles+='<i class="fizz" style="--left:'+spread(i)*100+'%;--size:'+(6+spread(i,.31)*22)+'px;--delay:'+spread(i,.57)*1.6+'s;--duration:'+(3.6+spread(i,.83)*2.2)+'s;--drift:'+((spread(i,.11)-.5)*60)+'px"></i>';
 for(let i=0;i<30;i++){const a=i/30*Math.PI*2,d=180+spread(i,.42)*260;particles+='<i class="fleck" style="--x:'+Math.cos(a)*d+'px;--y:'+(Math.sin(a)*d+140)+'px;--rot:'+spread(i,.7)*540+'deg;--duration:'+(1.5+spread(i,.2)*.8)+'s;--color:'+['#1d8f6f','#22a6b3','#f4b942','#f05d5e','#a7c5af'][i%5]+'"></i>'}
 const overlay=document.createElement('div');overlay.className='soda-veil';overlay.innerHTML='<div aria-hidden="true">'+particles+'</div><div class="soda-center"><div class="soda-medallion">'+icon('check')+'</div><span class="mini-label">SIX SIGNALS. ONE CLEARER PICTURE.</span><h3>Your mission.<br>Beautifully connected.</h3><p>You’ve built a brief that starts a better conversation.</p><button class="btn" id="game-reveal">Open my project brief <span>↗</span></button></div>';
 host.querySelector('.mission-result').inert=true;host.append(overlay);scrollGame();overlay.querySelector('button').focus({preventScroll:true});
 }
 host.addEventListener('click',e=>{
 const button=e.target.closest('button');if(!button)return;
 if(button.dataset.choice!==undefined){
  const idx=Number(button.dataset.choice),value=steps[state.step].options[idx]?.[0];if(!value)return;
  const old=JSON.stringify(state.answers);state=choose(state,value);
  if(JSON.stringify(state.answers)!==old){leadId=null;revealed=false}
  render();host.querySelector('[data-choice="'+idx+'"]')?.focus({preventScroll:true});
 }else if(button.id==='game-next'){if(!ready(state))return;state=next(state);render(true)}
 else if(button.id==='game-back'){state=back(state);render(true)}
 else if(button.id==='game-reveal'){revealed=true;renderResult();host.querySelector('#game-handoff').focus({preventScroll:true});scrollGame()}
 else if(button.id==='game-edit'){state={...state,complete:false,step:0};render(true)}
 else if(button.id==='game-handoff'){
  const sig=JSON.stringify(state.answers);
  leadId=onHandoff(state.answers,sig===signature?leadId:null);signature=sig;renderResult();go(3);setTimeout(()=>document.querySelector('[data-lead="'+leadId+'"]')?.focus({preventScroll:true}),350);
 }
 });
 render();
}
