export function mountSignals(paused){
 const $=s=>document.querySelector(s),board=$('#signal-board'),canvas=$('#signal-canvas'),ctx=canvas.getContext('2d');
 const channels=[...document.querySelectorAll('[data-channel]')],hub=$('.signal-hub'),owner=$('.destination-card'),outcome=$('.outcome-node');
 let w=0,h=0,points=[],particles=[],count=0,visible=false,frame=0,last=0,ambient=0,tick=0;
 const colors=['#1d8f6f','#3c6df0','#f05d5e','#dba637'];
 function point(el,edge){const b=board.getBoundingClientRect(),r=el.getBoundingClientRect();return {x:r.left-b.left+(edge==='right'?r.width:edge==='left'?0:r.width/2),y:r.top-b.top+r.height/2}}
 function geometry(){const r=board.getBoundingClientRect();w=r.width;h=r.height;const scale=Math.min(devicePixelRatio||1,2);canvas.width=w*scale;canvas.height=h*scale;ctx.setTransform(scale,0,0,scale,0,0);const mobile=w<600;points=channels.map(c=>[point(c,mobile?'center':'right'),point(hub,'center'),point(owner,'center'),point(outcome,'center')]);draw(0)}
 const bezier=(a,b,t)=>{const dx=Math.abs(b.x-a.x),dy=Math.abs(b.y-a.y);const c=dx>dy?[{x:(a.x+b.x)/2,y:a.y},{x:(a.x+b.x)/2,y:b.y}]:[{x:a.x,y:(a.y+b.y)/2},{x:b.x,y:(a.y+b.y)/2}];const u=1-t;return{x:u*u*u*a.x+3*u*u*t*c[0].x+3*u*t*t*c[1].x+t*t*t*b.x,y:u*u*u*a.y+3*u*u*t*c[0].y+3*u*t*t*c[1].y+t*t*t*b.y}};
 function draw(dt){
 ctx.clearRect(0,0,w,h);
 points.forEach((p,j)=>{ctx.strokeStyle='#93ad8c66';ctx.lineWidth=1;ctx.beginPath();p.forEach((a,i)=>{if(!i)return;for(let k=0;k<=32;k++){const v=bezier(p[i-1],a,k/32);if(k===0)ctx.moveTo(v.x,v.y);else ctx.lineTo(v.x,v.y)}});ctx.stroke()});
 particles=particles.filter(p=>p.age<3.2);
 particles.forEach(p=>{p.age+=dt;if(p.age<0)return;const stage=Math.min(2,Math.floor(p.age)),t=Math.min(1,p.age-stage);if(!points[p.channel]||t<0)return;const v=bezier(points[p.channel][stage],points[p.channel][stage+1],t);ctx.fillStyle=colors[p.channel];ctx.shadowColor=colors[p.channel];ctx.shadowBlur=8;ctx.beginPath();ctx.arc(v.x,v.y,p.big?3.4:2.1,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0});
 }
 function loop(time){frame=0;if(!visible||document.hidden)return;const dt=last?Math.min((time-last)/1000,.05):0;last=time;if(!paused()){ambient+=dt;tick+=dt;if(ambient>1.15){ambient=0;particles.push({channel:Math.floor(tick)%4,age:0,big:false})}draw(dt)}frame=requestAnimationFrame(loop)}
 const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;last=0;if(visible&&!frame)frame=requestAnimationFrame(loop)},{root:$('#zw-main'),threshold:.05});observer.observe(board);
 new ResizeObserver(geometry).observe(board);
 document.addEventListener('visibilitychange',()=>{last=0;if(!document.hidden&&visible&&!frame)frame=requestAnimationFrame(loop)});
 channels.forEach((b,i)=>b.addEventListener('click',()=>{
 count++;$('#signal-count').textContent=String(count).padStart(2,'0');b.classList.add('sent');setTimeout(()=>b.classList.remove('sent'),500);
 $('#signal-readout').textContent=b.dataset.channel+' signal → personalized experience → accountable owner → next conversation.';
 if(!paused())for(let n=0;n<8;n++)particles.push({channel:i,age:-n*.13,big:true});
 else draw(0);
 }));
 const focus={
 experience:['Relevant from the first interaction','The mission builder turns choices into a project brief. The result page reflects the job, priorities and power path. Permission-based email or SMS can continue the conversation.'],
 owner:['No orphaned inquiries','SAP C4C retains an internal owner, a next action and a deadline. Partner routing creates a tracked handoff that stays open until the receiving partner accepts.'],
 outcome:['Connect the digital signal to a real person','A site visit validates requirements and puts a face to the name. Rep-reported notes, partner acknowledgments and customer-confirmed feedback should remain distinct records.']
 };
 document.querySelectorAll('[data-focus]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-focus]').forEach(n=>n.classList.toggle('spotlit',n===b));const f=focus[b.dataset.focus];$('#signal-focus').innerHTML='<strong>'+f[0]+'</strong><p>'+f[1]+'</p>';if(!paused())$('#signal-focus').animate([{opacity:.3,transform:'translateY(8px)'},{opacity:1,transform:'none'}],{duration:400,easing:'ease-out'})}));
 geometry();
}
