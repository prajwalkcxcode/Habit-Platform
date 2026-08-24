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
