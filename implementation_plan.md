# Implementation Plan: Taste-Based Stranger-Matching Chat App ("Sync")

This plan outlines the architecture and steps to implement a stranger-chat web application where users are matched based on their music and video taste profiles derived from Spotify and YouTube streaming histories.

## User Review Required

> [!IMPORTANT]
> **Simulated Audio Features & Genres**: The provided `spotify_history.csv` and `youtube_watch_log.csv` do not contain Spotify audio features (energy, valence, danceability) or YouTube categories/topics directly. We will implement a Python preprocessing script that assigns realistic genres and audio features to the top 200+ artists and playlist terms, allowing us to build a rich, offline-capable taste-profile database for all 244 users.
> 
> **Hosting & Access**: Since the judges will need to join from their own devices (e.g. phones), the backend server will be built with Node.js and Socket.io, bind to all network interfaces (`0.0.0.0`), and can be exposed via `localhost` or an tunnel tool like Ngrok if needed.

## Open Questions

> [!NOTE]
> 1. **Do you have a preferred UI color palette?** We propose a dark, premium, glassmorphic theme (deep blues, purples, and glowing accents) matching the aesthetics in the proposal PDF.
> 2. **Would you like us to automate the Ngrok hosting step?** We can include instructions or a script to easily run and expose the local server so judges can access it on their phones.

## Proposed Changes

We will build the application in three main stages:
1. **Data Preprocessing & Profile Generation (Python)**
2. **Real-time Matchmaking & Chat Server (Node.js & Socket.io)**
3. **Frontend Application (Vanilla HTML/JS/CSS with premium aesthetics)**
4. **Notebook Submission Documentation (Jupyter Notebook update)**

---

### 1. Data Preprocessing

#### [NEW] [preprocess_data.py](file:///f:/github-project/Codecathon-2026/scripts/preprocess_data.py)
This Python script will:
- Parse `spotify_history.csv` to build a detailed profile for the "Current User" (User 0), identifying their top artists, top tracks, and listening habits.
- Map the top 200+ artists from the dataset to genres (e.g., Rock, Indie, Pop, Folk, Latin, Classical, Jazz) and typical audio feature profiles (valence, energy, danceability).
- Parse `youtube_watch_log.csv` for the 244 users, grouping by `user_id` to extract their watch patterns (active hours, subscription rates) and mapping playlist names (e.g., "apop", "House", "Country") to taste vectors.
- Generate synthetic music history for the 244 users based on their YouTube playlist names and watch behaviors (e.g. matching pop playlists to pop artists) so that every user in the matchmaking pool has a complete Spotify + YouTube taste vector.
- Save the results to [user_profiles.json](file:///f:/github-project/Codecathon-2026/data/user_profiles.json), containing pre-computed vectors and text summaries for matchmaking.

---

### 2. Matchmaking & Chat Server

#### [NEW] [package.json](file:///f:/github-project/Codecathon-2026/package.json)
- Define Node.js project and dependencies (`express`, `socket.io`, `cors`).

#### [NEW] [server.js](file:///f:/github-project/Codecathon-2026/server.js)
- Express server serving the static frontend from the `public` directory.
- Socket.io handler implementing:
  - **Queue Management**: Active queues for `sync` (closest match), `shuffle` (farthest match), and `search` (matching search keywords).
  - **Matchmaking Engine**: Periodically (e.g., every 2 seconds) calculates cosine similarity between queued users and pairs them.
  - **Session Management**: Opens a private room for matched pairs, passes their compatibility data, and relays chat messages.

---

### 3. Frontend Application

#### [NEW] [index.html](file:///f:/github-project/Codecathon-2026/public/index.html)
- A highly polished single-page interface with four states:
  1. **Landing/Login**: Let the user choose to import the actual `spotify_history.csv` or select a pre-configured persona from the database.
  2. **Queue Screen**: Animated radar-like visualization showing they are scanning the queue, with mode details.
  3. **Compatibility Reveal**: A screen showing:
     - Big circular overlap % graphic (e.g. "81% overlap").
     - Shared ground (e.g., "Lo-fi, Indie rock, True-crime essays").
     - Blind spots (e.g., "Your blind spot: K-Pop (40% of their rotation)").
     - "Generate Bridge Playlist" button.
     - "Start Chatting" button to progress.
  4. **Chat Interface**: Clean chat window with message bubbles, status indicators, and a prominent "Report/Skip" button.

#### [NEW] [style.css](file:///f:/github-project/Codecathon-2026/public/css/style.css)
- Premium CSS containing:
  - Custom font imports (Outfit or Inter).
  - Dark mode variables (deep dark blues, glowing purples).
  - Glassmorphic panels (`backdrop-filter: blur()`).
  - Animations for the scanning radar, fade-ins, and page transitions.

#### [NEW] [app.js](file:///f:/github-project/Codecathon-2026/public/js/app.js)
- Socket.io integration.
- UI state transitions and playlist rendering logic.

---

### 4. Notebook Update

#### [MODIFY] [Swinbiggers_Code_Catalyst_Digital_Shadow_Colab_Template.ipynb](file:///f:/github-project/Codecathon-2026/Swinbiggers_Code_Catalyst_Digital_Shadow_Colab_Template.ipynb)
- Update the Jupyter notebook to include:
  1. Project direction (connecting the theme of Digital Shadows to matchmaking).
  2. The code used to load and preprocess the datasets.
  3. Analysis results (distribution of users, top artists, and a visualization of similarity distribution).
  4. The ethical reflection section on privacy and moderation.

---

## Verification Plan

### Automated Tests
We will write a test script to verify:
- Preprocessor correctness: check that `user_profiles.json` is generated with valid vectors and summaries.
- Cosine similarity matching: check that the matchmaking algorithm correctly returns the closest/farthest profiles.

### Manual Verification
1. Run `node server.js` and open the app in two browser windows side-by-side.
2. Select profiles and join the queue in both windows.
3. Verify that the matching occurs, the compatibility card is rendered with correct overlap calculations, and chat messages are sent back and forth.
4. Open the app on a mobile device on the same local network to verify responsiveness and mobile usability.
