// Application State
const state = {
  currentUserId: 209,
  currentMode: 'sync',
  currentMatch: null,
  socket: null,
  isConnected: false,
  users: [],
  logInterval: null,
  chatSimTimeout: null
};

// UI Elements
const el = {
  // Screens
  screenHome: document.getElementById('screen-home'),
  screenQueue: document.getElementById('screen-queue'),
  screenReveal: document.getElementById('screen-reveal'),
  screenChat: document.getElementById('screen-chat'),
  
  // Navigation & Headers
  sidebarNav: document.getElementById('sidebar-nav'),
  globalHeader: document.getElementById('global-header'),
  statusDot: document.getElementById('status-dot'),
  statusText: document.getElementById('status-text'),
  currentUserAvatar: document.getElementById('current-user-avatar'),
  
  // Home Screen
  userSelect: document.getElementById('user-select'),
  btnStartQueue: document.getElementById('btn-start-queue'),
  dnaTitle: document.getElementById('dna-title'),
  dnaDescription: document.getElementById('dna-description'),
  dnaChips: document.getElementById('dna-chips'),
  radarPolygon: document.getElementById('radar-polygon'),
  dnaCategory1: document.getElementById('dna-category-1'),
  axis1: document.getElementById('axis-1'),
  axis2: document.getElementById('axis-2'),
  axis3: document.getElementById('axis-3'),
  axis4: document.getElementById('axis-4'),
  
  // Queue Screen
  btnModeSync: document.getElementById('btn-mode-sync'),
  btnModeShuffle: document.getElementById('btn-mode-shuffle'),
  btnStopSearch: document.getElementById('btn-stop-search'),
  dataStreamLog: document.getElementById('data-stream-log'),
  floatTag1: document.getElementById('float-tag-1'),
  floatTag2: document.getElementById('float-tag-2'),
  floatTag3: document.getElementById('float-tag-3'),
  
  // Reveal Screen
  revealTitle: document.getElementById('reveal-title'),
  revealTimestamp: document.getElementById('reveal-timestamp'),
  revealMatchPct: document.getElementById('reveal-match-pct'),
  revealCircleStroke: document.getElementById('reveal-circle-stroke'),
  revealHeadline: document.getElementById('reveal-headline'),
  revealMatchSummary: document.getElementById('reveal-match-summary'),
  revealSharedChips: document.getElementById('reveal-shared-chips'),
  revealBlindStranger: document.getElementById('reveal-blind-stranger'),
  revealBlindSelf: document.getElementById('reveal-blind-self'),
  revealStrangerImage: document.getElementById('reveal-stranger-image'),
  revealStrangerName: document.getElementById('reveal-stranger-name'),
  revealStrangerActive: document.getElementById('reveal-stranger-active'),
  revealStrangerBio: document.getElementById('reveal-stranger-bio'),
  revealStrangerTopCat: document.getElementById('reveal-stranger-top-cat'),
  revealStrangerWatchCount: document.getElementById('reveal-stranger-watch-count'),
  revealTimelineList: document.getElementById('reveal-timeline-list'),
  btnInitiateChat: document.getElementById('btn-initiate-chat'),
  
  // Chat Screen
  chatSidebarNames: document.getElementById('chat-sidebar-names'),
  chatSidebarCircleStroke: document.getElementById('chat-sidebar-circle-stroke'),
  chatSidebarPct: document.getElementById('chat-sidebar-pct'),
  chatSidebarInterests: document.getElementById('chat-sidebar-interests'),
  chatHeaderAvatar: document.getElementById('chat-header-avatar'),
  chatHeaderName: document.getElementById('chat-header-name'),
  chatHeaderTyping: document.getElementById('chat-header-typing'),
  chatMsgList: document.getElementById('chat-msg-list'),
  chatMsgForm: document.getElementById('chat-msg-form'),
  chatMsgInput: document.getElementById('chat-msg-input'),
  btnChatSkip: document.getElementById('btn-chat-skip'),
  
  // Skill Bars
  barVal1: document.getElementById('bar-val-1'),
  barFill1: document.getElementById('bar-fill-1'),
  barVal2: document.getElementById('bar-val-2'),
  barFill2: document.getElementById('bar-fill-2'),
  barVal3: document.getElementById('bar-val-3'),
  barFill3: document.getElementById('bar-fill-3')
};

