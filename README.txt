KidsCreate Podcast Studio V4 — AI Word Bank Script Writer

CHANGES
- Script step includes a word bank and AI podcast generator.
- Choose explain/teach, storytelling, or interview style, and 1/2/3 minutes.
- AI returns an introduction, main section, and ending, which can be inserted into the editable script.
- Creative Coach stays closed until requested.
- AI connection check distinguishes missing function from missing API key.
- Netlify function returns actionable errors for invalid API keys, quotas, and model problems.

DEPLOYMENT TO YOUR EXISTING NETLIFY SITE (GITHUB REPOSITORY)
1. In GitHub, open the repository that Netlify deploys for KidsCreate.
2. Replace the existing index.html and netlify.toml with these V4 files.
3. Replace netlify/functions/creative-coach.js with this V4 file, preserving folders.
4. Commit the changes to your deployed branch (usually main).
5. Netlify should redeploy. Open Netlify > Deploys and confirm Published.
6. In Netlify > Project configuration > Environment variables, add OPENAI_API_KEY with your OpenAI API project's secret key. The scope must include Functions. Optionally set OPENAI_MODEL to a model accessible to your API project; default is gpt-4.1-mini.
7. After changing environment variables trigger a fresh deploy.
8. Open YOURSITE/.netlify/functions/creative-coach in a browser. It should show JSON with configured:true. This only proves that the function is deployed and a key is present; it does not verify whether the key is valid or has billing credits.
9. In the website, go to step 3 (Script), enter keywords and click Check AI connection, then Generate my script. Use this script in my editor to copy sections to the editable form.

IMPORTANT: Uploading only index.html with Netlify's drag/drop deploy does NOT create the serverless AI function. Use Git-linked deployment with the complete project; do not move the netlify/functions folder.

TROUBLESHOOTING
- The connection button says function not found: wrong GitHub branch, incorrect function folder, or deployed only static HTML. Check Netlify function logs and file tree.
- configured:false: add OPENAI_API_KEY to Netlify environment variables (Functions scope), then redeploy.
- Invalid API key: regenerate a key in your OpenAI Platform project and update the Netlify environment variable.
- Quota or rate limit: verify your OpenAI API billing and project usage limits. ChatGPT subscription is separate.
- Model/request error: select an available model via OPENAI_MODEL and redeploy.
- To inspect errors: Netlify dashboard > Logs > Functions > creative-coach.

PRIVACY AND SAFETY
This is a development prototype, NOT a public student-ready platform. It has no student authentication, approved parental consent workflow, rate limiting, or moderation system for public student use. Anyone with access to an unprotected public endpoint may generate API charges. Limit access and build authentication, safeguarding, and abuse protection before classroom/public launch. Do not enter student names, school addresses, or other personal details. Online word banks and topic metadata are sent to OpenAI through a server-side endpoint. AI outputs may contain errors; ask an adult to review factual claims. Do not put OPENAI_API_KEY in HTML, code repositories, or chat messages.

TESTING
JavaScript syntax checked with Node.js; handler tested locally with mocked OpenAI requests (successful script and question responses, missing-key and invalid-key diagnostics). A live deployed site and actual OpenAI API key were not available in this workspace, so actual live AI generation and microphone recording require your testing.
