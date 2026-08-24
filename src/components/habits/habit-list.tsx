'use client'

import * as React from 'react'
import { Plus } from 'lucide-react'
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
  className?: string
}

export function HabitList({ date, filter = 'all', className }: HabitListProps) {
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
    if (filter === 'pending') {
      return scheduledHabits.filter(
        h => !completions.some(c => c.habitId === h.id && c.date === dateStr)
      )
    }
    return scheduledHabits
  }, [scheduledHabits, filter, completions, dateStr])

  if (scheduledHabits.length === 0) {
    return (
      <EmptyState
        title="No habits scheduled"
        description="Create your first habit to start tracking."
        action={
          <Button size="sm" onClick={() => openHabitForm()}>
            <Plus className="w-3.5 h-3.5" /> New habit
          </Button>
        }
        className={className}
      />
    )
  }

  return (
    <div className={cn('divide-y divide-[var(--border)]', className)}>
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
