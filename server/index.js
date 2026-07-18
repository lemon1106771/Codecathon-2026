// Tamago - chat server
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());

// Load user profiles precomputed by the Python script
const PROFILES_PATH = path.join(__dirname, '../data/user_profiles.json');
let userProfiles = {};

try {
  const data = fs.readFileSync(PROFILES_PATH, 'utf8');
  userProfiles = JSON.parse(data);
  console.log(`Successfully loaded ${Object.keys(userProfiles).length} user profiles.`);
} catch (err) {
  console.error('Failed to load user profiles. Run python data/enrich_data.py first.', err);
}

// Cosine similarity for maps (categories & channels)
function cosineSimilarityMaps(mapA, mapB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  const keys = new Set([...Object.keys(mapA), ...Object.keys(mapB)]);
  for (const key of keys) {
    const valA = mapA[key] || 0;
    const valB = mapB[key] || 0;
    dotProduct += valA * valB;
    normA += valA * valA;
    normB += valB * valB;
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Cosine similarity for arrays (hours)
function cosineSimilarityArrays(arrA, arrB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < arrA.length; i++) {
    const valA = arrA[i];
    const valB = arrB[i];
    dotProduct += valA * valB;
    normA += valA * valA;
    normB += valB * valB;
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Jaccard similarity for sets (videos)
function jaccardSimilarity(setA, setB) {
  const union = new Set([...setA, ...setB]);
  if (union.size === 0) return 0;
  let intersectionSize = 0;
  for (const val of setA) {
    if (setB.has(val)) {
      intersectionSize++;
    }
  }
  return intersectionSize / union.size;
}

// Get time period name from 24h distribution
function getTimePeriodSummary(hoursA, hoursB) {
  // Define time frames
  // Morning (5-11), Afternoon (12-17), Evening (18-22), Night (23-4)
  const periods = [
    { name: 'Morning', hours: [5, 6, 7, 8, 9, 10, 11] },
    { name: 'Afternoon', hours: [12, 13, 14, 15, 16, 17] },
    { name: 'Evening', hours: [18, 19, 20, 21, 22] },
    { name: 'Night', hours: [23, 0, 1, 2, 3, 4] }
  ];
  
  let bestPeriod = '';
  let maxScore = -1;
  
  for (const period of periods) {
    let scoreA = 0;
    let scoreB = 0;
    for (const h of period.hours) {
      scoreA += hoursA[h] || 0;
      scoreB += hoursB[h] || 0;
    }
    // Combined score represents shared usage in this timeframe
    const combined = scoreA * scoreB;
    if (combined > maxScore) {
      maxScore = combined;
      bestPeriod = period.name;
    }
  }
  
  const labelMap = {
    'Morning': 'Early Birds (active 5 AM - 11 AM)',
    'Afternoon': 'Mid-day Watchers (active 12 PM - 5 PM)',
    'Evening': 'Evening Chillers (active 6 PM - 10 PM)',
    'Night': 'Night Owls (active 11 PM - 4 AM)'
  };
  
  return labelMap[bestPeriod] || 'Daytime Watchers';
}

// Matching endpoint
app.get('/api/match', (req, res) => {
  const userIds = Object.keys(userProfiles);
  if (userIds.length < 2) {
    return res.status(500).json({ error: 'Not enough user profiles to perform matching.' });
  }

  // 1. Determine active user (User A)
  let userIdA = req.query.userId;
  if (!userIdA || !userProfiles[userIdA]) {
    // Pick a random user to represent "you"
    userIdA = userIds[Math.floor(Math.random() * userIds.length)];
  }
  
  const userA = userProfiles[userIdA];
  
  // 2. Calculate compatibility score for all other users
  const candidates = [];
  const setA = new Set(userA.videos);
  
  for (const userIdB of userIds) {
    if (userIdB === userIdA) continue;
    
    const userB = userProfiles[userIdB];
    const setB = new Set(userB.videos);
    
    const catSim = cosineSimilarityMaps(userA.categories, userB.categories);
    const chanSim = cosineSimilarityMaps(userA.channels, userB.channels);
    const timeSim = cosineSimilarityArrays(userA.hours, userB.hours);
    const videoSim = jaccardSimilarity(setA, setB);
    
    // Weighted compatibility formula
    const score = (0.4 * catSim) + (0.3 * chanSim) + (0.2 * timeSim) + (0.1 * videoSim);
    
    // Scale score to a user-friendly percentage (e.g. 40% to 99%)
    const compatibility_pct = Math.min(99, Math.max(35, Math.round(35 + score * 65)));
    
    candidates.push({
      user_b_id: userIdB,
      score: score,
      compatibility_pct: compatibility_pct,
      catSim,
      chanSim,
      timeSim,
      videoSim
    });
  }
  
  // Sort candidates by score descending
  candidates.sort((a, b) => b.score - a.score);
  
  // 3. Select match based on skipCount (for skipping match support)
  let skipCount = parseInt(req.query.skipCount) || 0;
  // Wrap around if skipCount is larger than available candidates
  if (skipCount >= candidates.length) {
    skipCount = skipCount % candidates.length;
  }
  
  const matchResult = candidates[skipCount];
  const userB = userProfiles[matchResult.user_b_id];
  
  // 4. Extract shared interests
  // Categories both users watch, ranked by combined watch duration percentage
  const sharedCategories = [];
  for (const cat of Object.keys(userA.categories)) {
    const valA = userA.categories[cat] || 0;
    const valB = userB.categories[cat] || 0;
    if (valA > 0.05 && valB > 0.05) {
      sharedCategories.push({ name: cat, product: valA * valB });
    }
  }
  sharedCategories.sort((a, b) => b.product - a.product);
  
  // Channels both users watch
  const sharedChannels = [];
  const allChannels = new Set([...Object.keys(userA.channels), ...Object.keys(userB.channels)]);
  for (const chan of allChannels) {
    const valA = userA.channels[chan] || 0;
    const valB = userB.channels[chan] || 0;
    if (valA > 0.02 && valB > 0.02) {
      sharedChannels.push({ name: chan, product: valA * valB });
    }
  }
  sharedChannels.sort((a, b) => b.product - a.product);
  
  // Combine top category and top channel into "shared interests"
  const sharedInterests = [];
  if (sharedCategories.length > 0) {
    sharedInterests.push(`Shared Genre: ${sharedCategories[0].name}`);
  }
  if (sharedChannels.length > 0) {
    sharedInterests.push(`Shared Channel: ${sharedChannels[0].name}`);
  }
  if (sharedCategories.length > 1) {
    sharedInterests.push(`Shared Genre: ${sharedCategories[1].name}`);
  }
  if (sharedInterests.length === 0) {
    sharedInterests.push("General YouTube Observers");
  }
  
  // 5. Extract Blind Spots
  // Channels user B watches that user A does not watch (or watches very little)
  const blindSpotA = [];
  for (const chan of Object.keys(userB.channels)) {
    const valA = userA.channels[chan] || 0;
    const valB = userB.channels[chan] || 0;
    if (valB > 0.05 && valA < 0.01) {
      blindSpotA.push(chan);
    }
  }
  
  // Channels user A watches that user B does not watch
  const blindSpotB = [];
  for (const chan of Object.keys(userA.channels)) {
    const valA = userA.channels[chan] || 0;
    const valB = userB.channels[chan] || 0;
    if (valA > 0.05 && valB < 0.01) {
      blindSpotB.push(chan);
    }
  }
  
  // Fallbacks if blind spots are empty
  if (blindSpotA.length === 0) blindSpotA.push("Lofi Hip Hop");
  if (blindSpotB.length === 0) blindSpotB.push("Technical Analysis");

  // Exact video overlap count
  const setB = new Set(userB.videos);
  let sharedVideoCount = 0;
  for (const vid of setA) {
    if (setB.has(vid)) sharedVideoCount++;
  }
  
  // Get time alignment label
  const timeAlignment = getTimePeriodSummary(userA.hours, userB.hours);

  // Return full compatibility payload
  res.json({
    match_id: `match_${userIdA}_${userB.user_id}`,
    user_a: userA.user_id,
    user_b: userB.user_id,
    compatibility_pct: matchResult.compatibility_pct,
    shared_interests: sharedInterests,
    time_alignment: timeAlignment,
    blind_spot_a: blindSpotA.slice(0, 3), // top 3
    blind_spot_b: blindSpotB.slice(0, 3), // top 3
    shared_video_count: sharedVideoCount
  });
});

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Basic Socket.io chat room logic
io.on('connection', (socket) => {
  let activeRoom = 'demo-room';
  
  socket.on('join-room', (roomId) => {
    socket.leave(activeRoom);
    activeRoom = roomId || 'demo-room';
    socket.join(activeRoom);
    console.log(`Socket ${socket.id} joined room: ${activeRoom}`);
  });

  socket.on('chat-message', (msg) => {
    socket.to(activeRoom).emit('chat-message', msg);
  });
  
  socket.on('disconnect', () => {
    console.log(`Socket ${socket.id} disconnected`);
  });
});

// Serve static client assets in production (from client/dist)
const distPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
  console.log('Serving client static files from', distPath);
} else {
  console.log('Static client build folder not found. API mode only.');
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Tamago server running on port ${PORT}`));
