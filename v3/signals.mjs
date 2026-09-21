import {zahSodaPop} from './sodapop.mjs?v=story-2';
import {CHANNELS,OUTCOMES,channelDetail,outcomeDetail} from './channels.mjs?v=story-2';
import {actionCycle,actionAt,goalFill,ACTION_GOALS,CYCLE_MS} from './flow.mjs?v=story-2';
export {CHANNELS} from './channels.mjs?v=story-2';
export function mountSignals({main,paused=false}){
 const $=s=>document.querySelector(s),lab=$('.signal-lab'),svg=$('.signal-routes'),core=$('.signal-core'),status=$('#signal-status');
 const sources=[...lab.querySelectorAll('[data-source]')],destinations=[...lab.querySelectorAll('[data-destination]')];
 const ns='http://www.w3.org/2000/svg',add=(tag,attrs,parent)=>{const e=document.createElementNS(ns,tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));parent.append(e);return e;};
 const paths=Array.from({length:7},(_,i)=>add('path',{class:'signal-route','data-route':i,'marker-end':'url(#signal-arrow)'},$('.signal-lines')));
 let selected=0,armed=-1,clock=0,last=0,raf=0,visible=false,cycle=1,jobs=[],counts=[0,0,0],completed=[null,null,null],queuedSource=null;
 function pulse(el,kind){if(paused)return;el.getAnimations().forEach(a=>a.cancel());const center=el===core?'translate(-50%,-50%) ':'';const scales=kind==='in'?[1,1.06,1]:kind==='out'?[1,.965,1.025,1]:[1,.94,1.06,1];el.animate(scales.map(n=>({transform:center+'scale('+n+')'})),{duration:kind==='tap'?480:350,easing:'cubic-bezier(.2,.75,.25,1)'});}
 sources.forEach((b,i)=>{b.style.setProperty('--channel',CHANNELS[i].color);b.style.setProperty('--channel-light',CHANNELS[i].light);paths[i].style.setProperty('--route-color',CHANNELS[i].color);});
 destinations.forEach((d,i)=>{d.setAttribute('role','button');d.tabIndex=0;d.setAttribute('aria-label',OUTCOMES[i].title+': see how this outcome works');d.innerHTML='<div class="charge-fill" aria-hidden="true"></div><span class="delivery-check" aria-hidden="true">'+(i+1)+'</span><b>'+OUTCOMES[i].title+'</b><small>'+['A personal sales page','A real site conversation','A tracked next action'][i]+'</small><span class="delivery-status">0 / '+ACTION_GOALS[i]+'</span><div class="outcome-progress" aria-hidden="true"><i></i></div><span class="charge-label">Building toward '+ACTION_GOALS[i]+'</span><span class="outcome-more">Why it matters ↗</span>';d.onclick=()=>outcomeDetail(i);d.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();outcomeDetail(i);}};});
 function layout(){const box=lab.getBoundingClientRect(),vertical=matchMedia('(max-width:760px)').matches;svg.setAttribute('viewBox',`0 0 ${box.width} ${box.height}`);const rect=el=>{const r=el.getBoundingClientRect();return {x:r.left-box.left,y:r.top-box.top,w:r.width,h:r.height};},hub=rect(core);const curve=(a,b)=>vertical?`M ${a.x} ${a.y} C ${a.x} ${(a.y+b.y)/2}, ${b.x} ${(a.y+b.y)/2}, ${b.x} ${b.y}`:`M ${a.x} ${a.y} C ${(a.x+b.x)/2} ${a.y}, ${(a.x+b.x)/2} ${b.y}, ${b.x} ${b.y}`;
 sources.forEach((el,i)=>{const r=rect(el),k=(i+1)/5;paths[i].setAttribute('d',curve(vertical?{x:r.x+r.w/2,y:r.y+r.h+3}:{x:r.x+r.w+3,y:r.y+r.h/2},vertical?{x:hub.x+hub.w*k,y:hub.y-6}:{x:hub.x-6,y:hub.y+hub.h*k}));});
 destinations.forEach((el,i)=>{const r=rect(el),k=(i+1)/4;paths[i+4].setAttribute('d',curve(vertical?{x:hub.x+hub.w*k,y:hub.y+hub.h+6}:{x:hub.x+hub.w+6,y:hub.y+hub.h*k},vertical?{x:r.x+r.w/2,y:r.y-7}:{x:r.x-7,y:r.y+r.h/2}));});}
 function reset(){jobs.forEach(j=>j.dot?.remove());clock=0;last=0;jobs=actionCycle();if(queuedSource!==null){jobs[0].source=queuedSource;queuedSource=null;}status.textContent='Attention becomes useful context, then a visible customer outcome.';counts=[0,0,0];completed=[null,null,null];destinations.forEach((d,i)=>{d.classList.remove('delivered');d.dataset.goalMet='false';d.querySelector('.delivery-check').textContent=i+1;});lab.dataset.cycle=cycle;$('#signal-cycle').textContent='Cycle '+cycle;draw();}
 function dot(j,path,p){if(!j.dot){j.dot=add('circle',{class:'lead-dot',r:5,'data-source':CHANNELS[j.source].name},$('.signal-dots'));j.dot.style.setProperty('--source-color',CHANNELS[j.source].color);}if(path.hasAttribute('d')){const point=path.getPointAtLength(path.getTotalLength()*p);j.dot.setAttribute('cx',point.x);j.dot.setAttribute('cy',point.y);}}
 function arrive(j){const i=j.destination;j.arrived=true;j.dot?.remove();counts[i]=Math.min(ACTION_GOALS[i],counts[i]+j.weight);const d=destinations[i];d.dataset.lastSource=CHANNELS[j.source].name;d.style.setProperty('--charge-color',CHANNELS[j.source].light);if(counts[i]===ACTION_GOALS[i]&&completed[i]===null){completed[i]=clock;d.classList.add('delivered');d.dataset.goalMet='true';d.querySelector('.delivery-check').textContent='✓';if(!paused)zahSodaPop(d,true);}}
 function draw(){let incoming=0,outgoing=0,processing=0;for(const j of jobs){if(j.arrived)continue;const state=actionAt(j,clock);if(!state.started)continue;j.started=true;if(state.entered&&!j.entered){j.entered=true;pulse(core,'in');}if(state.left&&!j.left){j.left=true;pulse(core,'out');}if(state.arrived){arrive(j);continue;}if(!state.entered){dot(j,paths[j.source],state.incoming);j.dot.dataset.leg='incoming';incoming++;}else if(state.left){dot(j,paths[j.destination+4],state.outgoing);j.dot.dataset.leg='outgoing';outgoing++;}else{j.dot?.remove();j.dot=null;processing++;}}
 const total=counts.reduce((a,b)=>a+b,0);$('#signal-count').textContent=total;$('#overall-progress').style.width=total+'%';$('#signal-goal').setAttribute('aria-valuenow',String(total));lab.dataset.phase=total===100?'complete':outgoing?'deliver':processing?'personalize':incoming?'capture':'ready';$('#signal-core-status').textContent=total===100?'A complete cycle of follow-through':processing?'Turning needs into next steps':'Personal context. Relevant next steps.';
 destinations.forEach((d,i)=>{const fill=goalFill(counts[i],ACTION_GOALS[i],completed[i],clock);d.querySelector('.charge-fill').style.height=fill*100+'%';d.querySelector('.outcome-progress i').style.width=fill*100+'%';d.querySelector('.delivery-status').textContent=counts[i]+' / '+ACTION_GOALS[i];d.querySelector('.charge-label').textContent=completed[i]===null?'Building toward '+ACTION_GOALS[i]:fill>.99?'Goal reached ✓':'Goal met · charge settling';});
 if(total===100)status.textContent='100 follow-through actions. Each goal is complete; the next cycle starts as the charge settles.';
 }
 function send(i=selected){
 if(paused){let j=jobs.find(j=>!j.arrived);if(!j){cycle++;reset();j=jobs[0];}j.source=i;j.at=clock;j.started=true;j.entered=true;j.left=true;arrive(j);draw();status.textContent=CHANNELS[i].name+': five illustrative actions added. Enable effects to watch the path.';return;}
 const future=jobs.find(j=>!j.started&&j.at>clock);
 if(future){future.source=i;future.at=clock;status.textContent=CHANNELS[i].name+' introduction: needs captured, then a visible next step.';}
 else{queuedSource=i;status.textContent='This cycle is finishing. The next begins with your '+CHANNELS[i].name+' introduction.';}
 schedule();
 }
 function select(i){selected=i;sources.forEach((b,j)=>{b.classList.toggle('active',j===i);b.setAttribute('aria-pressed',String(j===i));});$('#channel-more').textContent='See the '+CHANNELS[i].name+' strategy ↗';if(armed===i){channelDetail(i,send);return;}armed=i;pulse(sources[i],'tap');send(i);}
 sources.forEach((b,i)=>b.onclick=()=>select(i));$('#channel-more').onclick=()=>channelDetail(selected,send);$('#booth-details').onclick=()=>channelDetail(0,send);
 $('#send-signal').onclick=()=>{cycle++;reset();if(paused){clock=8100;draw();status.textContent='All 100 illustrative actions shown. Enable effects to watch the ten-second cycle.';}else schedule();};
 function tick(t){raf=0;if(paused||!visible||document.hidden){last=0;return;}if(last)clock+=Math.min(100,t-last);last=t;if(clock>=CYCLE_MS){cycle++;reset();}draw();schedule();}
 function schedule(){if(!raf&&visible&&!paused&&!document.hidden)raf=requestAnimationFrame(tick);}
 function stop(){cancelAnimationFrame(raf);raf=0;last=0;}
 new ResizeObserver(layout).observe(lab);document.fonts.ready.then(layout);layout();reset();
 new IntersectionObserver(e=>{visible=e[0].isIntersecting;if(visible)schedule();else stop();},{root:main}).observe(lab);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else schedule();});
 return {setPaused(value){paused=value;if(value)stop();else schedule();}};
}
