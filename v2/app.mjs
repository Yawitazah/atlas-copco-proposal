import {mountMission} from './game-ui.mjs';
import {mountDashboard} from './dashboard.mjs';
import {mountSignals} from './signals.mjs';
import {icon} from './icons.mjs';
const $=s=>document.querySelector(s);
const short=n=>n>=1e6?'$'+(Math.round((n+.0001)/10000)/100).toFixed(2)+'m':'$'+Math.round(n/1000)+'k';
export function boot(mountDeck){
 const root=$('.zw-root'),main=$('#zw-main'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let paused=reduced.matches,toastTimer;
 const isPaused=()=>paused;
 function motion(){document.body.classList.toggle('motion-paused',isPaused());document.body.classList.toggle('motion-enabled',!isPaused());$('#motion-toggle').textContent=isPaused()?'Enable motion':'Pause motion';$('#motion-toggle').setAttribute('aria-pressed',String(isPaused()))}
 motion();$('#motion-toggle').addEventListener('click',()=>{paused=!paused;motion()});reduced.addEventListener('change',()=>{paused=reduced.matches;motion()});
 function toast(message){clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').classList.add('show');toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),4500)}
 function go(i){const s=root.querySelector('[data-idx="'+i+'"]');if(s)main.scrollTo({top:s.offsetTop,behavior:isPaused()?'auto':'smooth'});$('#chapters').hidden=true;$('#chapter-toggle').setAttribute('aria-expanded','false')}
 mountDeck(root,{onScene(i){root.dataset.activeScene=String(i)}});
 $('#chapter-toggle').addEventListener('click',()=>{const nav=$('#chapters');nav.hidden=!nav.hidden;$('#chapter-toggle').setAttribute('aria-expanded',String(!nav.hidden))});
 document.querySelectorAll('[data-chapter]').forEach(b=>b.addEventListener('click',()=>go(Number(b.dataset.chapter))));
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#chapters').hidden){$('#chapters').hidden=true;$('#chapter-toggle').setAttribute('aria-expanded','false');$('#chapter-toggle').focus()}});
 document.addEventListener('click',e=>{if(!e.target.closest('.topbar-menu,.chapters')){$('#chapters').hidden=true;$('#chapter-toggle').setAttribute('aria-expanded','false')}});
 const onHandoff=mountDashboard(toast);
 mountMission({onHandoff,go,paused:isPaused});mountSignals(isPaused);
 const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){if(!isPaused())e.target.animate([{opacity:.2,transform:'translateY(35px)'},{opacity:1,transform:'none'}],{duration:850,easing:'cubic-bezier(.16,1,.3,1)'});observer.unobserve(e.target)}},{root:main,threshold:.1});
 document.querySelectorAll('.section-heading,.model-layout,.about-grid').forEach(el=>observer.observe(el));
 const fields=['leads','qualification','quoteRate','winRate','averageValue','coverage'];
 let lastRevenue=1275000,numberFrame=0;
 function model(){
 const data={};
 for(const f of fields){const input=$('#m-'+f);if(!input.validity.valid||input.value===''){$('#model-equation').textContent='Enter a valid value for each assumption to update the scenario.';return}data[f]=Number(input.value)}
 const current=globalThis.DemoCore.model(data),baseline=globalThis.DemoCore.model({...data,coverage:50}),max=Math.max(current.revenue,baseline.revenue)||1;
 $('#o-leads').value=data.leads;$('#o-coverage').value=data.coverage+'%';
 $('#baseline-value').textContent=short(baseline.revenue);$('#selected-value').textContent=short(current.revenue);
 $('#baseline-bar').style.height=baseline.revenue/max*90+'%';$('#selected-bar').style.height=current.revenue/max*90+'%';
 $('#model-uplift').textContent=(current.revenue>=baseline.revenue?'+':'−')+short(Math.abs(current.revenue-baseline.revenue))+' vs. the 50% comparison';
 $('#model-equation').textContent=data.leads+' inquiries × '+data.qualification+'% qualified × '+data.coverage+'% follow-through × '+data.quoteRate+'% quoted × '+data.winRate+'% won × $'+data.averageValue.toLocaleString()+' = '+current.wins.toFixed(1)+' modeled wins';
 cancelAnimationFrame(numberFrame);const start=performance.now(),from=lastRevenue,to=current.revenue;
 function count(t){const p=isPaused()?1:Math.min(1,(t-start)/650),value=from+(to-from)*(1-Math.pow(1-p,3));$('#model-value').textContent=short(value);if(p<1)numberFrame=requestAnimationFrame(count)}
 numberFrame=requestAnimationFrame(count);lastRevenue=to;
 }
 fields.forEach(f=>$('#m-'+f).addEventListener('input',model));model();
 const horizons=[
 ['Make the pilot impossible to lose.','Start with one audience, one event and a visible path from first touch to a human follow-up. Establish the baseline before scaling.',
 ['Validate C4C fields, access, ownership and handoff rules. Agree on response expectations.','Pilot hands-on demonstrations, a mission builder and tailored follow-up.','Measure completion, accepted leads, next-action coverage and qualified meetings.']],
 ['Turn the pilot into a repeatable practice.','Expand the channels and partner workflows that produce useful conversations. Improve the experience with observed behavior.',
 ['Compare channels using qualified pipeline and outcomes, not clicks alone.','Refine permission-based nurture and eligible LinkedIn / YouTube audiences.','Pilot referrals with reviewed incentives; coach teams using the activity trail.']],
 ['Build a learning growth system.','Use verified outcomes to improve what the next customer sees and what the next rep knows. Scale at the pace of the evidence.',
 ['Expand successful experiences across relevant events, regions and partner networks.','Use approved AI to assist summaries, prioritization and next-action suggestions—with human review.','Connect long-term customer value and service insights to future marketing decisions.']]
 ];
 function roadmap(i){const d=horizons[i],el=$('#roadmap-detail');el.innerHTML='<div><h3>'+d[0]+'</h3><p>'+d[1]+'</p></div><ul class="roadmap-checks">'+d[2].map((s,j)=>'<li style="--d:'+j*.12+'s">'+icon('check')+'<span>'+s+'</span></li>').join('')+'</ul>';if(!isPaused())el.animate([{opacity:0,transform:'translateY(15px)'},{opacity:1,transform:'none'}],{duration:550,easing:'ease-out'});document.querySelectorAll('[data-horizon]').forEach(b=>{const a=Number(b.dataset.horizon)===i;b.classList.toggle('active',a);b.setAttribute('aria-pressed',String(a))})}
 document.querySelectorAll('[data-horizon]').forEach(b=>b.addEventListener('click',()=>roadmap(Number(b.dataset.horizon))));roadmap(0);
 $('#copy-link').addEventListener('click',async()=>{try{await navigator.clipboard.writeText('https://yawitazah.github.io/atlas-copco-proposal/v2/');toast('Version-two link copied.')}catch{toast('Share this address: yawitazah.github.io/atlas-copco-proposal/v2/')}});
}
