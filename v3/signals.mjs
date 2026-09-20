// SVG routes are measured from the visible cards. Both layouts use the same journey.
const INBOUND = 1300, MATCH = 800, OUTBOUND = [2100, 2350, 2600], HOLD = 2900;
const clamp = n => Math.max(0, Math.min(1, n));
export function journeyAt(ms) {
 const incoming = clamp(ms / INBOUND);
 const outgoing = OUTBOUND.map(duration => clamp((ms - INBOUND - MATCH) / duration));
 const delivered = outgoing.map(n => n === 1);
 return {incoming, outgoing, delivered, complete: delivered.every(Boolean),
  phase: incoming < 1 ? 'capture' : ms < INBOUND + MATCH ? 'personalize' : delivered.every(Boolean) ? 'complete' : 'deliver'};
}
export const JOURNEY_DURATION = INBOUND + MATCH + Math.max(...OUTBOUND);

export function mountSignals({main, paused = false}) {
 const $ = s => document.querySelector(s), lab = $('.signal-lab'), svg = $('.signal-routes');
 const sources = [...lab.querySelectorAll('[data-source]')], destinations = [...lab.querySelectorAll('[data-destination]')];
 const core = $('.signal-core'), status = $('#signal-status'), coreStatus = $('#signal-core-status');
 const ns = 'http://www.w3.org/2000/svg';
 const add = (tag, attrs, parent) => { const el = document.createElementNS(ns, tag); for (const [k,v] of Object.entries(attrs)) el.setAttribute(k,v); parent.append(el); return el; };
 const paths = Array.from({length:7}, (_,i) => add('path', {'class':'signal-route', 'data-route':i, 'marker-end':'url(#signal-arrow)'}, $('.signal-lines')));
 const dots = Array.from({length:4}, (_,i) => add('circle', {'class':'lead-dot', r:6, 'data-leg':i === 0 ? 'incoming' : 'outgoing', visibility:'hidden'}, $('.signal-dots')));
 let selected = 0, count = 0, elapsed = 0, last = 0, frame = 0, visible = false, running = false, counted = false, previous = '';
 const readyText = ['Brief ready', 'Visit requested', 'Owner assigned'];
 function layout() {
  const box = lab.getBoundingClientRect(), vertical = matchMedia('(max-width: 760px)').matches;
  svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
  const rect = el => {const r=el.getBoundingClientRect(); return {x:r.left-box.left,y:r.top-box.top,w:r.width,h:r.height};};
  const hub = rect(core);
  function route(a,b) {
   return vertical ? `M ${a.x} ${a.y} C ${a.x} ${(a.y+b.y)/2}, ${b.x} ${(a.y+b.y)/2}, ${b.x} ${b.y}`
    : `M ${a.x} ${a.y} C ${(a.x+b.x)/2} ${a.y}, ${(a.x+b.x)/2} ${b.y}, ${b.x} ${b.y}`;
  }
  sources.forEach((el,i) => {
   const r=rect(el), spread=(i+1)/5;
   const a=vertical?{x:r.x+r.w/2,y:r.y+r.h+3}:{x:r.x+r.w+3,y:r.y+r.h/2};
   const b=vertical?{x:hub.x+hub.w*spread,y:hub.y-5}:{x:hub.x-5,y:hub.y+hub.h*spread};
   paths[i].setAttribute('d',route(a,b));
  });
  destinations.forEach((el,i) => {
   const r=rect(el), spread=(i+1)/4;
   const a=vertical?{x:hub.x+hub.w*spread,y:hub.y+hub.h+5}:{x:hub.x+hub.w+5,y:hub.y+hub.h*spread};
   const b=vertical?{x:r.x+r.w/2,y:r.y-7}:{x:r.x-7,y:r.y+r.h/2};
   paths[i+4].setAttribute('d',route(a,b));
  });
  paint();
 }
 function position(dot,path,progress,show) {
  dot.setAttribute('visibility',show?'visible':'hidden');
  if(!path.hasAttribute('d'))return;
  const point=path.getPointAtLength(path.getTotalLength()*progress);
  dot.setAttribute('cx',point.x); dot.setAttribute('cy',point.y);
 }
 function paint() {
  const state=journeyAt(elapsed), phase=running?state.phase:'ready';
  lab.dataset.phase=phase;
  paths.forEach((path,i)=>path.classList.toggle('lit',running && (i<4?i===selected:state.incoming===1)));
  position(dots[0],paths[selected],state.incoming,running&&state.incoming<1);
  state.outgoing.forEach((p,i)=>position(dots[i+1],paths[i+4],p,running&&phase==='deliver'&&p<1));
  destinations.forEach((el,i)=>{
   const done=running&&state.delivered[i];
   el.classList.toggle('delivered',done);
   el.querySelector('.delivery-check').textContent=done?'✓':String(i+1);
   el.querySelector('.delivery-status').textContent=done?readyText[i]:running&&phase==='deliver'?'Connecting…':'Waiting for profile';
  });
  if(phase!==previous) {
   previous=phase;
   const channel=sources[selected].dataset.source;
   const words={ready:['Interactive survey','Tap any channel to follow a lead from introduction to follow-through.'],capture:['Lead arriving…',`${channel}: a new introduction enters the needs finder.`],personalize:['Building their profile…','Name, site, buying team and equipment needs become a useful profile.'],deliver:['Profile ready · routing','Follow the three outgoing dots: equipment brief, walkthrough request and sales owner.'],complete:['3 next steps connected',`${channel} journey complete: a tailored brief, a walkthrough request and a visible sales owner.`]};
   coreStatus.textContent=words[phase][0];status.textContent=words[phase][1];
  }
  if(running&&state.complete&&!counted){counted=true;$('#signal-count').textContent=String(++count);}
 }
 function stopFrame(){cancelAnimationFrame(frame);frame=0;last=0;}
 function schedule(){if(!frame&&visible&&!paused&&!document.hidden)frame=requestAnimationFrame(tick);}
 function begin(manual=false){
  elapsed=0;counted=false;running=true;previous='';last=0;
  status.setAttribute('aria-live',manual?'polite':'off');
  if(paused)elapsed=JOURNEY_DURATION;
  paint();schedule();
 }
 function tick(now){
  frame=0;
  if(!visible||paused||document.hidden){last=0;return;}
  if(!running)begin();
  if(last)elapsed+=Math.min(now-last,100);
  last=now;paint();
  if(elapsed>JOURNEY_DURATION+HOLD)begin();
  schedule();
 }
 sources.forEach((el,i)=>el.addEventListener('click',()=>{
  selected=i;sources.forEach((s,j)=>{s.classList.toggle('active',j===i);s.setAttribute('aria-pressed',String(j===i));});begin(true);
 }));
 $('#send-signal').addEventListener('click',()=>begin(true));
 new ResizeObserver(layout).observe(lab);
 document.fonts.ready.then(layout);
 new IntersectionObserver(entries=>{
  visible=entries[0].isIntersecting;
  if(visible)schedule();else stopFrame();
 },{root:main,threshold:0}).observe(lab);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stopFrame();else schedule();});
 layout();
 return {setPaused(value){paused=value;if(paused)stopFrame();else schedule();}};
}