const fs = require('fs');
const path = require('path');

function writeFile(relPath, content) {
  const fullPath = path.join(__dirname, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Wrote ' + relPath);
}

// ─────────────────────────────────────────────────────────────────
// 1. User Profile Store (persisted)
// ─────────────────────────────────────────────────────────────────
writeFile('src/lib/store/profile.ts', `
'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserProfile, Partner, StreakBet } from '@/lib/types/v5'
import { shortCode, nanoid } from '@/lib/utils/id'
import { toDateString } from '@/lib/utils/date'

const EMOJI_OPTIONS = ['😎','🧠','💪','🌱','🚀','🎯','🔥','📚','🧘','🦁','🐺','⚡']

function generateProfile(): UserProfile {
  return {
    username: '',
    avatarEmoji: EMOJI_OPTIONS[Math.floor(Math.random() * EMOJI_OPTIONS.length)],
    bio: '',
    shareCode: shortCode(6),
    joinedAt: toDateString(new Date()),
  }
}

interface ProfileStore {
  profile: UserProfile
  partners: Partner[]
  bets: StreakBet[]
  hasSetup: boolean

  setProfile: (partial: Partial<UserProfile>) => void
  addPartner: (code: string, username: string, avatarEmoji: string) => void
  removePartner: (id: string) => void
  nudgePartner: (id: string) => void
  simulatePartnerCheckin: (id: string) => void

  addBet: (bet: Omit<StreakBet, 'id' | 'status'>) => void
  resolveBet: (betId: string, won: boolean) => void
}

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set, get) => ({
      profile: generateProfile(),
      partners: [],
      bets: [],
      hasSetup: false,

      setProfile: (partial) => set(s => ({
        profile: { ...s.profile, ...partial },
        hasSetup: true,
      })),

      addPartner: (code, username, avatarEmoji) => {
        const partner: Partner = {
          id: nanoid(),
          username,
          avatarEmoji,
          shareCode: code,
          addedAt: new Date().toISOString(),
          lastCheckedInDate: null,
          nudgeSentToday: false,
        }
        set(s => ({ partners: [...s.partners, partner] }))
      },

      removePartner: (id) =>
        set(s => ({ partners: s.partners.filter(p => p.id !== id) })),

      nudgePartner: (id) =>
        set(s => ({
          partners: s.partners.map(p =>
            p.id === id ? { ...p, nudgeSentToday: true } : p
          ),
        })),

      simulatePartnerCheckin: (id) =>
        set(s => ({
          partners: s.partners.map(p =>
            p.id === id ? { ...p, lastCheckedInDate: toDateString(new Date()) } : p
          ),
        })),

      addBet: (bet) => {
        const newBet: StreakBet = { id: nanoid(), status: 'active', ...bet }
        set(s => ({ bets: [...s.bets, newBet] }))
      },

      resolveBet: (betId, won) =>
        set(s => ({
          bets: s.bets.map(b =>
            b.id === betId
              ? { ...b, status: won ? 'won' : 'lost', resolvedAt: new Date().toISOString() }
              : b
          ),
        })),
    }),
    { name: 'habit-platform-profile-v5' }
  )
)
`);

// ─────────────────────────────────────────────────────────────────
// 2. Challenge Rooms Store (persisted)
// ─────────────────────────────────────────────────────────────────
writeFile('src/lib/store/rooms.ts', `
'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ChallengeRoom, ChallengeParticipant } from '@/lib/types/v5'
import { shortCode, nanoid } from '@/lib/utils/id'
import { toDateString, addDays } from '@/lib/utils/date'

interface RoomsStore {
  rooms: ChallengeRoom[]

  createRoom: (
    title: string,
    description: string,
    targetDays: 7 | 14 | 30 | 60,
    habitNames: string[],
    ownerUsername: string,
    ownerAvatar: string
  ) => ChallengeRoom
  joinRoom: (code: string, username: string, avatarEmoji: string) => boolean
  incrementProgress: (roomId: string, username: string) => void
  leaveRoom: (roomId: string, username: string) => void
}

export const useRoomsStore = create<RoomsStore>()(
  persist(
    (set, get) => ({
      rooms: [],

      createRoom: (title, description, targetDays, habitNames, ownerUsername, ownerAvatar) => {
        const now = new Date()
        const endDate = addDays(now, targetDays)
        const owner: ChallengeParticipant = {
          username: ownerUsername,
          avatarEmoji: ownerAvatar,
          completedDays: 0,
          joinedAt: now.toISOString(),
          isOwner: true,
        }
        const room: ChallengeRoom = {
          id: nanoid(),
          code: shortCode(6),
          title,
          description,
          creatorUsername: ownerUsername,
          targetDays,
          habitNames,
          startDate: toDateString(now),
          endDate: toDateString(endDate),
          participants: [owner],
          status: 'active',
        }
        set(s => ({ rooms: [...s.rooms, room] }))
        return room
      },

      joinRoom: (code, username, avatarEmoji) => {
        const { rooms } = get()
        const room = rooms.find(r => r.code === code.toUpperCase() && r.status === 'active')
        if (!room) return false
        if (room.participants.some(p => p.username === username)) return true

        const participant: ChallengeParticipant = {
          username,
          avatarEmoji,
          completedDays: 0,
          joinedAt: new Date().toISOString(),
          isOwner: false,
        }
        set(s => ({
          rooms: s.rooms.map(r =>
            r.id === room.id
              ? { ...r, participants: [...r.participants, participant] }
              : r
          ),
        }))
        return true
      },

      incrementProgress: (roomId, username) =>
        set(s => ({
          rooms: s.rooms.map(r =>
            r.id === roomId
              ? {
                  ...r,
                  participants: r.participants.map(p =>
                    p.username === username
                      ? { ...p, completedDays: Math.min(p.completedDays + 1, r.targetDays) }
                      : p
                  ),
                }
              : r
          ),
        })),

      leaveRoom: (roomId, username) =>
        set(s => ({
          rooms: s.rooms.map(r =>
            r.id === roomId
              ? { ...r, participants: r.participants.filter(p => p.username !== username) }
              : r
          ),
        })),
    }),
    { name: 'habit-platform-rooms-v5' }
  )
)
`);

// ─────────────────────────────────────────────────────────────────
// 3. Weekly Win Summary computation
// ─────────────────────────────────────────────────────────────────
writeFile('src/lib/social/weekly-summary.ts', `
import type { Habit, Completion } from '@/lib/types'
import type { WeeklyWinSummary } from '@/lib/types/v5'
import { startOfWeek, endOfWeek, eachDayOfInterval, parseISO, format } from 'date-fns'
import { isHabitScheduledOnDate } from '@/lib/habits/schedule'
import { toDateString } from '@/lib/utils/date'

export function computeWeeklySummary(
  habits: Habit[],
  completions: Completion[],
  weekStartsOn: 0 | 1 = 1,
  referenceDate: Date = new Date()
): WeeklyWinSummary {
  const start = startOfWeek(referenceDate, { weekStartsOn })
  const end = endOfWeek(referenceDate, { weekStartsOn })
  const days = eachDayOfInterval({ start, end })

  const activeHabits = habits.filter(h => h.status === 'active')

  let totalScheduled = 0
  let totalCompleted = 0

  days.forEach(day => {
    const dateStr = toDateString(day)
    const scheduled = activeHabits.filter(h => isHabitScheduledOnDate(h, day))
    totalScheduled += scheduled.length
    totalCompleted += scheduled.filter(h =>
      completions.some(c => c.habitId === h.id && c.date === dateStr)
    ).length
  })

  const pct = totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0

  // Find top habit (most completions this week)
  const habitCompletionCounts = activeHabits.map(h => {
    const count = days.filter(day => {
      const dateStr = toDateString(day)
      return completions.some(c => c.habitId === h.id && c.date === dateStr)
    }).length
    return { habit: h, count }
  })
  habitCompletionCounts.sort((a, b) => b.count - a.count)
  const top = habitCompletionCounts[0]

  return {
    weekOf: toDateString(start),
    completed: totalCompleted,
    total: totalScheduled,
    consistencyPct: pct,
    topHabitName: top?.habit.name ?? '',
    topHabitStreak: top?.count ?? 0,
    xpEarned: totalCompleted * 10,
  }
}
`);

console.log('V5 Stores and social logic written');
