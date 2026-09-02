'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { MusicProvider, MusicProfile, Playlist, HabitAudioBinding } from '@/lib/music/types'
import { CURATED_FOCUS_PLAYLISTS } from '@/lib/music/spotify'

interface MusicState {
  provider: MusicProvider
  connected: boolean
  accessToken: string | null
  refreshToken: string | null
  expiresAt: number | null
  profile: MusicProfile | null
  userPlaylists: Playlist[]
  habitBindings: Record<string, HabitAudioBinding> // habitId -> Binding
  activePlaylist: Playlist | null

  // Actions
  setAuth: (provider: MusicProvider, accessToken: string, refreshToken?: string, expiresIn?: number) => void
  setProfile: (profile: MusicProfile) => void
  setUserPlaylists: (playlists: Playlist[]) => void
  setActivePlaylist: (playlist: Playlist | null) => void
  bindHabitPlaylist: (habitId: string, binding: HabitAudioBinding) => void
  unbindHabitPlaylist: (habitId: string) => void
  disconnect: () => void
}

export const useMusicStore = create<MusicState>()(
  persist(
    (set) => ({
      provider: 'none',
      connected: false,
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      profile: null,
      userPlaylists: [],
      habitBindings: {},
      activePlaylist: CURATED_FOCUS_PLAYLISTS[1], // Default: Deep Focus

      setAuth: (provider, accessToken, refreshToken, expiresIn) => set({
        provider,
        connected: true,
        accessToken,
        refreshToken: refreshToken || null,
        expiresAt: expiresIn ? Date.now() + expiresIn * 1000 : null,
      }),

      setProfile: (profile) => set({ profile }),
      setUserPlaylists: (userPlaylists) => set({ userPlaylists }),
      setActivePlaylist: (activePlaylist) => set({ activePlaylist }),

      bindHabitPlaylist: (habitId, binding) => set((s) => ({
        habitBindings: { ...s.habitBindings, [habitId]: binding }
      })),

      unbindHabitPlaylist: (habitId) => set((s) => {
        const next = { ...s.habitBindings }
        delete next[habitId]
        return { habitBindings: next }
      }),

      disconnect: () => set({
        provider: 'none',
        connected: false,
        accessToken: null,
        refreshToken: null,
        expiresAt: null,
        profile: null,
        userPlaylists: [],
      }),
    }),
    { name: 'habit-music-store-v1' }
  )
)
