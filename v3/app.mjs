import {mountSalesPage} from './sales-page.mjs?v=conversion-7';
import {mountSignals} from './signals.mjs?v=conversion-7';
import {mountGame} from './game.mjs?v=conversion-7';
import {mountControl} from './control.mjs?v=conversion-7';
import {BASE} from './mission.mjs?v=conversion-7';
import {mountOverview} from './overview.mjs?v=conversion-7';
import {alignedScrollTop} from './navigation.mjs?v=conversion-7';
import {mountProspectConversion} from './prospect-conversion.mjs?v=conversion-7';
import {mountDisconnected} from './disconnected-journey.mjs?v=conversion-7';
import {mountStrategyVideoSlots} from './strategy-video-slots.mjs?v=conversion-7';
const $=s=>document.querySelector(s);
const short=n=>n>=1e6?'$'+(Math.round(n/10000)/100).toFixed(2)+'m':'$'+Math.round(n/1000)+'k';
export function boot(mountDeck){
 const main=$('#zw-main'),root=$('.zw-root'),sections=[...main.querySelectorAll('[data-idx]')];let paused=false,overviewOpen=false,timer,signals,machine,disconnected;
 const effectsPaused=()=>paused||overviewOpen;
 const motion=()=>{document.body.classList.toggle('motion-paused',paused);$('#motion-toggle').textContent=paused?'Enable effects':'Pause effects';$('#motion-toggle').setAttribute('aria-pressed',String(paused));signals?.setPaused(effectsPaused());machine?.setPaused(effectsPaused());disconnected?.setPaused(effectsPaused())};motion();$('#motion-toggle').onclick=()=>{paused=!paused;motion()};
 function toast(s){clearTimeout(timer);$('#toast').textContent=s;$('#toast').classList.add('show');timer=setTimeout(()=>$('#toast').classList.remove('show'),4200)}
 function sceneTop(el){
  const isMachine=el.dataset.experience==='machine',anchor=isMachine?el:el.querySelector('.section-head')||el,header=$('.topbar');
  return alignedScrollTop({scrollTop:main.scrollTop,anchorTop:anchor.getBoundingClientRect().top,containerTop:main.getBoundingClientRect().top,headerHeight:header?.getBoundingClientRect().height||0,gap:isMachine?0:(matchMedia('(max-width:760px)').matches?16:24)});
 }
 function go(i,{focus=false,instant=false}={}){const el=sections[i];if(!el)return;main.scrollTo({top:i===0?0:sceneTop(el),behavior:instant||paused?'auto':'smooth'});$('#chapters').hidden=true;$('#menu-toggle').setAttribute('aria-expanded','false');if(focus){const heading=el.querySelector('h1,h2');if(heading){heading.tabIndex=-1;setTimeout(()=>heading.focus({preventScroll:true}),instant||paused?0:520)}}}
 mountDeck(root,{onScene(i){root.dataset.activeScene=i;document.body.dataset.scene=i}});
 function mountScenePagers(){
  const sections=[...main.querySelectorAll('[data-idx]')],fallback=['Inside the machine','See the disconnected journey','Follow the connected journey','Take the Goal Pulse Check','Keep ownership visible','Model the impact','The road ahead'];
  const names=sections.map((section,i)=>section.getAttribute('aria-label')||fallback[i]||'Section '+(i+1));
  sections.forEach((section,i)=>{const nav=document.createElement('nav');nav.className='scene-pager';nav.setAttribute('aria-label','Section navigation');const count=document.createElement('span');count.className='scene-pager-count';count.textContent='SECTION '+String(i+1).padStart(2,'0')+' / '+String(sections.length).padStart(2,'0');nav.append(count);const actions=document.createElement('div');if(i>0){const back=document.createElement('button');back.type='button';back.dataset.go=String(i-1);back.innerHTML='<span aria-hidden="true">←</span> Back to '+names[i-1];actions.append(back)}if(i<sections.length-1){const next=document.createElement('button');next.type='button';next.className='scene-pager-next';next.dataset.go=String(i+1);next.innerHTML='Continue to '+names[i+1]+' <span aria-hidden="true">→</span>';actions.append(next)}else{const overview=document.createElement('button');overview.type='button';overview.className='scene-pager-next';overview.setAttribute('data-overview-open','');overview.innerHTML='Return to strategy overview <span aria-hidden="true">↗</span>';actions.append(overview)}nav.append(actions);section.append(nav)});
 }
 mountScenePagers();
 document.addEventListener('click',e=>{const b=e.target.closest('[data-go]');if(b&&!b.hasAttribute('data-act')){e.preventDefault();go(Number(b.dataset.go),{focus:Boolean(b.closest('.scene-pager'))})}});
 $('#menu-toggle').onclick=()=>{const el=$('#chapters');el.hidden=!el.hidden;$('#menu-toggle').setAttribute('aria-expanded',String(!el.hidden))};
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){$('#chapters').hidden=true;$('#menu-toggle').setAttribute('aria-expanded','false')}});
 const control=mountControl(toast);mountGame({toast,paused:effectsPaused,handoff:control.handoff,request:control.request,recordInfo:control.recordInfo,openRecord:control.openRecord,onClear:control.clear,go});mountProspectConversion({toast});mountStrategyVideoSlots();
 import('./machine.mjs?v=strategy-2').then(m=>{machine=m.mountMachine(effectsPaused)}).catch(()=>{$('#machine-fallback').hidden=false;$('#machine-canvas').hidden=true});
 signals=mountSignals({main,paused:effectsPaused()});
 disconnected=mountDisconnected({paused:effectsPaused});
 mountOverview({onEnter:()=>go(0),onOpenChange(open){overviewOpen=open;signals?.setPaused(effectsPaused());machine?.setPaused(effectsPaused());disconnected?.setPaused(effectsPaused())}});
 function sceneFromHash(){let key='';try{key=decodeURIComponent(location.hash.slice(1))}catch{key=location.hash.slice(1)}return sections.findIndex(section=>section.dataset.experience===key)}
 const requestedScene=sceneFromHash();
 if(requestedScene>=0)requestAnimationFrame(()=>requestAnimationFrame(()=>go(requestedScene,{instant:true})));
 window.addEventListener('hashchange',()=>{const i=sceneFromHash();if(i>=0)go(i,{focus:true})});
 const explanations=[
  ['Sales context from C4C','Lead identity, company, source and assigned owner supply the starting point. This example uses fictional records; a real export or connection has not been configured.'],
  ['Customer context from the Goal Pulse Check','The customer adds application, equipment needs, buying team and visit preferences. Those details shape a personalized equipment page and enrich the matching local record.'],
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
 ['Make the first pilot measurable.',['Map the real C4C lead lifecycle, owners and response expectations. Establish baseline conversion and handoff loss.','Pilot one event: large displays, a staffed hands-on equipment demonstration, a focused Goal Pulse Check and an owned walkthrough request.','Review completion, accepted ownership, meeting quality and next-action coverage every week.']],
 ['Scale what earns its place.',['Compare event, LinkedIn, YouTube and referral cohorts by qualified pipeline and outcomes.','Use Goal Pulse Check context to shape LinkedIn and YouTube retargeting. Pair relevant creative with local sales outreach, partner acknowledgment and visible next actions.','Expand the audiences and events that produce useful conversations; test referral incentives with clear terms.']],
 ['Keep learning from the work.',['Feed verified outcomes back into content, recommendations and rep coaching.','Evaluate AI-assisted brief preparation and follow-up prioritization with human review.','Scale across regions with local ownership, consistent measurement and validated CRM integrations.']]
 ];
 function horizon(i){document.querySelectorAll('[data-horizon]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.horizon)===i)));const h=horizons[i],detail=$('#horizon-detail');detail.innerHTML='<h3>'+h[0]+'</h3><ol>'+h[1].map(x=>'<li>'+x+'</li>').join('')+'</ol>';if(!paused&&typeof detail.animate==='function')detail.animate([{clipPath:'inset(0 100% 0 0)',transform:'translateX(-15px)'},{clipPath:'inset(0 0 0 0)',transform:'none'}],{duration:650,easing:'cubic-bezier(.16,1,.3,1)'})}
 document.querySelectorAll('[data-horizon]').forEach(b=>b.onclick=()=>horizon(Number(b.dataset.horizon)));horizon(0);

 $('#share-experience').onclick=async()=>{try{if(navigator.share)await navigator.share({title:'Power, with purpose. — Version 3',url:BASE});else{await navigator.clipboard.writeText(BASE);toast('Version 3 link copied.')}}catch(e){if(e.name!=='AbortError')toast(BASE)}};
}
