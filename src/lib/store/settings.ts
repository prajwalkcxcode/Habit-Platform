'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserSettings, Theme } from '@/lib/types'

interface SettingsStore extends UserSettings {
  soundEnabled: boolean
  hapticsEnabled: boolean
  setTheme: (theme: Theme) => void
  setWeekStartsOn: (day: 0 | 1) => void
  setSoundEnabled: (enabled: boolean) => void
  setHapticsEnabled: (enabled: boolean) => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      theme: 'system',
      weekStartsOn: 1,
      soundEnabled: true,
      hapticsEnabled: true,
      setTheme: (theme) => set({ theme }),
      setWeekStartsOn: (weekStartsOn) => set({ weekStartsOn }),
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
      setHapticsEnabled: (hapticsEnabled) => set({ hapticsEnabled }),
    }),
    { name: 'habit-tracker-settings' }
  )
)
