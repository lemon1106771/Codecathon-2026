// Application State
const state = {
  currentUserId: 209,
  currentMode: 'sync',
  currentMatch: null,
  socket: null,
  isConnected: false,
  users: [],
  history: [], // Stores previous matches in this session
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
  screenStats: document.getElementById('screen-stats'),
  screenHistory: document.getElementById('screen-history'),
  
  // Navigation & Headers
  sidebarNav: document.getElementById('sidebar-nav'),
  globalHeader: document.getElementById('global-header'),
  statusDot: document.getElementById('status-dot'),
  statusText: document.getElementById('status-text'),
  currentUserAvatar: document.getElementById('current-user-avatar'),
  searchInput: document.getElementById('search-input'),
  btnBell: document.getElementById('btn-bell'),
  btnSettings: document.getElementById('btn-settings'),
  notificationsPanel: document.getElementById('notifications-panel'),
  
  // Modals
  settingsModal: document.getElementById('settings-modal'),
  btnCloseSettings: document.getElementById('btn-close-settings'),
  btnThemeToggle: document.getElementById('btn-theme-toggle'),
  themeBtnIcon: document.getElementById('theme-btn-icon'),
  
  // Home Screen Mode select
  btnLandingSync: document.getElementById('btn-landing-sync'),
  btnLandingShuffle: document.getElementById('btn-landing-shuffle'),
  
  // Home Screen Details
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
  mbtiTypeBadge: document.getElementById('mbti-type-badge'),
  mbtiTypeTitle: document.getElementById('mbti-type-title'),
  mbtiTypeDesc: document.getElementById('mbti-type-desc'),
  mbtiDimVal1: document.getElementById('mbti-dim-val-1'),
  mbtiDimFill1: document.getElementById('mbti-dim-fill-1'),
  mbtiDimVal2: document.getElementById('mbti-dim-val-2'),
  mbtiDimFill2: document.getElementById('mbti-dim-fill-2'),
  mbtiDimVal3: document.getElementById('mbti-dim-val-3'),
  mbtiDimFill3: document.getElementById('mbti-dim-fill-3'),
  mbtiDimVal4: document.getElementById('mbti-dim-val-4'),
  mbtiDimFill4: document.getElementById('mbti-dim-fill-4'),
  mbtiLogicExplanation: document.getElementById('mbti-logic-explanation'),
  
  // Queue Screen
  queueHeaderTitle: document.getElementById('queue-header-title'),
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
  barFill3: document.getElementById('bar-fill-3'),

  // Stats Screen Lists
  statsCategoriesList: document.getElementById('stats-categories-list'),
  statsPlaylistsList: document.getElementById('stats-playlists-list'),
  statsUsersList: document.getElementById('stats-users-list'),

  // History Screen Elements
  historyContainer: document.getElementById('history-container'),
  historyEmptyState: document.getElementById('history-empty-state'),
  historyList: document.getElementById('history-list')
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
  [el.screenHome, el.screenQueue, el.screenReveal, el.screenChat, el.screenStats, el.screenHistory].forEach(screen => {
    if (screen) screen.classList.add('hidden');
  });
  
  // Show target screen
  const target = document.getElementById(screenId);
  if (target) target.classList.remove('hidden');
  
  // Show/Hide top header
  if (screenId === 'screen-chat') {
    el.globalHeader.classList.add('hidden');
  } else {
    el.globalHeader.classList.remove('hidden');
  }
  
  // Update sidebar active status
  document.querySelectorAll('.nav-item').forEach(item => {
    item.className = "nav-item flex items-center gap-6 px-6 py-4 text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-all cursor-pointer dark:text-zinc-400";
  });
  
  let activeNavId = 'home';
  if (screenId === 'screen-queue') activeNavId = 'queue';
  else if (screenId === 'screen-reveal') activeNavId = 'compatibility';
  else if (screenId === 'screen-stats') activeNavId = 'stats';
  else if (screenId === 'screen-history') activeNavId = 'history';
  else if (screenId === 'screen-chat') activeNavId = 'queue';
  
  let activeNav = null;
  if (activeNavId === 'home') activeNav = el.sidebarNav.children[0];
  else if (activeNavId === 'queue') activeNav = el.sidebarNav.children[1];
  else if (activeNavId === 'compatibility') activeNav = el.sidebarNav.children[2];
  else if (activeNavId === 'stats') activeNav = el.sidebarNav.children[3];
  else if (activeNavId === 'history') activeNav = el.sidebarNav.children[4];
  
  if (activeNav) {
    activeNav.className = "nav-item flex items-center gap-6 px-6 py-4 text-primary font-bold border-r-4 border-primary bg-primary-container/5 transition-all cursor-pointer";
  }

  // Load specific screen resources
  if (screenId === 'screen-stats') {
    loadLeaderboardStats();
  } else if (screenId === 'screen-history') {
    renderHistoryScreen();
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
    
    // Render dynamic MBTI profile details
    const mbti = details.mbti;
    if (mbti) {
      el.mbtiTypeBadge.textContent = mbti.type;
      el.mbtiTypeTitle.textContent = mbti.description.split(':')[0] || "The Explorer";
      el.mbtiTypeDesc.textContent = mbti.description.split(':')[1] || mbti.description;
      
      el.mbtiDimVal1.textContent = `${mbti.dimensions.introversion}% Quiet (I) vs ${100 - mbti.dimensions.introversion}% Social (E)`;
      el.mbtiDimFill1.style.width = `${mbti.dimensions.introversion}%`;
      
      el.mbtiDimVal2.textContent = `${mbti.dimensions.intuition}% Conceptual (N) vs ${100 - mbti.dimensions.intuition}% Practical (S)`;
      el.mbtiDimFill2.style.width = `${mbti.dimensions.intuition}%`;
      
      el.mbtiDimVal3.textContent = `${mbti.dimensions.thinking}% Analytical (T) vs ${100 - mbti.dimensions.thinking}% Feeling (F)`;
      el.mbtiDimFill3.style.width = `${mbti.dimensions.thinking}%`;
      
      el.mbtiDimVal4.textContent = `${mbti.dimensions.judging}% Structured (J) vs ${100 - mbti.dimensions.judging}% Casual (P)`;
      el.mbtiDimFill4.style.width = `${mbti.dimensions.judging}%`;
      
      el.mbtiLogicExplanation.textContent = mbti.analysis;
    }
    
  } catch (e) {
    console.error("Error loading user profile:", e);
  }
}

