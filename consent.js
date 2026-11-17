const $=id=>document.getElementById(id);
const cfg=window.KIDSCREATE_SUPABASE||{};
const key=String(cfg.publishableKey||cfg.anonKey||'').trim();
const show=(id,visible)=>$(id).classList.toggle('hidden',!visible);
const report=(id,text,error=false)=>{$(id).textContent=text;$(id).className='status '+(error?'error':'ok');};
let client=null,currentUser=null;
async function refresh(){
 const {data,error}=await client.auth.getUser();currentUser=error?null:data.user;
 show('signedOut',!currentUser);show('signedIn',!!currentUser);show('consentPanel',!!currentUser);
 if(currentUser){$('loginIdentity').textContent='Signed in as '+(currentUser.email||'authenticated user');report('loginStatus','Email account connected. You can save your decision.');}
 else report('loginStatus','Enter your adult email to receive a sign-in link.');
}
const valid=/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(cfg.url||'')&&/^(sb_publishable_|eyJ)/.test(key);
if(!valid){report('loginStatus','Supabase is not connected. Check supabase-config.js.',true);$('sendLink').disabled=true;}
else{
 try{const {createClient}=await import('https://esm.sh/@supabase/supabase-js@2.49.10');client=createClient(cfg.url,key);await refresh();client.auth.onAuthStateChange(()=>setTimeout(refresh,0));}
 catch(e){report('loginStatus','Could not connect: '+e.message,true);$('sendLink').disabled=true;}
}
$('sendLink').onclick=async()=>{
 const email=$('email').value.trim();if(!email||!$('email').checkValidity()){report('loginStatus','Enter a valid adult email address.',true);return;}
 $('sendLink').disabled=true;try{
 const redirectTo=new URL('consent.html',location.href).href;
 const {error}=await client.auth.signInWithOtp({email,options:{emailRedirectTo:redirectTo,shouldCreateUser:true}});
 if(error)throw error;report('loginStatus','Check your inbox. Use the newest sign-in link, then return to this form.');
 }catch(e){report('loginStatus','Could not send email: '+e.message,true);}finally{$('sendLink').disabled=false;}
};
$('signOut').onclick=async()=>{await client.auth.signOut();show('donePanel',false);await refresh();};
$('consentForm').onsubmit=async(event)=>{
 event.preventDefault();if(!currentUser){report('saveStatus','Please sign in first.',true);return;}
 const alias=$('childAlias').value.trim(),group=$('classLabel').value.trim();
 const role=document.querySelector('input[name="role"]:checked')?.value;
 if(!alias||!$('privateConsent').checked||!$('adultDeclaration').checked){report('saveStatus','Complete all required fields and checkboxes.',true);return;}
 const consent={adult_user_id:currentUser.id,adult_role:role,child_alias:alias,class_label:group||null,recording_consent:true,public_consent:$('publicConsent').checked,declaration_confirmed:true,consent_version:'kidscreate-v1'};
 $('save').disabled=true;
 try{const {data,error}=await client.from('kc_adult_consents').insert(consent).select('id,public_consent,created_at').single();if(error)throw error;
 $('consentRef').textContent=data.id;$('doneText').textContent=`Your ${data.public_consent?'recording and public-sharing':'recording-only'} decision was saved on ${new Date(data.created_at).toLocaleDateString()}. Public podcast approval remains a separate teacher decision.`;
 show('consentPanel',false);show('donePanel',true);report('saveStatus','Saved.');
 }catch(e){report('saveStatus','Could not save: '+e.message+'. Confirm you ran the consent SQL setup.',true);}finally{$('save').disabled=false;}
};
$('another').onclick=()=>{show('donePanel',false);$('consentForm').reset();show('consentPanel',true);};
