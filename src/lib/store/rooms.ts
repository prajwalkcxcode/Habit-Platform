'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ChallengeRoom, ChallengeParticipant } from '@/lib/types/v5'
import { shortCode, nanoid } from '@/lib/utils/id'
import { toDateString, addDays } from '@/lib/utils/date'
import { supabase, isCloudEnabled } from '@/lib/cloud/supabase'

interface RoomsStore {
  rooms: ChallengeRoom[]
  loading: boolean

  loadRooms: () => Promise<void>
  createRoom: (
    title: string,
    description: string,
    targetDays: 7 | 14 | 30 | 60,
    habitNames: string[],
    ownerUsername: string,
    ownerAvatar: string
  ) => Promise<ChallengeRoom>
  joinRoom: (code: string, username: string, avatarEmoji: string) => Promise<boolean>
  incrementProgress: (roomId: string, username: string) => Promise<void>
  leaveRoom: (roomId: string, username: string) => Promise<void>
}

export const useRoomsStore = create<RoomsStore>()(
  persist(
    (set, get) => ({
      rooms: [],
      loading: false,

      loadRooms: async () => {
        if (!isCloudEnabled() || !supabase) return
        set({ loading: true })
        try {
          const { data, error } = await supabase
            .from('challenge_rooms')
            .select('*')
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(50)

          if (error) throw error

          if (data && data.length > 0) {
            const remoteRooms: ChallengeRoom[] = data.map((r: any) => ({
              id: r.id,
              code: r.code,
              title: r.title,
              description: r.description || '',
              creatorUsername: r.creator_username,
              targetDays: r.target_days,
              habitNames: r.habit_names || [],
              startDate: r.start_date,
              endDate: r.end_date,
              participants: r.participants || [],
              status: r.status || 'active',
            }))

            // Merge remote with local rooms (prefer remote updates for matching IDs)
            const localRooms = get().rooms
            const mergedMap = new Map<string, ChallengeRoom>()
            localRooms.forEach(r => mergedMap.set(r.id, r))
            remoteRooms.forEach(r => mergedMap.set(r.id, r))

            set({ rooms: Array.from(mergedMap.values()) })
          }
        } catch (err) {
          console.warn('[RoomsStore] Cloud load failed, continuing in offline mode:', err)
        } finally {
          set({ loading: false })
        }
      },

      createRoom: async (title, description, targetDays, habitNames, ownerUsername, ownerAvatar) => {
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
          code: shortCode(6).toUpperCase(),
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

        // 1. Optimistically update local state
        set(s => ({ rooms: [room, ...s.rooms.filter(r => r.id !== room.id)] }))

        // 2. Persist to Supabase if cloud enabled
        if (isCloudEnabled() && supabase) {
          try {
            await supabase.from('challenge_rooms').insert({
              id: room.id,
              code: room.code,
              title: room.title,
              description: room.description,
              creator_username: room.creatorUsername,
              target_days: room.targetDays,
              habit_names: room.habitNames,
              start_date: room.startDate,
              end_date: room.endDate,
              participants: room.participants,
              status: room.status,
            })
          } catch (err) {
            console.error('[RoomsStore] Failed to save room to Supabase:', err)
          }
        }

        return room
      },

      joinRoom: async (code, username, avatarEmoji) => {
        const cleanCode = code.trim().toUpperCase()
        const { rooms } = get()
        let room = rooms.find(r => r.code === cleanCode && r.status === 'active')

        // If not found in local cache, search Supabase cloud
        if (!room && isCloudEnabled() && supabase) {
          try {
            const { data, error } = await supabase
              .from('challenge_rooms')
              .select('*')
              .eq('code', cleanCode)
              .eq('status', 'active')
              .maybeSingle()

            if (!error && data) {
              room = {
                id: data.id,
                code: data.code,
                title: data.title,
                description: data.description || '',
                creatorUsername: data.creator_username,
                targetDays: data.target_days,
                habitNames: data.habit_names || [],
                startDate: data.start_date,
                endDate: data.end_date,
                participants: data.participants || [],
                status: data.status || 'active',
              }
            }
          } catch (err) {
            console.error('[RoomsStore] Cloud lookup error:', err)
          }
        }

        if (!room) return false

        // Check if already in room
        if (room.participants.some(p => p.username === username)) {
          // Ensure room is in local list
          const finalRoom = room
          set(s => ({
            rooms: [finalRoom, ...s.rooms.filter(r => r.id !== finalRoom.id)]
          }))
          return true
        }

        const newParticipant: ChallengeParticipant = {
          username,
          avatarEmoji,
          completedDays: 0,
          joinedAt: new Date().toISOString(),
          isOwner: false,
        }

        const updatedParticipants = [...room.participants, newParticipant]
        const updatedRoom = { ...room, participants: updatedParticipants }

        // Update local state
        set(s => ({
          rooms: [updatedRoom, ...s.rooms.filter(r => r.id !== updatedRoom.id)]
        }))

        // Update cloud
        if (isCloudEnabled() && supabase) {
          try {
            await supabase
              .from('challenge_rooms')
              .update({ participants: updatedParticipants, updated_at: new Date().toISOString() })
              .eq('id', room.id)
          } catch (err) {
            console.error('[RoomsStore] Cloud update failed on join:', err)
          }
        }

        return true
      },

      incrementProgress: async (roomId, username) => {
        const { rooms } = get()
        const targetRoom = rooms.find(r => r.id === roomId)
        if (!targetRoom) return

        const updatedParticipants = targetRoom.participants.map(p =>
          p.username === username
            ? { ...p, completedDays: Math.min(p.completedDays + 1, targetRoom.targetDays) }
            : p
        )

        // Optimistic local update
        set(s => ({
          rooms: s.rooms.map(r =>
            r.id === roomId ? { ...r, participants: updatedParticipants } : r
          )
        }))

        // Cloud update
        if (isCloudEnabled() && supabase) {
          try {
            await supabase
              .from('challenge_rooms')
              .update({ participants: updatedParticipants, updated_at: new Date().toISOString() })
              .eq('id', roomId)
          } catch (err) {
            console.error('[RoomsStore] Cloud increment failed:', err)
          }
        }
      },

      leaveRoom: async (roomId, username) => {
        const { rooms } = get()
        const targetRoom = rooms.find(r => r.id === roomId)
        if (!targetRoom) return

        const updatedParticipants = targetRoom.participants.filter(p => p.username !== username)

        // Optimistic local update
        set(s => ({
          rooms: s.rooms.map(r =>
            r.id === roomId ? { ...r, participants: updatedParticipants } : r
          )
        }))

        // Cloud update
        if (isCloudEnabled() && supabase) {
          try {
            await supabase
              .from('challenge_rooms')
              .update({ participants: updatedParticipants, updated_at: new Date().toISOString() })
              .eq('id', roomId)
          } catch (err) {
            console.error('[RoomsStore] Cloud leave failed:', err)
          }
        }
      },
    }),
    { name: 'habit-platform-rooms-v5' }
  )
)
