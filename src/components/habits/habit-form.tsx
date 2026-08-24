'use client'

import * as React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useHabitStore } from '@/lib/store/habits'
import { useUIStore } from '@/lib/store/ui'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
  ModalClose,
} from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DEFAULT_CATEGORIES, ACCENT_COLORS, HABIT_ICONS } from '@/lib/types'
import { cn } from '@/lib/utils/cn'
import type { Habit, FrequencyType, PreferredTime, Priority, Difficulty } from '@/lib/types'

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(60, 'Too long'),
  description: z.string().max(200, 'Too long').optional(),
  icon: z.string(),
  accentColor: z.string(),
  categoryId: z.string().optional(),
  frequencyType: z.enum(['daily', 'weekdays', 'weekends', 'specific_days', 'custom'] as const),
  specificDays: z.array(z.number()).optional(),
  preferredTime: z.enum(['morning', 'afternoon', 'evening', 'anytime'] as const),
  priority: z.enum(['low', 'medium', 'high'] as const),
  difficulty: z.enum(['easy', 'medium', 'hard'] as const),
})

type FormData = z.infer<typeof schema>

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export function HabitForm() {
  const isOpen = useUIStore(s => s.habitFormOpen)
  const editingId = useUIStore(s => s.editingHabitId)
  const closeHabitForm = useUIStore(s => s.closeHabitForm)
  const showToast = useUIStore(s => s.showToast)
  const habits = useHabitStore(s => s.habits)
  const addHabit = useHabitStore(s => s.addHabit)
  const updateHabit = useHabitStore(s => s.updateHabit)

  const editingHabit = editingId ? habits.find(h => h.id === editingId) : null

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      icon: '??',
      accentColor: '#6366f1',
      categoryId: undefined,
      frequencyType: 'daily',
      specificDays: [],
      preferredTime: 'anytime',
      priority: 'medium',
      difficulty: 'medium',
    },
  })

  // Load editing data
  React.useEffect(() => {
    if (editingHabit) {
      reset({
        name: editingHabit.name,
        description: editingHabit.description ?? '',
        icon: editingHabit.icon,
        accentColor: editingHabit.accentColor,
        categoryId: editingHabit.categoryId,
        frequencyType: editingHabit.frequency.type,
        specificDays: editingHabit.frequency.days ?? [],
        preferredTime: editingHabit.preferredTime,
        priority: editingHabit.priority ?? 'medium',
        difficulty: editingHabit.difficulty ?? 'medium',
      })
    } else {
      reset({
        name: '',
        description: '',
        icon: '??',
        accentColor: '#6366f1',
        categoryId: undefined,
        frequencyType: 'daily',
        specificDays: [],
        preferredTime: 'anytime',
        priority: 'medium',
        difficulty: 'medium',
      })
    }
  }, [editingHabit, reset, isOpen])

  const selectedIcon = watch('icon')
  const selectedColor = watch('accentColor')
  const frequencyType = watch('frequencyType')
  const specificDays = watch('specificDays') ?? []

  const toggleDay = (day: number) => {
    const current = specificDays
    const next = current.includes(day)
      ? current.filter(d => d !== day)
      : [...current, day].sort()
    setValue('specificDays', next)
  }

  const onSubmit = async (data: FormData) => {
    const habitData = {
      name: data.name,
      description: data.description || undefined,
      icon: data.icon,
      accentColor: data.accentColor,
      categoryId: data.categoryId,
      frequency: {
        type: data.frequencyType as FrequencyType,
        days: data.frequencyType === 'specific_days' ? data.specificDays as any[] : undefined,
      },
      preferredTime: data.preferredTime as PreferredTime,
      priority: data.priority as Priority,
      difficulty: data.difficulty as Difficulty,
      status: 'active' as const,
    }

    if (editingId) {
      await updateHabit(editingId, habitData)
      showToast(`${data.icon} ${data.name} updated`, 'success')
    } else {
      await addHabit(habitData)
      showToast(`${data.icon} ${data.name} created`, 'success')
    }
    closeHabitForm()
  }

  return (
    <Modal open={isOpen} onOpenChange={(open) => { if (!open) closeHabitForm() }}>
      <ModalContent className="max-h-[90vh] overflow-y-auto">
        <ModalHeader>
          <ModalTitle>{editingId ? 'Edit habit' : 'New habit'}</ModalTitle>
          <ModalClose asChild>
            <button className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
              <span className="text-sm">?</span>
            </button>
          </ModalClose>
        </ModalHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="px-5 py-4 space-y-4">
            {/* Icon + Name row */}
            <div className="flex gap-3">
              {/* Icon picker */}
              <div>
                <Label className="mb-1.5 block">Icon</Label>
                <div
                  className="w-8 h-8 rounded-md border border-[var(--border)] flex items-center justify-center text-base cursor-pointer hover:border-[var(--accent)] transition-colors"
                  title={selectedIcon}
                >
                  {selectedIcon}
                </div>
              </div>
              {/* Name */}
              <div className="flex-1">
                <Label htmlFor="name" className="mb-1.5 block">Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Morning run"
                  autoFocus
                  {...register('name')}
                />
                {errors.name && (
                  <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
                )}
              </div>
            </div>

            {/* Icon grid */}
            <div>
              <Label className="mb-1.5 block">Choose icon</Label>
              <div className="grid grid-cols-8 gap-1">
                {HABIT_ICONS.map(icon => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setValue('icon', icon)}
                    className={cn(
                      'w-8 h-8 rounded text-base flex items-center justify-center transition-colors',
                      icon === selectedIcon
                        ? 'bg-[var(--accent-subtle)] ring-2 ring-[var(--accent)]'
                        : 'hover:bg-[var(--bg-elevated)]'
                    )}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="mb-1.5 block">Description <span className="opacity-50">(optional)</span></Label>
              <Textarea
                id="description"
                placeholder="What is this habit for?"
                rows={2}
                {...register('description')}
              />
            </div>

            {/* Accent color */}
            <div>
              <Label className="mb-1.5 block">Color</Label>
              <div className="flex gap-1.5 flex-wrap">
                {ACCENT_COLORS.map(({ label, value }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setValue('accentColor', value)}
                    className={cn(
                      'w-5 h-5 rounded-full transition-transform',
                      value === selectedColor ? 'ring-2 ring-offset-2 ring-[var(--border-strong)] scale-110' : 'hover:scale-105'
                    )}
                    style={{ backgroundColor: value }}
                    title={label}
                    aria-label={label}
                  />
                ))}
              </div>
            </div>

            {/* Frequency */}
            <div>
              <Label className="mb-1.5 block">Frequency</Label>
              <Controller
                control={control}
                name="frequencyType"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Every day</SelectItem>
                      <SelectItem value="weekdays">Weekdays (Mon�Fri)</SelectItem>
                      <SelectItem value="weekends">Weekends (Sat�Sun)</SelectItem>
                      <SelectItem value="specific_days">Specific days</SelectItem>
                      <SelectItem value="custom">Custom (N times/week)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {frequencyType === 'specific_days' && (
                <div className="flex gap-1 mt-2">
                  {DAY_LABELS.map((label, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggleDay(i)}
                      className={cn(
                        'w-7 h-7 rounded text-xs font-medium transition-colors',
                        specificDays.includes(i)
                          ? 'bg-[var(--accent)] text-white'
                          : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--border)]'
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Priority & Difficulty row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-1.5 block">Priority</Label>
                <Controller
                  control={control}
                  name="priority"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div>
                <Label className="mb-1.5 block">Difficulty</Label>
                <Controller
                  control={control}
                  name="difficulty"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            {/* Preferred time */}
            <div>
              <Label className="mb-1.5 block">Preferred time</Label>
              <Controller
                control={control}
                name="preferredTime"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="anytime">Anytime</SelectItem>
                      <SelectItem value="morning">?? Morning</SelectItem>
                      <SelectItem value="afternoon">??? Afternoon</SelectItem>
                      <SelectItem value="evening">?? Evening</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Category */}
            <div>
              <Label className="mb-1.5 block">Category <span className="opacity-50">(optional)</span></Label>
              <Controller
                control={control}
                name="categoryId"
                render={({ field }) => (
                  <Select value={field.value ?? ''} onValueChange={v => field.onChange(v || undefined)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEFAULT_CATEGORIES.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <ModalFooter>
            <Button type="button" variant="secondary" onClick={closeHabitForm}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {editingId ? 'Save changes' : 'Create habit'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}
