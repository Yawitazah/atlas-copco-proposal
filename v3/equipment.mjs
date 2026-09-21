import {MODELS,esc,fit} from './mission.mjs?v=strategy-1';
export function showDetails(title,html){
 const dialog=document.querySelector('#detail-dialog');
 document.querySelector('#detail-content').innerHTML='<header class="detail-head"><h2 id="detail-title">'+title+'</h2><button type="button" aria-label="Close details" id="detail-close">×</button></header><div class="detail-body">'+html+'</div>';
 if(!dialog.open)dialog.showModal();
 document.querySelector('#detail-close').onclick=()=>dialog.close();
 return dialog;
}
export function equipmentDetails(model,answers,previous){
 const m=model,old=previous&&previous.id!==m.id?previous:null;
 showDetails(m.name,'<div class="equipment-detail-image" style="--equipment-accent:'+m.accent+'"><img src="./assets/'+m.image+'" alt="'+m.name+' product cutout"></div><p>'+m.use+'</p><dl class="detail-specs"><div><dt>Airflow at 100 psi</dt><dd>'+m.flow+' cfm</dd></div><div><dt>Working pressure</dt><dd>'+m.pressure+' psi</dd></div><div><dt>Engine</dt><dd>'+m.engine+'</dd></div><div><dt>Power</dt><dd>Diesel</dd></div></dl>'+(old?'<div class="compare-change"><b>Compared with '+old.name+'</b><p>'+(m.flow-old.flow>0?'+':'')+(m.flow-old.flow)+' cfm at 100 psi. '+(m.id==='400'?'This option also lists 150 psi operation.':'Compare the operating point with your actual tool demand.')+'</p></div>':'')+'<h3>Your application</h3><p>'+esc(answers.application||'Tell us about your site to make this comparison more useful.')+'</p><p class="fit-note">'+esc(fit(answers,m))+'</p><p>Final selection depends on simultaneous tool demand, duty cycle and site conditions. More capacity is useful when the work requires it.</p><a class="btn dark" href="'+m.url+'" target="_blank" rel="noopener">Manufacturer details ↗</a><p class="form-hint">Product image may show optional equipment. Published specifications checked September 20, 2026.</p>');
}
export function mountEquipment(host,answers,{paused,onSelect}){
 let index=Math.max(0,MODELS.findIndex(m=>m.id===answers.model)),previous=null;
 function draw(animate=false){
  const m=MODELS[index],delta=previous?m.flow-previous.flow:0;
  host.innerHTML='<div class="equipment-selector" style="--equipment-accent:'+m.accent+'"><div class="equipment-stage"><div class="equipment-top"><span>ATLAS COPCO / PORTABLE AIR</span><span>'+String(index+1).padStart(2,'0')+' / 03</span></div><div class="machine-platform"><div class="platform-ring"></div><div class="machine-shadow"></div><img class="equipment-cutout" src="./assets/'+m.image+'" alt="'+m.name+'" draggable="false"></div><div class="equipment-title"><p>'+m.tag+'</p><h4>'+m.name+'</h4></div><div class="equipment-switch"><button type="button" id="machine-prev" aria-label="Previous machine" '+(index===0?'disabled':'')+'>←</button><div class="model-positions" role="group" aria-label="Choose equipment">'+MODELS.map((v,i)=>'<button type="button" data-model="'+i+'" aria-pressed="'+(i===index)+'" aria-label="'+v.name+'">'+v.flow+'<small>cfm</small></button>').join('')+'</div><button type="button" id="machine-next" aria-label="Next machine" '+(index===2?'disabled':'')+'>→</button></div></div><div class="equipment-readings"><div class="capacity-change" role="status">'+(delta?(delta>0?'↑ +':'↓ ')+delta+' cfm compared with '+previous.name:m.note)+'</div><div class="equipment-metrics"><div><span>Airflow at 100 psi</span><strong>'+m.flow+' <small>cfm</small></strong><div class="capacity-track"><i style="width:'+m.flow/4+'%"></i></div></div><div><span>Working pressure</span><strong>'+m.pressure+' <small>psi</small></strong></div></div><button type="button" class="equipment-detail-button" id="equipment-details">View details & application fit <span>↗</span></button></div></div>';
  answers.model=m.id;onSelect(m.id);
  const change=j=>{if(j<0||j>=MODELS.length||j===index)return;previous=m;index=j;draw(true);};
  host.querySelector('#machine-prev').onclick=()=>change(index-1);host.querySelector('#machine-next').onclick=()=>change(index+1);
  host.querySelectorAll('[data-model]').forEach(b=>b.onclick=()=>change(Number(b.dataset.model)));
  host.querySelector('#equipment-details').onclick=()=>equipmentDetails(m,answers,previous);
  let start;const surface=host.querySelector('.machine-platform');surface.onpointerdown=e=>{start={x:e.clientX,y:e.clientY};};surface.onpointerup=e=>{if(!start)return;const dx=e.clientX-start.x,dy=e.clientY-start.y;start=null;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.3)change(index+(dx<0?1:-1));};surface.onpointercancel=()=>start=null;
  if(animate&&!paused()){
   host.querySelector('.equipment-cutout').animate([{transform:'translateY(20px) scale(.9)',opacity:.2},{transform:'translateY(-7px) scale(1.02)',opacity:1},{transform:'translateY(0) scale(1)',opacity:1}],{duration:750,easing:'cubic-bezier(.16,1,.3,1)'});
   host.querySelector('.capacity-track i').animate([{filter:'brightness(2.5)',transform:'scaleX(.3)'},{filter:'brightness(1)',transform:'scaleX(1)'}],{duration:900,easing:'cubic-bezier(.16,1,.3,1)'});
   host.querySelector('.equipment-stage').animate([{boxShadow:'inset 0 0 80px '+m.accent+'88'},{boxShadow:'inset 0 0 0 '+m.accent+'00'}],{duration:1100});
  }
 }
 draw();
}