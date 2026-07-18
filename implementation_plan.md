# Implementation Plan — Tamago: Stranger Chat by YouTube Taste

## Overview

Tamago is a taste-based stranger-matching chat application. Instead of random pairing (like Omegle), users are matched using **real Jaccard set-overlap** computed from `youtube_watch_log.csv` — a dataset containing **1.84 million watch events** across **244 users**. The app surfaces compatibility scores, shared interests, blind spots, MBTI curation personas, and a global YouTube leaderboard — all derived dynamically from the CSV at runtime.

---

## Architecture

```
Codecathon-2026/
├── index.js                    # Node.js + Express + Socket.io server
│                                 - Parses youtube_watch_log.csv on startup
│                                 - Builds per-user video sets, category maps
│                                 - Computes Jaccard overlaps, MBTI profiles
│                                 - Compiles global leaderboard aggregates
│                                 - REST API endpoints + Socket.io chat relay
├── public/
│   ├── index.html              # Single-page app (6 screens)
│   ├── css/style.css           # Custom animations, contrast overrides
│   └── js/app.js               # Client-side state machine, Socket.io client
├── data/
│   ├── youtube_watch_log.csv   # 1.84M rows (gitignored — too large)
│   └── spotify_history.csv     # Single-user Spotify data (gitignored)
├── matches.json                # Precomputed fallback match pairs
├── package.json                # Node.js dependencies (express, socket.io, cors)
├── render.yaml                 # Render.com deployment config
├── DEPLOYMENT.md               # Step-by-step Render.com hosting guide
└── .gitignore                  # Excludes node_modules, CSV data files
```

---

## Data Pipeline (Server Startup)

On `node index.js`, the server performs these steps in ~2 seconds:

1. **CSV Parsing** — Streams `youtube_watch_log.csv` line-by-line, building:
   - `userVideos[userId]` → `Set<videoId>` (unique videos per user)
   - `videoPlaylists[videoId]` → playlist name
   - `userPlaylists[userId]` → `Map<playlist, count>`

2. **Category Mapping** — Each video ID is deterministically hashed to one of 10 content categories (Gaming Tutorials, Lofi Chill Beats, True Crime Essays, Space Exploration, Tech Reviews, Movie Analysis, ASMR Programming, Cooking Recipes, Yoga & Meditation, Travel Vlogs).

3. **Overlap Baseline** — Computes pairwise overlap coefficients for the top 20 most-active users, storing results in a sorted array for percentile ranking.

4. **MBTI Cognitive Engine** — `calculateMBTI(userId)` maps each user's category ratio to 4 Myers-Briggs dimensions:
   - **I/E** — Reflective categories (Lofi, ASMR, Space, Yoga, Movie Analysis) vs social categories
   - **N/S** — Conceptual (Movie Analysis, True Crime, Space) vs practical (Tech, Cooking)
   - **T/F** — Analytical (ASMR Programming, Tech, Gaming) vs emotional/artistic
   - **J/P** — Structured (Yoga, Cooking, Gaming Tutorials) vs open-ended

5. **Global Leaderboard** — Aggregates top categories, top playlists, and most-active users across all 1.84M events.

---

## REST API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/users` | GET | Top 20 most-active users (for dropdown selector) |
| `/api/user/:id` | GET | User profile: video count, top categories, **MBTI analysis** |
| `/api/match?user_a=X&user_b=Y` | GET | Precomputed overlap between two specific users |
| `/api/matchmake?user_a=X&mode=sync` | GET | Live matchmaking: evaluates 12 candidates, returns best/worst match with full Jaccard logs |
| `/api/stats` | GET | Global leaderboard: top categories, playlists, active users |

---

## Frontend Screens

The app is a single-page application with 6 screens managed by a JavaScript state machine:

### 1. Home / Landing (`#screen-home`)
- **User selector dropdown** — Choose from top 20 active users
- **Mode toggle** — Sync (closest match) or Shuffle (furthest match)
- **Taste DNA radar chart** — Animated SVG radar showing top 4 category affinities
- **MBTI Curation Persona card** — Dynamic MBTI type badge, 4 dimension progress bars, and a detailed analysis explanation showing how categories mapped to cognitive dimensions

### 2. Queue / Finding (`#screen-queue`)
- **Data Pipeline Terminal** — Shows real-time Jaccard calculation logs:
  - Each candidate user ID, their watch count, shared video count, raw overlap coefficient, and compatibility percentile
- **Floating category tags** — User's top interests
- **Animated scanning state** with progress indicator

### 3. Compatibility Reveal (`#screen-reveal`)
- **Circular progress ring** — Animated SVG showing overlap percentage
- **Shared grounds** — Videos/categories both users watch
- **Blind spots** — Categories the matched user watches that you don't
- **Mutual watch history** — Actual video IDs found in both sets' intersection

### 4. Chat Room (`#screen-chat`)
- **Socket.io real-time messaging** — With simulated AI replies for solo demo
- **Match Analysis sidebar** — Overlap ring, shared interests chips, pacing preference
- **Skip / Leave Room** button to return to home

### 5. Leaderboard (`#screen-stats`)
- **Top YouTube Categories** — Bar charts with view counts from the CSV
- **Most Popular Playlists** — Ranked by occurrence
- **Most Active Users** — Ranked by total videos watched

### 6. History (`#screen-history`)
- **Session match log** — Previous matches from the current session with overlap %, timestamp, and "Reopen Chat" action

---

## Interactive Features

| Feature | Implementation |
|---|---|
| **Settings modal** | Database row count (1,844,919), server port, dark/light theme toggle |
| **Notifications panel** | System alerts dropdown from bell icon |
| **Dark mode** | Full theme toggle via `body.dark` class with Tailwind dark variants |

---

## Styling & UX Decisions

- **Light mode default** — Clean white/purple Material 3 palette
- **Tailwind CSS** — Utility-first styling via CDN with custom design tokens
- **Glassmorphism** — `backdrop-blur`, translucent panels with subtle borders
- **High-contrast chat bubbles** — Dark text (#1b1b1e) on light backgrounds; explicitly overridden in CSS to ensure readability
- **SVG viewBox** — All circular progress rings use explicit `viewBox` to prevent clipping
- **Select arrow reset** — Native browser dropdown arrows hidden via `appearance: none`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js ≥ 18 |
| Server | Express 4.x |
| Real-time | Socket.io 4.x |
| Frontend | Vanilla HTML + Tailwind CSS + Vanilla JS |
| Data | CSV parsed at startup (no database) |
| Deployment | Render.com (free tier) |

---

## How to Run Locally

```bash
# Install dependencies
npm install

# Start the server (parses CSV on startup, takes ~2s)
node index.js

# Open in browser
# http://localhost:3001
```

---

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for step-by-step instructions to deploy on Render.com. The CSV files must be committed or uploaded separately since they are gitignored due to size.
