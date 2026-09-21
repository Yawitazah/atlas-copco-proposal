import {esc,MODELS} from './mission.mjs?v=conversion-11';
import {zahSodaPop} from './sodapop.mjs?v=conversion-11';
const $=s=>document.querySelector(s);
const short=n=>n>=1e6?'$'+(n/1e6).toFixed(2)+'m':'$'+Math.round(n/1000)+'k';
function mountProfileTeaser(){
 if($('#zah-profile-teaser'))return;
 const about=$('.about-grid');
 if(!about)return;
 if(!about.id)about.id='about-zah';
 if(!document.querySelector('link[href*="profile-float.css"]')){
  const style=document.createElement('link');
  style.rel='stylesheet';style.href='./profile-float.css?v=profile-1';style.dataset.profileFloatStyle='';
  document.head.append(style);
 }
 const teaser=document.createElement('aside');
 teaser.id='zah-profile-teaser';teaser.className='profile-teaser is-pending';teaser.setAttribute('aria-label','About Zah (Lorenzo) White');
 teaser.dataset.aboutTarget='.about-grid';teaser.dataset.profilePortrait='./assets/zah-headshot.png';
 teaser.innerHTML='<a class="profile-teaser-link" href="#'+about.id+'"><span class="profile-teaser-ribbon"><span>MARKETING COMMUNICATIONS MANAGER</span><span>APE CANDIDATE</span></span><span class="profile-teaser-portrait"><span class="profile-teaser-initials" aria-hidden="true">LW</span><img src="./assets/zah-headshot.png" alt="Lorenzo White"></span><span class="profile-teaser-copy"><span class="profile-teaser-eyebrow">FOUNDER · ZAH BRAND SOLUTIONS</span><strong>Zah (Lorenzo) White</strong><span>Growth Marketing Strategy &amp; Systems Architect</span><small>Atlas Copco role candidate</small><b>Explore Lorenzo <i aria-hidden="true">→</i></b></span></a>';
 document.body.append(teaser);
 let entranceDone=false;
 const finishEntrance=()=>{
  if(entranceDone)return;
  const blocked=teaser.classList.contains('is-hidden')||document.body.classList.contains('overview-open')||document.querySelector('dialog[open]')||document.visibilityState==='hidden';
  if(blocked)return;
  entranceDone=true;teaser.dataset.sodaPop='complete';
  entranceObserver.disconnect();document.removeEventListener('visibilitychange',finishEntrance);
  teaser.classList.remove('is-pending');
  if(document.body.classList.contains('motion-paused'))return;
  teaser.classList.add('is-entering');
  setTimeout(()=>{
   teaser.classList.remove('is-entering');
   if(teaser.isConnected&&!teaser.classList.contains('is-hidden')&&!document.body.classList.contains('motion-paused'))zahSodaPop(teaser.querySelector('.profile-teaser-link'),true);
  },760);
 };
 const entranceObserver=new MutationObserver(finishEntrance);
 entranceObserver.observe(document.body,{attributes:true,attributeFilter:['class']});
 entranceObserver.observe(teaser,{attributes:true,attributeFilter:['class']});
 document.addEventListener('visibilitychange',finishEntrance);
 setTimeout(finishEntrance,850);
 const link=teaser.querySelector('a'),portrait=teaser.querySelector('img');
 portrait.addEventListener('error',()=>{portrait.hidden=true;teaser.classList.add('profile-teaser-no-portrait')},{once:true});
 link.addEventListener('click',event=>{
  event.preventDefault();
  about.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'});
 });
 if('IntersectionObserver'in globalThis){
  const observer=new IntersectionObserver(([entry])=>{
   const hidden=entry.isIntersecting;
   if(hidden&&teaser.contains(document.activeElement)){
    about.tabIndex=-1;about.focus({preventScroll:true});
   }
   teaser.classList.toggle('is-hidden',hidden);teaser.setAttribute('aria-hidden',String(hidden));link.tabIndex=hidden?-1:0;
  },{threshold:.12});
  observer.observe(about);
 }
 teaser.addEventListener('animationend',()=>teaser.classList.remove('is-entering'));
}
export function mountControl(toast){
 mountProfileTeaser();
 const C=globalThis.DemoCore,key='zah-atlas-control-v3';let now=Date.now(),records=C.sampleLeads(now),seq=301,filter='all';
 try{const v=JSON.parse(localStorage.getItem(key));if(v&&Array.isArray(v.records)&&v.records.length<250&&Number.isFinite(v.now)&&v.records.every(l=>l.id&&Array.isArray(l.history))){({now,records,seq}=v)}}catch{}
 records=records.map(l=>({...l,source:l.source==='Needs finder'?'Goal Pulse Check':l.source,history:l.history.map(h=>h.text==='Example lead and owner supplied as a static sample, then enriched with needs-finder preferences. No export or live API was used.'?{...h,text:'Example lead and owner supplied as a static sample, then enriched with Goal Pulse Check preferences. No export or live API was used.'}:h)}));
 const save=()=>{try{localStorage.setItem(key,JSON.stringify({now,records,seq}))}catch{toast('Storage unavailable: this session is not saved.')}};
 const date=n=>new Date(n).toLocaleDateString('en-US',{month:'short',day:'numeric'});
 function draw(){const stats=C.stats(records,now),attention=records.filter(l=>['red','amber'].includes(C.status(l,now).tone)).length;
 $('#control-metrics').innerHTML=[['Open inquiries',stats.open,'Assigned opportunities'],['Needs attention',attention,'Overdue / unaccepted'],['Open pipeline',short(stats.pipeline),'Unweighted sample value'],['Won value',short(stats.won),'Sample booked orders']].map((x,i)=>'<div class="metric '+(i===1?'alert':'')+'"><span>'+x[0]+'</span><strong>'+x[1]+'</strong><small>'+x[2]+'</small></div>').join('');
 const shown=records.filter(l=>filter==='mine'?l.isMission:filter==='attention'?['red','amber'].includes(C.status(l,now).tone):true);
 $('#records').innerHTML=shown.length?shown.map(l=>{const status=C.status(l,now);return '<button class="record-row" data-record="'+esc(l.id)+'"><span><small>'+esc(l.id)+' · '+esc(l.source)+'</small><strong>'+esc(l.company)+'</strong><small>'+esc(l.profile?l.profile.first+' '+l.profile.last+' · '+l.profile.role:l.application)+'</small></span><span><span class="record-state '+status.tone+'">'+status.label+'</span><strong>'+esc(l.owner)+'</strong><small>'+esc(l.stage)+'</small></span><span><small>NEXT ACTION · DUE '+(l.due?date(l.due):'CLOSED')+'</small><strong>'+esc(l.next)+'</strong></span><span>↗</span></button>'}).join(''):'<p class="record-empty">No records in this view. Complete your profile and create its local record to see it here.</p>';
 document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===filter)));
 }
 function show(id){const l=records.find(x=>x.id===id);if(!l)return;const a=l.profile||{},closed=C.CLOSED.includes(l.stage),model=MODELS.find(x=>x.id===a.model);
 const pairs=l.profile?[['Contact',a.first+' '+a.last+' · '+a.email],['Phone / preference',(a.phone||'No phone')+' · '+a.contact],['Location / application',a.region+' · '+a.application],['Equipment to review',model?.name||'To confirm'],['Flow / pressure',(a.flow==='unknown'?'Flow to confirm':a.flow==='above400'?'>400 cfm':a.flow+' cfm band')+' · '+(a.pressure==='unknown'?'Pressure to confirm':a.pressure==='above150'?'>150 psi':a.pressure+' psi band')],['Power',a.power],['Decision role',a.authority],['Reporting manager',[a.manager,a.managerDetail].filter(Boolean).join(' · ')||'Needs identification'],['Technical evaluator',[a.evaluator,a.evaluatorDetail].filter(Boolean).join(' · ')||'Needs identification'],['Budget approver',[a.approver,a.approverDetail].filter(Boolean).join(' · ')||'Needs identification'],['Purchasing route',a.purchasing],['Dealer / rental partner',a.partner||'Not specified'],['Commercial plan',a.intent+' · '+a.budget+' · '+a.timeframe],['Walkthrough request',a.visit==='Later'?'Discuss later':a.visit+' · '+a.date+' · '+a.slot+' · '+a.timezone+' (not booked)'],['Site / attendees',(a.site||'To confirm')+' · '+(a.attendees||'To confirm')],['Referral',(a.referral||'None')+(l.ref?' · incoming code '+l.ref:'')],['Consent preferences','SMS: '+(a.sms==='yes'?'yes':'no')+' · marketing email: '+(a.marketing==='yes'?'yes':'no')+' (demo)'],['Notes',a.notes||'None']]:[];
 $('#record-detail').innerHTML='<div class="record-head"><div><small>'+esc(l.id)+' · '+(l.isMission?'YOUR LOCAL PROFILE':'FICTIONAL SAMPLE')+'</small><h3 id="record-title">'+esc(l.company)+'</h3></div><button id="close-record" aria-label="Close record">×</button></div><div class="record-body"><div class="fit-note">Internal owner: '+esc(l.owner)+' · '+esc(l.stage)+'<br>Next: '+esc(l.next)+' · '+(l.due?date(l.due):'Closed')+'</div>'+(pairs.length?'<dl class="record-profile">'+pairs.map(([k,v])=>'<div><dt>'+k+'</dt><dd>'+esc(v)+'</dd></div>').join('')+'</dl>':'')+'<ol class="activity-trail">'+l.history.map(h=>'<li><small>'+date(h.at)+' · '+esc(h.kind)+'</small>'+esc(h.text)+'</li>').join('')+'</ol>'+(closed?'<p class="fine">This record is closed.</p>':'<form id="activity-form"><div class="form-grid"><label>Activity<select name="action" id="activity-action"><option value="accept">Accept ownership</option><option value="contact">Customer contact</option><option value="visit">Site visit completed</option><option value="partner">Route to partner</option><option value="partner_accept">Partner accepted</option><option value="quote">Quote issued</option><option value="won">Closed won</option><option value="lost">Closed lost</option><option value="nurture">Nurture / follow-up</option></select></label><label>Next action due<select name="days"><option value="1">Within 1 demo day</option><option value="2">Within 2 demo days</option><option value="7">Within 7 demo days</option></select></label><label class="full">What happened?<textarea name="note" required minlength="8" maxlength="400" placeholder="Use a fictional outcome for the demonstration."></textarea></label><label class="full">Next action<input name="next" required maxlength="120" placeholder="Confirm preferred site walkthrough"></label><label id="partner-field" hidden>Receiving partner<input name="partner" maxlength="100"></label><label id="value-field" hidden>Quoted / booked value ($)<input name="value" type="number" min="1" max="100000000" value="'+l.value+'"></label><label class="checkbox full"><input name="confirmed" type="checkbox">Customer confirmation received (simulated)</label></div><p class="game-error" id="activity-error" role="alert"></p><div class="game-buttons"><button class="btn gold" type="submit">Save local activity →</button></div></form>')+'<p class="fine">Rep reports and simulated customer confirmations are shown separately. Production evidence and permissions must be defined in C4C.</p></div>';
 const d=$('#record-dialog');if(!d.open)d.showModal();$('#close-record').onclick=()=>d.close();
 if(!closed){const sel=$('#activity-action');sel.value=l.stage==='New'?'accept':l.stage==='Quoted'?'won':l.stage==='Partner pending'?'partner_accept':'contact';const fields=()=>{const p=sel.value==='partner',v=['quote','won'].includes(sel.value),end=['won','lost'].includes(sel.value);$('#partner-field').hidden=!p;$('#value-field').hidden=!v;for(const [name,on] of [['partner',p],['value',v]]){const input=$('[name="'+name+'"]');input.required=on;input.disabled=!on}$('[name=next]').required=!end};fields();sel.onchange=fields;
 $('#activity-form').onsubmit=e=>{e.preventDefault();const input=Object.fromEntries(new FormData(e.currentTarget));input.due=now+Number(input.days)*C.DAY;const r=C.act(l,input,now);if(r.error){$('#activity-error').textContent=r.error;return}if(input.confirmed)r.lead.history.push({at:now,kind:'Customer confirmation · simulated',text:'A confirmation was logged in this local demonstration; no external message was sent.'});records=records.map(x=>x.id===id?r.lead:x);save();draw();show(id);toast('Activity recorded. The owner and next action remain visible.')};
 }
 }
 $('#records').onclick=e=>{const b=e.target.closest('[data-record]');if(b)show(b.dataset.record)};
 document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;draw()});
 $('#advance-day').onclick=()=>{now+=C.DAY;save();draw();toast('Demo clock: '+date(now)+'. Review overdue follow-ups.')};
 $('#reset-records').onclick=()=>{now=Date.now();records=[...records.filter(l=>l.isMission),...C.sampleLeads(now)];filter='all';save();draw();toast('Fictional samples reset. Your profile is retained.')};
 draw();
 return {
 handoff(s){const existing=records.find(l=>l.id===s.id),a=s.answers;let l;
 if(existing&&JSON.stringify(existing.profile)===JSON.stringify(a))return existing.id;
 if(existing){l={...existing,company:a.company,profile:{...a},ref:s.ref,history:[...existing.history,{at:now,kind:'Customer profile · local',text:'Profile details updated; sales owner and activity retained.'}]};records=records.map(x=>x.id===l.id?l:x)}
 else{l=C.createLead({...a,intent:a.intent==='Rent'?'Rent for a project':a.intent,source:s.ref?'Referral':'Goal Pulse Check'},now,seq++);if(s.sampleId)l.id=s.sampleId;l.isMission=true;l.profile={...a};l.ref=s.ref;l.next=a.visit==='Later'?'Accept and clarify equipment requirements':'Accept and confirm walkthrough preferences';l.history=[{at:now,kind:'Profile completed · local',text:'Personal profile, buying team and equipment brief captured. Walkthrough '+(a.visit==='Later'?'deferred.':'requested; not booked.')}];if(s.sampleId){l.source='C4C-style snapshot · sample';l.history.unshift({at:now,kind:'C4C-style snapshot · fictional',text:'Example lead and owner supplied as a static sample, then enriched with Goal Pulse Check preferences. No export or live API was used.'});}records.unshift(l)}
 save();filter='mine';draw();return l.id;
 },
 openRecord:show,
 recordInfo(id){const l=records.find(x=>x.id===id);return l?{owner:l.owner,next:l.next,history:l.history}:null;},
 request(id,type){const l=records.find(x=>x.id===id);if(!l)return null;const next=type==='quote'?'Review requirements and prepare a quote':'Confirm the requested walkthrough';const kind=type==='quote'?'Quote requested · customer demo':'Walkthrough requested · customer demo';if(l.history.at(-1)?.kind!==kind)l.history.push({at:now,kind,text:next+'. Captured on the personalized equipment page; no external message sent.'});l.next=next;l.due=now+C.DAY;save();draw();return {owner:l.owner,next:l.next};},
 clear(id){records=records.filter(l=>l.id!==id);save();draw()}
 };
}
