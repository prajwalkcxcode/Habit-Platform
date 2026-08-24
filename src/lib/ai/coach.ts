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
      description: `You complete ${Math.round((morningCompletions / totalTimeCompletions) * 100)}% of your habits before 12 PM.`,
      explanation: `Based on ${morningCompletions} morning check-ins out of ${totalTimeCompletions} total completions.`,
    })
  } else if (eveningCompletions / totalTimeCompletions > 0.5) {
    insights.push({
      id: 'ai-evening-trend',
      type: 'trend',
      title: 'Evening Consistency Peak',
      description: `Your highest completion rate occurs in the evening (${Math.round((eveningCompletions / totalTimeCompletions) * 100)}%).`,
      explanation: `Based on ${eveningCompletions} evening check-ins out of ${totalTimeCompletions} total completions.`,
    })
  }

  // 2. Schedule Optimization & Recovery Suggestion
  activeHabits.forEach(h => {
    const habitCompletions = completions.filter(c => c.habitId === h.id)
    if (habitCompletions.length >= 3 && h.preferredTime === 'anytime') {
      insights.push({
        id: `ai-sched-${h.id}`,
        type: 'schedule',
        title: `Schedule Optimization for ${h.name}`,
        description: `Consider anchoring "${h.name}" to Morning for higher consistency.`,
        explanation: `Based on ${habitCompletions.length} recorded completions.`,
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
      description: `Attach "${weakerHabit.name}" immediately after "${strongHabit.name}".`,
      explanation: `Stacking a new behavior onto an established anchor habit increases success rate by ~3x.`,
    })
  }

  return insights.slice(0, 3)
}
