const fs = require('fs');
const path = require('path');

function writeFile(relPath, content) {
  const fullPath = path.join(__dirname, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Wrote ' + relPath);
}

// ─────────────────────────────────────────────────────────────────
// 1. Challenge Rooms UI
// ─────────────────────────────────────────────────────────────────
writeFile('src/components/v5/challenge-room-card.tsx', `
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
            <span className={\`text-xs flex-1 font-medium \${p.username === profile.username ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'}\`}>
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
`);

// ─────────────────────────────────────────────────────────────────
// 2. Streak Bet Component
// ─────────────────────────────────────────────────────────────────
writeFile('src/components/v5/streak-bet.tsx', `
'use client'

import * as React from 'react'
import { Zap, Trophy, X, Plus } from 'lucide-react'
import { useProfileStore } from '@/lib/store/profile'
import { useHabitStore } from '@/lib/store/habits'
import { useV3Store } from '@/lib/store/v3'
import { useUIStore } from '@/lib/store/ui'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { toDateString } from '@/lib/utils/date'

export function StreakBets() {
  const bets = useProfileStore(s => s.bets)
  const addBet = useProfileStore(s => s.addBet)
  const resolveBet = useProfileStore(s => s.resolveBet)
  const habits = useHabitStore(s => s.habits)
  const getStats = useHabitStore(s => s.getStats)
  const userXP = useV3Store(s => s.userXP)
  const showToast = useUIStore(s => s.showToast)

  const [creating, setCreating] = React.useState(false)
  const [selectedHabitId, setSelectedHabitId] = React.useState('')
  const [targetStreak, setTargetStreak] = React.useState(7)
  const [xpStake, setXpStake] = React.parameter = React.useState(50)

  const activeBets = bets.filter(b => b.status === 'active')
  const resolvedBets = bets.filter(b => b.status !== 'active')

  const handleCreateBet = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedHabitId) return
    addBet({
      habitId: selectedHabitId,
      targetStreak,
      xpStake,
      startDate: toDateString(new Date()),
    })
    showToast(\`Streak bet placed! Reach \${targetStreak} days to win \${xpStake} XP.\`, 'success')
    setCreating(false)
  }

  const handleResolve = (betId: string, won: boolean, habitName: string) => {
    resolveBet(betId, won)
    showToast(won ? \`Bet won! +\${bets.find(b=>b.id===betId)?.xpStake} XP\` : \`Bet lost. Try again!\`, won ? 'success' : 'error')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Streak Bets</h3>
        <Button size="sm" variant="secondary" onClick={() => setCreating(!creating)}>
          <Plus className="w-3.5 h-3.5" /> Place Bet
        </Button>
      </div>

      {creating && (
        <form onSubmit={handleCreateBet} className="p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-3">
              <Label className="mb-1 block text-xs">Habit</Label>
              <Select value={selectedHabitId} onValueChange={setSelectedHabitId} required>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select habit..." /></SelectTrigger>
                <SelectContent>
                  {habits.filter(h => h.status === 'active').map(h => (
                    <SelectItem key={h.id} value={h.id}>{h.icon} {h.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1 block text-xs">Streak target</Label>
              <Select value={String(targetStreak)} onValueChange={v => setTargetStreak(Number(v))}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[3, 7, 14, 21, 30].map(d => <SelectItem key={d} value={String(d)}>{d} days</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1 block text-xs">XP stake</Label>
              <Select value={String(xpStake)} onValueChange={v => setXpStake(Number(v))}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[25, 50, 100, 200].map(x => <SelectItem key={x} value={String(x)}>{x} XP</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button type="submit" size="sm" className="w-full h-8">Bet</Button>
            </div>
          </div>
        </form>
      )}

      {activeBets.length === 0 && !creating && (
        <p className="text-xs text-[var(--text-tertiary)] text-center py-4">
          No active bets. Place a streak bet to create real commitment.
        </p>
      )}

      {activeBets.map(bet => {
        const habit = habits.find(h => h.id === bet.habitId)
        const stats = habit ? getStats(habit.id) : null
        const progress = stats ? Math.min(stats.currentStreak, bet.targetStreak) : 0
        const won = progress >= bet.targetStreak
        return (
          <div key={bet.id} className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border)] bg-[var(--bg-base)]">
            <Zap className="w-4 h-4 text-yellow-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[var(--text-primary)] truncate">{habit?.name ?? 'Unknown habit'}</p>
              <p className="text-[10px] text-[var(--text-tertiary)]">
                {progress}/{bet.targetStreak} days · {bet.xpStake} XP at stake
              </p>
            </div>
            {won ? (
              <Button size="sm" className="h-7 text-xs bg-green-500 hover:bg-green-600" onClick={() => handleResolve(bet.id, true, habit?.name ?? '')}>
                <Trophy className="w-3 h-3" /> Claim!
              </Button>
            ) : (
              <Button size="sm" variant="secondary" className="h-7 text-xs text-red-500" onClick={() => handleResolve(bet.id, false, habit?.name ?? '')}>
                <X className="w-3 h-3" /> Forfeit
              </Button>
            )}
          </div>
        )
      })}
    </div>
  )
}
`);

// ─────────────────────────────────────────────────────────────────
// 3. Weekly Win Card
// ─────────────────────────────────────────────────────────────────
writeFile('src/components/v5/weekly-win-card.tsx', `
'use client'

import * as React from 'react'
import { Share2, Check, TrendingUp, Award } from 'lucide-react'
import { useHabitStore } from '@/lib/store/habits'
import { useProfileStore } from '@/lib/store/profile'
import { useSettingsStore } from '@/lib/store/settings'
import { computeWeeklySummary } from '@/lib/social/weekly-summary'
import { Button } from '@/components/ui/button'

export function WeeklyWinCard() {
  const habits = useHabitStore(s => s.habits)
  const completions = useHabitStore(s => s.completions)
  const weekStartsOn = useSettingsStore(s => s.weekStartsOn)
  const profile = useProfileStore(s => s.profile)
  const [copied, setCopied] = React.useState(false)

  const summary = React.useMemo(
    () => computeWeeklySummary(habits, completions, weekStartsOn),
    [habits, completions, weekStartsOn]
  )

  const emoji =
    summary.consistencyPct >= 90 ? '🔥' :
    summary.consistencyPct >= 70 ? '💪' :
    summary.consistencyPct >= 50 ? '📈' : '🌱'

  const shareText = \`\${emoji} Weekly habit win — \${summary.consistencyPct}% consistency (\${summary.completed}/\${summary.total} habits)! \${profile.username ? '— ' + profile.username : ''} #HabitPlatform\`

  const handleShare = () => {
    navigator.clipboard.writeText(shareText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-base)] space-y-3">
      <div className="flex items-center gap-2">
        <Award className="w-4 h-4 text-[var(--accent)]" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Weekly Win Card</h3>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-4xl">{emoji}</div>
        <div className="flex-1">
          <p className="text-lg font-bold text-[var(--text-primary)] tabular-nums">{summary.consistencyPct}%</p>
          <p className="text-xs text-[var(--text-secondary)]">
            {summary.completed} of {summary.total} habits this week
          </p>
          {summary.topHabitName && (
            <p className="text-[10px] text-[var(--text-tertiary)] flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-3 h-3" /> Top: {summary.topHabitName}
            </p>
          )}
        </div>
      </div>

      <Button variant="secondary" size="sm" className="w-full" onClick={handleShare}>
        {copied
          ? <><Check className="w-3.5 h-3.5 text-green-500" /> Copied!</>
          : <><Share2 className="w-3.5 h-3.5" /> Share this week's win</>
        }
      </Button>
    </div>
  )
}
`);

console.log('V5 Challenge Rooms, Streak Bets, Weekly Win written');
