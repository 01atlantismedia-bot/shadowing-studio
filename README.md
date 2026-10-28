# Shadowing Studio

A responsive student speaking studio with Discover, Practice Studio, My Recordings, and Appearance routes. Four palettes are available: Paper, Forest, Clay, and Midnight.

## Practice

Choose a curated talk or paste a YouTube link. Captions load automatically when YouTube makes them available. Select a caption to seek to its timestamp, listen to that phrase, and record your own voice. Videos without accessible captions offer a manual transcript fallback. This app retrieves captions; it does not generate speech recognition transcripts for videos without captions.

Recordings support browser playback, downloads, cloud saving, deletion, and a 1–5 self-rating. Audio uses Netlify Blobs; recording metadata and ratings use Netlify Database with Drizzle. A secure, HttpOnly cookie identifies a private library for the current browser. Clearing cookies disconnects access to the library; cross-device accounts are not included. Unsaved takes remain available while navigating within the app, but must be saved or downloaded before refreshing or closing the page. Recording requires microphone permission and HTTPS (or localhost).

## Development

Install dependencies with `npm install`. Run `netlify dev --port 8889` for local platform emulation. The published directory is `public/`; server endpoints live in `netlify/functions/`. No frontend compilation is required. Database migrations live in `netlify/database/migrations/` and are applied by the platform during deployment.

Validate server types with:

```
npx tsc --noEmit --module nodenext --moduleResolution nodenext --target es2022 --skipLibCheck db/index.ts db/schema.ts netlify/functions/recordings.mts netlify/functions/transcript.mts drizzle.config.ts
```
