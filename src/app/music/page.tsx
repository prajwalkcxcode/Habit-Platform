'use client'

import * as React from 'react'
import { useMusicStore } from '@/lib/store/music'
import { useHabitStore } from '@/lib/store/habits'
import { CURATED_FOCUS_PLAYLISTS, extractSpotifyEmbedUrl, getSpotifyAuthUrl } from '@/lib/music/spotify'
import type { Playlist } from '@/lib/music/types'
import { Button } from '@/components/ui/button'
import { useUIStore } from '@/lib/store/ui'
import {
  Headphones,
  Music2,
  Sparkles,
  Play,
  Check,
  Link as LinkIcon,
  LogOut,
  Radio,
  BookOpen,
  Zap,
  ExternalLink
} from 'lucide-react'
import { getPlaylistGradient, getPlaylistEmoji } from '@/lib/music/playlist-covers'

export default function MusicPage() {
  const connected = useMusicStore(s => s.connected)
  const profile = useMusicStore(s => s.profile)
  const activePlaylist = useMusicStore(s => s.activePlaylist) || CURATED_FOCUS_PLAYLISTS[1]
  const setActivePlaylist = useMusicStore(s => s.setActivePlaylist)
  const habitBindings = useMusicStore(s => s.habitBindings)
  const bindHabitPlaylist = useMusicStore(s => s.bindHabitPlaylist)
  const unbindHabitPlaylist = useMusicStore(s => s.unbindHabitPlaylist)
  const disconnect = useMusicStore(s => s.disconnect)
  const setAuth = useMusicStore(s => s.setAuth)
  const showToast = useUIStore(s => s.showToast)
  const habits = useHabitStore(s => s.habits)

  const [selectedCategory, setSelectedCategory] = React.useState<string>('all')
  const [selectedHabitId, setSelectedHabitId] = React.useState<string>('')

  // Check URL params for Spotify callback code
  React.useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const code = params.get('spotify_code')
    if (code) {
      setAuth('spotify', `spotify_demo_token_${Date.now()}`, undefined, 3600)
      showToast('Spotify connected successfully! 🎧', 'success')
      window.history.replaceState({}, '', '/music')
    }
  }, [setAuth, showToast])

  const handleConnectSpotify = () => {
    const redirectUri = `${window.location.origin}/api/auth/spotify/callback`
    const url = getSpotifyAuthUrl(redirectUri)
    window.location.href = url
  }

  const handleBind = (habitId: string, playlist: Playlist) => {
    bindHabitPlaylist(habitId, {
      habitId,
      playlistName: playlist.name,
      playlistUri: playlist.uri,
      coverUrl: playlist.coverUrl,
      provider: 'spotify'
    })
    showToast(`Associated "${playlist.name}" with habit! ✨`, 'success')
    setSelectedHabitId('')
  }

  const filteredPlaylists = selectedCategory === 'all'
    ? CURATED_FOCUS_PLAYLISTS
    : CURATED_FOCUS_PLAYLISTS.filter(p => p.category === selectedCategory)

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#1DB954]/15 text-[#1DB954] border border-[#1DB954]/30">
              Focus Audio & Podcasts
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Music for Habit Flow</h1>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
            Anchor binaural beats, ambient rhythms, and playlists to your habits for deeper focus.
          </p>
        </div>

        <div>
          {connected ? (
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] shadow-xs">
              <div className="w-8 h-8 rounded-full bg-[#1DB954]/20 text-[#1DB954] flex items-center justify-center font-bold text-xs">
                S
              </div>
              <div className="text-xs pr-2">
                <p className="font-semibold text-[var(--text-primary)]">Spotify Connected</p>
                <p className="text-[10px] text-[var(--text-tertiary)]">Active Session</p>
              </div>
              <Button size="sm" variant="ghost" onClick={disconnect} className="h-7 text-xs text-red-500">
                <LogOut className="w-3.5 h-3.5" />
              </Button>
            </div>
          ) : (
            <button
              onClick={handleConnectSpotify}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#1DB954] hover:bg-[#1ed760] text-black flex items-center gap-2 transition-transform hover:scale-102 active:scale-98 shadow-sm"
            >
              <Headphones className="w-4 h-4 fill-black" />
              <span>Connect Spotify Account</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Featured Player */}
      <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#1DB954] animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--text-tertiary)]">Now Playing / Selected Flow</span>
          </div>
          <span className="text-xs text-[var(--text-tertiary)]">{activePlaylist.owner || 'Spotify'}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
          <div className="flex items-center gap-4 md:col-span-1">
            <div
              className="w-20 h-20 rounded-2xl shrink-0 shadow-md flex items-center justify-center text-4xl border border-white/10"
              style={{ background: getPlaylistGradient(activePlaylist.name) }}
            >
              {getPlaylistEmoji(activePlaylist.name)}
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-[var(--text-primary)] truncate">{activePlaylist.name}</h2>
              <p className="text-xs text-[var(--text-tertiary)] line-clamp-2 mt-0.5">{activePlaylist.description}</p>
            </div>
          </div>

          <div className="md:col-span-2">
            <iframe
              src={extractSpotifyEmbedUrl(activePlaylist.uri)}
              width="100%"
              height="80"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              className="rounded-xl border border-[var(--border)]"
            />
          </div>
        </div>
      </div>

      {/* Habit-Audio Bindings Section */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Habit-Linked Playlists</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {habits.filter(h => h.status === 'active').map(habit => {
            const binding = habitBindings[habit.id]
            return (
              <div key={habit.id} className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] shadow-xs flex flex-col justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl shrink-0">{habit.icon}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[var(--text-primary)] truncate">{habit.name}</p>
                    <p className="text-[10px] text-[var(--text-tertiary)] truncate">
                      {binding ? binding.playlistName : 'No playlist attached'}
                    </p>
                  </div>
                </div>

                {binding ? (
                  <div className="flex items-center justify-between pt-1 border-t border-[var(--border)] text-xs">
                    <span className="text-[10px] text-[#1DB954] font-medium flex items-center gap-1">
                      <Check className="w-3 h-3" /> Linked
                    </span>
                    <button
                      onClick={() => unbindHabitPlaylist(habit.id)}
                      className="text-[10px] text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedHabitId(habit.id)
                    }}
                    className="w-full py-1.5 rounded-lg text-[11px] font-medium bg-[var(--bg-elevated)] hover:bg-[var(--accent-subtle)] hover:text-[var(--accent)] text-[var(--text-secondary)] border border-[var(--border)] transition-colors flex items-center justify-center gap-1.5"
                  >
                    <LinkIcon className="w-3 h-3" /> Link Focus Audio
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Curated Focus Audio Playlists */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Curated Soundscapes & Playlists</h2>
          <div className="flex gap-1.5 flex-wrap">
            {['all', 'focus', 'study', 'workout', 'morning', 'relax'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-colors ${
                  selectedCategory === cat
                    ? 'bg-[var(--accent-subtle)] text-[var(--accent)] font-semibold'
                    : 'bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredPlaylists.map(playlist => {
            const isSelected = activePlaylist.id === playlist.id
            return (
              <div
                key={playlist.id}
                className={`group p-4 rounded-2xl border transition-all cursor-pointer bg-[var(--bg-card)] shadow-xs hover:shadow-card ${
                  isSelected ? 'border-[var(--accent)] ring-1 ring-[var(--accent)]' : 'border-[var(--border)] hover:border-[var(--border-strong)]'
                }`}
                onClick={() => setActivePlaylist(playlist)}
              >
                <div className="relative aspect-video rounded-xl overflow-hidden mb-3">
                  <div
                    className="w-full h-full flex items-center justify-center text-5xl group-hover:scale-105 transition-transform duration-300"
                    style={{ background: getPlaylistGradient(playlist.name) }}
                  >
                    {getPlaylistEmoji(playlist.name)}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setActivePlaylist(playlist)
                    }}
                    className="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-full bg-[#1DB954] text-black flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-black" />
                  </button>
                </div>

                <h3 className="text-sm font-bold text-[var(--text-primary)] truncate">{playlist.name}</h3>
                <p className="text-xs text-[var(--text-tertiary)] line-clamp-2 mt-0.5">{playlist.description}</p>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-[var(--border)] text-xs text-[var(--text-tertiary)]">
                  <span className="capitalize text-[10px] font-medium px-2 py-0.5 rounded bg-[var(--bg-elevated)]">{playlist.category || 'focus'}</span>
                  {selectedHabitId && (
                    <Button
                      size="sm"
                      className="h-6 text-[10px] px-2"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleBind(selectedHabitId, playlist)
                      }}
                    >
                      Attach
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
