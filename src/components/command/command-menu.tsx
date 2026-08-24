'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import * as Dialog from '@radix-ui/react-dialog'
import { Search, LayoutDashboard, CheckSquare, Repeat2, Target, BarChart2, Settings, Plus, Sun, Moon, Download, CheckCircle, Sparkles } from 'lucide-react'
import { useHabitStore } from '@/lib/store/habits'
import { useRoutinesStore } from '@/lib/store/routines'
import { useGoalsStore } from '@/lib/store/goals'
import { useUIStore } from '@/lib/store/ui'
import { useSettingsStore } from '@/lib/store/settings'
import { cn } from '@/lib/utils/cn'

interface CommandItem {
  id: string
  title: string
  subtitle?: string
  icon: React.ReactNode
  category: 'Navigation' | 'Habits' | 'Actions' | 'Routines' | 'Goals'
  onSelect: () => void
}

export function CommandMenu() {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')
  const router = useRouter()

  const habits = useHabitStore(s => s.habits)
  const toggleCompletion = useHabitStore(s => s.toggleCompletion)
  const isCompletedToday = useHabitStore(s => s.isCompletedToday)

  const routines = useRoutinesStore(s => s.routines)
  const goals = useGoalsStore(s => s.goals)

  const openHabitForm = useUIStore(s => s.openHabitForm)
  const showToast = useUIStore(s => s.showToast)
  const theme = useSettingsStore(s => s.theme)
  const setTheme = useSettingsStore(s => s.setTheme)

  // Listen for Cmd+K / Ctrl+K
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const items: CommandItem[] = React.useMemo(() => {
    const list: CommandItem[] = []

    // Navigation
    list.push(
      { id: 'nav-dash', title: 'Go to Dashboard', category: 'Navigation', icon: <LayoutDashboard className="w-4 h-4" />, onSelect: () => router.push('/dashboard') },
      { id: 'nav-habits', title: 'Go to Habits', category: 'Navigation', icon: <CheckSquare className="w-4 h-4" />, onSelect: () => router.push('/habits') },
      { id: 'nav-routines', title: 'Go to Routines', category: 'Navigation', icon: <Repeat2 className="w-4 h-4" />, onSelect: () => router.push('/routines') },
      { id: 'nav-goals', title: 'Go to Goals', category: 'Navigation', icon: <Target className="w-4 h-4" />, onSelect: () => router.push('/goals') },
      { id: 'nav-analytics', title: 'Go to Analytics', category: 'Navigation', icon: <BarChart2 className="w-4 h-4" />, onSelect: () => router.push('/analytics') },
      { id: 'nav-settings', title: 'Go to Settings', category: 'Navigation', icon: <Settings className="w-4 h-4" />, onSelect: () => router.push('/settings') }
    )

    // Actions
    list.push(
      { id: 'act-new-habit', title: 'Create new habit', category: 'Actions', icon: <Plus className="w-4 h-4" />, onSelect: () => openHabitForm() },
      { id: 'act-theme', title: `Switch theme (current: ${theme})`, category: 'Actions', icon: theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />, onSelect: () => setTheme(theme === 'dark' ? 'light' : 'dark') }
    )

    // Active Habits quick completion
    habits.filter(h => h.status === 'active').forEach(h => {
      const done = isCompletedToday(h.id)
      list.push({
        id: `habit-${h.id}`,
        title: `Toggle ${h.icon} ${h.name}`,
        subtitle: done ? 'Completed today' : 'Not completed today',
        category: 'Habits',
        icon: <CheckCircle className={cn('w-4 h-4', done ? 'text-green-500' : 'text-gray-400')} />,
        onSelect: () => {
          toggleCompletion(h.id)
          showToast(`${h.icon} ${h.name} updated`, 'success')
        },
      })
    })

    // Routines
    routines.forEach(r => {
      list.push({
        id: `routine-${r.id}`,
        title: `Routine: ${r.icon} ${r.name}`,
        subtitle: `${r.items.length} habits in sequence`,
        category: 'Routines',
        icon: <Repeat2 className="w-4 h-4" />,
        onSelect: () => router.push(`/routines/${r.id}/flow`),
      })
    })

    // Goals
    goals.forEach(g => {
      list.push({
        id: `goal-${g.id}`,
        title: `Goal: ${g.title}`,
        subtitle: `${g.subGoals.length} sub-goals`,
        category: 'Goals',
        icon: <Target className="w-4 h-4" />,
        onSelect: () => router.push('/goals'),
      })
    })

    return list
  }, [habits, routines, goals, theme, router, openHabitForm, toggleCompletion, isCompletedToday, setTheme, showToast])

  const filteredItems = React.useMemo(() => {
    if (!query) return items
    const q = query.toLowerCase()
    return items.filter(i => i.title.toLowerCase().includes(q) || i.category.toLowerCase().includes(q) || (i.subtitle && i.subtitle.toLowerCase().includes(q)))
  }, [items, query])

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[20%] z-50 translate-x-[-50%] w-full max-w-xl bg-[var(--bg-base)] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95">
          {/* Input Header */}
          <div className="flex items-center gap-3 px-4 border-b border-[var(--border)] h-12">
            <Search className="w-4 h-4 text-[var(--text-tertiary)] flex-shrink-0" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search habits, routines, goals, or actions... (Esc to close)"
              className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none"
              autoFocus
            />
            <span className="text-[10px] font-mono border border-[var(--border)] px-1.5 py-0.5 rounded text-[var(--text-tertiary)]">
              ESC
            </span>
          </div>

          {/* Items List */}
          <div className="max-h-80 overflow-y-auto p-2 space-y-1">
            {filteredItems.length === 0 ? (
              <div className="py-8 text-center text-xs text-[var(--text-tertiary)]">
                No matching command or habit found.
              </div>
            ) : (
              filteredItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    item.onSelect()
                    setOpen(false)
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors hover:bg-[var(--bg-elevated)] group"
                >
                  <span className="text-[var(--text-secondary)] group-hover:text-[var(--accent)] transition-colors">
                    {item.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[var(--text-primary)] truncate">{item.title}</p>
                    {item.subtitle && <p className="text-[10px] text-[var(--text-tertiary)] truncate">{item.subtitle}</p>}
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--bg-subtle)] text-[var(--text-tertiary)]">
                    {item.category}
                  </span>
                </button>
              ))
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
