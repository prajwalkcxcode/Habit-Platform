'use client'

import * as React from 'react'
import { Zap, Trophy, X, Plus } from 'lucide-react'
import { useProfileStore } from '@/lib/store/profile'
import { useHabitStore } from '@/lib/store/habits'
import { useV3Store } from '@/lib/store/v3'
import { useUIStore } from '@/lib/store/ui'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { toDateString } from '@/lib/utils/date'

export function StreakBets() {
  const bets = useProfileStore(s => s.bets)
  const addBet = useProfileStore(s => s.addBet)
  const resolveBet = useProfileStore(s => s.resolveBet)
  const habits = useHabitStore(s => s.habits)
  const getStats = useHabitStore(s => s.getStats)
  const userXP = useV3Store(s => s.userXP)
  const showToast = useUIStore(s => s.showToast)

  const [creating, setCreating] = React.useState(false)
  const [selectedHabitId, setSelectedHabitId] = React.useState('')
  const [targetStreak, setTargetStreak] = React.useState(7)
  const [xpStake, setXpStake] = React.useState(50)

  const activeBets = bets.filter(b => b.status === 'active')
  const resolvedBets = bets.filter(b => b.status !== 'active')

  const handleCreateBet = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedHabitId) return
    addBet({
      habitId: selectedHabitId,
      targetStreak,
      xpStake,
      startDate: toDateString(new Date()),
    })
    showToast(`Streak bet placed! Reach ${targetStreak} days to win ${xpStake} XP.`, 'success')
    setCreating(false)
  }

  const handleResolve = (betId: string, won: boolean, habitName: string) => {
    resolveBet(betId, won)
    showToast(won ? `Bet won! +${bets.find(b=>b.id===betId)?.xpStake} XP` : `Bet lost. Try again!`, won ? 'success' : 'error')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Streak Bets</h3>
        <Button size="sm" variant="secondary" onClick={() => setCreating(!creating)}>
          <Plus className="w-3.5 h-3.5" /> Place Bet
        </Button>
      </div>

      {creating && (
        <form onSubmit={handleCreateBet} className="p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-3">
              <Label className="mb-1 block text-xs">Habit</Label>
              <Select value={selectedHabitId} onValueChange={setSelectedHabitId} required>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select habit..." /></SelectTrigger>
                <SelectContent>
                  {habits.filter(h => h.status === 'active').map(h => (
                    <SelectItem key={h.id} value={h.id}>{h.icon} {h.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1 block text-xs">Streak target</Label>
              <Select value={String(targetStreak)} onValueChange={v => setTargetStreak(Number(v))}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[3, 7, 14, 21, 30].map(d => <SelectItem key={d} value={String(d)}>{d} days</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1 block text-xs">XP stake</Label>
              <Select value={String(xpStake)} onValueChange={v => setXpStake(Number(v))}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[25, 50, 100, 200].map(x => <SelectItem key={x} value={String(x)}>{x} XP</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button type="submit" size="sm" className="w-full h-8">Bet</Button>
            </div>
          </div>
        </form>
      )}

      {activeBets.length === 0 && !creating && (
        <p className="text-xs text-[var(--text-tertiary)] text-center py-4">
          No active bets. Place a streak bet to create real commitment.
        </p>
      )}

      {activeBets.map(bet => {
        const habit = habits.find(h => h.id === bet.habitId)
        const stats = habit ? getStats(habit.id) : null
        const progress = stats ? Math.min(stats.currentStreak, bet.targetStreak) : 0
        const won = progress >= bet.targetStreak
        return (
          <div key={bet.id} className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border)] bg-[var(--bg-base)]">
            <Zap className="w-4 h-4 text-yellow-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[var(--text-primary)] truncate">{habit?.name ?? 'Unknown habit'}</p>
              <p className="text-[10px] text-[var(--text-tertiary)]">
                {progress}/{bet.targetStreak} days · {bet.xpStake} XP at stake
              </p>
            </div>
            {won ? (
              <Button size="sm" className="h-7 text-xs bg-green-500 hover:bg-green-600" onClick={() => handleResolve(bet.id, true, habit?.name ?? '')}>
                <Trophy className="w-3 h-3" /> Claim!
              </Button>
            ) : (
              <Button size="sm" variant="secondary" className="h-7 text-xs text-red-500" onClick={() => handleResolve(bet.id, false, habit?.name ?? '')}>
                <X className="w-3 h-3" /> Forfeit
              </Button>
            )}
          </div>
        )
      })}
    </div>
  )
}
