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

// Core matchmaking engine calculation
function computeMatchDetails(userIdA, userIdB) {
  const userA = userProfiles[userIdA];
  const userB = userProfiles[userIdB];
  if (!userA || !userB) return null;

  const setA = new Set(userA.videos);
  const setB = new Set(userB.videos);
  
  const catSim = cosineSimilarityMaps(userA.categories, userB.categories);
  const chanSim = cosineSimilarityMaps(userA.channels, userB.channels);
  const timeSim = cosineSimilarityArrays(userA.hours, userB.hours);
  const videoSim = jaccardSimilarity(setA, setB);
  
  const score = (0.4 * catSim) + (0.3 * chanSim) + (0.2 * timeSim) + (0.1 * videoSim);
  const compatibility_pct = Math.min(99, Math.max(35, Math.round(35 + score * 65)));
  
  const sharedCategories = [];
  for (const cat of Object.keys(userA.categories)) {
    const valA = userA.categories[cat] || 0;
    const valB = userB.categories[cat] || 0;
    if (valA > 0.05 && valB > 0.05) {
      sharedCategories.push({ name: cat, product: valA * valB });
    }
  }
  sharedCategories.sort((a, b) => b.product - a.product);
  
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
  
  const blindSpotA = [];
  for (const chan of Object.keys(userB.channels)) {
    const valA = userA.channels[chan] || 0;
    const valB = userB.channels[chan] || 0;
    if (valB > 0.05 && valA < 0.01) {
      blindSpotA.push(chan);
    }
  }
  
  const blindSpotB = [];
  for (const chan of Object.keys(userA.channels)) {
    const valA = userA.channels[chan] || 0;
    const valB = userB.channels[chan] || 0;
    if (valA > 0.05 && valB < 0.01) {
      blindSpotB.push(chan);
    }
  }
  
  if (blindSpotA.length === 0) blindSpotA.push("Lofi Hip Hop");
  if (blindSpotB.length === 0) blindSpotB.push("Technical Analysis");

  let sharedVideoCount = 0;
  for (const vid of setA) {
    if (setB.has(vid)) sharedVideoCount++;
  }
  
  const timeAlignment = getTimePeriodSummary(userA.hours, userB.hours);

  return {
    match_id: `match_${userIdA}_${userIdB}`,
    user_a: userIdA,
    user_b: userIdB,
    compatibility_pct,
    shared_interests: sharedInterests,
    time_alignment: timeAlignment,
    blind_spot_a: blindSpotA.slice(0, 3),
    blind_spot_b: blindSpotB.slice(0, 3),
    shared_video_count: sharedVideoCount
  };
}

// Fallback REST endpoint (simulates finding matches in offline dataset)
app.get('/api/match', (req, res) => {
  const userIds = Object.keys(userProfiles);
  if (userIds.length < 2) {
    return res.status(500).json({ error: 'Not enough user profiles.' });
  }

  let userIdA = req.query.userId;
  if (!userIdA || !userProfiles[userIdA]) {
    userIdA = userIds[Math.floor(Math.random() * userIds.length)];
  }
  
  const candidates = [];
  for (const userIdB of userIds) {
    if (userIdB === userIdA) continue;
    const details = computeMatchDetails(userIdA, userIdB);
    if (details) {
      candidates.push({
        user_b_id: userIdB,
        compatibility_pct: details.compatibility_pct,
        details: details
      });
    }
  }
  
  // Sort by compatibility descending
  candidates.sort((a, b) => b.compatibility_pct - a.compatibility_pct);
  
  let skipCount = parseInt(req.query.skipCount) || 0;
  if (skipCount >= candidates.length) {
    skipCount = skipCount % candidates.length;
  }
  
  const matchResult = candidates[skipCount];
  res.json(matchResult.details);
});

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Active live queue for online users
// Array of { socketId, userId }
let activeQueue = [];

// Socket.io Event Handling
io.on('connection', (socket) => {
  let activeRoom = null;
  console.log(`Socket connected: ${socket.id}`);

  socket.on('join-queue', ({ userId }) => {
    // Remove duplicate sockets for this user in queue if any
    activeQueue = activeQueue.filter(u => u.socketId !== socket.id);
    
    console.log(`User ${userId} joined live matchmaking queue (Socket: ${socket.id})`);
    
    // Try to pair with another waiting user in the queue
    const otherWaiting = activeQueue.find(u => u.userId !== userId);
    
    if (otherWaiting) {
      // Remove the matched user from the queue
      activeQueue = activeQueue.filter(u => u.socketId !== otherWaiting.socketId);
      
      console.log(`Live match found! User ${userId} <-> User ${otherWaiting.userId}`);
      
      // Calculate dynamic match details
      const matchPayload = computeMatchDetails(userId, otherWaiting.userId);
      
      // Broadcast match-found to both users
      socket.emit('match-found', matchPayload);
      io.to(otherWaiting.socketId).emit('match-found', matchPayload);
    } else {
      // Add to queue
      activeQueue.push({ socketId: socket.id, userId });
      console.log(`Active Queue length: ${activeQueue.length}`);
    }
  });

  socket.on('leave-queue', () => {
    activeQueue = activeQueue.filter(u => u.socketId !== socket.id);
    console.log(`Socket ${socket.id} left queue`);
  });

  socket.on('join-room', (roomId) => {
    if (activeRoom) {
      socket.leave(activeRoom);
    }
    activeRoom = roomId;
    socket.join(activeRoom);
    console.log(`Socket ${socket.id} joined room: ${activeRoom}`);
  });

  socket.on('chat-message', (msg) => {
    if (activeRoom) {
      socket.to(activeRoom).emit('chat-message', msg);
    }
  });
  
  socket.on('disconnect', () => {
    activeQueue = activeQueue.filter(u => u.socketId !== socket.id);
    console.log(`Socket disconnected: ${socket.id}`);
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
