'use client'

import * as React from 'react'
import { cn } from '@/lib/utils/cn'
import { toDateString, formatDate, formatMonthYear, getMonthDays } from '@/lib/utils/date'
import { isHabitScheduledOnDate } from '@/lib/habits/schedule'
import type { Habit, Completion } from '@/lib/types'

interface HabitCalendarProps {
  habit: Habit
  completions: Completion[]
  months?: number
}

const WEEK_DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export function HabitCalendar({ habit, completions, months = 3 }: HabitCalendarProps) {
  const completedSet = React.useMemo(
    () => new Set(completions.filter(c => c.habitId === habit.id).map(c => c.date)),
    [completions, habit.id]
  )

  const today = new Date()
  const monthsData = React.useMemo(() => {
    const result = []
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const days = getMonthDays(d)
      result.push({ label: formatMonthYear(d), days })
    }
    return result
  }, [months])

  return (
    <div className="space-y-6">
      {monthsData.map(({ label, days }) => (
        <div key={label} className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-xs space-y-2.5">
          <p className="text-xs font-bold text-[var(--text-primary)]">{label}</p>
          <div className="grid grid-cols-7 gap-1 text-center">
            {WEEK_DAYS.map((d, i) => (
              <div key={i} className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase pb-1">{d}</div>
            ))}
            {/* Offset for first day */}
            {Array.from({ length: days[0].getDay() }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {days.map(day => {
              const dateStr = toDateString(day)
              const isScheduled = isHabitScheduledOnDate(habit, day)
              const isCompleted = completedSet.has(dateStr)
              const isPast = day <= today
              const isToday = dateStr === toDateString(today)

              return (
                <div
                  key={dateStr}
                  title={`${formatDate(day, 'MMM d')}: ${isCompleted ? 'Completed' : isScheduled && isPast ? 'Missed' : 'Not scheduled'}`}
                  className={cn(
                    'aspect-square rounded-xl flex items-center justify-center text-xs tabular-nums transition-colors font-medium',
                    isCompleted
                      ? 'bg-[var(--accent)] text-white font-bold shadow-2xs'
                      : isScheduled && isPast && !isToday
                      ? 'bg-[var(--bg-elevated)] text-[var(--text-tertiary)]'
                      : 'text-[var(--text-tertiary)] opacity-40',
                    isToday && !isCompleted && 'ring-2 ring-[var(--accent)] ring-inset font-bold text-[var(--accent)]'
                  )}
                >
                  {day.getDate()}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
