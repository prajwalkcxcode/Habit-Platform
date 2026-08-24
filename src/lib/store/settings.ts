'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserSettings, Theme } from '@/lib/types'

interface SettingsStore extends UserSettings {
  setTheme: (theme: Theme) => void
  setWeekStartsOn: (day: 0 | 1) => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      theme: 'system',
      weekStartsOn: 1,
      setTheme: (theme) => set({ theme }),
      setWeekStartsOn: (weekStartsOn) => set({ weekStartsOn }),
    }),
    { name: 'habit-tracker-settings' }
  )
)
