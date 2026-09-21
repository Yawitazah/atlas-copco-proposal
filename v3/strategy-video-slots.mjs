const VIDEO_SLOTS=[
 {file:'strategy-01-first-opening.mp4',title:'Create the first opening'},
 {file:'strategy-02-personalized-return.mp4',title:'Use what the prospect told you'},
 {file:'strategy-03-accountability.mp4',title:'Keep accountability through conversion'}
];
const AVAILABLE_VIDEO_FILES=["strategy-01-first-opening.mp4","strategy-02-personalized-return.mp4","strategy-03-accountability.mp4"];

export const strategyVideoFiles=()=>VIDEO_SLOTS.map(slot=>slot.file);

export function mountStrategyVideoSlots(){
 const cards=[...document.querySelectorAll('.strategy-grid article')];
 if(!cards.length)return;
 const dialog=document.createElement('dialog');
 dialog.className='strategy-video-dialog';
 dialog.setAttribute('aria-labelledby','strategy-video-title');
 dialog.innerHTML='<div class="strategy-video-frame"><header><div><span>THE CONVERSATION CONTINUES</span><h2 id="strategy-video-title"></h2></div><button type="button" aria-label="Close video">×</button></header><video controls playsinline preload="metadata"></video></div>';
 document.body.append(dialog);
 const video=dialog.querySelector('video'),title=dialog.querySelector('h2');
 const close=()=>{video.pause();dialog.close()};
 dialog.querySelector('button').onclick=close;
 dialog.addEventListener('cancel',event=>{event.preventDefault();close()});
 const availableVideos=new Set(AVAILABLE_VIDEO_FILES);
 VIDEO_SLOTS.forEach((slot,index)=>{
  const visual=cards[index]?.querySelector('.strategy-card-visual');
  if(!visual)return;
  if(!availableVideos.has(slot.file))return;
  const src='./assets/'+slot.file;
  const launch=document.createElement('button');
  launch.type='button';launch.className='strategy-video-launch';launch.setAttribute('aria-label','Watch video: '+slot.title);
  launch.innerHTML='<span aria-hidden="true">▶</span><b>Watch the story</b>';
  visual.append(launch);visual.classList.add('has-video');
  launch.onclick=()=>{title.textContent=slot.title;video.src=src;if(!dialog.open)dialog.showModal();video.focus();};
 });
}
