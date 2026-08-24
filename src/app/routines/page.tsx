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
