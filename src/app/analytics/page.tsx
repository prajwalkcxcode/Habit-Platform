'use client'

import * as React from 'react'
import { useHabitStore } from '@/lib/store/habits'
import { getCompletionHeatmap } from '@/lib/habits/stats'
import { EmptyState } from '@/components/ui/empty-state'
import { BarChart2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function AnalyticsPage() {
  const habits = useHabitStore(s => s.habits)
  const completions = useHabitStore(s => s.completions)
  const getStats = useHabitStore(s => s.getStats)

  const activeHabits = habits.filter(h => h.status === 'active')
  const heatmapData = React.useMemo(
    () => getCompletionHeatmap(habits, completions, 20),
    [habits, completions]
  )

  const habitStatsList = React.useMemo(() => {
    return activeHabits.map(h => ({
      habit: h,
      stats: getStats(h.id),
    })).sort((a, b) => b.stats.completionRate - a.stats.completionRate)
  }, [activeHabits, getStats])

  if (activeHabits.length === 0) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-xl font-bold text-[var(--text-primary)] mb-6">Analytics</h1>
        <EmptyState
          icon={<BarChart2 className="w-8 h-8" />}
          title="No analytics yet"
          description="Create and track habits to see your consistency analytics here."
        />
      </div>
    )
  }

  // Calculate overall metrics
  const totalCompletions = completions.length
  const avgCompletionRate = habitStatsList.length > 0
    ? Math.round((habitStatsList.reduce((acc, curr) => acc + curr.stats.completionRate, 0) / habitStatsList.length) * 100)
    : 0

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:px-8 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Analytics</h1>
        <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
          Calculated performance metrics based on your actual history.
        </p>
      </div>

      {/* Top summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-base)]">
          <p className="text-xs text-[var(--text-tertiary)] font-medium uppercase tracking-wider">Total Check-ins</p>
          <p className="text-2xl font-bold text-[var(--text-primary)] mt-1 tabular-nums">{totalCompletions}</p>
        </div>
        <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-base)]">
          <p className="text-xs text-[var(--text-tertiary)] font-medium uppercase tracking-wider">Avg Consistency</p>
          <p className="text-2xl font-bold text-[var(--text-primary)] mt-1 tabular-nums">{avgCompletionRate}%</p>
        </div>
        <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-base)] col-span-2 sm:col-span-1">
          <p className="text-xs text-[var(--text-tertiary)] font-medium uppercase tracking-wider">Active Habits</p>
          <p className="text-2xl font-bold text-[var(--text-primary)] mt-1 tabular-nums">{activeHabits.length}</p>
        </div>
      </div>

      {/* Overall Heatmap */}
      <div className="p-5 rounded-lg border border-[var(--border)] bg-[var(--bg-base)] space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Consistency Heatmap (Last 20 Weeks)</h2>
          <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-tertiary)]">
            <span>Less</span>
            <span className="w-2.5 h-2.5 rounded-sm bg-[var(--bg-elevated)]" />
            <span className="w-2.5 h-2.5 rounded-sm bg-[var(--accent)] opacity-40" />
            <span className="w-2.5 h-2.5 rounded-sm bg-[var(--accent)] opacity-70" />
            <span className="w-2.5 h-2.5 rounded-sm bg-[var(--accent)]" />
            <span>More</span>
          </div>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="inline-grid grid-rows-7 grid-flow-col gap-1 min-w-max">
            {heatmapData.map(day => {
              const rate = day.rate
              return (
                <div
                  key={day.date}
                  title={`${day.date}: ${day.completed}/${day.scheduled} completed`}
                  className={cn(
                    'w-3 h-3 rounded-sm transition-colors',
                    day.scheduled === 0
                      ? 'bg-[var(--bg-subtle)]'
                      : rate === 0
                        ? 'bg-[var(--bg-elevated)]'
                        : rate < 0.5
                          ? 'bg-[var(--accent)] opacity-40'
                          : rate < 1
                            ? 'bg-[var(--accent)] opacity-75'
                            : 'bg-[var(--accent)]'
                  )}
                />
              )
            })}
          </div>
        </div>
      </div>

      {/* Habit Leaderboard */}
      <div className="p-5 rounded-lg border border-[var(--border)] bg-[var(--bg-base)] space-y-4">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">Habit Consistency Breakdown</h2>
        <div className="space-y-3">
          {habitStatsList.map(({ habit, stats }) => (
            <div key={habit.id} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-[var(--text-primary)] flex items-center gap-1.5">
                  <span>{habit.icon}</span> {habit.name}
                </span>
                <span className="text-[var(--text-tertiary)] tabular-nums">
                  {stats.currentStreak > 0 && <span className="mr-2">?? {stats.currentStreak}d</span>}
                  {Math.round(stats.completionRate * 100)}%
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[var(--accent)] transition-all duration-300"
                  style={{ width: `${Math.round(stats.completionRate * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
