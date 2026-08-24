// --- Enums / Literals -------------------------------------------------------

export type FrequencyType =
  | 'daily'
  | 'weekdays'
  | 'weekends'
  | 'specific_days'
  | 'custom'

export type PreferredTime = 'morning' | 'afternoon' | 'evening' | 'anytime'

export type HabitStatus = 'active' | 'paused' | 'archived'

export type Priority = 'low' | 'medium' | 'high'

export type Difficulty = 'easy' | 'medium' | 'hard'

export type Theme = 'light' | 'dark' | 'system'

// 0=Sun, 1=Mon, ..., 6=Sat (same as Date.getDay())
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6

// --- Habit Frequency --------------------------------------------------------

export interface HabitFrequency {
  type: FrequencyType
  /** Days of week for 'specific_days' (0=Sun ... 6=Sat) */
  days?: DayOfWeek[]
  /** For 'custom': how many times per week */
  timesPerWeek?: number
}

// --- Category ---------------------------------------------------------------

export interface Category {
  id: string
  name: string
  color: string
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'health', name: 'Health', color: '#22c55e' },
  { id: 'fitness', name: 'Fitness', color: '#f59e0b' },
  { id: 'learning', name: 'Learning', color: '#6366f1' },
  { id: 'mindfulness', name: 'Mindfulness', color: '#8b5cf6' },
  { id: 'productivity', name: 'Productivity', color: '#3b82f6' },
  { id: 'social', name: 'Social', color: '#ec4899' },
  { id: 'other', name: 'Other', color: '#6b7280' },
]

// --- Habit -------------------------------------------------------------------

export interface Habit {
  id: string
  name: string
  description?: string
  categoryId?: string
  icon: string
  accentColor: string
  frequency: HabitFrequency
  preferredTime: PreferredTime
  priority: Priority
  difficulty: Difficulty
  status: HabitStatus
  createdAt: string  // ISO date string (YYYY-MM-DD)
  updatedAt: string  // ISO timestamp
}

// --- Completion --------------------------------------------------------------

export interface Completion {
  id: string
  habitId: string
  date: string        // YYYY-MM-DD
  completedAt: string // full ISO timestamp
  note?: string
}

// --- Stats (computed, not stored) --------------------------------------------

export interface HabitStats {
  habitId: string
  currentStreak: number
  bestStreak: number
  totalCompletions: number
  completionRate: number  // 0�1, based on scheduled days since creation
  missedDays: number
  lastCompletedDate?: string
}

// --- User Settings -----------------------------------------------------------

export interface UserSettings {
  theme: Theme
  weekStartsOn: 0 | 1  // 0=Sun, 1=Mon
}

// --- UI State ----------------------------------------------------------------

export interface ToastMessage {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

// --- Derived helpers ---------------------------------------------------------

export const ACCENT_COLORS = [
  { label: 'Indigo', value: '#6366f1' },
  { label: 'Blue', value: '#3b82f6' },
  { label: 'Teal', value: '#14b8a6' },
  { label: 'Green', value: '#22c55e' },
  { label: 'Amber', value: '#f59e0b' },
  { label: 'Orange', value: '#f97316' },
  { label: 'Rose', value: '#f43f5e' },
  { label: 'Purple', value: '#8b5cf6' },
  { label: 'Slate', value: '#64748b' },
]

export const HABIT_ICONS = [
  '??', '??', '??', '??', '??', '??', '??', '??',
  '??', '??', '??', '??', '??', '??', '??', '??',
  '??', '??', '??', '??', '??', '??', '?', '??',
]
