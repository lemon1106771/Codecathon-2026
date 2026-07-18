# 🥚 Tamago — Stranger Chat by YouTube Taste

> *Matched by video taste, not by chance.*

Tamago is an Omegle-style stranger-matching chat app where pairing is driven by **real compatibility** instead of randomness. It parses **1.84 million YouTube watch events** from 244 users and computes live Jaccard set-overlap to find your "taste twin."

Built for **Codecathon 2026** (Code Catalyst: Digital Shadows theme).

---

## ✨ Features

| Feature | Description |
|---|---|
| **Live Jaccard Matching** | Real set-intersection overlap computed from `youtube_watch_log.csv` — not precomputed, not faked |
| **MBTI Curation Persona** | Dynamically classifies each user's cognitive style (e.g. INTP, ESFP) based on their video category ratios, with full dimension breakdowns and analysis |
| **Taste DNA Radar** | Animated SVG radar chart mapping your top 4 content affinities |
| **Transparent Calculations** | Queue screen shows the actual Jaccard pipeline — candidate IDs, shared counts, raw overlap coefficients, percentiles |
| **YouTube Leaderboard** | Global stats compiled from 1.84M events: top categories, playlists, most active users |
| **Real-time Chat** | Socket.io messaging with simulated AI replies for solo demo |
| **Match History** | Session-persistent log of previous matches with overlap % and "Reopen Chat" |
| **Dark/Light Theme** | Full theme toggle via Settings modal |
| **Sync / Shuffle Modes** | Sync finds your closest match; Shuffle finds the most different user |

---

## 🗂️ Project Structure

```
Codecathon-2026/
├── index.js                    # Express + Socket.io server & data engine
├── public/
│   ├── index.html              # Single-page app (6 screens)
│   ├── css/style.css           # Animations, contrast overrides, utilities
│   └── js/app.js               # Client state machine & Socket.io client
├── data/
│   ├── youtube_watch_log.csv   # 1.84M watch events (gitignored)
│   └── spotify_history.csv     # Single-user Spotify data (gitignored)
├── matches.json                # Precomputed fallback pairs
├── package.json                # Dependencies: express, socket.io, cors
├── render.yaml                 # Render.com deployment config
├── implementation_plan.md      # Detailed technical architecture
├── DEPLOYMENT.md               # Hosting guide (Render.com)
└── .gitignore
```

---

## 🚀 Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/<your-org>/Codecathon-2026.git
cd Codecathon-2026

# 2. Place your CSV data files
#    Copy youtube_watch_log.csv into data/

# 3. Install dependencies
npm install

# 4. Start the server
node index.js
#    → Parses 1.84M rows in ~2s
#    → Server runs on http://localhost:3001

# 5. Open in browser
#    http://localhost:3001
```

---

## 🧬 How Matching Works

1. On startup, the server parses `youtube_watch_log.csv` and builds a `Set<videoId>` for each of the 244 users.
2. When you click **Find Taste Twin**, the server evaluates the top 12 most-active candidates against your profile:
   - Computes the **Jaccard overlap coefficient**: `|A ∩ B| / min(|A|, |B|)`
   - Ranks all candidates by overlap
   - **Sync mode** → returns the closest match
   - **Shuffle mode** → returns the most different match
3. The Queue screen streams the actual calculation steps (candidate IDs, shared counts, raw coefficients) live.
4. The Reveal screen shows the compatibility %, shared interests, blind spots, and mutual watch history — all derived from real data intersections.

---

## 🧠 MBTI Analysis

Each user's MBTI type is computed from their **video category distribution**:

| Dimension | Quiet/Reflective (I) | Social/Active (E) |
|---|---|---|
| Categories | Lofi, ASMR, Space, Yoga, Movie Analysis | Gaming, Pop Music, Vlogs |

| Dimension | Conceptual (N) | Practical (S) |
|---|---|---|
| Categories | Movie Analysis, True Crime, Space | Tech Reviews, Cooking |

| Dimension | Analytical (T) | Feeling (F) |
|---|---|---|
| Categories | ASMR Programming, Tech, Gaming | Yoga, Lofi, Music |

| Dimension | Structured (J) | Casual (P) |
|---|---|---|
| Categories | Yoga, Cooking, Gaming Tutorials | Open-ended browsing |

The MBTI card on the Home screen shows the calculated type, a description, dimension progress bars, and the full analysis rationale.

---

## 📊 API Endpoints

| Endpoint | Description |
|---|---|
| `GET /api/users` | Top 20 most-active users |
| `GET /api/user/:id` | Profile + top categories + MBTI analysis |
| `GET /api/match?user_a=X&user_b=Y` | Overlap details between two users |
| `GET /api/matchmake?user_a=X&mode=sync` | Live matchmaking with candidate logs |
| `GET /api/stats` | Global leaderboard stats |

---

## 🌐 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for deploying to Render.com (free tier, ~2 min setup).

> **Note:** The CSV data files are gitignored due to their size (~200MB). You must upload them separately or include them in your deployment.

---

## 🛠️ Tech Stack

- **Runtime:** Node.js ≥ 18
- **Server:** Express 4.x + Socket.io 4.x
- **Frontend:** Vanilla HTML/JS + Tailwind CSS (CDN)
- **Data:** CSV parsed at startup (no external database)
- **Deployment:** Render.com

---

## 👥 Team

**Swinbiggers** — Codecathon 2026, Code Catalyst: Digital Shadows
