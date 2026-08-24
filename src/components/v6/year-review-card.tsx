'use client'

import * as React from 'react'
import { Sparkles, Flame, Clock, Zap, BarChart2 } from 'lucide-react'
import { useHabitStore } from '@/lib/store/habits'
import { useV3Store } from '@/lib/store/v3'
import { generateYearReview } from '@/lib/reviews/engine'

export function YearReviewCard({ year = new Date().getFullYear() }: { year?: number }) {
  const habits = useHabitStore(s => s.habits)
  const completions = useHabitStore(s => s.completions)
  const focusLogs = useV3Store(s => s.focusLogs)

  const review = React.useMemo(() => {
    const base = generateYearReview(habits, completions, year)
    const totalFocusMinutes = focusLogs
      .filter(l => l.date.startsWith(String(year)))
      .reduce((acc, l) => acc + l.durationMinutes, 0)
    return { ...base, totalFocusMinutes }
  }, [habits, completions, year, focusLogs])

  const barMax = Math.max(...review.monthlyBreakdown.map(m => m.pct), 1)

  return (
    <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--bg-base)] space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-[var(--accent)]" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
          {year} Year in Review
        </h3>
      </div>

      {/* Hero stats */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: <Zap className="w-4 h-4 text-yellow-500" />, label: 'XP Earned', value: review.totalXpEarned.toLocaleString() },
          { icon: <BarChart2 className="w-4 h-4 text-[var(--accent)]" />, label: 'Consistency', value: `${review.consistencyPct}%` },
          { icon: <Flame className="w-4 h-4 text-orange-500" />, label: 'Longest Streak', value: `${review.longestStreak}d` },
          { icon: <Clock className="w-4 h-4 text-blue-500" />, label: 'Focus Time', value: review.totalFocusMinutes >= 60 ? `${Math.round(review.totalFocusMinutes / 60)}h` : `${review.totalFocusMinutes}m` },
        ].map(({ icon, label, value }) => (
          <div key={label} className="p-3 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] space-y-1">
            <div className="flex items-center gap-1.5">{icon}<span className="text-[10px] text-[var(--text-tertiary)]">{label}</span></div>
            <p className="text-xl font-bold text-[var(--text-primary)] tabular-nums">{value}</p>
          </div>
        ))}
      </div>

      {/* Longest streak habit */}
      {review.longestStreakHabitName && (
        <div className="text-xs text-[var(--text-secondary)] bg-[var(--bg-subtle)] border border-[var(--border)] rounded-lg p-3">
          <span className="text-[var(--text-tertiary)]">Best streak habit: </span>
          <span className="font-semibold text-[var(--text-primary)]">{review.longestStreakHabitName}</span>
          <span className="text-[var(--text-tertiary)]"> — {review.longestStreak} consecutive days</span>
        </div>
      )}

      {/* Monthly bar chart */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-3">Month-by-month consistency</p>
        <div className="flex items-end gap-1 h-20">
          {review.monthlyBreakdown.map(({ month, pct }) => (
            <div key={month} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full rounded-sm bg-[var(--accent)]" style={{ height: `${Math.max((pct / barMax) * 64, pct > 0 ? 4 : 0)}px`, opacity: pct > 0 ? 0.4 + (pct / 100) * 0.6 : 0.15 }} title={`${month}: ${pct}%`} />
              <span className="text-[9px] text-[var(--text-tertiary)] font-mono">{month.slice(0,1)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Total completions summary */}
      <p className="text-xs text-center text-[var(--text-tertiary)]">
        {review.totalCompleted.toLocaleString()} habits completed out of {review.totalScheduled.toLocaleString()} scheduled in {year}
      </p>
    </div>
  )
}
