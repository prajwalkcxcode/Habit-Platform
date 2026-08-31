'use client'

import * as React from 'react'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { useHabitStore } from '@/lib/store/habits'
import { useProfileStore } from '@/lib/store/profile'
import { useV3Store } from '@/lib/store/v3'
import { useUIStore } from '@/lib/store/ui'
import { formatFullDate, toDateString } from '@/lib/utils/date'
import { startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns'
import { Receipt, Check, Copy, Sparkles } from 'lucide-react'

interface WeeklyReceiptModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WeeklyReceiptModal({ open, onOpenChange }: WeeklyReceiptModalProps) {
  const habits = useHabitStore(s => s.habits)
  const completions = useHabitStore(s => s.completions)
  const getStats = useHabitStore(s => s.getStats)
  const profile = useProfileStore(s => s.profile)
  const userXP = useV3Store(s => s.userXP)
  const xp = userXP.xp
  const level = userXP.level
  const showToast = useUIStore(s => s.showToast)
  const [copied, setCopied] = React.useState(false)

  const activeHabits = habits.filter(h => h.status === 'active')

  const now = new Date()
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })
  const weekDateStrings = weekDays.map(d => toDateString(d))

  const weekCompletions = completions.filter(c => weekDateStrings.includes(c.date))
  const totalWeeklyChecks = weekCompletions.length

  const maxStreak = Math.max(0, ...activeHabits.map(h => getStats(h.id).currentStreak))

  const handleCopyText = () => {
    let receiptText = `================================
`
    receiptText += `      HABIT PLATFORM RECEIPT     
`
    receiptText += `================================
`
    receiptText += `Date: ${formatFullDate(now)}
`
    receiptText += `User: ${profile.username || 'User'} (Lvl ${level})
`
    receiptText += `--------------------------------
`
    activeHabits.forEach(h => {
      const habitWeekChecks = weekCompletions.filter(c => c.habitId === h.id).length
      receiptText += `${h.name.padEnd(20, ' ')} : ${habitWeekChecks}/7 days\n`
    })
    receiptText += `--------------------------------
`
    receiptText += `TOTAL CHECK-INS : ${totalWeeklyChecks}
`
    receiptText += `MAX STREAK      : ${maxStreak} DAYS
`
    receiptText += `TOTAL XP        : ${xp} XP (Level ${level})
`
    receiptText += `================================
`
    receiptText += `   KEEP BUILDING CONSISTENCY    
`
    receiptText += `================================`

    navigator.clipboard.writeText(receiptText)
    setCopied(true)
    showToast('Receipt copied to clipboard! 📋', 'success')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-sm font-mono text-xs">
        <ModalHeader className="border-b-0 pb-0">
          <ModalTitle className="font-mono text-center tracking-widest text-xs flex items-center justify-center gap-1.5 uppercase">
            <Receipt className="w-4 h-4 text-[var(--accent)]" /> Consistency Receipt
          </ModalTitle>
        </ModalHeader>

        <div className="p-4 space-y-3 bg-[var(--bg-elevated)] border border-dashed border-[var(--border)] rounded-lg m-4 shadow-inner">
          <div className="text-center space-y-0.5 border-b border-dashed border-[var(--border)] pb-2.5">
            <p className="font-bold text-sm tracking-tight text-[var(--text-primary)]">HABIT PLATFORM</p>
            <p className="text-[10px] text-[var(--text-tertiary)]">{formatFullDate(now)}</p>
            <p className="text-[10px] text-[var(--text-secondary)] font-semibold">
              MEMBER: {profile.username || 'Prajwal'} • LEVEL {level} ({xp} XP)
            </p>
          </div>

          {/* Itemized list */}
          <div className="space-y-1 py-1 max-h-48 overflow-y-auto pr-1">
            {activeHabits.map(h => {
              const count = weekCompletions.filter(c => c.habitId === h.id).length
              return (
                <div key={h.id} className="flex justify-between items-center text-[11px] text-[var(--text-secondary)]">
                  <span className="truncate max-w-[170px] flex items-center gap-1">
                    <span>{h.icon}</span> {h.name}
                  </span>
                  <span className="font-bold tabular-nums text-[var(--text-primary)]">
                    {count}/7d
                  </span>
                </div>
              )
            })}
          </div>

          {/* Totals */}
          <div className="border-t border-dashed border-[var(--border)] pt-2.5 space-y-1 text-[11px]">
            <div className="flex justify-between font-medium">
              <span className="text-[var(--text-tertiary)]">WEEK CHECK-INS</span>
              <span className="font-bold text-[var(--text-primary)] tabular-nums">{totalWeeklyChecks}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span className="text-[var(--text-tertiary)]">ACTIVE STREAK</span>
              <span className="font-bold text-orange-500 tabular-nums">🔥 {maxStreak} DAYS</span>
            </div>
            <div className="flex justify-between font-medium">
              <span className="text-[var(--text-tertiary)]">XP REWARD</span>
              <span className="font-bold text-[var(--accent)] tabular-nums">+{totalWeeklyChecks * 10} XP</span>
            </div>
          </div>

          <div className="border-t border-dashed border-[var(--border)] pt-2 text-center text-[9px] text-[var(--text-tertiary)] uppercase tracking-wider">
            *** PROOF OF EFFORT ***
          </div>
        </div>

        <ModalFooter className="border-t border-[var(--border)] px-4 py-3 flex justify-between gap-2">
          <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button size="sm" onClick={handleCopyText}>
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy Receipt'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
