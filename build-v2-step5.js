const fs = require('fs');
const path = require('path');

function writeFile(relPath, content) {
  const fullPath = path.join(__dirname, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Wrote ' + relPath);
}

// 1. Routine Form Modal
writeFile('src/components/routines/routine-form.tsx', `
'use client'

import * as React from 'react'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useHabitStore } from '@/lib/store/habits'
import { useRoutinesStore } from '@/lib/store/routines'
import { useUIStore } from '@/lib/store/ui'
import type { Routine, RoutineItem } from '@/lib/types/v2'
import { HABIT_ICONS, ACCENT_COLORS } from '@/lib/types'

interface RoutineFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  routineToEdit?: Routine | null
}

export function RoutineForm({ open, onOpenChange, routineToEdit }: RoutineFormProps) {
  const habits = useHabitStore(s => s.habits)
  const addRoutine = useRoutinesStore(s => s.addRoutine)
  const updateRoutine = useRoutinesStore(s => s.updateRoutine)
  const showToast = useUIStore(s => s.showToast)

  const [name, setName] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [icon, setIcon] = React.useState('🌅')
  const [accentColor, setAccentColor] = React.useState('#6366f1')
  const [selectedHabitIds, setSelectedHabitIds] = React.useState<string[]>([])

  React.useEffect(() => {
    if (routineToEdit) {
      setName(routineToEdit.name)
      setDescription(routineToEdit.description ?? '')
      setIcon(routineToEdit.icon)
      setAccentColor(routineToEdit.accentColor)
      setSelectedHabitIds(routineToEdit.items.sort((a, b) => a.order - b.order).map(i => i.habitId))
    } else {
      setName('')
      setDescription('')
      setIcon('🌅')
      setAccentColor('#6366f1')
      setSelectedHabitIds([])
    }
  }, [routineToEdit, open])

  const toggleHabit = (id: string) => {
    if (selectedHabitIds.includes(id)) {
      setSelectedHabitIds(selectedHabitIds.filter(hId => hId !== id))
    } else {
      setSelectedHabitIds([...selectedHabitIds, id])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    const items: RoutineItem[] = selectedHabitIds.map((hId, index) => ({
      id: \`item-\${index}\`,
      habitId: hId,
      order: index + 1,
      estimatedMinutes: 5,
    }))

    if (routineToEdit) {
      await updateRoutine(routineToEdit.id, { name, description, icon, accentColor, items })
      showToast(\`Routine "\${name}" updated\`, 'success')
    } else {
      await addRoutine({ name, description, icon, accentColor, items })
      showToast(\`Routine "\${name}" created\`, 'success')
    }
    onOpenChange(false)
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-md">
        <ModalHeader>
          <ModalTitle>{routineToEdit ? 'Edit Routine' : 'Create Routine'}</ModalTitle>
        </ModalHeader>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <Label className="mb-1.5 block">Routine Name</Label>
            <Input placeholder="e.g. Morning Reset Routine" value={name} onChange={e => setName(e.target.value)} required />
          </div>

          <div>
            <Label className="mb-1.5 block">Description</Label>
            <Textarea placeholder="Sequence of habits for your morning..." value={description} onChange={e => setDescription(e.target.value)} rows={2} />
          </div>

          {/* Habit Selection */}
          <div>
            <Label className="mb-1.5 block">Select & Sequence Habits ({selectedHabitIds.length})</Label>
            <div className="max-h-40 overflow-y-auto space-y-1 border border-[var(--border)] rounded-md p-2 bg-[var(--bg-subtle)]">
              {habits.filter(h => h.status === 'active').map(habit => {
                const isSelected = selectedHabitIds.includes(habit.id)
                const orderIndex = selectedHabitIds.indexOf(habit.id)

                return (
                  <div
                    key={habit.id}
                    onClick={() => toggleHabit(habit.id)}
                    className={\`flex items-center justify-between p-2 rounded text-xs cursor-pointer transition-colors \${
                      isSelected ? 'bg-[var(--accent-subtle)] text-[var(--accent)] font-semibold' : 'hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)]'
                    }\`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{habit.icon}</span>
                      <span>{habit.name}</span>
                    </div>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-[var(--accent)] text-white text-[10px] flex items-center justify-center font-mono">
                        {orderIndex + 1}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <ModalFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">{routineToEdit ? 'Save Changes' : 'Create Routine'}</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}
`);

// 2. Distraction-Free Routine Flow Mode Component
writeFile('src/components/routines/routine-flow.tsx', `
'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Play, Pause, CheckCircle2, SkipForward, ArrowLeft, Clock, Sparkles } from 'lucide-react'
import type { Routine } from '@/lib/types/v2'
import { useHabitStore } from '@/lib/store/habits'
import { useRoutinesStore } from '@/lib/store/routines'
import { useUIStore } from '@/lib/store/ui'
import { Button } from '@/components/ui/button'
import { ProgressBar } from '@/components/ui/progress-bar'

interface RoutineFlowProps {
  routine: Routine
}

export function RoutineFlow({ routine }: RoutineFlowProps) {
  const router = useRouter()
  const habits = useHabitStore(s => s.habits)
  const toggleCompletion = useHabitStore(s => s.toggleCompletion)

  const activeStepIndex = useRoutinesStore(s => s.activeStepIndex)
  const isFlowPaused = useRoutinesStore(s => s.isFlowPaused)
  const startFlow = useRoutinesStore(s => s.startFlow)
  const pauseFlow = useRoutinesStore(s => s.pauseFlow)
  const resumeFlow = useRoutinesStore(s => s.resumeFlow)
  const completeFlowStep = useRoutinesStore(s => s.completeFlowStep)
  const skipFlowStep = useRoutinesStore(s => s.skipFlowStep)
  const finishFlow = useRoutinesStore(s => s.finishFlow)
  const cancelFlow = useRoutinesStore(s => s.cancelFlow)
  const showToast = useUIStore(s => s.showToast)

  const [secondsElapsed, setSecondsElapsed] = React.useState(0)

  // Start flow on mount
  React.useEffect(() => {
    startFlow(routine.id)
    return () => cancelFlow()
  }, [routine.id])

  // Timer interval
  React.useEffect(() => {
    if (isFlowPaused) return
    const timer = setInterval(() => {
      setSecondsElapsed(prev => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [isFlowPaused])

  const orderedItems = React.useMemo(() => routine.items.sort((a, b) => a.order - b.order), [routine.items])
  const currentItem = orderedItems[activeStepIndex]
  const currentHabit = currentItem ? habits.find(h => h.id === currentItem.habitId) : null

  const isFinished = activeStepIndex >= orderedItems.length

  const handleStepComplete = () => {
    if (!currentItem || !currentHabit) return
    toggleCompletion(currentHabit.id)
    completeFlowStep(currentItem.id)
  }

  const handleStepSkip = () => {
    if (!currentItem) return
    skipFlowStep(currentItem.id)
  }

  const handleFinishAll = async () => {
    await finishFlow()
    showToast(\`Routine "\${routine.name}" completed!\`, 'success')
    router.push('/routines')
  }

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return \`\${m.toString().padStart(2, '0')}:\${s.toString().padStart(2, '0')}\`
  }

  const progressPct = orderedItems.length > 0 ? Math.round((activeStepIndex / orderedItems.length) * 100) : 0

  if (isFinished) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex flex-col items-center justify-center p-6 text-center space-y-6 animate-in fade-in-0">
        <div className="w-16 h-16 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center">
          <Sparkles className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Routine Completed!</h1>
          <p className="text-sm text-[var(--text-secondary)]">Great work staying consistent with {routine.name}.</p>
        </div>
        <div className="p-4 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] min-w-[200px] text-xs space-y-1">
          <p className="text-[var(--text-tertiary)]">Total Duration</p>
          <p className="text-xl font-mono font-bold text-[var(--text-primary)]">{formatTimer(secondsElapsed)}</p>
        </div>
        <Button onClick={handleFinishAll}>Return to Routines</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex flex-col justify-between p-6 max-w-xl mx-auto space-y-8 animate-in fade-in-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => { cancelFlow(); router.push('/routines'); }} className="flex items-center gap-1 text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
          <ArrowLeft className="w-4 h-4" /> Exit Flow Mode
        </button>

        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[var(--text-tertiary)]" />
          <span className="font-mono text-sm font-bold tabular-nums text-[var(--text-primary)]">{formatTimer(secondsElapsed)}</span>
        </div>
      </div>

      {/* Routine Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-[var(--text-tertiary)]">
          <span>{routine.name}</span>
          <span>Step {activeStepIndex + 1} of {orderedItems.length}</span>
        </div>
        <ProgressBar value={progressPct} />
      </div>

      {/* Center Active Step */}
      <div className="py-10 text-center space-y-4">
        <div className="text-6xl animate-bounce">{currentHabit?.icon ?? '🎯'}</div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">{currentHabit?.name ?? 'Habit Step'}</h2>
        {currentHabit?.description && (
          <p className="text-sm text-[var(--text-tertiary)] max-w-sm mx-auto">{currentHabit.description}</p>
        )}
      </div>

      {/* Action Player Controls */}
      <div className="space-y-3 pb-8">
        <div className="flex items-center gap-3">
          <Button size="lg" className="flex-1" onClick={handleStepComplete}>
            <CheckCircle2 className="w-5 h-5" /> Complete Step
          </Button>
          <Button size="lg" variant="secondary" onClick={handleStepSkip}>
            <SkipForward className="w-4 h-4" /> Skip
          </Button>
        </div>

        <div className="flex justify-center">
          <button onClick={() => isFlowPaused ? resumeFlow() : pauseFlow()} className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)] flex items-center gap-1">
            {isFlowPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            {isFlowPaused ? 'Resume Timer' : 'Pause Timer'}
          </button>
        </div>
      </div>
    </div>
  )
}
`);

// 3. Goal Form Component
writeFile('src/components/goals/goal-form.tsx', `
'use client'

import * as React from 'react'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { useHabitStore } from '@/lib/store/habits'
import { useGoalsStore } from '@/lib/store/goals'
import { useUIStore } from '@/lib/store/ui'
import type { GoalTargetType, SubGoal } from '@/lib/types/v2'
import { nanoid } from '@/lib/utils/id'

interface GoalFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GoalForm({ open, onOpenChange }: GoalFormProps) {
  const habits = useHabitStore(s => s.habits)
  const addGoal = useGoalsStore(s => s.addGoal)
  const showToast = useUIStore(s => s.showToast)

  const [title, setTitle] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [targetType, setTargetType] = React.useState<GoalTargetType>('numeric')
  const [targetValue, setTargetValue] = React.useState(10)
  const [unit, setUnit] = React.useState('books')
  const [deadline, setDeadline] = React.useState('')
  const [subGoalTitles, setSubGoalTitles] = React.useState<string[]>([''])
  const [linkedHabitIds, setLinkedHabitIds] = React.useState<string[]>([])

  const addSubGoalField = () => setSubGoalTitles([...subGoalTitles, ''])
  const updateSubGoalTitle = (index: number, val: string) => {
    const list = [...subGoalTitles]
    list[index] = val
    setSubGoalTitles(list)
  }

  const toggleLinkedHabit = (id: string) => {
    if (linkedHabitIds.includes(id)) {
      setLinkedHabitIds(linkedHabitIds.filter(hId => hId !== id))
    } else {
      setLinkedHabitIds([...linkedHabitIds, id])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    const subGoals: SubGoal[] = subGoalTitles
      .filter(t => t.trim().length > 0)
      .map(t => ({ id: nanoid(), title: t, completed: false }))

    await addGoal({
      title,
      description: description || undefined,
      targetType,
      targetValue,
      currentValue: 0,
      unit: unit || undefined,
      deadline: deadline || undefined,
      subGoals,
      linkedHabitIds,
      status: 'active',
    })

    showToast(\`Goal "\${title}" created\`, 'success')
    onOpenChange(false)
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <ModalHeader>
          <ModalTitle>Create Goal</ModalTitle>
        </ModalHeader>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <Label className="mb-1.5 block">Goal Title</Label>
            <Input placeholder="e.g. Read 12 Books This Year" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>

          <div>
            <Label className="mb-1.5 block">Description</Label>
            <Textarea placeholder="Why is this objective important?" value={description} onChange={e => setDescription(e.target.value)} rows={2} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1.5 block">Target Type</Label>
              <Select value={targetType} onValueChange={v => setTargetType(v as GoalTargetType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="numeric">Numeric Target</SelectItem>
                  <SelectItem value="binary">Binary (Done / Not done)</SelectItem>
                  <SelectItem value="frequency">Frequency Target</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block">Target Amount</Label>
              <Input type="number" value={targetValue} onChange={e => setTargetValue(Number(e.target.value))} min={1} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1.5 block">Unit (e.g. books, kg)</Label>
              <Input placeholder="e.g. books" value={unit} onChange={e => setUnit(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1.5 block">Deadline</Label>
              <Input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
            </div>
          </div>

          {/* Sub-goals */}
          <div>
            <Label className="mb-1.5 block">Sub-goals</Label>
            <div className="space-y-2">
              {subGoalTitles.map((st, i) => (
                <Input key={i} placeholder={\`Sub-goal \${i + 1}\`} value={st} onChange={e => updateSubGoalTitle(i, e.target.value)} />
              ))}
              <Button type="button" variant="secondary" size="sm" onClick={addSubGoalField}>+ Add Sub-goal</Button>
            </div>
          </div>

          {/* Link Habits */}
          <div>
            <Label className="mb-1.5 block">Link Daily Habits</Label>
            <div className="max-h-32 overflow-y-auto border border-[var(--border)] rounded p-2 space-y-1">
              {habits.filter(h => h.status === 'active').map(h => {
                const isLinked = linkedHabitIds.includes(h.id)
                return (
                  <div
                    key={h.id}
                    onClick={() => toggleLinkedHabit(h.id)}
                    className={\`flex items-center gap-2 p-1.5 rounded text-xs cursor-pointer \${
                      isLinked ? 'bg-[var(--accent-subtle)] text-[var(--accent)] font-medium' : 'hover:bg-[var(--bg-elevated)]'
                    }\`}
                  >
                    <span>{h.icon}</span> {h.name}
                  </div>
                )
              })}
            </div>
          </div>

          <ModalFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Create Goal</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}
`);

console.log('V2 Forms & Flow player written');
