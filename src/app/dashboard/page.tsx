'use client'

import * as React from 'react'
import { Plus, Calendar as CalendarIcon, Sparkles, Clock } from 'lucide-react'
import { formatFullDate, toDateString, isSameDateDay } from '@/lib/utils/date'
import { useHabitStore } from '@/lib/store/habits'
import { useUIStore } from '@/lib/store/ui'
import { HabitList } from '@/components/habits/habit-list'
import { DailyProgress } from '@/components/dashboard/daily-progress'
import { WeekView } from '@/components/dashboard/week-view'
import { StreakBadge } from '@/components/dashboard/streak-badge'
import { ReflectionCard } from '@/components/reflection/reflection-card'
import { TemplateModal } from '@/components/templates/template-modal'
import { AICoachCard } from '@/components/v3/ai-coach-card'
import { FocusTimerModal } from '@/components/v3/focus-timer-modal'
import { Button } from '@/components/ui/button'
import { isHabitScheduledOnDate } from '@/lib/habits/schedule'

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date())
  const [filter, setFilter] = React.useState<'all' | 'pending'>('all')
  const [templateOpen, setTemplateOpen] = React.useState(false)
  const [focusTimerOpen, setFocusTimerOpen] = React.useState(false)

  const habits = useHabitStore(s => s.habits)
  const completions = useHabitStore(s => s.completions)
  const getStats = useHabitStore(s => s.getStats)
  const openHabitForm = useUIStore(s => s.openHabitForm)

  const dateStr = toDateString(selectedDate)
  const isToday = isSameDateDay(selectedDate, new Date())

  const activeHabits = habits.filter(h => h.status === 'active')
  const scheduledHabits = activeHabits.filter(h => isHabitScheduledOnDate(h, selectedDate))

  const completedCount = scheduledHabits.filter(h =>
    completions.some(c => c.habitId === h.id && c.date === dateStr)
  ).length

  const maxStreak = React.useMemo(() => {
    if (activeHabits.length === 0) return 0
    return Math.max(...activeHabits.map(h => getStats(h.id).currentStreak))
  }, [activeHabits, getStats])

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
            {isToday ? "Today" : formatFullDate(selectedDate)}
          </h1>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
            {formatFullDate(selectedDate)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {maxStreak > 0 && <StreakBadge streak={maxStreak} />}
          <Button size="sm" variant="secondary" onClick={() => setFocusTimerOpen(true)}>
            <Clock className="w-3.5 h-3.5 text-[var(--accent)]" /> Focus Timer
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setTemplateOpen(true)}>
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" /> Starter Packs
          </Button>
          <Button size="sm" onClick={() => openHabitForm()}>
            <Plus className="w-4 h-4" /> New habit
          </Button>
        </div>
      </div>

      {/* Week Selector */}
      <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--bg-base)]">
        <WeekView selectedDate={selectedDate} onSelectDate={setSelectedDate} />
      </div>

      {/* Daily Progress */}
      {scheduledHabits.length > 0 && (
        <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-base)]">
          <DailyProgress completed={completedCount} total={scheduledHabits.length} />
        </div>
      )}

      {/* AI Consistency Coach Widget */}
      <AICoachCard />

      {/* Filter / Actions Bar */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              filter === 'all'
                ? 'bg-[var(--accent-subtle)] text-[var(--accent)]'
                : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
            }`}
          >
            All ({scheduledHabits.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              filter === 'pending'
                ? 'bg-[var(--accent-subtle)] text-[var(--accent)]'
                : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
            }`}
          >
            To do ({scheduledHabits.length - completedCount})
          </button>
        </div>

        {!isToday && (
          <button
            onClick={() => setSelectedDate(new Date())}
            className="text-xs text-[var(--accent)] hover:underline flex items-center gap-1"
          >
            <CalendarIcon className="w-3 h-3" /> Jump to today
          </button>
        )}
      </div>

      {/* Habits List */}
      <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-base)] overflow-hidden">
        <HabitList date={selectedDate} filter={filter} />
      </div>

      {/* Reflection Widget */}
      <ReflectionCard date={dateStr} />

      {/* Modals */}
      <TemplateModal open={templateOpen} onOpenChange={setTemplateOpen} />
      <FocusTimerModal open={focusTimerOpen} onOpenChange={setFocusTimerOpen} />
    </div>
  )
}
