'use client'

import * as React from 'react'
import { useMusicStore } from '@/lib/store/music'
import { extractSpotifyEmbedUrl, CURATED_FOCUS_PLAYLISTS } from '@/lib/music/spotify'
import { Headphones, ExternalLink, Sparkles, Music2, ChevronRight, Play } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getPlaylistGradient, getPlaylistEmoji } from '@/lib/music/playlist-covers'

interface FocusAudioCardProps {
  habitId?: string
  compact?: boolean
  className?: string
}

export function FocusAudioCard({ habitId, compact = false, className }: FocusAudioCardProps) {
  const connected = useMusicStore(s => s.connected)
  const activePlaylist = useMusicStore(s => s.activePlaylist) || CURATED_FOCUS_PLAYLISTS[1]
  const habitBindings = useMusicStore(s => s.habitBindings)
  const [showPlayer, setShowPlayer] = React.useState(false)

  const boundPlaylist = habitId ? habitBindings[habitId] : null
  const currentPlaylist = boundPlaylist ? {
    name: boundPlaylist.playlistName,
    uri: boundPlaylist.playlistUri,
    coverUrl: boundPlaylist.coverUrl || activePlaylist.coverUrl,
    description: 'Linked Focus Playlist for this habit'
  } : activePlaylist

  const embedUrl = extractSpotifyEmbedUrl(currentPlaylist.uri)

  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] shadow-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#1DB954]/10 text-[#1DB954] flex items-center justify-center shrink-0">
            <Headphones className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[var(--text-primary)] truncate">{currentPlaylist.name}</p>
            <p className="text-[10px] text-[var(--text-tertiary)] truncate">Focus Audio</p>
          </div>
        </div>
        <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => setShowPlayer(!showPlayer)}>
          {showPlayer ? 'Hide' : 'Play'}
        </Button>
      </div>
    )
  }

  return (
    <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-card space-y-3 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#1DB954]/10 text-[#1DB954] flex items-center justify-center">
            <Headphones className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
            Focus Sound & Audio
          </span>
        </div>
        <Link
          href="/music"
          className="text-xs font-medium text-[var(--accent)] hover:underline flex items-center gap-0.5"
        >
          <span>Explore Audio</span>
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-12 h-12 rounded-xl shrink-0 shadow-xs flex items-center justify-center text-2xl border border-white/10"
            style={{ background: getPlaylistGradient(currentPlaylist.name) }}
          >
            {getPlaylistEmoji(currentPlaylist.name)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{currentPlaylist.name}</p>
            <p className="text-xs text-[var(--text-tertiary)] truncate">{currentPlaylist.description || 'Curated binaural & ambient focus audio'}</p>
          </div>
        </div>

        <button
          onClick={() => setShowPlayer(!showPlayer)}
          className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#1DB954] hover:bg-[#1ed760] text-black shrink-0 flex items-center gap-1.5 transition-transform hover:scale-105 active:scale-95 shadow-xs"
        >
          <Play className="w-3 h-3 fill-black" />
          <span>{showPlayer ? 'Close Player' : 'Play Sound'}</span>
        </button>
      </div>

      {/* Embedded Mini Player */}
      {showPlayer && embedUrl && (
        <div className="pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <iframe
            src={embedUrl}
            width="100%"
            height="152"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="rounded-xl border border-[var(--border)]"
          />
        </div>
      )}
    </div>
  )
}
