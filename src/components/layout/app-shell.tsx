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

  // Online/Offline sync status watcher
  React.useEffect(() => {
    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
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

  return (
    <div className="flex h-full">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-y-auto pb-16 md:pb-0">
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
