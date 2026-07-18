// Frequency - taste-based stranger chat server
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const matches = require('./matches.json');

const app = express();
app.use(cors());

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// API Endpoint to get a random precomputed match pair
app.get('/api/match', (req, res) => {
  const pairs = matches.pairs;
  const randomPair = pairs[Math.floor(Math.random() * pairs.length)];
  res.json(randomPair);
});

// For Render health checks
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Route everything else to index.html (Single Page App routing support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const server = http.createServer(app);
const io = new Server(server, { 
  cors: { 
    origin: '*',
    methods: ['GET', 'POST']
  } 
});

// Socket.io real-time chat logic
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  // All clients join the single hardcoded room for the demo
  socket.join('demo-room');
  
  // Relay messages between connected clients in the demo room
  socket.on('chat-message', (msg) => {
    socket.to('demo-room').emit('chat-message', msg);
  });
  
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Use process.env.PORT for Render, fallback to 3001
const PORT = process.env.PORT || 3001;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`==================================================`);
  console.log(`  Frequency chat server running on port ${PORT}`);
  console.log(`  Local Address: http://localhost:${PORT}`);
  console.log(`==================================================`);
});
