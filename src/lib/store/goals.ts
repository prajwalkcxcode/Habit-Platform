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
