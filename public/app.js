/**
 * Spotify Live Monitor Client Application
 */

// Application State
const state = {
  ws: null,
  reconnectAttempts: 0,
  soundEnabled: true,
  browserNotifsEnabled: false,
  targetName: 'Paul',
  targetUri: '',
  historyOffset: 0,
  historyLimit: 20,
  historySearch: '',
  audioCtx: null,
  currentTrackId: null
};

// DOM Element Selectors
const DOM = {
  ambientGlow: document.getElementById('ambientGlow'),
  targetFriendBadge: document.getElementById('targetFriendBadge'),
  liveStatusPill: document.getElementById('liveStatusPill'),
  liveStatusText: document.getElementById('liveStatusText'),
  soundToggleBtn: document.getElementById('soundToggleBtn'),
  soundIcon: document.getElementById('soundIcon'),
  notifToggleBtn: document.getElementById('notifToggleBtn'),
  simulateBtn: document.getElementById('simulateBtn'),
  settingsBtn: document.getElementById('settingsBtn'),
  
  // Hero Now Playing
  vinylDisc: document.getElementById('vinylDisc'),
  currentAlbumArt: document.getElementById('currentAlbumArt'),
  targetAvatar: document.getElementById('targetAvatar'),
  targetDisplayName: document.getElementById('targetDisplayName'),
  targetListeningStatus: document.getElementById('targetListeningStatus'),
  currentTrackTitle: document.getElementById('currentTrackTitle'),
  currentArtist: document.getElementById('currentArtist'),
  currentAlbumName: document.getElementById('currentAlbumName'),
  currentContextName: document.getElementById('currentContextName'),
  spotifyListenLink: document.getElementById('spotifyListenLink'),
  currentTrackPlayCount: document.getElementById('currentTrackPlayCount'),
  playbackStateBadge: document.getElementById('playbackStateBadge'),
  lastSeenText: document.getElementById('lastSeenText'),
  syncNowBtn: document.getElementById('syncNowBtn'),

  // Stats
  statTotalSongs: document.getElementById('statTotalSongs'),
  statUniqueArtists: document.getElementById('statUniqueArtists'),
  statUniqueTracks: document.getElementById('statUniqueTracks'),
  topTracksList: document.getElementById('topTracksList'),

  // History & Actions
  historyTimeline: document.getElementById('historyTimeline'),
  historySearchInput: document.getElementById('historySearchInput'),
  historyLoading: document.getElementById('historyLoading'),
  exportCsvBtn: document.getElementById('exportCsvBtn'),
  exportJsonBtn: document.getElementById('exportJsonBtn'),
  clearHistoryBtn: document.getElementById('clearHistoryBtn'),
  paginationInfo: document.getElementById('paginationInfo'),
  prevPageBtn: document.getElementById('prevPageBtn'),
  nextPageBtn: document.getElementById('nextPageBtn'),

  // Modal & Settings Form
  settingsModal: document.getElementById('settingsModal'),
  modalCloseBtn: document.getElementById('modalCloseBtn'),
  modalCancelBtn: document.getElementById('modalCancelBtn'),
  settingsForm: document.getElementById('settingsForm'),
  accessTokenInput: document.getElementById('accessTokenInput'),
  tokenStatusHint: document.getElementById('tokenStatusHint'),
  copyCodeSnippetBtn: document.getElementById('copyCodeSnippetBtn'),
  consoleCodeSnippet: document.getElementById('consoleCodeSnippet'),
  spDcInput: document.getElementById('spDcInput'),
  targetNameInput: document.getElementById('targetNameInput'),
  pollIntervalInput: document.getElementById('pollIntervalInput'),
  friendsDropdown: document.getElementById('friendsDropdown'),
  discordWebhookInput: document.getElementById('discordWebhookInput'),
  testWebhookBtn: document.getElementById('testWebhookBtn'),

  toastContainer: document.getElementById('toastContainer')
};

/* ==========================================================================
   Sound Synth Chime (Zero External Audio File Dependencies)
   ========================================================================== */
