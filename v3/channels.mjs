import {showDetails} from './equipment.mjs?v=conversion-17';

const svg=paths=>`<svg class="strategy-icon" aria-hidden="true" focusable="false" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
const ICONS={
 trade:svg('<path d="M3 20V6h18v14M7 20v-6h10v6M7 10h10"/><path d="M12 3v3M9 3h6"/>'),
 linkedin:svg('<rect x="3" y="9" width="4" height="11"/><circle cx="5" cy="5" r="2"/><path d="M11 20V9h4v2c1.2-1.6 5-2.1 6 1.8V20h-4v-5.6c0-2-2-2-2 0V20z"/>'),
 youtube:svg('<rect x="2.5" y="5" width="19" height="14" rx="4"/><path d="m10 9 5 3-5 3z"/>'),
 referral:svg('<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="m8.4 10.8 7.2-3.6M8.4 13.2l7.2 3.6"/>'),
 attention:svg('<path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z"/><circle cx="12" cy="12" r="2.7"/>'),
 conversation:svg('<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/>'),
 capture:svg('<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2h6v2M9 9h6M9 13h6M9 17h4"/>'),
 personalize:svg('<path d="M12 3v3M12 18v3M3 12h3M18 12h3"/><circle cx="12" cy="12" r="4"/><path d="m18.4 5.6-2.1 2.1M7.7 16.3l-2.1 2.1M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1"/>'),
 follow:svg('<circle cx="9" cy="8" r="3"/><path d="M3.5 20c.5-4 2.2-6 5.5-6s5 2 5.5 6"/><path d="m15.5 15.5 2 2 4-5"/>')
 ,brief:svg('<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v5h5M9 12h7M9 16h5"/>')
 ,walkthrough:svg('<path d="M4 20V8l8-5 8 5v12"/><path d="M8 20v-7h8v7M3 20h18"/><path d="m16.5 8.5 1.5 1.5 3-3"/>')
 ,owner:svg('<circle cx="9" cy="7" r="3"/><path d="M3.5 18c.5-4 2.2-6 5.5-6 2.2 0 3.7.9 4.6 2.5"/><path d="m15 15 2 2 4-5"/>')
};

export const CHANNELS=[
 {
  name:'Trade show',color:'#936013',light:'#fff0d2',icon:ICONS.trade,
  headline:'Turn booth attention into a personalized next step.',
  audience:'Site teams, fleet managers, engineers and buying teams at relevant industry events.',
  activity:'Large displays and a staffed equipment demonstration give visitors a reason to stop, ask questions and experience the capability. A tablet or booth QR code opens the Goal Pulse Check while the conversation is fresh.',
  next:'Leave with a captured prospect, a personalized equipment page, a named sales representative and an agreed next action.',
  steps:[
   ['Earn attention','Use a strong booth sightline, large application footage and a real machine as the centerpiece.','attention'],
   ['Demonstrate the capability','A sales representative explains the application, demonstrates the equipment and invites safe hands-on exploration.','conversation'],
   ['Capture business context','Use a tablet or QR code to identify the application, equipment needs, buying team and timing through a few focused choices.','capture'],
   ['Personalize the follow-up','Use the Goal Pulse Check results to create a personalized equipment page, relevant retargeting and an accountable sales follow-up.','personalize']
  ]
 },
 {
  name:'LinkedIn',color:'#176dcc',light:'#e7f1ff',icon:ICONS.linkedin,
  headline:'Find the right people. Give them a relevant reason to return.',
  audience:'Local business decision-makers, operations leaders, fleet managers, engineers and purchasing teams.',
  activity:'LinkedIn has two jobs: Opportunity Scouting introduces Atlas Copco to relevant local decision-makers, then retargeting reconnects eligible captured prospects with personalized creative shaped by their Goal Pulse Check results.',
  next:'A sales representative builds the human relationship while personalized LinkedIn ads return eligible prospects to their equipment page, quote request or walkthrough.',
  steps:[
   ['LinkedIn Opportunity Scouting','Sales representatives identify relevant local businesses and decision-makers, introduce themselves and offer to learn about the site. Interested contacts enter the Goal Pulse Check.','conversation'],
   ['Prospecting ads','Prospecting campaigns introduce relevant Atlas Copco equipment to new audiences. Interested people enter the Goal Pulse Check, and their answers generate a personalized equipment page.','attention'],
   ['Result-based retargeting','Group the captured prospects by application, equipment interest and readiness for a quote or walkthrough. Create personalized ad creative that matches the context in each prospect’s captured data.','personalize'],
   ['Bring the prospect back','Use personalized LinkedIn ads to return eligible prospects to relevant equipment, a quote request or a walkthrough. Keep the sales representative and next action visible.','follow']
  ],
  quote:'“We work with local teams like yours. I would love to introduce myself, learn about your site and see where Atlas Copco equipment could support your work.”'
 },
 {
  name:'YouTube',color:'#cd493e',light:'#ffebe6',icon:ICONS.youtube,
  headline:'Show the application. Personalize the return.',
  audience:'Relevant prospective buyers and eligible audiences already captured in the funnel.',
  activity:'Prospecting video ads introduce the equipment and direct new interest into the Goal Pulse Check. Retargeting ads use personalized creative based on each eligible audience’s captured application and equipment needs.',
  next:'Bring the prospect back to a personalized equipment page, a quote request or a walkthrough with a named sales representative.',
  steps:[
   ['Show a recognizable application','Use targeted video campaigns to show Atlas Copco equipment solving a real jobsite need.','attention'],
   ['Capture the prospect’s goal','Direct interested viewers to the Goal Pulse Check so they can share their application and equipment requirements.','capture'],
   ['Personalize the creative','Use captured application and equipment data to create personalized video creative for eligible retargeting audiences.','personalize'],
   ['Drive a clear next action','Return the prospect to a personalized equipment page where they can request a quote or arrange a site walkthrough.','follow']
  ]
 },
 {
  name:'Referral',color:'#7750b9',light:'#f0eaff',icon:ICONS.referral,
  headline:'Turn a trusted introduction into a personalized conversation.',
  audience:'Customers, buying-team members, dealers and relevant business connections.',
  activity:'A customer or teammate shares an invitation. The referred person completes their own Goal Pulse Check and receives a personalized equipment page based on their business and application.',
  next:'Keep the referral source, clarify the new prospect’s buying role and assign a named sales representative with a visible next action.',
  steps:[
   ['Make sharing easy','Put buying-team invitations and referral options on the personalized equipment page.','referral'],
   ['Capture a fresh profile','Ask the recipient for their own business, application and equipment needs without exposing another person’s private details.','capture'],
   ['Retain the referral source','Use an anonymous referral code to connect the new introduction to its source in the demonstration.','conversation'],
   ['Assign accountable follow-up','Give the new prospect a named sales representative, a due next action and a visible outcome. Production referral incentives and tracking require agreed rules.','follow']
  ]
 }
];

export const OUTCOMES=[
 {title:'C4C record created or enriched',icon:ICONS.capture,goal:100,summary:'Keep the lead and its context together from the start.',body:'A completed Goal Pulse Check creates a new C4C lead record or enriches the matching record with the prospect’s source, identity, application and stated equipment need.',steps:['Match the prospect to an existing record or create a new one.','Retain the source and Goal Pulse Check answers with the profile.','Make the captured context available for the brief and sales follow-through.'],meaning:'Every illustrative profile reaches this required milestone.'},
 {title:'Personalized equipment brief created',icon:ICONS.brief,goal:100,summary:'Turn captured needs into an initial personalized recommendation.',body:'The prospect’s application, equipment requirements and buying role shape a personalized sales page with relevant imagery, useful specifications and clear conversion options.',steps:['Use the prospect’s name, company and application to personalize the page.','Show relevant equipment with a useful explanation of fit.','Offer quote, walkthrough and buying-team sharing options.'],meaning:'Every illustrative profile receives an initial personalized equipment brief.'},
 {title:'Sales professional assigned',icon:ICONS.owner,goal:100,summary:'Give every captured lead an accountable owner and due next action.',body:'The lead keeps a named internal sales professional, next action and due date through conversion. A dealer, distributor, rental partner or another team becomes a governed route instead of an invisible exit.',steps:['Show the assigned sales professional and due next action.','Record contact, partner acknowledgment and subsequent activity.','Surface missing actions and overdue follow-up so a handoff never becomes a pass-off.'],meaning:'Every illustrative profile reaches a named owner with a visible next action.'},
 {title:'Walkthrough activated',icon:ICONS.walkthrough,goal:25,conditional:true,summary:'Activate a site conversation when the prospect requests it or the opportunity qualifies.',body:'A walkthrough is a conditional next step inside the owned sales path. The assigned sales professional confirms the format, preferred window and attendees before it becomes an appointment.',steps:['Activate the request only when the prospect asks or qualification supports it.','Capture site, timing, time zone and attendees.','Keep the request with the assigned sales professional until its outcome and next action are recorded.'],meaning:'25 illustrative profiles activate this conditional milestone; the other profiles remain in the same owned sales path.'}
];

export function channelDetail(i,onSend){
 const c=CHANNELS[i],isTradeShow=i===0;
 const visualSrc=isTradeShow?'./assets/trade-show-booth.webp?v=brand-2':'./assets/xas400-cutout.png';
 const visualAlt=isTradeShow?'Proposed Atlas Copco trade-show booth with tall displays, a full-size compressor and a product specialist':'Atlas Copco equipment';
 const visualClass='campaign-visual'+(isTradeShow?' campaign-visual--booth':'');
 const steps=c.steps.map(([title,body,icon])=>'<li><span class="strategy-step-icon">'+ICONS[icon]+'</span><b>'+title+'</b><p>'+body+'</p></li>').join('');
 const advertisingNote=[1,2].includes(i)?'<details class="audience-note"><summary>How personalization becomes advertising</summary><p>Goal Pulse Check results guide eligible audience segments and personalized creative. Ad delivery depends on consent, permitted first-party data, audience matching, minimum audience size and account eligibility. It does not guarantee an ad to a named individual. No ad account is connected to this demonstration.</p><p><a href="https://www.linkedin.com/help/linkedin/answer/a420552" target="_blank" rel="noopener">LinkedIn retargeting requirements ↗</a><br><a href="https://support.google.com/google-ads/answer/6299717?hl=en" target="_blank" rel="noopener">Google Customer Match requirements ↗</a></p></details>':'';
 const d=showDetails(c.name+' / the role in the system','<div class="campaign-card" style="--channel:'+c.color+';--channel-light:'+c.light+'"><div class="campaign-platform"><b>'+c.icon+'</b><span>'+c.name+' / CAMPAIGN CONCEPT</span></div><div class="'+visualClass+'"><img src="'+visualSrc+'" alt="'+visualAlt+'"><span>'+c.headline+'</span></div><p>'+c.activity+'</p></div><div class="campaign-context"><h3>Who it reaches</h3><p>'+c.audience+'</p><ol class="strategy-steps">'+steps+'</ol>'+(c.quote?'<blockquote class="outreach-example">'+c.quote+'<small>Illustrative sales introduction</small></blockquote>':'')+'<h3>The intended outcome</h3><p>'+c.next+'</p>'+advertisingNote+'</div><div class="channel-demo-action"><button class="btn dark" id="channel-send">Show this path in the lead journey <span>→</span></button><p class="form-hint">Returns to the journey and animates an illustrative '+c.name.toLowerCase()+' lead. No outreach is sent.</p></div>');
 document.querySelector('#channel-send').onclick=()=>{d.close();onSend(i);};
}

export function outcomeDetail(i){
 const c=OUTCOMES[i];
 showDetails(c.title+' / why it matters','<div class="outcome-summary"><span class="outcome-detail-icon">'+c.icon+'</span><span class="eyebrow">'+(c.conditional?'A CONDITIONAL SALES STEP':'A REQUIRED SHARED MILESTONE')+'</span><h3>'+c.summary+'</h3><p>'+c.body+'</p></div><ol class="strategy-steps">'+c.steps.map((s,n)=>'<li><b>0'+(n+1)+'</b><p>'+s+'</p></li>').join('')+'</ol><div class="goal-explainer"><b>'+c.meaning+'</b><p>Every traveling dot follows the same required path through C4C, the personalized equipment brief and accountable sales ownership. Walkthrough only activates when requested or qualified. Personalized email and eligible retargeting continue alongside that owned path.</p></div><p class="form-hint">Illustrative activity, not actual performance or a forecast. Production outcomes would need verified activity records and a configured C4C connection. Retargeting also requires consent and platform eligibility.</p>');
}
