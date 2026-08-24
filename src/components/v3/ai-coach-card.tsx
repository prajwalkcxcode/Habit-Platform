'use client'

import * as React from 'react'
import { Sparkles, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react'
import { useHabitStore } from '@/lib/store/habits'
import { generateAICoachInsights } from '@/lib/ai/coach'
import { useUIStore } from '@/lib/store/ui'
import { Button } from '@/components/ui/button'

export function AICoachCard() {
  const habits = useHabitStore(s => s.habits)
  const completions = useHabitStore(s => s.completions)
  const updateHabit = useHabitStore(s => s.updateHabit)
  const showToast = useUIStore(s => s.showToast)

  const insights = React.useMemo(
    () => generateAICoachInsights(habits, completions),
    [habits, completions]
  )

  if (insights.length === 0) return null

  return (
    <div className="p-5 rounded-lg border border-[var(--border)] bg-[var(--bg-base)] space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              AI Consistency Coach
            </h3>
            <p className="text-[10px] text-[var(--text-tertiary)]">Fact-based insights derived from your check-in logs</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {insights.map(item => (
          <div key={item.id} className="p-3 rounded-md bg-[var(--bg-subtle)] border border-[var(--border)] space-y-1.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent)]" /> {item.title}
              </h4>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">{item.description}</p>
            <p className="text-[10px] font-mono text-[var(--text-tertiary)]">{item.explanation}</p>

            {item.actionLabel && item.habitId && item.suggestedTime && (
              <div className="pt-1 flex justify-end">
                <Button
                  size="sm"
                  variant="secondary"
                  className="text-xs h-7"
                  onClick={async () => {
                    await updateHabit(item.habitId!, { preferredTime: item.suggestedTime as any })
                    showToast(`Updated preferred time for habit`, 'success')
                  }}
                >
                  {item.actionLabel} <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
