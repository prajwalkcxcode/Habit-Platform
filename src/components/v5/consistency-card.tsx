'use client'

import * as React from 'react'
import { Flame, Trophy, CheckCircle2, Share2, Copy, Check } from 'lucide-react'
import { useProfileStore } from '@/lib/store/profile'
import { useHabitStore } from '@/lib/store/habits'
import { useV3Store } from '@/lib/store/v3'
import { computeWeeklySummary } from '@/lib/social/weekly-summary'
import { useSettingsStore } from '@/lib/store/settings'
import { Button } from '@/components/ui/button'

export function ConsistencyCard() {
  const profile = useProfileStore(s => s.profile)
  const habits = useHabitStore(s => s.habits)
  const completions = useHabitStore(s => s.completions)
  const getStats = useHabitStore(s => s.getStats)
  const userXP = useV3Store(s => s.userXP)
  const weekStartsOn = useSettingsStore(s => s.weekStartsOn)
  const [copied, setCopied] = React.useState(false)

  const activeHabits = habits.filter(h => h.status === 'active')
  const maxStreak = activeHabits.length > 0
    ? Math.max(...activeHabits.map(h => getStats(h.id).currentStreak))
    : 0
  const bestStreak = activeHabits.length > 0
    ? Math.max(...activeHabits.map(h => getStats(h.id).bestStreak))
    : 0

  const weekly = computeWeeklySummary(habits, completions, weekStartsOn)

  const handleCopy = () => {
    const text = `${profile.avatarEmoji} ${profile.username || 'Anonymous'} on Habit Platform
This week: ${weekly.completed}/${weekly.total} habits (${weekly.consistencyPct}%)
Current streak: ${maxStreak} days
Level ${userXP.level} · ${userXP.xp} XP
Share code: ${profile.shareCode}`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--bg-base)] space-y-5">
      {/* Identity */}
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center text-3xl">
          {profile.avatarEmoji}
        </div>
        <div>
          <h2 className="text-base font-bold text-[var(--text-primary)]">
            {profile.username || 'Anonymous'}
          </h2>
          {profile.bio && (
            <p className="text-xs text-[var(--text-secondary)] max-w-[220px]">{profile.bio}</p>
          )}
          <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5 font-mono">
            Code: <span className="font-bold text-[var(--accent)]">{profile.shareCode}</span>
          </p>
        </div>
        <div className="ml-auto">
          <div className="w-10 h-10 rounded-full bg-[var(--accent)] text-white flex items-center justify-center font-bold text-sm">
            L{userXP.level}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: <Flame className="w-4 h-4 text-orange-500" />, label: 'Streak', value: `${maxStreak}d` },
          { icon: <Trophy className="w-4 h-4 text-yellow-500" />, label: 'Best', value: `${bestStreak}d` },
          { icon: <CheckCircle2 className="w-4 h-4 text-[var(--accent)]" />, label: 'This week', value: `${weekly.consistencyPct}%` },
        ].map(({ icon, label, value }) => (
          <div key={label} className="p-3 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] text-center">
            <div className="flex justify-center mb-1">{icon}</div>
            <p className="text-base font-bold text-[var(--text-primary)] tabular-nums">{value}</p>
            <p className="text-[10px] text-[var(--text-tertiary)]">{label}</p>
          </div>
        ))}
      </div>

      {/* Weekly summary */}
      <div className="p-3 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border)] text-xs text-[var(--text-secondary)]">
        <span className="font-semibold text-[var(--text-primary)]">This week</span>
        {' '}— {weekly.completed} of {weekly.total} habits completed
        {weekly.topHabitName && (
          <span className="text-[var(--text-tertiary)]"> · Top: {weekly.topHabitName}</span>
        )}
      </div>

      {/* Share button */}
      <Button variant="secondary" size="sm" className="w-full" onClick={handleCopy}>
        {copied
          ? <><Check className="w-3.5 h-3.5 text-green-500" /> Copied to clipboard!</>
          : <><Share2 className="w-3.5 h-3.5" /> Share my consistency card</>
        }
      </Button>
    </div>
  )
}
