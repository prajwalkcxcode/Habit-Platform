import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, parseISO } from 'date-fns'
import type { Habit, Completion } from '@/lib/types'
import { toDateString } from '@/lib/utils/date'
import { isHabitScheduledOnDate } from './schedule'

export interface DayCompletion {
  date: string
  completed: number
  scheduled: number
  rate: number
}

/**
 * Returns completion data for each day in the last N weeks.
 * Used for heatmap / calendar visualization.
 */
export function getCompletionHeatmap(
  habits: Habit[],
  completions: Completion[],
  weeks: number = 26
): DayCompletion[] {
  const today = new Date()
  const start = new Date(today)
  start.setDate(start.getDate() - weeks * 7)

  const days = eachDayOfInterval({ start, end: today })
  const completedSet = new Set(completions.map(c => `${c.habitId}::${c.date}`))
  const activeHabits = habits.filter(h => h.status === 'active')

  return days.map(day => {
    const dateStr = toDateString(day)
    const scheduled = activeHabits.filter(h => isHabitScheduledOnDate(h, day)).length
    const completed = activeHabits.filter(
      h => isHabitScheduledOnDate(h, day) && completedSet.has(`${h.id}::${dateStr}`)
    ).length
    const rate = scheduled > 0 ? completed / scheduled : 0
    return { date: dateStr, completed, scheduled, rate }
  })
}

/**
 * Returns weekly completion data for a single habit.
 */
export function getHabitWeeklyData(
  habit: Habit,
  completions: Completion[],
  weekCount: number = 12,
  weekStartsOn: 0 | 1 = 1
): { weekLabel: string; rate: number; completed: number; scheduled: number }[] {
  const today = new Date()
  const results = []

  for (let i = weekCount - 1; i >= 0; i--) {
    const weekDate = new Date(today)
    weekDate.setDate(weekDate.getDate() - i * 7)
    const start = startOfWeek(weekDate, { weekStartsOn })
    const end = endOfWeek(weekDate, { weekStartsOn })
    const days = eachDayOfInterval({ start, end: end < today ? end : today })

    const scheduledDays = days.filter(d => isHabitScheduledOnDate(habit, d))
    const completedDays = scheduledDays.filter(d =>
      completions.some(c => c.habitId === habit.id && c.date === toDateString(d))
    )

    results.push({
      weekLabel: toDateString(start),
      rate: scheduledDays.length > 0 ? completedDays.length / scheduledDays.length : 0,
      completed: completedDays.length,
      scheduled: scheduledDays.length,
    })
  }

  return results
}

/**
 * Returns total completions per day of week (0=Sun ... 6=Sat)
 * Used to identify best/worst days.
 */
export function getBestDaysOfWeek(
  habitId: string,
  completions: Completion[]
): { day: number; count: number }[] {
  const counts = Array(7).fill(0)
  completions
    .filter(c => c.habitId === habitId)
    .forEach(c => {
      const day = parseISO(c.date).getDay()
      counts[day]++
    })
  return counts.map((count, day) => ({ day, count }))
}
