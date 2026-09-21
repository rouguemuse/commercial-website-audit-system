const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '..', 'data', 'spotify_monitor.db');

// Ensure data folder exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database at', DB_PATH);
  }
});

// Initialize tables
db.serialize(() => {
  // Track history table
  db.run(`
    CREATE TABLE IF NOT EXISTS listening_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      friend_uri TEXT NOT NULL,
      friend_name TEXT NOT NULL,
      friend_image_url TEXT,
      track_uri TEXT NOT NULL,
      track_name TEXT NOT NULL,
      track_url TEXT,
      artist_uri TEXT,
      artist_name TEXT NOT NULL,
      album_uri TEXT,
      album_name TEXT NOT NULL,
      album_art_url TEXT,
      context_uri TEXT,
      context_name TEXT,
      context_type TEXT,
      spotify_timestamp INTEGER NOT NULL,
      detected_at INTEGER NOT NULL,
      detected_at_str TEXT NOT NULL,
      play_count INTEGER DEFAULT 1
    )
  `);

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_history_friend_uri ON listening_history(friend_uri)
  `);
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_history_track_uri ON listening_history(track_uri)
  `);
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_history_detected_at ON listening_history(detected_at DESC)
  `);

  // App Settings Table
  db.run(`
    CREATE TABLE IF NOT EXISTS app_config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `);

  // Seed default configuration if empty
  const defaults = {
    sp_dc: '',
    target_friend_name: 'Paul',
    target_friend_uri: '',
    poll_interval_sec: '4',
    sound_alert_enabled: 'true',
    browser_alert_enabled: 'true',
    discord_webhook_url: ''
  };

  for (const [key, value] of Object.entries(defaults)) {
    db.run(
      `INSERT OR IGNORE INTO app_config (key, value, updated_at) VALUES (?, ?, ?)`,
      [key, value, Date.now()]
    );
  }
});

// Database helper functions using Promises
const dbAsync = {
  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  },

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }
};

/**
 * Log a track if it represents a newly detected playback event
 */
async function logTrackEvent(trackData) {
  const {
    friendUri,
    friendName,
    friendImageUrl,
    trackUri,
    trackName,
    trackUrl,
    artistUri,
    artistName,
    albumUri,
    albumName,
    albumArtUrl,
    contextUri,
    contextName,
    contextType,
    spotifyTimestamp
  } = trackData;

  const now = Date.now();
  const dateStr = new Date(now).toLocaleString();

  // Check the most recent record for this friend
  const lastTrack = await dbAsync.get(
    `SELECT * FROM listening_history WHERE friend_uri = ? ORDER BY detected_at DESC LIMIT 1`,
    [friendUri]
  );

  // If identical track was logged within the same session or timestamp matches exactly, avoid duplicate entry
  if (lastTrack) {
    if (lastTrack.track_uri === trackUri && Number(lastTrack.spotify_timestamp) === Number(spotifyTimestamp)) {
      return { isNew: false, track: lastTrack };
    }
    // Also if the exact track URI matches and was detected less than 60 seconds ago without timestamp change
    if (lastTrack.track_uri === trackUri && (now - lastTrack.detected_at) < 60000) {
      return { isNew: false, track: lastTrack };
    }
  }

  // Count total times this friend has played this song
  const playCountResult = await dbAsync.get(
    `SELECT COUNT(*) as count FROM listening_history WHERE friend_uri = ? AND track_uri = ?`,
    [friendUri, trackUri]
  );
  const playCount = (playCountResult ? playCountResult.count : 0) + 1;

  const result = await dbAsync.run(
    `INSERT INTO listening_history (
      friend_uri, friend_name, friend_image_url,
      track_uri, track_name, track_url,
      artist_uri, artist_name,
      album_uri, album_name, album_art_url,
      context_uri, context_name, context_type,
      spotify_timestamp, detected_at, detected_at_str, play_count
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      friendUri, friendName, friendImageUrl || '',
      trackUri, trackName, trackUrl || '',
      artistUri || '', artistName,
      albumUri || '', albumName, albumArtUrl || '',
      contextUri || '', contextName || '', contextType || '',
      spotifyTimestamp || now, now, dateStr, playCount
    ]
  );

  const insertedTrack = await dbAsync.get(
    `SELECT * FROM listening_history WHERE id = ?`,
    [result.lastID]
  );

  return { isNew: true, track: insertedTrack, totalPlays: playCount };
}

