'use client'

import * as React from 'react'
import { CalendarCheck, TrendingUp, TrendingDown, Zap, Share2, Check } from 'lucide-react'
import { useHabitStore } from '@/lib/store/habits'
import { useSettingsStore } from '@/lib/store/settings'
import { generateWeeklyReview } from '@/lib/reviews/engine'
import { Button } from '@/components/ui/button'
import { ProgressBar } from '@/components/ui/progress-bar'
import { formatDate } from '@/lib/utils/date'

export function WeeklyReviewCard() {
  const habits = useHabitStore(s => s.habits)
  const completions = useHabitStore(s => s.completions)
  const weekStartsOn = useSettingsStore(s => s.weekStartsOn)
  const [copied, setCopied] = React.useState(false)

  const review = React.useMemo(
    () => generateWeeklyReview(habits, completions, weekStartsOn),
    [habits, completions, weekStartsOn]
  )

  const emoji =
    review.consistencyPct >= 90 ? '🔥' :
    review.consistencyPct >= 70 ? '💪' :
    review.consistencyPct >= 50 ? '📈' : '🌱'

  const missedHabits = habits.filter(h => review.missedHabitIds.includes(h.id))

  const handleShare = () => {
    const text = `${emoji} Week of ${formatDate(review.weekOf)} — ${review.consistencyPct}% consistency
✅ ${review.completed}/${review.total} habits completed
${review.topHabitName ? `🏆 Top habit: ${review.topHabitName} (${review.topHabitStreak} days)` : ''}
⚡ +${review.xpEarned} XP earned`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-5 rounded-lg border border-[var(--border)] bg-[var(--bg-base)] space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarCheck className="w-4 h-4 text-[var(--accent)]" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
            Weekly Review
          </h3>
        </div>
        <span className="text-[10px] text-[var(--text-tertiary)]">Week of {formatDate(review.weekOf, 'MMM d')}</span>
      </div>

      {/* Score */}
      <div className="flex items-center gap-4">
        <div className="text-4xl">{emoji}</div>
        <div className="flex-1">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-[var(--text-secondary)]">{review.completed}/{review.total} habits</span>
            <span className="font-bold tabular-nums text-[var(--text-primary)]">{review.consistencyPct}%</span>
          </div>
          <ProgressBar value={review.consistencyPct} />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 border-t border-[var(--border)] pt-3">
        {review.topHabitName && (
          <div className="flex items-start gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-green-500 mt-0.5" />
            <div>
              <p className="text-[10px] text-[var(--text-tertiary)]">Top habit</p>
              <p className="text-xs font-semibold text-[var(--text-primary)] truncate">{review.topHabitName}</p>
              <p className="text-[10px] text-[var(--text-tertiary)]">{review.topHabitStreak}/7 days</p>
            </div>
          </div>
        )}
        {missedHabits.length > 0 && (
          <div className="flex items-start gap-2">
            <TrendingDown className="w-3.5 h-3.5 text-red-400 mt-0.5" />
            <div>
              <p className="text-[10px] text-[var(--text-tertiary)]">Missed entirely</p>
              {missedHabits.slice(0, 2).map(h => (
                <p key={h.id} className="text-xs text-[var(--text-secondary)] truncate">{h.icon} {h.name}</p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* XP earned */}
      <div className="flex items-center gap-2 p-2 rounded-md bg-[var(--bg-elevated)] border border-[var(--border)]">
        <Zap className="w-3.5 h-3.5 text-yellow-500" />
        <span className="text-xs text-[var(--text-secondary)]">+{review.xpEarned} XP earned this week</span>
      </div>

      <Button variant="secondary" size="sm" className="w-full" onClick={handleShare}>
        {copied
          ? <><Check className="w-3.5 h-3.5 text-green-500" /> Copied!</>
          : <><Share2 className="w-3.5 h-3.5" /> Share weekly review</>
        }
      </Button>
    </div>
  )
}
