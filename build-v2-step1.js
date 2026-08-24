const fs = require('fs');
const path = require('path');

function writeFile(relPath, content) {
  const fullPath = path.join(__dirname, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Wrote ' + relPath);
}

// 1. V2 Types
writeFile('src/lib/types/v2.ts', `
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
`);

// 2. Goal Progress Logic
writeFile('src/lib/goals/progress.ts', `
import type { Goal, PaceStatus } from '@/lib/types/v2'
import type { Completion } from '@/lib/types'
import { parseISO, differenceInDays } from 'date-fns'

export function calculateGoalPace(goal: Goal, completions: Completion[]): {
  progressPercentage: number
  status: PaceStatus
  linkedCompletionsCount: number
} {
  const linkedCompletions = completions.filter(c => goal.linkedHabitIds.includes(c.habitId))
  const linkedCompletionsCount = linkedCompletions.length

  let currentValue = goal.currentValue
  if (goal.targetType === 'numeric' || goal.targetType === 'frequency') {
    currentValue += linkedCompletionsCount
  }

  const progressPercentage = goal.targetValue > 0
    ? Math.min(100, Math.round((currentValue / goal.targetValue) * 100))
    : 0

  if (progressPercentage >= 100) {
    return { progressPercentage: 100, status: 'completed', linkedCompletionsCount }
  }

  if (!goal.deadline) {
    return {
      progressPercentage,
      status: progressPercentage >= 50 ? 'on_track' : 'behind',
      linkedCompletionsCount,
    }
  }

  const today = new Date()
  const deadlineDate = parseISO(goal.deadline)
  const createdDate = parseISO(goal.createdAt)

  const totalDays = Math.max(1, differenceInDays(deadlineDate, createdDate))
  const daysPassed = Math.max(0, differenceInDays(today, createdDate))
  const expectedPercentage = Math.min(100, (daysPassed / totalDays) * 100)

  let status: PaceStatus = 'on_track'
  if (progressPercentage < expectedPercentage - 20) {
    status = 'behind'
  } else if (progressPercentage < expectedPercentage) {
    status = 'at_risk'
  }

  return { progressPercentage, status, linkedCompletionsCount }
}
`);

// 3. Update Dexie Database schema version 2
writeFile('src/lib/db/index.ts', `
import Dexie, { type Table } from 'dexie'
import type { Habit, Completion, UserSettings } from '@/lib/types'
import type { Routine, RoutineLog, Goal, DailyReflection } from '@/lib/types/v2'

export class HabitDB extends Dexie {
  habits!: Table<Habit, string>
  completions!: Table<Completion, string>
  settings!: Table<UserSettings & { id: string }, string>
  routines!: Table<Routine, string>
  routineLogs!: Table<RoutineLog, string>
  goals!: Table<Goal, string>
  reflections!: Table<DailyReflection, string>

  constructor() {
    super('HabitTrackerDB')

    this.version(1).stores({
      habits: 'id, status, createdAt, updatedAt',
      completions: 'id, habitId, date, completedAt',
      settings: 'id',
    })

    this.version(2).stores({
      habits: 'id, status, createdAt, updatedAt',
      completions: 'id, habitId, date, completedAt',
      settings: 'id',
      routines: 'id, createdAt, updatedAt',
      routineLogs: 'id, routineId, date, completedAt',
      goals: 'id, status, createdAt, updatedAt',
      reflections: 'id, date, updatedAt',
    })
  }
}

export const db = new HabitDB()

export async function initDB() {
  const existing = await db.settings.get('user')
  if (!existing) {
    await db.settings.put({
      id: 'user',
      theme: 'system',
      weekStartsOn: 1,
    })
  }
}
`);

console.log('Base V2 setup complete');
