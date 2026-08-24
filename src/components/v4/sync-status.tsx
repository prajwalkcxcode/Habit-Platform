'use client'

import * as React from 'react'
import { Cloud, CloudOff, CloudDownload, CheckCircle2 } from 'lucide-react'
import { useSyncStore } from '@/lib/store/sync'
import { formatDate } from '@/lib/utils/date'

export function SyncStatus({ compact = false }: { compact?: boolean }) {
  const { status, lastSyncedAt, cloudEnabled, isOnline } = useSyncStore()

  if (!cloudEnabled) {
    if (compact) {
      return (
        <div className="flex items-center gap-1 text-[10px] text-[var(--text-tertiary)]">
          <CloudOff className="w-3 h-3" />
          <span>Local only</span>
        </div>
      )
    }
    return (
      <div className="flex items-center gap-2 p-3 rounded-md bg-[var(--bg-subtle)] border border-[var(--border)] text-xs text-[var(--text-secondary)]">
        <CloudOff className="w-4 h-4 text-[var(--text-tertiary)]" />
        <div>
          <p className="font-medium text-[var(--text-primary)]">Local-only Mode</p>
          <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">
            Add <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> to .env.local to enable cloud sync.
          </p>
        </div>
      </div>
    )
  }

  const icon = {
    idle: <Cloud className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />,
    syncing: <CloudDownload className="w-3.5 h-3.5 text-[var(--accent)] animate-pulse" />,
    success: <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />,
    error: <CloudOff className="w-3.5 h-3.5 text-red-500" />,
    disabled: <CloudOff className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />,
  }[status]

  const label = {
    idle: 'Cloud connected',
    syncing: 'Syncing...',
    success: lastSyncedAt ? `Synced ${formatDate(lastSyncedAt, 'h:mm a')}` : 'Synced',
    error: 'Sync error',
    disabled: 'Cloud disabled',
  }[status]

  if (compact) {
    return (
      <div className="flex items-center gap-1 text-[10px] text-[var(--text-tertiary)]">
        {icon} {label}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 p-3 rounded-md bg-[var(--bg-subtle)] border border-[var(--border)] text-xs">
      {icon}
      <span className="text-[var(--text-secondary)]">{label}</span>
    </div>
  )
}
