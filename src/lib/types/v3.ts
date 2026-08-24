export type HabitType = 'boolean' | 'duration' | 'numeric' | 'abstinence'

export interface HabitException {
  id: string
  habitId?: string
  date: string // YYYY-MM-DD
  type: 'rest_day' | 'freeze' | 'travel' | 'recovery' | 'exam'
  note?: string
}

export interface FocusSessionLog {
  id: string
  habitId?: string
  durationMinutes: number
  date: string // YYYY-MM-DD
  completedAt: string
}

export interface Challenge {
  id: string
  title: string
  description: string
  targetDays: number
  habitIds: string[]
  startDate: string
  endDate: string
  progressDays: number
  status: 'active' | 'completed' | 'failed'
}

export interface AchievementBadge {
  id: string
  title: string
  description: string
  icon: string
  unlockedAt?: string
}

export interface AICoachInsight {
  id: string
  type: 'trend' | 'schedule' | 'stack' | 'recovery'
  title: string
  description: string
  explanation: string
  actionLabel?: string
  suggestedTime?: string
  habitId?: string
}

export interface UserXPState {
  xp: number
  level: number
  freezesRemaining: number
}
