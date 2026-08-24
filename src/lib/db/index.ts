import Dexie, { type Table } from 'dexie'
import type { Habit, Completion, UserSettings } from '@/lib/types'
import type { Routine, RoutineLog, Goal, DailyReflection } from '@/lib/types/v2'
import type { HabitException, FocusSessionLog, Challenge } from '@/lib/types/v3'

export class HabitDB extends Dexie {
  habits!: Table<Habit, string>
  completions!: Table<Completion, string>
  settings!: Table<UserSettings & { id: string }, string>
  routines!: Table<Routine, string>
  routineLogs!: Table<RoutineLog, string>
  goals!: Table<Goal, string>
  reflections!: Table<DailyReflection, string>
  exceptions!: Table<HabitException, string>
  focusLogs!: Table<FocusSessionLog, string>
  challenges!: Table<Challenge, string>

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

    this.version(3).stores({
      habits: 'id, status, createdAt, updatedAt',
      completions: 'id, habitId, date, completedAt',
      settings: 'id',
      routines: 'id, createdAt, updatedAt',
      routineLogs: 'id, routineId, date, completedAt',
      goals: 'id, status, createdAt, updatedAt',
      reflections: 'id, date, updatedAt',
      exceptions: 'id, date, habitId, type',
      focusLogs: 'id, habitId, date, completedAt',
      challenges: 'id, status, startDate, endDate',
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
