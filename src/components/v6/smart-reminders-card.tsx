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
