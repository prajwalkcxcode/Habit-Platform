'use client'

import * as React from 'react'
import { BarChart3, Trophy, TrendingUp, TrendingDown } from 'lucide-react'
import { useHabitStore } from '@/lib/store/habits'
import { useSettingsStore } from '@/lib/store/settings'
import { generateMonthlyReview } from '@/lib/reviews/engine'
import { ProgressBar } from '@/components/ui/progress-bar'

export function MonthlyReviewCard({ date = new Date() }: { date?: Date }) {
  const habits = useHabitStore(s => s.habits)
  const completions = useHabitStore(s => s.completions)
  const weekStartsOn = useSettingsStore(s => s.weekStartsOn)

  const review = React.useMemo(
    () => generateMonthlyReview(habits, completions, weekStartsOn, date),
    [habits, completions, weekStartsOn, date]
  )

  return (
    <div className="p-5 rounded-lg border border-[var(--border)] bg-[var(--bg-base)] space-y-4">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-[var(--accent)]" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
          Monthly Review
        </h3>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-[var(--text-secondary)]">{review.totalCompleted}/{review.totalScheduled} total completions</span>
          <span className="font-bold text-[var(--text-primary)] tabular-nums">{review.consistencyPct}%</span>
        </div>
        <ProgressBar value={review.consistencyPct} />
      </div>

      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="p-3 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] text-center">
          <TrendingUp className="w-4 h-4 text-green-500 mx-auto mb-1" />
          <p className="text-sm font-bold tabular-nums text-[var(--text-primary)]">{review.bestWeekPct}%</p>
          <p className="text-[10px] text-[var(--text-tertiary)]">Best week</p>
        </div>
        <div className="p-3 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] text-center">
          <TrendingDown className="w-4 h-4 text-red-400 mx-auto mb-1" />
          <p className="text-sm font-bold tabular-nums text-[var(--text-primary)]">{review.worstWeekPct}%</p>
          <p className="text-[10px] text-[var(--text-tertiary)]">Worst week</p>
        </div>
      </div>

      {review.longestStreakHabitName && (
        <div className="flex items-center gap-2 p-2.5 rounded-md bg-[var(--bg-subtle)] border border-[var(--border)]">
          <Trophy className="w-3.5 h-3.5 text-yellow-500" />
          <div className="text-xs">
            <span className="text-[var(--text-secondary)]">Best streak: </span>
            <span className="font-semibold text-[var(--text-primary)]">{review.longestStreak} days</span>
            <span className="text-[var(--text-tertiary)]"> — {review.longestStreakHabitName}</span>
          </div>
        </div>
      )}
    </div>
  )
}
