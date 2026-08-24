const fs = require('fs');
const path = require('path');

function writeFile(relPath, content) {
  const fullPath = path.join(__dirname, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Wrote ' + relPath);
}

// ─────────────────────────────────────────────────────────────────
// 1. /profile page
// ─────────────────────────────────────────────────────────────────
writeFile('src/app/profile/page.tsx', `
'use client'

import * as React from 'react'
import { User, Edit } from 'lucide-react'
import { useProfileStore } from '@/lib/store/profile'
import { ConsistencyCard } from '@/components/v5/consistency-card'
import { PartnerPanel } from '@/components/v5/partner-panel'
import { WeeklyWinCard } from '@/components/v5/weekly-win-card'
import { ProfileSetupModal } from '@/components/v5/profile-setup-modal'
import { Button } from '@/components/ui/button'

export default function ProfilePage() {
  const profile = useProfileStore(s => s.profile)
  const hasSetup = useProfileStore(s => s.hasSetup)
  const [setupOpen, setSetupOpen] = React.useState(!hasSetup)

  React.useEffect(() => {
    if (!hasSetup) setSetupOpen(true)
  }, [hasSetup])

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:px-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Your Profile</h1>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
            Share your consistency card and stay accountable with partners.
          </p>
        </div>
        <Button size="sm" variant="secondary" onClick={() => setSetupOpen(true)}>
          <Edit className="w-3.5 h-3.5" /> Edit Profile
        </Button>
      </div>

      {/* Consistency Card */}
      <ConsistencyCard />

      {/* Weekly Win */}
      <WeeklyWinCard />

      {/* Accountability Partners */}
      <div className="p-5 rounded-lg border border-[var(--border)] bg-[var(--bg-base)]">
        <PartnerPanel />
      </div>

      {/* Profile Setup Modal */}
      <ProfileSetupModal open={setupOpen} onOpenChange={setSetupOpen} />
    </div>
  )
}
`);

// ─────────────────────────────────────────────────────────────────
// 2. /social page — Challenge Rooms hub
// ─────────────────────────────────────────────────────────────────
writeFile('src/app/social/page.tsx', `
'use client'

import * as React from 'react'
import { Plus, Users, ArrowRight } from 'lucide-react'
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
  const createRoom = useRoomsStore(s => s.createRoom)
  const joinRoom = useRoomsStore(s => s.joinRoom)
  const profile = useProfileStore(s => s.profile)
  const habits = useHabitStore(s => s.habits)
  const showToast = useUIStore(s => s.showToast)

  const [createOpen, setCreateOpen] = React.useState(false)
  const [joinCode, setJoinCode] = React.useState('')
  const [joinLoading, setJoinLoading] = React.useState(false)

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

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!roomTitle.trim()) return
    if (!profile.username) {
      showToast('Set up your profile first (/profile)', 'error')
      return
    }
    const room = createRoom(roomTitle, roomDesc, roomDays, selectedHabits, profile.username, profile.avatarEmoji)
    showToast(\`Challenge Room created! Code: \${room.code}\`, 'success')
    setCreateOpen(false)
    setRoomTitle('')
    setSelectedHabits([])
  }

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!joinCode.trim() || !profile.username) return
    setJoinLoading(true)
    const success = joinRoom(joinCode, profile.username, profile.avatarEmoji)
    setJoinLoading(false)
    if (success) {
      showToast(\`Joined challenge room \${joinCode.toUpperCase()}!\`, 'success')
      setJoinCode('')
    } else {
      showToast('Room not found or no longer active.', 'error')
    }
  }

  const myRooms = rooms.filter(r => r.participants.some(p => p.username === profile.username))

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:px-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Social & Challenges</h1>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
            Challenge rooms, streak bets, and accountability with real stakes.
          </p>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4" /> Create Room
        </Button>
      </div>

      {/* Join via Code */}
      <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-base)]">
        <form onSubmit={handleJoin} className="flex items-end gap-3">
          <div className="flex-1">
            <Label className="mb-1.5 block text-xs">Join a Challenge Room</Label>
            <Input
              placeholder="Enter 6-digit join code (e.g. AB3K9F)"
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="font-mono uppercase tracking-widest"
            />
          </div>
          <Button type="submit" size="sm" disabled={joinLoading || joinCode.length < 6}>
            <ArrowRight className="w-4 h-4" /> Join
          </Button>
        </form>
      </div>

      {/* My Rooms */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">My Challenge Rooms</h2>
        {myRooms.length === 0 ? (
          <EmptyState
            icon={<Users className="w-8 h-8" />}
            title="No rooms yet"
            description="Create a challenge room or join one with a code from a friend."
            action={<Button size="sm" onClick={() => setCreateOpen(true)}><Plus className="w-3.5 h-3.5" /> Create Room</Button>}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myRooms.map(room => <ChallengeRoomCard key={room.id} room={room} />)}
          </div>
        )}
      </div>

      {/* Streak Bets */}
      <div className="p-5 rounded-lg border border-[var(--border)] bg-[var(--bg-base)]">
        <StreakBets />
      </div>

      {/* Create Room Modal */}
      <Modal open={createOpen} onOpenChange={setCreateOpen}>
        <ModalContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <ModalHeader>
            <ModalTitle>Create Challenge Room</ModalTitle>
          </ModalHeader>
          <form onSubmit={handleCreate} className="p-5 space-y-4">
            <div>
              <Label className="mb-1.5 block">Challenge Title</Label>
              <Input placeholder="e.g. 30-Day Morning Routine Challenge" value={roomTitle} onChange={e => setRoomTitle(e.target.value)} required />
            </div>
            <div>
              <Label className="mb-1.5 block">Description</Label>
              <Input placeholder="What are we challenging ourselves to do?" value={roomDesc} onChange={e => setRoomDesc(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1.5 block">Duration</Label>
              <Select value={String(roomDays)} onValueChange={v => setRoomDays(Number(v) as ChallengeDuration)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 Days</SelectItem>
                  <SelectItem value="14">14 Days</SelectItem>
                  <SelectItem value="30">30 Days</SelectItem>
                  <SelectItem value="60">60 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block">Include Habits (optional)</Label>
              <div className="max-h-36 overflow-y-auto border border-[var(--border)] rounded p-2 space-y-1 bg-[var(--bg-subtle)]">
                {habits.filter(h => h.status === 'active').map(h => {
                  const sel = selectedHabits.includes(h.name)
                  return (
                    <div key={h.id} onClick={() => toggleHabit(h.name)}
                      className={\`flex items-center gap-2 px-2 py-1.5 rounded text-xs cursor-pointer \${sel ? 'bg-[var(--accent-subtle)] text-[var(--accent)] font-medium' : 'hover:bg-[var(--bg-elevated)]'}\`}>
                      <span>{h.icon}</span> {h.name}
                    </div>
                  )
                })}
              </div>
            </div>
            <ModalFooter>
              <Button type="button" variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit">Create Room</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </div>
  )
}
`);

console.log('V5 pages written');
