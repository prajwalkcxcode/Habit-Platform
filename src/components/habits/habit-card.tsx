'use client'

import * as React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { useHabitStore } from '@/lib/store/habits'
import { useUIStore } from '@/lib/store/ui'
import type { Habit } from '@/lib/types'
import { ProgressBar } from '@/components/ui/progress-bar'
import { DEFAULT_CATEGORIES } from '@/lib/types'

interface HabitCardProps {
  habit: Habit
}

export function HabitCard({ habit }: HabitCardProps) {
  const getStats = useHabitStore(s => s.getStats)
  const isCompletedToday = useHabitStore(s => s.isCompletedToday)
  const toggleCompletion = useHabitStore(s => s.toggleCompletion)
  const showToast = useUIStore(s => s.showToast)

  const stats = getStats(habit.id)
  const completedToday = isCompletedToday(habit.id)
  const category = DEFAULT_CATEGORIES.find(c => c.id === habit.categoryId)

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    await toggleCompletion(habit.id)
    if (!completedToday) showToast(`${habit.icon} ${habit.name} marked complete`, 'success')
  }

  return (
    <Link
      href={`/habits/${habit.id}`}
      className={cn(
        'block p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-base)] hover:border-[var(--border-strong)] transition-colors group',
        habit.status === 'paused' && 'opacity-60'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden>{habit.icon}</span>
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] leading-tight">{habit.name}</h3>
            {category && (
              <span className="text-[10px] text-[var(--text-tertiary)]">{category.name}</span>
            )}
          </div>
        </div>
        <button
          onClick={handleToggle}
          className={cn(
            'w-6 h-6 rounded-full border-[1.5px] flex items-center justify-center transition-all flex-shrink-0',
            completedToday
              ? 'bg-[var(--accent)] border-[var(--accent)]'
              : 'border-[var(--border-strong)] hover:border-[var(--accent)]'
          )}
          aria-label={completedToday ? 'Mark incomplete' : 'Mark complete'}
        >
          {completedToday && (
            <svg viewBox="0 0 10 8" className="w-2.5 h-2" fill="none">
              <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      </div>

      <ProgressBar value={stats.completionRate * 100} size="sm" className="mb-2" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-[var(--text-tertiary)]">
          {stats.currentStreak > 0 && (
            <span className="text-xs flex items-center gap-0.5">
              <span>🔥</span>
              <span className="tabular-nums font-medium text-[var(--text-secondary)]">{stats.currentStreak}</span>
            </span>
          )}
        </div>
        <span className="text-[10px] text-[var(--text-tertiary)] tabular-nums">
          {Math.round(stats.completionRate * 100)}%
        </span>
      </div>
    </Link>
  )
}
