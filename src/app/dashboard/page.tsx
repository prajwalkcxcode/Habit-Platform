'use client'

import * as React from 'react'
import { Plus, Calendar as CalendarIcon, Sparkles, Clock, User2, Zap, Flame } from 'lucide-react'
import { formatFullDate, toDateString, isSameDateDay } from '@/lib/utils/date'
import { useHabitStore } from '@/lib/store/habits'
import { useUIStore } from '@/lib/store/ui'
import { useProfileStore } from '@/lib/store/profile'
import { HabitList } from '@/components/habits/habit-list'
import { DailyProgress } from '@/components/dashboard/daily-progress'
import { WeekView } from '@/components/dashboard/week-view'
import { StreakBadge } from '@/components/dashboard/streak-badge'
import { ReflectionCard } from '@/components/reflection/reflection-card'
import { TemplateModal } from '@/components/templates/template-modal'
import { ProfileSetupModal } from '@/components/v5/profile-setup-modal'
import { AICoachCard } from '@/components/v3/ai-coach-card'
import { FocusTimerModal } from '@/components/v3/focus-timer-modal'
import { Button } from '@/components/ui/button'
import { isHabitScheduledOnDate } from '@/lib/habits/schedule'

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date())
  const [filter, setFilter] = React.useState<'all' | 'pending'>('all')
  const [templateOpen, setTemplateOpen] = React.useState(false)
  const [focusTimerOpen, setFocusTimerOpen] = React.useState(false)
  const [setupOpen, setSetupOpen] = React.useState(false)

  const habits = useHabitStore(s => s.habits)
  const completions = useHabitStore(s => s.completions)
  const getStats = useHabitStore(s => s.getStats)
  const openHabitForm = useUIStore(s => s.openHabitForm)
  const profile = useProfileStore(s => s.profile)
  const hasSetup = useProfileStore(s => s.hasSetup)

  // Greeting logic
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const greetingName = hasSetup && profile.username ? `, ${profile.username}` : ''

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
      {/* Welcome & Greeting Hero */}
      {isToday && (
        !hasSetup ? (
          <div className="p-4 rounded-xl border border-[var(--accent)]/30 bg-[var(--accent-subtle)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--accent)] text-white text-xl flex items-center justify-center shrink-0 shadow-xs">
                👋
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--text-primary)]">Welcome to Habit Platform!</p>
                <p className="text-xs text-[var(--text-secondary)]">Create your username & avatar to unlock streaks, shareable cards, and partner accountability.</p>
              </div>
            </div>
            <Button size="sm" onClick={() => setSetupOpen(true)} className="shrink-0 w-full sm:w-auto">
              <Sparkles className="w-3.5 h-3.5" /> Create Profile
            </Button>
          </div>
        ) : (
          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-base)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setSetupOpen(true)}
                className="w-11 h-11 rounded-full bg-[var(--accent-subtle)] border border-[var(--accent)]/20 text-2xl flex items-center justify-center shrink-0 hover:scale-105 transition-transform"
                title="Edit Profile"
              >
                {profile.avatarEmoji || '😎'}
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-bold text-[var(--text-primary)] tracking-tight truncate">
                    {greeting}, {profile.username}! 👋
                  </h1>
                </div>
                <p className="text-xs text-[var(--text-tertiary)] truncate">
                  {profile.bio || (completedCount === scheduledHabits.length && scheduledHabits.length > 0
                    ? "All done for today. Outstanding work! 🔥"
                    : scheduledHabits.length === 0
                    ? "No habits scheduled today. Enjoy your day!"
                    : `${scheduledHabits.length - completedCount} habit${scheduledHabits.length - completedCount === 1 ? '' : 's'} remaining today.`)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
              {maxStreak > 0 && <StreakBadge streak={maxStreak} />}
              <Button size="sm" variant="secondary" onClick={() => setFocusTimerOpen(true)}>
                <Clock className="w-3.5 h-3.5 text-[var(--accent)]" /> Focus
              </Button>
              <Button size="sm" onClick={() => openHabitForm()}>
                <Plus className="w-4 h-4" /> New habit
              </Button>
            </div>
          </div>
        )
      )}

      {/* Date Header for non-today or secondary navigation */}
      {!isToday && (
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
              {formatFullDate(selectedDate)}
            </h1>
            <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
              Viewing past habits
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={() => setSelectedDate(new Date())}>
              <CalendarIcon className="w-3.5 h-3.5" /> Jump to today
            </Button>
          </div>
        </div>
      )}

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

        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => setTemplateOpen(true)} className="text-xs h-7">
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" /> Starter Packs
          </Button>
          {!isToday && (
            <button
              onClick={() => setSelectedDate(new Date())}
              className="text-xs text-[var(--accent)] hover:underline flex items-center gap-1"
            >
              <CalendarIcon className="w-3 h-3" /> Today
            </button>
          )}
        </div>
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
      <ProfileSetupModal open={setupOpen} onOpenChange={setSetupOpen} />
    </div>
  )
}
