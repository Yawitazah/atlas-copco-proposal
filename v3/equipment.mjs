import {MODELS,esc,fit} from './mission.mjs?v=conversion-27';

const POWER_SEGMENTS=10;
const MAX_COMPARISON_FLOW=Math.max(...MODELS.map(model=>model.flow));
const footprintVolume=model=>model.dimensions.split('×').map(value=>Number.parseFloat(value)).reduce((total,value)=>total*value,1);
const FOOTPRINT_VOLUMES=MODELS.map(footprintVolume);
const MIN_WEIGHT=Math.min(...MODELS.map(model=>model.weight)),MAX_WEIGHT=Math.max(...MODELS.map(model=>model.weight));
const MIN_VOLUME=Math.min(...FOOTPRINT_VOLUMES),MAX_VOLUME=Math.max(...FOOTPRINT_VOLUMES);

export function equipmentPower(model){
 const level=Math.max(1,Math.min(POWER_SEGMENTS,Math.round(model.flow/MAX_COMPARISON_FLOW*POWER_SEGMENTS)));
 const descriptor=level<=3?'Compact output':level<=6?'Stronger output':'Highest output here';
 return {level,descriptor,max:POWER_SEGMENTS};
}

export function transportFootprintScore(model){
 const weightCompactness=(MAX_WEIGHT-model.weight)/(MAX_WEIGHT-MIN_WEIGHT);
 const volumeCompactness=(MAX_VOLUME-footprintVolume(model))/(MAX_VOLUME-MIN_VOLUME);
 return Math.max(4,Math.min(10,4+Math.floor(((weightCompactness+volumeCompactness)/2)*6)));
}

export function equipmentCapabilities(model){
 const delivery=equipmentPower(model).level;
 const metrics=[
  {key:'delivery',label:'Air delivery',icon:'≈',value:delivery,detail:model.flow+' cfm at 100 psi'},
  {key:'pressure',label:'Pressure flexibility',icon:'↕',value:model.pressureLevel,detail:model.pressure+' psi working range'},
  {key:'footprint',label:'Transport footprint*',icon:'↔',value:transportFootprintScore(model),detail:model.weight.toLocaleString()+' lb · '+model.dimensions},
  {key:'range',label:'Application range',icon:'◇',value:model.rangeLevel,detail:model.signature}
 ];
 const overall=Math.round(metrics.reduce((sum,item)=>sum+item.value,0)/metrics.length);
 return {metrics,overall,signature:model.signature};
}

function capabilitySegments(value){
 return Array.from({length:10},(_,index)=>'<i class="capability-segment'+(index<value?' is-active':'')+'" aria-hidden="true"></i>').join('');
}

function capabilityPanel(model,variant='compact'){
 const profile=equipmentCapabilities(model);
 return '<section class="capability-profile capability-profile--'+variant+'" aria-label="'+model.name+' capability profile"><header><span>Comparative capability</span><strong>'+String(profile.overall).padStart(2,'0')+' <small>/ 10</small></strong><b>'+profile.signature+'</b></header><div class="capability-list">'+profile.metrics.map(metric=>'<div class="capability-row"><span class="capability-label"><i aria-hidden="true">'+metric.icon+'</i><b>'+metric.label+'</b><small>'+metric.detail+'</small></span><span class="capability-score" aria-label="'+metric.label.replace('*','')+' '+metric.value+' out of 10"><em>'+metric.value+'</em><span>'+capabilitySegments(metric.value)+'</span></span></div>').join('')+'</div><p class="capability-note">* Illustrative compactness score from relative wet weight and dimensions across these three examples. Higher means smaller and lighter. Not an Atlas Copco rating.</p></section>';
}

function powerMeter(model,power){
 const segments=Array.from({length:power.max},(_,index)=>'<i class="power-segment'+(index<power.level?' is-active':'')+'" style="--segment-height:'+(47+index*5)+'%;--power-delay:-'+((index+1)*.07).toFixed(2)+'s" aria-hidden="true"></i>').join('');
 const label='Power level '+power.level+' out of '+power.max+'. '+power.descriptor+', based on '+model.flow+' cfm at 100 psi.';
 return '<div class="equipment-power-meter" role="meter" aria-label="'+label+'" aria-valuemin="0" aria-valuemax="'+power.max+'" aria-valuenow="'+power.level+'" aria-valuetext="'+label+'"><div class="power-meter-heading"><span><b class="power-icon" aria-hidden="true">↯</b> Power level</span><strong>'+String(power.level).padStart(2,'0')+' <small>/ '+power.max+'</small></strong></div><div class="capacity-track segmented-power" aria-hidden="true">'+segments+'</div><p><b>'+power.descriptor+'</b><span>Relative airflow across these three machines</span></p></div>';
}

