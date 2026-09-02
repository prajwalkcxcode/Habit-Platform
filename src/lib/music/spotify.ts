import type { Playlist, MusicProfile } from './types'

export const SPOTIFY_CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || '04f0eeea80be4a2c91fc4c9ec8d01115'

export const CURATED_FOCUS_PLAYLISTS: Playlist[] = [
  {
    id: '37i9dQZF1DX4sWSpwq3LiO',
    name: 'Peaceful Piano',
    description: 'Relax and focus with beautiful piano pieces.',
    coverUrl: 'https://picsum.photos/seed/peacefulpiano/300/300',
    uri: 'spotify:playlist:37i9dQZF1DX4sWSpwq3LiO',
    externalUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX4sWSpwq3LiO',
    category: 'focus',
    totalTracks: 120,
    owner: 'Spotify'
  },
  {
    id: '37i9dQZF1DWZeKCadgRdKQ',
    name: 'Deep Focus',
    description: 'Keep calm and focus with ambient and post-rock music.',
    coverUrl: 'https://picsum.photos/seed/deepfocus/300/300',
    uri: 'spotify:playlist:37i9dQZF1DWZeKCadgRdKQ',
    externalUrl: 'https://open.spotify.com/playlist/37i9dQZF1DWZeKCadgRdKQ',
    category: 'focus',
    totalTracks: 180,
    owner: 'Spotify'
  },
  {
    id: '37i9dQZF1DXdLEN7aqioXM',
    name: 'Lofi Beats',
    description: 'Beats to relax, study, and build habits to.',
    coverUrl: 'https://picsum.photos/seed/lofibeats/300/300',
    uri: 'spotify:playlist:37i9dQZF1DXdLEN7aqioXM',
    externalUrl: 'https://open.spotify.com/playlist/37i9dQZF1DXdLEN7aqioXM',
    category: 'study',
    totalTracks: 200,
    owner: 'Spotify'
  },
  {
    id: '37i9dQZF1DX76Wlfdnj7AP',
    name: 'Beast Mode Workout',
    description: 'High energy bass and beats for peak consistency.',
    coverUrl: 'https://picsum.photos/seed/beastmode/300/300',
    uri: 'spotify:playlist:37i9dQZF1DX76Wlfdnj7AP',
    externalUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX76Wlfdnj7AP',
    category: 'workout',
    totalTracks: 90,
    owner: 'Spotify'
  },
  {
    id: '37i9dQZF1DX3Ogo9pFvBkY',
    name: 'Morning Acoustic',
    description: 'Gentle acoustic warmth to start your day right.',
    coverUrl: 'https://picsum.photos/seed/morningacoustic/300/300',
    uri: 'spotify:playlist:37i9dQZF1DX3Ogo9pFvBkY',
    externalUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX3Ogo9pFvBkY',
    category: 'morning',
    totalTracks: 75,
    owner: 'Spotify'
  },
  {
    id: '37i9dQZF1DX9uKNf5jGX6m',
    name: 'Mindfulness & Meditation',
    description: 'Calm natural tones and gentle frequencies.',
    coverUrl: 'https://picsum.photos/seed/mindfulness/300/300',
    uri: 'spotify:playlist:37i9dQZF1DX9uKNf5jGX6m',
    externalUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX9uKNf5jGX6m',
    category: 'relax',
    totalTracks: 60,
    owner: 'Spotify'
  }
]

export function getSpotifyAuthUrl(redirectUri: string): string {
  const scopes = [
    'user-read-private',
    'user-read-email',
    'playlist-read-private',
    'playlist-read-collaborative',
    'user-read-currently-playing',
    'user-read-playback-state'
  ].join(' ')

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: SPOTIFY_CLIENT_ID,
    scope: scopes,
    redirect_uri: redirectUri,
    show_dialog: 'true'
  })

  return 'https://accounts.spotify.com/authorize?' + params.toString()
}

export function extractSpotifyEmbedUrl(uriOrUrl: string): string {
  if (!uriOrUrl) return ''
  if (uriOrUrl.includes('open.spotify.com/embed/')) return uriOrUrl
  
  // Format: spotify:playlist:37i9dQZF1DX4sWSpwq3LiO -> https://open.spotify.com/embed/playlist/37i9dQZF1DX4sWSpwq3LiO
  if (uriOrUrl.startsWith('spotify:')) {
    const parts = uriOrUrl.split(':')
    if (parts.length >= 3) {
      return 'https://open.spotify.com/embed/' + parts[1] + '/' + parts[2] + '?utm_source=generator&theme=0'
    }
  }

  // Format: https://open.spotify.com/playlist/37i9dQZF1DX4sWSpwq3LiO
  const match = uriOrUrl.match(/open\.spotify\.com\/(playlist|album|track|episode|show)\/([a-zA-Z0-9]+)/)
  if (match) {
    return 'https://open.spotify.com/embed/' + match[1] + '/' + match[2] + '?utm_source=generator&theme=0'
  }

  return uriOrUrl
}
