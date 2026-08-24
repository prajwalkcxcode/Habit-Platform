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
