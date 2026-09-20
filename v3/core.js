(function (root) {
  'use strict';
  const DAY = 86400000;
  const CLOSED = ['Won', 'Lost'];
  const owners = ['Alex Morgan', 'Jordan Ellis', 'Sam Rivera'];
  const sources = ['Trade show', 'LinkedIn', 'YouTube', 'Website', 'Referral'];
  function sampleLeads(now) {
    return [
      {id:'APE-101',company:'North crew · sample',source:'Trade show',owner:owners[0],stage:'New',application:'Construction',value:42000,next:'Accept and contact',due:now-2*DAY,created:now-3*DAY,route:'Direct',history:[]},
      {id:'APE-102',company:'Utility crew · sample',source:'LinkedIn',owner:owners[1],stage:'Contacted',application:'Cable installation',value:68000,next:'Confirm site visit',due:now+DAY,created:now-2*DAY,route:'Direct',history:[]},
      {id:'APE-103',company:'Fleet team · sample',source:'Referral',owner:owners[2],stage:'Partner pending',application:'Rental fleet',value:35000,next:'Obtain partner acceptance',due:now-DAY/2,created:now-2*DAY,route:'Partner',history:[]},
      {id:'APE-104',company:'Civil team · sample',source:'Website',owner:owners[0],stage:'Quoted',application:'Construction',value:87000,next:'Review specification',due:now+2*DAY,created:now-5*DAY,route:'Direct',history:[]},
      {id:'APE-105',company:'Energy crew · sample',source:'YouTube',owner:owners[1],stage:'Visit complete',application:'Industrial maintenance',value:56000,next:'Prepare quote',due:now+DAY,created:now-4*DAY,route:'Direct',history:[]},
      {id:'APE-106',company:'South crew · sample',source:'Trade show',owner:owners[2],stage:'Won',application:'Construction',value:64000,next:'Closed',due:null,created:now-10*DAY,route:'Direct',history:[]}
    ].map(l=>({...l,history:[{at:l.created,text:'Sample record loaded for this demonstration',kind:'Sample data'}]}));
  }
  function status(l,now) {
    if (CLOSED.includes(l.stage)) return {label:'Closed',tone:'neutral'};
    if (!l.owner) return {label:'Unassigned',tone:'red'};
    if (!l.next || !l.due) return {label:'Missing next step',tone:'red'};
    if (l.due+DAY<now) return {label:'Manager escalation',tone:'red'};
    if (l.due<now) return {label:'Overdue',tone:'red'};
    if (l.stage==='Partner pending') return {label:'Awaiting partner',tone:'amber'};
    return {label:'On track',tone:'green'};
  }
  function stats(leads,now) {
    const open=leads.filter(l=>!CLOSED.includes(l.stage));
    return {total:leads.length,open:open.length,overdue:open.filter(l=>l.due<now||!l.due||!l.owner).length,partners:open.filter(l=>l.stage==='Partner pending').length,pipeline:open.reduce((s,l)=>s+l.value,0),won:leads.filter(l=>l.stage==='Won').reduce((s,l)=>s+l.value,0),coverage:open.length?Math.round(open.filter(l=>l.owner&&l.next&&l.due).length/open.length*100):100};
  }
  function recommendation(a) {
    const electric=a.power==='Electric available';
    const detail=a.application==='Cable installation'?'Airflow, pressure and cable-installation method':a.application==='Rental fleet'?'Fleet duty cycle, serviceability and utilization':a.application==='Industrial maintenance'?'Air quality, pressure and site restrictions':'Tool demand, pressure and simultaneous tool use';
    return {family:electric?'Explore E-Air electric compressors':'Explore mobile diesel compressors',image:electric?'electric-compressor.jpg':'pneumatic-tools.jpg',reason:electric?'You have site power available. An electric mobile compressor is a useful starting point for the conversation.':'A mobile diesel compressor is a useful starting point where suitable site power is unavailable or still unknown.',detail,route:a.intent==='Rent for a project'?'Rental partner':'Portable Air specialist'};
  }
  function createLead(a,now,number) {
    return {id:'APE-'+number,company:a.company||'Your project · sample',source:a.source||'Trade show',owner:owners[number%owners.length],stage:'New',application:a.application,value:0,next:'Accept and validate requirements',due:now+DAY,created:now,route:a.intent==='Rent for a project'?'Rental review':'Direct',intent:a.intent,power:a.power,history:[{at:now,text:'Needs finder completed; internal owner assigned; product fit awaits specialist validation',kind:'System event'}]};
  }
  function act(lead,input,now) {
    if(CLOSED.includes(lead.stage)) return {error:'This record is closed. Select an open inquiry.'};
    if(!lead.owner) return {error:'An internal owner is required before recording progress.'};
    if(!input.note || input.note.trim().length<8) return {error:'Add an outcome of at least 8 characters so the next person knows what happened.'};
    const action=input.action;
    const map={accept:'Accepted',contact:'Contacted',visit:'Visit complete',partner:'Partner pending',partner_accept:'Partner accepted',quote:'Quoted',won:'Won',lost:'Lost',nurture:'Nurture'};
    if(!map[action]) return {error:'Choose a valid action.'};
    if(action==='accept' && lead.stage!=='New') return {error:'Ownership is already accepted or the lead has progressed. Log the next activity.'};
    if(['visit','quote','won'].includes(action)&&['New','Accepted'].includes(lead.stage)) return {error:'Record the first customer contact before advancing this inquiry.'};
    if(action==='partner_accept' && lead.stage!=='Partner pending') return {error:'Record a partner handoff before confirming acceptance.'};
    if(action==='partner' && !input.partner?.trim()) return {error:'Name the receiving partner. The internal owner remains accountable.'};
    if(lead.stage==='Partner pending' && ['visit','quote','won'].includes(action)) return {error:'The partner must accept the handoff before it can advance.'};
    if(action==='won' && lead.stage!=='Quoted') return {error:'Record a quote before marking an opportunity won.'};
    if(['quote','won'].includes(action)&&!(Number(input.value)>0)) return {error:'Enter a positive quoted or booked value.'};
    if(!['won','lost'].includes(action) && (!input.next?.trim() || !Number.isFinite(input.due) || input.due<=now)) return {error:'An open inquiry needs a next action and a due date after the demo clock.'};
    const closed=['won','lost'].includes(action);
    const updated={...lead,stage:map[action],next:closed?'Closed':input.next.trim(),due:closed?null:input.due,value:['quote','won'].includes(action)?Number(input.value):lead.value,route:action==='partner'?'Partner':lead.route,partner:action==='partner'?input.partner.trim():lead.partner,history:[...lead.history,{at:now,text:map[action]+': '+input.note.trim(),kind:action==='partner_accept'?'Partner acknowledgment · simulated':'Rep reported'}]};
    return {lead:updated};
  }
  function model({leads,qualification,quoteRate,winRate,averageValue,coverage}) {
    const q=leads*qualification/100;
    const quotes=q*coverage/100*quoteRate/100;
    const wins=quotes*winRate/100;
    return {qualified:q,quotes,wins,revenue:wins*averageValue};
  }
  const api={DAY,CLOSED,owners,sources,sampleLeads,status,stats,recommendation,createLead,act,model};
  if(typeof module!=='undefined'&&module.exports) module.exports=api;
  else root.DemoCore=api;
})(typeof globalThis!=='undefined'?globalThis:this);
