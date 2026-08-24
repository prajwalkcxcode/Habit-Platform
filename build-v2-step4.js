const fs = require('fs');
const path = require('path');

function writeFile(relPath, content) {
  const fullPath = path.join(__dirname, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Wrote ' + relPath);
}

// 1. Routine Card
writeFile('src/components/routines/routine-card.tsx', `
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
                  showToast(\`Routine "\${routine.name}" deleted\`, 'info')
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
        <Link href={\`/routines/\${routine.id}/flow\`}>
          <Button className="w-full" size="sm">
            <Play className="w-3.5 h-3.5 fill-current" /> Start Flow Mode
          </Button>
        </Link>
      </div>
    </div>
  )
}
`);

// 2. Goal Card Component
writeFile('src/components/goals/goal-card.tsx', `
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
                showToast(\`Goal "\${goal.title}" deleted\`, 'info')
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
              <CheckCircle2 className={\`w-3.5 h-3.5 \${sub.completed ? 'text-[var(--accent)] fill-current' : 'text-gray-400'}\`} />
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
`);

// 3. Template Modal Component
writeFile('src/components/templates/template-modal.tsx', `
'use client'

import * as React from 'react'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from '@/components/ui/modal'
import { STARTER_TEMPLATES } from '@/lib/store/templates'
import { useHabitStore } from '@/lib/store/habits'
import { useUIStore } from '@/lib/store/ui'
import { Button } from '@/components/ui/button'
import { Sparkles, Check } from 'lucide-react'

interface TemplateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TemplateModal({ open, onOpenChange }: TemplateModalProps) {
  const addHabit = useHabitStore(s => s.addHabit)
  const showToast = useUIStore(s => s.showToast)
  const [selectedId, setSelectedId] = React.useState<string | null>(null)

  const handleInstall = async (templateId: string) => {
    const template = STARTER_TEMPLATES.find(t => t.id === templateId)
    if (!template) return

    for (const h of template.habits) {
      await addHabit({
        name: h.name,
        description: h.description,
        icon: h.icon,
        accentColor: h.accentColor,
        frequency: { type: h.frequencyType },
        preferredTime: h.preferredTime,
        priority: 'medium',
        difficulty: 'medium',
        status: 'active',
      })
    }

    showToast(\`Installed "\${template.name}" starter pack (\${template.habits.length} habits)\`, 'success')
    onOpenChange(false)
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <ModalHeader>
          <ModalTitle className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--accent)]" /> Habit Starter Packs & Templates
          </ModalTitle>
        </ModalHeader>

        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {STARTER_TEMPLATES.map(tmpl => (
            <div
              key={tmpl.id}
              onClick={() => setSelectedId(tmpl.id)}
              className={\`p-4 rounded-lg border cursor-pointer transition-all space-y-3 flex flex-col justify-between \${
                selectedId === tmpl.id
                  ? 'border-[var(--accent)] bg-[var(--accent-subtle)]'
                  : 'border-[var(--border)] bg-[var(--bg-base)] hover:border-[var(--border-strong)]'
              }\`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-2xl">{tmpl.icon}</span>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-[var(--bg-elevated)] text-[var(--text-tertiary)]">
                    {tmpl.category}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-[var(--text-primary)]">{tmpl.name}</h4>
                <p className="text-xs text-[var(--text-tertiary)] mt-1">{tmpl.description}</p>

                <div className="space-y-1 mt-3 border-t border-[var(--border)] pt-2">
                  {tmpl.habits.map((h, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                      <span>{h.icon}</span>
                      <span className="truncate">{h.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                size="sm"
                variant={selectedId === tmpl.id ? 'default' : 'secondary'}
                className="w-full mt-3"
                onClick={(e) => {
                  e.stopPropagation()
                  handleInstall(tmpl.id)
                }}
              >
                Install Starter Pack
              </Button>
            </div>
          ))}
        </div>

        <ModalFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
`);

console.log('Routines, Goals & Templates Components written');
