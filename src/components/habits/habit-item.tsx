'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { MoreHorizontal, Pencil, Archive, Trash2, Play, Pause } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useHabitStore } from '@/lib/store/habits'
import { useUIStore } from '@/lib/store/ui'
import type { Habit } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
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
      showToast(`${habit.icon} ${habit.name} marked complete`, 'success')
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
      className={cn(
        'group flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-[var(--bg-subtle)] cursor-pointer border-b border-[var(--border)] last:border-0',
        isCompleted && 'opacity-60',
        compact && 'py-2'
      )}
      onClick={() => router.push(`/habits/${habit.id}`)}
    >
      {/* Checkbox */}
      <button
        onClick={handleToggle}
        className={cn(
          'w-[18px] h-[18px] rounded-[5px] border-[1.5px] flex-shrink-0 transition-all duration-150 flex items-center justify-center',
          isCompleted
            ? 'border-[var(--accent)] bg-[var(--accent)]'
            : 'border-[var(--border-strong)] hover:border-[var(--accent)] hover:bg-[var(--accent-subtle)]'
        )}
        aria-label={isCompleted ? 'Mark incomplete' : 'Mark complete'}
        aria-pressed={isCompleted}
      >
        {isCompleted && (
          <svg viewBox="0 0 10 8" className="w-2.5 h-2" fill="none">
            <path
              d="M1 4L3.5 6.5L9 1"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      {/* Icon + Name */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="text-base leading-none flex-shrink-0" aria-hidden>{habit.icon}</span>
        <div className="min-w-0">
          <p
            className={cn(
              'text-sm font-medium text-[var(--text-primary)] truncate',
              isCompleted && 'line-through text-[var(--text-tertiary)]'
            )}
          >
            {habit.name}
          </p>
          {habit.description && !compact && (
            <p className="text-xs text-[var(--text-tertiary)] truncate mt-0.5">{habit.description}</p>
          )}
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {showStreak && stats.currentStreak > 0 && (
          <span className="text-xs text-[var(--text-tertiary)] tabular-nums">
            🔥 {stats.currentStreak}
          </span>
        )}
        {habit.status === 'paused' && (
          <Badge variant="secondary" className="text-[10px]">Paused</Badge>
        )}

        {/* Actions menu */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              onClick={e => e.stopPropagation()}
              className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-all"
              aria-label="Habit actions"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="z-50 min-w-[140px] bg-[var(--bg-base)] border border-[var(--border)] rounded-lg shadow-lg p-1 text-sm"
              align="end"
              sideOffset={4}
              onClick={e => e.stopPropagation()}
            >
              <DropdownMenu.Item
                className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] outline-none"
                onSelect={() => openHabitForm(habit.id)}
              >
                <Pencil className="w-3.5 h-3.5" /> Edit
              </DropdownMenu.Item>
              <DropdownMenu.Item
                className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] outline-none"
                onSelect={handleStatusToggle}
              >
                {habit.status === 'paused'
                  ? <><Play className="w-3.5 h-3.5" /> Resume</>
                  : <><Pause className="w-3.5 h-3.5" /> Pause</>}
              </DropdownMenu.Item>
              <DropdownMenu.Item
                className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] outline-none"
                onSelect={() => updateHabit(habit.id, { status: 'archived' })}
              >
                <Archive className="w-3.5 h-3.5" /> Archive
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="h-px bg-[var(--border)] my-1" />
              <DropdownMenu.Item
                className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-red-500 hover:bg-red-500/10 outline-none"
                onSelect={handleDelete}
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </div>
  )
}
