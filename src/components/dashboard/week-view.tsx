'use client'

import * as React from 'react'
import { cn } from '@/lib/utils/cn'
import { getWeekDays, formatShort, formatDayNum, toDateString, isSameDateDay } from '@/lib/utils/date'
import { useHabitStore } from '@/lib/store/habits'
import { isHabitScheduledOnDate } from '@/lib/habits/schedule'
import { useSettingsStore } from '@/lib/store/settings'

interface WeekViewProps {
  selectedDate: Date
  onSelectDate: (date: Date) => void
  className?: string
}

export function WeekView({ selectedDate, onSelectDate, className }: WeekViewProps) {
  const weekStartsOn = useSettingsStore(s => s.weekStartsOn)
  const habits = useHabitStore(s => s.habits)
  const completions = useHabitStore(s => s.completions)

  const weekDays = React.useMemo(() => getWeekDays(selectedDate, weekStartsOn), [selectedDate, weekStartsOn])
  const activeHabits = React.useMemo(() => habits.filter(h => h.status === 'active'), [habits])

  return (
    <div className={cn('grid grid-cols-7 gap-1 text-center', className)}>
      {weekDays.map(day => {
        const dateStr = toDateString(day)
        const isSelected = isSameDateDay(day, selectedDate)
        const isToday = isSameDateDay(day, new Date())

        // Calculate rate for this day
        const scheduled = activeHabits.filter(h => isHabitScheduledOnDate(h, day))
        const completed = scheduled.filter(h =>
          completions.some(c => c.habitId === h.id && c.date === dateStr)
        )
        const isFullyCompleted = scheduled.length > 0 && completed.length === scheduled.length
        const hasSomeCompletion = completed.length > 0

        return (
          <button
            key={dateStr}
            onClick={() => onSelectDate(day)}
            className={cn(
              'flex flex-col items-center py-2 px-1 rounded-md transition-colors border',
              isSelected
                ? 'bg-[var(--accent-subtle)] border-[var(--accent)] text-[var(--accent)] font-semibold'
                : 'border-transparent hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)]',
              isToday && !isSelected && 'text-[var(--text-primary)] font-medium'
            )}
          >
            <span className="text-[10px] uppercase text-[var(--text-tertiary)] font-normal mb-1">
              {formatShort(day)}
            </span>
            <span className="text-xs tabular-nums mb-1.5">{formatDayNum(day)}</span>

            {/* Indicator dot */}
            <span
              className={cn(
                'w-1.5 h-1.5 rounded-full transition-colors',
                isFullyCompleted
                  ? 'bg-[var(--accent)]'
                  : hasSomeCompletion
                    ? 'bg-[var(--accent)] opacity-50'
                    : scheduled.length > 0
                      ? 'bg-[var(--border-strong)]'
                      : 'bg-transparent'
              )}
            />
          </button>
        )
      })}
    </div>
  )
}
