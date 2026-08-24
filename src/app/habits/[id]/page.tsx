'use client'

import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Pencil, Flame, CheckCircle, Calendar as CalendarIcon, Play, Pause, Archive } from 'lucide-react'
import { useHabitStore } from '@/lib/store/habits'
import { useUIStore } from '@/lib/store/ui'
import { HabitCalendar } from '@/components/habits/habit-calendar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProgressBar } from '@/components/ui/progress-bar'
import { DEFAULT_CATEGORIES } from '@/lib/types'

export default function HabitDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const habits = useHabitStore(s => s.habits)
  const completions = useHabitStore(s => s.completions)
  const getStats = useHabitStore(s => s.getStats)
  const updateHabit = useHabitStore(s => s.updateHabit)
  const openHabitForm = useUIStore(s => s.openHabitForm)

  const habit = habits.find(h => h.id === id)
  const stats = habit ? getStats(habit.id) : null
  const category = habit ? DEFAULT_CATEGORIES.find(c => c.id === habit.categoryId) : null

  if (!habit || !stats) {
    return (
      <div className="p-8 text-center text-[var(--text-tertiary)]">
        Habit not found.
        <div className="mt-4">
          <Button size="sm" variant="secondary" onClick={() => router.push('/habits')}>
            Back to habits
          </Button>
        </div>
      </div>
    )
  }

  const habitCompletions = completions.filter(c => c.habitId === habit.id)

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 space-y-6">
      {/* Back link */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1 text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back
      </button>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl flex-shrink-0" aria-hidden>{habit.icon}</span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
                {habit.name}
              </h1>
              {habit.status === 'paused' && <Badge variant="secondary">Paused</Badge>}
              {habit.status === 'archived' && <Badge variant="secondary">Archived</Badge>}
            </div>
            {habit.description && (
              <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{habit.description}</p>
            )}
            <div className="flex items-center gap-2 mt-1.5 text-xs text-[var(--text-tertiary)]">
              {category && <span>{category.name}</span>}
              <span>�</span>
              <span className="capitalize">{habit.frequency.type.replace('_', ' ')}</span>
              <span>�</span>
              <span className="capitalize">{habit.preferredTime}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={() => openHabitForm(habit.id)}>
            <Pencil className="w-3.5 h-3.5" /> Edit
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-lg border border-[var(--border)] bg-[var(--bg-base)]">
          <div className="flex items-center gap-1 text-[var(--text-tertiary)] mb-1">
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            <span className="text-[10px] font-medium uppercase tracking-wider">Current Streak</span>
          </div>
          <p className="text-lg font-bold text-[var(--text-primary)] tabular-nums">{stats.currentStreak} days</p>
        </div>

        <div className="p-3.5 rounded-lg border border-[var(--border)] bg-[var(--bg-base)]">
          <div className="flex items-center gap-1 text-[var(--text-tertiary)] mb-1">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[10px] font-medium uppercase tracking-wider">Best Streak</span>
          </div>
          <p className="text-lg font-bold text-[var(--text-primary)] tabular-nums">{stats.bestStreak} days</p>
        </div>

        <div className="p-3.5 rounded-lg border border-[var(--border)] bg-[var(--bg-base)]">
          <div className="flex items-center gap-1 text-[var(--text-tertiary)] mb-1">
            <CheckCircle className="w-3.5 h-3.5 text-green-500" />
            <span className="text-[10px] font-medium uppercase tracking-wider">Completions</span>
          </div>
          <p className="text-lg font-bold text-[var(--text-primary)] tabular-nums">{stats.totalCompletions}</p>
        </div>

        <div className="p-3.5 rounded-lg border border-[var(--border)] bg-[var(--bg-base)]">
          <div className="flex items-center gap-1 text-[var(--text-tertiary)] mb-1">
            <CalendarIcon className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-[10px] font-medium uppercase tracking-wider">Success Rate</span>
          </div>
          <p className="text-lg font-bold text-[var(--text-primary)] tabular-nums">{Math.round(stats.completionRate * 100)}%</p>
        </div>
      </div>

      {/* Overview insights */}
      <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-base)] space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Overview</h2>
        <p className="text-sm text-[var(--text-secondary)]">
          You completed this habit <span className="font-semibold text-[var(--text-primary)]">{stats.totalCompletions}</span> times since creation.
          Your current success rate is <span className="font-semibold text-[var(--text-primary)]">{Math.round(stats.completionRate * 100)}%</span>.
        </p>
        <ProgressBar value={stats.completionRate * 100} size="default" className="pt-1" />
      </div>

      {/* Heatmap / Calendar */}
      <div className="p-5 rounded-lg border border-[var(--border)] bg-[var(--bg-base)] space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">History Grid</h2>
        <HabitCalendar habit={habit} completions={habitCompletions} months={4} />
      </div>
    </div>
  )
}
