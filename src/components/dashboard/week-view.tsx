'use client'

import * as React from 'react'
import { cn } from '@/lib/utils/cn'
import { getWeekDays, formatShort, formatDayNum, toDateString, isSameDateDay } from '@/lib/utils/date'
import { useHabitStore } from '@/lib/store/habits'
import { isHabitScheduledOnDate } from '@/lib/habits/schedule'
import { useSettingsStore } from '@/lib/store/settings'
import { Check } from 'lucide-react'

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
    <div className={cn('p-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-card', className)}>
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center">
        {weekDays.map(day => {
          const dateStr = toDateString(day)
          const isSelected = isSameDateDay(day, selectedDate)
          const isToday = isSameDateDay(day, new Date())

          // Calculate completions for this day
          const scheduled = activeHabits.filter(h => isHabitScheduledOnDate(h, day))
          const completed = scheduled.filter(h =>
            completions.some(c => c.habitId === h.id && c.date === dateStr)
          )
          const isFullyCompleted = scheduled.length > 0 && completed.length === scheduled.length
          const hasSomeCompletion = completed.length > 0 && !isFullyCompleted

          return (
            <button
              key={dateStr}
              onClick={() => onSelectDate(day)}
              className={cn(
                'group flex flex-col items-center py-2 px-1 rounded-xl transition-all duration-150 relative border',
                isSelected
                  ? 'bg-[var(--accent)] text-white border-[var(--accent)] shadow-sm scale-102 font-semibold'
                  : isToday
                  ? 'bg-[var(--accent-subtle)] border-[var(--accent)]/30 text-[var(--accent)] font-semibold'
                  : 'bg-[var(--bg-subtle)] border-transparent hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              )}
            >
              {/* Day Name */}
              <span className={cn(
                'text-[10px] uppercase font-bold tracking-wider mb-1 transition-colors',
                isSelected ? 'text-white/80' : 'text-[var(--text-tertiary)]'
              )}>
                {formatShort(day)}
              </span>

              {/* Day Number */}
              <span className="text-sm font-extrabold tabular-nums mb-1.5">
                {formatDayNum(day)}
              </span>

              {/* Completion Indicator Dot / Icon */}
              <div className="h-4 flex items-center justify-center">
                {isFullyCompleted ? (
                  <div className={cn(
                    'w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px]',
                    isSelected ? 'bg-white text-[var(--accent)]' : 'bg-green-500 text-white'
                  )}>
                    <Check className="w-2.5 h-2.5" strokeWidth={3} />
                  </div>
                ) : hasSomeCompletion ? (
                  <div className={cn(
                    'w-2 h-2 rounded-full',
                    isSelected ? 'bg-white/80' : 'bg-[var(--accent)]'
                  )} />
                ) : scheduled.length > 0 ? (
                  <div className={cn(
                    'w-1.5 h-1.5 rounded-full',
                    isSelected ? 'bg-white/40' : 'bg-[var(--border-strong)]'
                  )} />
                ) : (
                  <div className="w-1.5 h-1.5" />
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
