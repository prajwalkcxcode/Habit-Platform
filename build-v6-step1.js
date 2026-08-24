const fs = require('fs');
const path = require('path');

function writeFile(relPath, content) {
  const fullPath = path.join(__dirname, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Wrote ' + relPath);
}

// ─── V6 Types ────────────────────────────────────────────────────
writeFile('src/lib/types/v6.ts', `
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
`);

// ─── Review computation engine ────────────────────────────────────
writeFile('src/lib/reviews/engine.ts', `
import type { Habit, Completion } from '@/lib/types'
import type { WeeklyReview, MonthlyReview, YearReview, HabitCorrelation, SmartReminder } from '@/lib/types/v6'
import { isHabitScheduledOnDate } from '@/lib/habits/schedule'
import { toDateString } from '@/lib/utils/date'
import {
  startOfWeek, endOfWeek, startOfMonth, endOfMonth,
  startOfYear, endOfYear,
  eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval,
  parseISO, format, getHours, getDay,
} from 'date-fns'
import { nanoid } from '@/lib/utils/id'

// ─── Weekly Review ────────────────────────────────────────────────
export function generateWeeklyReview(
  habits: Habit[],
  completions: Completion[],
  weekStartsOn: 0 | 1 = 1,
  date: Date = new Date()
): WeeklyReview {
  const start = startOfWeek(date, { weekStartsOn })
  const end = endOfWeek(date, { weekStartsOn })
  const days = eachDayOfInterval({ start, end })
  const active = habits.filter(h => h.status === 'active')

  let totalScheduled = 0
  let totalCompleted = 0
  const habitCompletion: Record<string, number> = {}

  active.forEach(h => { habitCompletion[h.id] = 0 })

  days.forEach(day => {
    const dateStr = toDateString(day)
    active.forEach(h => {
      if (!isHabitScheduledOnDate(h, day)) return
      totalScheduled++
      if (completions.some(c => c.habitId === h.id && c.date === dateStr)) {
        totalCompleted++
        habitCompletion[h.id]++
      }
    })
  })

  const sorted = Object.entries(habitCompletion).sort((a, b) => b[1] - a[1])
  const topEntry = sorted[0]
  const topHabit = topEntry ? active.find(h => h.id === topEntry[0]) : undefined

  const missedHabitIds = sorted
    .filter(([, count]) => count === 0)
    .map(([id]) => id)

  const pct = totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0

  return {
    id: nanoid(),
    weekOf: toDateString(start),
    completed: totalCompleted,
    total: totalScheduled,
    consistencyPct: pct,
    topHabitId: topHabit?.id ?? '',
    topHabitName: topHabit?.name ?? '',
    topHabitStreak: topEntry?.[1] ?? 0,
    missedHabitIds,
    xpEarned: totalCompleted * 10,
    generatedAt: new Date().toISOString(),
  }
}

// ─── Monthly Review ────────────────────────────────────────────────
export function generateMonthlyReview(
  habits: Habit[],
  completions: Completion[],
  weekStartsOn: 0 | 1 = 1,
  date: Date = new Date()
): MonthlyReview {
  const start = startOfMonth(date)
  const end = endOfMonth(date)
  const days = eachDayOfInterval({ start, end })
  const active = habits.filter(h => h.status === 'active')

  let totalScheduled = 0
  let totalCompleted = 0

  days.forEach(day => {
    const dateStr = toDateString(day)
    active.forEach(h => {
      if (!isHabitScheduledOnDate(h, day)) return
      totalScheduled++
      if (completions.some(c => c.habitId === h.id && c.date === dateStr)) {
        totalCompleted++
      }
    })
  })

  // Week breakdown for best/worst
  const weeks = eachWeekOfInterval({ start, end }, { weekStartsOn })
  const weeklyPcts: number[] = weeks.map(weekStart => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn })
    const wDays = eachDayOfInterval({ start: weekStart, end: weekEnd })
    let wScheduled = 0; let wCompleted = 0
    wDays.forEach(day => {
      const dateStr = toDateString(day)
      active.forEach(h => {
        if (!isHabitScheduledOnDate(h, day)) return
        wScheduled++
        if (completions.some(c => c.habitId === h.id && c.date === dateStr)) wCompleted++
      })
    })
    return wScheduled > 0 ? Math.round((wCompleted / wScheduled) * 100) : 0
  })

  // Longest streak in the month
  const habitStreakMap: Record<string, number> = {}
  active.forEach(h => {
    let streak = 0; let maxStreak = 0
    days.forEach(day => {
      const dateStr = toDateString(day)
      if (isHabitScheduledOnDate(h, day)) {
        if (completions.some(c => c.habitId === h.id && c.date === dateStr)) {
          streak++; maxStreak = Math.max(maxStreak, streak)
        } else {
          streak = 0
        }
      }
    })
    habitStreakMap[h.id] = maxStreak
  })
  const topStreakEntry = Object.entries(habitStreakMap).sort((a, b) => b[1] - a[1])[0]
  const topStreakHabit = topStreakEntry ? active.find(h => h.id === topStreakEntry[0]) : undefined

  const pct = totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0

  return {
    id: nanoid(),
    monthOf: format(date, 'yyyy-MM'),
    totalCompleted,
    totalScheduled,
    consistencyPct: pct,
    bestWeekPct: weeklyPcts.length > 0 ? Math.max(...weeklyPcts) : 0,
    worstWeekPct: weeklyPcts.length > 0 ? Math.min(...weeklyPcts) : 0,
    longestStreakHabitName: topStreakHabit?.name ?? '',
    longestStreak: topStreakEntry?.[1] ?? 0,
    totalXpEarned: totalCompleted * 10,
    generatedAt: new Date().toISOString(),
  }
}

// ─── Year in Review ────────────────────────────────────────────────
export function generateYearReview(
  habits: Habit[],
  completions: Completion[],
  year: number = new Date().getFullYear()
): YearReview {
  const start = startOfYear(new Date(year, 0, 1))
  const end = endOfYear(new Date(year, 0, 1))
  const days = eachDayOfInterval({ start, end })
  const active = habits.filter(h => h.status === 'active')

  let totalScheduled = 0
  let totalCompleted = 0

  days.forEach(day => {
    const dateStr = toDateString(day)
    active.forEach(h => {
      if (!isHabitScheduledOnDate(h, day)) return
      totalScheduled++
      if (completions.some(c => c.habitId === h.id && c.date === dateStr)) totalCompleted++
    })
  })

  // Monthly breakdown
  const months = eachMonthOfInterval({ start, end })
  const monthlyBreakdown = months.map(month => {
    const mStart = startOfMonth(month)
    const mEnd = endOfMonth(month)
    const mDays = eachDayOfInterval({ start: mStart, end: mEnd })
    let mScheduled = 0; let mCompleted = 0
    mDays.forEach(day => {
      const dateStr = toDateString(day)
      active.forEach(h => {
        if (!isHabitScheduledOnDate(h, day)) return
        mScheduled++
        if (completions.some(c => c.habitId === h.id && c.date === dateStr)) mCompleted++
      })
    })
    return {
      month: format(month, 'MMM'),
      pct: mScheduled > 0 ? Math.round((mCompleted / mScheduled) * 100) : 0,
    }
  })

  // Overall best streak
  let longestStreak = 0
  let longestStreakHabitName = ''
  active.forEach(h => {
    let streak = 0; let maxStreak = 0
    days.forEach(day => {
      const dateStr = toDateString(day)
      if (isHabitScheduledOnDate(h, day)) {
        if (completions.some(c => c.habitId === h.id && c.date === dateStr)) {
          streak++; maxStreak = Math.max(maxStreak, streak)
        } else { streak = 0 }
      }
    })
    if (maxStreak > longestStreak) {
      longestStreak = maxStreak
      longestStreakHabitName = h.name
    }
  })

  const pct = totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0

  return {
    year,
    totalCompleted,
    totalScheduled,
    consistencyPct: pct,
    longestStreak,
    longestStreakHabitName,
    totalFocusMinutes: 0, // populated from focusLogs if available
    totalXpEarned: totalCompleted * 10,
    monthlyBreakdown,
    generatedAt: new Date().toISOString(),
  }
}

// ─── Habit Correlations ────────────────────────────────────────────
export function computeHabitCorrelations(
  habits: Habit[],
  completions: Completion[],
  minSamples = 7
): HabitCorrelation[] {
  const active = habits.filter(h => h.status === 'active')
  if (active.length < 2) return []

  // Get all unique dates
  const dates = [...new Set(completions.map(c => c.date))].sort()
  if (dates.length < minSamples) return []

  const correlations: HabitCorrelation[] = []

  for (let i = 0; i < active.length; i++) {
    for (let j = i + 1; j < active.length; j++) {
      const hA = active[i]
      const hB = active[j]

      const setA = new Set(completions.filter(c => c.habitId === hA.id).map(c => c.date))
      const setB = new Set(completions.filter(c => c.habitId === hB.id).map(c => c.date))

      const both = dates.filter(d => setA.has(d) && setB.has(d)).length
      const sample = dates.length

      if (sample < minSamples) continue

      // Simple phi coefficient approximation
      const onlyA = dates.filter(d => setA.has(d) && !setB.has(d)).length
      const onlyB = dates.filter(d => !setA.has(d) && setB.has(d)).length
      const neither = dates.filter(d => !setA.has(d) && !setB.has(d)).length

      const denom = Math.sqrt((both + onlyA) * (both + onlyB) * (onlyA + neither) * (onlyB + neither))
      const phi = denom > 0 ? (both * neither - onlyA * onlyB) / denom : 0
      const correlation = Math.round(phi * 100) / 100

      if (Math.abs(correlation) >= 0.2) {
        const positive = correlation > 0
        correlations.push({
          habitAId: hA.id, habitAName: hA.name,
          habitBId: hB.id, habitBName: hB.name,
          correlation,
          description: positive
            ? \`When you do "\${hA.name}", you're \${Math.round(Math.abs(correlation)*100)}% more likely to do "\${hB.name}" the same day.\`
            : \`"\${hA.name}" and "\${hB.name}" rarely happen on the same day.\`,
          sampleSize: sample,
        })
      }
    }
  }

  return correlations.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation)).slice(0, 5)
}

// ─── Smart Reminders ────────────────────────────────────────────────
export function generateSmartReminders(
  habits: Habit[],
  completions: Completion[]
): SmartReminder[] {
  const active = habits.filter(h => h.status === 'active')
  const reminders: SmartReminder[] = []

  active.forEach(h => {
    const habitCompletions = completions.filter(c => c.habitId === h.id)
    if (habitCompletions.length < 5) return

    const hourCounts: Record<number, number> = {}
    habitCompletions.forEach(c => {
      const hour = getHours(parseISO(c.completedAt))
      hourCounts[hour] = (hourCounts[hour] || 0) + 1
    })

    const peakHour = Object.entries(hourCounts)
      .sort(([, a], [, b]) => b - a)[0]

    if (!peakHour) return

    const hour = Number(peakHour[0])
    const timeLabel = hour < 12
      ? \`\${hour === 0 ? 12 : hour}:00 AM\`
      : \`\${hour === 12 ? 12 : hour - 12}:00 PM\`

    reminders.push({
      id: \`reminder-\${h.id}\`,
      habitId: h.id,
      habitName: h.name,
      suggestedTime: \`\${String(hour).padStart(2, '0')}:00\`,
      basis: \`You typically complete this around \${timeLabel} based on \${habitCompletions.length} check-ins.\`,
      enabled: false,
    })
  })

  return reminders
}
`);

console.log('V6 types and review engine written');
