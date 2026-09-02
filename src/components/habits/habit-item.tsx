'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { MoreHorizontal, Pencil, Archive, Trash2, Play, Pause, Flame, Link2, Check } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useHabitStore } from '@/lib/store/habits'
import { useUIStore } from '@/lib/store/ui'
import type { Habit } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { sound, triggerHaptic } from '@/lib/audio/haptics'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

interface HabitItemProps {
  habit: Habit
  showDate?: string // YYYY-MM-DD, defaults to today
  showStreak?: boolean
  compact?: boolean
}

export function HabitItem({ habit, showDate, showStreak = true, compact = false }: HabitItemProps) {
  const toggleCompletion = useHabitStore(s => s.toggleCompletion)
  const updateHabit = useHabitStore(s => s.updateHabit)
  const deleteHabit = useHabitStore(s => s.deleteHabit)
  const getStats = useHabitStore(s => s.getStats)
  const isCompletedToday = useHabitStore(s => s.isCompletedToday)
  const openHabitForm = useUIStore(s => s.openHabitForm)
  const showToast = useUIStore(s => s.showToast)
  const router = useRouter()

  const completions = useHabitStore(s => s.completions)
  const isCompleted = showDate
    ? completions.some(c => c.habitId === habit.id && c.date === showDate)
    : isCompletedToday(habit.id)

  const stats = getStats(habit.id)

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await toggleCompletion(habit.id, showDate)
    if (!isCompleted) {
      sound.playCompletion()
      triggerHaptic('light')
      showToast(`${habit.icon} ${habit.name} completed! ✨`, 'success')
    }
  }

  const handleDelete = async () => {
    await deleteHabit(habit.id)
    showToast(`${habit.name} deleted`, 'info')
  }

  const handleStatusToggle = async () => {
    const newStatus = habit.status === 'paused' ? 'active' : 'paused'
    await updateHabit(habit.id, { status: newStatus })
    showToast(`${habit.name} ${newStatus}`, 'info')
  }

  return (
    <div
      onClick={() => router.push(`/habits/${habit.id}`)}
      className={cn(
        'group relative flex items-center justify-between gap-3.5 p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 cursor-pointer',
        isCompleted
          ? 'bg-[var(--bg-subtle)]/70 border-[var(--border)] opacity-85'
          : 'bg-[var(--bg-card)] border-[var(--border)] hover:border-[var(--border-strong)] hover:shadow-card shadow-subtle',
        compact && 'p-2.5 sm:p-3'
      )}
    >
      {/* Left side: Checkbox + Icon + Details */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        {/* Checkbox */}
        <button
          type="button"
          onClick={handleToggle}
          className={cn(
            'w-6 h-6 rounded-xl border-2 flex items-center justify-center shrink-0 transition-all duration-200',
            isCompleted
              ? 'bg-[var(--accent)] border-[var(--accent)] text-white shadow-xs scale-95'
              : 'border-[var(--border-strong)] hover:border-[var(--accent)] bg-[var(--bg-card)] hover:bg-[var(--accent-subtle)]'
          )}
          aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {isCompleted && (
            <Check className="w-3.5 h-3.5 stroke-[3] text-white animate-check-pop" />
          )}
        </button>

        {/* Icon */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 border border-[var(--border)] shadow-2xs transition-transform group-hover:scale-105"
          style={{ backgroundColor: `${habit.accentColor}12` }}
        >
          <span aria-hidden>{habit.icon}</span>
        </div>

        {/* Text & Metadata */}
        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h3
              className={cn(
                'text-sm font-semibold text-[var(--text-primary)] truncate transition-all',
                isCompleted && 'line-through text-[var(--text-tertiary)]'
              )}
            >
              {habit.name}
            </h3>

            {/* Identity Tag (Atomic Habits) */}
            {habit.identityTag && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent)]/20 shadow-2xs">
                {habit.identityTag}
              </span>
            )}

            {/* Habit Stacking Trigger */}
            {habit.stackTriggerText && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border)]">
                <Link2 className="w-2.5 h-2.5 text-[var(--text-tertiary)]" />
                <span>{habit.stackTriggerText}</span>
              </span>
            )}
          </div>

          {habit.description && !compact && (
            <p className="text-xs text-[var(--text-tertiary)] truncate">
              {habit.description}
            </p>
          )}
        </div>
      </div>

      {/* Right side: Streak & Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {showStreak && stats.currentStreak > 0 && (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 tabular-nums">
            <Flame className="w-3 h-3 fill-orange-500 text-orange-500" />
            <span>{stats.currentStreak}</span>
          </div>
        )}

        {habit.status === 'paused' && (
          <Badge variant="secondary" className="text-[10px] px-2 py-0.5">Paused</Badge>
        )}

        {/* Dropdown Menu */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              onClick={e => e.stopPropagation()}
              className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors opacity-80 group-hover:opacity-100"
              aria-label="Habit menu"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="z-50 min-w-[150px] bg-[var(--bg-card)] border border-[var(--border)] rounded-xl shadow-elevated p-1 text-xs"
              align="end"
              sideOffset={5}
              onClick={e => e.stopPropagation()}
            >
              <DropdownMenu.Item
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] outline-none font-medium"
                onSelect={() => openHabitForm(habit.id)}
              >
                <Pencil className="w-3.5 h-3.5" /> Edit Habit
              </DropdownMenu.Item>
              <DropdownMenu.Item
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] outline-none font-medium"
                onSelect={handleStatusToggle}
              >
                {habit.status === 'paused'
                  ? <><Play className="w-3.5 h-3.5" /> Resume Habit</>
                  : <><Pause className="w-3.5 h-3.5" /> Pause Habit</>}
              </DropdownMenu.Item>
              <DropdownMenu.Item
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] outline-none font-medium"
                onSelect={() => updateHabit(habit.id, { status: 'archived' })}
              >
                <Archive className="w-3.5 h-3.5" /> Archive Habit
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="h-px bg-[var(--border)] my-1" />
              <DropdownMenu.Item
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer text-red-600 hover:bg-red-500/10 outline-none font-medium"
                onSelect={handleDelete}
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Habit
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </div>
  )
}