function airflowField(){
 return '<div class="airflow-field" aria-hidden="true">'+Array.from({length:8},(_,index)=>'<i class="airflow-stream" style="--air-top:'+(10+index*10)+'%;--air-delay:-'+(index*.37).toFixed(2)+'s;--air-drift:'+((index%3)-1)*5+'px"></i>').join('')+'</div>';
}

export function showDetails(title,html){
 const dialog=document.querySelector('#detail-dialog');
 document.querySelector('#detail-content').innerHTML='<header class="detail-head"><h2 id="detail-title">'+title+'</h2><button type="button" aria-label="Close details" id="detail-close">×</button></header><div class="detail-body">'+html+'</div>';
 if(!dialog.open)dialog.showModal();
 document.querySelector('#detail-close').onclick=()=>dialog.close();
 return dialog;
}

export function equipmentDetails(model,answers,previous){
 const m=model,old=previous&&previous.id!==m.id?previous:null,power=equipmentPower(m);
 showDetails(m.name,'<div class="equipment-detail-image" data-power-level="'+power.level+'" style="--equipment-accent:'+m.accent+'">'+airflowField()+'<img src="./assets/'+m.image+'" alt="'+m.name+' product cutout"></div><p>'+m.use+'</p>'+capabilityPanel(m,'detail')+'<dl class="detail-specs"><div><dt>Airflow at 100 psi</dt><dd>'+m.flow+' cfm</dd></div><div><dt>Working pressure</dt><dd>'+m.pressure+' psi</dd></div><div><dt>Engine</dt><dd>'+m.engine+'</dd></div><div><dt>Wet weight</dt><dd>'+m.weight.toLocaleString()+' lb</dd></div><div><dt>Dimensions</dt><dd>'+m.dimensions+'</dd></div><div><dt>Sound pressure</dt><dd>'+m.sound+'</dd></div></dl><div class="application-signature"><span>Signature strength</span><b>'+m.signature+'</b><p>'+m.applications+'.</p></div>'+(old?'<div class="compare-change"><b>Compared with '+old.name+'</b><p>'+(m.flow-old.flow>0?'+':'')+(m.flow-old.flow)+' cfm at 100 psi. '+(m.id==='400'?'This option also lists 150 psi operation.':'Compare the operating point with your actual tool demand.')+'</p></div>':'')+'<h3>Your application</h3><p>'+esc(answers.application||'Tell us about your site to make this comparison more useful.')+'</p><p class="fit-note">'+esc(fit(answers,m))+'</p><p>Final selection depends on simultaneous tool demand, duty cycle and site conditions. More capacity is useful when the work requires it.</p><a class="btn dark" href="'+m.url+'" target="_blank" rel="noopener">Manufacturer details ↗</a><p class="form-hint">All capability scores are illustrative comparisons across these three machines; they are not Atlas Copco quality, efficiency or final-sizing ratings. The transport-footprint score is calculated from relative published wet weight and dimensions. Product image may show optional equipment. Published specifications checked September 21, 2026.</p>');
}