// 2. Queue scanning and transparent Jaccard calculation logs
function startQueueFlow() {
  transitionTo('screen-queue');
  el.dataStreamLog.innerHTML = '';
  
  // Set floating tags
  const tags = ["#VideoEssays", "#LoFiBeats", "#TechReviews", "#BrutalistArt", "#ASMRCode", "#SpaceExploration"];
  el.floatTag1.textContent = tags[state.currentUserId % tags.length];
  el.floatTag2.textContent = tags[(state.currentUserId + 1) % tags.length];
  el.floatTag3.textContent = tags[(state.currentUserId + 2) % tags.length];
  
  el.queueHeaderTitle.textContent = state.currentMode === 'sync' ? "Finding Sync Twin..." : "Finding Taste Contrast...";

  // Immediately request match details from the server to get real comparisons
  fetch(`/api/matchmake?user_a=${state.currentUserId}&mode=${state.currentMode}`)
    .then(res => res.json())
    .then(match => {
      state.currentMatch = match;
      
      // Save to history log
      const now = new Date();
      state.history.push({
        match_id: match.match_id,
        user_b: match.user_b,
        compatibility_pct: match.compatibility_pct,
        timestamp: `${now.toLocaleString('default', { month: 'short' })} ${now.getDate()} • ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`,
        shared_interests: match.shared_interests,
        details: match
      });

      // Construct a sequence of realistic logs using the actual comparison data
      const logLines = [
        { text: `[INIT] User ${state.currentUserId} joined matchmaking queue in ${state.currentMode.toUpperCase()} mode...` },
        { text: `[LOAD] Reading watch logs for User ${state.currentUserId} from database...` },
        { text: `[INFO] User ${state.currentUserId} watches: ${el.dnaChips.children.length} distinct category clusters.` }
      ];

      // Insert real candidate evaluations returned by the server
      if (match.comparisons && match.comparisons.length > 0) {
        logLines.push({ text: `[CALC] Scanning all 243 active candidates...` });
        logLines.push({ text: `[CALC] Formula: Overlap_Coeff = (SetA ∩ SetB) / min(|SetA|, |SetB|)` });
        
        match.comparisons.forEach(c => {
          logLines.push({
            text: `[COMP] Candidate User ${c.user_id} (${c.watch_count} views): shared = ${c.shared_count}. Jaccard overlap = ${c.overlap_coeff.toFixed(4)} -> Rank: ${c.compatibility_pct}%`,
            highlight: c.user_id === match.user_b
          });
        });
      }

      logLines.push({ text: `[MATCH] Selection complete. Best twin is User ${match.user_b} (shared = ${match.shared_video_count} videos).` });
      logLines.push({ text: `[MATH] Normalizing raw Jaccard index into percentile: ${match.compatibility_pct}% Match.` });
      logLines.push({ text: `[RESOLVE] Mapping mutual watch history items in CSV...` });
      logLines.push({ text: `[SYNC] Secure WebSocket room configured. Matching complete.`, success: true });

      let logIdx = 0;
      state.logInterval = setInterval(() => {
        if (logIdx < logLines.length) {
          const item = logLines[logIdx];
          const div = document.createElement('div');
          
          if (item.highlight) {
            div.className = "text-primary font-bold animate-pulse";
          } else if (item.success) {
            div.className = "text-secondary font-bold";
          } else {
            div.className = "text-zinc-600 dark:text-zinc-400";
          }
          
          div.textContent = item.text;
          el.dataStreamLog.appendChild(div);
          el.dataStreamLog.scrollTop = el.dataStreamLog.scrollHeight;
          logIdx++;
        } else {
          // Calculation logs finished, transition to Reveal
          clearInterval(state.logInterval);
          setTimeout(() => {
            showRevealScreen(match);
          }, 600);
        }
      }, 350);

    })
    .catch(err => {
      console.error("Matchmaking error:", err);
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
    matchSummary = "Your digital footprints are nearly identical. You both prioritize high-fidelity video essays, tech curations, and obscure analytical topics.";
  } else if (pct < 70) {
    matchHeadline = "Curious Opposites";
    matchSummary = "Your tastes are far apart. You will introduce each other to completely fresh and unexpected content domains outside your regular bubbles.";
  }
  
  el.revealHeadline.textContent = matchHeadline;
  el.revealMatchSummary.textContent = matchSummary;
  
  // Set reveal title and timestamp
  el.revealTitle.textContent = pct >= 90 ? "Unprecedented Sync" : pct >= 70 ? "Balanced Frequency" : "Contrast Discovery";
  
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
    state.isConnected = true;
    updateStatusIndicator(true);
  });
  
  state.socket.on('disconnect', () => {
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
        <div class="message-bubble-incoming p-4 rounded-2xl rounded-tl-none font-body-md text-on-surface dark:bg-zinc-700">
          ${text}
        </div>
        <span class="text-[10px] text-outline px-2 font-label-sm">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
      </div>
    `;
  } else {
    wrapper.className = "flex gap-4 max-w-[70%] self-end justify-end";
    wrapper.innerHTML = `
      <div class="space-y-1 text-right">
        <div class="message-bubble-outgoing p-4 rounded-2xl rounded-tr-none font-body-md">
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
  
  const interests = state.currentMatch.shared_interests;
  const mainInterest = interests[0] || "Video Essays";
  
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

// 5. Load YouTube Global Stats Leaderboard
async function loadLeaderboardStats() {
  try {
    const res = await fetch('/api/stats');
    const stats = await res.json();

    // Max counts for progress bar mapping
    const maxCat = stats.top_categories[0].count;
    const maxPlay = stats.top_playlists[0].count;
    const maxUser = stats.top_users[0].watch_count;

    // Categories
    el.statsCategoriesList.innerHTML = '';
    stats.top_categories.forEach((c, idx) => {
      const w = Math.round((c.count / maxCat) * 100);
      const row = document.createElement('div');
      row.className = "space-y-1.5";
      row.innerHTML = `
        <div class="flex justify-between text-xs font-semibold">
          <span>${idx + 1}. ${c.name}</span>
          <span class="text-primary font-mono">${c.count.toLocaleString()} views</span>
        </div>
        <div class="h-2 bg-surface-container rounded-full overflow-hidden">
          <div class="h-full bg-primary" style="width: ${w}%"></div>
        </div>
      `;
      el.statsCategoriesList.appendChild(row);
    });

    // Playlists
    el.statsPlaylistsList.innerHTML = '';
    stats.top_playlists.forEach((p, idx) => {
      const w = Math.round((p.count / maxPlay) * 100);
      const row = document.createElement('div');
      row.className = "space-y-1.5";
      row.innerHTML = `
        <div class="flex justify-between text-xs font-semibold">
          <span>${idx + 1}. ${p.name}</span>
          <span class="text-secondary font-mono">${p.count.toLocaleString()} views</span>
        </div>
        <div class="h-2 bg-surface-container rounded-full overflow-hidden">
          <div class="h-full bg-secondary" style="width: ${w}%"></div>
        </div>
      `;
      el.statsPlaylistsList.appendChild(row);
    });

    // Users
    el.statsUsersList.innerHTML = '';
    stats.top_users.forEach((u, idx) => {
      const w = Math.round((u.watch_count / maxUser) * 100);
      const row = document.createElement('div');
      row.className = "space-y-1.5";
      row.innerHTML = `
        <div class="flex justify-between text-xs font-semibold">
          <span>${idx + 1}. ${u.username}</span>
          <span class="text-primary-container font-mono">${u.watch_count.toLocaleString()} views</span>
        </div>
        <div class="h-2 bg-surface-container rounded-full overflow-hidden">
          <div class="h-full bg-primary-container" style="width: ${w}%"></div>
        </div>
      `;
      el.statsUsersList.appendChild(row);
    });

  } catch (e) {
    console.error("Error loading stats:", e);
  }
}

// 6. Match History Screen
function renderHistoryScreen() {
  if (state.history.length === 0) {
    el.historyEmptyState.classList.remove('hidden');
    el.historyList.classList.add('hidden');
  } else {
    el.historyEmptyState.classList.add('hidden');
    el.historyList.classList.remove('hidden');
    
    el.historyList.innerHTML = '';
    state.history.forEach((h, idx) => {
      const row = document.createElement('div');
      row.className = "glass-card p-6 rounded-2xl flex items-center justify-between hover:scale-[1.01] transition-transform duration-200 border-zinc-100/30";
      
      const strangerName = h.user_b === 102 ? "Mika Valance" : `Stranger #${h.user_b + 4000}`;
      const avatarImg = AVATARS[h.user_b % AVATARS.length];
      
      row.innerHTML = `
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-full overflow-hidden border border-outline-variant/20 shrink-0">
            <img class="w-full h-full object-cover" src="${avatarImg}"/>
          </div>
          <div>
            <h4 class="font-label-md font-bold text-on-surface">${strangerName}</h4>
            <p class="text-[10px] text-on-surface-variant">Matched on ${h.timestamp} • Mode: ${h.details.mode.toUpperCase()}</p>
          </div>
        </div>
        <div class="flex items-center gap-6">
          <div class="text-right">
            <span class="font-display-xl text-lg font-black text-primary">${h.compatibility_pct}%</span>
            <span class="text-[10px] text-on-surface-variant block uppercase leading-none">Overlap</span>
          </div>
          <button class="btn-revisit-chat px-6 py-2.5 bg-primary text-white text-xs font-semibold rounded-full hover:scale-105 transition-all" data-idx="${idx}">
            Reopen Chat
          </button>
        </div>
      `;
      
      // Bind revisit chat button
      row.querySelector('.btn-revisit-chat').addEventListener('click', () => {
        state.currentMatch = h.details;
        startChatSession();
      });
      
      el.historyList.appendChild(row);
    });
  }
}

// 7. Search box filtering - selects user profile matching typed category
function handleSearchInput(query) {
  const term = query.toLowerCase().trim();
  if (!term) return;

  // Attempt to find a user in the loaded user list whose categories or details contain this string
  fetch('/api/users')
    .then(res => res.json())
    .then(async (users) => {
      for (const u of users) {
        // Fetch details of user
        const detailRes = await fetch(`/api/user/${u.user_id}`);
        const details = await detailRes.json();
        
        const matched = details.top_categories.some(cat => cat.toLowerCase().includes(term)) ||
                        u.username.toLowerCase().includes(term);
        
        if (matched) {
          el.userSelect.value = u.user_id;
          handleUserChange(u.user_id);
          
          // Flash select input to show selection
          el.userSelect.classList.add('ring-4', 'ring-primary');
          setTimeout(() => el.userSelect.classList.remove('ring-4', 'ring-primary'), 1000);
          
          // Clear search
          el.searchInput.value = '';
          return;
        }
      }
      
      // No profile found
      alert(`No active profile matches interest: "${query}"`);
      el.searchInput.value = '';
    });
}

// Event Bindings
document.addEventListener('DOMContentLoaded', () => {
  loadUsers();
  transitionTo('screen-home');
  
  // User dropdown changes
  el.userSelect.addEventListener('change', (e) => {
    handleUserChange(e.target.value);
  });
  
  // Mode selection buttons on landing hero
  el.btnLandingSync.addEventListener('click', () => {
    state.currentMode = 'sync';
    el.btnLandingSync.className = "mode-btn px-6 py-3 rounded-full font-label-md text-sm font-semibold transition-all bg-primary text-white";
    el.btnLandingShuffle.className = "mode-btn px-6 py-3 rounded-full font-label-md text-sm font-semibold transition-all text-on-surface-variant hover:text-primary dark:text-zinc-400";
  });
  
  el.btnLandingShuffle.addEventListener('click', () => {
    state.currentMode = 'shuffle';
    el.btnLandingShuffle.className = "mode-btn px-6 py-3 rounded-full font-label-md text-sm font-semibold transition-all bg-primary text-white";
    el.btnLandingSync.className = "mode-btn px-6 py-3 rounded-full font-label-md text-sm font-semibold transition-all text-on-surface-variant hover:text-primary dark:text-zinc-400";
  });
  
  // Matchmaking trigger
  el.btnStartQueue.addEventListener('click', () => {
    startQueueFlow();
  });
  
  // Sidebar navigation clicks
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetScreen = item.getAttribute('data-screen');
      
      // Clean socket if leaving chat
      if (state.socket) {
        state.socket.disconnect();
        state.socket = null;
      }
      
      if (targetScreen) {
        transitionTo(targetScreen === 'reveal' ? 'screen-reveal' : targetScreen === 'stats' ? 'screen-stats' : targetScreen === 'history' ? 'screen-history' : 'screen-home');
      }
    });
  });
  
  // Cancel queue search
  el.btnStopSearch.addEventListener('click', () => {
    clearInterval(state.logInterval);
    transitionTo('screen-home');
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
  
  // Leave Chat room
  el.btnChatSkip.addEventListener('click', () => {
    if (state.socket) {
      state.socket.disconnect();
      state.socket = null;
    }
    transitionTo('screen-home');
  });

  // Settings Modal controls
  el.btnSettings.addEventListener('click', () => {
    el.settingsModal.classList.remove('hidden');
  });
  
  el.btnCloseSettings.addEventListener('click', () => {
    el.settingsModal.classList.add('hidden');
  });
  
  // Settings modal backdrop click to close
  el.settingsModal.addEventListener('click', (e) => {
    if (e.target === el.settingsModal) el.settingsModal.classList.add('hidden');
  });

  // Theme switch button
  el.btnThemeToggle.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark');
    document.documentElement.classList.toggle('dark');
    el.themeBtnIcon.textContent = isDark ? "light_mode" : "dark_mode";
  });

  // Notifications dropdown panel toggle
  el.btnBell.addEventListener('click', (e) => {
    e.stopPropagation();
    el.notificationsPanel.classList.toggle('hidden');
  });

  // Close notifications panel on body click
  document.body.addEventListener('click', () => {
    el.notificationsPanel.classList.add('hidden');
  });

  // Search box listener on Enter key press
  el.searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleSearchInput(el.searchInput.value);
    }
  });
});