// Profile images from mockups to cycle through
const AVATARS = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDPfyMVEmVOezAclye6RrBuPT-2a_uTtQj4jemyxGUfpvRSnwZZP4X4fZxpf9GteRGnqLfyilOWwERn0aBefTdcMmfS8itjph0iQxbNtP7mQeuGWE5QV6QOXr5EUOUfK57hcCgNunAdJ7-z3R3BYn6Or-EgutUUhP67bQ5yLUdARy4w5zg-AsOjfKEe8SscPnHhfVZgb5nkUsy8YfOC7sN79qXMYostkiCOnNsrlWvAnaV4e-TnaLFu", // Mika
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAf9yFW7nYRVmDLpZxoPY3VlBgQbGEHNJBna_H4II5C2zmspN88VZ2k7xlbzhU661EKwtq9RjMVu3BTetmZY3ttL9HQjR1W34ev_d1e_3AxV0LsRhc2UGELyEM0ejF8Isl3JTtefW1DIbcOXjoQOFuYSW5PsgU7OYKOdgeNOVtZKdTLcp1a5-uEWVco2u5cZJFWfu23kdbjoobkRBRtJbKuJVs7qVnXeCDpI3MtKn96tfdIbUQ6sbth", // Alex
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDDHnO8-aBrdd6p7kmwZW9ZjVYqHNyRfbxNBLlcwzjMqS7zW2ZGFJGy6m3f0OS2prOOcCEHhnA0vMlDeJDsb-LfmsoyDbP0c0xLFBh8x00J7mlL2siQYLIqrmZnXxlAms_4mkJ5E9uapRIl7iISknIsZtEYrZfLRMnQUhfph9CKU4sUKKozSRMWUfiI33esGCjTpCpmCSFtsEUn-1HBhPd8xg17CukBtFqopSbnCdNXRyhadGYlr7eO"  // Studio
];

// Screen Transitions
function transitionTo(screenId) {
  // Hide all screens
  [el.screenHome, el.screenQueue, el.screenReveal, el.screenChat].forEach(screen => {
    screen.classList.add('hidden');
  });
  
  // Show target screen
  const target = document.getElementById(screenId);
  target.classList.remove('hidden');
  
  // Show/Hide top header
  if (screenId === 'screen-chat') {
    el.globalHeader.classList.add('hidden');
  } else {
    el.globalHeader.classList.remove('hidden');
  }
  
  // Update sidebar active status
  document.querySelectorAll('.nav-item').forEach(item => {
    item.className = "nav-item flex items-center gap-6 px-6 py-4 text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-all";
    const border = item.querySelector('.active-nav-border');
    if (border) border.remove();
  });
  
  let activeNavId = 'home';
  if (screenId === 'screen-queue') activeNavId = 'queue';
  else if (screenId === 'screen-reveal') activeNavId = 'compatibility';
  else if (screenId === 'screen-chat') activeNavId = 'queue';
  
  const activeNav = document.querySelector(`.nav-item[data-screen="${activeNavId}"]`) || 
                    (activeNavId === 'compatibility' ? el.sidebarNav.children[2] : el.sidebarNav.children[1]);
  
  if (activeNav) {
    activeNav.className = "nav-item flex items-center gap-6 px-6 py-4 text-primary font-bold border-r-4 border-primary bg-primary-container/5 transition-all";
  }
}

// 1. Fetch active users list on load
async function loadUsers() {
  try {
    const res = await fetch('/api/users');
    state.users = await res.json();
    
    // Fill user selection dropdown
    el.userSelect.innerHTML = '';
    state.users.forEach(user => {
      const opt = document.createElement('option');
      opt.value = user.user_id;
      opt.textContent = user.username;
      el.userSelect.appendChild(opt);
    });
    
    // Set default value and trigger change
    el.userSelect.value = state.currentUserId;
    handleUserChange(state.currentUserId);
  } catch (e) {
    console.error("Error loading users:", e);
  }
}

