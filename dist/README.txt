foofab — static site bundle
═══════════════════════════════════════════════════

QUICK DEPLOY (no account needed):
1. Go to https://app.netlify.com/drop
2. Drag this entire folder into the drop zone
3. You'll get a public URL immediately — share away

VERCEL:
1. Sign in at https://vercel.com/new
2. Choose "Deploy without Git" (or create a repo first)
3. Drag the folder in
4. Framework preset: "Other" (no build command needed)
5. Output directory: . (current folder)

GITHUB PAGES:
1. Create a new repo, push all these files to it
2. Settings → Pages → Source: "Deploy from branch" → main / root
3. Done — your site is at <user>.github.io/<repo>

LOCAL PREVIEW:
Just open index.html in a browser. Or run:
  npx serve .
  python3 -m http.server

NOTES:
• Pure static — no backend, no build step, no npm install
• JSX is transpiled in-browser via Babel Standalone (slightly slower
  first load; fine for prototyping)
• localStorage is per-origin — your saved config and uploaded images
  stay with whoever visits, they don't travel with the URL
• Works offline once loaded