function playTrackChime() {
  if (!state.soundEnabled) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!state.audioCtx) {
      state.audioCtx = new AudioContext();
    }
    if (state.audioCtx.state === 'suspended') {
      state.audioCtx.resume();
    }

    const now = state.audioCtx.currentTime;
    
    // Smooth pleasant two-tone chime (Major third: C5 -> E5 -> G5)
    const freqs = [523.25, 659.25, 783.99];
    freqs.forEach((freq, index) => {
      const osc = state.audioCtx.createOscillator();
      const gain = state.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.09);

      gain.gain.setValueAtTime(0, now + index * 0.09);
      gain.gain.linearRampToValueAtTime(0.18, now + index * 0.09 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.09 + 0.6);

      osc.connect(gain);
      gain.connect(state.audioCtx.destination);

      osc.start(now + index * 0.09);
      osc.stop(now + index * 0.09 + 0.65);
    });
  } catch (err) {
    console.warn('Audio chime playback failed:', err);
  }
}

/* ==========================================================================
   Browser Desktop Push Notifications
   ========================================================================== */
function initNotifications() {
  if (!('Notification' in window)) return;
  
  if (Notification.permission === 'granted') {
    state.browserNotifsEnabled = true;
    DOM.notifToggleBtn.style.color = 'var(--spotify-green)';
  }
}

async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    showToast('Browser notifications not supported on this device', 'error');
    return;
  }

  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    state.browserNotifsEnabled = true;
    DOM.notifToggleBtn.style.color = 'var(--spotify-green)';
    showToast('🔔 Browser notifications enabled!', 'success');
  } else {
    state.browserNotifsEnabled = false;
    DOM.notifToggleBtn.style.color = 'var(--text-primary)';
    showToast('Notifications denied in browser settings', 'error');
  }
}

function sendBrowserNotification(track, user) {
  if (!state.browserNotifsEnabled || Notification.permission !== 'granted') return;

  const title = `🎵 ${user.name || state.targetName} played a new song!`;
  const options = {
    body: `"${track.track_name || track.name}" by ${track.artist_name || track.artist?.name}`,
    icon: track.album_art_url || track.imageUrl || '/favicon.ico',
    silent: true // synth chime handles audio
  };

  try {
    new Notification(title, options);
  } catch (e) {
    console.error('Failed to show notification', e);
  }
}

/* ==========================================================================
   Toast Notification UI
   ========================================================================== */
