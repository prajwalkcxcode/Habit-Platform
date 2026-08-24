export interface WeeklyReview {
  id: string
  weekOf: string      // YYYY-MM-DD (Monday)
  completed: number
  total: number
  consistencyPct: number
  topHabitId: string
  topHabitName: string
  topHabitStreak: number
  missedHabitIds: string[]
  xpEarned: number
  note?: string
  generatedAt: string
}

export interface MonthlyReview {
  id: string
  monthOf: string     // YYYY-MM (e.g. 2026-08)
  totalCompleted: number
  totalScheduled: number
  consistencyPct: number
  bestWeekPct: number
  worstWeekPct: number
  longestStreakHabitName: string
  longestStreak: number
  totalXpEarned: number
  generatedAt: string
}

export interface YearReview {
  year: number
  totalCompleted: number
  totalScheduled: number
  consistencyPct: number
  longestStreak: number
  longestStreakHabitName: string
  totalFocusMinutes: number
  totalXpEarned: number
  monthlyBreakdown: { month: string; pct: number }[]
  generatedAt: string
}

export interface HabitCorrelation {
  habitAId: string
  habitAName: string
  habitBId: string
  habitBName: string
  correlation: number  // -1 to 1
  description: string
  sampleSize: number
}

export interface SmartReminder {
  id: string
  habitId: string
  habitName: string
  suggestedTime: string   // HH:MM 24h
  basis: string           // human-readable explanation
  enabled: boolean
}
