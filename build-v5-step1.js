const fs = require('fs');
const path = require('path');

function writeFile(relPath, content) {
  const fullPath = path.join(__dirname, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Wrote ' + relPath);
}

// ─────────────────────────────────────────────────────────────────
// 1. V5 Types
// ─────────────────────────────────────────────────────────────────
writeFile('src/lib/types/v5.ts', `
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
`);

// ─────────────────────────────────────────────────────────────────
// 2. Nanoid util (needed for share code generation)
// ─────────────────────────────────────────────────────────────────
// Check if it already exists
try {
  fs.readFileSync('src/lib/utils/id.ts');
  console.log('id.ts already exists — skipping');
} catch {
  writeFile('src/lib/utils/id.ts', `
export function nanoid(size = 21): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let id = ''
  const array = new Uint8Array(size)
  if (typeof crypto !== 'undefined') {
    crypto.getRandomValues(array)
  } else {
    for (let i = 0; i < size; i++) array[i] = Math.floor(Math.random() * 256)
  }
  for (let i = 0; i < size; i++) {
    id += chars[array[i] % chars.length]
  }
  return id
}

export function shortCode(length = 6): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  const array = new Uint8Array(length)
  if (typeof crypto !== 'undefined') {
    crypto.getRandomValues(array)
  } else {
    for (let i = 0; i < length; i++) array[i] = Math.floor(Math.random() * 256)
  }
  for (let i = 0; i < length; i++) {
    code += chars[array[i] % chars.length]
  }
  return code
}
`);
}

// Add shortCode to existing id.ts if it doesn't have it
const idContent = fs.readFileSync('src/lib/utils/id.ts', 'utf8');
if (!idContent.includes('shortCode')) {
  fs.writeFileSync('src/lib/utils/id.ts', idContent.trimEnd() + `

export function shortCode(length = 6): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  const array = new Uint8Array(length)
  if (typeof crypto !== 'undefined') {
    crypto.getRandomValues(array)
  } else {
    for (let i = 0; i < length; i++) array[i] = Math.floor(Math.random() * 256)
  }
  for (let i = 0; i < length; i++) {
    code += chars[array[i] % chars.length]
  }
  return code
}
` + '\n', 'utf8');
  console.log('Added shortCode to id.ts');
}

console.log('V5 types written');
