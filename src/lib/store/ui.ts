'use client'

import { create } from 'zustand'
import type { ToastMessage } from '@/lib/types'
import { nanoid } from '@/lib/utils/id'

interface UIStore {
  sidebarCollapsed: boolean
  habitFormOpen: boolean
  editingHabitId: string | null
  toast: ToastMessage | null

  setSidebarCollapsed: (v: boolean) => void
  openHabitForm: (habitId?: string) => void
  closeHabitForm: () => void
  showToast: (message: string, type?: ToastMessage['type']) => void
  clearToast: () => void
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarCollapsed: false,
  habitFormOpen: false,
  editingHabitId: null,
  toast: null,

  setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),

  openHabitForm: (habitId) =>
    set({ habitFormOpen: true, editingHabitId: habitId ?? null }),

  closeHabitForm: () =>
    set({ habitFormOpen: false, editingHabitId: null }),

  showToast: (message, type = 'success') =>
    set({ toast: { id: nanoid(), message, type } }),

  clearToast: () => set({ toast: null }),
}))
