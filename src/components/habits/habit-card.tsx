'use client'

import * as React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { useHabitStore } from '@/lib/store/habits'
import { useUIStore } from '@/lib/store/ui'
import type { Habit } from '@/lib/types'
import { ProgressBar } from '@/components/ui/progress-bar'
import { DEFAULT_CATEGORIES } from '@/lib/types'
import { Flame, Check, Link2 } from 'lucide-react'
import { sound, triggerHaptic } from '@/lib/audio/haptics'

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
    if (!completedToday) {
      sound.playCompletion()
      triggerHaptic('light')
      showToast(`${habit.icon} ${habit.name} completed! ✨`, 'success')
    }
  }

  return (
    <Link
      href={`/habits/${habit.id}`}
      className={cn(
        'block p-4 sm:p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--border-strong)] hover:shadow-card shadow-subtle transition-all duration-200 group',
        habit.status === 'paused' && 'opacity-60'
      )}
    >
      <div className="flex items-start justify-between mb-3.5 gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 border border-[var(--border)] shadow-2xs group-hover:scale-105 transition-transform"
            style={{ backgroundColor: `${habit.accentColor}15` }}
          >
            <span aria-hidden>{habit.icon}</span>
          </div>
          <div className="min-w-0 space-y-0.5">
            <h3 className="text-sm font-bold text-[var(--text-primary)] truncate leading-tight group-hover:text-[var(--accent)] transition-colors">
              {habit.name}
            </h3>
            {category && (
              <span className="text-[10px] font-medium text-[var(--text-tertiary)] block">
                {category.name}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={handleToggle}
          className={cn(
            'w-6 h-6 rounded-xl border-2 flex items-center justify-center shrink-0 transition-all duration-200',
            completedToday
              ? 'bg-[var(--accent)] border-[var(--accent)] text-white shadow-xs scale-95'
              : 'border-[var(--border-strong)] hover:border-[var(--accent)] bg-[var(--bg-card)] hover:bg-[var(--accent-subtle)]'
          )}
          aria-label={completedToday ? 'Mark incomplete' : 'Mark complete'}
        >
          {completedToday && (
            <Check className="w-3.5 h-3.5 stroke-[3] text-white animate-check-pop" />
          )}
        </button>
      </div>

      {/* Identity Tag & Habit Stack if present */}
      {(habit.identityTag || habit.stackTriggerText) && (
        <div className="flex items-center gap-1.5 flex-wrap mb-3">
          {habit.identityTag && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent)]/20 shadow-2xs">
              {habit.identityTag}
            </span>
          )}
          {habit.stackTriggerText && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border)]">
              <Link2 className="w-2.5 h-2.5 text-[var(--text-tertiary)]" />
              <span>{habit.stackTriggerText}</span>
            </span>
          )}
        </div>
      )}

      <ProgressBar value={stats.completionRate * 100} size="sm" className="mb-2.5" />

      <div className="flex items-center justify-between text-xs pt-1 border-t border-[var(--border)]">
        <div className="flex items-center gap-1.5 text-[var(--text-tertiary)]">
          {stats.currentStreak > 0 && (
            <span className="flex items-center gap-1 text-orange-500 font-bold tabular-nums">
              <Flame className="w-3.5 h-3.5 fill-orange-500" />
              <span>{stats.currentStreak}d</span>
            </span>
          )}
        </div>
        <span className="text-[11px] font-bold text-[var(--text-secondary)] tabular-nums">
          {Math.round(stats.completionRate * 100)}% consistency
        </span>
      </div>
    </Link>
  )
}
