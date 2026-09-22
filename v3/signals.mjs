import {zahSodaPop} from './sodapop.mjs?v=conversion-29';
import {CHANNELS,OUTCOMES,channelDetail,outcomeDetail} from './channels.mjs?v=conversion-29';
import {actionCycle,actionAt,goalFill,MILESTONE_GOALS,CYCLE_MS,REQUIRED_MILESTONES} from './flow.mjs?v=conversion-29';

export {CHANNELS} from './channels.mjs?v=conversion-29';
export const resolvePause=value=>typeof value==='function'?Boolean(value()):Boolean(value);

const milestoneSupport=[
 'Profile + source + stated need',
 'Relevant fit + clear choices',
 'Owner + due next action',
 'When requested or qualified'
];

export function mountSignals({main,paused=false}){
 paused=resolvePause(paused);
 const $=selector=>document.querySelector(selector),lab=$('.signal-lab'),svg=$('.signal-routes'),core=$('.signal-core'),status=$('#signal-status');
 const sources=[...lab.querySelectorAll('[data-source]')],milestones=[...lab.querySelectorAll('[data-milestone]')];
 const ns='http://www.w3.org/2000/svg';
 const add=(tag,attrs,parent)=>{const element=document.createElementNS(ns,tag);Object.entries(attrs).forEach(([key,value])=>element.setAttribute(key,value));parent.append(element);return element;};
 const paths=Array.from({length:sources.length+milestones.length},(_,i)=>add('path',{class:'signal-route','data-route':i,'marker-end':'url(#signal-arrow)'},$('.signal-lines')));
 let selected=0,armed=-1,clock=0,last=0,raf=0,visible=false,cycle=1,jobs=[],counts=MILESTONE_GOALS.map(()=>0),completed=MILESTONE_GOALS.map(()=>null),queuedSource=null;

 function pulse(element,kind){
  if(paused)return;
  if(typeof element.getAnimations==='function')element.getAnimations().forEach(animation=>animation.cancel());
  const center=element===core?'translate(-50%,-50%) ':'';
  const scales=kind==='in'?[1,1.06,1]:kind==='out'?[1,.965,1.025,1]:[1,.94,1.06,1];
  if(typeof element.animate==='function'){
   element.animate(scales.map(scale=>({transform:center+'scale('+scale+')'})),{duration:kind==='tap'?480:350,easing:'cubic-bezier(.2,.75,.25,1)'});
   return;
  }
  const fallback='signal-pulse-'+kind;
  element.classList.remove('signal-pulse-in','signal-pulse-out','signal-pulse-tap');
  void element.offsetWidth;
  element.classList.add(fallback);
  setTimeout(()=>element.classList.remove(fallback),kind==='tap'?500:380);
 }

 sources.forEach((button,i)=>{
  button.style.setProperty('--channel',CHANNELS[i].color);
  button.style.setProperty('--channel-light',CHANNELS[i].light);
  paths[i].style.setProperty('--route-color',CHANNELS[i].color);
 });
 milestones.forEach((button,i)=>{
  const milestone=OUTCOMES[i],conditional=Boolean(milestone.conditional);
  button.setAttribute('aria-label',milestone.title+': open an explanation');
  button.dataset.conditional=String(conditional);
  button.innerHTML='<div class="charge-fill" aria-hidden="true"></div><span class="delivery-check" aria-hidden="true">'+(i+1)+'</span><span class="milestone-type">'+(conditional?'CONDITIONAL ACTIVATION':'REQUIRED MILESTONE')+'</span><b>'+milestone.title+'</b><small>'+milestoneSupport[i]+'</small><span class="delivery-status">0 / '+MILESTONE_GOALS[i]+'</span><div class="outcome-progress" aria-hidden="true"><i></i></div><span class="charge-label">'+(conditional?'Activates for qualifying profiles':'Profiles moving through the path')+'</span><span class="outcome-more">Why it matters ↗</span>';
  button.onclick=()=>outcomeDetail(i);
  paths[sources.length+i].style.setProperty('--route-color',conditional?'#b57a27':'#3f7560');
 });

 function layout(){
  const box=lab.getBoundingClientRect(),mobile=matchMedia('(max-width:760px)').matches;
  svg.setAttribute('viewBox',`0 0 ${box.width} ${box.height}`);
  const rect=element=>{const value=element.getBoundingClientRect();return {x:value.left-box.left,y:value.top-box.top,w:value.width,h:value.height};};
  const hub=rect(core);
  const horizontal=(a,b)=>`M ${a.x} ${a.y} C ${(a.x+b.x)/2} ${a.y}, ${(a.x+b.x)/2} ${b.y}, ${b.x} ${b.y}`;
  const vertical=(a,b)=>`M ${a.x} ${a.y} C ${a.x} ${(a.y+b.y)/2}, ${b.x} ${(a.y+b.y)/2}, ${b.x} ${b.y}`;
  sources.forEach((element,i)=>{
   const source=rect(element),portion=(i+1)/(sources.length+1);
   const start=mobile?{x:source.x+source.w/2,y:source.y+source.h+3}:{x:source.x+source.w+3,y:source.y+source.h/2};
   const end=mobile?{x:hub.x+hub.w*portion,y:hub.y-6}:{x:hub.x-6,y:hub.y+hub.h*portion};
   paths[i].setAttribute('d',(mobile?vertical:horizontal)(start,end));
  });
  milestones.forEach((element,i)=>{
   const target=rect(element);
   let start,end,route;
   if(i===0){
    start=mobile?{x:hub.x+hub.w/2,y:hub.y+hub.h+6}:{x:hub.x+hub.w+6,y:hub.y+hub.h/2};
    end=mobile?{x:target.x+target.w/2,y:target.y-7}:{x:target.x-7,y:target.y+target.h/2};
    route=mobile?vertical:horizontal;
   }else{
    const previous=rect(milestones[i-1]);
    start={x:previous.x+previous.w/2,y:previous.y+previous.h+3};
    end={x:target.x+target.w/2,y:target.y-7};
    route=vertical;
   }
   paths[sources.length+i].setAttribute('d',route(start,end));
  });
 }

 function reset(){
  jobs.forEach(job=>job.dot?.remove());
  clock=0;last=0;jobs=actionCycle();
  if(queuedSource!==null){jobs[0].source=queuedSource;queuedSource=null;}
  status.textContent=paused?'Effects are paused. Select Enable effects above to watch the shared path move.':'Every profile follows the same required path. Walkthrough activates only when requested or qualified.';
  counts=MILESTONE_GOALS.map(()=>0);completed=MILESTONE_GOALS.map(()=>null);
  milestones.forEach((card,i)=>{
   card.classList.remove('delivered','active-path');
   card.dataset.goalMet='false';
   card.querySelector('.delivery-check').textContent=i+1;
  });
  lab.dataset.cycle=cycle;$('#signal-cycle').textContent='Cycle '+cycle;draw();
 }

 function dot(job,path,progress){
  if(!job.dot){
   job.dot=add('circle',{class:'lead-dot',r:matchMedia('(max-width:760px)').matches?5:6.5,'data-source':CHANNELS[job.source].name},$('.signal-dots'));
   job.dot.style.setProperty('--source-color',CHANNELS[job.source].color);
  }
  if(path.hasAttribute('d')){
   const point=path.getPointAtLength(path.getTotalLength()*progress);
   job.dot.setAttribute('cx',point.x);job.dot.setAttribute('cy',point.y);
  }
 }

 function reach(job,index){
  if(job.reached[index])return;
  job.reached[index]=true;
  counts[index]=Math.min(MILESTONE_GOALS[index],counts[index]+job.weight);
  const card=milestones[index];
  card.dataset.lastSource=CHANNELS[job.source].name;
  card.style.setProperty('--charge-color',CHANNELS[job.source].light);
  pulse(card,'in');
  if(counts[index]===MILESTONE_GOALS[index]&&completed[index]===null){
   completed[index]=clock;card.classList.add('delivered');card.dataset.goalMet='true';card.querySelector('.delivery-check').textContent='✓';
   if(!paused)zahSodaPop(card,true);
  }
 }

 function draw(){
  let incoming=0,processing=0,following=0;
  const activePaths=new Set(),activeMilestones=new Set();
  for(const job of jobs){
   if(job.arrived)continue;
   const state=actionAt(job,clock);
   if(!state.started)continue;
   job.started=true;
   if(state.entered&&!job.entered){job.entered=true;pulse(core,'in');}
   if(state.left&&!job.left){job.left=true;pulse(core,'out');}
   state.milestones.forEach((reached,index)=>{if(reached)reach(job,index);});
   if(state.arrived){job.arrived=true;job.dot?.remove();continue;}
   if(!state.entered){
    dot(job,paths[job.source],state.incoming);job.dot.dataset.leg='incoming';activePaths.add(job.source);incoming++;
   }else if(!state.left){
    job.dot?.remove();job.dot=null;processing++;
   }else if(state.activeStage>=0){
    const pathIndex=sources.length+state.activeStage;
    dot(job,paths[pathIndex],state.stageProgress);job.dot.dataset.leg='shared-path';activePaths.add(pathIndex);activeMilestones.add(state.activeStage);following++;
   }
  }
  paths.forEach((path,index)=>path.classList.toggle('lit',activePaths.has(index)));
  milestones.forEach((card,index)=>card.classList.toggle('active-path',activeMilestones.has(index)));
  const throughPath=counts[REQUIRED_MILESTONES-1];
  $('#signal-count').textContent=throughPath;$('#overall-progress').style.width=throughPath+'%';$('#signal-goal').setAttribute('aria-valuenow',String(throughPath));
  lab.dataset.phase=throughPath===100?'complete':following?'deliver':processing?'personalize':incoming?'capture':'ready';
  $('#signal-core-status').textContent=throughPath===100?'Required path complete':processing?'Turning answers into usable context':'Personal context. Accountable next steps.';
  milestones.forEach((card,index)=>{
   const fill=goalFill(counts[index],MILESTONE_GOALS[index],completed[index],clock);
   card.querySelector('.charge-fill').style.height=fill*100+'%';card.querySelector('.outcome-progress i').style.width=fill*100+'%';
   card.querySelector('.delivery-status').textContent=counts[index]+' / '+MILESTONE_GOALS[index];
   const conditional=OUTCOMES[index].conditional;
   card.querySelector('.charge-label').textContent=completed[index]===null?(conditional?'Activates for qualifying profiles':'Profiles moving through the path'):fill>.99?'Milestone reached ✓':'Milestone reached · charge settling';
  });
  if(throughPath===100)status.textContent='100 illustrative profiles cleared every required milestone. '+counts[3]+' have activated the conditional walkthrough step so far.';
 }

 function send(index=selected){
  if(paused){
   let job=jobs.find(candidate=>!candidate.arrived);
   if(!job){cycle++;reset();job=jobs[0];}
   job.source=index;job.started=true;job.entered=true;job.left=true;
   for(let milestone=0;milestone<REQUIRED_MILESTONES;milestone++)reach(job,milestone);
   if(job.walkthrough)reach(job,3);
   job.arrived=true;draw();
   status.textContent=CHANNELS[index].name+': five illustrative profiles moved through the required shared path. Enable effects to watch the sequence.';
   return;
  }
  const future=jobs.find(job=>!job.started&&job.at>clock);
  if(future){future.source=index;future.at=clock;status.textContent=CHANNELS[index].name+' introduction: context captured, then carried through one accountable path.';}
  else{queuedSource=index;status.textContent='This cycle is finishing. The next begins with your '+CHANNELS[index].name+' introduction.';}
  schedule();
 }

 function select(index){
  selected=index;sources.forEach((button,i)=>{button.classList.toggle('active',i===index);button.setAttribute('aria-pressed',String(i===index));});
  $('#channel-more').textContent='See the '+CHANNELS[index].name+' strategy ↗';
  if(armed===index){channelDetail(index,send);return;}
  armed=index;pulse(sources[index],'tap');send(index);
 }

 sources.forEach((button,index)=>button.onclick=()=>select(index));
 $('#channel-more').onclick=()=>channelDetail(selected,send);$('#booth-details').onclick=()=>channelDetail(0,send);
 $('#send-signal').onclick=()=>{cycle++;reset();if(paused){clock=CYCLE_MS-1000;draw();status.textContent='The full required path and conditional walkthrough example are shown. Enable effects to watch the ten-second sequence.';}else schedule();};

 function tick(time){
  raf=0;if(paused||!visible||document.hidden){last=0;return;}
  if(last)clock+=Math.min(100,time-last);last=time;
  if(clock>=CYCLE_MS){cycle++;reset();}
  draw();schedule();
 }
 function schedule(){if(!raf&&visible&&!paused&&!document.hidden)raf=requestAnimationFrame(tick);}
 function stop(){cancelAnimationFrame(raf);raf=0;last=0;}

 function isInView(){
  const labBox=lab.getBoundingClientRect(),mainBox=main.getBoundingClientRect();
  return labBox.bottom>mainBox.top&&labBox.top<mainBox.bottom;
 }
 function syncVisibility(next=isInView()){
  visible=Boolean(next)||isInView();
  if(visible)schedule();else stop();
 }
 new ResizeObserver(()=>{layout();syncVisibility();}).observe(lab);document.fonts.ready.then(()=>{layout();syncVisibility();});layout();reset();
 new IntersectionObserver(entries=>syncVisibility(entries.some(entry=>entry.isIntersecting)),{root:main}).observe(lab);
 main.addEventListener('scroll',()=>syncVisibility(),{passive:true});window.addEventListener('resize',()=>syncVisibility(),{passive:true});requestAnimationFrame(()=>syncVisibility());
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else schedule();});
 return {setPaused(value){paused=Boolean(value);if(paused){stop();status.textContent='Effects are paused. Select Enable effects above to watch the shared path move.';}else{status.textContent='Every profile follows the same required path. Walkthrough activates only when requested or qualified.';schedule();}}};
}
