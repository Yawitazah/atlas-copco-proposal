const STORAGE_KEY='zah-atlas-strategy-overview-v1';
const INTERACTIVE='button,a,input,select,textarea,video,iframe,[contenteditable="true"]';

export const OVERVIEW_VIDEO='';

export const OVERVIEW_SLIDES=[
 {id:'idea',badge:'THE STRATEGY IN BRIEF',title:'Turn every introduction into accountable follow-through.',support:'A connected growth system for Portable Air.',body:'Capture what each prospect needs, return a personalized equipment page, connect them to a sales rep, and keep every handoff accountable through a recorded outcome.',next:'Next: Meet the customer',visual:'pulse'},
 {id:'meet',badge:'01 / MEET',title:'Start with a real conversation.',support:'Let people see the equipment—and talk about the work.',body:'Trade shows, pop-ups and other in-person events lead the strategy. Large displays, a real machine and a staffed demonstration make the capability tangible. LinkedIn Opportunity Scouting and prospecting ads bring relevant local decision-makers into the same path.',next:'Next: Understand the goal',visual:'field'},
 {id:'understand',badge:'02 / UNDERSTAND',title:'Ask about the job before recommending equipment.',support:'The Goal Pulse Check captures the context Sales needs.',body:'A representative can guide it on a tablet, or the customer can scan a QR code and continue on their phone. Focused choices capture the application, site, equipment requirements, buying team and timing.',next:'Next: Personalize the return',visual:'check'},
 {id:'personalize',badge:'03 / PERSONALIZE',title:'Personalize every return.',support:'Match the page and creative to the prospect’s data.',body:'Build a personalized equipment page from their answers. Then use personalized email and eligible LinkedIn and YouTube retargeting creative to bring them back to the equipment and next step they selected.',next:'Next: Connect with Sales',visual:'return'},
 {id:'connect',badge:'04 / CONNECT',title:'Move the lead into a real sales conversation.',support:'A sales rep owns the follow-up.',body:'The sales rep confirms the requirements, refines the equipment fit and arranges the site walkthrough. The request, owner and due next action stay attached to the opportunity.',next:'Next: Protect accountability',visual:'connect'},
 {id:'own',badge:'05 / ACCOUNTABILITY',title:'Prevent the handoff from becoming a pass-off.',support:'Accountability stays with a named internal sales rep.',body:'When a smaller opportunity moves to a dealer or distributor, retain the internal owner. Record partner acceptance, the latest interaction, the next action and due date, and the final outcome so the team can see exactly where follow-through stopped.',note:'The workflow can only reflect recorded activity.',next:'Open the full experience',visual:'handoff'}
];

export function overviewStep(current,delta,count=OVERVIEW_SLIDES.length){
 return Math.max(0,Math.min(count-1,current+delta));
}

export function shouldAutoOpen({search='',hash='',seen=false}={}){
 const params=new URLSearchParams(search);
 if(params.get('overview')==='1')return true;
 if(params.has('ref')||hash==='#mission')return false;
 return !seen&&(!hash||hash==='#machine');
}

function visualMarkup(type){
 if(type==='field')return '<div class="overview-field"><img src="../assets/pneumatic-tools.jpg" alt="People using pneumatic equipment at a worksite"><span class="field-pin p1">SEE IT</span><span class="field-pin p2">TRY IT</span><span class="field-pin p3">SCAN IT</span></div>';
 if(type==='check')return '<div class="overview-devices"><div class="overview-tablet"><span>GOAL PULSE CHECK</span><strong>What does the work require?</strong><i>Job</i><i>Site</i><i>Equipment</i><i>Team</i><i>Timing</i></div><div class="overview-phone"><b>62%</b><span>Complete</span></div></div>';
 if(type==='return')return '<div class="overview-return"><div class="return-page"><span>PERSONALIZED FOR NORTHLINE CIVIL</span><img src="./assets/xas400-cutout.png" alt="Portable air compressor"><strong>Your personalized equipment match</strong></div><i class="return-orbit linkedin">in</i><i class="return-orbit youtube">▶</i><i class="return-orbit mail">@</i></div>';
 if(type==='connect')return '<div class="overview-connection"><div class="connection-people"><span class="person rep">SALES REP</span><i></i><span class="person customer">SITE</span></div><div class="connection-record"><span>ACCOUNTABLE OWNER</span><b>Alex Morgan</b><span>NEXT ACTION</span><b>Confirm site walkthrough</b><small>DUE · SEP 23</small></div></div>';
 if(type==='handoff')return '<div class="overview-handoff"><div class="owner-anchor"><span>INTERNAL OWNER</span><b>STAYS VISIBLE</b></div><div class="handoff-route"><span>Opportunity</span><i>→</i><span>Dealer / distributor</span><i>→</i><span>Customer outcome</span></div><div class="handoff-facts"><span>✓ Partner accepted</span><span>✓ Latest activity</span><span>→ Next action + due date</span></div></div>';
 return '<div class="overview-pulse-map"><div class="pulse-machine"><img src="./assets/xas400-cutout.png" alt="Portable air compressor"></div><div class="pulse-path"><span><b>01</b>Meet</span><i></i><span><b>02</b>Listen</span><i></i><span><b>03</b>Respond</span><i></i><span><b>04</b>Own</span></div></div>';
}

function getSeen(){try{return sessionStorage.getItem(STORAGE_KEY)==='seen'}catch{return false}}
function setSeen(){try{sessionStorage.setItem(STORAGE_KEY,'seen')}catch{}}

