const fs = require('fs');
const path = require('path');

function writeFile(relPath, content) {
  const fullPath = path.join(__dirname, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Wrote ' + relPath);
}

// 1. Routines Page (/routines)
writeFile('src/app/routines/page.tsx', `
'use client'

import * as React from 'react'
import { Plus, Repeat2 } from 'lucide-react'
import { useRoutinesStore } from '@/lib/store/routines'
import { RoutineCard } from '@/components/routines/routine-card'
import { RoutineForm } from '@/components/routines/routine-form'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import type { Routine } from '@/lib/types/v2'

export default function RoutinesPage() {
  const routines = useRoutinesStore(s => s.routines)
  const loadAll = useRoutinesStore(s => s.loadAll)
  const initialized = useRoutinesStore(s => s.initialized)

  const [formOpen, setFormOpen] = React.useState(false)
  const [editingRoutine, setEditingRoutine] = React.useState<Routine | null>(null)

  React.useEffect(() => {
    if (!initialized) loadAll()
  }, [initialized, loadAll])

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:px-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Routines</h1>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
            Sequence your habits into morning, workday, or evening flows.
          </p>
        </div>
        <Button size="sm" onClick={() => { setEditingRoutine(null); setFormOpen(true); }}>
          <Plus className="w-4 h-4" /> New Routine
        </Button>
      </div>

      {routines.length === 0 ? (
        <EmptyState
          icon={<Repeat2 className="w-8 h-8" />}
          title="No routines yet"
          description="Create your first sequence of habits (e.g., Morning Reset Routine)."
          action={
            <Button size="sm" onClick={() => { setEditingRoutine(null); setFormOpen(true); }}>
              <Plus className="w-3.5 h-3.5" /> Create Routine
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {routines.map(routine => (
            <RoutineCard key={routine.id} routine={routine} onEdit={r => { setEditingRoutine(r); setFormOpen(true); }} />
          ))}
        </div>
      )}

      <RoutineForm open={formOpen} onOpenChange={setFormOpen} routineToEdit={editingRoutine} />
    </div>
  )
}
`);

// 2. Routine Flow Page (/routines/[id]/flow)
writeFile('src/app/routines/[id]/flow/page.tsx', `
'use client'

import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useRoutinesStore } from '@/lib/store/routines'
import { RoutineFlow } from '@/components/routines/routine-flow'
import { Button } from '@/components/ui/button'

export default function RoutineFlowPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const routines = useRoutinesStore(s => s.routines)
  const loadAll = useRoutinesStore(s => s.loadAll)
  const initialized = useRoutinesStore(s => s.initialized)

  React.useEffect(() => {
    if (!initialized) loadAll()
  }, [initialized, loadAll])

  const routine = routines.find(r => r.id === id)

  if (!routine) {
    return (
      <div className="p-8 text-center text-xs text-[var(--text-tertiary)]">
        Routine not found.
        <div className="mt-4">
          <Button size="sm" onClick={() => router.push('/routines')}>Back to Routines</Button>
        </div>
      </div>
    )
  }

  return <RoutineFlow routine={routine} />
}
`);

// 3. Goals Page (/goals)
writeFile('src/app/goals/page.tsx', `
'use client'

import * as React from 'react'
import { Plus, Target } from 'lucide-react'
import { useGoalsStore } from '@/lib/store/goals'
import { GoalCard } from '@/components/goals/goal-card'
import { GoalForm } from '@/components/goals/goal-form'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'

export default function GoalsPage() {
  const goals = useGoalsStore(s => s.goals)
  const loadAll = useGoalsStore(s => s.loadAll)
  const initialized = useGoalsStore(s => s.initialized)

  const [formOpen, setFormOpen] = React.useState(false)

  React.useEffect(() => {
    if (!initialized) loadAll()
  }, [initialized, loadAll])

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:px-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Goals</h1>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
            Connect habits to bigger life objectives & track real pace.
          </p>
        </div>
        <Button size="sm" onClick={() => setFormOpen(true)}>
          <Plus className="w-4 h-4" /> New Goal
        </Button>
      </div>

      {goals.length === 0 ? (
        <EmptyState
          icon={<Target className="w-8 h-8" />}
          title="No goals set"
          description="Create your first goal and link daily habits to it (e.g. Read 12 Books)."
          action={
            <Button size="sm" onClick={() => setFormOpen(true)}>
              <Plus className="w-3.5 h-3.5" /> Create Goal
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map(goal => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      )}

      <GoalForm open={formOpen} onOpenChange={setFormOpen} />
    </div>
  )
}
`);

// 4. Update App Shell to include CommandMenu and load all stores
writeFile('src/components/layout/app-shell.tsx', `
'use client'

import * as React from 'react'
import { Sidebar } from './sidebar'
import { MobileNav } from './mobile-nav'
import { Toast } from '@/components/ui/toast'
import { HabitForm } from '@/components/habits/habit-form'
import { CommandMenu } from '@/components/command/command-menu'
import { useHabitStore } from '@/lib/store/habits'
import { useRoutinesStore } from '@/lib/store/routines'
import { useGoalsStore } from '@/lib/store/goals'
import { useReflectionsStore } from '@/lib/store/reflections'
import { useUIStore } from '@/lib/store/ui'

export function AppShell({ children }: { children: React.ReactNode }) {
  const loadHabits = useHabitStore(s => s.loadAll)
  const habitsInitialized = useHabitStore(s => s.initialized)

  const loadRoutines = useRoutinesStore(s => s.loadAll)
  const routinesInitialized = useRoutinesStore(s => s.initialized)

  const loadGoals = useGoalsStore(s => s.loadAll)
  const goalsInitialized = useGoalsStore(s => s.initialized)

  const loadReflections = useReflectionsStore(s => s.loadAll)
  const reflectionsInitialized = useReflectionsStore(s => s.initialized)

  const openHabitForm = useUIStore(s => s.openHabitForm)

  React.useEffect(() => {
    if (!habitsInitialized) loadHabits()
    if (!routinesInitialized) loadRoutines()
    if (!goalsInitialized) loadGoals()
    if (!reflectionsInitialized) loadReflections()
  }, [habitsInitialized, routinesInitialized, goalsInitialized, reflectionsInitialized, loadHabits, loadRoutines, loadGoals, loadReflections])

  // Keyboard shortcut: 'n' for new habit
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement
      const isInput = activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA' || activeElement?.getAttribute('contenteditable') === 'true'
      if (isInput) return

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault()
        openHabitForm()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [openHabitForm])

  return (
    <div className="flex h-full">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-y-auto pb-16 md:pb-0">
        {children}
      </main>
      <MobileNav />
      <HabitForm />
      <CommandMenu />
      <Toast />
    </div>
  )
}
`);

// 5. Update Dashboard Page with Reflection Card & Starter Templates modal trigger
writeFile('src/app/dashboard/page.tsx', `
'use client'

import * as React from 'react'
import { Plus, Calendar as CalendarIcon, Sparkles } from 'lucide-react'
import { formatFullDate, toDateString, isSameDateDay } from '@/lib/utils/date'
import { useHabitStore } from '@/lib/store/habits'
import { useUIStore } from '@/lib/store/ui'
import { HabitList } from '@/components/habits/habit-list'
import { DailyProgress } from '@/components/dashboard/daily-progress'
import { WeekView } from '@/components/dashboard/week-view'
import { StreakBadge } from '@/components/dashboard/streak-badge'
import { ReflectionCard } from '@/components/reflection/reflection-card'
import { TemplateModal } from '@/components/templates/template-modal'
import { Button } from '@/components/ui/button'
import { isHabitScheduledOnDate } from '@/lib/habits/schedule'

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date())
  const [filter, setFilter] = React.useState<'all' | 'pending'>('all')
  const [templateOpen, setTemplateOpen] = React.useState(false)

  const habits = useHabitStore(s => s.habits)
  const completions = useHabitStore(s => s.completions)
  const getStats = useHabitStore(s => s.getStats)
  const openHabitForm = useUIStore(s => s.openHabitForm)

  const dateStr = toDateString(selectedDate)
  const isToday = isSameDateDay(selectedDate, new Date())

  const activeHabits = habits.filter(h => h.status === 'active')
  const scheduledHabits = activeHabits.filter(h => isHabitScheduledOnDate(h, selectedDate))

  const completedCount = scheduledHabits.filter(h =>
    completions.some(c => c.habitId === h.id && c.date === dateStr)
  ).length

  const maxStreak = React.useMemo(() => {
    if (activeHabits.length === 0) return 0
    return Math.max(...activeHabits.map(h => getStats(h.id).currentStreak))
  }, [activeHabits, getStats])

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
            {isToday ? "Today" : formatFullDate(selectedDate)}
          </h1>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
            {formatFullDate(selectedDate)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {maxStreak > 0 && <StreakBadge streak={maxStreak} />}
          <Button size="sm" variant="secondary" onClick={() => setTemplateOpen(true)}>
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" /> Starter Packs
          </Button>
          <Button size="sm" onClick={() => openHabitForm()}>
            <Plus className="w-4 h-4" /> New habit
          </Button>
        </div>
      </div>

      {/* Week Selector */}
      <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--bg-base)]">
        <WeekView selectedDate={selectedDate} onSelectDate={setSelectedDate} />
      </div>

      {/* Daily Progress */}
      {scheduledHabits.length > 0 && (
        <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-base)]">
          <DailyProgress completed={completedCount} total={scheduledHabits.length} />
        </div>
      )}

      {/* Filter / Actions Bar */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setFilter('all')}
            className={\`px-2.5 py-1 rounded text-xs font-medium transition-colors \${
              filter === 'all'
                ? 'bg-[var(--accent-subtle)] text-[var(--accent)]'
                : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
            }\`}
          >
            All ({scheduledHabits.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={\`px-2.5 py-1 rounded text-xs font-medium transition-colors \${
              filter === 'pending'
                ? 'bg-[var(--accent-subtle)] text-[var(--accent)]'
                : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
            }\`}
          >
            To do ({scheduledHabits.length - completedCount})
          </button>
        </div>

        {!isToday && (
          <button
            onClick={() => setSelectedDate(new Date())}
            className="text-xs text-[var(--accent)] hover:underline flex items-center gap-1"
          >
            <CalendarIcon className="w-3 h-3" /> Jump to today
          </button>
        )}
      </div>

      {/* Habits List */}
      <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-base)] overflow-hidden">
        <HabitList date={selectedDate} filter={filter} />
      </div>

      {/* Reflection Widget */}
      <ReflectionCard date={dateStr} />

      {/* Template Installer Modal */}
      <TemplateModal open={templateOpen} onOpenChange={setTemplateOpen} />
    </div>
  )
}
`);

console.log('V2 pages & app shell integration written');