function showToast(message, type = 'info', track = null) {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  if (track) {
    toast.innerHTML = `
      <img src="${track.album_art_url || track.imageUrl || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=80&auto=format&fit=crop'}" class="toast-art" alt="art" />
      <div class="toast-body">
        <div class="toast-title">${escapeHtml(track.track_name || track.name)}</div>
        <div class="toast-subtitle">${escapeHtml(track.artist_name || track.artist?.name)}</div>
      </div>
    `;
  } else {
    toast.innerHTML = `<div>${escapeHtml(message)}</div>`;
  }

  DOM.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(40px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

/* ==========================================================================
   WebSocket Connection
   ========================================================================== */
function connectWebSocket() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}`;

  state.ws = new WebSocket(wsUrl);

  state.ws.onopen = () => {
    console.log('[WS] Connected to Live Spotify Monitor');
    state.reconnectAttempts = 0;
    setLiveStatus('active', `Live Monitoring ${state.targetName}`);
  };

  state.ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      handleWsMessage(msg.event, msg.data);
    } catch (e) {
      console.error('Error parsing WebSocket message', e);
    }
  };

  state.ws.onclose = () => {
    setLiveStatus('idle', 'Reconnecting to server...');
    const delay = Math.min(5000, 1000 * Math.pow(1.5, state.reconnectAttempts++));
    setTimeout(connectWebSocket, delay);
  };

  state.ws.onerror = (err) => {
    console.warn('[WS] Socket error', err);
  };
}

function handleWsMessage(event, data) {
  switch (event) {
    case 'initial_state':
      handleInitialState(data);
      break;
    case 'song_changed':
      handleSongChanged(data);
      break;
    case 'presence_update':
      handlePresenceUpdate(data);
      break;
    case 'status_changed':
      handleStatusChanged(data);
      break;
    case 'friends_list':
      populateFriendsDropdown(data);
      break;
  }
}

function setLiveStatus(status, text) {
  DOM.liveStatusPill.className = `live-pill ${status}`;
  DOM.liveStatusText.textContent = text;
}

/* ==========================================================================
   State & UI Handlers
   ========================================================================== */
function handleInitialState(data) {
  if (data.state) {
    handleStatusChanged(data.state);
  }
  if (data.currentPresence) {
    handlePresenceUpdate(data.currentPresence);
  }
  if (data.recentFriends) {
    populateFriendsDropdown(data.recentFriends);
  }
}

function handleStatusChanged(statusData) {
  if (statusData.targetUser && statusData.targetUser.name) {
    state.targetName = statusData.targetUser.name;
    DOM.targetFriendBadge.innerHTML = `Tracking: <strong>${escapeHtml(state.targetName)}</strong>`;
    DOM.targetDisplayName.textContent = state.targetName;
  }

  if (statusData.status === 'waiting_cookie') {
    setLiveStatus('idle', 'Awaiting sp_dc Cookie');
    DOM.currentArtist.textContent = 'Click "Settings & Cookie" in top right to connect Spotify';
  } else if (statusData.status === 'error') {
    setLiveStatus('error', statusData.lastError || 'Monitor Error');
  } else if (statusData.status === 'running') {
    setLiveStatus('active', `Live Monitoring ${state.targetName}`);
  }
}

function handlePresenceUpdate(presence) {
  if (!presence) return;

  const now = Date.now();
  DOM.lastSeenText.textContent = `Last active: ${new Date().toLocaleTimeString()}`;

  if (presence.isListening && presence.track) {
    const track = presence.track;
    const user = presence.user || {};

    DOM.playbackStateBadge.textContent = '● LIVE PLAYBACK';
    DOM.playbackStateBadge.style.color = 'var(--spotify-green)';
    DOM.playbackStateBadge.style.background = 'rgba(30, 215, 96, 0.12)';

    DOM.vinylDisc.classList.add('playing');
    DOM.targetListeningStatus.textContent = 'Listening on Spotify right now';

    DOM.currentTrackTitle.textContent = track.name || 'Unknown Song';
    DOM.currentArtist.textContent = track.artist?.name || 'Unknown Artist';
    DOM.currentAlbumName.textContent = `Album: ${track.album?.name || '—'}`;
    DOM.currentContextName.textContent = track.context?.name ? `Context: ${track.context.name}` : 'Direct Play';

    if (track.imageUrl) {
      DOM.currentAlbumArt.src = track.imageUrl;
    }
    if (user.imageUrl) {
      DOM.targetAvatar.src = user.imageUrl;
    }
    if (user.name) {
      DOM.targetDisplayName.textContent = user.name;
    }

    if (track.url) {
      DOM.spotifyListenLink.href = track.url;
      DOM.spotifyListenLink.style.display = 'inline-flex';
    }

    DOM.currentTrackPlayCount.textContent = `Play #${presence.totalPlays || 1}`;

    // Update document title
    document.title = `🎵 ${track.name} - ${user.name || state.targetName} | Spotify Live Monitor`;

  } else {
    // Offline or paused
    DOM.vinylDisc.classList.remove('playing');
    DOM.playbackStateBadge.textContent = '○ OFFLINE / PAUSED';
    DOM.playbackStateBadge.style.color = 'var(--text-muted)';
    DOM.playbackStateBadge.style.background = 'rgba(255, 255, 255, 0.05)';
    DOM.targetListeningStatus.textContent = presence.statusText || 'Not playing currently';
    document.title = `Spotify Live Monitor • Tracking ${state.targetName}`;
  }
}

function handleSongChanged(data) {
  const track = data.track;
  const user = data.user || { name: state.targetName };

  // Play audio chime and send browser notification
  playTrackChime();
  sendBrowserNotification(track, user);
  showToast(`New song detected for ${user.name}!`, 'success', track);

  // Refresh history and stats view
  loadHistory();
  loadStats();
}

/* ==========================================================================
   Data Fetching: History & Stats
   ========================================================================== */
async function loadStatus() {
  try {
    const res = await fetch('/api/status');
    const data = await res.json();

    if (data.config) {
      if (data.config.target_friend_name) {
        state.targetName = data.config.target_friend_name;
        DOM.targetNameInput.value = state.targetName;
        DOM.targetFriendBadge.innerHTML = `Tracking: <strong>${escapeHtml(state.targetName)}</strong>`;
        DOM.targetDisplayName.textContent = state.targetName;
      }
      if (data.config.poll_interval_sec) {
        DOM.pollIntervalInput.value = data.config.poll_interval_sec;
      }
      if (data.config.discord_webhook_url) {
        DOM.discordWebhookInput.value = data.config.discord_webhook_url;
      }
      if (data.config.has_access_token) {
        DOM.tokenStatusHint.innerHTML = `✅ <strong>Connected with Web Token</strong> (ends in ${data.config.access_token_preview}).`;
      } else if (data.config.has_sp_dc) {
        DOM.tokenStatusHint.innerHTML = `✅ <strong>Connected with Cookie</strong> (ends in ${data.config.sp_dc_preview}).`;
      }
    }

    if (data.stats) {
      renderStats(data.stats);
    }
    if (data.presence) {
      handlePresenceUpdate(data.presence);
    }
    if (data.recentFriends) {
      populateFriendsDropdown(data.recentFriends);
    }
  } catch (err) {
    console.error('Failed to load status', err);
  }
}

