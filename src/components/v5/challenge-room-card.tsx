'use client'

import * as React from 'react'
import { Users, Trophy, Copy, Check, LogOut, Plus } from 'lucide-react'
import type { ChallengeRoom } from '@/lib/types/v5'
import { useProfileStore } from '@/lib/store/profile'
import { useRoomsStore } from '@/lib/store/rooms'
import { useUIStore } from '@/lib/store/ui'
import { Button } from '@/components/ui/button'
import { ProgressBar } from '@/components/ui/progress-bar'
import { formatDate } from '@/lib/utils/date'

interface ChallengeRoomCardProps {
  room: ChallengeRoom
}

export function ChallengeRoomCard({ room }: ChallengeRoomCardProps) {
  const profile = useProfileStore(s => s.profile)
  const incrementProgress = useRoomsStore(s => s.incrementProgress)
  const leaveRoom = useRoomsStore(s => s.leaveRoom)
  const showToast = useUIStore(s => s.showToast)
  const [codeCopied, setCodeCopied] = React.useState(false)

  const me = room.participants.find(p => p.username === profile.username)
  const sorted = [...room.participants].sort((a, b) => b.completedDays - a.completedDays)

  const copyCode = () => {
    navigator.clipboard.writeText(room.code)
    setCodeCopied(true)
    setTimeout(() => setCodeCopied(false), 2000)
  }

  return (
    <div className="p-5 rounded-lg border border-[var(--border)] bg-[var(--bg-base)] space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-bold text-[var(--text-primary)]">{room.title}</h3>
          <p className="text-[10px] text-[var(--text-tertiary)]">
            {room.targetDays}-day challenge · ends {formatDate(room.endDate)}
          </p>
        </div>
        <button
          onClick={copyCode}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-[var(--border)] bg-[var(--bg-elevated)] text-xs font-mono font-bold text-[var(--accent)] hover:bg-[var(--accent-subtle)] transition-colors"
        >
          {codeCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {room.code}
        </button>
      </div>

      {/* Habits list */}
      {room.habitNames.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {room.habitNames.map((name, i) => (
            <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-secondary)]">
              {name}
            </span>
          ))}
        </div>
      )}

      {/* Leaderboard */}
      <div className="space-y-2 border-t border-[var(--border)] pt-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
          Leaderboard ({room.participants.length} {room.participants.length === 1 ? 'participant' : 'participants'})
        </p>
        {sorted.map((p, idx) => (
          <div key={p.username} className="flex items-center gap-2.5">
            <span className="w-4 text-[10px] font-mono font-bold text-[var(--text-tertiary)] text-center">{idx + 1}</span>
            <span className="text-base">{p.avatarEmoji}</span>
            <span className={`text-xs flex-1 font-medium ${p.username === profile.username ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'}`}>
              {p.username} {p.isOwner && <span className="text-[10px] text-[var(--text-tertiary)]">(creator)</span>}
            </span>
            <span className="text-xs font-mono font-semibold tabular-nums text-[var(--text-primary)]">
              {p.completedDays}/{room.targetDays}d
            </span>
          </div>
        ))}
      </div>

      {/* My Progress */}
      {me && (
        <div className="space-y-1.5 border-t border-[var(--border)] pt-3">
          <div className="flex justify-between text-xs text-[var(--text-tertiary)]">
            <span>Your progress</span>
            <span className="font-semibold text-[var(--text-primary)] tabular-nums">{me.completedDays}/{room.targetDays} days</span>
          </div>
          <ProgressBar value={Math.round((me.completedDays / room.targetDays) * 100)} />
          <Button
            size="sm"
            className="w-full mt-2"
            onClick={() => {
              incrementProgress(room.id, profile.username)
              showToast('Progress logged for today!', 'success')
            }}
          >
            <Plus className="w-3.5 h-3.5" /> Log Today's Progress
          </Button>
        </div>
      )}
    </div>
  )
}
