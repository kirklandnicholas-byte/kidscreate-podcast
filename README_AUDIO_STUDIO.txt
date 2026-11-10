KIDSCREATE V6 — MULTITRACK AUDIO STUDIO
======================================

WHAT IS INCLUDED
- Existing V5 Podcast Studio, planning, recording, AI function, gallery demo, and sound effects library
- NEW: mixer.html + mixer.js, a genuine browser multitrack mixing interface
- Voice / Sound effects / Background tracks
- 31 original synthesized sound effects in sounds/
- Import voice recordings already created in Podcast Studio
- Upload audio from a device; trim by setting in/out times; move clips by dragging
- Volume and fade-in/fade-out per clip; overlapping audio playback
- Offline audio mixing and export as one WAV file

PUBLISH TO THE EXISTING NETLIFY SITE
1. Extract the ZIP locally.
2. Upload the CONTENTS of the extracted KidsCreate_V6_Audio_Studio folder (not the ZIP) to the ROOT of your existing kidscreate-podcast GitHub repository. Preserve the netlify/functions folder.
3. Commit the files and allow the existing Netlify Git deployment to publish.
4. Open https://kidscreate-studio.netlify.app/mixer.html (assuming that is still your site address).
5. Also try studio.html, record a clip there, then select 'Open Audio Mixer' and 'Import my Studio recordings'.

HOW TO USE
- You can also start with 'Try a sample mix' to hear 3 sound effects overlapping.
- Add effects from the browser library, or upload audio using the button.
- Tap any clip to edit track, start time, volume, fades, and trim ranges.
- Drag a clip horizontally to change its start time.
- Preview full mix and Download finished WAV.
- Draft mixer arrangements save in THIS browser only (localStorage); local audio files use IndexedDB. No cloud uploads or student sharing are enabled in this release.

LIMITATIONS
- Generated sound effects are stylized original synthetic sounds, not field recordings.
- On iPads keep projects short; 10-minute max export to reduce memory pressure. Very large mixes may fail on low-memory devices.
- A separate mixer is used for non-destructive editing, so the original Podcast Studio clips are not modified by mixer edits.
- This is still an adult-tested prototype. No safe student authentication, moderation, publication or shared cloud saving is implemented. Do not open public student submissions yet.
- Netlify API key is never included in this download. Existing Netlify function settings carry over if you preserve netlify/functions.

TROUBLESHOOTING
- Run on Netlify HTTPS, not by double-clicking mixer.html from disk. The sound catalog uses fetch() and browser storage.
- If 'Import my Studio recordings' finds none: record some audio on studio.html in the same browser and site domain.
- If an audio format cannot be decoded, convert it to WAV and try again.
- Don't put private student information in AI prompts or uploaded recordings without safeguards and required consents.
