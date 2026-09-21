const clamp=n=>Math.max(0,Math.min(1,n));
export const JOURNEY_DURATION=4700;
export function journeyAt(ms){const incoming=clamp(ms/1300),outgoing=[2100,2350,2600].map(d=>clamp((ms-2100)/d)),delivered=outgoing.map(n=>n===1);return {incoming,outgoing,delivered,complete:delivered.every(Boolean),phase:incoming<1?'capture':ms<2100?'personalize':delivered.every(Boolean)?'complete':'deliver'};}
export function makeJourney(source,at,random=Math.random){return {source,at,inbound:1300+random()*600,process:600+random()*500,branches:[0,1,2].map((_,i)=>({delay:i*650+random()*400,duration:1400+random()*900,arrived:false})),counted:false};}
export function readJourney(j,now){const age=now-j.at,incoming=clamp(age/j.inbound),outgoing=j.branches.map(b=>clamp((age-j.inbound-j.process-b.delay)/b.duration));return {incoming,outgoing,complete:outgoing.every(p=>p===1)};}
export const chargeAt=(age)=>age<0?0:age<420?age/420:Math.max(0,1-(age-420)/7000);

// One visual cycle represents 100 recorded actions, not 100 unique people.
export const CYCLE_MS=10000;
export const ACTION_GOALS=[40,25,35];
export const ACTION_BATCH=5;
export function actionCycle(random=Math.random){
 const route=[0,2,1,0,2,0,1,2,0,2,1,0,2,0,1,2,0,1,2,0];
 return route.map((destination,i)=>({id:i,source:Math.floor(random()*4),destination,weight:ACTION_BATCH,at:180+i*305+random()*90,inbound:520+random()*190,process:180+random()*100,outbound:520+random()*220,started:false,arrived:false,entered:false,left:false}));
}
export function actionAt(j,time){const age=time-j.at,departure=j.inbound+j.process;return {incoming:clamp(age/j.inbound),outgoing:clamp((age-departure)/j.outbound),started:age>=0,entered:age>=j.inbound,left:age>=departure,arrived:time>=j.at+j.inbound+j.process+j.outbound};}
export function goalFill(value,goal,completedAt,time){if(completedAt===null)return clamp(value/goal);return clamp(1-Math.max(0,time-completedAt-600)/1100);}
