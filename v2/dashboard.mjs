import {esc} from './game-ui.mjs';
const $=s=>document.querySelector(s);
const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
const short=n=>n>=1e6?'$'+(Math.round((n+.0001)/10000)/100).toFixed(2)+'m':'$'+Math.round(n/1000)+'k';
export function mountDashboard(toast){
 const C=globalThis.DemoCore,key='zah-atlas-control-v2';
 let now=Date.now(),leads=C.sampleLeads(now),seq=107,filter='all',selected=null;
 try{const saved=JSON.parse(localStorage.getItem(key));if(saved&&Array.isArray(saved.leads)&&saved.leads.length<=250&&Number.isFinite(saved.now)&&saved.leads.every(l=>l.id&&Array.isArray(l.history))){({now,leads,seq}=saved)}}catch{}
 const save=()=>{try{localStorage.setItem(key,JSON.stringify({now,leads,seq}))}catch{}};
 const date=n=>new Date(n).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
 function draw(){
 const s=C.stats(leads,now);
 $('#metrics').innerHTML=[['Open inquiries',s.open,'Assigned opportunities',''],['Needs attention',leads.filter(l=>['red','amber'].includes(C.status(l,now).tone)).length,'Overdue or awaiting acceptance','alert'],['Open pipeline',short(s.pipeline),'Unweighted · sample value',''],['Booked value',short(s.won),'Closed won · sample value','']].map(x=>'<div class="metric '+x[3]+'"><span>'+x[0]+'</span><strong>'+x[1]+'</strong><small>'+x[2]+'</small></div>').join('');
 const shown=leads.filter(l=>filter==='attention'?['red','amber'].includes(C.status(l,now).tone):filter==='partner'?l.route==='Partner':true);
 $('#lead-list').innerHTML=shown.length?shown.map(l=>{const st=C.status(l,now);return '<button class="lead-row" data-lead="'+esc(l.id)+'" aria-label="Open '+esc(l.id+' '+l.company)+'"><span><span class="lead-id">'+esc(l.id)+' · '+esc(l.source)+'</span><strong>'+esc(l.company)+'</strong><small>'+esc(l.owner)+' · '+esc(l.stage)+'</small></span><span><span class="lead-state '+st.tone+'">'+st.label+'</span><strong>'+esc(l.next)+'</strong><small>'+(l.due?'Due '+date(l.due):'Closed record')+' · '+money(l.value)+'</small></span><span class="row-arrow">↗</span></button>'}).join(''):'<p style="padding:28px;font-size:13px;color:#a9c1b5">No sample records match this view.</p>';
 $('#demo-clock').textContent=date(now);
 document.querySelectorAll('[data-filter]').forEach(b=>{const active=b.dataset.filter===filter;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))});
 }
 function show(id){
 selected=id;const l=leads.find(x=>x.id===id);if(!l)return;
 const status=C.status(l,now),closed=C.CLOSED.includes(l.stage);
 $('#lead-detail').innerHTML='<div class="detail-head"><div><span class="mini-label">'+esc(l.id)+' / SAMPLE RECORD</span><h3 id="lead-title">'+esc(l.company)+'</h3><p>'+esc(l.source)+' → '+esc(l.owner)+' · Internal owner retained</p></div><button class="close-dialog" aria-label="Close lead record">×</button></div><div class="detail-content"><div class="detail-status"><span>'+esc(l.stage)+' · '+status.label+'</span><span>'+money(l.value)+' '+(l.stage==='Won'?'booked':'recorded value')+'</span></div>'+(l.brief?'<div class="result-chips">'+Object.values(l.brief).flat().map(x=>'<span>'+esc(x)+'</span>').join('')+'</div>':'')+'<strong style="font-size:12px">Activity trail</strong><ol class="activity-timeline">'+l.history.map(h=>'<li><small>'+date(h.at)+' · '+esc(h.kind)+'</small>'+esc(h.text)+'</li>').join('')+'</ol>'+(closed?'<p class="fine-print">This record is closed. Choose an open inquiry to log progress.</p>':'<form id="activity-form" class="activity-form"><label>Activity<select name="action" id="activity-action"><option value="accept">Accept ownership</option><option value="contact">Customer contact</option><option value="visit">Site visit completed</option><option value="partner">Route to partner</option><option value="partner_accept">Partner accepted</option><option value="quote">Quote issued</option><option value="won">Closed won</option><option value="lost">Closed lost</option><option value="nurture">Nurture / follow-up</option></select></label><label>Next action due<select name="days"><option value="1">Within 1 demo day</option><option value="2">Within 2 demo days</option><option value="7">Within 7 demo days</option></select></label><label class="full">What happened? <textarea name="note" minlength="8" maxlength="400" placeholder="Use a fictional outcome for this demonstration." required></textarea></label><label class="full">Next action<input name="next" maxlength="120" placeholder="Example: schedule site demonstration"></label><label id="partner-field" hidden>Receiving partner<input name="partner" maxlength="80" placeholder="Example: Sample Rental Partner"></label><label id="value-field" hidden>Quoted / booked value ($)<input name="value" type="number" min="1" max="100000000" step="1" value="'+l.value+'"></label><div id="activity-error" class="form-error full" role="alert"></div><button class="btn full" type="submit">Save sample activity <span>→</span></button></form>')+'<p class="detail-foot">Rep-reported activity is not proof of customer confirmation. This local prototype records the distinction; production validation belongs in C4C.</p></div>';
 const dialog=$('#lead-dialog');if(!dialog.open)dialog.showModal();
 if(!closed){
 const action=$('#activity-action');action.value=l.stage==='New'?'accept':l.stage==='Partner pending'?'partner_accept':l.stage==='Quoted'?'won':'contact';
 updateAction();
 action.addEventListener('change',updateAction);
 $('#activity-form').addEventListener('submit',e=>{
 e.preventDefault();const data=Object.fromEntries(new FormData(e.target));data.due=now+Number(data.days)*C.DAY;
 const changed=C.act(l,data,now);
 if(changed.error){$('#activity-error').textContent=changed.error;return}
 leads=leads.map(x=>x.id===id?changed.lead:x);save();draw();show(id);toast('Activity saved. Ownership and next action stay visible.');
 });
 }
 $('#lead-detail .close-dialog').addEventListener('click',()=>dialog.close());
 }
 function updateAction(){const a=$('#activity-action').value;$('#partner-field').hidden=a!=='partner';$('#activity-form [name=partner]').disabled=a!=='partner';$('#value-field').hidden=!['quote','won'].includes(a);$('#activity-form [name=value]').disabled=!['quote','won'].includes(a);const closed=['won','lost'].includes(a);$('#activity-form [name=next]').required=!closed;$('#activity-form [name=partner]').required=a==='partner';$('#activity-form [name=value]').required=['quote','won'].includes(a)}
 $('#lead-list').addEventListener('click',e=>{const b=e.target.closest('[data-lead]');if(b)show(b.dataset.lead)});
 document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.filter;draw()}));
 $('#advance-clock').addEventListener('click',()=>{now+=C.DAY;save();draw();toast('Demo clock advanced to '+date(now)+'. Review overdue actions.')});
 $('#reset-demo').addEventListener('click',()=>{now=Date.now();leads=C.sampleLeads(now);seq=107;filter='all';save();draw();toast('Sample records reset. Version one remains separate.')});
 draw();
 return (answers,id)=>{if(id&&leads.some(l=>l.id===id)){filter='all';draw();return id}const l=C.createLead({...answers,company:answers.application+' mission · sample'},now,seq++);l.brief={...answers};leads.unshift(l);filter='all';save();draw();toast(l.id+' created · '+l.owner+' owns the next action.');return l.id};
}
