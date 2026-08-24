import type { Habit, Completion } from '@/lib/types'
import type { WeeklyWinSummary } from '@/lib/types/v5'
import { startOfWeek, endOfWeek, eachDayOfInterval, parseISO, format } from 'date-fns'
import { isHabitScheduledOnDate } from '@/lib/habits/schedule'
import { toDateString } from '@/lib/utils/date'

export function computeWeeklySummary(
  habits: Habit[],
  completions: Completion[],
  weekStartsOn: 0 | 1 = 1,
  referenceDate: Date = new Date()
): WeeklyWinSummary {
  const start = startOfWeek(referenceDate, { weekStartsOn })
  const end = endOfWeek(referenceDate, { weekStartsOn })
  const days = eachDayOfInterval({ start, end })

  const activeHabits = habits.filter(h => h.status === 'active')

  let totalScheduled = 0
  let totalCompleted = 0

  days.forEach(day => {
    const dateStr = toDateString(day)
    const scheduled = activeHabits.filter(h => isHabitScheduledOnDate(h, day))
    totalScheduled += scheduled.length
    totalCompleted += scheduled.filter(h =>
      completions.some(c => c.habitId === h.id && c.date === dateStr)
    ).length
  })

  const pct = totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0

  // Find top habit (most completions this week)
  const habitCompletionCounts = activeHabits.map(h => {
    const count = days.filter(day => {
      const dateStr = toDateString(day)
      return completions.some(c => c.habitId === h.id && c.date === dateStr)
    }).length
    return { habit: h, count }
  })
  habitCompletionCounts.sort((a, b) => b.count - a.count)
  const top = habitCompletionCounts[0]

  return {
    weekOf: toDateString(start),
    completed: totalCompleted,
    total: totalScheduled,
    consistencyPct: pct,
    topHabitName: top?.habit.name ?? '',
    topHabitStreak: top?.count ?? 0,
    xpEarned: totalCompleted * 10,
  }
}
