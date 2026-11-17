// KidsCreate V11 — adult-managed publishing, public approved listening.
const $=id=>document.getElementById(id);
const cfg=window.KIDSCREATE_SUPABASE||{};
const apiKey=String(cfg.publishableKey||cfg.anonKey||'').trim();
const BUCKET='kidscreate-podcasts';
const allowedExt={'audio/wav':'wav','audio/x-wav':'wav','audio/wave':'wav','audio/mpeg':'mp3','audio/mp3':'mp3','audio/webm':'webm','audio/ogg':'ogg','audio/mp4':'m4a','audio/x-m4a':'m4a'};
let client=null,user=null,teacherGroups=[],homeConsents=[],published=[],schoolQueue=[],homeQueue=[];
const show=(id,yes)=>$(id).classList.toggle('hidden',!yes);
const status=(id,msg,error=false)=>{const n=$(id);n.textContent=msg;n.classList.toggle('error',error);n.classList.toggle('success',!error);};
const elt=(tag,css,text)=>{const n=document.createElement(tag);if(css)n.className=css;if(text!==undefined)n.textContent=text;return n;};
const genuineAdult=()=>user&&!user.is_anonymous&&!!user.email;
function empty(root,message){root.replaceChildren(elt('p','empty',message));}
async function audioUrl(path){const {data,error}=await client.storage.from(BUCKET).createSignedUrl(path,300);if(error)throw error;return data.signedUrl;}
function player(path){const root=elt('div');const btn=elt('button','secondary','Load audio player');btn.type='button';root.append(btn);btn.onclick=async()=>{btn.disabled=true;btn.textContent='Loading…';try{const a=elt('audio');a.controls=true;a.preload='metadata';a.src=await audioUrl(path);root.replaceChildren(a);}catch(e){btn.disabled=false;btn.textContent='Retry playback';status('connectStatus','Playback failed: '+e.message,true);}};return root;}
async function loadPublished(){
 const fields='id,title,creator,description,age,category,audio_path,created_at';
 const results=await Promise.all([
  client.from('kc_podcasts').select(fields).eq('status','approved').order('created_at',{ascending:false}).limit(120),
  client.from('kc_home_podcasts').select(fields).eq('status','approved').order('created_at',{ascending:false}).limit(120)
 ]);
 const err=results.find(x=>x.error)?.error;
 if(err){status('connectStatus','Live Gallery cannot load: '+err.message+' — confirm V11 SQL is installed.',true);empty($('published'),'Gallery unavailable.');return;}
 published=[...(results[0].data||[]),...(results[1].data||[])].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at)).slice(0,120);
 status('connectStatus',`Live Gallery connected · ${published.length} approved podcast(s).`);drawPublished();
}
function drawPublished(){
 const q=$('search').value.trim().toLowerCase(),age=$('age').value,cat=$('category').value;
 const data=published.filter(p=>(age==='all'||age===p.age)&&(cat==='all'||cat===p.category)&&[p.title,p.creator,p.description,p.category].join(' ').toLowerCase().includes(q));
 const root=$('published');root.replaceChildren();if(!data.length){empty(root,'No published podcasts match yet.');return;}
 for(const item of data){const card=elt('article','card');card.append(elt('span','pill',item.category),elt('h3','',item.title),elt('p','muted',item.description),elt('p','small muted',`Ages ${item.age} · ${item.creator}`),player(item.audio_path));root.append(card);}
}
function renderMode(){
 const home=$('mode').value==='home';show('homeConsentWrap',home);show('schoolGroupWrap',!home);
 $('podCreator').readOnly=home;
 if(home){let option=$('homeConsent').selectedOptions[0];$('podCreator').value=option?.dataset.alias||'';}
 else {$('podCreator').readOnly=false;}
 $('submitButton').textContent=home?'Submit privately for parent approval':'Submit privately for teacher review';
}
async function loadSession(){
 if(!client)return;
 const {data,error}=await client.auth.getUser();user=error?null:data.user;
 teacherGroups=[];homeConsents=[];show('podcastForm',false);show('schoolReviewPanel',false);show('homeReviewPanel',false);
 show('adultLogin',!genuineAdult());show('adultSignedIn',!!genuineAdult());
 if(!genuineAdult()){
   status('sessionStatus','Browse and create free without signing in. A parent or teacher must sign in to upload or publish.');
   return;
 }
 $('adultIdentity').textContent='Signed in as '+user.email;
 const [groupsRes,consentsRes]=await Promise.all([
   client.from('kc_v9_groups').select('id,name,teacher_id').eq('teacher_id',user.id),
   client.from('kc_adult_consents').select('id,adult_role,child_alias,recording_consent,public_consent,created_at').eq('adult_role','parent').order('created_at',{ascending:false})
 ]);
 if(groupsRes.error||consentsRes.error){status('sessionStatus','Account connected but project setup is incomplete: '+(groupsRes.error||consentsRes.error).message,true);return;}
 teacherGroups=groupsRes.data||[];homeConsents=consentsRes.data||[];
 const group=$('podGroup');group.replaceChildren();teacherGroups.forEach(g=>{const opt=elt('option','',g.name);opt.value=g.id;group.append(opt);});
 const selected=new Set();const menu=$('homeConsent');menu.replaceChildren();
 homeConsents.forEach(c=>{if(selected.has(c.child_alias.toLowerCase()))return;selected.add(c.child_alias.toLowerCase());const opt=elt('option','',`${c.child_alias} · ${c.public_consent?'public sharing allowed':'private only'}`);opt.value=c.id;opt.dataset.alias=c.child_alias;menu.append(opt);});
 $('mode').replaceChildren();
 if(teacherGroups.length){const opt=elt('option','','School / Classroom');opt.value='school';$('mode').append(opt);}
 const opt=elt('option','','Home / Family');opt.value='home';$('mode').append(opt);
 if(!teacherGroups.length)$('mode').value='home';
 show('podcastForm',true);renderMode();
 status('sessionStatus',`Adult account connected. ${teacherGroups.length} teacher group(s), ${homeConsents.length} saved parent consent record(s).`);
 if(teacherGroups.length){show('schoolReviewPanel',true);const r=$('reviewGroup');r.replaceChildren();teacherGroups.forEach(g=>{const opt=elt('option','',g.name);opt.value=g.id;r.append(opt);});await loadSchoolQueue();}
 await loadHomeQueue();
}
async function sendEmail(){
 const email=$('adultEmail').value.trim();if(!$('adultEmail').checkValidity()||!email){status('loginMessage','Enter a valid adult email address.',true);return;}
 $('sendLink').disabled=true;
 try{const {error}=await client.auth.signInWithOtp({email,options:{emailRedirectTo:new URL('gallery.html',location.href).href,shouldCreateUser:true}});if(error)throw error;status('loginMessage','Check the inbox for your sign-in link. Use the newest link.');}
 catch(e){status('loginMessage','Could not send email: '+e.message,true);}
 finally{$('sendLink').disabled=false;}
}
function validFile(file){if(!file)throw Error('Choose an audio recording.');if(file.size<100||file.size>20*1024*1024)throw Error('Audio must be between 100 bytes and 20 MB.');const ext=file.name.toLowerCase().match(/\.(wav|mp3|webm|ogg|m4a)$/)?.[1]||allowedExt[file.type];if(!ext||!Object.keys(allowedExt).includes(file.type))throw Error('Use WAV, MP3, WebM, OGG or M4A audio.');return ext;}
async function submitPodcast(event){
 event.preventDefault();$('submitButton').disabled=true;
 try{
  const {data,error}=await client.auth.getUser();if(error||!data.user||data.user.is_anonymous||!data.user.email)throw Error('An adult must sign in.');
  const file=$('podAudio').files[0],ext=validFile(file),home=$('mode').value==='home';
  if(!$('podConsent').checked)throw Error('Confirm that you are an authorised adult who reviewed this recording.');
  const id=crypto.randomUUID(),path=`${id}/audio.${ext}`;
  const basic={id,uploader_id:data.user.id,title:$('podTitle').value.trim(),creator:$('podCreator').value.trim(),description:$('podDescription').value.trim(),age:$('podAge').value,category:$('podCategory').value,audio_path:path,status:'pending'};
  let table,payload;
  if(home){
   const consent=homeConsents.find(c=>c.id===$('homeConsent').value);
   if(!consent)throw Error('First complete the parent consent page for this child.');
   table='kc_home_podcasts'; const {uploader_id,...rest}=basic;payload={...rest,owner_id:data.user.id,consent_id:consent.id};
  } else {
   const g=teacherGroups.find(g=>g.id===$('podGroup').value);if(!g)throw Error('Only a teacher may upload a classroom recording.');
   table='kc_podcasts';payload={...basic,group_id:g.id};
  }
  status('uploadStatus','Creating a private submission…');
  const inserted=await client.from(table).insert(payload);if(inserted.error)throw inserted.error;
  status('uploadStatus','Uploading the recording privately…');
  const uploaded=await client.storage.from(BUCKET).upload(path,file,{upsert:false,contentType:file.type});if(uploaded.error)throw Error(uploaded.error.message+' (private metadata entry may need to be rejected)');
  status('uploadStatus',home?'Saved privately. Review it in your Family queue before publishing.':'Saved privately. Teacher can approve it below.');
  $('podAudio').value='';$('podConsent').checked=false;
  await Promise.all([loadSchoolQueue(),loadHomeQueue()]);
 }catch(e){status('uploadStatus','Upload failed: '+e.message,true);}finally{$('submitButton').disabled=false;}
}
function reviewRow(item,source){
 const row=elt('article','queue-item');row.append(elt('h3','',item.title),elt('p','small muted',`${item.creator} · ${item.status} · Ages ${item.age}`),elt('p','muted',item.description),player(item.audio_path));
 const actions=elt('div','actions');
 if(item.status!=='approved'){const btn=elt('button','','Approve and publish');btn.type='button';btn.onclick=()=>moderate(source,item,'approved',btn);actions.append(btn);}
 if(item.status!=='rejected'){const btn=elt('button','secondary','Reject / remove from Gallery');btn.type='button';btn.onclick=()=>moderate(source,item,'rejected',btn);actions.append(btn);}
 row.append(actions);return row;
}
async function loadSchoolQueue(){
 if(!client||!teacherGroups.length)return;
 const gid=$('reviewGroup').value;if(!teacherGroups.some(g=>g.id===gid))return;
 const {data,error}=await client.from('kc_podcasts').select('id,title,creator,description,age,category,audio_path,status,created_at').eq('group_id',gid).order('created_at',{ascending:false}).limit(100);
 if(error){status('reviewStatus',error.message,true);return;}
 const root=$('reviewQueue');root.replaceChildren();if(!data.length)empty(root,'No submissions in this classroom yet.');else data.forEach(item=>root.append(reviewRow(item,'school')));
 status('reviewStatus',`${data.filter(p=>p.status==='pending').length} pending · ${data.filter(p=>p.status==='approved').length} published.`);
}
async function loadHomeQueue(){
 if(!client||!genuineAdult())return;
 const {data,error}=await client.from('kc_home_podcasts').select('id,title,creator,description,age,category,audio_path,status,created_at').eq('owner_id',user.id).order('created_at',{ascending:false}).limit(100);
 if(error){status('homeReviewStatus',error.message,true);return;}
 show('homeReviewPanel',true);const root=$('homeQueue');root.replaceChildren();if(!data.length)empty(root,'No personal podcast uploads yet.');else data.forEach(item=>root.append(reviewRow(item,'home')));
 status('homeReviewStatus',`${data.filter(p=>p.status==='pending').length} private / awaiting parent approval · ${data.filter(p=>p.status==='approved').length} public.`);
}
async function moderate(source,item,next,button){
 if(next==='approved'&&!confirm(`Publish "${item.title}" for everyone to hear? Confirm permission for EVERY child in this recording and check that no personal details are disclosed.`))return;
 if(next==='rejected'&&!confirm(`Remove or reject "${item.title}"?`))return;
 button.disabled=true;
 const table=source==='home'?'kc_home_podcasts':'kc_podcasts';
 const {error}=await client.from(table).update({status:next,reviewed_at:new Date().toISOString()}).eq('id',item.id);
 if(error){status(source==='home'?'homeReviewStatus':'reviewStatus',`Could not update: ${error.message}`,true);button.disabled=false;return;}
 await Promise.all([loadPublished(),loadSchoolQueue(),loadHomeQueue()]);
}
for(const id of ['search','age','category'])$(id).addEventListener(id==='search'?'input':'change',drawPublished);
$('mode').onchange=renderMode;$('homeConsent').onchange=renderMode;
$('sendLink').onclick=sendEmail;$('refreshSession').onclick=loadSession;$('reviewGroup').onchange=loadSchoolQueue;
$('refreshQueue').onclick=loadSchoolQueue;$('refreshHome').onclick=loadHomeQueue;
$('signOut').onclick=async()=>{await client.auth.signOut();await loadSession();};
$('podcastForm').onsubmit=submitPodcast;
const configured=/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(cfg.url||'')&&/^(sb_publishable_|eyJ)/.test(apiKey);
if(!configured){status('connectStatus','Supabase is not connected. Check supabase-config.js (url + anonKey/publishableKey).',true);$('sendLink').disabled=true;empty($('published'),'Gallery requires Supabase.');}
else try{const {createClient}=await import('https://esm.sh/@supabase/supabase-js@2.49.10');client=createClient(cfg.url,apiKey);await loadPublished();await loadSession();client.auth.onAuthStateChange(()=>setTimeout(loadSession,0));}
catch(e){status('connectStatus','Cannot start: '+e.message,true);empty($('published'),'Cannot connect.');}
