KIDSCREATE V7 — LOGIN AND CLASSROOM TEST
===========================================
IMPORTANT: This build is a DEMO authentication/workflow preview, not a secure school deployment.
No real students should be registered or recorded until verified child-safety and data safeguards are implemented.

CONTENTS
  index.html              KidsCreate homepage
  access.html             Login + working demo dashboards + optional adult Supabase sign-in
  studio.html             Existing Podcast Studio, AI Coach, word-bank script writer and recording
  gallery.html            Existing local Podcast Gallery DEMO (not public sharing)
  supabase-config.js      Public config placeholders (not required for demo logins)
  netlify.toml            Hosting configuration
  netlify/functions/creative-coach.js  Existing server-side OpenAI connection

SOUND EFFECTS / MIXER REMOVED
  No sounds.html, mixer.html, sounds.json, mixer.js, sounds/ directory,
  sound navigation or editor integration in this package.

DEMO ACCOUNT DETAILS (fictional, hard-coded, NOT secure)

  Student A      explorer               Create2026!
  Student B      storyteller             Create2026!
  Teacher        teacher@kidscreate.demo Teach2026!
  Parent         parent@kidscreate.demo  Parent2026!

TEST THE FLOW ON THE SAME COMPUTER / BROWSER
  1. Open access.html and select Student; click Fill example details and Sign in.
  2. Edit the Nature Detectives podcast title or script; click Save group draft.
  3. Click Submit to teacher.
  4. Sign out, choose Teacher and use the teacher credentials.
  5. Open the Nature Detectives project; read the student's script; Approve or Return.
  6. Sign out, choose Parent and view Ava's linked podcast read-only.
  7. Go to Studio, write a script, then return to Student and Import Studio script.
  8. Optionally export a WAV in Studio, upload it from Student dashboard;
     teacher should hear that same locally stored audio using the same browser.

ALL demo changes are stored in browser localStorage / IndexedDB. Other devices do NOT share these changes.
WARNING: credentials are intentionally visible in public HTML for demo testing ONLY.

OPTIONAL REAL SUPABASE ADULT EMAIL AUTH
  1. Supabase project: Dashboard > Project Settings > API Keys / Data API.
  2. Edit supabase-config.js: set your real project URL and PUBLIC PUBLISHABLE key.
     NEVER paste a service-role key, Supabase secret key or OpenAI key here.
  3. Supabase Auth > URL Configuration: set Site URL to your Netlify domain,
     and add https://kidscreate-studio.netlify.app/access.html as redirect URL.
  4. Deploy. On access.html select Real adult email login (optional).
  5. This supports email signup, signin, reset-request, and signout only.
     Adult permissions, verified school roles, RLS, parent-child relationships,
     individual student accounts and online saving are NOT implemented.
     Your configured Supabase project must be active and allow email auth.

NETLIFY / GITHUB DEPLOYMENT
  1. Extract the ZIP first.
  2. REPLACE your site's index.html, access.html, studio.html and gallery.html.
  3. Keep supabase-config.js and netlify.toml at the repository ROOT.
  4. Keep netlify/functions/creative-coach.js in that nested location.
  5. DELETE obsolete files from the repository: sounds.html, mixer.html,
     sounds.json, mixer.js and the sounds/ directory.
     (Uploading this ZIP will NOT automatically delete old files on GitHub!)
  6. Commit changes; Netlify should automatically deploy. Check Published.
  7. Visit /access.html and verify fictional demo logins.

SECURITY AND LIMITATIONS
  - Hard-coded demo logins are a UX prototype, not authentication.
  - Never put real names, school details, identifiable children's voices or recordings into this test.
  - Demo approval is local only; no public publishing or cross-device uploads.
  - Existing AI function should be restricted before children use it (auth, rate limiting, moderation and spending controls).
  - For actual student accounts, implement teacher-managed enrollment, verified adult consent,
    school/parent role assignment and permission checks enforced server-side with Supabase RLS.
  - Real adult Supabase sign-in is tested only after your own project's public config is entered.
