const fs = require('fs');
const path = require('path');

function writeFile(relPath, content) {
  const fullPath = path.join(__dirname, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Wrote ' + relPath);
}

// ─── Weekly Review Widget ─────────────────────────────────────────
writeFile('src/components/v6/weekly-review-card.tsx', `
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
    const text = \`\${emoji} Week of \${formatDate(review.weekOf)} — \${review.consistencyPct}% consistency
✅ \${review.completed}/\${review.total} habits completed
\${review.topHabitName ? \`🏆 Top habit: \${review.topHabitName} (\${review.topHabitStreak} days)\` : ''}
⚡ +\${review.xpEarned} XP earned\`
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
`);

// ─── Monthly Review Card ────────────────────────────────────────────
writeFile('src/components/v6/monthly-review-card.tsx', `
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
`);

// ─── Habit Correlations Widget ────────────────────────────────────
writeFile('src/components/v6/correlations-card.tsx', `
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
              <div className={\`text-xs font-mono font-bold \${color} mt-0.5 w-10 text-right flex-shrink-0\`}>
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
`);

// ─── Smart Reminders Card ─────────────────────────────────────────
writeFile('src/components/v6/smart-reminders-card.tsx', `
'use client'

import * as React from 'react'
import { Bell, Clock } from 'lucide-react'
import { useHabitStore } from '@/lib/store/habits'
import { generateSmartReminders } from '@/lib/reviews/engine'

export function SmartRemindersCard() {
  const habits = useHabitStore(s => s.habits)
  const completions = useHabitStore(s => s.completions)

  const reminders = React.useMemo(
    () => generateSmartReminders(habits, completions),
    [habits, completions]
  )

  return (
    <div className="p-5 rounded-lg border border-[var(--border)] bg-[var(--bg-base)] space-y-4">
      <div className="flex items-center gap-2">
        <Bell className="w-4 h-4 text-[var(--accent)]" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Smart Reminders</h3>
      </div>

      {reminders.length === 0 ? (
        <p className="text-xs text-[var(--text-tertiary)] text-center py-4">
          Complete habits for at least 5 days to get personalized reminder suggestions.
        </p>
      ) : (
        <div className="space-y-3">
          {reminders.map(r => (
            <div key={r.id} className="flex items-start gap-3 p-3 rounded-md bg-[var(--bg-subtle)] border border-[var(--border)]">
              <Clock className="w-3.5 h-3.5 text-[var(--accent)] mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-[var(--text-primary)] truncate">{r.habitName}</p>
                  <span className="text-xs font-mono font-bold text-[var(--accent)] flex-shrink-0">{r.suggestedTime}</span>
                </div>
                <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">{r.basis}</p>
              </div>
            </div>
          ))}
          <p className="text-[10px] text-[var(--text-tertiary)] text-center">
            Browser push notifications coming in a future update — use these times to set manual reminders.
          </p>
        </div>
      )}
    </div>
  )
}
`);

console.log('V6 UI components written');
