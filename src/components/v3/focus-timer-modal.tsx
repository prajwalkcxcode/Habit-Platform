'use client'

import * as React from 'react'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { useHabitStore } from '@/lib/store/habits'
import { useV3Store } from '@/lib/store/v3'
import { useUIStore } from '@/lib/store/ui'
import { Play, Pause, RotateCcw, Clock, Sparkles } from 'lucide-react'

interface FocusTimerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FocusTimerModal({ open, onOpenChange }: FocusTimerModalProps) {
  const habits = useHabitStore(s => s.habits)
  const toggleCompletion = useHabitStore(s => s.toggleCompletion)
  const logFocusSession = useV3Store(s => s.logFocusSession)
  const showToast = useUIStore(s => s.showToast)

  const [selectedHabitId, setSelectedHabitId] = React.useState<string>('none')
  const [durationMinutes, setDurationMinutes] = React.useState<number>(25)
  const [secondsLeft, setSecondsLeft] = React.useState<number>(25 * 60)
  const [isActive, setIsActive] = React.useState(false)

  React.useEffect(() => {
    setSecondsLeft(durationMinutes * 60)
    setIsActive(false)
  }, [durationMinutes, open])

  React.useEffect(() => {
    let timer: any = null
    if (isActive && secondsLeft > 0) {
      timer = setInterval(() => setSecondsLeft(prev => prev - 1), 1000)
    } else if (secondsLeft === 0 && isActive) {
      setIsActive(false)
      handleComplete()
    }
    return () => clearInterval(timer)
  }, [isActive, secondsLeft])

  const handleComplete = async () => {
    const habitId = selectedHabitId === 'none' ? undefined : selectedHabitId
    await logFocusSession(habitId, durationMinutes)
    if (habitId) {
      toggleCompletion(habitId)
    }
    showToast(`Completed ${durationMinutes}m Focus Session! (+50 XP)`, 'success')
    onOpenChange(false)
  }

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-md">
        <ModalHeader>
          <ModalTitle className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[var(--accent)]" /> Focus Session Timer
          </ModalTitle>
        </ModalHeader>

        <div className="p-6 text-center space-y-6">
          {/* Linked Habit & Duration Selectors */}
          <div className="grid grid-cols-2 gap-3 text-left">
            <div>
              <Label className="mb-1 block">Link Habit</Label>
              <Select value={selectedHabitId} onValueChange={setSelectedHabitId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (General Focus)</SelectItem>
                  {habits.filter(h => h.status === 'active').map(h => (
                    <SelectItem key={h.id} value={h.id}>{h.icon} {h.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1 block">Duration</Label>
              <Select value={String(durationMinutes)} onValueChange={v => setDurationMinutes(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 Minutes</SelectItem>
                  <SelectItem value="25">25 Minutes (Pomodoro)</SelectItem>
                  <SelectItem value="45">45 Minutes</SelectItem>
                  <SelectItem value="60">60 Minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Big Timer */}
          <div className="py-4">
            <p className="text-5xl font-mono font-bold text-[var(--text-primary)] tracking-tight tabular-nums">
              {formatTimer(secondsLeft)}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3">
            <Button size="lg" onClick={() => setIsActive(!isActive)}>
              {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              {isActive ? 'Pause' : 'Start Focus'}
            </Button>
            <Button variant="secondary" size="lg" onClick={() => { setIsActive(false); setSecondsLeft(durationMinutes * 60); }}>
              <RotateCcw className="w-4 h-4" /> Reset
            </Button>
          </div>
        </div>

        <ModalFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
