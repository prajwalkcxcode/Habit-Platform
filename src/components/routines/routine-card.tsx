'use client'

import * as React from 'react'
import Link from 'next/link'
import { Play, Clock, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import type { Routine } from '@/lib/types/v2'
import { useHabitStore } from '@/lib/store/habits'
import { useRoutinesStore } from '@/lib/store/routines'
import { useUIStore } from '@/lib/store/ui'
import { Button } from '@/components/ui/button'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

interface RoutineCardProps {
  routine: Routine
  onEdit?: (routine: Routine) => void
}

export function RoutineCard({ routine, onEdit }: RoutineCardProps) {
  const habits = useHabitStore(s => s.habits)
  const deleteRoutine = useRoutinesStore(s => s.deleteRoutine)
  const startFlow = useRoutinesStore(s => s.startFlow)
  const showToast = useUIStore(s => s.showToast)

  const routineHabits = React.useMemo(() => {
    return routine.items
      .sort((a, b) => a.order - b.order)
      .map(item => habits.find(h => h.id === item.habitId))
      .filter(Boolean)
  }, [routine.items, habits])

  const totalEstMinutes = routine.items.reduce((sum, item) => sum + (item.estimatedMinutes || 5), 0)

  return (
    <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-base)] space-y-4 flex flex-col justify-between group">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl" aria-hidden>{routine.icon}</span>
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] leading-tight">{routine.name}</h3>
              <p className="text-[10px] text-[var(--text-tertiary)] flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3" /> ~{totalEstMinutes} mins • {routine.items.length} habits
              </p>
            </div>
          </div>

          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="opacity-0 group-hover:opacity-100 p-1 rounded text-[var(--text-tertiary)] hover:bg-[var(--bg-elevated)] transition-opacity">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content className="z-50 min-w-[120px] bg-[var(--bg-base)] border border-[var(--border)] rounded-lg shadow-lg p-1 text-xs" align="end">
                {onEdit && (
                  <DropdownMenu.Item className="flex items-center gap-2 p-1.5 rounded cursor-pointer hover:bg-[var(--bg-elevated)]" onSelect={() => onEdit(routine)}>
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </DropdownMenu.Item>
                )}
                <DropdownMenu.Item className="flex items-center gap-2 p-1.5 rounded cursor-pointer text-red-500 hover:bg-red-500/10" onSelect={async () => {
                  await deleteRoutine(routine.id)
                  showToast(`Routine "${routine.name}" deleted`, 'info')
                }}>
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>

        {/* Description */}
        {routine.description && (
          <p className="text-xs text-[var(--text-secondary)] mb-3">{routine.description}</p>
        )}

        {/* Sequential Habit List */}
        <div className="space-y-1.5 border-t border-[var(--border)] pt-3">
          {routineHabits.map((habit, idx) => (
            <div key={habit!.id} className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
              <span className="w-4 h-4 rounded-full bg-[var(--bg-elevated)] text-[10px] font-semibold text-[var(--text-tertiary)] flex items-center justify-center flex-shrink-0">
                {idx + 1}
              </span>
              <span className="text-sm">{habit!.icon}</span>
              <span className="truncate">{habit!.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Start Flow Action */}
      <div className="pt-3 border-t border-[var(--border)]">
        <Link href={`/routines/${routine.id}/flow`}>
          <Button className="w-full" size="sm">
            <Play className="w-3.5 h-3.5 fill-current" /> Start Flow Mode
          </Button>
        </Link>
      </div>
    </div>
  )
}
