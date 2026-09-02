'use client'

import * as React from 'react'
import { cn } from '@/lib/utils/cn'
import { CheckCircle2, Sparkles, Trophy } from 'lucide-react'

interface DailyProgressProps {
  completed: number
  total: number
  className?: string
}

export function DailyProgress({ completed, total, className }: DailyProgressProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
  const isAllDone = total > 0 && completed === total

  // Circle circumference for SVG ring
  const radius = 26
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className={cn('p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-card transition-all', className)}>
      <div className="flex items-center justify-between gap-4">
        {/* Left: Progress info */}
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
              Daily Consistency
            </span>
            {isAllDone && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/15 text-green-600 dark:text-green-400">
                <Sparkles className="w-3 h-3" /> All Complete
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tabular-nums tracking-tight">
              {completed}<span className="text-base text-[var(--text-tertiary)] font-normal">/{total}</span>
            </span>
            <span className="text-xs font-semibold text-[var(--text-secondary)]">
              habits done today
            </span>
          </div>

          <p className="text-xs text-[var(--text-tertiary)]">
            {isAllDone
              ? 'Outstanding focus today! Rest well or log your evening thoughts.'
              : completed === 0
              ? 'Start with your easiest habit to build effortless momentum.'
              : `${total - completed} habit${total - completed === 1 ? '' : 's'} remaining. You are ${percentage}% through your daily target.`}
          </p>
        </div>

        {/* Right: Circular Progress Ring */}
        <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 64 64">
            {/* Background ring */}
            <circle
              cx="32"
              cy="32"
              r={radius}
              stroke="var(--bg-elevated)"
              strokeWidth="6"
              fill="transparent"
            />
            {/* Progress ring */}
            <circle
              cx="32"
              cy="32"
              r={radius}
              stroke="var(--accent)"
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-500 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            {isAllDone ? (
              <CheckCircle2 className="w-6 h-6 text-green-500 animate-check-pop" />
            ) : (
              <span className="text-xs font-extrabold text-[var(--text-primary)] tabular-nums">
                {percentage}%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Linear progress bar underneath for extra tactile feel */}
      <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center gap-3">
        <div className="flex-1 h-2 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
          <div
            className="h-full rounded-full bg-[var(--accent)] transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-[11px] font-bold text-[var(--text-secondary)] tabular-nums">
          {completed}/{total}
        </span>
      </div>
    </div>
  )
}
