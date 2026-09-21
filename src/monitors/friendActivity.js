const axios = require('axios');

/**
 * Spotify Friend Activity Client
 * Supports direct Web Player Access Tokens as well as sp_dc cookie authentication.
 */
class SpotifyFriendActivityClient {
  constructor() {
    this.accessToken = null;
    this.tokenExpiresAt = 0;
    this.cachedFriends = [];
    this.lastSuccessfulFetch = 0;
  }

  formatImageUrl(imageUriOrUrl) {
    if (!imageUriOrUrl) return '';
    if (imageUriOrUrl.startsWith('http://') || imageUriOrUrl.startsWith('https://')) {
      return imageUriOrUrl;
    }
    if (imageUriOrUrl.startsWith('spotify:image:')) {
      const id = imageUriOrUrl.replace('spotify:image:', '');
      return `https://i.scdn.co/image/${id}`;
    }
    return `https://i.scdn.co/image/${imageUriOrUrl}`;
  }

  formatTrackUrl(trackUri) {
    if (!trackUri) return '';
    if (trackUri.startsWith('spotify:track:')) {
      const id = trackUri.replace('spotify:track:', '');
      return `https://open.spotify.com/track/${id}`;
    }
    return trackUri;
  }

  /**
   * Resolve a working token (either direct token or via cookie)
   */
  async resolveToken(config) {
    // 1. If a direct access_token is provided and active
    if (config.access_token && config.access_token.trim()) {
      return config.access_token.trim();
    }

    // 2. If already have an active memory token
    if (this.accessToken && this.tokenExpiresAt > Date.now() + 30000) {
      return this.accessToken;
    }

    const spDc = config.sp_dc ? config.sp_dc.trim().replace(/^sp_dc=/, '') : '';
    if (!spDc) {
      throw new Error('Spotify Access Token or sp_dc cookie is missing. Please provide your token in Settings.');
    }

    // Attempt web player token fetch
    try {
      const response = await axios.get('https://open.spotify.com/get_access_token?reason=transport&productType=web_player', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
          'Cookie': `sp_dc=${spDc}`,
          'Accept': 'application/json, text/plain, */*',
          'Referer': 'https://open.spotify.com/'
        },
        timeout: 8000
      });

      const data = response.data;
      if (data && data.accessToken) {
        this.accessToken = data.accessToken;
        this.tokenExpiresAt = data.accessTokenExpirationTimestampMs || (Date.now() + 3600000);
        return this.accessToken;
      }
      throw new Error('Invalid response from token endpoint');
    } catch (err) {
      if (err.response && err.response.status === 403) {
        throw new Error('Spotify blocked direct cookie token fetch (Fastly WAF). Please paste your Web Access Token directly into Settings (see easy 1-click instructions in Settings modal).');
      }
      throw new Error(`Token fetch failed: ${err.message}`);
    }
  }

  /**
   * Fetch all friends' current listening activities from Spotify Buddy List API
   */
  async fetchFriendActivity(config) {
    const token = await this.resolveToken(config);

    const endpoints = [
      'https://guc-spclient.spotify.com/presence-view/v1/buddylist',
      'https://spclient.wg.spotify.com/presence-view/v1/buddylist'
    ];

    let lastError = null;

    for (const url of endpoints) {
      try {
        const response = await axios.get(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
            'Accept': 'application/json'
          },
          timeout: 10000
        });

        const rawFriends = response.data && response.data.friends ? response.data.friends : [];
        
        const normalized = rawFriends.map(f => {
          const user = f.user || {};
          const track = f.track || {};
          const album = track.album || {};
          const artist = track.artist || {};
          const context = track.context || {};

          return {
            user: {
              uri: user.uri || '',
              name: user.name || 'Unknown Friend',
              imageUrl: this.formatImageUrl(user.imageUrl)
            },
            track: {
              uri: track.uri || '',
              name: track.name || '',
              url: this.formatTrackUrl(track.uri),
              imageUrl: this.formatImageUrl(track.imageUrl),
              artist: {
                uri: artist.uri || '',
                name: artist.name || ''
              },
              album: {
                uri: album.uri || '',
                name: album.name || ''
              },
              context: {
                uri: context.uri || '',
                name: context.name || '',
                type: context.uri ? context.uri.split(':')[1] || 'playlist' : ''
              }
            },
            timestamp: f.timestamp || Date.now()
          };
        });

        this.cachedFriends = normalized;
        this.lastSuccessfulFetch = Date.now();
        return normalized;
      } catch (err) {
        lastError = err;
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          this.accessToken = null;
          throw new Error('Access Token is invalid or expired. Please generate a fresh token from the console.');
        }
      }
    }

    throw new Error(`Failed to fetch Spotify buddy list: ${lastError ? lastError.message : 'Unknown error'}`);
  }

  findFriend(friends, { name = '', uri = '' }) {
    if (!friends || friends.length === 0) return null;

    if (uri && uri.trim()) {
      const match = friends.find(f => f.user.uri.toLowerCase() === uri.trim().toLowerCase());
      if (match) return match;
    }

    if (name && name.trim()) {
      const cleanName = name.trim().toLowerCase();
      let match = friends.find(f => f.user.name.toLowerCase() === cleanName);
      if (match) return match;

      match = friends.find(f => f.user.name.toLowerCase().includes(cleanName));
      if (match) return match;
    }

    return null;
  }
}

module.exports = new SpotifyFriendActivityClient();
