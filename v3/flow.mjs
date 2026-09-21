const clamp=n=>Math.max(0,Math.min(1,n));

// The connected journey is a shared path. Every captured profile reaches the
// three required milestones in order; a walkthrough is a conditional fourth
// milestone rather than an alternate destination.
export const JOURNEY_DURATION=4700;
export const REQUIRED_MILESTONES=3;
export const MILESTONE_GOALS=[100,100,100,25];
export const ACTION_GOALS=MILESTONE_GOALS;
export const ACTION_BATCH=5;
export const CYCLE_MS=10000;

const fixedStageStarts=[2100,2800,3500,4200];
const fixedStageDuration=500;
export function journeyAt(ms){
 const incoming=clamp(ms/1300);
 const milestones=fixedStageStarts.map(start=>clamp((ms-start)/fixedStageDuration));
 const reached=milestones.map(value=>value===1);
 const requiredComplete=reached.slice(0,REQUIRED_MILESTONES).every(Boolean);
 return {
  incoming,
  milestones,
  reached,
  requiredComplete,
  walkthroughActive:reached[3],
  complete:reached.every(Boolean),
  phase:incoming<1?'capture':ms<fixedStageStarts[0]?'personalize':requiredComplete?'complete':'follow-through'
 };
}

export function makeJourney(source,at,random=Math.random,walkthrough=true){
 return {
  source,
  at,
  weight:ACTION_BATCH,
  walkthrough,
  inbound:1300+random()*600,
  process:600+random()*500,
  stageDurations:[420,420,420,420].map(duration=>duration+random()*180),
  started:false,
  entered:false,
  left:false,
  arrived:false,
  reached:[false,false,false,false]
 };
}

export function readJourney(j,now){return actionAt(j,now);}
export const chargeAt=age=>age<0?0:age<420?age/420:Math.max(0,1-(age-420)/7000);

export function actionCycle(random=Math.random){
 return Array.from({length:20},(_,i)=>({
  id:i,
  source:Math.floor(random()*4),
  weight:ACTION_BATCH,
  walkthrough:i%4===2,
  at:180+i*285+random()*70,
  inbound:500+random()*160,
  process:170+random()*90,
  stageDurations:[300,300,300,300].map(duration=>duration+random()*90),
  started:false,
  arrived:false,
  entered:false,
  left:false,
  reached:[false,false,false,false]
 }));
}

export function actionAt(j,time){
 const age=time-j.at;
 const departure=j.inbound+j.process;
 const stageCount=j.walkthrough?4:REQUIRED_MILESTONES;
 const milestones=[false,false,false,false];
 let cursor=departure,activeStage=-1,stageProgress=0;
 for(let i=0;i<stageCount;i++){
  const duration=j.stageDurations[i];
  const progress=clamp((age-cursor)/duration);
  milestones[i]=progress===1;
  if(activeStage===-1&&age>=cursor&&progress<1){activeStage=i;stageProgress=progress;}
  cursor+=duration;
 }
 return {
  incoming:clamp(age/j.inbound),
  started:age>=0,
  entered:age>=j.inbound,
  left:age>=departure,
  milestones,
  activeStage,
  stageProgress,
  requiredComplete:milestones.slice(0,REQUIRED_MILESTONES).every(Boolean),
  walkthroughActive:j.walkthrough&&milestones[3],
  arrived:age>=cursor
 };
}

export function actionArrival(j){
 const stageCount=j.walkthrough?4:REQUIRED_MILESTONES;
 return j.at+j.inbound+j.process+j.stageDurations.slice(0,stageCount).reduce((sum,duration)=>sum+duration,0);
}

export function goalFill(value,goal,completedAt,time){
 if(completedAt===null)return clamp(value/goal);
 return clamp(1-Math.max(0,time-completedAt-600)/1100);
}
