'use client'

import * as React from 'react'
import { Target, CheckSquare, Clock, AlertTriangle, CheckCircle2, MoreHorizontal, Trash2 } from 'lucide-react'
import type { Goal } from '@/lib/types/v2'
import { useHabitStore } from '@/lib/store/habits'
import { useGoalsStore } from '@/lib/store/goals'
import { useUIStore } from '@/lib/store/ui'
import { calculateGoalPace } from '@/lib/goals/progress'
import { Badge } from '@/components/ui/badge'
import { ProgressBar } from '@/components/ui/progress-bar'
import { formatDate } from '@/lib/utils/date'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

interface GoalCardProps {
  goal: Goal
}

const PACE_BADGES: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'default' }> = {
  completed: { label: 'Completed', variant: 'success' },
  on_track: { label: 'On Track', variant: 'success' },
  at_risk: { label: 'At Risk', variant: 'warning' },
  behind: { label: 'Behind', variant: 'danger' },
}

export function GoalCard({ goal }: GoalCardProps) {
  const completions = useHabitStore(s => s.completions)
  const habits = useHabitStore(s => s.habits)
  const deleteGoal = useGoalsStore(s => s.deleteGoal)
  const toggleSubGoal = useGoalsStore(s => s.toggleSubGoal)
  const showToast = useUIStore(s => s.showToast)

  const { progressPercentage, status } = calculateGoalPace(goal, completions)
  const badgeInfo = PACE_BADGES[status]

  const linkedHabitList = React.useMemo(
    () => habits.filter(h => goal.linkedHabitIds.includes(h.id)),
    [habits, goal.linkedHabitIds]
  )

  return (
    <div className="p-5 rounded-lg border border-[var(--border)] bg-[var(--bg-base)] space-y-4 group">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-[var(--accent)]" />
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">{goal.title}</h3>
            <Badge variant={badgeInfo.variant}>{badgeInfo.label}</Badge>
          </div>
          {goal.description && (
            <p className="text-xs text-[var(--text-secondary)]">{goal.description}</p>
          )}
        </div>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="opacity-0 group-hover:opacity-100 p-1 rounded text-[var(--text-tertiary)] hover:bg-[var(--bg-elevated)]">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content className="z-50 bg-[var(--bg-base)] border border-[var(--border)] rounded-lg shadow-lg p-1 text-xs" align="end">
              <DropdownMenu.Item className="flex items-center gap-2 p-1.5 rounded cursor-pointer text-red-500 hover:bg-red-500/10" onSelect={async () => {
                await deleteGoal(goal.id)
                showToast(`Goal "${goal.title}" deleted`, 'info')
              }}>
                <Trash2 className="w-3.5 h-3.5" /> Delete Goal
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>

      {/* Progress Ring / Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-[var(--text-tertiary)]">
          <span>Target Progress</span>
          <span className="font-semibold text-[var(--text-primary)] tabular-nums">{progressPercentage}%</span>
        </div>
        <ProgressBar value={progressPercentage} size="default" />
      </div>

      {/* Sub-goals Checklist */}
      {goal.subGoals.length > 0 && (
        <div className="space-y-1.5 border-t border-[var(--border)] pt-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Sub-goals</p>
          {goal.subGoals.map(sub => (
            <div
              key={sub.id}
              onClick={() => toggleSubGoal(goal.id, sub.id)}
              className="flex items-center gap-2 text-xs cursor-pointer hover:text-[var(--text-primary)] text-[var(--text-secondary)]"
            >
              <CheckCircle2 className={`w-3.5 h-3.5 ${sub.completed ? 'text-[var(--accent)] fill-current' : 'text-gray-400'}`} />
              <span className={sub.completed ? 'line-through opacity-60' : ''}>{sub.title}</span>
            </div>
          ))}
        </div>
      )}

      {/* Linked Habits */}
      {linkedHabitList.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap border-t border-[var(--border)] pt-3">
          <span className="text-[10px] text-[var(--text-tertiary)]">Linked Habits:</span>
          {linkedHabitList.map(h => (
            <span key={h.id} className="text-xs bg-[var(--bg-elevated)] border border-[var(--border)] px-2 py-0.5 rounded-full flex items-center gap-1">
              <span>{h.icon}</span> {h.name}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