async function loadHistory() {
  try {
    const url = new URL('/api/history', window.location.origin);
    url.searchParams.set('limit', state.historyLimit);
    url.searchParams.set('offset', state.historyOffset);
    if (state.historySearch) {
      url.searchParams.set('search', state.historySearch);
    }

    const res = await fetch(url);
    const data = await res.json();
    renderHistory(data);
  } catch (err) {
    console.error('Failed to load history', err);
    DOM.historyTimeline.innerHTML = `<div class="empty-timeline-state"><p>Error loading history</p></div>`;
  }
}

async function loadStats() {
  try {
    const res = await fetch('/api/stats');
    const stats = await res.json();
    renderStats(stats);
  } catch (err) {
    console.error('Failed to load stats', err);
  }
}

function renderStats(stats) {
  DOM.statTotalSongs.textContent = stats.totalTracksCaptured || 0;
  DOM.statUniqueArtists.textContent = stats.uniqueArtists || 0;
  DOM.statUniqueTracks.textContent = stats.uniqueTracks || 0;

  if (stats.topTracks && stats.topTracks.length > 0) {
    DOM.topTracksList.innerHTML = stats.topTracks.map(item => `
      <div class="top-item">
        <div class="top-item-info">
          <img src="${item.album_art_url || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=60&auto=format&fit=crop'}" class="top-item-art" alt="art" />
          <div class="top-item-text">
            <div class="top-item-name">${escapeHtml(item.track_name)}</div>
            <div class="top-item-artist">${escapeHtml(item.artist_name)}</div>
          </div>
        </div>
        <span class="top-item-count">${item.plays}x</span>
      </div>
    `).join('');
  } else {
    DOM.topTracksList.innerHTML = `<div class="empty-top-state">No songs logged yet</div>`;
  }
}

function renderHistory(data) {
  const list = data.history || [];
  const total = data.total || 0;

  if (list.length === 0) {
    DOM.historyTimeline.innerHTML = `
      <div class="empty-timeline-state">
        <h3>No songs recorded yet</h3>
        <p>Once ${escapeHtml(state.targetName)} starts playing music on Spotify, every single track will be logged here live!</p>
      </div>
    `;
    DOM.paginationInfo.textContent = 'Showing 0 of 0 songs';
    DOM.prevPageBtn.disabled = true;
    DOM.nextPageBtn.disabled = true;
    return;
  }

  DOM.historyTimeline.innerHTML = list.map((item, index) => {
    const isFirst = index === 0 && state.historyOffset === 0;
    const timeAgo = formatTimeAgo(item.detected_at);
    const spotifyUrl = item.track_url || `https://open.spotify.com/track/${(item.track_uri || '').replace('spotify:track:', '')}`;

    return `
      <div class="timeline-row ${isFirst ? 'new-entry' : ''}">
        <img src="${item.album_art_url || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=100&auto=format&fit=crop'}" class="timeline-art" alt="Cover" />
        
        <div class="timeline-meta">
          <div class="timeline-track-name">${escapeHtml(item.track_name)}</div>
          <div class="timeline-artist-name">${escapeHtml(item.artist_name)} • <span style="color:var(--text-secondary)">${escapeHtml(item.album_name)}</span></div>
          ${item.context_name ? `<div class="timeline-context">📜 ${escapeHtml(item.context_name)}</div>` : ''}
        </div>

        <div class="timeline-badges">
          <span class="timeline-time" title="${escapeHtml(item.detected_at_str)}">${timeAgo}</span>
          ${item.play_count > 1 ? `<span class="timeline-repeat" title="Played ${item.play_count} times">${item.play_count}x</span>` : ''}
        </div>

        <a href="${spotifyUrl}" target="_blank" rel="noopener" class="timeline-play-btn" title="Open on Spotify">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.516 17.306c-.22.36-.684.475-1.044.255-2.863-1.748-6.467-2.144-10.71-1.173-.41.094-.817-.163-.912-.572-.094-.41.163-.816.573-.911 4.65-1.062 8.64-.614 11.838 1.343.36.22.474.684.255 1.044zm1.485-3.3c-.277.452-.867.595-1.32.318-3.277-2.014-8.273-2.598-12.148-1.422-.516.156-1.064-.138-1.22-.653-.157-.516.138-1.065.654-1.22 4.427-1.344 9.946-.69 13.716 1.628.452.277.595.867.318 1.32zm.127-3.442C15.206 8.24 8.742 8.026 5.09 9.135c-.602.183-1.242-.16-1.425-.762-.183-.602.16-1.242.762-1.425 4.22-1.28 11.36-1.03 15.86 1.642.54.322.717 1.026.395 1.566-.322.54-1.026.717-1.566.395z"/>
          </svg>
        </a>
      </div>
    `;
  }).join('');

  const start = state.historyOffset + 1;
  const end = Math.min(state.historyOffset + list.length, total);
  DOM.paginationInfo.textContent = `Showing ${start}-${end} of ${total} songs`;

  DOM.prevPageBtn.disabled = state.historyOffset <= 0;
  DOM.nextPageBtn.disabled = state.historyOffset + state.historyLimit >= total;
}

