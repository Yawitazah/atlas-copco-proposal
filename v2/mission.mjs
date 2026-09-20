export const steps=[
{key:'application',title:'Where are we going to work?',hint:'Choose the world your crew works in.',badge:'01 / THE JOB',options:[
['Construction','construction','Construction','Tools, crews & changing sites','We’ll start with tool demand and the way your crew works.'],
['Cable installation','cable','Cable installation','Utilities & network installation','Airflow and pressure must be matched to the installation method.'],
['Rental fleet','fleet','Rental fleet','A fleet that serves many jobs','Utilization and serviceability belong in the conversation from the start.'],
['Industrial maintenance','factory','Industrial maintenance','Plants, shutdowns & service','Site rules and air-quality requirements can shape the equipment shortlist.']]},
{key:'priorities',title:'Pick your two non-negotiables.',hint:'Tap two tiles to build your priority rack. There is no wrong answer.',badge:'02 / YOUR PRIORITY RACK',multi:true,options:[
['Uptime','shield','Uptime','Keep the work moving',''],['Mobility','move','Mobility','Get between jobs',''],['Noise','volume','Noise','Consider the surroundings',''],['Running cost','coin','Running cost','Look beyond the price',''],['Emissions','leaf','Emissions','Understand site requirements',''],['Flexibility','switch','Flexibility','Adapt as the job changes','']]},
{key:'power',title:'What can we plug into?',hint:'Choose a power path. “Not sure” is a useful answer.',badge:'03 / POWER PATH',options:[
['Electric available','bolt','Site power available','Confirm supply with a specialist','Electric equipment enters the shortlist. Supply capacity and compatibility still need checking.'],
['No site power','fuel','No site power','The job needs an independent supply','A mobile diesel option is worth exploring. Let’s validate duty and local site requirements.'],
['Not sure yet','question','Let’s find out','Keep both paths open','Good call. We’ll flag power for the specialist instead of guessing the product.']]},
{key:'cadence',title:'Find your working rhythm.',hint:'Tap the pattern that feels like your operation.',badge:'04 / WORKING RHYTHM',options:[
['Occasional projects','pulse','Occasional projects','A few peaks across the year','Project length and utilization will help compare rental and ownership.'],
['Regular use','repeat','Regular use','A recurring part of the work','We’ll compare lifetime cost, servicing and availability around your workload.'],
['Fleet rotation','fleet','Fleet rotation','Multiple crews, changing demand','The conversation expands to fleet mix, service and availability.']]},
{key:'horizon',title:'When does the work start?',hint:'Place your project on the planning track.',badge:'05 / THE START LINE',options:[
['Now / this month','flag','Now','This month','We’ll make the timing visible to the owner; it is not a delivery promise.'],
['1–3 months','calendar','Soon','1–3 months','There’s time to validate the specification and plan a demonstration.'],
['Exploring','compass','Exploring','No fixed date yet','Useful research deserves a follow-up too. The next conversation can match your pace.']]},
{key:'intent',title:'Choose your next move.',hint:'Your project brief travels with you, whichever route you choose.',badge:'06 / THE HANDOFF',options:[
['Buy equipment','key','Explore ownership','Build capability for the long term','Your internal owner stays visible from inquiry through the buying conversation.'],
['Rent for a project','clock','Explore rental','Match equipment to a project','A rental partner can help. The internal owner remains responsible until the handoff is accepted.'],
['Compare options','compare','Compare both','Help me make the decision','We’ll put utilization, availability and overall cost into one conversation.']]}
];
export const fresh=()=>({step:0,answers:{},complete:false});
export function choose(state,value){
 const step=steps[state.step]; if(!step || state.complete || !step.options.some(o=>o[0]===value)) return state;
 let answer=value;
 if(step.multi){const before=state.answers[step.key]||[];answer=before.includes(value)?before.filter(x=>x!==value):before.length<2?[...before,value]:before;}
 return {...state,answers:{...state.answers,[step.key]:answer}};
}
export function ready(state){
 const s=steps[state.step]; const a=state.answers[s.key]; return s.multi?Array.isArray(a)&&a.length===2:s.options.some(o=>o[0]===a);
}
export function next(state){if(!ready(state))return state;return state.step===steps.length-1?{...state,complete:true}:{...state,step:state.step+1};}
export function back(state){return {...state,complete:false,step:Math.max(0,state.step-1)};}
export function result(answers){
 const unknown=answers.power==='Not sure yet', electric=answers.power==='Electric available';
 return {title:unknown?'Your power path is open':electric?'Explore electric mobile air':'Explore independent mobile air',
 family:unknown?'Electric + diesel comparison':electric?'E-Air electric compressors':'Mobile diesel compressors',
 image:electric?'electric-compressor.jpg':'pneumatic-tools.jpg',
 description:unknown?'We’ll compare both power routes after checking your site. No product is selected yet.':electric?'Site power makes electric mobile air worth a closer look. A specialist still needs to confirm the supply and required airflow.':'With no site power available, independent mobile air is a useful starting point. A specialist will confirm the specification.',
 route:answers.intent==='Rent for a project'?'Rental partner review':'Portable Air specialist',
 badge:answers.priorities?.includes('Uptime')?'Continuity first':answers.priorities?.includes('Mobility')?'Built to move':'Built around your job'};
}
