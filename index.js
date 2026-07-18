const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

const youtubePath = path.join(__dirname, 'data', 'youtube_watch_log.csv');

// In-memory data store
const userVideos = {};      // user_id -> Set of video_id
const videoPlaylists = {};  // video_id -> playlist_name
const userPlaylists = {};   // user_id -> Map of playlist_name -> count
let activeUsersList = [];   // List of user IDs sorted by watch count
let activeOverlaps = [];    // Sorted list of overlaps for percentile calculations

// Categories for deterministic video ID hashing fallback
const CATEGORIES = [
  "Gaming Tutorials",
  "Lofi Chill Beats",
  "True Crime Essays",
  "Tech Reviews",
  "Cooking Recipes",
  "ASMR Programming",
  "Space Exploration",
  "Yoga & Meditation",
  "Movie Analysis",
  "Travel Vlogs"
];

// Clean mapping of raw playlist names to neat labels
const PLAYLIST_MAPPING = {
  "country": "Country Music",
  "apop": "K-Pop Music",
  "music": "Pop Music",
  "g-eazy": "Hip-Hop Music",
  "house": "House Music",
  "commute": "Acoustic Hits",
  "yoga": "Yoga & Meditation",
  "favorites": "Classic Hits",
  "repeat": "Trending Beats",
  "shower": "Sing-Along Hits",
  "muzaks": "Background Lofi"
};

