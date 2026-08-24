'use client'

import * as React from 'react'
import { Link2, ArrowRight } from 'lucide-react'
import { useHabitStore } from '@/lib/store/habits'
import { computeHabitCorrelations } from '@/lib/reviews/engine'

export function CorrelationsCard() {
  const habits = useHabitStore(s => s.habits)
  const completions = useHabitStore(s => s.completions)

  const correlations = React.useMemo(
    () => computeHabitCorrelations(habits, completions),
    [habits, completions]
  )

  if (correlations.length === 0) {
    return (
      <div className="p-5 rounded-lg border border-[var(--border)] bg-[var(--bg-base)]">
        <div className="flex items-center gap-2 mb-3">
          <Link2 className="w-4 h-4 text-[var(--accent)]" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Habit Correlations</h3>
        </div>
        <p className="text-xs text-[var(--text-tertiary)] text-center py-4">
          Track habits for at least 7 days to discover correlations between them.
        </p>
      </div>
    )
  }

  return (
    <div className="p-5 rounded-lg border border-[var(--border)] bg-[var(--bg-base)] space-y-4">
      <div className="flex items-center gap-2">
        <Link2 className="w-4 h-4 text-[var(--accent)]" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Habit Correlations</h3>
      </div>

      <div className="space-y-3">
        {correlations.map((c, i) => {
          const strength = Math.abs(c.correlation)
          const color = strength >= 0.6 ? 'text-green-500' : strength >= 0.3 ? 'text-yellow-500' : 'text-[var(--text-tertiary)]'
          return (
            <div key={i} className="flex items-start gap-3 p-3 rounded-md bg-[var(--bg-subtle)] border border-[var(--border)]">
              <div className={`text-xs font-mono font-bold ${color} mt-0.5 w-10 text-right flex-shrink-0`}>
                {c.correlation > 0 ? '+' : ''}{Math.round(c.correlation * 100)}%
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 text-xs font-medium text-[var(--text-primary)]">
                  <span className="truncate">{c.habitAName}</span>
                  <ArrowRight className="w-3 h-3 flex-shrink-0 text-[var(--text-tertiary)]" />
                  <span className="truncate">{c.habitBName}</span>
                </div>
                <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">{c.description}</p>
                <p className="text-[10px] text-[var(--text-tertiary)]">{c.sampleSize} days of data</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
