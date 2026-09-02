export type MusicProvider = 'spotify' | 'apple_music' | 'youtube_music' | 'none'

export interface MusicProfile {
  id: string
  displayName: string
  avatarUrl?: string
  email?: string
  product?: string
}

export interface Track {
  id: string
  title: string
  artist: string
  album?: string
  albumArtUrl?: string
  uri: string
  durationMs?: number
}

export interface Playlist {
  id: string
  name: string
  description?: string
  coverUrl?: string
  uri: string
  externalUrl?: string
  totalTracks?: number
  owner?: string
  category?: 'focus' | 'workout' | 'relax' | 'morning' | 'study'
}

export interface HabitAudioBinding {
  habitId: string
  playlistUri: string
  playlistName: string
  coverUrl?: string
  provider: MusicProvider
}
