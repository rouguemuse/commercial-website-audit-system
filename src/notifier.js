const axios = require('axios');

/**
 * Webhook Notification Service (Discord & Generic Webhooks)
 */
class NotifierService {
  /**
   * Send Discord webhook notification when a new track is detected
   */
  async sendDiscordNotification(webhookUrl, trackEvent) {
    if (!webhookUrl || !webhookUrl.trim() || !webhookUrl.startsWith('http')) {
      return;
    }

    try {
      const isDiscord = webhookUrl.includes('discord.com/api/webhooks') || webhookUrl.includes('discordapp.com/api/webhooks');

      if (isDiscord) {
        const embed = {
          title: `🎵 ${trackEvent.track_name || trackEvent.trackName}`,
          url: trackEvent.track_url || trackEvent.trackUrl || `https://open.spotify.com`,
          description: `**Artist:** ${trackEvent.artist_name || trackEvent.artistName}\n**Album:** ${trackEvent.album_name || trackEvent.albumName}${trackEvent.context_name ? `\n**Context:** 📜 ${trackEvent.context_name}` : ''}`,
          color: 0x1DB954, // Spotify Green
          thumbnail: {
            url: trackEvent.album_art_url || trackEvent.albumArtUrl || ''
          },
          author: {
            name: `${trackEvent.friend_name || trackEvent.friendName} is listening on Spotify`,
            icon_url: trackEvent.friend_image_url || trackEvent.friendImageUrl || undefined
          },
          footer: {
            text: `Spotify Live Monitor • Play #${trackEvent.play_count || trackEvent.playCount || 1}`
          },
          timestamp: new Date().toISOString()
        };

        await axios.post(webhookUrl, {
          username: 'Spotify Live Monitor',
          avatar_url: 'https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_RGB_Green.png',
          embeds: [embed]
        }, { timeout: 8000 });
      } else {
        // Generic JSON webhook
        await axios.post(webhookUrl, {
          event: 'song_changed',
          track: trackEvent,
          timestamp: Date.now()
        }, { timeout: 8000 });
      }
    } catch (err) {
      console.error('Failed to send webhook notification:', err.message);
    }
  }

  /**
   * Test a webhook URL
   */
  async testWebhook(webhookUrl) {
    const testTrack = {
      friend_name: 'Paul (Test)',
      track_name: 'Bohemian Rhapsody',
      artist_name: 'Queen',
      album_name: 'A Night at the Opera',
      album_art_url: 'https://i.scdn.co/image/ab67616d0000b273ce4f1737bc8a646c8c4bd25a',
      track_url: 'https://open.spotify.com/track/7tFiyTwD0nx5a1eklYtX2J',
      context_name: 'Rock Classics',
      play_count: 1
    };

    return this.sendDiscordNotification(webhookUrl, testTrack);
  }
}

module.exports = new NotifierService();