export function mountEquipment(host,answers,{paused,onSelect}){
 let index=Math.max(0,MODELS.findIndex(m=>m.id===answers.model)),previous=null,layout='side';
 function draw(animate=false){
  const m=MODELS[index],power=equipmentPower(m),delta=previous?m.flow-previous.flow:0;
  const changeText=delta?(delta>0?'↑ '+Math.abs(delta)+' cfm more than ':'↓ '+Math.abs(delta)+' cfm less than ')+previous.name+'. Power level '+power.level+' of '+power.max+'.':m.note+' Power level '+power.level+' of '+power.max+'.';
  host.innerHTML='<div class="equipment-selector" data-power-level="'+power.level+'" data-layout="'+layout+'" style="--equipment-accent:'+m.accent+'"><div class="equipment-view-toolbar"><span>Capability view</span><div role="group" aria-label="Choose equipment capability layout"><button type="button" data-equipment-view="side" aria-pressed="'+(layout==='side')+'">Side panel</button><button type="button" data-equipment-view="overlay" aria-pressed="'+(layout==='overlay')+'">Scene overlay</button></div></div><div class="equipment-stage"><div class="equipment-top"><span>ATLAS COPCO / MOBILE AIR COMPRESSORS</span><span>'+String(index+1).padStart(2,'0')+' / 03</span></div><div class="machine-platform">'+airflowField()+'<div class="platform-ring"></div><div class="machine-shadow"></div><div class="machine-running"><img class="equipment-cutout" src="./assets/'+m.image+'" alt="'+m.name+' product cutout" draggable="false"></div></div><div class="equipment-title"><p>'+m.tag+'</p><h4>'+m.name+'</h4></div><div class="equipment-switch"><button type="button" id="machine-prev" aria-label="Previous machine" '+(index===0?'disabled':'')+'>←</button><div class="model-positions" role="group" aria-label="Choose equipment">'+MODELS.map((v,i)=>'<button type="button" data-model="'+i+'" aria-pressed="'+(i===index)+'" aria-label="'+v.name+', '+v.flow+' cfm">'+v.flow+'<small>cfm</small></button>').join('')+'</div><button type="button" id="machine-next" aria-label="Next machine" '+(index===MODELS.length-1?'disabled':'')+'>→</button></div></div><div class="equipment-readings"><div class="capacity-change" role="status">'+changeText+'</div><div class="equipment-metrics"><div><span>Airflow at 100 psi</span><strong>'+m.flow+' <small>cfm</small></strong></div><div><span>Working pressure</span><strong>'+m.pressure+' <small>psi</small></strong></div>'+powerMeter(m,power)+'</div>'+capabilityPanel(m)+'<button type="button" class="equipment-detail-button" id="equipment-details">View details &amp; application fit <span>↗</span></button></div></div>';
  answers.model=m.id;
  onSelect(m.id);
  const change=j=>{if(j<0||j>=MODELS.length||j===index)return;previous=m;index=j;draw(true);};
  host.querySelector('#machine-prev').onclick=()=>change(index-1);
  host.querySelector('#machine-next').onclick=()=>change(index+1);
  host.querySelectorAll('[data-model]').forEach(button=>button.onclick=()=>change(Number(button.dataset.model)));
  host.querySelectorAll('[data-equipment-view]').forEach(button=>button.onclick=()=>{
   layout=button.dataset.equipmentView;
   const selector=host.querySelector('.equipment-selector');
   selector.dataset.layout=layout;
   selector.querySelectorAll('[data-equipment-view]').forEach(view=>view.setAttribute('aria-pressed',String(view.dataset.equipmentView===layout)));
  });
  host.querySelector('#equipment-details').onclick=()=>equipmentDetails(m,answers,previous);
  let start;
  const surface=host.querySelector('.machine-platform');
  surface.onpointerdown=event=>{start={x:event.clientX,y:event.clientY};surface.classList.add('is-interacting');};
  surface.onpointerup=event=>{surface.classList.remove('is-interacting');if(!start)return;const dx=event.clientX-start.x,dy=event.clientY-start.y;start=null;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.3)change(index+(dx<0?1:-1));};
  surface.onpointercancel=()=>{start=null;surface.classList.remove('is-interacting');};
  surface.onpointerleave=()=>{start=null;surface.classList.remove('is-interacting');};
  if(animate&&!paused()){
   const animate=(element,frames,options)=>{if(typeof element?.animate==='function')element.animate(frames,options)};
   animate(host.querySelector('.equipment-cutout'),[{transform:'translateY(20px) scale(.9)',opacity:.2},{transform:'translateY(-7px) scale(1.02)',opacity:1},{transform:'translateY(0) scale(1)',opacity:1}],{duration:750,easing:'cubic-bezier(.16,1,.3,1)'});
   animate(host.querySelector('.equipment-power-meter'),[{filter:'brightness(1.8)',transform:'scaleX(.96)'},{filter:'brightness(1)',transform:'scaleX(1)'}],{duration:900,easing:'cubic-bezier(.16,1,.3,1)'});
   animate(host.querySelector('.equipment-stage'),[{boxShadow:'inset 0 0 90px '+m.accent+'99'},{boxShadow:'inset 0 0 0 '+m.accent+'00'}],{duration:1100});
  }
 }
 draw();
}
