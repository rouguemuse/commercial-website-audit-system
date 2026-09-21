const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const cors = require('cors');
const db = require('./src/database');
const monitorEngine = require('./src/monitors/monitorEngine');
const notifier = require('./src/notifier');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Attach WebSocket connections to the monitor engine
wss.on('connection', (ws) => {
  monitorEngine.registerWsClient(ws);
});

/* =========================================================================
   REST API ENDPOINTS
   ========================================================================= */

// Get current monitor status, current track, and config
app.get('/api/status', async (req, res) => {
  try {
    const config = await db.getAllConfig();
    const stats = await db.getStats(config.target_friend_uri);
    
    // Mask sp_dc cookie and access_token for security in API response
    const sanitizedConfig = { ...config };
    if (sanitizedConfig.sp_dc) {
      sanitizedConfig.has_sp_dc = true;
      sanitizedConfig.sp_dc_preview = `${sanitizedConfig.sp_dc.substring(0, 8)}...${sanitizedConfig.sp_dc.slice(-4)}`;
      delete sanitizedConfig.sp_dc;
    } else {
      sanitizedConfig.has_sp_dc = false;
    }
    if (sanitizedConfig.access_token) {
      sanitizedConfig.has_access_token = true;
      sanitizedConfig.access_token_preview = `${sanitizedConfig.access_token.substring(0, 8)}...${sanitizedConfig.access_token.slice(-4)}`;
      delete sanitizedConfig.access_token;
    } else {
      sanitizedConfig.has_access_token = false;
    }

    res.json({
      status: monitorEngine.getStateSummary(),
      presence: monitorEngine.state.currentPresence,
      recentFriends: monitorEngine.state.recentFriendsList,
      config: sanitizedConfig,
      stats: stats
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get listening history with search and pagination
app.get('/api/history', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 50;
    const offset = parseInt(req.query.offset, 10) || 0;
    const search = req.query.search || '';
    const friendUri = req.query.friendUri || '';

    const historyData = await db.getHistory({ limit, offset, search, friendUri });
    res.json(historyData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get listening stats & top charts
app.get('/api/stats', async (req, res) => {
  try {
    const friendUri = req.query.friendUri || '';
    const stats = await db.getStats(friendUri);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update configuration
app.post('/api/config', async (req, res) => {
  try {
    const allowedKeys = [
      'access_token',
      'sp_dc',
      'target_friend_name',
      'target_friend_uri',
      'poll_interval_sec',
      'sound_alert_enabled',
      'browser_alert_enabled',
      'discord_webhook_url'
    ];

    const updates = {};
    for (const key of allowedKeys) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    await db.updateConfig(updates);

    // Restart monitor with new config
    await monitorEngine.start();

    res.json({ success: true, message: 'Configuration saved and monitor updated.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Trigger an immediate manual check
app.post('/api/poll-now', async (req, res) => {
  try {
    await monitorEngine.pollOnce();
    res.json({
      success: true,
      status: monitorEngine.getStateSummary(),
      presence: monitorEngine.state.currentPresence
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Test webhook
app.post('/api/test-webhook', async (req, res) => {
  try {
    const { webhookUrl } = req.body;
    if (!webhookUrl) {
      return res.status(400).json({ error: 'Webhook URL is required' });
    }
    await notifier.testWebhook(webhookUrl);
    res.json({ success: true, message: 'Test notification sent successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Simulate a track play event (for testing UI, audio alerts, and discord webhook without waiting)
app.post('/api/simulate-track', async (req, res) => {
  try {
    const config = await db.getAllConfig();
    const targetName = config.target_friend_name || 'Paul';
    const sampleTracks = [
      {
        trackName: 'Here Comes The Sun',
        artistName: 'The Beatles',
        albumName: 'Abbey Road',
        albumArtUrl: 'https://i.scdn.co/image/ab67616d0000b273dc40b4a4f32630a969f62e84',
        trackUrl: 'https://open.spotify.com/track/6dGnYIeXmHdcikdzNNDMm2',
        trackUri: 'spotify:track:6dGnYIeXmHdcikdzNNDMm2',
        contextName: 'Beatles Essentials'
      },
      {
        trackName: 'Starboy',
        artistName: 'The Weeknd, Daft Punk',
        albumName: 'Starboy',
        albumArtUrl: 'https://i.scdn.co/image/ab67616d0000b2734718e2b124f79258be7bc452',
        trackUrl: 'https://open.spotify.com/track/7MXVkk9YM5IZxh0wAE23mA',
        trackUri: 'spotify:track:7MXVkk9YM5IZxh0wAE23mA',
        contextName: 'Today Top Hits'
      },
      {
        trackName: 'Dreams',
        artistName: 'Fleetwood Mac',
        albumName: 'Rumours',
        albumArtUrl: 'https://i.scdn.co/image/ab67616d0000b273e921d7b38e07973024b4550a',
        trackUrl: 'https://open.spotify.com/track/0ofHAoxe9vBkTCp2UQIavz',
        trackUri: 'spotify:track:0ofHAoxe9vBkTCp2UQIavz',
        contextName: '70s Classic Rock'
      }
    ];

    const pick = sampleTracks[Math.floor(Math.random() * sampleTracks.length)];
    const mockUser = {
      name: targetName,
      uri: config.target_friend_uri || 'spotify:user:paul_target',
      imageUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop'
    };

    const trackPayload = {
      friendUri: mockUser.uri,
      friendName: mockUser.name,
      friendImageUrl: mockUser.imageUrl,
      trackUri: `${pick.trackUri}_${Date.now()}`,
      trackName: pick.trackName,
      trackUrl: pick.trackUrl,
      artistUri: 'spotify:artist:sample',
      artistName: pick.artistName,
      albumUri: 'spotify:album:sample',
      albumName: pick.albumName,
      albumArtUrl: pick.albumArtUrl,
      contextUri: 'spotify:playlist:sample',
      contextName: pick.contextName,
      contextType: 'playlist',
      spotifyTimestamp: Date.now()
    };

    const logResult = await db.logTrackEvent(trackPayload);

    monitorEngine.state.currentPresence = {
      isListening: true,
      user: mockUser,
      track: {
        uri: trackPayload.trackUri,
        name: trackPayload.trackName,
        url: trackPayload.trackUrl,
        imageUrl: trackPayload.albumArtUrl,
        artist: { name: trackPayload.artistName },
        album: { name: trackPayload.albumName },
        context: { name: trackPayload.contextName, type: 'playlist' }
      },
      spotifyTimestamp: Date.now(),
      detectedAt: Date.now(),
      totalPlays: logResult.totalPlays,
      isNew: true
    };

    monitorEngine.broadcast('song_changed', {
      track: logResult.track,
      totalPlays: logResult.totalPlays,
      user: mockUser
    });

    monitorEngine.broadcast('presence_update', monitorEngine.state.currentPresence);

    if (config.discord_webhook_url) {
      notifier.sendDiscordNotification(config.discord_webhook_url, logResult.track);
    }

    res.json({ success: true, message: 'Simulated song play!', track: logResult.track });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Clear history
app.delete('/api/history', async (req, res) => {
  try {
    await db.clearHistory(req.query.friendUri || '');
    res.json({ success: true, message: 'Listening history cleared.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Export history as JSON or CSV
app.get('/api/export', async (req, res) => {
  try {
    const format = req.query.format || 'json';
    const data = await db.getHistory({ limit: 10000 });

    if (format === 'csv') {
      const headers = ['Track Name', 'Artist', 'Album', 'Played By', 'Detected At', 'Spotify URL', 'Context'];
      const rows = data.history.map(item => [
        `"${(item.track_name || '').replace(/"/g, '""')}"`,
        `"${(item.artist_name || '').replace(/"/g, '""')}"`,
        `"${(item.album_name || '').replace(/"/g, '""')}"`,
        `"${(item.friend_name || '').replace(/"/g, '""')}"`,
        `"${item.detected_at_str}"`,
        `"${item.track_url || ''}"`,
        `"${(item.context_name || '').replace(/"/g, '""')}"`
      ]);

      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=paul_spotify_history_${Date.now()}.csv`);
      return res.send(csvContent);
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=paul_spotify_history_${Date.now()}.json`);
    res.json(data.history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start the server and monitor engine
server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` Spotify Live Monitor is running on http://localhost:${PORT}`);
  console.log(`====================================================`);
  monitorEngine.start();
});
