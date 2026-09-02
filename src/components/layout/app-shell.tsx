'use client'

import * as React from 'react'
import { Sidebar } from './sidebar'
import { MobileNav } from './mobile-nav'
import { Toast } from '@/components/ui/toast'
import { HabitForm } from '@/components/habits/habit-form'
import { CommandMenu } from '@/components/command/command-menu'
import { OfflineBanner } from '@/components/v4/offline-banner'
import { useHabitStore } from '@/lib/store/habits'
import { useRoutinesStore } from '@/lib/store/routines'
import { useGoalsStore } from '@/lib/store/goals'
import { useReflectionsStore } from '@/lib/store/reflections'
import { useV3Store } from '@/lib/store/v3'
import { useSyncStore } from '@/lib/store/sync'
import { useUIStore } from '@/lib/store/ui'
import { useProfileStore } from '@/lib/store/profile'
import Link from 'next/link'

export function AppShell({ children }: { children: React.ReactNode }) {
  const loadHabits = useHabitStore(s => s.loadAll)
  const habitsInitialized = useHabitStore(s => s.initialized)

  const loadRoutines = useRoutinesStore(s => s.loadAll)
  const routinesInitialized = useRoutinesStore(s => s.initialized)

  const loadGoals = useGoalsStore(s => s.loadAll)
  const goalsInitialized = useGoalsStore(s => s.initialized)

  const loadReflections = useReflectionsStore(s => s.loadAll)
  const reflectionsInitialized = useReflectionsStore(s => s.initialized)

  const loadV3 = useV3Store(s => s.loadAll)
  const v3Initialized = useV3Store(s => s.initialized)

  const setOnline = useSyncStore(s => s.setOnline)
  const openHabitForm = useUIStore(s => s.openHabitForm)

  // Load all stores on mount
  React.useEffect(() => {
    if (!habitsInitialized) loadHabits()
    if (!routinesInitialized) loadRoutines()
    if (!goalsInitialized) loadGoals()
    if (!reflectionsInitialized) loadReflections()
    if (!v3Initialized) loadV3()
  }, [habitsInitialized, routinesInitialized, goalsInitialized, reflectionsInitialized, v3Initialized,
      loadHabits, loadRoutines, loadGoals, loadReflections, loadV3])

  // Online/Offline sync status watcher & trigger sync
  React.useEffect(() => {
    const handleOnline = () => {
      setOnline(true)
      const { syncLocalToCloud } = require('@/lib/cloud/sync-engine')
      syncLocalToCloud()
    }
    const handleOffline = () => setOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Periodic sync every 60 seconds
    const interval = setInterval(() => {
      if (navigator.onLine) {
        const { syncLocalToCloud } = require('@/lib/cloud/sync-engine')
        syncLocalToCloud()
      }
    }, 60000)

    // Initial sync
    if (navigator.onLine) {
      const { syncLocalToCloud } = require('@/lib/cloud/sync-engine')
      syncLocalToCloud()
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(interval)
    }
  }, [setOnline])

  // Keyboard shortcut: 'n' for new habit
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement
      const isInput = activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA' || activeElement?.getAttribute('contenteditable') === 'true'
      if (isInput) return
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault()
        openHabitForm()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [openHabitForm])

  const profile = useProfileStore(s => s.profile)
  const hasSetup = useProfileStore(s => s.hasSetup)

  return (
    <div className="flex h-full flex-col md:flex-row bg-[var(--bg-base)] antialiased overflow-hidden">
      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-4 h-14 border-b border-[var(--border)] bg-[var(--bg-card)]/90 backdrop-blur-md shrink-0 sticky top-0 z-30 shadow-subtle safe-area-pt">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center flex-shrink-0 shadow-xs">
            <span className="text-white text-xs font-black">H</span>
          </div>
          <span className="text-sm font-bold text-[var(--text-primary)] tracking-tight">
            Habit
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/profile"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors shadow-2xs"
          >
            <span>{profile.avatarEmoji || '😎'}</span>
            <span className="font-semibold max-w-[100px] truncate">{hasSetup && profile.username ? profile.username : 'Profile'}</span>
          </Link>
        </div>
      </header>

      <Sidebar />
      <main className="flex-1 min-w-0 overflow-y-auto pb-20 md:pb-8 transition-colors">
        {children}
      </main>
      <MobileNav />
      <HabitForm />
      <CommandMenu />
      <OfflineBanner />
      <Toast />
    </div>
  )
}
