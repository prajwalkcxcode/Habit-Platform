import { parseISO, differenceInCalendarDays } from 'date-fns'
import type { Habit, Completion, HabitStats } from '@/lib/types'
import { toDateString, isDateBefore } from '@/lib/utils/date'
import { isHabitScheduledOnDate, getScheduledDates } from './schedule'

/**
 * Calculates the current streak for a habit.
 * A streak is the number of consecutive SCHEDULED days that have been completed,
 * working backwards from today.
 * - If today is a scheduled day and NOT yet completed, the streak continues from yesterday.
 * - If today is NOT a scheduled day, the streak continues from the last scheduled day.
 */
export function calculateCurrentStreak(
  habit: Habit,
  completions: Completion[],
  today: Date = new Date()
): number {
  const completedDates = new Set(completions.map(c => c.date))
  const todayStr = toDateString(today)
  const scheduledDates = getScheduledDates(habit, today)

  if (scheduledDates.length === 0) return 0

  let streak = 0
  // Walk backwards through scheduled dates
  for (let i = scheduledDates.length - 1; i >= 0; i--) {
    const dateStr = scheduledDates[i]

    if (dateStr === todayStr) {
      // Today: if completed, count it; if not completed yet, skip (don't break streak)
      if (completedDates.has(dateStr)) streak++
      // Either way, continue checking previous days
      continue
    }

    // Past scheduled day
    if (completedDates.has(dateStr)) {
      streak++
    } else {
      // Missed a past scheduled day — streak broken
      break
    }
  }

  return streak
}

/**
 * Calculates the longest streak ever recorded for a habit.
 */
export function calculateBestStreak(
  habit: Habit,
  completions: Completion[]
): number {
  const scheduledDates = getScheduledDates(habit)
  if (scheduledDates.length === 0) return 0

  const completedDates = new Set(completions.map(c => c.date))

  let best = 0
  let current = 0

  for (const dateStr of scheduledDates) {
    if (completedDates.has(dateStr)) {
      current++
      if (current > best) best = current
    } else {
      current = 0
    }
  }

  return best
}

/**
 * Computes all statistics for a habit.
 */
export function computeHabitStats(
  habit: Habit,
  completions: Completion[],
  today: Date = new Date()
): HabitStats {
  const habitCompletions = completions.filter(c => c.habitId === habit.id)
  const scheduledDates = getScheduledDates(habit, today)
  const completedSet = new Set(habitCompletions.map(c => c.date))

  const totalScheduled = scheduledDates.length
  const totalCompletions = habitCompletions.length
  // Only count scheduled completions for rate
  const scheduledCompletions = scheduledDates.filter(d => completedSet.has(d)).length
  const completionRate = totalScheduled > 0 ? scheduledCompletions / totalScheduled : 0
  const missedDays = totalScheduled - scheduledCompletions

  const currentStreak = calculateCurrentStreak(habit, habitCompletions, today)
  const bestStreak = calculateBestStreak(habit, habitCompletions)

  const sorted = [...habitCompletions].sort((a, b) => b.date.localeCompare(a.date))
  const lastCompletedDate = sorted[0]?.date

  return {
    habitId: habit.id,
    currentStreak,
    bestStreak,
    totalCompletions,
    completionRate,
    missedDays,
    lastCompletedDate,
  }
}
