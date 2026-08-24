'use client'

import * as React from 'react'
import { Flame } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface StreakBadgeProps {
  streak: number
  bestStreak?: number
  className?: string
}

export function StreakBadge({ streak, bestStreak, className }: StreakBadgeProps) {
  if (streak === 0) return null

  return (
    <div className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-semibold tabular-nums', className)}>
      <Flame className="w-3.5 h-3.5 fill-current" />
      <span>{streak} day streak</span>
      {bestStreak && bestStreak > streak && (
        <span className="text-[10px] opacity-75 font-normal ml-0.5">(best: {bestStreak})</span>
      )}
    </div>
  )
}
