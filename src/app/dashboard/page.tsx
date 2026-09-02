'use client'

import * as React from 'react'
import {
  Plus,
  Calendar as CalendarIcon,
  Sparkles,
  Clock,
  User2,
  Zap,
  Flame,
  Receipt,
  Headphones,
  Sun,
  Sunset,
  Moon,
  CheckCircle2
} from 'lucide-react'
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
import { WeeklyReceiptModal } from '@/components/dashboard/weekly-receipt-modal'
import { AICoachCard } from '@/components/v3/ai-coach-card'
import { FocusTimerModal } from '@/components/v3/focus-timer-modal'
import { FocusAudioCard } from '@/components/music/focus-audio-card'
import { Button } from '@/components/ui/button'
import { isHabitScheduledOnDate } from '@/lib/habits/schedule'

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date())
  const [filter, setFilter] = React.useState<'all' | 'pending'>('all')
  const [timeFilter, setTimeFilter] = React.useState<'all' | 'morning' | 'afternoon' | 'evening'>('all')
  const [templateOpen, setTemplateOpen] = React.useState(false)
  const [focusTimerOpen, setFocusTimerOpen] = React.useState(false)
  const [setupOpen, setSetupOpen] = React.useState(false)
  const [receiptOpen, setReceiptOpen] = React.useState(false)

  const habits = useHabitStore(s => s.habits)
  const completions = useHabitStore(s => s.completions)
  const getStats = useHabitStore(s => s.getStats)
  const openHabitForm = useUIStore(s => s.openHabitForm)
  const profile = useProfileStore(s => s.profile)
  const hasSetup = useProfileStore(s => s.hasSetup)

  // Dynamic Greeting Logic
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
    return Math.max(0, ...activeHabits.map(h => getStats(h.id).currentStreak))
  }, [activeHabits, getStats])

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 space-y-6">
      {/* 1. Welcome & Greeting Hero */}
      {isToday ? (
        !hasSetup ? (
          <div className="p-4 sm:p-5 rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent-subtle)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[var(--accent)] text-white text-2xl flex items-center justify-center shrink-0 shadow-xs">
                👋
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--text-primary)]">Welcome to Habit Platform!</p>
                <p className="text-xs text-[var(--text-secondary)]">Create your username & avatar to unlock personalized streaks and partner accountability.</p>
              </div>
            </div>
            <Button size="sm" onClick={() => setSetupOpen(true)} className="shrink-0 w-full sm:w-auto rounded-xl font-semibold shadow-xs">
              <Sparkles className="w-3.5 h-3.5" /> Set Up Profile
            </Button>
          </div>
        ) : (
          <div className="p-4 sm:p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-card">
            <div className="flex items-center gap-3.5 min-w-0">
              <button
                onClick={() => setSetupOpen(true)}
                className="w-12 h-12 rounded-2xl bg-[var(--accent-subtle)] border border-[var(--accent)]/20 text-2xl flex items-center justify-center shrink-0 hover:scale-105 transition-transform shadow-2xs"
                title="Edit Profile"
              >
                {profile.avatarEmoji || '😎'}
              </button>
              <div className="min-w-0 space-y-0.5">
                <h1 className="text-base sm:text-lg font-bold text-[var(--text-primary)] tracking-tight truncate">
                  {greeting}{greetingName} 👋
                </h1>
                <p className="text-xs text-[var(--text-tertiary)] truncate">
                  {profile.bio || (completedCount === scheduledHabits.length && scheduledHabits.length > 0
                    ? 'All done for today. Outstanding work! 🔥'
                    : scheduledHabits.length === 0
                    ? 'No habits scheduled today. Enjoy your flow!'
                    : `${scheduledHabits.length - completedCount} habit${scheduledHabits.length - completedCount === 1 ? '' : 's'} remaining today.`)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end flex-wrap">
              {maxStreak > 0 && <StreakBadge streak={maxStreak} />}
              <Button size="sm" variant="secondary" onClick={() => setFocusTimerOpen(true)} className="rounded-xl text-xs h-8">
                <Clock className="w-3.5 h-3.5 text-[var(--accent)]" /> Focus Timer
              </Button>
              <Button size="sm" onClick={() => openHabitForm()} className="rounded-xl text-xs h-8 shadow-xs">
                <Plus className="w-3.5 h-3.5" /> New Habit
              </Button>
            </div>
          </div>
        )
      ) : (
        <div className="flex items-center justify-between p-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-xs">
          <div>
            <h1 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
              {formatFullDate(selectedDate)}
            </h1>
            <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
              Viewing past habit completion history
            </p>
          </div>
          <Button size="sm" variant="secondary" onClick={() => setSelectedDate(new Date())} className="rounded-xl text-xs">
            <CalendarIcon className="w-3.5 h-3.5 text-[var(--accent)]" /> Jump to today
          </Button>
        </div>
      )}

      {/* 2. Week View Selector */}
      <WeekView selectedDate={selectedDate} onSelectDate={setSelectedDate} />

      {/* 3. Today's Progress Ring & Stats */}
      {scheduledHabits.length > 0 && (
        <DailyProgress completed={completedCount} total={scheduledHabits.length} />
      )}

      {/* 4. Focus Sound & Audio Player (Spotify) */}
      <FocusAudioCard />

      {/* 5. AI Consistency Coach Advice */}
      <AICoachCard />

      {/* 6. Habits Section Header & Filters */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Time of Day Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] overflow-x-auto">
            <button
              onClick={() => setTimeFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                timeFilter === 'all'
                  ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-xs'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
              }`}
            >
              All Day
            </button>
            <button
              onClick={() => setTimeFilter('morning')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                timeFilter === 'morning'
                  ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-xs'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
              }`}
            >
              <Sun className="w-3 h-3 text-amber-500" /> Morning
            </button>
            <button
              onClick={() => setTimeFilter('afternoon')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                timeFilter === 'afternoon'
                  ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-xs'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
              }`}
            >
              <Sunset className="w-3 h-3 text-orange-500" /> Afternoon
            </button>
            <button
              onClick={() => setTimeFilter('evening')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                timeFilter === 'evening'
                  ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-xs'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
              }`}
            >
              <Moon className="w-3 h-3 text-indigo-500" /> Evening
            </button>
          </div>

          {/* Quick Actions & Status */}
          <div className="flex items-center gap-1.5 justify-end">
            <button
              onClick={() => setFilter(filter === 'all' ? 'pending' : 'all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                filter === 'pending'
                  ? 'bg-[var(--accent-subtle)] text-[var(--accent)] border-[var(--accent)]/30 font-semibold'
                  : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border)] hover:text-[var(--text-primary)]'
              }`}
            >
              {filter === 'pending' ? 'Showing To-Do' : 'Filter Pending'}
            </button>

            <Button size="sm" variant="ghost" onClick={() => setReceiptOpen(true)} className="text-xs h-7 px-2">
              <Receipt className="w-3.5 h-3.5 text-[var(--accent)]" /> Receipt
            </Button>

            <Button size="sm" variant="ghost" onClick={() => setTemplateOpen(true)} className="text-xs h-7 px-2">
              <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" /> Starter Packs
            </Button>
          </div>
        </div>

        {/* Habits List */}
        <HabitList date={selectedDate} filter={filter} timeFilter={timeFilter} />
      </div>

      {/* 7. Evening Daily Reflection Widget */}
      <ReflectionCard date={dateStr} />

      {/* Modals */}
      <TemplateModal open={templateOpen} onOpenChange={setTemplateOpen} />
      <FocusTimerModal open={focusTimerOpen} onOpenChange={setFocusTimerOpen} />
      <ProfileSetupModal open={setupOpen} onOpenChange={setSetupOpen} />
      <WeeklyReceiptModal open={receiptOpen} onOpenChange={setReceiptOpen} />
    </div>
  )
}
