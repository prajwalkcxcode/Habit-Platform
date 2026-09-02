'use client'

import * as React from 'react'
import { Plus, Sparkles, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useHabitStore } from '@/lib/store/habits'
import { useUIStore } from '@/lib/store/ui'
import { HabitItem } from './habit-item'
import { EmptyState } from '@/components/ui/empty-state'
import { Button } from '@/components/ui/button'
import { isHabitScheduledOnDate } from '@/lib/habits/schedule'
import { toDateString } from '@/lib/utils/date'
import type { Habit } from '@/lib/types'

interface HabitListProps {
  date?: Date
  filter?: 'all' | 'active' | 'pending'
  timeFilter?: 'all' | 'morning' | 'afternoon' | 'evening'
  className?: string
}

export function HabitList({ date, filter = 'all', timeFilter = 'all', className }: HabitListProps) {
  const habits = useHabitStore(s => s.habits)
  const completions = useHabitStore(s => s.completions)
  const openHabitForm = useUIStore(s => s.openHabitForm)
  const targetDate = date ?? new Date()
  const dateStr = toDateString(targetDate)

  const scheduledHabits = React.useMemo(() => {
    return habits
      .filter(h => h.status === 'active')
      .filter(h => isHabitScheduledOnDate(h, targetDate))
  }, [habits, targetDate])

  const filteredHabits = React.useMemo(() => {
    let result = scheduledHabits

    if (timeFilter !== 'all') {
      result = result.filter(h => h.preferredTime === timeFilter || h.preferredTime === 'anytime')
    }

    if (filter === 'pending') {
      result = result.filter(
        h => !completions.some(c => c.habitId === h.id && c.date === dateStr)
      )
    }

    return result
  }, [scheduledHabits, filter, timeFilter, completions, dateStr])

  if (scheduledHabits.length === 0) {
    return (
      <div className="p-8 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-xs">
        <EmptyState
          title="No habits scheduled today"
          description="Create your first habit or apply a starter pack to build your daily consistency."
          action={
            <Button size="sm" onClick={() => openHabitForm()} className="rounded-xl font-semibold shadow-xs">
              <Plus className="w-3.5 h-3.5" /> Create Your First Habit
            </Button>
          }
          className={className}
        />
      </div>
    )
  }

  if (filteredHabits.length === 0 && filter === 'pending') {
    return (
      <div className="p-8 rounded-2xl border border-green-500/20 bg-green-500/5 text-center space-y-2">
        <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto animate-check-pop" />
        <p className="text-sm font-bold text-[var(--text-primary)]">All habits finished for today! 🎉</p>
        <p className="text-xs text-[var(--text-tertiary)]">Outstanding focus. Check out your weekly consistency receipt or relax.</p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-2.5 sm:space-y-3', className)}>
      {filteredHabits.map(habit => (
        <HabitItem
          key={habit.id}
          habit={habit}
          showDate={dateStr}
        />
      ))}
    </div>
  )
}
