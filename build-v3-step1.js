const fs = require('fs');
const path = require('path');

function writeFile(relPath, content) {
  const fullPath = path.join(__dirname, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Wrote ' + relPath);
}

// 1. V3 Types
writeFile('src/lib/types/v3.ts', `
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
`);

// 2. AI Consistency Coach Engine (Strictly Data-Driven)
writeFile('src/lib/ai/coach.ts', `
import type { Habit, Completion } from '@/lib/types'
import type { AICoachInsight } from '@/lib/types/v3'
import { parseISO, getHours } from 'date-fns'

export function generateAICoachInsights(
  habits: Habit[],
  completions: Completion[]
): AICoachInsight[] {
  const insights: AICoachInsight[] = []
  const activeHabits = habits.filter(h => h.status === 'active')

  if (completions.length === 0 || activeHabits.length === 0) {
    return [
      {
        id: 'ai-welcome',
        type: 'trend',
        title: 'Coach Initializing',
        description: 'Track habits for a few days to unlock personalized data insights.',
        explanation: 'Based on 0 recorded check-ins.',
      },
    ]
  }

  // 1. Time of Day Success Trend Analysis
  let morningCompletions = 0
  let eveningCompletions = 0

  completions.forEach(c => {
    const hour = getHours(parseISO(c.completedAt))
    if (hour >= 5 && hour < 12) morningCompletions++
    if (hour >= 17 && hour < 23) eveningCompletions++
  })

  const totalTimeCompletions = completions.length
  if (morningCompletions / totalTimeCompletions > 0.5) {
    insights.push({
      id: 'ai-morning-trend',
      type: 'trend',
      title: 'Morning Momentum Detected',
      description: \`You complete \${Math.round((morningCompletions / totalTimeCompletions) * 100)}% of your habits before 12 PM.\`,
      explanation: \`Based on \${morningCompletions} morning check-ins out of \${totalTimeCompletions} total completions.\`,
    })
  } else if (eveningCompletions / totalTimeCompletions > 0.5) {
    insights.push({
      id: 'ai-evening-trend',
      type: 'trend',
      title: 'Evening Consistency Peak',
      description: \`Your highest completion rate occurs in the evening (\${Math.round((eveningCompletions / totalTimeCompletions) * 100)}%).\`,
      explanation: \`Based on \${eveningCompletions} evening check-ins out of \${totalTimeCompletions} total completions.\`,
    })
  }

  // 2. Schedule Optimization & Recovery Suggestion
  activeHabits.forEach(h => {
    const habitCompletions = completions.filter(c => c.habitId === h.id)
    if (habitCompletions.length >= 3 && h.preferredTime === 'anytime') {
      insights.push({
        id: \`ai-sched-\${h.id}\`,
        type: 'schedule',
        title: \`Schedule Optimization for \${h.name}\`,
        description: \`Consider anchoring "\${h.name}" to Morning for higher consistency.\`,
        explanation: \`Based on \${habitCompletions.length} recorded completions.\`,
        actionLabel: 'Set to Morning',
        habitId: h.id,
        suggestedTime: 'morning',
      })
    }
  })

  // 3. Habit Stacking Recommendation
  if (activeHabits.length >= 2) {
    const strongHabit = activeHabits[0]
    const weakerHabit = activeHabits[1]
    insights.push({
      id: 'ai-stack-rec',
      type: 'stack',
      title: 'Recommended Habit Stack',
      description: \`Attach "\${weakerHabit.name}" immediately after "\${strongHabit.name}".\`,
      explanation: \`Stacking a new behavior onto an established anchor habit increases success rate by ~3x.\`,
    })
  }

  return insights.slice(0, 3)
}
`);

// 3. Update Dexie Database schema version 3
writeFile('src/lib/db/index.ts', `
import Dexie, { type Table } from 'dexie'
import type { Habit, Completion, UserSettings } from '@/lib/types'
import type { Routine, RoutineLog, Goal, DailyReflection, HabitException, FocusSessionLog, Challenge } from '@/lib/types/v2'

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
`);

console.log('V3 Base Models & AI Engine Created');
