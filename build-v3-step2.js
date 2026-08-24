const fs = require('fs');
const path = require('path');

function writeFile(relPath, content) {
  const fullPath = path.join(__dirname, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Wrote ' + relPath);
}

// 1. V3 Unified Store
writeFile('src/lib/store/v3.ts', `
'use client'

import { create } from 'zustand'
import type { HabitException, FocusSessionLog, Challenge, AchievementBadge, UserXPState } from '@/lib/types/v3'
import { db } from '@/lib/db'
import { nanoid } from '@/lib/utils/id'
import { toDateString } from '@/lib/utils/date'

interface V3State {
  exceptions: HabitException[]
  focusLogs: FocusSessionLog[]
  challenges: Challenge[]
  userXP: UserXPState
  loading: boolean
  initialized: boolean

  // Actions
  loadAll: () => Promise<void>
  addException: (exception: Omit<HabitException, 'id'>) => Promise<HabitException>
  logFocusSession: (habitId: string | undefined, durationMinutes: number) => Promise<FocusSessionLog>
  createChallenge: (challenge: Omit<Challenge, 'id' | 'progressDays' | 'status'>) => Promise<Challenge>
  useStreakFreeze: (date: string) => Promise<boolean>
}

export const useV3Store = create<V3State>((set, get) => ({
  exceptions: [],
  focusLogs: [],
  challenges: [],
  userXP: { xp: 0, level: 1, freezesRemaining: 2 },
  loading: false,
  initialized: false,

  loadAll: async () => {
    set({ loading: true })
    try {
      const [exceptions, focusLogs, challenges] = await Promise.all([
        db.exceptions.toArray(),
        db.focusLogs.toArray(),
        db.challenges.toArray(),
      ])

      // Compute XP from focus minutes & exceptions
      const focusMinutes = focusLogs.reduce((acc, curr) => acc + curr.durationMinutes, 0)
      const calculatedXP = (focusLogs.length * 50) + (focusMinutes * 2)
      const level = Math.floor(calculatedXP / 200) + 1

      set({
        exceptions,
        focusLogs,
        challenges,
        userXP: { xp: calculatedXP, level, freezesRemaining: 2 },
        initialized: true,
      })
    } finally {
      set({ loading: false })
    }
  },

  addException: async (data) => {
    const exception: HabitException = { id: nanoid(), ...data }
    await db.exceptions.add(exception)
    set(s => ({ exceptions: [...s.exceptions, exception] }))
    return exception
  },

  logFocusSession: async (habitId, durationMinutes) => {
    const now = new Date()
    const log: FocusSessionLog = {
      id: nanoid(),
      habitId,
      durationMinutes,
      date: toDateString(now),
      completedAt: now.toISOString(),
    }
    await db.focusLogs.add(log)
    set(s => {
      const newXP = s.userXP.xp + (durationMinutes * 2) + 50
      return {
        focusLogs: [...s.focusLogs, log],
        userXP: { ...s.userXP, xp: newXP, level: Math.floor(newXP / 200) + 1 },
      }
    })
    return log
  },

  createChallenge: async (data) => {
    const challenge: Challenge = {
      id: nanoid(),
      progressDays: 0,
      status: 'active',
      ...data,
    }
    await db.challenges.add(challenge)
    set(s => ({ challenges: [...s.challenges, challenge] }))
    return challenge
  },

  useStreakFreeze: async (date) => {
    const { userXP } = get()
    if (userXP.freezesRemaining <= 0) return false

    await get().addException({ date, type: 'freeze', note: 'Streak Freeze applied' })
    set(s => ({ userXP: { ...s.userXP, freezesRemaining: s.userXP.freezesRemaining - 1 } }))
    return true
  },
}))
`);

console.log('V3 Store Written');
