import {mountGame} from './game.mjs';
import {mountControl} from './control.mjs';
import {BASE} from './mission.mjs';
const $=s=>document.querySelector(s);
const short=n=>n>=1e6?'$'+(Math.round(n/10000)/100).toFixed(2)+'m':'$'+Math.round(n/1000)+'k';
export function boot(mountDeck){
 const main=$('#zw-main'),root=$('.zw-root');let paused=matchMedia('(prefers-reduced-motion: reduce)').matches,timer;
 const motion=()=>{document.body.classList.toggle('motion-paused',paused);$('#motion-toggle').textContent=paused?'Enable effects':'Pause effects';$('#motion-toggle').setAttribute('aria-pressed',String(paused));if(paused)document.querySelectorAll('.signal-particle').forEach(e=>e.remove())};motion();$('#motion-toggle').onclick=()=>{paused=!paused;motion()};
 function toast(s){clearTimeout(timer);$('#toast').textContent=s;$('#toast').classList.add('show');timer=setTimeout(()=>$('#toast').classList.remove('show'),4200)}
 function go(i){const el=$('[data-idx="'+i+'"]');if(!el)return;main.scrollTo({top:el.offsetTop,behavior:paused?'auto':'smooth'});$('#chapters').hidden=true;$('#menu-toggle').setAttribute('aria-expanded','false')}
 mountDeck(root,{onScene(i){root.dataset.activeScene=i;document.body.dataset.scene=i}});
 document.addEventListener('click',e=>{const b=e.target.closest('[data-go]');if(b&&!b.hasAttribute('data-act')){e.preventDefault();go(Number(b.dataset.go))}});
 $('#menu-toggle').onclick=()=>{const el=$('#chapters');el.hidden=!el.hidden;$('#menu-toggle').setAttribute('aria-expanded',String(!el.hidden))};
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){$('#chapters').hidden=true;$('#menu-toggle').setAttribute('aria-expanded','false')}});
 const control=mountControl(toast);mountGame({toast,paused:()=>paused,handoff:control.handoff,onClear:control.clear,go});
 import('./machine.mjs').then(m=>m.mountMachine(()=>paused)).catch(()=>{$('#machine-fallback').hidden=false;$('#machine-canvas').hidden=true});
 if(location.hash==='#mission')requestAnimationFrame(()=>go(2));
 let source='Trade show',count=0,signalTimer;
 document.querySelectorAll('[data-source]').forEach(b=>b.onclick=()=>{source=b.dataset.source;document.querySelectorAll('[data-source]').forEach(x=>x.classList.toggle('active',x===b));$('#send-signal').textContent='Send a '+source.toLowerCase()+' lead →';$('#signal-status').textContent=source+' selected. Send a signal to see its path.'});
 function particles(amount=8){if(paused)return;const group=$('.signal-particles');for(let i=0;i<amount;i++){const p=document.createElement('i');p.className='signal-particle';p.style.setProperty('--start',[-110,-32,46,123][['Trade show','LinkedIn','YouTube','Referral'].indexOf(source)]+'px');p.style.setProperty('--end',[-90,0,90][i%3]+'px');p.style.animationDelay=i*.09+'s';group.append(p);setTimeout(()=>p.remove(),4000)}}
 $('#send-signal').onclick=()=>{clearTimeout(signalTimer);particles(14);$('#signal-status').textContent=source+' → mission profile → equipment brief → assigned rep.';count++;$('#signal-count').textContent=count;if(!paused)$('#signal-count').animate([{transform:'scale(1.45)',color:'#bfa35a'},{transform:'scale(1)',color:'#173b31'}],{duration:600});signalTimer=setTimeout(()=>$('#signal-status').textContent='Signal '+count+' connected. Next step: a human follow-up with a visible owner.',paused?0:2400)};
 let inView=false;new IntersectionObserver(es=>inView=es[0].isIntersecting,{root:main}).observe($('.signal-lab'));setInterval(()=>{if(inView&&!document.hidden)particles(3)},3200);
 const ids=['inquiries','coverage','qualified','quoted','won','order'];
 function model(){const v={};for(const id of ids){const el=$('#'+id);if(!el.validity.valid||el.value===''){$('#impact-equation').textContent='Enter valid assumptions to update the model.';return}v[id]=Number(el.value)}
 $('#inquiries-value').textContent=v.inquiries;$('#coverage-value').textContent=v.coverage+'%';const revenue=v.inquiries*v.qualified/100*v.coverage/100*v.quoted/100*v.won/100*v.order,base=revenue*50/v.coverage,max=Math.max(base,revenue)||1;
 $('#impact-value').textContent=short(revenue);$('#baseline-value').textContent=short(base);$('#scenario-value').textContent=short(revenue);$('#baseline-bar').style.height=base/max*90+'%';$('#scenario-bar').style.height=revenue/max*90+'%';$('#impact-equation').textContent=v.inquiries+' inquiries × '+v.qualified+'% qualified × '+v.coverage+'% followed through × '+v.quoted+'% quoted × '+v.won+'% won × $'+v.order.toLocaleString()+'.';
 }
 ids.forEach(id=>$('#'+id).addEventListener('input',model));model();
 const horizons=[
 ['Make the first pilot measurable.',['Map the real C4C lead lifecycle, owners and response expectations. Establish baseline conversion and handoff loss.','Pilot one event: hands-on equipment, a mission experience, personal follow-up and a documented walkthrough request.','Review completion, accepted ownership, meeting quality and next-action coverage every week.']],
 ['Scale what earns its place.',['Compare event, LinkedIn, YouTube and referral cohorts by qualified pipeline and outcomes.','Refine permission-based nurture, partner acknowledgment and manager escalation.','Expand the audiences and events that produce useful conversations; test referral incentives with clear terms.']],
 ['Build a learning growth system.',['Feed verified outcomes back into content, recommendations and rep coaching.','Evaluate AI-assisted brief preparation and follow-up prioritization with human review.','Scale across regions with local ownership, consistent measurement and validated CRM integrations.']]
 ];
 function horizon(i){document.querySelectorAll('[data-horizon]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.horizon)===i)));const h=horizons[i];$('#horizon-detail').innerHTML='<h3>'+h[0]+'</h3><ol>'+h[1].map(x=>'<li>'+x+'</li>').join('')+'</ol>';if(!paused)$('#horizon-detail').animate([{clipPath:'inset(0 100% 0 0)',transform:'translateX(-15px)'},{clipPath:'inset(0 0 0 0)',transform:'none'}],{duration:650,easing:'cubic-bezier(.16,1,.3,1)'})}
 document.querySelectorAll('[data-horizon]').forEach(b=>b.onclick=()=>horizon(Number(b.dataset.horizon)));horizon(0);

 $('#share-experience').onclick=async()=>{try{if(navigator.share)await navigator.share({title:'Power, with purpose. — Version 3',url:BASE});else{await navigator.clipboard.writeText(BASE);toast('Version 3 link copied.')}}catch(e){if(e.name!=='AbortError')toast(BASE)}};
}