// Handle User Change
async function handleUserChange(userId) {
  state.currentUserId = parseInt(userId, 10);
  try {
    const res = await fetch(`/api/user/${userId}`);
    const details = await res.json();
    
    // Update Landing page content
    el.currentUserAvatar.src = AVATARS[userId % AVATARS.length];
    
    const topCat = details.top_categories[0] || "Video Essays";
    el.dnaTitle.textContent = `${topCat} & Curations`;
    el.dnaDescription.textContent = `You spend significant time watching long-form ${topCat.toLowerCase()} videos. Your watch log contains ${details.total_videos} entries in this dataset.`;
    
    el.dnaCategory1.textContent = topCat;
    
    // Fill chips
    el.dnaChips.innerHTML = '';
    details.top_categories.forEach(cat => {
      const chip = document.createElement('div');
      chip.className = "px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-label-md text-label-md";
      chip.textContent = cat;
      el.dnaChips.appendChild(chip);
    });
    
    // Animate radar polygon slightly based on user ID
    const pathSeeds = [
      "M 200,60 L 310,170 L 230,300 L 120,260 L 90,140 Z",
      "M 200,50 L 320,180 L 250,330 L 100,280 L 80,120 Z",
      "M 200,80 L 290,190 L 240,290 L 140,270 L 110,150 Z"
    ];
    el.radarPolygon.setAttribute('d', pathSeeds[userId % pathSeeds.length]);
    
    // Axis labels
    el.axis1.textContent = details.top_categories[0] || "Philosophy";
    el.axis2.textContent = details.top_categories[1] || "Tech";
    el.axis3.textContent = details.top_categories[2] || "ASMR";
    el.axis4.textContent = details.top_categories[3] || "Design";
    
  } catch (e) {
    console.error("Error loading user profile:", e);
  }
}

// 2. Queue scanning and animated logging console
function startQueueFlow() {
  transitionTo('screen-queue');
  el.dataStreamLog.innerHTML = '';
  
  // Set floating tags
  const tags = ["#VideoEssays", "#LoFiBeats", "#TechReviews", "#BrutalistArt", "#ASMRCode", "#SpaceExploration"];
  el.floatTag1.textContent = tags[state.currentUserId % tags.length];
  el.floatTag2.textContent = tags[(state.currentUserId + 1) % tags.length];
  el.floatTag3.textContent = tags[(state.currentUserId + 2) % tags.length];
  
  const logSteps = [
    { text: "ESTABLISHING: handshake with local match pool...", type: "system" },
    { text: `QUERYING: watch history index for User ${state.currentUserId}...`, type: "system" },
    { text: `LOADED: ${el.dnaCategory1.textContent} preference clusters.`, type: "success" },
    { text: "SCANNING: global match pool region_US...", type: "system" },
    { text: "COMPUTING: dynamic intersection arrays...", type: "system" },
    { text: "CALCULATING: co-occurrence matrices for 243 users...", type: "system" },
    { text: "PROCESSING: filter mode delta = 0.05...", type: "system" },
    { text: "SORTING: overlap coefficient vectors...", type: "success" },
    { text: "MATCHING: evaluating candidate percentile ranks...", type: "system" },
    { text: "SUCCESS: secure handshake established.", type: "success" }
  ];
  
  let stepIdx = 0;
  
  // Add a line to the pipeline log every 300ms
  state.logInterval = setInterval(() => {
    if (stepIdx < logSteps.length) {
      const step = logSteps[stepIdx];
      const logItem = document.createElement('div');
      logItem.className = `stream-item ${step.type === 'success' ? 'text-primary font-bold' : ''}`;
      logItem.textContent = step.text;
      el.dataStreamLog.appendChild(logItem);
      el.dataStreamLog.scrollTop = el.dataStreamLog.scrollHeight;
      stepIdx++;
    }
  }, 350);
  
  // Fetch compatibility calculation from matchmake API in the background
  fetch(`/api/matchmake?user_a=${state.currentUserId}&mode=${state.currentMode}`)
    .then(res => res.json())
    .then(match => {
      state.currentMatch = match;
      
      // Delay transition to Reveal screen to let logs animate (min 3.5 seconds)
      setTimeout(() => {
        clearInterval(state.logInterval);
        showRevealScreen(match);
      }, 3600);
    })
    .catch(err => {
      console.error("Matchmaking error:", err);
      // Fallback
      clearInterval(state.logInterval);
      transitionTo('screen-home');
    });
}

