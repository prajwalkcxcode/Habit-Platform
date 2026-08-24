'use client'

import { create } from 'zustand'
import type { Habit, Completion, HabitStats } from '@/lib/types'
import { db } from '@/lib/db'
import { computeHabitStats } from '@/lib/habits/streaks'
import { toDateString } from '@/lib/utils/date'
import { nanoid } from '@/lib/utils/id'

interface HabitStoreState {
  habits: Habit[]
  completions: Completion[]
  loading: boolean
  initialized: boolean

  // Actions
  loadAll: () => Promise<void>
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Habit>
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>
  deleteHabit: (id: string) => Promise<void>
  toggleCompletion: (habitId: string, date?: string) => Promise<void>
  getStats: (habitId: string) => HabitStats
  getTodayCompletions: () => Completion[]
  isCompletedToday: (habitId: string) => boolean
  getCompletionsForHabit: (habitId: string) => Completion[]
}

export const useHabitStore = create<HabitStoreState>((set, get) => ({
  habits: [],
  completions: [],
  loading: false,
  initialized: false,

  loadAll: async () => {
    set({ loading: true })
    try {
      const [habits, completions] = await Promise.all([
        db.habits.orderBy('createdAt').toArray(),
        db.completions.orderBy('date').toArray(),
      ])
      set({ habits, completions, initialized: true })
    } finally {
      set({ loading: false })
    }
  },

  addHabit: async (habitData) => {
    const now = new Date()
    const habit: Habit = {
      id: nanoid(),
      ...habitData,
      createdAt: toDateString(now),
      updatedAt: now.toISOString(),
    }
    await db.habits.add(habit)
    set(s => ({ habits: [...s.habits, habit] }))
    return habit
  },

  updateHabit: async (id, updates) => {
    const updatedAt = new Date().toISOString()
    await db.habits.update(id, { ...updates, updatedAt })
    set(s => ({
      habits: s.habits.map(h =>
        h.id === id ? { ...h, ...updates, updatedAt } : h
      ),
    }))
  },

  deleteHabit: async (id) => {
    await db.habits.delete(id)
    await db.completions.where('habitId').equals(id).delete()
    set(s => ({
      habits: s.habits.filter(h => h.id !== id),
      completions: s.completions.filter(c => c.habitId !== id),
    }))
  },

  toggleCompletion: async (habitId, date) => {
    const today = date ?? toDateString(new Date())
    const { completions } = get()
    const existing = completions.find(c => c.habitId === habitId && c.date === today)

    if (existing) {
      // Remove completion (undo)
      await db.completions.delete(existing.id)
      set(s => ({
        completions: s.completions.filter(c => c.id !== existing.id),
      }))
    } else {
      // Add completion
      const completion: Completion = {
        id: nanoid(),
        habitId,
        date: today,
        completedAt: new Date().toISOString(),
      }
      await db.completions.add(completion)
      set(s => ({ completions: [...s.completions, completion] }))
    }
  },

  getStats: (habitId) => {
    const { habits, completions } = get()
    const habit = habits.find(h => h.id === habitId)
    if (!habit) {
      return {
        habitId,
        currentStreak: 0,
        bestStreak: 0,
        totalCompletions: 0,
        completionRate: 0,
        missedDays: 0,
      }
    }
    return computeHabitStats(habit, completions)
  },

  getTodayCompletions: () => {
    const today = toDateString(new Date())
    return get().completions.filter(c => c.date === today)
  },

  isCompletedToday: (habitId) => {
    const today = toDateString(new Date())
    return get().completions.some(c => c.habitId === habitId && c.date === today)
  },

  getCompletionsForHabit: (habitId) => {
    return get().completions.filter(c => c.habitId === habitId)
  },
}))
