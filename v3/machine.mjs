import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
export function mountMachine(paused){
 const canvas=document.querySelector('#machine-canvas'),host=canvas.parentElement,section=document.querySelector('[data-experience=machine]'),main=document.querySelector('#zw-main');
 let renderer;
 try {renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});}catch{document.querySelector('#machine-fallback').hidden=false;canvas.hidden=true;return}
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.3;
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(33,1,.1,80);
 const pmrem=new T.PMREMGenerator(renderer),room=new RoomEnvironment();
 scene.environment=pmrem.fromScene(room,.03).texture;room.dispose();pmrem.dispose();
 const group=new T.Group();scene.add(group);
 scene.add(new T.HemisphereLight(0xe1fff1,0x243c28,2));
 const key=new T.DirectionalLight(0xfff0d1,4.5);key.position.set(3,8,4);scene.add(key);
 const rim=new T.DirectionalLight(0x75ffd4,4);rim.position.set(-5,3,-4);scene.add(rim);
 const mat=(color,metalness=.2,roughness=.35)=>new T.MeshStandardMaterial({color,metalness,roughness});
 const yellow=mat(0xf7bc35,.48,.24),dark=mat(0x162323,.4,.34),black=mat(0x151a1a,.05,.78),steel=mat(0x97a4a0,.88,.24),silver=mat(0xcbd2c9,.7,.3),green=mat(0x278b70,.5,.25),orange=mat(0xec942a,.5,.3);
 function mesh(g,m,p,parent=group){const o=new T.Mesh(g,m);o.position.set(...p);parent.add(o);return o}
 const box=(w,h,d,m,p,parent=group,r=.05)=>mesh(new RoundedBoxGeometry(w,h,d,2,r),m,p,parent);
 function cyl(rad,len,m,p,parent=group,axis='y',r2=rad){const o=mesh(new T.CylinderGeometry(rad,r2,len,32),m,p,parent);if(axis==='x')o.rotation.z=Math.PI/2;if(axis==='z')o.rotation.x=Math.PI/2;return o}
 function tube(points,r,m,parent=group){const c=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));return mesh(new T.TubeGeometry(c,32,r,8,false),m,[0,0,0],parent)}
 const parts=[];
 function part(name,delta){const g=new T.Group();group.add(g);parts.push({name,g,delta:new T.Vector3(...delta)});return g}
 const frame=part('Frame',[0,-.3,0]);
 box(4.4,.24,1.9,dark,[0,.65,0],frame);
 for(const z of [-.76,.76])box(4.25,.15,.13,steel,[0,.51,z],frame);
 box(1.65,.15,.17,steel,[-2.9,.59,0],frame);
 cyl(.12,.3,steel,[-3.7,.55,0],frame,'z');
 tube([[-2,.6,-.75],[-2.7,.6,-.4],[-3.4,.6,0]],.065,steel,frame);
 tube([[-2,.6,.75],[-2.7,.6,.4],[-3.4,.6,0]],.065,steel,frame);
 box(.17,.63,.15,steel,[-2.65,.35,0],frame);box(.4,.08,.35,dark,[-2.65,.06,0],frame);
 for(const z of [-1.08,1.08]){
  const tire=mesh(new T.TorusGeometry(.46,.16,12,48),black,[.8,.5,z],frame);
  cyl(.32,.17,steel,[.8,.5,z],frame,'z');
  cyl(.12,.22,dark,[.8,.5,z*1.03],frame,'z');
  for(let i=0;i<8;i++){const a=i*Math.PI/4;cyl(.037,.2,dark,[.8+Math.cos(a)*.225,.5+Math.sin(a)*.225,z*1.04],frame,'z')}
  const guard=mesh(new T.TorusGeometry(.68,.07,4,40,Math.PI),dark,[.8,.5,z],frame);
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
 box(4.2,.22,1.83,yellow,[0,2.04,0],hood,.09);
 box(.32,.58,1.76,yellow,[-2,1.76,0],hood,.08);
 const panels=[];
 for(const z of [-.88,.88]){
  const side=part('Side panel '+z,[0,1.12,z>0?1.37:-1.37]);panels.push(side);
  box(3.98,.97,.09,yellow,[0,1.45,z],side,.04);
  for(let i=0;i<14;i++)box(.045,.45,.017,dark,[.93+i*.055,1.52,z*1.063],side,.01);
  box(.37,.12,.04,dark,[-.98,1.7,z*1.075],side);
  for(const x of [-1.75,1.77])for(const y of [1.12,1.82])cyl(.028,.035,steel,[x,y,z*1.085],side,'z');
  const cv=document.createElement('canvas');cv.width=1024;cv.height=256;const ctx=cv.getContext('2d');ctx.fillStyle='#12302e';ctx.fillRect(0,0,1024,256);ctx.fillStyle='#f1f3de';ctx.font='bold 90px Arial';ctx.fillText('PORTABLE AIR',45,110);ctx.fillStyle='#eabb3e';ctx.font='38px Arial';ctx.fillText('POWER, WITH PURPOSE.',48,185);
  const tx=new T.CanvasTexture(cv);tx.colorSpace=T.SRGBColorSpace;
  const plate=mesh(new T.PlaneGeometry(1.4,.35),new T.MeshStandardMaterial({map:tx,roughness:.5}),[-.65,1.3,z*1.065],side);if(z<0)plate.rotation.y=Math.PI;
 }
 const face=part('Controls',[-1.5,.35,.8]);
 box(.09,.98,1.64,dark,[-2,1.38,0],face);
 box(.05,.3,.4,silver,[-2.06,1.55,.3],face);
 const screen=mat(0x77ffd1,.05,.3);screen.emissive=new T.Color(0x32d5a3);screen.emissiveIntensity=.45;
 box(.055,.18,.29,screen,[-2.1,1.59,.3],face);
 for(const z of [-.45,-.15]){cyl(.075,.16,steel,[-2.14,1.09,z],face,'x');cyl(.05,.18,orange,[-2.24,1.09,z],face,'x')}
 // Rings, registration marks and contact shadow form the display plinth.
 const shadowCanvas=document.createElement('canvas');shadowCanvas.width=256;shadowCanvas.height=256;
 const cx=shadowCanvas.getContext('2d'),grad=cx.createRadialGradient(128,128,4,128,128,128);grad.addColorStop(0,'rgba(0,0,0,.58)');grad.addColorStop(.5,'rgba(0,0,0,.3)');grad.addColorStop(1,'rgba(0,0,0,0)');cx.fillStyle=grad;cx.fillRect(0,0,256,256);
 const shadow=mesh(new T.PlaneGeometry(10,6),new T.MeshBasicMaterial({map:new T.CanvasTexture(shadowCanvas),transparent:true,depthWrite:false}),[0,-.22,0],group);shadow.rotation.x=-Math.PI/2;
 const ring=mesh(new T.TorusGeometry(3.45,.012,5,100),new T.MeshBasicMaterial({color:0x70b89c,transparent:true,opacity:.35}),[0,-.15,0],group);ring.rotation.x=-Math.PI/2;
 for(let i=0;i<48;i++){const a=i*Math.PI/24;const m=box(.012,.012,i%4===0?.19:.07,green,[Math.cos(a)*3.6,-.14,Math.sin(a)*3.6]);m.rotation.y=-a+Math.PI/2;}
 group.rotation.y=-.34;group.position.y=-1.3;
 let target=0,current=0,manual=false,visible=true,last=0,dirty=true;
 const range=document.querySelector('#assembly-scrub'),readout=document.querySelector('#assembly-readout'),labels=document.querySelectorAll('[data-component]');
 const phases=[['Power.','With purpose.','A remarkable machine deserves a remarkable customer journey. Scroll to open it.'],['Open it up.','See inside.','Every component has a purpose. So should every customer touchpoint.'],['Every part.','One purpose.','Attention. Identity. The right equipment. A real person who owns the next step.']];
 function update(){const r=section.getBoundingClientRect(),h=main.clientHeight,p=clamp(-r.top/(section.clientHeight-h));target=clamp((p-.04)/.82);manual=false;dirty=true}
 main.addEventListener('scroll',update,{passive:true});
 range.addEventListener('input',()=>{target=Number(range.value)/100;manual=true;dirty=true});
 document.querySelectorAll('[data-assembly]').forEach(b=>b.addEventListener('click',()=>{target=Number(b.dataset.assembly);range.value=target*100;manual=true;dirty=true}));
 const resize=()=>{const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();dirty=true};new ResizeObserver(resize).observe(host);
 new IntersectionObserver(es=>{visible=es[0].isIntersecting;dirty=true},{root:main}).observe(host);
 function tick(time){
 requestAnimationFrame(tick);if(!visible||document.hidden||time-last<30)return;last=time;
 const diff=target-current;current=paused()?target:current+diff*.095;
 if(Math.abs(diff)<.0002&&!dirty&& (paused()||current<.25))return;
 dirty=false;const p=current,e=p*p*(3-2*p);
 parts.forEach(({g,delta},i)=>{const k=clamp(e*(1.16)-(i%3)*.045);g.position.copy(delta).multiplyScalar(k)});
 hood.rotation.z=e*-.035;panels[0].rotation.x=-e*.1;panels[1].rotation.x=e*.1;
 group.rotation.y=-.34+e*.48;
 const mobile=host.clientWidth<700;
 camera.position.set(-8.9-e*1.1,5.6+e*2,9.8+e*2.5);
 camera.lookAt(-.3,.24+e*.6,0);camera.fov=mobile?42:33;camera.updateProjectionMatrix();
 if(!paused())fan.rotation.x=time*.003;
 renderer.render(scene,camera);
 const pct=Math.round(e*100);readout.textContent=pct+'% expanded';canvas.dataset.expanded=String(pct);
 if(!manual)range.value=Math.round(current*100);
 const phase=current<.16?0:current<.62?1:2;
 if(host.dataset.phase!==String(phase)){
 host.dataset.phase=String(phase);
 document.querySelector('#hero-line-one').textContent=phases[phase][0];document.querySelector('#hero-line-two').textContent=phases[phase][1];document.querySelector('#hero-description').textContent=phases[phase][2];
 }
 labels.forEach((l,i)=>{l.classList.toggle('visible',current>.18+i*.1)});
 }
 update();resize();requestAnimationFrame(tick);canvas.dataset.renderer='three';
 canvas.addEventListener('webglcontextlost',()=>{document.querySelector('#machine-fallback').hidden=false;canvas.hidden=true});
}
