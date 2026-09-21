import {mountSalesPage} from './sales-page.mjs?v=refinement-1';
import {mountSignals} from './signals.mjs?v=refinement-1';
import {mountGame} from './game.mjs?v=refinement-1';
import {mountControl} from './control.mjs?v=refinement-1';
import {BASE} from './mission.mjs?v=refinement-1';
const $=s=>document.querySelector(s);
const short=n=>n>=1e6?'$'+(Math.round(n/10000)/100).toFixed(2)+'m':'$'+Math.round(n/1000)+'k';
export function boot(mountDeck){
 const main=$('#zw-main'),root=$('.zw-root');let paused=matchMedia('(prefers-reduced-motion: reduce)').matches,timer,signals;
 const motion=()=>{document.body.classList.toggle('motion-paused',paused);$('#motion-toggle').textContent=paused?'Enable effects':'Pause effects';$('#motion-toggle').setAttribute('aria-pressed',String(paused));signals?.setPaused(paused)};motion();$('#motion-toggle').onclick=()=>{paused=!paused;motion()};
 function toast(s){clearTimeout(timer);$('#toast').textContent=s;$('#toast').classList.add('show');timer=setTimeout(()=>$('#toast').classList.remove('show'),4200)}
 function go(i){const el=$('[data-idx="'+i+'"]');if(!el)return;main.scrollTo({top:el.offsetTop,behavior:paused?'auto':'smooth'});$('#chapters').hidden=true;$('#menu-toggle').setAttribute('aria-expanded','false')}
 mountDeck(root,{onScene(i){root.dataset.activeScene=i;document.body.dataset.scene=i}});
 document.addEventListener('click',e=>{const b=e.target.closest('[data-go]');if(b&&!b.hasAttribute('data-act')){e.preventDefault();go(Number(b.dataset.go))}});
 $('#menu-toggle').onclick=()=>{const el=$('#chapters');el.hidden=!el.hidden;$('#menu-toggle').setAttribute('aria-expanded',String(!el.hidden))};
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){$('#chapters').hidden=true;$('#menu-toggle').setAttribute('aria-expanded','false')}});
 const control=mountControl(toast);mountGame({toast,paused:()=>paused,handoff:control.handoff,request:control.request,recordInfo:control.recordInfo,openRecord:control.openRecord,onClear:control.clear,go});
 import('./machine.mjs').then(m=>m.mountMachine(()=>paused)).catch(()=>{$('#machine-fallback').hidden=false;$('#machine-canvas').hidden=true});
 if(location.hash==='#mission')requestAnimationFrame(()=>go(2));
 signals=mountSignals({main,paused});
 if(location.hash==='#signal')requestAnimationFrame(()=>go(1));
 const explanations=[
  ['Sales context from C4C','Lead identity, company, source and assigned owner supply the starting point. This example uses fictional records; a real export or connection has not been configured.'],
  ['Customer context from the needs finder','The customer adds application, equipment needs, buying team and visit preferences. Those details shape the equipment page and enrich the matching local record.'],
  ['A request becomes a next action','A quote or walkthrough request stays attached to its owner. The demo dashboard shows the new activity. Sending it back to C4C would require a verified write-back connection.']
 ];
 function explain(i){document.querySelectorAll('[data-crm-stage]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.crmStage)===i)));$('#crm-explanation').innerHTML='<h4>'+explanations[i][0]+'</h4><p>'+explanations[i][1]+'</p>';}
 document.querySelectorAll('[data-crm-stage]').forEach(b=>b.onclick=()=>explain(Number(b.dataset.crmStage)));explain(0);
 $('#load-crm-example').onclick=()=>{
  let panel=$('#crm-example-page');if(!panel){panel=document.createElement('div');panel.id='crm-example-page';$('.c4c-explainer').append(panel);}
  const sample={version:3,step:7,done:[0,1,2,3,4,5,6],id:'',code:'AIR-SAMPLE',ref:'',answers:{first:'Avery',last:'Sample',company:'Northline Civil · example',email:'avery@example.com',role:'Fleet manager',region:'Atlanta, GA, United States',application:'Construction',flow:'400',pressure:'150',power:'Diesel suitable',model:'400',authority:'I recommend',manager:'Operations director',evaluator:'Site engineer',approver:'Finance director',purchasing:'Central procurement',intent:'Compare',timeframe:'1–3 months',budget:'Not set yet',priority:'Uptime / reliability',visit:'Virtual',date:new Date(Date.now()+7*86400000).toISOString().slice(0,10),slot:'Morning, 8–12',timezone:'US Eastern',contact:'Email',referral:'Invite teammate',attendees:'Me, Technical evaluator'}};
  const existing=control.recordInfo('APE-C4C-SAMPLE');if(existing)sample.id='APE-C4C-SAMPLE';
  const baseHandoff=s=>control.handoff({...s,id:'APE-C4C-SAMPLE',sampleId:'APE-C4C-SAMPLE'});
  sample.id=baseHandoff(sample);
  mountSalesPage(panel,sample,{save(){},toast,handoff:baseHandoff,request:control.request,recordInfo:control.recordInfo,openRecord:control.openRecord,go});
  $('#load-crm-example').textContent='Restart the example lead →';explain(1);panel.scrollIntoView({behavior:paused?'auto':'smooth',block:'start'});
 };
 const ids=['inquiries','coverage','qualified','quoted','won','order'];
 function model(){const v={};for(const id of ids){const el=$('#'+id);if(!el.validity.valid||el.value===''){$('#impact-equation').textContent='Enter valid assumptions to update the model.';return}v[id]=Number(el.value)}
 $('#inquiries-value').textContent=v.inquiries;$('#coverage-value').textContent=v.coverage+'%';const revenue=v.inquiries*v.qualified/100*v.coverage/100*v.quoted/100*v.won/100*v.order,base=revenue*50/v.coverage,max=Math.max(base,revenue)||1;
 $('#impact-value').textContent=short(revenue);$('#baseline-value').textContent=short(base);$('#scenario-value').textContent=short(revenue);$('#baseline-bar').style.height=base/max*90+'%';$('#scenario-bar').style.height=revenue/max*90+'%';$('#impact-equation').textContent=v.inquiries+' inquiries × '+v.qualified+'% qualified × '+v.coverage+'% followed through × '+v.quoted+'% quoted × '+v.won+'% won × $'+v.order.toLocaleString()+'.';
 }
 ids.forEach(id=>$('#'+id).addEventListener('input',model));model();
 const horizons=[
 ['Make the first pilot measurable.',['Map the real C4C lead lifecycle, owners and response expectations. Establish baseline conversion and handoff loss.','Pilot one event: hands-on equipment, a personal needs finder, personal follow-up and a documented walkthrough request.','Review completion, accepted ownership, meeting quality and next-action coverage every week.']],
 ['Scale what earns its place.',['Compare event, LinkedIn, YouTube and referral cohorts by qualified pipeline and outcomes.','Refine permission-based nurture, partner acknowledgment and manager escalation.','Expand the audiences and events that produce useful conversations; test referral incentives with clear terms.']],
 ['Build a learning growth system.',['Feed verified outcomes back into content, recommendations and rep coaching.','Evaluate AI-assisted brief preparation and follow-up prioritization with human review.','Scale across regions with local ownership, consistent measurement and validated CRM integrations.']]
 ];
 function horizon(i){document.querySelectorAll('[data-horizon]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.horizon)===i)));const h=horizons[i];$('#horizon-detail').innerHTML='<h3>'+h[0]+'</h3><ol>'+h[1].map(x=>'<li>'+x+'</li>').join('')+'</ol>';if(!paused)$('#horizon-detail').animate([{clipPath:'inset(0 100% 0 0)',transform:'translateX(-15px)'},{clipPath:'inset(0 0 0 0)',transform:'none'}],{duration:650,easing:'cubic-bezier(.16,1,.3,1)'})}
 document.querySelectorAll('[data-horizon]').forEach(b=>b.onclick=()=>horizon(Number(b.dataset.horizon)));horizon(0);

 $('#share-experience').onclick=async()=>{try{if(navigator.share)await navigator.share({title:'Power, with purpose. — Version 3',url:BASE});else{await navigator.clipboard.writeText(BASE);toast('Version 3 link copied.')}}catch(e){if(e.name!=='AbortError')toast(BASE)}};
}
