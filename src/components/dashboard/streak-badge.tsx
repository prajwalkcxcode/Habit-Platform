'use client'

import * as React from 'react'
import { Flame } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface StreakBadgeProps {
  streak: number
  className?: string
}

export function StreakBadge({ streak, className }: StreakBadgeProps) {
  if (streak <= 0) return null

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tabular-nums',
        'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 shadow-xs',
        className
      )}
      title={`${streak} day streak`}
    >
      <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500 animate-pulse-subtle" />
      <span>{streak} {streak === 1 ? 'day' : 'days'}</span>
    </div>
  )
}
