import {STEPS,MODELS,blank,preferred,complete,esc,localDate} from './mission.mjs?v=conversion-17';
import {QUESTIONS,questionsFor,questionError} from './questions.mjs?v=conversion-17';
import {mountEquipment,showDetails} from './equipment.mjs?v=conversion-17';
import {mountSalesPage} from './sales-page.mjs?v=conversion-17';
import {zahSodaPop} from './sodapop.mjs?v=conversion-17';
import {completionProgress} from './progress.mjs?v=conversion-17';
const $=s=>document.querySelector(s);
export function mountGame({toast,paused,handoff,request,recordInfo,openRecord,go,onClear}){
 const key='zah-atlas-mission-v3';let state=blank(),rewardTimer;
 try{const v=JSON.parse(localStorage.getItem(key));if(v?.version===3&&v.answers&&Array.isArray(v.done)&&Number.isInteger(v.step)&&v.step>=0&&v.step<=7)state=v;}catch{}
 const inbound=new URLSearchParams(location.search).get('ref');if(inbound&&/^[a-zA-Z0-9-]{1,28}$/.test(inbound))state.ref=inbound;
 function save(){try{localStorage.setItem(key,JSON.stringify(state));$('#game-save').textContent='Saved on this device';}catch{$('#game-save').textContent='Session only';}}
 function current(){const list=questionsFor(state.answers);return list.find(q=>q.id===state.question)||list.find(q=>q.group===Math.min(state.step,6))||list[0];}
 function header(){
  const progress=completionProgress(state),name=state.answers.first?.trim();
  $('#player-name').textContent=name?name+'’s plan':'Let’s start with you.';$('#xp-total').textContent=progress.percent+'% complete';$('#badge-count').textContent=progress.label;$('#xp-fill').style.width=progress.percent+'%';
  const track=$('.survey-identity .xp-track');track.setAttribute('role','progressbar');track.setAttribute('aria-label','Equipment plan completion');track.setAttribute('aria-valuemin','0');track.setAttribute('aria-valuemax','100');track.setAttribute('aria-valuenow',String(progress.percent));track.setAttribute('aria-valuetext',progress.percent+'% complete. '+progress.label);
  $('#live-xp').innerHTML='<span>'+esc(name||'Your plan')+'</span><b>'+progress.percent+'% complete</b>';
  $('#mission-map').innerHTML=STEPS.map((s,i)=>'<li><button type="button" data-step="'+i+'" '+(i>state.step&&!state.done.includes(i)?'disabled':'')+' class="'+(state.step===i?'current':'')+'" aria-label="'+s.label+(state.done.includes(i)?', completed':'')+'"><span>'+(state.done.includes(i)?'✓':i+1)+'</span><span>'+s.label+'</span></button></li>').join('');
 }
 function field(f){const value=esc(state.answers[f.name]||'');if(f.type==='select')return '<label>'+f.label+'<select aria-label="'+f.label+'" name="'+f.name+'" '+(f.required?'required':'')+'><option value="">Choose a window</option>'+f.options.map(v=>'<option '+(state.answers[f.name]===v?'selected':'')+'>'+v+'</option>').join('')+'</select></label>';
  return '<label>'+f.label+'<input name="'+f.name+'" type="'+f.type+'" '+(f.required?'required':'')+' '+(f.type==='date'?'min="'+localDate()+'"':'maxlength="160"')+' autocomplete="'+({first:'given-name',last:'family-name',email:'email',company:'organization',phone:'tel'}[f.name]||'off')+'" value="'+value+'"></label>';
 }
 function collect(){const form=$('#mission-form');if(!form)return;const q=current(),data=new FormData(form),patch=Object.fromEntries(data);if(q.type==='multi')patch[q.id]=data.getAll(q.id).join(', ');for(const k of Object.keys(patch))patch[k]=String(patch[k]).trim();state.answers={...state.answers,...patch};}
 function focusStage(){const main=$('#zw-main'),el=$('.mission-play'),r=el.getBoundingClientRect(),m=main.getBoundingClientRect(),bar=$('.survey-identity').offsetHeight;main.scrollTo({top:main.scrollTop+r.top-m.top-(matchMedia('(max-width:760px)').matches?bar+80:bar+95),behavior:'auto'});}
 function reward(i){clearTimeout(rewardTimer);const el=$('.survey-identity');if(!paused())zahSodaPop(el,false);$('#stage-reward').textContent='✓ '+STEPS[i].label+' completed';rewardTimer=setTimeout(header,1800);}
 function navigate(q){state.question=q.id;state.step=q.group;save();render();focusStage();}
 function render(){
  header();if(state.step===7){$('#stage-eyebrow').textContent='YOUR PERSONALIZED EQUIPMENT PAGE';$('#stage-reward').textContent='✓ PROFILE COMPLETE';mountSalesPage($('#game-stage'),state,{save,toast,handoff,request,recordInfo,openRecord,go,edit:group=>navigate(questionsFor(state.answers).find(q=>q.group===group))});return;}
  const q=current();state.question=q.id;state.step=q.group;header();const groupQs=questionsFor(state.answers).filter(x=>x.group===q.group),position=groupQs.indexOf(q);
  $('#stage-eyebrow').textContent=STEPS[q.group].label+' · '+(position+1)+' of '+groupQs.length;$('#stage-reward').textContent=state.done.includes(q.group)?'✓ Section completed':'Section '+(q.group+1)+' of 7';
  let body='';
  if(['choice','multi'].includes(q.type)){const known=q.options.map(o=>Array.isArray(o)?o[0]:o),old=state.answers[q.id];const options=old&&q.type==='choice'&&!known.includes(old)?[...q.options,[old,old]]:q.options;body='<fieldset class="question-options"><legend class="sr-only">'+q.title+'</legend>'+options.map(o=>{const [v,label]=Array.isArray(o)?o:[o,o],checked=q.type==='multi'?(old||'').split(', ').includes(v):old===v;return '<label class="answer-choice"><input type="'+(q.type==='multi'?'checkbox':'radio')+'" name="'+q.id+'" value="'+esc(v)+'" '+(checked?'checked':'')+'><span>'+esc(label)+'</span><i aria-hidden="true">'+(checked?'✓':'+')+'</i></label>';}).join('')+'</fieldset>';}
  else if(q.type==='equipment')body='<div id="garage"></div>';
  else body='<div class="question-fields">'+q.fields.map(field).join('')+'</div>';
  if(q.detail)body+='<details class="optional-detail"><summary>'+q.detail.label+'</summary>'+field(q.detail)+'</details>';
  $('#game-stage').innerHTML='<div class="game-heading"><h3 id="question-heading">'+q.title+'</h3>'+(q.hint?'<p>'+q.hint+'</p>':'')+'</div><form id="mission-form" aria-labelledby="question-heading">'+body+'<p id="game-error" class="game-error" role="alert"></p><div class="game-buttons"><button class="text-btn" type="button" id="game-back" '+(q===QUESTIONS[0]?'hidden':'')+'>← Back</button><button class="btn gold" type="submit">'+(q.id==='referral'?'See my equipment page':q.type==='equipment'?'Choose this equipment':'Continue')+' <span>→</span></button></div></form>';
  if(q.type==='equipment'){state.answers.model ||= preferred(state.answers);mountEquipment($('#garage'),state.answers,{paused,onSelect:id=>{state.answers.model=id;header();save();}});}
  const form=$('#mission-form');form.oninput=()=>{collect();header();save();};form.onchange=()=>{collect();header();form.querySelectorAll('.answer-choice').forEach(el=>el.querySelector('i').textContent=el.querySelector('input').checked?'✓':'+');save();};
  form.onsubmit=e=>{e.preventDefault();collect();const error=questionError(q,state.answers);if(error){$('#game-error').textContent=error;return;}if(q.id==='sms'&&state.answers.sms==='email'){state.answers.contact='Email';state.answers.sms='no';}
   const next=questionsFor(state.answers).find(v=>QUESTIONS.indexOf(v)>QUESTIONS.indexOf(q));
   let earned=false;if(!next||next.group!==q.group){const r=complete(state,q.group,{});if(r.error){$('#game-error').textContent=r.error;if(Number.isInteger(r.step)){navigate(questionsFor(state.answers).find(x=>x.group===r.step));$('#game-error').textContent=r.error;}return;}state=r.state;earned=r.earned;}
   if(next){state.question=next.id;state.step=next.group;}else{state.step=7;state.question='result';}
   save();render();focusStage();if(earned)reward(q.group);
  };
  $('#game-back').onclick=()=>{collect();const list=questionsFor(state.answers),prev=list.filter(v=>QUESTIONS.indexOf(v)<QUESTIONS.indexOf(q)).at(-1);if(prev)navigate(prev);};
 }
 $('#mission-map').onclick=e=>{const b=e.target.closest('[data-step]');if(!b||b.disabled)return;collect();navigate(questionsFor(state.answers).find(q=>q.group===Number(b.dataset.step)));};
 const identity=$('.survey-identity'),restart=$('#restart-mission'),shell=$('#mission'),main=$('#zw-main');
 restart.textContent='Restart';restart.classList.add('survey-restart');restart.setAttribute('aria-label','Restart this equipment plan');identity.append(restart);
 let frame=0;
 function updateSticky(){
  frame=0;const viewport=main.getBoundingClientRect(),container=shell.getBoundingClientRect(),top=viewport.top+(parseFloat(getComputedStyle(identity).top)||0);
  const stuck=container.top+shell.clientTop<top&&container.bottom>top;
  identity.style.setProperty('--profile-bleed-left',(viewport.left+main.clientLeft-container.left-shell.clientLeft)+'px');
  identity.style.setProperty('--profile-viewport-width',main.clientWidth+'px');
  identity.classList.toggle('is-stuck',stuck);
 }
 function scheduleSticky(){if(!frame)frame=requestAnimationFrame(updateSticky);}
 main.addEventListener('scroll',scheduleSticky,{passive:true});window.addEventListener('resize',scheduleSticky,{passive:true});
 new ResizeObserver(scheduleSticky).observe(shell);
 $('#restart-mission').onclick=()=>{const d=showDetails('Restart your equipment plan?','<p>This clears the profile and its demonstration sales record on this device. You can keep your current plan or start again.</p><div class="sales-actions"><button type="button" class="btn dark" id="keep-profile">Keep my plan</button><button type="button" class="btn gold" id="confirm-restart">Restart my plan</button></div>');$('#keep-profile').onclick=()=>d.close();$('#confirm-restart').onclick=()=>{d.close();onClear(state.id);state=blank();save();render();focusStage();scheduleSticky();toast('Ready for a new equipment profile.');};};
 render();scheduleSticky();
 return {showExample(example){state=example;save();render();go(3);requestAnimationFrame(focusStage);}};
}
