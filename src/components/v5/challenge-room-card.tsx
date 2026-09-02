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
import { sound, triggerHaptic } from '@/lib/audio/haptics'

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
    showToast(`Copied room code: ${room.code}`, 'info')
    setTimeout(() => setCodeCopied(false), 2000)
  }

  const handleLogToday = async () => {
    sound.playCompletion()
    triggerHaptic('light')
    await incrementProgress(room.id, profile.username)
    showToast(`Logged today's challenge progress! ✨`, 'success')
  }

  return (
    <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-card space-y-4 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-[var(--text-primary)] truncate leading-tight">{room.title}</h3>
          <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
            {room.targetDays}-day challenge · ends {formatDate(room.endDate)}
          </p>
        </div>
        <button
          onClick={copyCode}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] text-xs font-mono font-bold text-[var(--accent)] hover:bg-[var(--accent-subtle)] transition-colors shrink-0 shadow-2xs"
          title="Click to copy invite code"
        >
          {codeCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{room.code}</span>
        </button>
      </div>

      {/* Habits list */}
      {room.habitNames && room.habitNames.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {room.habitNames.map((name, i) => (
            <span
              key={i}
              className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-secondary)] shadow-2xs"
            >
              {name}
            </span>
          ))}
        </div>
      )}

      {/* Leaderboard */}
      <div className="space-y-2 border-t border-[var(--border)] pt-3">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
            Leaderboard
          </p>
          <span className="text-[10px] text-[var(--text-tertiary)]">
            {room.participants.length} {room.participants.length === 1 ? 'member' : 'members'}
          </span>
        </div>

        <div className="space-y-1.5">
          {sorted.map((p, idx) => (
            <div
              key={p.username}
              className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-[var(--bg-elevated)]/50 transition-colors"
            >
              <span className="w-4 text-[10px] font-mono font-bold text-[var(--text-tertiary)] text-center">
                {idx === 0 ? '👑' : idx + 1}
              </span>
              <span className="text-base">{p.avatarEmoji || '😎'}</span>
              <span
                className={`text-xs flex-1 font-semibold truncate ${
                  p.username === profile.username ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'
                }`}
              >
                {p.username} {p.isOwner && <span className="text-[10px] font-normal text-[var(--text-tertiary)]">(creator)</span>}
              </span>
              <span className="text-xs font-mono font-bold tabular-nums text-[var(--text-primary)]">
                {p.completedDays}/{room.targetDays}d
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* My Progress & Action */}
      {me && (
        <div className="space-y-2 border-t border-[var(--border)] pt-3">
          <div className="flex justify-between text-xs text-[var(--text-secondary)]">
            <span className="font-medium">Your progress</span>
            <span className="font-bold text-[var(--text-primary)] tabular-nums">
              {me.completedDays} of {room.targetDays} days ({Math.round((me.completedDays / room.targetDays) * 100)}%)
            </span>
          </div>
          <ProgressBar value={Math.round((me.completedDays / room.targetDays) * 100)} size="sm" />
          <Button
            size="sm"
            className="w-full mt-2 rounded-xl text-xs font-semibold shadow-xs"
            onClick={handleLogToday}
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" /> Log Today's Progress
          </Button>
        </div>
      )}
    </div>
  )
}
