const fs = require('fs');
const path = require('path');

function writeFile(relPath, content) {
  const fullPath = path.join(__dirname, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Wrote ' + relPath);
}

// 1. Routines Store
writeFile('src/lib/store/routines.ts', `
'use client'

import { create } from 'zustand'
import type { Routine, RoutineLog } from '@/lib/types/v2'
import { db } from '@/lib/db'
import { nanoid } from '@/lib/utils/id'
import { toDateString } from '@/lib/utils/date'

interface RoutinesState {
  routines: Routine[]
  routineLogs: RoutineLog[]
  loading: boolean
  initialized: boolean

  // Flow mode state
  activeFlowRoutineId: string | null
  activeStepIndex: number
  isFlowPaused: boolean
  flowStartTime: number | null
  flowCompletedItemIds: string[]
  flowSkippedItemIds: string[]

  // Actions
  loadAll: () => Promise<void>
  addRoutine: (routine: Omit<Routine, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Routine>
  updateRoutine: (id: string, updates: Partial<Routine>) => Promise<void>
  deleteRoutine: (id: string) => Promise<void>
  
  startFlow: (routineId: string) => void
  pauseFlow: () => void
  resumeFlow: () => void
  completeFlowStep: (itemId: string) => void
  skipFlowStep: (itemId: string) => void
  finishFlow: () => Promise<RoutineLog | null>
  cancelFlow: () => void
}

export const useRoutinesStore = create<RoutinesState>((set, get) => ({
  routines: [],
  routineLogs: [],
  loading: false,
  initialized: false,

  activeFlowRoutineId: null,
  activeStepIndex: 0,
  isFlowPaused: false,
  flowStartTime: null,
  flowCompletedItemIds: [],
  flowSkippedItemIds: [],

  loadAll: async () => {
    set({ loading: true })
    try {
      const [routines, routineLogs] = await Promise.all([
        db.routines.orderBy('createdAt').toArray(),
        db.routineLogs.orderBy('date').toArray(),
      ])
      set({ routines, routineLogs, initialized: true })
    } finally {
      set({ loading: false })
    }
  },

  addRoutine: async (data) => {
    const now = new Date().toISOString()
    const routine: Routine = {
      id: nanoid(),
      createdAt: now,
      updatedAt: now,
      ...data,
    }
    await db.routines.add(routine)
    set(s => ({ routines: [...s.routines, routine] }))
    return routine
  },

  updateRoutine: async (id, updates) => {
    const updatedAt = new Date().toISOString()
    await db.routines.update(id, { ...updates, updatedAt })
    set(s => ({
      routines: s.routines.map(r => r.id === id ? { ...r, ...updates, updatedAt } : r),
    }))
  },

  deleteRoutine: async (id) => {
    await db.routines.delete(id)
    await db.routineLogs.where('routineId').equals(id).delete()
    set(s => ({
      routines: s.routines.filter(r => r.id !== id),
      routineLogs: s.routineLogs.filter(l => l.routineId !== id),
    }))
  },

  startFlow: (routineId) => {
    set({
      activeFlowRoutineId: routineId,
      activeStepIndex: 0,
      isFlowPaused: false,
      flowStartTime: Date.now(),
      flowCompletedItemIds: [],
      flowSkippedItemIds: [],
    })
  },

  pauseFlow: () => set({ isFlowPaused: true }),
  resumeFlow: () => set({ isFlowPaused: false }),

  completeFlowStep: (itemId) => {
    set(s => ({
      flowCompletedItemIds: [...s.flowCompletedItemIds, itemId],
      activeStepIndex: s.activeStepIndex + 1,
    }))
  },

  skipFlowStep: (itemId) => {
    set(s => ({
      flowSkippedItemIds: [...s.flowSkippedItemIds, itemId],
      activeStepIndex: s.activeStepIndex + 1,
    }))
  },

  finishFlow: async () => {
    const { activeFlowRoutineId, flowStartTime, flowCompletedItemIds, flowSkippedItemIds } = get()
    if (!activeFlowRoutineId || !flowStartTime) return null

    const totalDurationSeconds = Math.round((Date.now() - flowStartTime) / 1000)
    const log: RoutineLog = {
      id: nanoid(),
      routineId: activeFlowRoutineId,
      date: toDateString(new Date()),
      completedItemIds: flowCompletedItemIds,
      skippedItemIds: flowSkippedItemIds,
      totalDurationSeconds,
      completedAt: new Date().toISOString(),
    }

    await db.routineLogs.add(log)
    set(s => ({
      routineLogs: [...s.routineLogs, log],
      activeFlowRoutineId: null,
      activeStepIndex: 0,
      isFlowPaused: false,
      flowStartTime: null,
      flowCompletedItemIds: [],
      flowSkippedItemIds: [],
    }))

    return log
  },

  cancelFlow: () => {
    set({
      activeFlowRoutineId: null,
      activeStepIndex: 0,
      isFlowPaused: false,
      flowStartTime: null,
      flowCompletedItemIds: [],
      flowSkippedItemIds: [],
    })
  },
}))
`);

// 2. Goals Store
writeFile('src/lib/store/goals.ts', `
'use client'

import { create } from 'zustand'
import type { Goal } from '@/lib/types/v2'
import { db } from '@/lib/db'
import { nanoid } from '@/lib/utils/id'

interface GoalsState {
  goals: Goal[]
  loading: boolean
  initialized: boolean

  loadAll: () => Promise<void>
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Goal>
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>
  deleteGoal: (id: string) => Promise<void>
  toggleSubGoal: (goalId: string, subGoalId: string) => Promise<void>
}

export const useGoalsStore = create<GoalsState>((set, get) => ({
  goals: [],
  loading: false,
  initialized: false,

  loadAll: async () => {
    set({ loading: true })
    try {
      const goals = await db.goals.orderBy('createdAt').toArray()
      set({ goals, initialized: true })
    } finally {
      set({ loading: false })
    }
  },

  addGoal: async (data) => {
    const now = new Date().toISOString()
    const goal: Goal = {
      id: nanoid(),
      createdAt: now,
      updatedAt: now,
      ...data,
    }
    await db.goals.add(goal)
    set(s => ({ goals: [...s.goals, goal] }))
    return goal
  },

  updateGoal: async (id, updates) => {
    const updatedAt = new Date().toISOString()
    await db.goals.update(id, { ...updates, updatedAt })
    set(s => ({
      goals: s.goals.map(g => g.id === id ? { ...g, ...updates, updatedAt } : g),
    }))
  },

  deleteGoal: async (id) => {
    await db.goals.delete(id)
    set(s => ({ goals: s.goals.filter(g => g.id !== id) }))
  },

  toggleSubGoal: async (goalId, subGoalId) => {
    const goal = get().goals.find(g => g.id === goalId)
    if (!goal) return

    const updatedSubGoals = goal.subGoals.map(sg =>
      sg.id === subGoalId ? { ...sg, completed: !sg.completed } : sg
    )
    await get().updateGoal(goalId, { subGoals: updatedSubGoals })
  },
}))
`);

// 3. Daily Reflections Store
writeFile('src/lib/store/reflections.ts', `
'use client'

import { create } from 'zustand'
import type { DailyReflection } from '@/lib/types/v2'
import { db } from '@/lib/db'
import { nanoid } from '@/lib/utils/id'
import { toDateString } from '@/lib/utils/date'

interface ReflectionsState {
  reflections: DailyReflection[]
  loading: boolean
  initialized: boolean

  loadAll: () => Promise<void>
  saveReflection: (reflection: Omit<DailyReflection, 'id' | 'updatedAt'>) => Promise<DailyReflection>
  getReflectionForDate: (date: string) => DailyReflection | undefined
}

export const useReflectionsStore = create<ReflectionsState>((set, get) => ({
  reflections: [],
  loading: false,
  initialized: false,

  loadAll: async () => {
    set({ loading: true })
    try {
      const reflections = await db.reflections.orderBy('date').toArray()
      set({ reflections, initialized: true })
    } finally {
      set({ loading: false })
    }
  },

  saveReflection: async (data) => {
    const updatedAt = new Date().toISOString()
    const existing = get().reflections.find(r => r.date === data.date)

    if (existing) {
      const updated: DailyReflection = { ...existing, ...data, updatedAt }
      await db.reflections.put(updated)
      set(s => ({ reflections: s.reflections.map(r => r.id === existing.id ? updated : r) }))
      return updated
    } else {
      const created: DailyReflection = { id: nanoid(), ...data, updatedAt }
      await db.reflections.add(created)
      set(s => ({ reflections: [...s.reflections, created] }))
      return created
    }
  },

  getReflectionForDate: (date) => {
    return get().reflections.find(r => r.date === date)
  },
}))
`);

// 4. Starter Pack Templates Catalog
writeFile('src/lib/store/templates.ts', `
import type { HabitTemplate } from '@/lib/types/v2'

export const STARTER_TEMPLATES: HabitTemplate[] = [
  {
    id: 'morning-reset',
    name: 'Morning Reset',
    description: 'Build a focused, energized start to every day.',
    category: 'Mindfulness',
    icon: '🌅',
    habits: [
      { name: 'Hydrate (500ml water)', icon: '💧', accentColor: '#3b82f6', frequencyType: 'daily', preferredTime: 'morning' },
      { name: '10m Mindfulness Meditation', icon: '🧘', accentColor: '#8b5cf6', frequencyType: 'daily', preferredTime: 'morning' },
      { name: 'Sunlight Exposure & Walk', icon: '☀️', accentColor: '#f59e0b', frequencyType: 'daily', preferredTime: 'morning' },
    ],
  },
  {
    id: 'deep-work-focus',
    name: 'Deep Work & Focus',
    description: 'Eliminate distractions and achieve deep flow state.',
    category: 'Productivity',
    icon: '🧠',
    habits: [
      { name: 'Block Distracting Apps', icon: '🎯', accentColor: '#6366f1', frequencyType: 'weekdays', preferredTime: 'morning' },
      { name: '90-minute Deep Focus Session', icon: '📝', accentColor: '#3b82f6', frequencyType: 'weekdays', preferredTime: 'morning' },
      { name: 'Daily Evening Review', icon: '✍️', accentColor: '#8b5cf6', frequencyType: 'weekdays', preferredTime: 'evening' },
    ],
  },
  {
    id: 'fitness-foundation',
    name: 'Fitness Foundation',
    description: 'Essential physical wellness baseline for strength & stamina.',
    category: 'Fitness',
    icon: '🏋️',
    habits: [
      { name: '8,000 Daily Steps', icon: '🏃', accentColor: '#22c55e', frequencyType: 'daily', preferredTime: 'anytime' },
      { name: 'Workout Session (Strength / Cardio)', icon: '💪', accentColor: '#f59e0b', frequencyType: 'weekdays', preferredTime: 'afternoon' },
      { name: 'Sleep Before 11 PM', icon: '😴', accentColor: '#8b5cf6', frequencyType: 'daily', preferredTime: 'evening' },
    ],
  },
  {
    id: 'continuous-learner',
    name: 'Continuous Learner',
    description: 'Consistently expand your skills and knowledge base.',
    category: 'Learning',
    icon: '📚',
    habits: [
      { name: 'Read 20 Pages of a Book', icon: '📚', accentColor: '#6366f1', frequencyType: 'daily', preferredTime: 'evening' },
      { name: 'Practice Coding / Skill Building', icon: '🧠', accentColor: '#3b82f6', frequencyType: 'weekdays', preferredTime: 'afternoon' },
      { name: 'Learn 5 New Vocabulary Words', icon: '📝', accentColor: '#ec4899', frequencyType: 'daily', preferredTime: 'morning' },
    ],
  },
  {
    id: 'digital-detox',
    name: 'Digital Detox',
    description: 'Reclaim your attention and improve sleep quality.',
    category: 'Health',
    icon: '🌿',
    habits: [
      { name: 'No Screen 1 hour Before Bed', icon: '🌙', accentColor: '#8b5cf6', frequencyType: 'daily', preferredTime: 'evening' },
      { name: 'Starlight / Evening Walk', icon: '🌿', accentColor: '#22c55e', frequencyType: 'daily', preferredTime: 'evening' },
    ],
  },
  {
    id: 'financial-discipline',
    name: 'Financial Discipline',
    description: 'Build intentional spending habits and long-term security.',
    category: 'Productivity',
    icon: '💳',
    habits: [
      { name: 'Log Daily Expenses', icon: '📝', accentColor: '#22c55e', frequencyType: 'daily', preferredTime: 'evening' },
      { name: 'No Impulse Purchases Today', icon: '🎯', accentColor: '#f59e0b', frequencyType: 'daily', preferredTime: 'anytime' },
    ],
  },
]
`);

console.log('V2 stores written successfully');
