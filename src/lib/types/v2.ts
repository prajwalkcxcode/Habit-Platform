export interface RoutineItem {
  id: string
  habitId: string
  order: number
  estimatedMinutes?: number
}

export interface Routine {
  id: string
  name: string
  description?: string
  icon: string
  accentColor: string
  items: RoutineItem[]
  createdAt: string
  updatedAt: string
}

export interface RoutineLog {
  id: string
  routineId: string
  date: string
  completedItemIds: string[]
  skippedItemIds: string[]
  totalDurationSeconds: number
  completedAt: string
}

export type GoalTargetType = 'binary' | 'numeric' | 'frequency'

export interface SubGoal {
  id: string
  title: string
  completed: boolean
}

export type PaceStatus = 'on_track' | 'at_risk' | 'behind' | 'completed'

export interface Goal {
  id: string
  title: string
  description?: string
  categoryId?: string
  targetType: GoalTargetType
  targetValue: number
  currentValue: number
  unit?: string
  deadline?: string
  subGoals: SubGoal[]
  linkedHabitIds: string[]
  status: 'active' | 'completed' | 'archived'
  createdAt: string
  updatedAt: string
}

export interface DailyReflection {
  id: string
  date: string
  mood: number
  energy: number
  journalText?: string
  whatWentWell?: string
  whatToImprove?: string
  updatedAt: string
}

export interface HabitTemplate {
  id: string
  name: string
  description: string
  category: string
  icon: string
  habits: {
    name: string
    description?: string
    icon: string
    accentColor: string
    frequencyType: 'daily' | 'weekdays' | 'weekends'
    preferredTime: 'morning' | 'afternoon' | 'evening' | 'anytime'
  }[]
}
