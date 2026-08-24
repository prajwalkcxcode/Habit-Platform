'use client'

import * as React from 'react'
import { cn } from '@/lib/utils/cn'

interface DailyProgressProps {
  completed: number
  total: number
  className?: string
}

export function DailyProgress({ completed, total, className }: DailyProgressProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-[var(--text-secondary)]">Today's Progress</span>
        <span className="tabular-nums font-semibold text-[var(--text-primary)]">
          {completed}/{total} <span className="font-normal text-[var(--text-tertiary)]">({percentage}%)</span>
        </span>
      </div>
      <div className="h-2 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
        <div
          className="h-full rounded-full bg-[var(--accent)] transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
