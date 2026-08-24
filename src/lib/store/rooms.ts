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
