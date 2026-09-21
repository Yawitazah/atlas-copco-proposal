// Focused questions retain the existing seven-section profile and validation contract.
const pick=(id,group,title,options,extra={})=>({id,group,title,type:'choice',options,...extra});
const form=(id,group,title,fields,extra={})=>({id,group,title,type:'fields',fields,...extra});
const f=(name,label,type='text',required=true)=>({name,label,type,required});
export const QUESTIONS=[
 form('name',0,'What should we call you?',[f('first','First name'),f('last','Last name')],{hint:'Your name stays with you as your equipment plan takes shape.'}),
 form('company',0,'Which company are you with?',[f('company','Company or organization')]),
 pick('role',0,'What do you do?',['Owner / executive','Fleet manager','Site / operations manager','Engineer / technical evaluator','Purchasing / procurement','Operator','Other']),
 form('email',0,'Where could your rep reach you?',[f('email','Work email','email')],{hint:'Use fictional details to explore. This demonstration sends nothing.'}),
 form('region',0,'Where is your work based?',[f('region','City, state and country')]),
 pick('application',1,'What kind of work are you planning?',['Construction','Abrasive blasting','Utilities / cable','Rental fleet','Industrial work','Other']),
 pick('flow',1,'How much air does the job need?',[['110','Up to 110 cfm'],['189','111–189 cfm'],['400','190–400 cfm'],['above400','More than 400 cfm'],['unknown','Help me size it']],{hint:'CFM measures airflow. If you are unsure, a specialist can review your tools.'}),
 pick('pressure',1,'What pressure do your tools need?',[['100','Up to 100 psi'],['150','Up to 150 psi'],['above150','Above 150 psi'],['unknown','Not sure yet']]),
 pick('power',1,'What power suits your site?',['Diesel suitable','Electric required','Open to either','Not sure'],{detail:f('tools','Tools or simultaneous demand (optional)','text',false)}),
 {id:'model',group:2,title:'See what changes with capacity.',type:'equipment',hint:'Swipe the machine or use the arrows. Tap View details for a closer look.'},
 pick('authority',3,'How do you shape the decision?',['I decide','I recommend','I evaluate','I operate','We decide together','Exploring for now']),
 pick('manager',3,'Who do you report to?',['Business owner','Operations director','General manager','I lead the business','Another role','Not sure yet'],{detail:f('managerDetail','Name or role detail (optional)','text',false)}),
 pick('evaluator',3,'Who checks the technical fit?',['Me','Site engineer','Operations team','External specialist','Not sure yet'],{detail:f('evaluatorDetail','Name or role detail (optional)','text',false)}),
 pick('approver',3,'Who approves the budget?',['Me','Business owner','Finance director','Procurement team','Not sure yet'],{detail:f('approverDetail','Name or role detail (optional)','text',false)}),
 pick('purchasing',3,'Who places the order?',['My company directly','Central procurement','Dealer / distributor','Rental provider','To be confirmed'],{detail:f('partner','Current dealer or rental partner (optional)','text',false)}),
 pick('intent',4,'How would you like to get the equipment?',[['Buy','Buy for our fleet'],['Rent','Rent for the project'],['Compare','Compare both routes']]),
 pick('timeframe',4,'When will you need it?',['Within 30 days','1–3 months','3–6 months','6+ months','Exploring']),
 pick('budget',4,'What budget should we work with?',['Under $25,000','$25,000–$50,000','$50,000–$100,000','$100,000+','Rental budget to confirm','Not set yet'],{hint:'Every budget earns the same progress. Fit comes first.'}),
 pick('priority',4,'What matters most for this job?',['Uptime / reliability','Capacity','Portability','Operating cost','Lower site emissions','Flexibility']),
 pick('visit',5,'Would a walkthrough help?',[['On site','Yes, at our site'],['Virtual','Yes, by video'],['Later','Let’s discuss it later']],{hint:'Meet a real person and review your tools, site and equipment options.'}),
 form('date',5,'When would suit your team?',[f('date','Preferred date','date'),{name:'slot',label:'Time window',type:'select',required:true,options:['Morning, 8–12','Afternoon, 12–5','Flexible']}],{show:a=>a.visit&&a.visit!=='Later',hint:'This is a request. A rep must confirm availability.'}),
 pick('timezone',5,'Which time zone is that?',['US Eastern','US Central','US Mountain','US Pacific','Other — see notes'],{show:a=>a.visit&&a.visit!=='Later',detail:f('notes','Time zone or scheduling notes (optional)','text',false)}),
 form('site',5,'Where should the rep meet you?',[f('site','Site address or meeting location')],{show:a=>a.visit==='On site'}),
 {id:'attendees',group:5,title:'Who should join the walkthrough?',type:'multi',options:['Me','Technical evaluator','Budget approver','Purchasing team'],show:a=>a.visit&&a.visit!=='Later',hint:'Choose everyone who would benefit. Names can be confirmed later.'},
 pick('contact',5,'How would you prefer to hear back?',['Email','Phone','SMS']),
 form('phone',5,'What number should the rep use?',[f('phone','Phone, including country code','tel')],{show:a=>['Phone','SMS'].includes(a.contact),hint:'Used only for the contact preference you choose in this demonstration.'}),
 pick('sms',5,'Allow texts about this request?',[['yes','Yes, about this request'],['email','Use email instead']],{show:a=>a.contact==='SMS',hint:'This records a preference. The demo does not send texts.'}),
 pick('referral',6,'Who else would benefit from this?',[['Invite teammate','Invite my buying team'],['Refer another business','Refer another business'],['Referred by someone','Someone referred me'],['Continue solo','Just me for now']],{detail:f('referralContext','Referrer or company context (optional)','text',false),hint:'Your finished page includes a shareable invitation and a private brief.'})
];
export const questionsFor=a=>QUESTIONS.filter(q=>!q.show||q.show(a));
export function questionError(q,a){
 if(q.type==='choice'&&!q.options.some(o=>(Array.isArray(o)?o[0]:o)===a[q.id]))return 'Choose an option to continue.';
 if(q.type==='equipment'&&!['110','188','400'].includes(a.model))return 'Select equipment to discuss.';
 if(q.type==='multi'&&!a[q.id])return 'Choose at least one attendee.';
 for(const field of q.fields||[]){if(field.required&&!String(a[field.name]||'').trim())return 'Add '+field.label.toLowerCase()+'.';if(field.type==='email'&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a[field.name]||''))return 'Enter a valid work email.';}
 return '';
}