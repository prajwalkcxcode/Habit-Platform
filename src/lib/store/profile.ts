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
