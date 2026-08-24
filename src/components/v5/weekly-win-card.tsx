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

  const shareText = `${emoji} Weekly habit win — ${summary.consistencyPct}% consistency (${summary.completed}/${summary.total} habits)! ${profile.username ? '— ' + profile.username : ''} #HabitPlatform`

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
