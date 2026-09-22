import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
export const mobileCameraDistance=(expansion,aspect=1)=>T.MathUtils.lerp(8.4,15.2,clamp((1.1-aspect)/.36))+.4*clamp(expansion);
export function fitToEnvelope(object,min,max){
 const bounds=new T.Box3().setFromObject(object),size=bounds.getSize(new T.Vector3()),room=new T.Vector3().subVectors(max,min);
 const scale=Math.min(1,room.x/size.x,room.y/size.y,room.z/size.z);object.scale.multiplyScalar(scale);
 bounds.setFromObject(object);const shift=new T.Vector3();
 for(const axis of ['x','y','z'])shift[axis]=bounds.min[axis]<min[axis]?min[axis]-bounds.min[axis]:bounds.max[axis]>max[axis]?max[axis]-bounds.max[axis]:0;
 object.children.forEach(child=>child.position.add(shift.clone().divide(object.scale)));object.updateMatrixWorld(true);
 return new T.Box3().setFromObject(object);
}
export function mountMachine(paused){
 const canvas=document.querySelector('#machine-canvas'),host=canvas.parentElement,section=document.querySelector('[data-experience=machine]'),main=document.querySelector('#zw-main');
 let renderer;
 try {renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});}catch{document.querySelector('#machine-fallback').hidden=false;canvas.hidden=true;return}
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.04;
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(33,1,.1,80);
 const pmrem=new T.PMREMGenerator(renderer),room=new RoomEnvironment();
 scene.environment=pmrem.fromScene(room,.03).texture;room.dispose();pmrem.dispose();
 const group=new T.Group();scene.add(group);
 scene.add(new T.HemisphereLight(0xe9f1f3,0x202a2d,1.7));
 const key=new T.DirectionalLight(0xfff3dd,3.4);key.position.set(3,8,4);scene.add(key);
 const rim=new T.DirectionalLight(0x9cc7db,2.4);rim.position.set(-5,3,-4);scene.add(rim);
 const mat=(color,metalness=.2,roughness=.35)=>new T.MeshStandardMaterial({color,metalness,roughness});
 const yellow=mat(0xeab32d,.24,.44),dark=mat(0x162323,.4,.34),black=mat(0x151a1a,.05,.78),steel=mat(0x97a4a0,.88,.24),silver=mat(0xcbd2c9,.7,.3),green=mat(0x526c72,.62,.36),orange=mat(0xec942a,.5,.3);
 function mesh(g,m,p,parent=group){const o=new T.Mesh(g,m);o.position.set(...p);parent.add(o);return o}
 const box=(w,h,d,m,p,parent=group,r=.05)=>mesh(new RoundedBoxGeometry(w,h,d,2,r),m,p,parent);
 function cyl(rad,len,m,p,parent=group,axis='y',r2=rad){const o=mesh(new T.CylinderGeometry(rad,r2,len,32),m,p,parent);if(axis==='x')o.rotation.z=Math.PI/2;if(axis==='z')o.rotation.x=Math.PI/2;return o}
 function tube(points,r,m,parent=group){const c=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));return mesh(new T.TubeGeometry(c,32,r,8,false),m,[0,0,0],parent)}
 const parts=[];
 function part(name,delta){const g=new T.Group();g.name=name;group.add(g);parts.push({name,g,delta:new T.Vector3(...delta)});return g}
 const frame=part('Frame',[0,-.3,0]);
 box(4.35,.2,1.88,dark,[0,.66,0],frame,.028);
 box(4.1,.045,1.72,steel,[0,.785,0],frame,.012);
 for(const z of [-.76,.76])box(4.25,.15,.13,steel,[0,.51,z],frame);
 box(1.65,.15,.17,steel,[-2.9,.59,0],frame);
 cyl(.12,.3,steel,[-3.7,.55,0],frame,'z');
 tube([[-2,.6,-.75],[-2.7,.6,-.4],[-3.4,.6,0]],.065,steel,frame);
 tube([[-2,.6,.75],[-2.7,.6,.4],[-3.4,.6,0]],.065,steel,frame);
 box(.17,.63,.15,steel,[-2.65,.35,0],frame);box(.4,.08,.35,dark,[-2.65,.06,0],frame);
 for(const z of [-1.08,1.08]){
  const tire=cyl(.6,.31,black,[.8,.59,z],frame,'z');
  for(let i=0;i<36;i++){const a=i*Math.PI/18,tread=box(.068,.052,.33,dark,[.8+Math.sin(a)*.597,.59+Math.cos(a)*.597,z],frame,.008);tread.rotation.z=-a;}
  mesh(new T.TorusGeometry(.42,.04,8,40),black,[.8,.59,z+Math.sign(z)*.17],frame);
  cyl(.32,.045,steel,[.8,.59,z+Math.sign(z)*.17],frame,'z');
  cyl(.12,.055,dark,[.8,.59,z+Math.sign(z)*.2],frame,'z');
  for(let i=0;i<8;i++){const a=i*Math.PI/4;cyl(.037,.2,dark,[.8+Math.cos(a)*.225,.59+Math.sin(a)*.225,z+Math.sign(z)*.215],frame,'z')}
  const guard=mesh(new T.TorusGeometry(.69,.065,4,40,Math.PI),dark,[.8,.59,z],frame);
  box(1.25,.065,.46,dark,[.8,1.19,z],frame,.025);
  for(const x of [.16,1.44])box(.055,.27,.44,dark,[x,1.05,z],frame,.016);
 }
 const engine=part('Engine',[-.7,.68,-.4]);
 box(1.35,.65,1.15,steel,[-.8,1.2,0],engine);
 box(1.5,.2,1.02,dark,[-.8,1.56,0],engine);
 for(let i=0;i<4;i++){
  box(.24,.17,.95,silver,[-1.3+i*.33,1.74,0],engine,.025);
  cyl(.028,.7,steel,[-1.35+i*.35,1.21,.59],engine);
 }
 cyl(.32,.8,dark,[-1.17,1.9,-.34],engine,'x');
 tube([[-1.5,1.95,-.4],[-1.65,2.12,-.4],[-.4,2.12,-.4],[-.26,1.42,-.45]],.055,steel,engine);
 tube([[-1.2,1.1,.6],[-.9,1.8,.67],[-.1,1.9,.65],[.1,1.32,.5]],.065,black,engine);
 for(let i=0;i<5;i++)box(.045,.48,.025,dark,[-1.26+i*.2,1.18,.59],engine,.005);
 const air=part('Air end',[.75,.75,.58]);
 cyl(.34,.85,green,[.2,1.17,.34],air,'x');
 for(let i=0;i<10;i++)cyl(.37,.02,steel,[-.18+i*.08,1.17,.34],air,'x');
 cyl(.15,.22,silver,[-.35,1.17,.34],air,'x');
 cyl(.15,.25,steel,[.38,1.46,.32],air);
 tube([[.38,1.6,.32],[.7,1.75,.32],[1,1.6,.3]],.07,black,air);
 const receiver=part('Separation',[1.05,.1,-.66]);
 cyl(.28,.9,silver,[.85,1.15,-.42],receiver);
 cyl(.32,.1,dark,[.85,1.64,-.42],receiver);
 cyl(.04,.2,orange,[.85,1.78,-.42],receiver);
 tube([[.6,1.52,-.42],[.1,1.72,-.5],[-.05,1.42,-.5]],.055,black,receiver);
 const cool=part('Cooling',[1.45,.75,-.2]);
 box(.16,1.05,1.45,dark,[1.6,1.3,0],cool);
 for(let i=0;i<20;i++)box(.18,.018,1.34,steel,[1.6,.82+i*.05,0],cool,.005);
 const fan=new T.Group();cool.add(fan);fan.position.set(1.76,1.34,0);
 cyl(.14,.18,dark,[0,0,0],fan,'x');
 for(let i=0;i<8;i++){const blade=box(.04,.53,.16,black,[0,0,0],fan,.025);blade.rotation.x=i*Math.PI/4;blade.position.y=Math.cos(i*Math.PI/4)*.26;blade.position.z=Math.sin(i*Math.PI/4)*.26;}
 // Panel geometry is illustrative, with no suggestion that it is factory CAD.
 const hood=part('Canopy',[0,2.35,0]);
 box(4.17,.15,1.9,yellow,[0,2.035,0],hood,.065);
 box(3.93,.035,1.77,black,[0,1.94,0],hood,.018);
 for(const x of [-1.3,1.3]){box(.21,.035,.18,dark,[x,2.117,0],hood,.01);box(.11,.06,.035,steel,[x,2.16,0],hood,.008);}
 box(.12,1.08,1.85,yellow,[2.04,1.43,0],hood,.025);
 for(let i=0;i<16;i++)box(.025,.035,1.45,dark,[2.109,1.03+i*.05,0],hood,.004);
 const panels=[];
 for(const z of [-.88,.88]){
  const side=part('Side panel '+z,[0,1.12,z>0?1.37:-1.37]);panels.push(side);
  box(3.98,1.06,.09,yellow,[0,1.405,z],side,.025);
  box(.015,.88,.015,dark,[.45,1.4,z*1.062],side,.004);
  for(const x of [-1.65,.54]){box(.095,.19,.055,dark,[x,1.39,z*1.072],side,.014);box(.045,.09,.068,steel,[x,1.4,z*1.105],side,.008);}
  box(3.89,.055,.028,dark,[0,.907,z*1.055],side,.009);
  for(let i=0;i<14;i++)box(.045,.45,.017,dark,[.93+i*.055,1.52,z*1.063],side,.01);
  box(.37,.12,.04,dark,[-.98,1.7,z*1.075],side);
  for(const x of [-1.75,1.77])for(const y of [1.12,1.82])cyl(.028,.035,steel,[x,y,z*1.085],side,'z');
  const cv=document.createElement('canvas');cv.width=1024;cv.height=256;const ctx=cv.getContext('2d');ctx.fillStyle='#26383a';ctx.fillRect(0,0,1024,256);ctx.fillStyle='#f1f3de';ctx.font='bold 90px Arial';ctx.fillText('POWER TECHNIQUE',45,110);ctx.fillStyle='#eabb3e';ctx.font='38px Arial';ctx.fillText('PORTABLE COMPRESSOR',48,185);
  const tx=new T.CanvasTexture(cv);tx.colorSpace=T.SRGBColorSpace;
  const plate=mesh(new T.PlaneGeometry(1.4,.35),new T.MeshStandardMaterial({map:tx,roughness:.5}),[-.65,1.3,z*1.065],side);if(z<0)plate.rotation.y=Math.PI;
 }
 const face=part('Controls',[-1.5,.35,.8]);
 box(.11,1.12,1.82,dark,[-2.025,1.4,0],face,.03);
 for(let i=0;i<10;i++)box(.025,.045,.47,black,[-2.089,1.1+i*.06,-.45],face,.005);
 box(.05,.3,.4,silver,[-2.06,1.55,.3],face);
 const screen=mat(0x77ffd1,.05,.3);screen.emissive=new T.Color(0x32d5a3);screen.emissiveIntensity=.45;
 box(.055,.18,.29,screen,[-2.1,1.59,.3],face);
 for(const z of [-.45,-.15]){cyl(.075,.16,steel,[-2.14,1.09,z],face,'x');cyl(.05,.18,orange,[-2.24,1.09,z],face,'x')}
 const internal=[engine,air,receiver,cool],insideMin=new T.Vector3(-1.8,.81,-.73),insideMax=new T.Vector3(1.86,1.875,.73);
 const fittedBounds=internal.map(g=>{const b=fitToEnvelope(g,insideMin,insideMax);return {name:g.name,min:b.min.toArray(),max:b.max.toArray()};});canvas.dataset.enclosure=JSON.stringify(fittedBounds);
 // Grounding shadow and a quiet engineering registration ring.
 const shadowCanvas=document.createElement('canvas');shadowCanvas.width=256;shadowCanvas.height=256;
 const cx=shadowCanvas.getContext('2d'),grad=cx.createRadialGradient(128,128,4,128,128,128);grad.addColorStop(0,'rgba(0,0,0,.58)');grad.addColorStop(.5,'rgba(0,0,0,.3)');grad.addColorStop(1,'rgba(0,0,0,0)');cx.fillStyle=grad;cx.fillRect(0,0,256,256);
 const shadow=mesh(new T.PlaneGeometry(10,6),new T.MeshBasicMaterial({map:new T.CanvasTexture(shadowCanvas),transparent:true,depthWrite:false}),[0,-.22,0],group);shadow.rotation.x=-Math.PI/2;
 const ring=mesh(new T.TorusGeometry(3.45,.012,5,100),new T.MeshBasicMaterial({color:0xa5b1b0,transparent:true,opacity:.19}),[0,-.15,0],group);ring.rotation.x=-Math.PI/2;
 for(let i=0;i<48;i++){const a=i*Math.PI/24;const m=box(.012,.012,i%4===0?.19:.07,green,[Math.cos(a)*3.6,-.14,Math.sin(a)*3.6]);m.rotation.y=-a+Math.PI/2;}
 group.rotation.y=-.34;group.position.y=-1.3;
 let target=0,current=0,manual=false,visible=true,last=0,dirty=true,yaw=0,desiredYaw=0,drag=null,hovered=false,raf=0,contextLost=false;
 const AUTO_YAW_SPEED=Math.PI*2/24000,FAN_SPEED=.0045;
 const range=document.querySelector('#assembly-scrub'),readout=document.querySelector('#assembly-readout');
 document.querySelectorAll('[data-component]').forEach(l=>l.remove());
 const explorer=document.createElement('aside');explorer.className='machine-explorer';explorer.setAttribute('aria-label','Explore machine components');
 const details=[['Canopy','A protective enclosure with service access. A clear experience helps people understand a complex system.'],['Engine','Power for the compressor. Match the power source to the site, access and working conditions.'],['Air end','The compression stage. Required airflow and working pressure guide the equipment conversation.'],['Cooling','Heat management supports sustained operation. Application and environment belong in the needs assessment.']];
 explorer.innerHTML='<div class="machine-part-tabs">'+details.map((d,i)=>'<button type="button" data-machine-part="'+i+'" aria-expanded="false" aria-controls="machine-part-detail"><span>0'+(i+1)+'</span> '+d[0]+' <b>+</b></button>').join('')+'</div><div id="machine-part-detail" class="machine-part-detail"><p id="machine-part-copy">Explore a component to see its role.</p><button type="button" id="machine-part-close" aria-label="Close component details" hidden>×</button></div>';
 host.parentElement.append(explorer);
 const partCopy=explorer.querySelector('#machine-part-copy'),partClose=explorer.querySelector('#machine-part-close'),partButtons=[...explorer.querySelectorAll('[data-machine-part]')];
 let activePart=-1,pinnedPart=false,peekUntil=0,seenPart=-1;
 function showPart(index,pinned=false){activePart=index;pinnedPart=pinned;peekUntil=performance.now()+2600;partCopy.textContent=index<0?'Explore a component to see its role.':details[index][1];partClose.hidden=index<0;explorer.classList.toggle('has-detail',index>=0);partButtons.forEach((b,i)=>{b.setAttribute('aria-expanded',String(i===index));b.querySelector('b').textContent=i===index?'−':'+';});}
 partButtons.forEach((b,i)=>b.addEventListener('click',()=>showPart(activePart===i?-1:i,true)));partClose.addEventListener('click',()=>showPart(-1));
 const rotation=document.createElement('div');rotation.className='machine-rotation';rotation.innerHTML='<span>Auto-rotates · drag to inspect</span><div><button type="button" data-rotate="-1" aria-label="Rotate machine left">↶</button><button type="button" data-rotate="0">Reset view</button><button type="button" data-rotate="1" aria-label="Rotate machine right">↷</button></div>';
 host.append(rotation);rotation.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{desiredYaw=+b.dataset.rotate===0?0:desiredYaw+(+b.dataset.rotate)*Math.PI/4;dirty=true;schedule();}));
 canvas.setAttribute('aria-label','Illustrative portable compressor, not factory CAD. Drag horizontally to rotate. Scroll or use the expansion slider to inspect the components.');canvas.setAttribute('tabindex','0');
 canvas.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();e.stopPropagation();desiredYaw+=(e.key==='ArrowLeft'?-1:1)*Math.PI/12;dirty=true;schedule();}if(e.key==='Home'){e.preventDefault();desiredYaw=0;dirty=true;schedule();}});
 canvas.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'){hovered=true;desiredYaw=yaw;canvas.dataset.autoPaused='hover';}});
 canvas.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse'){hovered=false;canvas.dataset.autoPaused='false';last=0;schedule();}});
 canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;drag={id:e.pointerId,type:e.pointerType,x:e.clientX,y:e.clientY,last:e.clientX,locked:false};canvas.dataset.autoPaused='drag';schedule();});
 canvas.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(!drag.locked){if(Math.abs(dy)>10&&Math.abs(dy)>Math.abs(dx)){drag=null;canvas.dataset.autoPaused=hovered?'hover':'false';return;}if(Math.abs(dx)<8)return;drag.locked=true;canvas.setPointerCapture(e.pointerId);canvas.classList.add('is-dragging');}desiredYaw+=(e.clientX-drag.last)*.009;drag.last=e.clientX;dirty=true;schedule();});
 const stopDrag=()=>{drag=null;canvas.classList.remove('is-dragging');canvas.dataset.autoPaused=hovered?'hover':'false';last=0;schedule();};canvas.addEventListener('pointerup',stopDrag);canvas.addEventListener('pointercancel',stopDrag);canvas.addEventListener('lostpointercapture',stopDrag);
 function update(){if(manual)return;const r=section.getBoundingClientRect(),h=main.clientHeight,p=clamp(-r.top/(section.clientHeight-h));target=clamp((p-.04)/.82);manual=false;dirty=true;schedule()}
 main.addEventListener('scroll',update,{passive:true});
 main.addEventListener('wheel',()=>{manual=false;},{passive:true});main.addEventListener('touchmove',()=>{manual=false;},{passive:true});main.addEventListener('pointerdown',e=>{if(e.target===main)manual=false;},{passive:true});main.addEventListener('keydown',e=>{if(['PageDown','PageUp','ArrowDown','ArrowUp','End'].includes(e.key)&&!e.target.closest('input,button,textarea,select'))manual=false;});
 range.addEventListener('input',()=>{target=Number(range.value)/100;manual=true;dirty=true;schedule()});
 document.querySelectorAll('[data-assembly]').forEach(b=>b.addEventListener('click',()=>{target=Number(b.dataset.assembly);range.value=target*100;manual=true;dirty=true;schedule()}));
 const resize=()=>{const w=canvas.clientWidth,h=canvas.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();dirty=true;schedule()};new ResizeObserver(resize).observe(host);
 new IntersectionObserver(es=>{visible=es[0].isIntersecting;dirty=true;if(visible)schedule();else stop()},{root:main}).observe(host);
 function tick(time){
 raf=0;if(!visible||document.hidden||contextLost){last=0;return;}const dt=last?Math.min(64,time-last):16.7;last=time;const motionPaused=paused();
 if(!motionPaused&&!drag&&!hovered)desiredYaw+=AUTO_YAW_SPEED*dt;
 const diff=target-current;current=motionPaused?target:current+diff*(1-Math.exp(-dt/145));
 const turnDiff=desiredYaw-yaw;yaw=motionPaused?desiredYaw:yaw+turnDiff*(1-Math.exp(-dt/90));
 if(activePart>=0&&!pinnedPart&&time>peekUntil)showPart(-1);
 if(!motionPaused)fan.rotation.x=(fan.rotation.x+FAN_SPEED*dt)%(Math.PI*2);
 dirty=false;const p=current,e=p*p*(3-2*p),mobile=host.clientWidth<700,mobileSpread=mobile?.82:1;
 parts.forEach(({g,delta},i)=>{const k=clamp(e*(1.16)-(i%3)*.045);g.position.copy(delta).multiplyScalar(k*mobileSpread)});
 hood.rotation.z=e*-.035;panels[0].rotation.x=-e*.1;panels[1].rotation.x=e*.1;
 group.rotation.y=-.34+e*.24+yaw;canvas.dataset.rotation=String(Math.round(yaw*180/Math.PI));internal.forEach(g=>g.visible=e>.015);
 camera.position.set(-8.4-e*.6,5.5+e*1.5,9.4+e*1.9);
 const focus=new T.Vector3(-.45,.35+e*.85,0);if(mobile){const cameraOffset=camera.position.clone().sub(focus).setLength(mobileCameraDistance(e,camera.aspect));camera.position.copy(focus).add(cameraOffset)}camera.lookAt(focus);camera.fov=mobile?40:33;camera.updateProjectionMatrix();
 canvas.dataset.fanAngle=fan.rotation.x.toFixed(3);canvas.dataset.autoRotation=motionPaused?'paused':hovered?'hover-paused':drag?'dragging':'running';
 renderer.render(scene,camera);
 const pct=Math.round(e*100);readout.textContent=pct+'% expanded';canvas.dataset.expanded=String(pct);
 if(!manual)range.value=Math.round(current*100);
 const phase=current<.16?0:current<.62?1:2;
 if(host.dataset.phase!==String(phase)){
 host.dataset.phase=String(phase);
 host.closest('.machine-sticky').dataset.phase=String(phase);
 }
 const reveal=current<.2?-1:Math.min(3,Math.floor((current-.2)/.2));
 if(current<.12){seenPart=-1;if(!pinnedPart&&activePart>=0)showPart(-1);}
 if(reveal>seenPart){seenPart=reveal;if(!pinnedPart)showPart(reveal);}
 if(!motionPaused||dirty||(activePart>=0&&!pinnedPart))schedule();
 }
 function schedule(){if(!raf&&visible&&!document.hidden&&!contextLost)raf=requestAnimationFrame(tick)}
 function stop(){if(raf)cancelAnimationFrame(raf);raf=0;last=0}
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else schedule()});
 update();resize();schedule();canvas.dataset.renderer='three';canvas.dataset.autoPaused='false';
 const fallback=document.querySelector('#machine-fallback');
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();contextLost=true;stop();fallback.hidden=false;canvas.hidden=true});
 canvas.addEventListener('webglcontextrestored',()=>{contextLost=false;canvas.hidden=false;fallback.hidden=true;resize();schedule()});
 return {setPaused(){last=0;dirty=true;schedule()}};
}
