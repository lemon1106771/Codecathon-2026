// Frequency - chat server
// GEMINI: build this out. Scope is intentionally minimal - see README.md.
//
// Requirements:
// 1. Express + Socket.io server, single hardcoded room (no auth, no multi-room routing needed)
// 2. Serve data/matches.json at GET /api/match (return one random pair from data/matches.json)
// 3. Socket.io: on connection, join the single hardcoded room "demo-room"
//    - relay "chat-message" events between the two connected clients in that room
//    - no message persistence, no history needed
// 4. That's it. Do not add auth, database, or multi-room logic - out of scope for this demo.

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const matches = require('../data/matches.json');

const app = express();
app.use(cors());

app.get('/api/match', (req, res) => {
  const pairs = matches.pairs;
  const random = pairs[Math.floor(Math.random() * pairs.length)];
  res.json(random);
});

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

io.on('connection', (socket) => {
  socket.join('demo-room');
  socket.on('chat-message', (msg) => {
    socket.to('demo-room').emit('chat-message', msg);
  });
});

const PORT = 3001;
server.listen(PORT, () => console.log(`Frequency server running on ${PORT}`));