// 3. Show Reveal Screen
function showRevealScreen(match) {
  transitionTo('screen-reveal');
  
  const pct = Math.round(match.compatibility_pct);
  el.revealMatchPct.textContent = `${pct}%`;
  
  // Animate circular progress stroke
  const strokeLength = 477.5; // 2 * Math.PI * r (r=76)
  const offset = strokeLength * (1 - pct / 100);
  el.revealCircleStroke.style.strokeDasharray = strokeLength;
  el.revealCircleStroke.style.strokeDashoffset = offset;
  
  // Match Title based on overlap score
  let matchHeadline = "Eclectic Pals";
  let matchSummary = "Your viewing habits intersect on a few core genres, providing a nice balance of shared interests and unique topics to talk about.";
  if (pct >= 90) {
    matchHeadline = "Cinematic Soulmates";
    matchSummary = "Your digital footprints are nearly identical. You both prioritize high-density video essays, tech curations, and obscure analytical topics.";
  } else if (pct < 70) {
    matchHeadline = "Curious Opposites";
    matchSummary = "Your tastes are far apart. You will introduce each other to completely fresh and unexpected content domains outside your regular bubbles.";
  }
  
  el.revealHeadline.textContent = matchHeadline;
  el.revealMatchSummary.textContent = matchSummary;
  
  // Set reveal title and timestamp
  el.revealTitle.textContent = pct >= 90 ? "Unprecedented Sync" : pct >= 70 ? "Balanced Frequency" : "Contrast Discovery";
  const now = new Date();
  el.revealTimestamp.textContent = `${now.toLocaleString('default', { month: 'short' })} ${now.getDate()}, ${now.getFullYear()} • ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  // Clean names
  const strangerId = match.user_b;
  const username = strangerId === 102 ? "Mika Valance" : `Stranger #${strangerId + 4000}`;
  el.revealStrangerName.textContent = username;
  el.revealStrangerActive.textContent = `Active 2m ago • User ID: ${strangerId}`;
  
  // Dynamic categories
  el.revealStrangerTopCat.textContent = match.shared_interests[0] || "Video Essays";
  el.revealStrangerWatchCount.textContent = `${match.shared_video_count} shared views`;
  el.revealStrangerImage.src = AVATARS[strangerId % AVATARS.length];
  
  // Populate shared ground chips
  el.revealSharedChips.innerHTML = '';
  match.shared_interests.forEach(interest => {
    const chip = document.createElement('span');
    chip.className = "px-6 py-2 bg-secondary/10 text-secondary border border-secondary/20 rounded-full font-label-md flex items-center gap-2";
    chip.innerHTML = `<span class="w-1.5 h-1.5 bg-secondary rounded-full"></span> ${interest}`;
    el.revealSharedChips.appendChild(chip);
  });
  
  // Populate blind spots lists
  el.revealBlindStranger.innerHTML = '';
  match.blind_spot_a.forEach(spot => {
    const li = document.createElement('li');
    li.className = "flex items-center gap-2";
    li.innerHTML = `<span class="w-1 h-1 bg-primary rounded-full"></span> ${spot}`;
    el.revealBlindStranger.appendChild(li);
  });
  if (match.blind_spot_a.length === 0) {
    el.revealBlindStranger.innerHTML = '<li class="flex items-center gap-2"><span class="w-1 h-1 bg-primary rounded-full"></span> Gaming Tutorials</li>';
  }
  
  el.revealBlindSelf.innerHTML = '';
  match.blind_spot_b.forEach(spot => {
    const li = document.createElement('li');
    li.className = "flex items-center gap-2";
    li.innerHTML = `<span class="w-1 h-1 bg-primary rounded-full"></span> ${spot}`;
    el.revealBlindSelf.appendChild(li);
  });
  if (match.blind_spot_b.length === 0) {
    el.revealBlindSelf.innerHTML = '<li class="flex items-center gap-2"><span class="w-1 h-1 bg-primary rounded-full"></span> Travel Vlogs</li>';
  }
  
  // Populate Mutual Timeline
  el.revealTimelineList.innerHTML = '';
  match.timeline.forEach((item, idx) => {
    const timelineItem = document.createElement('div');
    timelineItem.className = "relative";
    
    // Choose thumbnail dynamically
    const thumbnail = AVATARS[(idx + strangerId) % AVATARS.length];
    
    timelineItem.innerHTML = `
      <div class="absolute -left-[54px] top-1 w-4 h-4 bg-secondary rounded-full ring-8 ring-background"></div>
      <div class="glass-card rounded-2xl p-6 flex items-center gap-6 hover:scale-[1.01] transition-transform cursor-pointer">
        <div class="w-32 h-20 rounded-lg overflow-hidden bg-surface-container-highest shrink-0">
          <img class="w-full h-full object-cover" src="${thumbnail}"/>
        </div>
        <div>
          <span class="font-label-sm text-label-sm text-on-surface-variant">${item.time_ago}</span>
          <h4 class="font-body-md font-bold text-on-surface">${item.title}</h4>
          <p class="font-label-sm text-on-surface-variant">${item.channel} • ${item.duration}</p>
        </div>
      </div>
    `;
    el.revealTimelineList.appendChild(timelineItem);
  });
}

