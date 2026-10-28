# Shadowing Studio

## Deploy to Netlify
1. Put this whole folder in a GitHub repo (or use the Netlify CLI: `npm i -g netlify-cli && netlify deploy --prod`).
2. Netlify: Add new site -> Import from Git -> pick the repo. No build command needed.
3. Open the site. HTTPS is automatic, which the microphone needs.

Drag-and-drop of only index.html works for "Upload my own clip", but YouTube auto-captions need
netlify/functions/transcript.js, so deploy via Git or CLI.

## Teacher workflow
1. Paste a YouTube link, load it (captions load automatically, or paste SRT/VTT/plain text).
2. Section 3 "Make a student link": choose a 30-60 sec stretch of lines, add a title, note and focus.
3. Send the link to students (WhatsApp/Telegram). They open it and everything is ready.
   Links only work for YouTube clips (uploaded files can't be shared by link).

## Student features
- Guided mode: Listen > Mark > Shadow with text > Shadow without text > Record > Compare > Rate
- Recordings are saved on the device (IndexedDB), with dates, so "first take vs latest" shows progress
- Repeat-after-me: hands-free, plays a line, pauses for them to repeat it
- Daily streak + goal (change DAILY_GOAL near the top of the script)
- Each take has a Save button, so they can send it to you on WhatsApp

## Notes
- Recordings and progress live in each student's own browser. Clearing browser data or switching phone loses them.
- Auto-captions use the unofficial `youtube-transcript` package and may break if YouTube changes things.
- Some videos disable embedding and won't play inside the page.

## "Who should I shadow?" (recommendations)
Students pick American/British and male/female voices, get three people each, tap one and see interviews.
- The people list is the `PEOPLE` object in index.html. Change names/descriptions freely.
- To list interviews automatically you need a free YouTube Data API key:
  1. Google Cloud Console -> create a project -> enable "YouTube Data API v3" -> Credentials -> Create API key.
  2. Netlify -> Site settings -> Environment variables -> add `YOUTUBE_API_KEY` -> redeploy.
  Each search costs quota (the free daily quota allows roughly 100 searches). Results are cached for a week.
- No key? It still works: students get a "Search YouTube" link and paste the interview link back.
- Best quality: hand-pick interviews yourself. In `PEOPLE`, fill `vids:[{id:'YOUTUBE_ID',title:'...'}]` for a person
  (the ID is the 11 characters after v= in the link). Those show first and use no API quota.
- Students open the base site link to use this. Assignment links hide it so they stay on your clip.
