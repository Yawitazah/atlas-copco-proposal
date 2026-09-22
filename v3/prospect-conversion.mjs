const FALLBACK={first:'Marcus',company:'Northcrew Site Services',application:'Utility maintenance',site:'Active municipal utility sites',model:'188',flow:'189',pressure:'100'};
const MODEL_NAMES={'110':'XAS 110 KD','188':'XAS 188 CD','400':'XAS 400-150 CD'};
const MODEL_ASSETS={'110':'./assets/xas110-cutout.png','188':'./assets/xas188-cutout.png','400':'./assets/xas400-cutout.png'};
const FLOW_LABELS={'110':'Up to 110 cfm','189':'111–189 cfm','400':'190–400 cfm',above400:'More than 400 cfm',unknown:'Sizing review needed'};
const PRESSURE_LABELS={'100':'Up to 100 psi','150':'Up to 150 psi',above150:'Above 150 psi',unknown:'Pressure review needed'};

export function prospectProfile(value={}){
 const answers=value?.answers&&typeof value.answers==='object'?value.answers:value;
 const clean=(key,fallback)=>typeof answers?.[key]==='string'&&answers[key].trim()?answers[key].trim().slice(0,80):fallback;
 const model=MODEL_NAMES[answers?.model]?answers.model:FALLBACK.model;
 const flow=clean('flow',model==='110'?'110':model==='400'?'400':'189'),pressure=clean('pressure',model==='400'?'150':'100');
 return {first:clean('first',FALLBACK.first),company:clean('company',FALLBACK.company),application:clean('application',FALLBACK.application),site:clean('site',FALLBACK.site),model,modelName:MODEL_NAMES[model],flow:FLOW_LABELS[flow]||flow,pressure:PRESSURE_LABELS[pressure]||pressure};
}

export function prospectTabStep(index,key,count=4){
 if(key==='Home')return 0;
 if(key==='End')return count-1;
 const move=key==='ArrowRight'?1:key==='ArrowLeft'?-1:0;
 return move?(index+move+count)%count:index;
}

export function mountProspectConversion({toast=()=>{}}={}){
 const root=document.querySelector('[data-prospect-conversion]');
 if(!root)return;
 const tabs=[...root.querySelectorAll('[role="tab"]')],panels=[...root.querySelectorAll('[role="tabpanel"]')];panels.forEach(panel=>panel.tabIndex=0);
 function select(id,{focus=false}={}){
  tabs.forEach(tab=>{const active=tab.dataset.prospectTab===id;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;if(active&&focus)tab.focus()});
  panels.forEach(panel=>panel.hidden=panel.id!=='prospect-'+id);
 }
 tabs.forEach((tab,index)=>{
  tab.addEventListener('click',()=>select(tab.dataset.prospectTab));
  tab.addEventListener('keydown',event=>{const next=prospectTabStep(index,event.key,tabs.length);if(next===index&&!['Home','End'].includes(event.key))return;event.preventDefault();select(tabs[next].dataset.prospectTab,{focus:true})});
 });
 root.addEventListener('click',event=>{
  const view=event.target.closest('[data-view-prospect]');if(view){select(view.dataset.viewProspect);const panel=root.querySelector('#prospect-'+view.dataset.viewProspect);panel?.focus({preventScroll:true});panel?.scrollIntoView({behavior:document.body.classList.contains('motion-paused')?'auto':'smooth',block:'nearest'});return;}
  const action=event.target.closest('[data-prospect-action]');if(!action)return;
  const messages={walkthrough:'A real version would open the prospect’s preferred walkthrough times.',pricing:'A real version would create a pricing request for the assigned sales professional.',share:'A real version would create a shareable buying-team view.'};
  toast(messages[action.dataset.prospectAction]||'Demonstration only, nothing was sent.');
 });
 const play=root.querySelector('[data-prospect-video]');if(play)play.addEventListener('click',()=>{const screen=play.closest('.prospect-video-screen'),playing=screen.classList.toggle('is-playing');play.setAttribute('aria-pressed',String(playing));play.setAttribute('aria-label',playing?'Pause illustrative YouTube retargeting concept':'Play illustrative YouTube retargeting concept');play.textContent=playing?'Ⅱ':'▶';});
 function renderProfile(){
  const profile=prospectProfile({});
  root.querySelectorAll('[data-prospect-name]').forEach(el=>el.textContent=profile.first);
  root.querySelectorAll('[data-prospect-company]').forEach(el=>el.textContent=profile.company);
  root.querySelectorAll('[data-prospect-application]').forEach(el=>el.textContent=profile.application);
  root.querySelectorAll('[data-prospect-site]').forEach(el=>el.textContent=profile.site);
  root.querySelectorAll('[data-prospect-model]').forEach(el=>el.textContent=profile.modelName);
  root.querySelectorAll('[data-prospect-flow]').forEach(el=>el.textContent=profile.flow);
  root.querySelectorAll('[data-prospect-pressure]').forEach(el=>el.textContent=profile.pressure);
  root.querySelectorAll('[data-prospect-machine]').forEach(el=>{el.src=MODEL_ASSETS[profile.model];el.alt=profile.modelName+' mobile air compressor';});
 }
 renderProfile();select('page');
}
