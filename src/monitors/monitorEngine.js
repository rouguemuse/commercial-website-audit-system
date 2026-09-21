const friendActivityClient = require('./friendActivity');
const db = require('../database');
const notifier = require('../notifier');

class MonitorEngine {
  constructor() {
    this.timer = null;
    this.isPolling = false;
    this.wsClients = new Set();
    
    this.state = {
      status: 'stopped', // 'stopped', 'running', 'error', 'waiting_cookie', 'target_not_found'
      lastError: null,
      lastCheckTime: 0,
      targetUser: {
        name: 'Paul',
        uri: '',
        imageUrl: ''
      },
      currentPresence: null, // Full current track / presence object
      recentFriendsList: [],
      consecutiveErrors: 0
    };
  }

  registerWsClient(ws) {
    this.wsClients.add(ws);
    // Immediately send current state and latest track
    this.sendToClient(ws, 'initial_state', {
      state: this.getStateSummary(),
      currentPresence: this.state.currentPresence,
      recentFriends: this.state.recentFriendsList
    });

    ws.on('close', () => {
      this.wsClients.delete(ws);
    });
  }

  broadcast(eventType, payload) {
    const message = JSON.stringify({ event: eventType, data: payload, timestamp: Date.now() });
    for (const client of this.wsClients) {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(message);
      }
    }
  }

  sendToClient(ws, eventType, payload) {
    if (ws.readyState === 1) {
      ws.send(JSON.stringify({ event: eventType, data: payload, timestamp: Date.now() }));
    }
  }

  getStateSummary() {
    return {
      status: this.state.status,
      lastError: this.state.lastError,
      lastCheckTime: this.state.lastCheckTime,
      targetUser: this.state.targetUser,
      consecutiveErrors: this.state.consecutiveErrors
    };
  }

  async start() {
    if (this.timer) {
      clearInterval(this.timer);
    }

    const config = await db.getAllConfig();
    const intervalSec = Math.max(2, parseInt(config.poll_interval_sec, 10) || 4);

    this.state.targetUser.name = config.target_friend_name || 'Paul';
    this.state.targetUser.uri = config.target_friend_uri || '';
    this.state.status = 'running';

    console.log(`[Spotify Monitor] Starting monitor for "${this.state.targetUser.name}" (every ${intervalSec}s)`);

    // Run first check immediately
    this.pollOnce();

    this.timer = setInterval(() => {
      this.pollOnce();
    }, intervalSec * 1000);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.state.status = 'stopped';
    this.broadcast('status_changed', this.getStateSummary());
  }

  async pollOnce() {
    if (this.isPolling) return;
    this.isPolling = true;

    try {
      const config = await db.getAllConfig();
      const spDc = config.sp_dc;
      const targetName = config.target_friend_name || 'Paul';
      const targetUri = config.target_friend_uri || '';

      this.state.targetUser.name = targetName;
      this.state.targetUser.uri = targetUri;
      this.state.lastCheckTime = Date.now();

      if ((!config.access_token || config.access_token.trim() === '') && (!config.sp_dc || config.sp_dc.trim() === '')) {
        this.state.status = 'waiting_cookie';
        this.state.lastError = 'Spotify Access Token / Cookie is not configured. Please enter your token in Settings.';
        this.broadcast('status_changed', this.getStateSummary());
        this.isPolling = false;
        return;
      }

      // Fetch friend activity
      const friends = await friendActivityClient.fetchFriendActivity(config);
      this.state.recentFriendsList = friends;
      this.state.consecutiveErrors = 0;
      this.state.lastError = null;
      this.state.status = 'running';

      // Find Paul or target friend
      const targetFriend = friendActivityClient.findFriend(friends, {
        name: targetName,
        uri: targetUri
      });

      if (!targetFriend) {
        // Target friend is not currently in the active friend list (could be offline or unshared)
        this.state.currentPresence = {
          isListening: false,
          user: {
            name: targetName,
            uri: targetUri,
            imageUrl: ''
          },
          track: null,
          statusText: 'Offline or not currently playing'
        };

        this.broadcast('presence_update', this.state.currentPresence);
        this.broadcast('friends_list', friends);
        this.isPolling = false;
        return;
      }

      // Found target friend!
      const user = targetFriend.user;
      const track = targetFriend.track;
      const spotifyTimestamp = targetFriend.timestamp;

      this.state.targetUser.name = user.name;
      this.state.targetUser.uri = user.uri;
      this.state.targetUser.imageUrl = user.imageUrl;

      const trackPayload = {
        friendUri: user.uri,
        friendName: user.name,
        friendImageUrl: user.imageUrl,
        trackUri: track.uri,
        trackName: track.name,
        trackUrl: track.url,
        artistUri: track.artist.uri,
        artistName: track.artist.name,
        albumUri: track.album.uri,
        albumName: track.album.name,
        albumArtUrl: track.imageUrl,
        contextUri: track.context.uri,
        contextName: track.context.name,
        contextType: track.context.type,
        spotifyTimestamp: spotifyTimestamp
      };

      // Check if this song is newly detected or switched
      const logResult = await db.logTrackEvent(trackPayload);

      this.state.currentPresence = {
        isListening: true,
        user: user,
        track: track,
        spotifyTimestamp: spotifyTimestamp,
        detectedAt: Date.now(),
        totalPlays: logResult.totalPlays || 1,
        isNew: logResult.isNew
      };

      // If it's a newly logged track event, broadcast notification & webhook
      if (logResult.isNew) {
        console.log(`[Spotify Monitor] 🎵 NEW SONG for ${user.name}: "${track.name}" by ${track.artist.name}`);
        
        this.broadcast('song_changed', {
          track: logResult.track,
          totalPlays: logResult.totalPlays,
          user: user
        });

        // Trigger webhook if enabled
        if (config.discord_webhook_url && config.discord_webhook_url.trim()) {
          notifier.sendDiscordNotification(config.discord_webhook_url, logResult.track);
        }
      }

      // Always broadcast live presence update
      this.broadcast('presence_update', this.state.currentPresence);
      this.broadcast('friends_list', friends);

    } catch (err) {
      this.state.consecutiveErrors++;
      this.state.lastError = err.message;
      this.state.status = 'error';
      console.error(`[Spotify Monitor Error]`, err.message);
      this.broadcast('status_changed', this.getStateSummary());
    } finally {
      this.isPolling = false;
    }
  }
}

module.exports = new MonitorEngine();