// 4. Chat Screen flow
function startChatSession() {
  transitionTo('screen-chat');
  
  const match = state.currentMatch;
  const pct = Math.round(match.compatibility_pct);
  const strangerId = match.user_b;
  const username = strangerId === 102 ? "Mika Valance" : `Stranger #${strangerId + 4000}`;
  
  // Set Left Sidebar details
  el.chatSidebarNames.textContent = `${username.split(' ')[0]} & You`;
  el.chatSidebarPct.textContent = `${pct}%`;
  
  // Animate sidebar progress stroke
  const strokeLength = 440; // 2 * Math.PI * r (r=70)
  const offset = strokeLength * (1 - pct / 100);
  el.chatSidebarCircleStroke.style.strokeDasharray = strokeLength;
  el.chatSidebarCircleStroke.style.strokeDashoffset = offset;
  
  // Fill sidebar bar metrics
  el.barVal1.textContent = pct >= 90 ? "High" : pct >= 70 ? "Moderate" : "Low";
  el.barFill1.style.width = `${pct}%`;
  el.barVal2.textContent = pct >= 90 ? "Extreme" : pct >= 70 ? "Significant" : "Subtle";
  el.barFill2.style.width = `${Math.min(pct + 5, 100)}%`;
  el.barVal3.textContent = pct >= 80 ? "Balanced" : "Variable";
  el.barFill3.style.width = `${Math.max(pct - 15, 40)}%`;
  
  // Sidebar Interests list
  el.chatSidebarInterests.innerHTML = '';
  match.shared_interests.forEach(interest => {
    const chip = document.createElement('span');
    chip.className = "px-3 py-1 bg-secondary-container/20 text-secondary border border-secondary/10 rounded-full font-label-sm";
    chip.textContent = interest;
    el.chatSidebarInterests.appendChild(chip);
  });
  
  // Right chat window header details
  el.chatHeaderName.textContent = username;
  el.chatHeaderAvatar.src = AVATARS[strangerId % AVATARS.length];
  el.chatHeaderTyping.textContent = "Online";
  
  // Clean message list
  el.chatMsgList.innerHTML = `
    <div class="text-center my-4">
      <span class="px-4 py-1 bg-outline-variant/10 text-outline text-[11px] rounded-full uppercase tracking-widest font-label-sm">Room Established</span>
    </div>
    <div class="system-message text-center text-xs text-on-surface-variant bg-surface-container-high py-2 px-4 rounded-full max-w-sm mx-auto my-2">
      You are now connected with User ${strangerId}. All logs parsed. Say hello!
    </div>
  `;
  
  // Connect to live Socket.io server
  connectSocket();
}

// Connect Socket
function connectSocket() {
  if (state.socket) return;
  
  state.socket = io();
  
  state.socket.on('connect', () => {
    console.log('Socket.io connected');
    state.isConnected = true;
    updateStatusIndicator(true);
  });
  
  state.socket.on('disconnect', () => {
    console.log('Socket.io disconnected');
    state.isConnected = false;
    updateStatusIndicator(false);
  });
  
  // Relay messages from others
  state.socket.on('chat-message', (msg) => {
    appendChatBubble(msg, 'incoming');
  });
}

function updateStatusIndicator(connected) {
  if (connected) {
    el.statusDot.className = "w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981]";
    el.statusText.textContent = "Connected";
  } else {
    el.statusDot.className = "w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_#F43F5E]";
    el.statusText.textContent = "Disconnected";
  }
}

// Append Chat bubble
function appendChatBubble(text, type) {
  const wrapper = document.createElement('div');
  const strangerId = state.currentMatch.user_b;
  
  if (type === 'incoming') {
    wrapper.className = "flex gap-4 max-w-[70%]";
    wrapper.innerHTML = `
      <div class="w-8 h-8 rounded-full overflow-hidden shrink-0 mt-2">
        <img class="w-full h-full object-cover" src="${AVATARS[strangerId % AVATARS.length]}"/>
      </div>
      <div class="space-y-1">
        <div class="message-bubble-incoming p-4 rounded-2xl rounded-tl-none font-body-md text-on-surface">
          ${text}
        </div>
        <span class="text-[10px] text-outline px-2 font-label-sm">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
      </div>
    `;
  } else {
    wrapper.className = "flex gap-4 max-w-[70%] self-end justify-end";
    wrapper.innerHTML = `
      <div class="space-y-1 text-right">
        <div class="message-bubble-outgoing p-4 rounded-2xl rounded-tr-none font-body-md text-white">
          ${text}
        </div>
        <span class="text-[10px] text-outline px-2 font-label-sm">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
      </div>
    `;
  }
  
  el.chatMsgList.appendChild(wrapper);
  el.chatMsgList.scrollTop = el.chatMsgList.scrollHeight;
}