/**
 * Get Paginated listening history with optional search
 */
async function getHistory({ limit = 50, offset = 0, search = '', friendUri = '' }) {
  let whereClauses = [];
  let params = [];

  if (friendUri) {
    whereClauses.push('friend_uri = ?');
    params.push(friendUri);
  }

  if (search) {
    whereClauses.push('(track_name LIKE ? OR artist_name LIKE ? OR album_name LIKE ? OR context_name LIKE ?)');
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const totalRow = await dbAsync.get(
    `SELECT COUNT(*) as count FROM listening_history ${whereSql}`,
    params
  );

  const history = await dbAsync.all(
    `SELECT * FROM listening_history ${whereSql} ORDER BY detected_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return {
    total: totalRow ? totalRow.count : 0,
    limit,
    offset,
    history
  };
}

/**
 * Get Analytics and Stats for Paul
 */
async function getStats(friendUri = '') {
  let friendFilter = '';
  let params = [];
  if (friendUri) {
    friendFilter = 'WHERE friend_uri = ?';
    params = [friendUri];
  }

  const totalCaptured = await dbAsync.get(
    `SELECT COUNT(*) as count FROM listening_history ${friendFilter}`,
    params
  );

  const uniqueTracks = await dbAsync.get(
    `SELECT COUNT(DISTINCT track_uri) as count FROM listening_history ${friendFilter}`,
    params
  );

  const uniqueArtists = await dbAsync.get(
    `SELECT COUNT(DISTINCT artist_name) as count FROM listening_history ${friendFilter}`,
    params
  );

  const topTracks = await dbAsync.all(
    `SELECT track_name, artist_name, album_art_url, track_url, COUNT(*) as plays 
     FROM listening_history ${friendFilter} 
     GROUP BY track_uri 
     ORDER BY plays DESC 
     LIMIT 5`,
    params
  );

  const topArtists = await dbAsync.all(
    `SELECT artist_name, COUNT(*) as plays 
     FROM listening_history ${friendFilter} 
     GROUP BY artist_name 
     ORDER BY plays DESC 
     LIMIT 5`,
    params
  );

  const firstEntry = await dbAsync.get(
    `SELECT detected_at FROM listening_history ${friendFilter} ORDER BY detected_at ASC LIMIT 1`,
    params
  );

  return {
    totalTracksCaptured: totalCaptured ? totalCaptured.count : 0,
    uniqueTracks: uniqueTracks ? uniqueTracks.count : 0,
    uniqueArtists: uniqueArtists ? uniqueArtists.count : 0,
    topTracks: topTracks || [],
    topArtists: topArtists || [],
    firstTrackDate: firstEntry ? firstEntry.detected_at : null
  };
}

/**
 * Get all config key-values as an object
 */
async function getAllConfig() {
  const rows = await dbAsync.all(`SELECT key, value FROM app_config`);
  const config = {};
  for (const row of rows) {
    config[row.key] = row.value;
  }
  return config;
}

/**
 * Update config values
 */
async function updateConfig(keyValues) {
  const now = Date.now();
  for (const [key, value] of Object.entries(keyValues)) {
    await dbAsync.run(
      `INSERT INTO app_config (key, value, updated_at) 
       VALUES (?, ?, ?) 
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
      [key, String(value), now]
    );
  }
  return await getAllConfig();
}

/**
 * Clear history
 */
async function clearHistory(friendUri = '') {
  if (friendUri) {
    return await dbAsync.run(`DELETE FROM listening_history WHERE friend_uri = ?`, [friendUri]);
  }
  return await dbAsync.run(`DELETE FROM listening_history`);
}

module.exports = {
  db,
  dbAsync,
  logTrackEvent,
  getHistory,
  getStats,
  getAllConfig,
  updateConfig,
  clearHistory
};