function populateFriendsDropdown(friends) {
  if (!friends || friends.length === 0) return;

  const currentVal = DOM.friendsDropdown.value;
  DOM.friendsDropdown.innerHTML = '<option value="">-- Discovered Friends from Spotify --</option>' +
    friends.map(f => `
      <option value="${escapeHtml(f.user.uri)}" data-name="${escapeHtml(f.user.name)}">
        ${escapeHtml(f.user.name)} (${f.track.name ? `Listening to: ${escapeHtml(f.track.name)}` : 'Offline'})
      </option>
    `).join('');

  if (currentVal) {
    DOM.friendsDropdown.value = currentVal;
  }
}

/* ==========================================================================
   Utilities & Formatters
   ========================================================================== */
function formatTimeAgo(timestamp) {
  if (!timestamp) return 'Just now';
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 45) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* ==========================================================================
   Event Listeners & Initialization
   ========================================================================== */
function initEventListeners() {
  // Sound Chime Toggle
  DOM.soundToggleBtn.addEventListener('click', () => {
    state.soundEnabled = !state.soundEnabled;
    DOM.soundIcon.textContent = state.soundEnabled ? '🔊' : '🔇';
    DOM.soundToggleBtn.style.color = state.soundEnabled ? 'var(--spotify-green)' : 'var(--text-muted)';
    showToast(state.soundEnabled ? 'Audio alerts turned ON' : 'Audio alerts muted');
  });

  // Browser Push Notifications
  DOM.notifToggleBtn.addEventListener('click', () => {
    requestNotificationPermission();
  });

  // Simulate Track Play Alert
  DOM.simulateBtn.addEventListener('click', async () => {
    try {
      DOM.simulateBtn.disabled = true;
      const res = await fetch('/api/simulate-track', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast('⚡ Simulated track alert triggered!', 'success', data.track);
      }
    } catch (err) {
      showToast('Simulation failed: ' + err.message, 'error');
    } finally {
      DOM.simulateBtn.disabled = false;
    }
  });

  // Manual Refresh Now
  DOM.syncNowBtn.addEventListener('click', async () => {
    DOM.syncNowBtn.textContent = '⏳ Checking...';
    try {
      await fetch('/api/poll-now', { method: 'POST' });
      showToast('Checked Spotify Friend Activity');
    } catch (err) {
      showToast('Sync error: ' + err.message, 'error');
    } finally {
      DOM.syncNowBtn.textContent = '🔄 Refresh Now';
    }
  });

  // Settings Modal Open/Close
  DOM.settingsBtn.addEventListener('click', () => {
    DOM.settingsModal.classList.add('open');
  });
  DOM.modalCloseBtn.addEventListener('click', () => {
    DOM.settingsModal.classList.remove('open');
  });
  DOM.modalCancelBtn.addEventListener('click', () => {
    DOM.settingsModal.classList.remove('open');
  });
  DOM.settingsModal.addEventListener('click', (e) => {
    if (e.target === DOM.settingsModal) DOM.settingsModal.classList.remove('open');
  });

  // Friend dropdown selection
  DOM.friendsDropdown.addEventListener('change', (e) => {
    const selectedOption = DOM.friendsDropdown.options[DOM.friendsDropdown.selectedIndex];
    if (selectedOption && selectedOption.dataset.name) {
      DOM.targetNameInput.value = selectedOption.dataset.name;
    }
  });

  // Test Webhook
  DOM.testWebhookBtn.addEventListener('click', async () => {
    const url = DOM.discordWebhookInput.value;
    if (!url) {
      showToast('Please enter a Webhook URL first', 'error');
      return;
    }
    DOM.testWebhookBtn.disabled = true;
    DOM.testWebhookBtn.textContent = 'Sending...';
    try {
      const res = await fetch('/api/test-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookUrl: url })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Discord ping sent successfully!', 'success');
      } else {
        showToast('Webhook failed: ' + data.error, 'error');
      }
    } catch (err) {
      showToast('Webhook error: ' + err.message, 'error');
    } finally {
      DOM.testWebhookBtn.disabled = false;
      DOM.testWebhookBtn.textContent = 'Test Ping';
    }
  });

  // Copy console snippet button
  DOM.copyCodeSnippetBtn.addEventListener('click', () => {
    const text = DOM.consoleCodeSnippet.textContent;
    navigator.clipboard.writeText(text).then(() => {
      showToast('Copied code to clipboard! Paste it into Spotify Console.', 'success');
    }).catch(() => {
      showToast('Copy code: ' + text);
    });
  });

  // Save Settings Form
  DOM.settingsForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    DOM.settingsForm.querySelector('#saveConfigBtn').disabled = true;
    DOM.settingsForm.querySelector('#saveConfigBtn').textContent = 'Saving...';

    const updates = {
      target_friend_name: DOM.targetNameInput.value.trim(),
      poll_interval_sec: DOM.pollIntervalInput.value,
      discord_webhook_url: DOM.discordWebhookInput.value.trim()
    };

    if (DOM.accessTokenInput.value.trim()) {
      updates.access_token = DOM.accessTokenInput.value.trim();
    }

    if (DOM.spDcInput.value.trim()) {
      updates.sp_dc = DOM.spDcInput.value.trim();
    }

    if (DOM.friendsDropdown.value) {
      updates.target_friend_uri = DOM.friendsDropdown.value;
    }

    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Settings saved & monitoring active!', 'success');
        DOM.settingsModal.classList.remove('open');
        loadStatus();
      } else {
        showToast('Error saving: ' + data.error, 'error');
      }
    } catch (err) {
      showToast('Network error saving settings', 'error');
    } finally {
      DOM.settingsForm.querySelector('#saveConfigBtn').disabled = false;
      DOM.settingsForm.querySelector('#saveConfigBtn').textContent = 'Save & Start Monitoring';
    }
  });

  // Search History Input
  let searchDebounce = null;
  DOM.historySearchInput.addEventListener('input', (e) => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => {
      state.historySearch = e.target.value.trim();
      state.historyOffset = 0;
      loadHistory();
    }, 300);
  });

  // History Pagination
  DOM.prevPageBtn.addEventListener('click', () => {
    if (state.historyOffset > 0) {
      state.historyOffset = Math.max(0, state.historyOffset - state.historyLimit);
      loadHistory();
    }
  });

  DOM.nextPageBtn.addEventListener('click', () => {
    state.historyOffset += state.historyLimit;
    loadHistory();
  });

  // Exports
  DOM.exportCsvBtn.addEventListener('click', () => {
    window.location.href = '/api/export?format=csv';
  });

  DOM.exportJsonBtn.addEventListener('click', () => {
    window.location.href = '/api/export?format=json';
  });

  // Clear History
  DOM.clearHistoryBtn.addEventListener('click', async () => {
    if (!confirm('Are you sure you want to clear recorded history?')) return;
    try {
      await fetch('/api/history', { method: 'DELETE' });
      showToast('History cleared');
      loadHistory();
      loadStats();
    } catch (err) {
      showToast('Error clearing history', 'error');
    }
  });
}

// App Bootstrap
window.addEventListener('DOMContentLoaded', () => {
  initEventListeners();
  initNotifications();
  connectWebSocket();
  loadStatus();
  loadHistory();
  loadStats();
});
