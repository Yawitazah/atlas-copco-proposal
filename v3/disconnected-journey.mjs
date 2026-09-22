const CYCLE_MS=10000;

export function disconnectedFrame(elapsed){
 const time=Math.max(0,Number(elapsed)||0)%CYCLE_MS;
 if(time<1500)return {step:'enter',day:0,status:'New interest enters from several channels.'};
 if(time<3000)return {step:'capture',day:0,status:'C4C captures each lead record.'};
 if(time<4500)return {step:'review',day:0,status:'Sales representatives review the immediate value.'};
 if(time<6200)return {step:'handoff',day:1,status:'Lower-value leads are routed onward without an owned next action.'};
 const day=Math.min(6,1+Math.floor((time-6200)/550));
 return {step:'cold',day,status:day>=6?'The leads have gone cold and Atlas Copco has lost visibility.':'Unowned lead signals lose energy and disappear.'};
}

// Each traveling lead dot reaches the C4C card, then the sales-review card,
// then the dealer/rental card at these points in its own 10s loop (matched
// to the leakLeadLoss keyframe positions in disconnected-journey.css).
const DOT_HITS=[{ms:800,card:'.leak-c4c'},{ms:2500,card:'.leak-review'},{ms:4300,card:'.leak-lower'}];

export function mountDisconnected({paused=false}={}){
 const section=document.querySelector('.disconnect-journey');
 if(!section)return {setPaused(){}};
 const status=section.querySelector('[data-disconnect-status]');
 const day=section.querySelector('[data-disconnect-day]');
 const replay=section.querySelector('[data-disconnect-replay]');
 const hits=DOT_HITS.map(hit=>({...hit,card:section.querySelector(hit.card)}));
 const dots=[...section.querySelectorAll('.leak-loss-dot')].map(el=>({delay:(parseFloat(getComputedStyle(el).getPropertyValue('--lead-delay'))||0)*1000,prev:0}));
 let visible=false,isPaused=typeof paused==='function'?Boolean(paused()):Boolean(paused),start=performance.now(),pausedAt=0,raf=0,last='';

 function flash(card){
  if(!card)return;
  card.classList.remove('leak-hit');void card.offsetWidth;card.classList.add('leak-hit');
 }
 function checkHits(elapsed){
  for(const dot of dots){
   const loopT=((elapsed-dot.delay)%CYCLE_MS+CYCLE_MS)%CYCLE_MS;
   for(const hit of hits){
    const crossed=dot.prev<=loopT?(dot.prev<hit.ms&&loopT>=hit.ms):(hit.ms>dot.prev||hit.ms<=loopT);
    if(crossed)flash(hit.card);
   }
   dot.prev=loopT;
  }
 }
 function render(now){
  raf=0;
  if(!visible||isPaused)return;
  const elapsed=now-start;
  checkHits(elapsed);
  const frame=disconnectedFrame(elapsed);
  if(frame.step!==last){section.dataset.leakStep=frame.step;last=frame.step;}
  if(day){day.textContent=frame.day?`Day ${frame.day}`:'New';day.setAttribute('aria-label',frame.day?`${frame.day} days without a recorded next action`:'New lead');}
  if(status)status.textContent=frame.status;
  schedule();
 }
 function schedule(){if(!raf&&visible&&!isPaused)raf=requestAnimationFrame(render);}
 function restart(){
  cancelAnimationFrame(raf);raf=0;start=performance.now();last='';section.dataset.leakStep='enter';
  dots.forEach(dot=>{dot.prev=((-dot.delay)%CYCLE_MS+CYCLE_MS)%CYCLE_MS;});
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
 return {setPaused(value){
  const next=Boolean(value);if(next===isPaused)return;isPaused=next;section.classList.toggle('is-paused',next);
  if(next){pausedAt=performance.now();cancelAnimationFrame(raf);raf=0;}
  else{if(pausedAt)start+=performance.now()-pausedAt;schedule();}
 }};
}

export {CYCLE_MS as DISCONNECTED_CYCLE_MS};
