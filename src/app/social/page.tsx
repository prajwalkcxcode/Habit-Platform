'use client'

import * as React from 'react'
import { Plus, Users, ArrowRight, Sparkles, Shield, Trophy } from 'lucide-react'
import { useRoomsStore } from '@/lib/store/rooms'
import { useProfileStore } from '@/lib/store/profile'
import { useHabitStore } from '@/lib/store/habits'
import { useUIStore } from '@/lib/store/ui'
import { ChallengeRoomCard } from '@/components/v5/challenge-room-card'
import { StreakBets } from '@/components/v5/streak-bet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { EmptyState } from '@/components/ui/empty-state'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from '@/components/ui/modal'
import type { ChallengeDuration } from '@/lib/types/v5'

export default function SocialPage() {
  const rooms = useRoomsStore(s => s.rooms)
  const loadRooms = useRoomsStore(s => s.loadRooms)
  const createRoom = useRoomsStore(s => s.createRoom)
  const joinRoom = useRoomsStore(s => s.joinRoom)
  const profile = useProfileStore(s => s.profile)
  const habits = useHabitStore(s => s.habits)
  const showToast = useUIStore(s => s.showToast)

  const [createOpen, setCreateOpen] = React.useState(false)
  const [joinCode, setJoinCode] = React.useState('')
  const [joinLoading, setJoinLoading] = React.useState(false)
  const [createLoading, setCreateLoading] = React.useState(false)

  // Load cloud rooms on mount
  React.useEffect(() => {
    loadRooms()
  }, [loadRooms])

  // Create form state
  const [roomTitle, setRoomTitle] = React.useState('')
  const [roomDesc, setRoomDesc] = React.useState('')
  const [roomDays, setRoomDays] = React.useState<ChallengeDuration>(7)
  const [selectedHabits, setSelectedHabits] = React.useState<string[]>([])

  const toggleHabit = (name: string) => {
    if (selectedHabits.includes(name)) {
      setSelectedHabits(selectedHabits.filter(h => h !== name))
    } else {
      setSelectedHabits([...selectedHabits, name])
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!roomTitle.trim()) return
    if (!profile.username) {
      showToast('Set up your profile first (/profile) to create rooms', 'error')
      return
    }
    setCreateLoading(true)
    try {
      const room = await createRoom(roomTitle, roomDesc, roomDays, selectedHabits, profile.username, profile.avatarEmoji)
      showToast(`Challenge Room created! Code: ${room.code} 🚀`, 'success')
      setCreateOpen(false)
      setRoomTitle('')
      setRoomDesc('')
      setSelectedHabits([])
    } catch (err: any) {
      showToast('Failed to create room. Check network connection.', 'error')
    } finally {
      setCreateLoading(false)
    }
  }

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!joinCode.trim()) return
    if (!profile.username) {
      showToast('Set up your username in Profile before joining', 'error')
      return
    }
    setJoinLoading(true)
    try {
      const success = await joinRoom(joinCode, profile.username, profile.avatarEmoji)
      if (success) {
        showToast(`Joined challenge room ${joinCode.toUpperCase()}! 🎉`, 'success')
        setJoinCode('')
      } else {
        showToast('Room not found. Verify the 6-character code with your friend.', 'error')
      }
    } catch (err: any) {
      showToast('Error joining room. Please try again.', 'error')
    } finally {
      setJoinLoading(false)
    }
  }

  const myRooms = rooms.filter(r => r.participants.some(p => p.username === profile.username))

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent)]/30">
              Multiplayer Accountability
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Social Challenge Rooms</h1>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
            Create multi-day challenge rooms, invite friends via 6-digit codes, and hold each other accountable.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="rounded-xl text-xs font-semibold shadow-xs shrink-0">
          <Plus className="w-4 h-4" /> Create Room
        </Button>
      </div>

      {/* Join via Code Card */}
      <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-card">
        <form onSubmit={handleJoin} className="flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="flex-1 space-y-1.5">
            <Label className="text-xs font-semibold text-[var(--text-secondary)]">Join a Friend's Challenge Room</Label>
            <Input
              placeholder="Enter 6-character code (e.g. AB3K9F)"
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="font-mono uppercase tracking-widest text-base rounded-xl h-10"
            />
          </div>
          <Button
            type="submit"
            disabled={joinLoading || joinCode.trim().length < 6}
            className="rounded-xl text-xs font-semibold h-10 px-5 shadow-xs"
          >
            {joinLoading ? (
              <span>Searching cloud...</span>
            ) : (
              <>
                <ArrowRight className="w-4 h-4" /> Join Room
              </>
            )}
          </Button>
        </form>
      </div>

      {/* My Challenge Rooms */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[var(--text-primary)]">My Active Challenge Rooms</h2>
          <span className="text-xs font-medium text-[var(--text-tertiary)]">{myRooms.length} active</span>
        </div>

        {myRooms.length === 0 ? (
          <div className="p-8 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg-card)]/50 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center mx-auto text-2xl shadow-xs">
              👥
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">No challenge rooms yet</h3>
              <p className="text-xs text-[var(--text-tertiary)] max-w-sm mx-auto">
                Create a 7, 14, or 30-day room, copy the 6-character invite code, and send it to your partner or friends.
              </p>
            </div>
            <Button size="sm" onClick={() => setCreateOpen(true)} className="rounded-xl text-xs font-semibold shadow-xs">
              <Plus className="w-3.5 h-3.5" /> Create Your First Room
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myRooms.map(room => (
              <ChallengeRoomCard key={room.id} room={room} />
            ))}
          </div>
        )}
      </div>

      {/* Streak Bets & Commitment Widget */}
      <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-card">
        <StreakBets />
      </div>

      {/* Create Room Modal */}
      <Modal open={createOpen} onOpenChange={setCreateOpen}>
        <ModalContent className="max-w-md max-h-[90vh] overflow-y-auto rounded-2xl">
          <ModalHeader>
            <ModalTitle>Create Multiplayer Challenge Room</ModalTitle>
          </ModalHeader>
          <form onSubmit={handleCreate} className="p-5 space-y-4">
            <div>
              <Label className="mb-1.5 block text-xs font-medium">Challenge Title</Label>
              <Input
                placeholder="e.g. 30-Day Morning Workout Challenge"
                value={roomTitle}
                onChange={e => setRoomTitle(e.target.value)}
                required
                className="rounded-xl"
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs font-medium">Description (Optional)</Label>
              <Input
                placeholder="What habits are we doing together?"
                value={roomDesc}
                onChange={e => setRoomDesc(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs font-medium">Challenge Duration</Label>
              <Select value={String(roomDays)} onValueChange={v => setRoomDays(Number(v) as ChallengeDuration)}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="7">7 Days (Sprint)</SelectItem>
                  <SelectItem value="14">14 Days (Two Weeks)</SelectItem>
                  <SelectItem value="30">30 Days (Habit Builder)</SelectItem>
                  <SelectItem value="60">60 Days (Lifestyle Mastery)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block text-xs font-medium">Include Habits in Challenge</Label>
              <div className="max-h-36 overflow-y-auto border border-[var(--border)] rounded-xl p-2 space-y-1 bg-[var(--bg-subtle)]">
                {habits.filter(h => h.status === 'active').map(h => {
                  const sel = selectedHabits.includes(h.name)
                  return (
                    <div
                      key={h.id}
                      onClick={() => toggleHabit(h.name)}
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                        sel
                          ? 'bg-[var(--accent-subtle)] text-[var(--accent)] font-semibold'
                          : 'hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)]'
                      }`}
                    >
                      <span className="text-sm">{h.icon}</span> {h.name}
                    </div>
                  )
                })}
              </div>
            </div>
            <ModalFooter>
              <Button type="button" variant="secondary" onClick={() => setCreateOpen(false)} className="rounded-xl text-xs">
                Cancel
              </Button>
              <Button type="submit" disabled={createLoading} className="rounded-xl text-xs font-semibold">
                {createLoading ? 'Creating in Cloud...' : 'Create Room'}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </div>
  )
}