export function mountOverview({onEnter=()=>{},onOpenChange=()=>{}}={}){
 const dialog=document.createElement('dialog');
 dialog.id='strategy-overview';
 dialog.className='strategy-overview';
 dialog.setAttribute('aria-labelledby','overview-title');
 dialog.innerHTML='<div class="overview-frame"><header class="overview-top"><a class="overview-brand" href="https://zahbrandsolutions.com/" target="_blank" rel="noopener" tabindex="-1">zah <span>× PORTABLE AIR</span></a><button class="overview-skip" type="button">Skip overview</button></header><div class="overview-stage"><div class="overview-media" aria-live="off"></div><article class="overview-copy"><span class="overview-badge"></span><h2 id="overview-title" tabindex="-1"></h2><p class="overview-support"></p><p class="overview-body"></p><p class="overview-note"></p></article></div><footer class="overview-footer"><div class="overview-position"><span class="overview-count" aria-live="polite"></span><div class="overview-dots" role="group" aria-label="Overview sections"></div></div><div class="overview-controls"><button class="overview-back" type="button">Back</button><button class="overview-next" type="button"></button></div></footer></div>';
 document.body.append(dialog);
 const q=s=>dialog.querySelector(s);
 let current=0,previousFocus=null,pointerStart=null,transitionTimer=0;

 function pauseMedia(){dialog.querySelectorAll('video').forEach(video=>video.pause())}
 function render(direction=0){
  const slide=OVERVIEW_SLIDES[current],stage=q('.overview-stage');
  pauseMedia();
  clearTimeout(transitionTimer);
  stage.classList.remove('slide-forward','slide-back');
  if(direction){void stage.offsetWidth;stage.classList.add(direction>0?'slide-forward':'slide-back');transitionTimer=setTimeout(()=>stage.classList.remove('slide-forward','slide-back'),280)}
  q('.overview-badge').textContent=slide.badge;
  q('#overview-title').textContent=slide.title;
  q('.overview-support').textContent=slide.support;
  q('.overview-body').textContent=slide.body;
  q('.overview-note').textContent=slide.note||'';
  q('.overview-note').hidden=!slide.note;
  q('.overview-count').textContent=(current+1)+' of '+OVERVIEW_SLIDES.length;
  q('.overview-back').hidden=current===0;
  q('.overview-next').textContent=slide.next;
  q('.overview-media').innerHTML=current===0&&OVERVIEW_VIDEO?'<video controls playsinline preload="metadata" src="'+OVERVIEW_VIDEO+'"><track kind="captions" srclang="en" label="English"></video>':visualMarkup(slide.visual);
  q('.overview-dots').innerHTML=OVERVIEW_SLIDES.map((item,i)=>'<button type="button" data-slide="'+i+'" aria-label="Open section '+(i+1)+': '+item.badge+'" aria-current="'+(i===current?'step':'false')+'"></button>').join('');
 }
 function move(delta){const next=overviewStep(current,delta);if(next===current)return;const old=current;current=next;render(current-old)}
 function close({enter=false}={}){setSeen();pauseMedia();if(dialog.open)dialog.close();document.body.classList.remove('overview-open');onOpenChange(false);if(enter)onEnter()}
 function open(){previousFocus=document.activeElement;current=0;render();const chapters=document.querySelector('#chapters'),menu=document.querySelector('#menu-toggle');if(chapters)chapters.hidden=true;if(menu)menu.setAttribute('aria-expanded','false');document.body.classList.add('overview-open');if(!dialog.open)dialog.showModal();onOpenChange(true);requestAnimationFrame(()=>q('#overview-title').focus())}

 q('.overview-skip').onclick=()=>close();
 q('.overview-back').onclick=()=>move(-1);
 q('.overview-next').onclick=()=>current===OVERVIEW_SLIDES.length-1?close({enter:true}):move(1);
 q('.overview-dots').onclick=e=>{const b=e.target.closest('[data-slide]');if(!b)return;const next=Number(b.dataset.slide),old=current;current=next;render(current-old)};
 dialog.addEventListener('cancel',e=>{e.preventDefault();close()});
 dialog.addEventListener('close',()=>{document.body.classList.remove('overview-open');onOpenChange(false);if(previousFocus?.isConnected)previousFocus.focus()});
 dialog.addEventListener('keydown',e=>{
  if(e.target.closest(INTERACTIVE))return;
  if(e.key==='ArrowRight'){e.preventDefault();move(1)}
  if(e.key==='ArrowLeft'){e.preventDefault();move(-1)}
 });
 dialog.addEventListener('pointerdown',e=>{if(e.target.closest(INTERACTIVE))return;pointerStart={x:e.clientX,y:e.clientY}});
 dialog.addEventListener('pointerup',e=>{if(!pointerStart)return;const dx=e.clientX-pointerStart.x,dy=e.clientY-pointerStart.y;pointerStart=null;if(Math.abs(dx)>42&&Math.abs(dx)>Math.abs(dy))move(dx<0?1:-1)});
 document.addEventListener('click',e=>{const opener=e.target.closest('[data-overview-open]');if(opener){e.preventDefault();open()}});
 const auto=shouldAutoOpen({search:location.search,hash:location.hash,seen:getSeen()});
 if(auto)requestAnimationFrame(open);
 return {open,close,isOpen:()=>dialog.open};
}
