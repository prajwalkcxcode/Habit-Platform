// ─── User Identity ────────────────────────────────────────────────
export interface UserProfile {
  username: string
  avatarEmoji: string
  bio: string
  shareCode: string  // unique 6-char code for partnering
  joinedAt: string   // ISO date
}

// ─── Accountability Partner ───────────────────────────────────────
export interface Partner {
  id: string
  username: string
  avatarEmoji: string
  shareCode: string
  addedAt: string
  // Simulated local-only partner state (real sync needs Supabase)
  lastCheckedInDate: string | null
  nudgeSentToday: boolean
}

// ─── Shared Challenge Room ────────────────────────────────────────
export type ChallengeDuration = 7 | 14 | 30 | 60

export interface ChallengeRoom {
  id: string
  code: string           // 6-char alphanumeric join code
  title: string
  description?: string
  creatorUsername: string
  targetDays: ChallengeDuration
  habitNames: string[]   // just names — portable across users
  startDate: string
  endDate: string
  participants: ChallengeParticipant[]
  status: 'active' | 'completed' | 'expired'
}

export interface ChallengeParticipant {
  username: string
  avatarEmoji: string
  completedDays: number
  joinedAt: string
  isOwner: boolean
}

// ─── Streak Bet (Self-Commitment) ─────────────────────────────────
export interface StreakBet {
  id: string
  habitId: string
  targetStreak: number
  xpStake: number
  startDate: string
  status: 'active' | 'won' | 'lost'
  resolvedAt?: string
}

// ─── Weekly Win Card ──────────────────────────────────────────────
export interface WeeklyWinSummary {
  weekOf: string        // YYYY-MM-DD (Monday of the week)
  completed: number
  total: number
  consistencyPct: number
  topHabitName: string
  topHabitStreak: number
  xpEarned: number
}
