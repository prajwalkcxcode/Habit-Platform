'use client'

import * as React from 'react'
import { useHabitStore } from '@/lib/store/habits'
import { getCompletionHeatmap } from '@/lib/habits/stats'
import { EmptyState } from '@/components/ui/empty-state'
import { BarChart2, Flame, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

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
        <div className="p-8 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-xs">
          <EmptyState
            icon={<BarChart2 className="w-8 h-8" />}
            title="No analytics yet"
            description="Create and track habits to see your consistency heatmaps and streak analytics here."
          />
        </div>
      </div>
    )
  }

  // Calculate overall metrics
  const totalCompletions = completions.length
  const avgCompletionRate = habitStatsList.length > 0
    ? Math.round((habitStatsList.reduce((acc, curr) => acc + curr.stats.completionRate, 0) / habitStatsList.length) * 100)
    : 0

  const bestStreak = Math.max(0, ...habitStatsList.map(h => h.stats.bestStreak))

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:px-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Analytics & Trends</h1>
        <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
          Calculated performance metrics based on your actual history.
        </p>
      </div>

      {/* Top summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-card space-y-1">
          <p className="text-[10px] text-[var(--text-tertiary)] font-bold uppercase tracking-wider">Total Check-ins</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tabular-nums">{totalCompletions}</p>
        </div>
        <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-card space-y-1">
          <p className="text-[10px] text-[var(--text-tertiary)] font-bold uppercase tracking-wider">Avg Consistency</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tabular-nums">{avgCompletionRate}%</p>
        </div>
        <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-card space-y-1">
          <p className="text-[10px] text-[var(--text-tertiary)] font-bold uppercase tracking-wider">Best Streak</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-orange-500 tabular-nums">{bestStreak}d</p>
        </div>
        <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-card space-y-1">
          <p className="text-[10px] text-[var(--text-tertiary)] font-bold uppercase tracking-wider">Active Habits</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tabular-nums">{activeHabits.length}</p>
        </div>
      </div>

      {/* Overall Heatmap */}
      <div className="p-5 sm:p-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[var(--text-primary)]">Consistency Heatmap</h2>
            <p className="text-xs text-[var(--text-tertiary)]">20-week daily check-in intensity</p>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-tertiary)]">
            <span>Less</span>
            <span className="w-2.5 h-2.5 rounded-xs bg-[var(--bg-elevated)]" />
            <span className="w-2.5 h-2.5 rounded-xs bg-[var(--accent)] opacity-40" />
            <span className="w-2.5 h-2.5 rounded-xs bg-[var(--accent)] opacity-70" />
            <span className="w-2.5 h-2.5 rounded-xs bg-[var(--accent)]" />
            <span>More</span>
          </div>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="inline-grid grid-rows-7 grid-flow-col gap-1 min-w-max p-1">
            {heatmapData.map(day => {
              const rate = day.rate
              return (
                <div
                  key={day.date}
                  title={`${day.date}: ${day.completed}/${day.scheduled} completed`}
                  className={cn(
                    'w-3.5 h-3.5 rounded-xs transition-colors',
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
      <div className="p-5 sm:p-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-card space-y-4">
        <h2 className="text-sm font-bold text-[var(--text-primary)]">Habit Consistency Breakdown</h2>
        <div className="space-y-3.5">
          {habitStatsList.map(({ habit, stats }) => (
            <div key={habit.id} className="space-y-1.5 p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)]">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
                  <span className="text-base">{habit.icon}</span> {habit.name}
                </span>
                <span className="text-[var(--text-secondary)] font-bold tabular-nums flex items-center gap-2">
                  {stats.currentStreak > 0 && (
                    <span className="text-orange-500 flex items-center gap-0.5">
                      <Flame className="w-3 h-3 fill-orange-500" /> {stats.currentStreak}d
                    </span>
                  )}
                  <span>{Math.round(stats.completionRate * 100)}%</span>
                </span>
              </div>
              <div className="h-2 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
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
