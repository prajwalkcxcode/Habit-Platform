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
