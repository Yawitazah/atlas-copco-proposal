import {zahSodaPop} from './sodapop.mjs?v=refinement-1';
import {showDetails} from './equipment.mjs?v=refinement-1';
export const CHANNELS=[
 {name:'Trade show',color:'#936013',light:'#fff0d2',icon:'◈',headline:'Touch it. Try it. Find your fit.',audience:'Site teams, fleet managers and purchasing decision-makers at relevant industry events.',activity:'A working equipment demonstration gives visitors something to experience. The booth QR opens a short, personal needs finder.',next:'Capture application, buying team and permission for a useful follow-up.'},
 {name:'LinkedIn',color:'#176dcc',light:'#e7f1ff',icon:'in',headline:'Your next project deserves the right air.',audience:'Relevant operations leaders, fleet managers, engineers and procurement teams.',activity:'An application-led post or campaign brings the equipment into the context of the job. A clear call to action opens the needs finder.',next:'Use the supplied needs to shape the equipment page and an appropriate human follow-up.'},
 {name:'YouTube',color:'#cd493e',light:'#ffebe6',icon:'▶',headline:'See the work. Understand the machine.',audience:'People researching tools, compressor applications and practical site demonstrations.',activity:'A short demonstration shows the job, the equipment and the result. The next step invites viewers to compare equipment for their own application.',next:'Move from viewing to a useful profile, then offer equipment details and a walkthrough.'},
 {name:'Referral',color:'#7750b9',light:'#f0eaff',icon:'↗',headline:'Good work deserves an introduction.',audience:'Existing customers, buying-team members, dealers and relevant business connections.',activity:'A shareable invitation carries an anonymous source code. The recipient builds their own profile instead of receiving someone else’s private details.',next:'Retain the source and introduce the new prospect to an accountable person.'}
];
import {makeJourney,readJourney,chargeAt} from './flow.mjs?v=refinement-1';
export function mountSignals({main,paused=false}){
 const $=s=>document.querySelector(s),lab=$('.signal-lab'),svg=$('.signal-routes'),core=$('.signal-core'),status=$('#signal-status');
 const sources=[...lab.querySelectorAll('[data-source]')],destinations=[...lab.querySelectorAll('[data-destination]')],counts=[0,0,0],charged=[null,null,null];
 const ns='http://www.w3.org/2000/svg',add=(tag,attrs,parent)=>{const e=document.createElementNS(ns,tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));parent.append(e);return e;};
 const paths=Array.from({length:7},(_,i)=>add('path',{class:'signal-route','data-route':i,'marker-end':'url(#signal-arrow)'},$('.signal-lines')));
 let selected=0,total=0,clock=0,last=0,raf=0,visible=false,nextAt=600,jobs=[];
 const arrivalWords=['briefs ready','visit requests','owned next steps'];
 sources.forEach((b,i)=>{b.style.setProperty('--channel',CHANNELS[i].color);b.style.setProperty('--channel-light',CHANNELS[i].light);paths[i].style.setProperty('--route-color',CHANNELS[i].color);});
 destinations.forEach((d,i)=>{const layer=document.createElement('div');layer.className='charge-fill';layer.setAttribute('aria-hidden','true');d.prepend(layer);const meter=document.createElement('span');meter.className='charge-label';meter.textContent='Activity 0%';d.append(meter);});
 function layout(){const box=lab.getBoundingClientRect(),vertical=matchMedia('(max-width:760px)').matches;svg.setAttribute('viewBox',`0 0 ${box.width} ${box.height}`);const rect=el=>{const r=el.getBoundingClientRect();return {x:r.left-box.left,y:r.top-box.top,w:r.width,h:r.height};},hub=rect(core);const curve=(a,b)=>vertical?`M ${a.x} ${a.y} C ${a.x} ${(a.y+b.y)/2}, ${b.x} ${(a.y+b.y)/2}, ${b.x} ${b.y}`:`M ${a.x} ${a.y} C ${(a.x+b.x)/2} ${a.y}, ${(a.x+b.x)/2} ${b.y}, ${b.x} ${b.y}`;
 sources.forEach((el,i)=>{const r=rect(el),k=(i+1)/5;paths[i].setAttribute('d',curve(vertical?{x:r.x+r.w/2,y:r.y+r.h+3}:{x:r.x+r.w+3,y:r.y+r.h/2},vertical?{x:hub.x+hub.w*k,y:hub.y-6}:{x:hub.x-6,y:hub.y+hub.h*k}));});
 destinations.forEach((el,i)=>{const r=rect(el),k=(i+1)/4;paths[i+4].setAttribute('d',curve(vertical?{x:hub.x+hub.w*k,y:hub.y+hub.h+6}:{x:hub.x+hub.w+6,y:hub.y+hub.h*k},vertical?{x:r.x+r.w/2,y:r.y-7}:{x:r.x-7,y:r.y+r.h/2}));});
 }
 function arrive(i,j){counts[i]++;charged[i]={at:clock,popped:false,color:CHANNELS[j.source].color};const d=destinations[i];d.classList.add('delivered');d.querySelector('.delivery-check').textContent='✓';d.querySelector('.delivery-status').textContent=counts[i]+' '+arrivalWords[i];d.style.setProperty('--charge-color',CHANNELS[j.source].light);d.dataset.lastSource=CHANNELS[j.source].name;}
 function send(source=selected,manual=false){if(jobs.length>=5){if(manual)status.textContent='Several leads are moving through the experience. Watch their next steps arrive.';return;}
 const j=makeJourney(source,clock);j.dots=Array.from({length:4},(_,i)=>{const c=add('circle',{class:'lead-dot',r:6,'data-leg':i?'outgoing':'incoming','data-source':CHANNELS[source].name,visibility:'hidden'},$('.signal-dots'));c.style.setProperty('--source-color',CHANNELS[source].color);return c;});
 if(paused){j.branches.forEach((b,i)=>arrive(i,j));j.dots.forEach(d=>d.remove());total++;$('#signal-count').textContent=total;destinations.forEach((d,i)=>{d.querySelector('.charge-fill').style.height='100%';d.querySelector('.charge-label').textContent='Activity complete';});status.textContent=CHANNELS[source].name+': all three next steps are visible. Effects are paused.';return;}
 jobs.push(j);if(manual)status.textContent=CHANNELS[source].name+' lead added. Follow its color through the needs finder.';schedule();}
 function dot(el,path,p,show){el.setAttribute('visibility',show?'visible':'hidden');if(show&&path.hasAttribute('d')){const point=path.getPointAtLength(path.getTotalLength()*p);el.setAttribute('cx',point.x);el.setAttribute('cy',point.y);}}
 function draw(){let outgoing=0,processing=0;
 for(const j of jobs){const s=readJourney(j,clock);dot(j.dots[0],paths[j.source],s.incoming,s.incoming<1);if(s.incoming===1&&!s.complete)processing++;
 s.outgoing.forEach((p,i)=>{const started=clock-j.at>=j.inbound+j.process+j.branches[i].delay;dot(j.dots[i+1],paths[i+4],p,started&&p<1);if(started&&p<1)outgoing++;if(p===1&&!j.branches[i].arrived){j.branches[i].arrived=true;arrive(i,j);}});
 if(s.complete&&!j.counted){j.counted=true;$('#signal-count').textContent=++total;status.textContent=CHANNELS[j.source].name+' lead connected. Completed outcomes stay visible as activity settles.';}
 }
 jobs=jobs.filter(j=>{if(j.counted){j.dots.forEach(d=>d.remove());return false;}return true;});
 lab.dataset.phase=outgoing?'deliver':processing?'personalize':jobs.length?'capture':'ready';$('#signal-core-status').textContent=processing?processing+' profile'+(processing>1?'s':'')+' in progress':jobs.length?'New introductions arriving':'Ready for the next introduction';
 destinations.forEach((d,i)=>{const c=charged[i];if(!c)return;const age=clock-c.at,amount=chargeAt(age);d.querySelector('.charge-fill').style.height=amount*100+'%';d.querySelector('.charge-label').textContent='Activity '+Math.round(amount*100)+'%';if(age>=420&&!c.popped){c.popped=true;if(!paused)zahSodaPop(d,true);}});
 }
 function tick(t){raf=0;if(paused||!visible||document.hidden){last=0;return;}if(last)clock+=Math.min(100,t-last);last=t;if(clock>=nextAt){send(Math.floor(Math.random()*4));nextAt=clock+2300+Math.random()*2000;}draw();schedule();}
 function schedule(){if(!raf&&visible&&!paused&&!document.hidden)raf=requestAnimationFrame(tick);}
 function stop(){cancelAnimationFrame(raf);raf=0;last=0;}
 function detail(i){selected=i;sources.forEach((b,j)=>{b.classList.toggle('active',j===i);b.setAttribute('aria-pressed',String(j===i));});const c=CHANNELS[i];const dialog=showDetails(c.name+' → a useful introduction','<div class="campaign-card" style="--channel:'+c.color+';--channel-light:'+c.light+'"><div class="campaign-platform"><b>'+c.icon+'</b><span>'+c.name+' / CONTENT CONCEPT</span></div><div class="campaign-visual"><img src="./assets/xas400-cutout.png" alt="Portable compressor"><span>'+c.headline+'</span></div><p>'+c.activity+'</p><span class="campaign-cta">Find equipment for my project ↗</span></div><div class="campaign-context"><h3>Who it reaches</h3><p>'+c.audience+'</p><h3>What happens next</h3><p>'+c.next+'</p><ol><li>A person responds to useful content.</li><li>The needs finder captures their context.</li><li>A personal equipment page offers a next step.</li><li>The owner and follow-up remain visible.</li></ol></div><button class="btn dark" id="channel-send">Watch a '+c.name+' lead <span>→</span></button>');$('#channel-send').onclick=()=>{dialog.close();send(i,true);};}
 sources.forEach((b,i)=>b.onclick=()=>detail(i));$('#send-signal').onclick=()=>send(selected,true);
 new ResizeObserver(layout).observe(lab);document.fonts.ready.then(layout);layout();
 new IntersectionObserver(e=>{visible=e[0].isIntersecting;if(visible)schedule();else stop();},{root:main}).observe(lab);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else schedule();});
 return {setPaused(value){paused=value;if(value)stop();else schedule();}};
}