import { getDay, parseISO } from 'date-fns'
import type { Habit, HabitFrequency, DayOfWeek } from '@/lib/types'
import { toDateString } from '@/lib/utils/date'

/**
 * Returns true if the habit is scheduled on the given date.
 */
export function isHabitScheduledOnDate(habit: Habit, date: Date): boolean {
  // Habit must have been created on or before this date
  const createdDate = parseISO(habit.createdAt)
  const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const normalizedCreated = new Date(createdDate.getFullYear(), createdDate.getMonth(), createdDate.getDate())
  if (normalizedDate < normalizedCreated) return false

  return isFrequencyScheduledOnDate(habit.frequency, date)
}

export function isFrequencyScheduledOnDate(frequency: HabitFrequency, date: Date): boolean {
  const dayOfWeek = getDay(date) as DayOfWeek // 0=Sun, 6=Sat

  switch (frequency.type) {
    case 'daily':
      return true

    case 'weekdays':
      return dayOfWeek >= 1 && dayOfWeek <= 5

    case 'weekends':
      return dayOfWeek === 0 || dayOfWeek === 6

    case 'specific_days':
      return (frequency.days ?? []).includes(dayOfWeek)

    case 'custom':
      // Custom = N times per week; we can't know which specific days,
      // so treat it as daily for scheduling purposes and let the user decide.
      return true

    default:
      return true
  }
}

/**
 * Returns all dates (as YYYY-MM-DD strings) from habit creation to today
 * on which the habit was scheduled.
 */
export function getScheduledDates(habit: Habit, upTo: Date = new Date()): string[] {
  const { eachDayOfInterval, parseISO } = require('date-fns') // dynamic to avoid circular
  const start = parseISO(habit.createdAt)
  const end = new Date(upTo.getFullYear(), upTo.getMonth(), upTo.getDate())
  if (start > end) return []

  const allDays = eachDayOfInterval({ start, end }) as Date[]
  return allDays
    .filter(d => isHabitScheduledOnDate(habit, d))
    .map(d => toDateString(d))
}
