// Minimal page-view/click log for this standalone GitHub Pages proposal.
// Writes only (insert-only RLS) to a dedicated Supabase table, separate from
// the real zahbrandsolutions.com analytics. No location beyond the visitor's
// own browser timezone; no cookies; nothing read back to the page.
const ENDPOINT='https://prwwevwjnpyztnkuypoa.supabase.co/rest/v1/atlas_copco_events';
const KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByd3dldndqbnB5enRua3V5cG9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMDM5NDIsImV4cCI6MjA5NDY3OTk0Mn0.7UMQdYaIaoG62IAlgWj5RZQWvfK1Fs6D6tyUAPb8ryk';

function sessionId(){
 try{
  let id=sessionStorage.getItem('acw-sid');
  if(!id){id=(crypto.randomUUID?crypto.randomUUID():Date.now()+'-'+Math.random().toString(36).slice(2));sessionStorage.setItem('acw-sid',id)}
  return id;
 }catch{return 'no-storage'}
}

function send(event_type,label,detail){
 const body=JSON.stringify({
  session_id:sessionId(),
  event_type,
  label:label?String(label).slice(0,200):null,
  detail:detail?String(detail).slice(0,300):null,
  referrer:document.referrer?document.referrer.slice(0,300):null,
  timezone:Intl.DateTimeFormat().resolvedOptions().timeZone||null,
  viewport:innerWidth+'x'+innerHeight,
  user_agent:navigator.userAgent.slice(0,200)
 });
 fetch(ENDPOINT,{method:'POST',keepalive:true,headers:{'Content-Type':'application/json',apikey:KEY,Authorization:'Bearer '+KEY,Prefer:'return=minimal'},body}).catch(()=>{});
}

export function mountTracker(){
 send('pageview',location.hash||'/',document.referrer?'from referrer':'direct/link');
 document.addEventListener('click',e=>{
  const el=e.target.closest('a,button');
  if(!el)return;
  const label=(el.getAttribute('aria-label')||el.textContent||'').trim().replace(/\s+/g,' ').slice(0,120);
  const detail=el.tagName==='A'?el.getAttribute('href'):el.id?'#'+el.id:(typeof el.className==='string'?el.className.split(' ')[0]:'');
  send('click',label,detail);
 },{capture:true});
 return {
  onScene(experience){send('section',experience)}
 };
}
