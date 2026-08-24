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
