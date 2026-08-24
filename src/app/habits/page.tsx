'use client'

import * as React from 'react'
import { Plus, Search, Archive } from 'lucide-react'
import { useHabitStore } from '@/lib/store/habits'
import { useUIStore } from '@/lib/store/ui'
import { HabitCard } from '@/components/habits/habit-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/ui/empty-state'
import { DEFAULT_CATEGORIES } from '@/lib/types'

export default function HabitsPage() {
  const [search, setSearch] = React.useState('')
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null)
  const [showArchived, setShowArchived] = React.useState(false)

  const habits = useHabitStore(s => s.habits)
  const openHabitForm = useUIStore(s => s.openHabitForm)

  const filteredHabits = React.useMemo(() => {
    return habits.filter(h => {
      if (showArchived) {
        if (h.status !== 'archived') return false
      } else {
        if (h.status === 'archived') return false
      }

      if (search && !h.name.toLowerCase().includes(search.toLowerCase())) {
        return false
      }

      if (selectedCategory && h.categoryId !== selectedCategory) {
        return false
      }

      return true
    })
  }, [habits, search, selectedCategory, showArchived])

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:px-8 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Habits</h1>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
            Manage your habits, schedule, and frequency.
          </p>
        </div>
        <Button size="sm" onClick={() => openHabitForm()}>
          <Plus className="w-4 h-4" /> New habit
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <Input
            placeholder="Filter habits..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
              selectedCategory === null
                ? 'bg-[var(--accent-subtle)] text-[var(--accent)]'
                : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] bg-[var(--bg-elevated)]'
            }`}
          >
            All
          </button>
          {DEFAULT_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-[var(--accent-subtle)] text-[var(--accent)]'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] bg-[var(--bg-elevated)]'
              }`}
            >
              {cat.name}
            </button>
          ))}
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1 ${
              showArchived
                ? 'bg-[var(--accent-subtle)] text-[var(--accent)]'
                : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] bg-[var(--bg-elevated)]'
            }`}
          >
            <Archive className="w-3 h-3" /> Archived
          </button>
        </div>
      </div>

      {/* Habits Grid */}
      {filteredHabits.length === 0 ? (
        <EmptyState
          title={showArchived ? "No archived habits" : "No habits found"}
          description={showArchived ? "Archived habits will appear here." : "Try clearing your filters or create a new habit."}
          action={
            !showArchived ? (
              <Button size="sm" onClick={() => openHabitForm()}>
                <Plus className="w-3.5 h-3.5" /> Create habit
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHabits.map(habit => (
            <HabitCard key={habit.id} habit={habit} />
          ))}
        </div>
      )}
    </div>
  )
}
