# Tamago

Stranger-matching chat, but pairing is driven by taste compatibility instead of randomness. Built from real Spotify and YouTube history data.

## What this is
Like Omegle, but the moment you're paired with a stranger, you see a compatibility score, shared interests, and blind spots — content the other person consumes that you never do. Same underlying engine as the Digital Shadow project, repointed at connecting people instead of just profiling them.

## Demo scope (4-hour build)
This is a hackathon MVP. Deliberately cut:
- No live queue / real-time matchmaking — pairs are precomputed from real data in `data/matches.json`
- No auth, no persistence
- One matching mode only (no Sync/Shuffle toggle)
- Report/skip button is visual only, no backend logic
- Desktop only, no mobile layout

## Structure
```
tamago/
  server/       Socket.io chat server (real-time piece)
  client/       Queue -> match reveal -> chat UI
  data/         Precomputed compatibility pairs from real dataset
```

## Flow
1. **Queue screen** — fake loading state (~3-5s), "finding your frequency"
2. **Match reveal** — pulls a random pair from `data/matches.json`, shows compatibility %, shared interests, blind spots for both users
3. **Chat** — two Socket.io clients in the same hardcoded room, basic message bubbles, report/skip button (visual only)

## Setup
```
cd server && npm install && npm start
cd client && npm install && npm run dev
```

## Data note
`data/matches.json` is derived from real overlap in `youtube_watch_log.csv` (video-ID co-occurrence between the most active users, ranked by percentile within the dataset). Shared-interest labels are placeholders — real video titles/topics need YouTube API or oEmbed resolution, not done for this demo.