// Simulated replies for offline demo experience when testing alone
function triggerSimulatedReply(userMsg) {
  clearTimeout(state.chatSimTimeout);
  
  el.chatHeaderTyping.textContent = "Typing...";
  
  // Generate response based on matched user's interests
  const interests = state.currentMatch.shared_interests;
  const mainInterest = interests[0] || "Video Essays";
  const strangerId = state.currentMatch.user_b;
  
  const responses = [
    `I totally agree. Honestly, that's why I spend hours watching ${mainInterest.toLowerCase()} videos.`,
    `Haha, that's wild! Have you seen any other videos in the ${mainInterest.toLowerCase()} category lately?`,
    `Yeah! It's so cool how the algorithm matched us. It said we have a ${Math.round(state.currentMatch.compatibility_pct)}% overlap!`,
    `I was actually just looking at our watch history logs, that Brutalist architecture one was so good.`,
    `Do you watch a lot of other channels? I'm always looking for new things to subscribe to.`
  ];
  
  const randResponse = responses[Math.floor(Math.random() * responses.length)];
  
  state.chatSimTimeout = setTimeout(() => {
    el.chatHeaderTyping.textContent = "Online";
    appendChatBubble(randResponse, 'incoming');
  }, 2000);
}

// Event Bindings
document.addEventListener('DOMContentLoaded', () => {
  // Load users list
  loadUsers();
  
  // Transition home initially
  transitionTo('screen-home');
  
  // User select changes
  el.userSelect.addEventListener('change', (e) => {
    handleUserChange(e.target.value);
  });
  
  // Trigger matchmaking queue
  el.btnStartQueue.addEventListener('click', () => {
    startQueueFlow();
  });
  
  // Sidebar navigation clicks
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetScreen = item.getAttribute('data-screen');
      if (targetScreen === 'home') {
        // Disconnect socket if leaving chat
        if (state.socket) {
          state.socket.disconnect();
          state.socket = null;
        }
        transitionTo('screen-home');
      } else if (targetScreen === 'queue') {
        startQueueFlow();
      }
    });
  });
  
  // Stop queue / Cancel
  el.btnStopSearch.addEventListener('click', () => {
    clearInterval(state.logInterval);
    transitionTo('screen-home');
  });
  
  // Mode selection buttons
  el.btnModeSync.addEventListener('click', () => {
    state.currentMode = 'sync';
    el.btnModeSync.className = "mode-select-btn w-full flex items-center gap-4 p-4 rounded-2xl bg-primary text-white shadow-xl transition-all hover:scale-102";
    el.btnModeShuffle.className = "mode-select-btn w-full flex items-center gap-4 p-4 rounded-2xl glass-card border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-high transition-all";
  });
  
  el.btnModeShuffle.addEventListener('click', () => {
    state.currentMode = 'shuffle';
    el.btnModeShuffle.className = "mode-select-btn w-full flex items-center gap-4 p-4 rounded-2xl bg-primary text-white shadow-xl transition-all hover:scale-102";
    el.btnModeSync.className = "mode-select-btn w-full flex items-center gap-4 p-4 rounded-2xl glass-card border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-high transition-all";
  });
  
  // Initiate Chat click
  el.btnInitiateChat.addEventListener('click', () => {
    startChatSession();
  });
  
  // Chat submit form
  el.chatMsgForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const msgText = el.chatMsgInput.value.trim();
    if (!msgText) return;
    
    appendChatBubble(msgText, 'sent');
    el.chatMsgInput.value = '';
    
    // Send via socket
    if (state.socket && state.isConnected) {
      state.socket.emit('chat-message', msgText);
    }
    
    // Simulate auto response for demo
    triggerSimulatedReply(msgText);
  });
  
  // Skip Chat / Leave Room
  el.btnChatSkip.addEventListener('click', () => {
    if (state.socket) {
      state.socket.disconnect();
      state.socket = null;
    }
    transitionTo('screen-home');
  });
});
