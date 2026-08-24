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

    showToast(`Goal "${title}" created`, 'success')
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
                <Input key={i} placeholder={`Sub-goal ${i + 1}`} value={st} onChange={e => updateSubGoalTitle(i, e.target.value)} />
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
                    className={`flex items-center gap-2 p-1.5 rounded text-xs cursor-pointer ${
                      isLinked ? 'bg-[var(--accent-subtle)] text-[var(--accent)] font-medium' : 'hover:bg-[var(--bg-elevated)]'
                    }`}
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
