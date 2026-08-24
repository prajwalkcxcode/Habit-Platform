import * as React from 'react'
import { cn } from '@/lib/utils/cn'

interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number // 0-100
  max?: number
  showLabel?: boolean
  size?: 'sm' | 'default'
}

export function ProgressBar({
  value,
  max = 100,
  showLabel = false,
  size = 'default',
  className,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div
        className={cn(
          'flex-1 rounded-full bg-[var(--bg-elevated)] overflow-hidden',
          size === 'sm' ? 'h-1' : 'h-1.5'
        )}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-[var(--accent)] transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs tabular-nums text-[var(--text-tertiary)] w-8 text-right">
          {Math.round(pct)}%
        </span>
      )}
    </div>
  )
}
