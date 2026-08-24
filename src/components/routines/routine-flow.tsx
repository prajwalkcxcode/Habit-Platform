'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Play, Pause, CheckCircle2, SkipForward, ArrowLeft, Clock, Sparkles } from 'lucide-react'
import type { Routine } from '@/lib/types/v2'
import { useHabitStore } from '@/lib/store/habits'
import { useRoutinesStore } from '@/lib/store/routines'
import { useUIStore } from '@/lib/store/ui'
import { Button } from '@/components/ui/button'
import { ProgressBar } from '@/components/ui/progress-bar'

interface RoutineFlowProps {
  routine: Routine
}

export function RoutineFlow({ routine }: RoutineFlowProps) {
  const router = useRouter()
  const habits = useHabitStore(s => s.habits)
  const toggleCompletion = useHabitStore(s => s.toggleCompletion)

  const activeStepIndex = useRoutinesStore(s => s.activeStepIndex)
  const isFlowPaused = useRoutinesStore(s => s.isFlowPaused)
  const startFlow = useRoutinesStore(s => s.startFlow)
  const pauseFlow = useRoutinesStore(s => s.pauseFlow)
  const resumeFlow = useRoutinesStore(s => s.resumeFlow)
  const completeFlowStep = useRoutinesStore(s => s.completeFlowStep)
  const skipFlowStep = useRoutinesStore(s => s.skipFlowStep)
  const finishFlow = useRoutinesStore(s => s.finishFlow)
  const cancelFlow = useRoutinesStore(s => s.cancelFlow)
  const showToast = useUIStore(s => s.showToast)

  const [secondsElapsed, setSecondsElapsed] = React.useState(0)

  // Start flow on mount
  React.useEffect(() => {
    startFlow(routine.id)
    return () => cancelFlow()
  }, [routine.id])

  // Timer interval
  React.useEffect(() => {
    if (isFlowPaused) return
    const timer = setInterval(() => {
      setSecondsElapsed(prev => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [isFlowPaused])

  const orderedItems = React.useMemo(() => routine.items.sort((a, b) => a.order - b.order), [routine.items])
  const currentItem = orderedItems[activeStepIndex]
  const currentHabit = currentItem ? habits.find(h => h.id === currentItem.habitId) : null

  const isFinished = activeStepIndex >= orderedItems.length

  const handleStepComplete = () => {
    if (!currentItem || !currentHabit) return
    toggleCompletion(currentHabit.id)
    completeFlowStep(currentItem.id)
  }

  const handleStepSkip = () => {
    if (!currentItem) return
    skipFlowStep(currentItem.id)
  }

  const handleFinishAll = async () => {
    await finishFlow()
    showToast(`Routine "${routine.name}" completed!`, 'success')
    router.push('/routines')
  }

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const progressPct = orderedItems.length > 0 ? Math.round((activeStepIndex / orderedItems.length) * 100) : 0

  if (isFinished) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex flex-col items-center justify-center p-6 text-center space-y-6 animate-in fade-in-0">
        <div className="w-16 h-16 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center">
          <Sparkles className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Routine Completed!</h1>
          <p className="text-sm text-[var(--text-secondary)]">Great work staying consistent with {routine.name}.</p>
        </div>
        <div className="p-4 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] min-w-[200px] text-xs space-y-1">
          <p className="text-[var(--text-tertiary)]">Total Duration</p>
          <p className="text-xl font-mono font-bold text-[var(--text-primary)]">{formatTimer(secondsElapsed)}</p>
        </div>
        <Button onClick={handleFinishAll}>Return to Routines</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex flex-col justify-between p-6 max-w-xl mx-auto space-y-8 animate-in fade-in-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => { cancelFlow(); router.push('/routines'); }} className="flex items-center gap-1 text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
          <ArrowLeft className="w-4 h-4" /> Exit Flow Mode
        </button>

        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[var(--text-tertiary)]" />
          <span className="font-mono text-sm font-bold tabular-nums text-[var(--text-primary)]">{formatTimer(secondsElapsed)}</span>
        </div>
      </div>

      {/* Routine Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-[var(--text-tertiary)]">
          <span>{routine.name}</span>
          <span>Step {activeStepIndex + 1} of {orderedItems.length}</span>
        </div>
        <ProgressBar value={progressPct} />
      </div>

      {/* Center Active Step */}
      <div className="py-10 text-center space-y-4">
        <div className="text-6xl animate-bounce">{currentHabit?.icon ?? '🎯'}</div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">{currentHabit?.name ?? 'Habit Step'}</h2>
        {currentHabit?.description && (
          <p className="text-sm text-[var(--text-tertiary)] max-w-sm mx-auto">{currentHabit.description}</p>
        )}
      </div>

      {/* Action Player Controls */}
      <div className="space-y-3 pb-8">
        <div className="flex items-center gap-3">
          <Button size="lg" className="flex-1" onClick={handleStepComplete}>
            <CheckCircle2 className="w-5 h-5" /> Complete Step
          </Button>
          <Button size="lg" variant="secondary" onClick={handleStepSkip}>
            <SkipForward className="w-4 h-4" /> Skip
          </Button>
        </div>

        <div className="flex justify-center">
          <button onClick={() => isFlowPaused ? resumeFlow() : pauseFlow()} className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)] flex items-center gap-1">
            {isFlowPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            {isFlowPaused ? 'Resume Timer' : 'Pause Timer'}
          </button>
        </div>
      </div>
    </div>
  )
}