// Map video ID to a category deterministically
function getCategoryForVideo(videoId) {
  const playlist = videoPlaylists[videoId];
  if (playlist && playlist !== 'NA' && playlist !== 'NULL') {
    for (const [term, label] of Object.entries(PLAYLIST_MAPPING)) {
      if (playlist.toLowerCase().includes(term)) {
        return label;
      }
    }
    return `${playlist.charAt(0).toUpperCase() + playlist.slice(1).toLowerCase()} Videos`;
  }
  
  // Hash fallback
  let hash = 0;
  for (let i = 0; i < videoId.length; i++) {
    hash = (hash << 5) - hash + videoId.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % CATEGORIES.length;
  return CATEGORIES[idx];
}

// Map category to a typical channel and mock title list
const MOCK_VIDEOS = {
  "Gaming Tutorials": [
    { title: "Super Mario Speedrun World Record Breakdown", channel: "Speedrun History", duration: "25:40" },
    { title: "Minecraft Redstone Engineering 101", channel: "Logic Craft", duration: "18:15" }
  ],
  "Lofi Chill Beats": [
    { title: "Late Night Coding - Lo-fi Chill Beats", channel: "Lofi Records", duration: "24/7 Stream" },
    { title: "Cozy Study Session - Chill Instrumental Mix", channel: "Beat Cafe", duration: "1:20:00" }
  ],
  "True Crime Essays": [
    { title: "The Decoy: Investigation of a Mysterious Disappearance", channel: "Dark Web Files", duration: "48:30" },
    { title: "Behind Closed Doors: The Heist of the Century", channel: "Crime Files", duration: "35:12" }
  ],
  "Tech Reviews": [
    { title: "Designing the Perfect Mechanical Keyboard", channel: "Keyboard Curation", duration: "14:22" },
    { title: "Minimalist Desk Setup: Clean & Ergonomic", channel: "Tech Aesthetic", duration: "12:05" }
  ],
  "Cooking Recipes": [
    { title: "Mastering the Art of Fresh Pasta at Home", channel: "Sourdough & Co", duration: "22:18" },
    { title: "Street Food Tour: Secret Recipes of Tokyo", channel: "Food Traveler", duration: "28:45" }
  ],
  "ASMR Programming": [
    { title: "ASMR Programming - Building a Real-time Chat App", channel: "Quiet Code", duration: "1:05:20" },
    { title: "No Talking mechanical Keyboard CSS Coding Session", channel: "Type ASMR", duration: "55:30" }
  ],
  "Space Exploration": [
    { title: "Why the James Webb Telescope Changes Everything", channel: "Space Hub", duration: "32:14" },
    { title: "The Scale of the Universe: Journey to the Edge", channel: "Cosmos Quest", duration: "42:00" }
  ],
  "Yoga & Meditation": [
    { title: "20 Minute Full Body Stretch for Beginners", channel: "Yoga Oasis", duration: "20:00" },
    { title: "Mindfulness Meditation for Deep Work and Focus", channel: "Calm Mind", duration: "15:30" }
  ],
  "Movie Analysis": [
    { title: "The Brutalist Obsession: Why Concrete is Back", channel: "Architecture Channel", duration: "42:15" },
    { title: "How Directors Use Color to Manipulate Your Emotions", channel: "Every Frame a Painting", duration: "24:10" }
  ],
  "Travel Vlogs": [
    { title: "Solo in Kyoto: 7 Days in the Cultural Capital", channel: "Wanderlust", duration: "30:25" },
    { title: "Exploring the Nordic Wilderness: Rain & Fjords", channel: "Outdoors", duration: "18:40" }
  ]
};

function getMockVideoDetails(category, idxSeed) {
  const list = MOCK_VIDEOS[category] || MOCK_VIDEOS["Lofi Chill Beats"];
  const item = list[idxSeed % list.length];
  return item;
}

// 1. Fast CSV Parser on Startup
console.log("TAMAGO: Parsing YouTube watch log...");
const startTime = Date.now();
try {
  const fileData = fs.readFileSync(youtubePath, 'utf-8');
  let pos = 0;
  let nextNewline = fileData.indexOf('\n');
  
  // Skip header
  pos = nextNewline + 1;
  nextNewline = fileData.indexOf('\n', pos);
  
  let count = 0;
  while (nextNewline !== -1) {
    const line = fileData.substring(pos, nextNewline).trim();
    if (line) {
      const parts = line.split(',');
      if (parts.length >= 3) {
        const userId = parseInt(parts[1], 10);
        const videoId = parts[2];
        const playlistName = parts[5] || 'NA';
        
        if (!isNaN(userId) && videoId) {
          if (!userVideos[userId]) {
            userVideos[userId] = new Set();
            userPlaylists[userId] = {};
          }
          userVideos[userId].add(videoId);
          
          if (playlistName && playlistName !== 'NA' && playlistName !== 'NULL') {
            videoPlaylists[videoId] = playlistName;
            
            // Count playlist name frequencies per user
            userPlaylists[userId][playlistName] = (userPlaylists[userId][playlistName] || 0) + 1;
          }
        }
      }
    }
    count++;
    pos = nextNewline + 1;
    nextNewline = fileData.indexOf('\n', pos);
  }
  
  const elapsed = (Date.now() - startTime) / 1000;
  console.log(`TAMAGO: Parsed ${count} watch events in ${elapsed.toFixed(2)}s.`);
  
  // Compile and sort users by active level
  const userIds = Object.keys(userVideos).map(Number);
  userIds.sort((a, b) => userVideos[b].size - userVideos[a].size);
  activeUsersList = userIds;
  console.log(`TAMAGO: Loaded ${activeUsersList.length} users. Most active is User ${activeUsersList[0]} with ${userVideos[activeUsersList[0]].size} videos.`);
  
  // 2. Precompute the baseline overlap coefficients of the 15 most active users
  const top15 = activeUsersList.slice(0, 15);
  for (let i = 0; i < top15.length; i++) {
    for (let j = i + 1; j < top15.length; j++) {
      const u1 = top15[i];
      const u2 = top15[j];
      const set1 = userVideos[u1];
      const set2 = userVideos[u2];
      const shared = [...set1].filter(vid => set2.has(vid));
      const minSize = Math.min(set1.size, set2.size);
      const overlap = minSize > 0 ? (shared.length / minSize) : 0;
      activeOverlaps.push(overlap);
    }
  }
  activeOverlaps.sort((a, b) => a - b);
  console.log(`TAMAGO: Baseline overlap distribution calculated (Max: ${activeOverlaps[activeOverlaps.length-1].toFixed(4)}, Min: ${activeOverlaps[0].toFixed(4)}).`);

} catch (e) {
  console.error("TAMAGO: Error loading youtube watch log:", e);
}

// Calculate the compatibility percentile for a raw overlap coefficient
function calculatePercentile(overlapCoeff) {
  if (overlapCoeff <= 0) return 0;
  if (overlapCoeff >= activeOverlaps[activeOverlaps.length - 1]) return 100;
  
  // Find rank
  let count = 0;
  for (const val of activeOverlaps) {
    if (val <= overlapCoeff) count++;
  }
  const percentile = (count / activeOverlaps.length) * 100;
  return parseFloat(percentile.toFixed(1));
}

// Calculate overlap statistics and lists dynamically
function computeOverlapDetails(userA, userB) {
  const setA = userVideos[userA];
  const setB = userVideos[userB];
  
  if (!setA || !setB) {
    return {
      compatibility_pct: 0,
      shared_video_count: 0,
      shared_interests: [],
      blind_spot_a: [],
      blind_spot_b: [],
      timeline: []
    };
  }
  
  const shared = [...setA].filter(vid => setB.has(vid));
  const minSize = Math.min(setA.size, setB.size);
  const rawOverlap = minSize > 0 ? (shared.length / minSize) : 0;
  const compatibilityPct = calculatePercentile(rawOverlap);
  
  // Resolve shared interests (categories)
  const sharedCategoriesMap = {};
  for (const vid of shared) {
    const cat = getCategoryForVideo(vid);
    sharedCategoriesMap[cat] = (sharedCategoriesMap[cat] || 0) + 1;
  }
  const sortedCategories = Object.keys(sharedCategoriesMap).sort((a, b) => sharedCategoriesMap[b] - sharedCategoriesMap[a]);
  let sharedInterests = sortedCategories.slice(0, 5);
  if (sharedInterests.length === 0) {
    sharedInterests = ["Lofi Chill Beats", "Gaming Tutorials"];
  }
  
  // Resolve blind spots
  const blindA = [...setB].filter(vid => !setA.has(vid));
  const blindB = [...setA].filter(vid => !setB.has(vid));
  
  const blindAMap = {};
  for (const vid of blindA) {
    const cat = getCategoryForVideo(vid);
    blindAMap[cat] = (blindAMap[cat] || 0) + 1;
  }
  const sortedBlindA = Object.keys(blindAMap).sort((a, b) => blindAMap[b] - blindAMap[a]);
  const blindSpotA = sortedBlindA.slice(0, 2);
  
  const blindBMap = {};
  for (const vid of blindB) {
    const cat = getCategoryForVideo(vid);
    blindBMap[cat] = (blindBMap[cat] || 0) + 1;
  }
  const sortedBlindB = Object.keys(blindBMap).sort((a, b) => blindBMap[b] - blindBMap[a]);
  const blindSpotB = sortedBlindB.slice(0, 2);
  
  // Resolve timeline (shared watch items)
  const timeline = [];
  const limit = Math.min(shared.length, 3);
  for (let i = 0; i < limit; i++) {
    const vid = shared[i];
    const cat = getCategoryForVideo(vid);
    const mockDetails = getMockVideoDetails(cat, i);
    timeline.push({
      video_id: vid,
      title: mockDetails.title,
      channel: mockDetails.channel,
      duration: mockDetails.duration,
      category: cat,
      time_ago: i === 0 ? "Both watched 3 days ago" : i === 1 ? "Both watched 1 week ago" : "Both watched 2 weeks ago"
    });
  }
  
  // If no mutual watch timeline, supply placeholders based on shared interests
  if (timeline.length === 0) {
    for (let i = 0; i < 2; i++) {
      const cat = sharedInterests[i % sharedInterests.length];
      const mockDetails = getMockVideoDetails(cat, i);
      timeline.push({
        video_id: `mock_vid_${i}`,
        title: mockDetails.title,
        channel: mockDetails.channel,
        duration: mockDetails.duration,
        category: cat,
        time_ago: i === 0 ? "Both watched 3 days ago" : "Both watched 1 week ago"
      });
    }
  }

  return {
    compatibility_pct: compatibilityPct,
    shared_video_count: shared.length,
    shared_interests: sharedInterests,
    blind_spot_a: blindSpotA,
    blind_spot_b: blindSpotB,
    timeline: timeline
  };
}

// REST API Endpoints

// 1. Get List of Users (top active users first for selector)
app.get('/api/users', (req, res) => {
  const users = activeUsersList.slice(0, 20).map(id => ({
    user_id: id,
    video_count: userVideos[id].size,
    username: id === 209 ? "User 209 (Alex Chen)" : id === 102 ? "User 102 (Mika Valance)" : `User ${id}`
  }));
  res.json(users);
});

// 2. Get Single User Details (basic statistics)
app.get('/api/user/:id', (req, res) => {
  const userId = parseInt(req.params.id, 10);
  if (!userVideos[userId]) {
    return res.status(404).json({ error: "User not found" });
  }
  
  // Find top categories
  const catMap = {};
  for (const vid of userVideos[userId]) {
    const cat = getCategoryForVideo(vid);
    catMap[cat] = (catMap[cat] || 0) + 1;
  }
  const topCategories = Object.keys(catMap).sort((a, b) => catMap[b] - catMap[a]).slice(0, 4);
  
  res.json({
    user_id: userId,
    total_videos: userVideos[userId].size,
    top_categories: topCategories,
    username: userId === 209 ? "Alex Chen" : userId === 102 ? "Mika Valance" : `Stranger #${userId + 4000}`
  });
});

// 3. Dynamic Match Endpoint
app.get('/api/match', (req, res) => {
  const userA = parseInt(req.query.user_a, 10);
  const userB = parseInt(req.query.user_b, 10);
  
  if (isNaN(userA) || isNaN(userB)) {
    // Fallback: return a random pair from the top active users
    const topPairs = [
      { a: 209, b: 102 },
      { a: 112, b: 116 },
      { a: 116, b: 209 },
      { a: 112, b: 209 }
    ];
    const rand = topPairs[Math.floor(Math.random() * topPairs.length)];
    const details = computeOverlapDetails(rand.a, rand.b);
    return res.json({
      match_id: `m_rand_${rand.a}_${rand.b}`,
      user_a: rand.a,
      user_b: rand.b,
      ...details
    });
  }
  
  const details = computeOverlapDetails(userA, userB);
  res.json({
    match_id: `m_${userA}_${userB}`,
    user_a: userA,
    user_b: userB,
    ...details
  });
});

// 4. Live Matchmaking Calculation
// Given userA and a mode ('sync' or 'shuffle'), find the best matching userB
app.get('/api/matchmake', (req, res) => {
  const userA = parseInt(req.query.user_a, 10);
  const mode = req.query.mode || 'sync';
  
  if (isNaN(userA) || !userVideos[userA]) {
    return res.status(400).json({ error: "Invalid user_a ID" });
  }
  
  let bestUser = null;
  let bestScore = mode === 'sync' ? -1 : 999999;
  
  // Scan all other users to find the match live
  const setA = userVideos[userA];
  for (const userB of activeUsersList) {
    if (userB === userA) continue;
    
    const setB = userVideos[userB];
    if (!setB) continue;
    
    // Intersection
    let sharedCount = 0;
    for (const vid of setA) {
      if (setB.has(vid)) sharedCount++;
    }
    const minSize = Math.min(setA.size, setB.size);
    const overlap = minSize > 0 ? (sharedCount / minSize) : 0;
    
    if (mode === 'sync') {
      if (overlap > bestScore) {
        bestScore = overlap;
        bestUser = userB;
      }
    } else { // shuffle
      if (overlap < bestScore) {
        bestScore = overlap;
        bestUser = userB;
      }
    }
  }
  
  if (bestUser === null) {
    bestUser = activeUsersList[0] === userA ? activeUsersList[1] : activeUsersList[0];
  }
  
  const details = computeOverlapDetails(userA, bestUser);
  res.json({
    match_id: `m_${userA}_${bestUser}`,
    user_a: userA,
    user_b: bestUser,
    ...details
  });
});

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Socket.io room logic
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  socket.join('demo-room');
  
  socket.on('chat-message', (msg) => {
    socket.to('demo-room').emit('chat-message', msg);
  });
  
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`==================================================`);
  console.log(`  Tamago chat server running on port ${PORT}`);
  console.log(`  Local Address: http://localhost:${PORT}`);
  console.log(`==================================================`);
});
