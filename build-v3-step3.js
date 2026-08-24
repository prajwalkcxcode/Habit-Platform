const fs = require('fs');
const path = require('path');

function writeFile(relPath, content) {
  const fullPath = path.join(__dirname, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Wrote ' + relPath);
}

// 1. AI Consistency Coach Widget
writeFile('src/components/v3/ai-coach-card.tsx', `
'use client'

import * as React from 'react'
import { Sparkles, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react'
import { useHabitStore } from '@/lib/store/habits'
import { generateAICoachInsights } from '@/lib/ai/coach'
import { useUIStore } from '@/lib/store/ui'
import { Button } from '@/components/ui/button'

export function AICoachCard() {
  const habits = useHabitStore(s => s.habits)
  const completions = useHabitStore(s => s.completions)
  const updateHabit = useHabitStore(s => s.updateHabit)
  const showToast = useUIStore(s => s.showToast)

  const insights = React.useMemo(
    () => generateAICoachInsights(habits, completions),
    [habits, completions]
  )

  if (insights.length === 0) return null

  return (
    <div className="p-5 rounded-lg border border-[var(--border)] bg-[var(--bg-base)] space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              AI Consistency Coach
            </h3>
            <p className="text-[10px] text-[var(--text-tertiary)]">Fact-based insights derived from your check-in logs</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {insights.map(item => (
          <div key={item.id} className="p-3 rounded-md bg-[var(--bg-subtle)] border border-[var(--border)] space-y-1.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent)]" /> {item.title}
              </h4>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">{item.description}</p>
            <p className="text-[10px] font-mono text-[var(--text-tertiary)]">{item.explanation}</p>

            {item.actionLabel && item.habitId && item.suggestedTime && (
              <div className="pt-1 flex justify-end">
                <Button
                  size="sm"
                  variant="secondary"
                  className="text-xs h-7"
                  onClick={async () => {
                    await updateHabit(item.habitId!, { preferredTime: item.suggestedTime as any })
                    showToast(\`Updated preferred time for habit\`, 'success')
                  }}
                >
                  {item.actionLabel} <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
`);

// 2. Focus Timer Modal Component
writeFile('src/components/v3/focus-timer-modal.tsx', `
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
    showToast(\`Completed \${durationMinutes}m Focus Session! (+50 XP)\`, 'success')
    onOpenChange(false)
  }

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return \`\${m.toString().padStart(2, '0')}:\${s.toString().padStart(2, '0')}\`
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
`);

// 3. Challenges & Gamification Page (/challenges)
writeFile('src/app/challenges/page.tsx', `
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
`);

// 4. Update Navigation Sidebar & Mobile Nav to include Challenges
writeFile('src/components/layout/sidebar.tsx', `
'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  CheckSquare,
  Repeat2,
  Target,
  BarChart2,
  Trophy,
  Settings,
  Flame,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useUIStore } from '@/lib/store/ui'
import { useHabitStore } from '@/lib/store/habits'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/habits', label: 'Habits', icon: CheckSquare },
  { href: '/routines', label: 'Routines', icon: Repeat2 },
  { href: '/goals', label: 'Goals', icon: Target },
  { href: '/challenges', label: 'Challenges', icon: Trophy },
  { href: '/analytics', label: 'Analytics', icon: BarChart2 },
]

export function Sidebar() {
  const pathname = usePathname()
  const collapsed = useUIStore(s => s.sidebarCollapsed)
  const setSidebarCollapsed = useUIStore(s => s.setSidebarCollapsed)
  const getStats = useHabitStore(s => s.getStats)
  const habits = useHabitStore(s => s.habits)

  const maxStreak = React.useMemo(() => {
    const activeHabits = habits.filter(h => h.status === 'active')
    if (activeHabits.length === 0) return 0
    return Math.max(...activeHabits.map(h => getStats(h.id).currentStreak))
  }, [habits, getStats])

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col h-full border-r border-[var(--border)] bg-[var(--bg-base)] transition-all duration-200 shrink-0',
        collapsed ? 'w-14' : 'w-52'
      )}
    >
      <div className={cn(
        'flex items-center h-12 border-b border-[var(--border)] px-3 gap-2.5',
        collapsed && 'justify-center'
      )}>
        <div className="w-6 h-6 rounded bg-[var(--accent)] flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-bold">H</span>
        </div>
        {!collapsed && (
          <span className="text-sm font-semibold text-[var(--text-primary)] tracking-tight">
            Habit Platform
          </span>
        )}
      </div>

      <nav className="flex-1 py-2 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2.5 mx-1.5 px-2 py-1.5 rounded-md text-sm transition-colors',
                isActive
                  ? 'bg-[var(--accent-subtle)] text-[var(--accent)] font-medium'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]',
                collapsed && 'justify-center px-0'
              )}
              title={collapsed ? label : undefined}
            >
              <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={isActive ? 2 : 1.5} />
              {!collapsed && <span>{label}</span>}
            </Link>
          )
        })}
      </nav>

      {maxStreak > 0 && (
        <div className={cn(
          'mx-1.5 mb-1 px-2 py-2 rounded-md bg-[var(--bg-elevated)] border border-[var(--border)]',
          collapsed ? 'flex justify-center' : 'flex items-center gap-2'
        )}>
          <Flame className="w-4 h-4 text-orange-500 flex-shrink-0" />
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[var(--text-primary)] tabular-nums">
                {maxStreak} {maxStreak === 1 ? 'day' : 'days'}
              </p>
              <p className="text-[10px] text-[var(--text-tertiary)] leading-tight">best streak</p>
            </div>
          )}
        </div>
      )}

      <div className="border-t border-[var(--border)] p-1.5 flex flex-col gap-0.5">
        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm transition-colors',
            pathname === '/settings'
              ? 'bg-[var(--accent-subtle)] text-[var(--accent)] font-medium'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]',
            collapsed && 'justify-center'
          )}
          title={collapsed ? 'Settings' : undefined}
        >
          <Settings className="w-4 h-4 flex-shrink-0" strokeWidth={pathname === '/settings' ? 2 : 1.5} />
          {!collapsed && <span>Settings</span>}
        </Link>
        <button
          onClick={() => setSidebarCollapsed(!collapsed)}
          className={cn(
            'flex items-center gap-2.5 w-full px-2 py-1.5 rounded-md text-sm transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]',
            collapsed && 'justify-center'
          )}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed
            ? <PanelLeftOpen className="w-4 h-4" strokeWidth={1.5} />
            : <PanelLeftClose className="w-4 h-4" strokeWidth={1.5} />}
          {!collapsed && <span className="text-xs">Collapse</span>}
        </button>
      </div>
    </aside>
  )
}
`);

// 5. Update Dashboard to include AI Coach Card & Focus Timer Modal trigger
writeFile('src/app/dashboard/page.tsx', `
'use client'

import * as React from 'react'
import { Plus, Calendar as CalendarIcon, Sparkles, Clock } from 'lucide-react'
import { formatFullDate, toDateString, isSameDateDay } from '@/lib/utils/date'
import { useHabitStore } from '@/lib/store/habits'
import { useUIStore } from '@/lib/store/ui'
import { HabitList } from '@/components/habits/habit-list'
import { DailyProgress } from '@/components/dashboard/daily-progress'
import { WeekView } from '@/components/dashboard/week-view'
import { StreakBadge } from '@/components/dashboard/streak-badge'
import { ReflectionCard } from '@/components/reflection/reflection-card'
import { TemplateModal } from '@/components/templates/template-modal'
import { AICoachCard } from '@/components/v3/ai-coach-card'
import { FocusTimerModal } from '@/components/v3/focus-timer-modal'
import { Button } from '@/components/ui/button'
import { isHabitScheduledOnDate } from '@/lib/habits/schedule'

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date())
  const [filter, setFilter] = React.useState<'all' | 'pending'>('all')
  const [templateOpen, setTemplateOpen] = React.useState(false)
  const [focusTimerOpen, setFocusTimerOpen] = React.useState(false)

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
          <Button size="sm" variant="secondary" onClick={() => setFocusTimerOpen(true)}>
            <Clock className="w-3.5 h-3.5 text-[var(--accent)]" /> Focus Timer
          </Button>
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

      {/* AI Consistency Coach Widget */}
      <AICoachCard />

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

      {/* Modals */}
      <TemplateModal open={templateOpen} onOpenChange={setTemplateOpen} />
      <FocusTimerModal open={focusTimerOpen} onOpenChange={setFocusTimerOpen} />
    </div>
  )
}
`);

console.log('V3 UI components & pages written');
