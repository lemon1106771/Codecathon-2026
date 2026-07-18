// Application State & UI elements
const state = {
  currentMatch: null,
  socket: null,
  isConnected: false
};

const el = {
  screenQueue: document.getElementById('screen-queue'),
  screenReveal: document.getElementById('screen-reveal'),
  screenChat: document.getElementById('screen-chat'),
  
  revealScore: document.getElementById('reveal-score'),
  matchUsername: document.getElementById('match-username'),
  sharedInterests: document.getElementById('shared-interests'),
  blindSpotSelf: document.getElementById('blind-spot-self'),
  blindSpotStranger: document.getElementById('blind-spot-stranger'),
  
  btnStartChat: document.getElementById('btn-start-chat'),
  btnSkip: document.getElementById('btn-skip'),
  
  chatAvatarChar: document.getElementById('chat-avatar-char'),
  chatStrangerName: document.getElementById('chat-stranger-name'),
  chatCompatibilityPct: document.getElementById('chat-compatibility-pct'),
  chatMessages: document.getElementById('chat-messages'),
  chatForm: document.getElementById('chat-form'),
  chatInput: document.getElementById('chat-input'),
  networkStatus: document.getElementById('network-status')
};

// Transition between screens
function showScreen(screenId) {
  [el.screenQueue, el.screenReveal, el.screenChat].forEach(screen => {
    screen.classList.remove('active');
  });
  
  const targetScreen = document.getElementById(screenId);
  if (targetScreen) {
    targetScreen.classList.add('active');
  }
}

// Fetch a random match from the server
async function fetchMatch() {
  try {
    const res = await fetch('/api/match');
    if (!res.ok) throw new Error('Failed to fetch match');
    state.currentMatch = await res.json();
    populateMatchUI(state.currentMatch);
  } catch (error) {
    console.error('Error fetching match:', error);
    // Fallback static data if API fails
    state.currentMatch = {
      match_id: "m1",
      user_a: 209,
      user_b: 102,
      compatibility_pct: 100,
      shared_interests: ["Gaming Tutorials", "Movie Analysis", "Tech Reviews"],
      blind_spot_a: ["Space Exploration (from User 102's rotation)"],
      blind_spot_b: ["Yoga & Meditation (from User 209's rotation)"]
    };
    populateMatchUI(state.currentMatch);
  }
}

// Populate the Reveal screen with match details
function populateMatchUI(match) {
  el.revealScore.textContent = `${Math.round(match.compatibility_pct)}%`;
  
  // Clean Username for stranger (e.g. Stranger #4102)
  const username = `Stranger #${match.user_b + 4000}`;
  el.matchUsername.textContent = username;
  
  // Set Chat header details too
  el.chatStrangerName.textContent = username;
  el.chatAvatarChar.textContent = username.charAt(10) || 'S'; // Get a number or 'S'
  el.chatCompatibilityPct.textContent = `${Math.round(match.compatibility_pct)}% overlap`;

  // Render Shared Interests
  el.sharedInterests.innerHTML = '';
  match.shared_interests.forEach(interest => {
    const chip = document.createElement('span');
    chip.className = 'interest-chip';
    chip.textContent = interest;
    el.sharedInterests.appendChild(chip);
  });

  // Render Blind Spots
  // blind_spot_a corresponds to user_a (You), blind_spot_b is user_b (Stranger)
  el.blindSpotSelf.textContent = match.blind_spot_a[0] || 'None';
  el.blindSpotStranger.textContent = match.blind_spot_b[0] || 'None';
}

// Connect to Socket.io chat server
function connectSocket() {
  if (state.socket) return;

  // Connect to the root server (which serves this app)
  state.socket = io();

  state.socket.on('connect', () => {
    console.log('Connected to socket server');
    state.isConnected = true;
    updateNetworkStatus(true);
  });

  state.socket.on('disconnect', () => {
    console.log('Disconnected from socket server');
    state.isConnected = false;
    updateNetworkStatus(false);
  });

  // Listen for incoming messages
  state.socket.on('chat-message', (msg) => {
    appendMessage(msg, 'received');
  });
}

function updateNetworkStatus(online) {
  if (online) {
    el.networkStatus.classList.remove('offline');
    el.networkStatus.querySelector('.status-text').textContent = 'Connected';
  } else {
    el.networkStatus.classList.add('offline');
    el.networkStatus.querySelector('.status-text').textContent = 'Offline';
  }
}

// Append message bubble to chat window
function appendMessage(text, type) {
  const msgEl = document.createElement('div');
  msgEl.className = `message ${type}`;
  msgEl.textContent = text;
  
  el.chatMessages.appendChild(msgEl);
  el.chatMessages.scrollTop = el.chatMessages.scrollHeight;
}

// Start match finding flow
function initMatchFlow() {
  showScreen('screen-queue');
  
  // 1. Fetch match data immediately in background
  fetchMatch();
  
  // 2. Fake loading delay to build suspense (~3.5 seconds)
  setTimeout(() => {
    showScreen('screen-reveal');
  }, 3500);
}

// Event Listeners
el.btnStartChat.addEventListener('click', () => {
  showScreen('screen-chat');
  connectSocket();
  
  // Reset chat message window
  el.chatMessages.innerHTML = `
    <div class="system-message">
      You are now connected. Say hello!
    </div>
  `;
});

el.chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const msg = el.chatInput.value.trim();
  if (!msg) return;

  // Send message locally
  appendMessage(msg, 'sent');
  el.chatInput.value = '';

  // Emit message to other client through socket
  if (state.socket && state.isConnected) {
    state.socket.emit('chat-message', msg);
  }
});

el.btnSkip.addEventListener('click', () => {
  // Disconnect active socket
  if (state.socket) {
    state.socket.disconnect();
    state.socket = null;
  }
  
  // Restart flow
  initMatchFlow();
});

// Start the app on load
window.addEventListener('DOMContentLoaded', () => {
  initMatchFlow();
});
