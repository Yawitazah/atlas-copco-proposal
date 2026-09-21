const CYCLE_MS=10000;

export function disconnectedFrame(elapsed){
 const time=Math.max(0,Number(elapsed)||0)%CYCLE_MS;
 if(time<1500)return {step:'enter',day:0,status:'New interest enters from several channels.'};
 if(time<3000)return {step:'capture',day:0,status:'C4C captures the lead record.'};
 if(time<4500)return {step:'review',day:0,status:'The sales representative reviews the immediate value.'};
 if(time<6200)return {step:'handoff',day:1,status:'A lower-value opportunity is routed to a dealer or rental partner.'};
 const day=Math.min(6,1+Math.floor((time-6200)/550));
 return {step:'cold',day,status:day>=6?'The lead has gone cold and Atlas Copco has lost visibility.':'No owned next action is visible.'};
}

export function mountDisconnected({paused=false}={}){
 const section=document.querySelector('.disconnect-journey');
 if(!section)return {setPaused(){}};
 const status=section.querySelector('[data-disconnect-status]');
 const day=section.querySelector('[data-disconnect-day]');
 const replay=section.querySelector('[data-disconnect-replay]');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 let visible=false,isPaused=typeof paused==='function'?Boolean(paused()):Boolean(paused),start=performance.now(),pausedAt=0,raf=0,last='';

 function render(now){
  raf=0;
  if(!visible||isPaused||reduced)return;
  const frame=disconnectedFrame(now-start);
  if(frame.step!==last){section.dataset.leakStep=frame.step;last=frame.step;}
  if(day){day.textContent=frame.day?`Day ${frame.day}`:'New';day.setAttribute('aria-label',frame.day?`${frame.day} days without a recorded next action`:'New lead');}
  if(status)status.textContent=frame.status;
  schedule();
 }
 function schedule(){if(!raf&&visible&&!isPaused&&!reduced)raf=requestAnimationFrame(render);}
 function restart(){
  cancelAnimationFrame(raf);raf=0;start=performance.now();last='';section.dataset.leakStep='enter';
  section.classList.remove('is-running');void section.offsetWidth;section.classList.add('is-running');
  if(day){day.textContent='New';day.setAttribute('aria-label','New lead');}
  if(status)status.textContent='New interest enters from several channels.';
  schedule();
 }
 if(replay)replay.addEventListener('click',restart);
 const observer=new IntersectionObserver(entries=>{
  visible=entries.some(entry=>entry.isIntersecting);
  section.classList.toggle('is-visible',visible);
  if(visible){if(!section.classList.contains('is-running'))restart();else schedule();}
  else{cancelAnimationFrame(raf);raf=0;}
 },{threshold:.18});
 observer.observe(section);
 if(reduced){section.dataset.leakStep='cold';section.classList.add('is-visible');if(day)day.textContent='Day 6';if(status)status.textContent='The lead has gone cold and Atlas Copco has lost visibility.';}
 return {setPaused(value){
  const next=Boolean(value);if(next===isPaused)return;isPaused=next;section.classList.toggle('is-paused',next);
  if(next){pausedAt=performance.now();cancelAnimationFrame(raf);raf=0;}
  else{if(pausedAt)start+=performance.now()-pausedAt;schedule();}
 }};
}

export {CYCLE_MS as DISCONNECTED_CYCLE_MS};
