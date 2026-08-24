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
