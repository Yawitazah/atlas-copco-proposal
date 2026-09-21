const clamp=n=>Math.max(0,Math.min(1,n));
export const JOURNEY_DURATION=4700;
export function journeyAt(ms){const incoming=clamp(ms/1300),outgoing=[2100,2350,2600].map(d=>clamp((ms-2100)/d)),delivered=outgoing.map(n=>n===1);return {incoming,outgoing,delivered,complete:delivered.every(Boolean),phase:incoming<1?'capture':ms<2100?'personalize':delivered.every(Boolean)?'complete':'deliver'};}
export function makeJourney(source,at,random=Math.random){return {source,at,inbound:1300+random()*600,process:600+random()*500,branches:[0,1,2].map((_,i)=>({delay:i*650+random()*400,duration:1400+random()*900,arrived:false})),counted:false};}
export function readJourney(j,now){const age=now-j.at,incoming=clamp(age/j.inbound),outgoing=j.branches.map(b=>clamp((age-j.inbound-j.process-b.delay)/b.duration));return {incoming,outgoing,complete:outgoing.every(p=>p===1)};}
export const chargeAt=(age)=>age<0?0:age<420?age/420:Math.max(0,1-(age-420)/7000);
