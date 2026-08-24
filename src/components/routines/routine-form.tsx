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
      id: `item-${index}`,
      habitId: hId,
      order: index + 1,
      estimatedMinutes: 5,
    }))

    if (routineToEdit) {
      await updateRoutine(routineToEdit.id, { name, description, icon, accentColor, items })
      showToast(`Routine "${name}" updated`, 'success')
    } else {
      await addRoutine({ name, description, icon, accentColor, items })
      showToast(`Routine "${name}" created`, 'success')
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
                    className={`flex items-center justify-between p-2 rounded text-xs cursor-pointer transition-colors ${
                      isSelected ? 'bg-[var(--accent-subtle)] text-[var(--accent)] font-semibold' : 'hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)]'
                    }`}
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
