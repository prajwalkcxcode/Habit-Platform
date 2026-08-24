'use client'

import * as React from 'react'
import { Trophy, Shield, Flame, Plus, CheckCircle2, Award } from 'lucide-react'
import { useV3Store } from '@/lib/store/v3'
import { useUIStore } from '@/lib/store/ui'
import { Button } from '@/components/ui/button'
import { ProgressBar } from '@/components/ui/progress-bar'
import { EmptyState } from '@/components/ui/empty-state'
import { toDateString } from '@/lib/utils/date'

export default function ChallengesPage() {
  const userXP = useV3Store(s => s.userXP)
  const challenges = useV3Store(s => s.challenges)
  const loadAll = useV3Store(s => s.loadAll)
  const initialized = useV3Store(s => s.initialized)
  const createChallenge = useV3Store(s => s.createChallenge)
  const useStreakFreeze = useV3Store(s => s.useStreakFreeze)
  const showToast = useUIStore(s => s.showToast)

  React.useEffect(() => {
    if (!initialized) loadAll()
  }, [initialized, loadAll])

  const handleCreateDefaultChallenge = async () => {
    const today = new Date()
    const endDate = new Date(today)
    endDate.setDate(endDate.getDate() + 7)

    await createChallenge({
      title: '7-Day Reading & Focus Challenge',
      description: 'Complete linked habits every day for 7 consecutive days.',
      targetDays: 7,
      habitIds: [],
      startDate: toDateString(today),
      endDate: toDateString(endDate),
    })
    showToast('Created 7-Day Challenge', 'success')
  }

  const handleUseFreeze = async () => {
    const todayStr = toDateString(new Date())
    const ok = await useStreakFreeze(todayStr)
    if (ok) {
      showToast('Streak Freeze applied for today!', 'success')
    } else {
      showToast('No streak freezes remaining for this month.', 'error')
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:px-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Challenges & Milestones</h1>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
            Earn XP, track streak freezes, and take on personal consistency challenges.
          </p>
        </div>
        <Button size="sm" onClick={handleCreateDefaultChallenge}>
          <Plus className="w-4 h-4" /> Start 7-Day Challenge
        </Button>
      </div>

      {/* Level & XP Header Card */}
      <div className="p-5 rounded-lg border border-[var(--border)] bg-[var(--bg-base)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--accent)] text-white flex items-center justify-center font-bold text-base">
              L{userXP.level}
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--text-primary)]">Consistency Level {userXP.level}</h2>
              <p className="text-xs text-[var(--text-tertiary)]">{userXP.xp} total XP earned</p>
            </div>
          </div>

          {/* Freeze Shield */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[var(--bg-elevated)] border border-[var(--border)] text-xs">
              <Shield className="w-4 h-4 text-blue-500" />
              <span>{userXP.freezesRemaining} Freezes Available</span>
            </div>
            <Button size="sm" variant="secondary" onClick={handleUseFreeze}>Use Freeze</Button>
          </div>
        </div>

        <ProgressBar value={(userXP.xp % 200) / 2} showLabel />
      </div>

      {/* Challenges List */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">Active Personal Challenges</h2>
        {challenges.length === 0 ? (
          <EmptyState
            icon={<Trophy className="w-8 h-8" />}
            title="No active challenges"
            description="Start a 7-day or 30-day challenge to build momentum."
            action={<Button size="sm" onClick={handleCreateDefaultChallenge}>Start 7-Day Challenge</Button>}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {challenges.map(ch => (
              <div key={ch.id} className="p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-base)] space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[var(--text-primary)]">{ch.title}</h3>
                    <p className="text-xs text-[var(--text-tertiary)]">{ch.description}</p>
                  </div>
                  <Award className="w-5 h-5 text-[var(--accent)]" />
                </div>
                <ProgressBar value={Math.round((ch.progressDays / ch.targetDays) * 100)} showLabel />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
