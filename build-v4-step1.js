const fs = require('fs');
const path = require('path');

function writeFile(relPath, content) {
  const fullPath = path.join(__dirname, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Wrote ' + relPath);
}

// ─────────────────────────────────────────────────────────────────
// 1. PWA manifest.json
// ─────────────────────────────────────────────────────────────────
writeFile('public/manifest.json', `{
  "name": "Habit — Track Your Consistency",
  "short_name": "Habit",
  "description": "A personal habit tracking platform. Make consistency visible.",
  "start_url": "/dashboard",
  "display": "standalone",
  "background_color": "#0a0a0a",
  "theme_color": "#6366f1",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable any"
    }
  ],
  "shortcuts": [
    {
      "name": "Today's Habits",
      "short_name": "Today",
      "description": "Jump to today's dashboard",
      "url": "/dashboard",
      "icons": [{ "src": "/icons/icon-96.png", "sizes": "96x96" }]
    },
    {
      "name": "Start a Routine",
      "short_name": "Routines",
      "description": "Open your habit routines",
      "url": "/routines",
      "icons": [{ "src": "/icons/icon-96.png", "sizes": "96x96" }]
    }
  ],
  "categories": ["health", "productivity", "lifestyle"]
}`);

// ─────────────────────────────────────────────────────────────────
// 2. next.config.ts — PWA-wrapped via next-pwa
// ─────────────────────────────────────────────────────────────────
writeFile('next.config.ts', `
import type { NextConfig } from 'next'
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
})

const nextConfig: NextConfig = {
  /* config options here */
}

module.exports = withPWA(nextConfig)
`);

// ─────────────────────────────────────────────────────────────────
// 3. Supabase cloud adapter abstraction
// ─────────────────────────────────────────────────────────────────
writeFile('src/lib/cloud/supabase.ts', `
/**
 * Supabase Cloud Adapter — V4
 * This module creates a type-safe Supabase client ready for cloud sync.
 * Connection is entirely optional — the app works 100% offline via Dexie (IndexedDB).
 *
 * To enable cloud sync:
 *   1. Create a Supabase project at https://supabase.com
 *   2. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local
 *   3. Run the schema SQL from src/lib/cloud/schema.sql
 */
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

export const isCloudEnabled = () =>
  typeof window !== 'undefined' &&
  SUPABASE_URL.length > 0 &&
  SUPABASE_ANON_KEY.length > 0

export const supabase = isCloudEnabled()
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null

export type CloudSyncStatus = 'disabled' | 'idle' | 'syncing' | 'error' | 'success'
`);

// ─────────────────────────────────────────────────────────────────
// 4. Supabase schema SQL (reference file)
// ─────────────────────────────────────────────────────────────────
writeFile('src/lib/cloud/schema.sql', `-- Habit Platform — Supabase Cloud Schema (V4)
-- Run this in your Supabase SQL editor to enable cloud sync.

-- Enable RLS
alter table if exists habits enable row level security;

-- Habits
create table if not exists habits (
  id text primary key,
  user_id uuid references auth.users not null,
  name text not null,
  description text,
  icon text not null,
  accent_color text not null,
  frequency jsonb not null,
  preferred_time text not null,
  status text not null default 'active',
  priority text not null default 'medium',
  difficulty text not null default 'medium',
  category_id text,
  created_at text not null,
  updated_at text not null
);

-- Completions
create table if not exists completions (
  id text primary key,
  habit_id text references habits(id) on delete cascade not null,
  user_id uuid references auth.users not null,
  date text not null,
  completed_at text not null,
  note text
);

-- Routines
create table if not exists routines (
  id text primary key,
  user_id uuid references auth.users not null,
  name text not null,
  description text,
  icon text not null,
  accent_color text not null,
  items jsonb not null default '[]',
  created_at text not null,
  updated_at text not null
);

-- Goals
create table if not exists goals (
  id text primary key,
  user_id uuid references auth.users not null,
  title text not null,
  description text,
  target_type text not null,
  target_value int not null,
  current_value int not null default 0,
  unit text,
  deadline text,
  sub_goals jsonb not null default '[]',
  linked_habit_ids jsonb not null default '[]',
  status text not null default 'active',
  created_at text not null,
  updated_at text not null
);

-- Reflections
create table if not exists reflections (
  id text primary key,
  user_id uuid references auth.users not null,
  date text not null unique,
  mood int,
  energy int,
  note text,
  updated_at text not null
);

-- Row Level Security Policies
create policy "Users manage own habits" on habits for all using (auth.uid() = user_id);
create policy "Users manage own completions" on completions for all using (auth.uid() = user_id);
create policy "Users manage own routines" on routines for all using (auth.uid() = user_id);
create policy "Users manage own goals" on goals for all using (auth.uid() = user_id);
create policy "Users manage own reflections" on reflections for all using (auth.uid() = user_id);
`);

// ─────────────────────────────────────────────────────────────────
// 5. Cloud Sync Store (zustand)
// ─────────────────────────────────────────────────────────────────
writeFile('src/lib/store/sync.ts', `
import { create } from 'zustand'
import type { CloudSyncStatus } from '@/lib/cloud/supabase'
import { isCloudEnabled } from '@/lib/cloud/supabase'

interface SyncState {
  status: CloudSyncStatus
  lastSyncedAt: string | null
  isOnline: boolean
  cloudEnabled: boolean
  setStatus: (status: CloudSyncStatus) => void
  setOnline: (online: boolean) => void
  markSynced: () => void
}

export const useSyncStore = create<SyncState>((set) => ({
  status: isCloudEnabled() ? 'idle' : 'disabled',
  lastSyncedAt: null,
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  cloudEnabled: isCloudEnabled(),

  setStatus: (status) => set({ status }),
  setOnline: (online) => set({ isOnline: online }),
  markSynced: () => set({ status: 'success', lastSyncedAt: new Date().toISOString() }),
}))
`);

// ─────────────────────────────────────────────────────────────────
// 6. Offline + Install Banner component
// ─────────────────────────────────────────────────────────────────
writeFile('src/components/v4/offline-banner.tsx', `
'use client'

import * as React from 'react'
import { WifiOff, Download, X, Cloud, CloudOff } from 'lucide-react'
import { useSyncStore } from '@/lib/store/sync'

export function OfflineBanner() {
  const isOnline = useSyncStore(s => s.isOnline)
  const cloudEnabled = useSyncStore(s => s.cloudEnabled)
  const setOnline = useSyncStore(s => s.setOnline)
  const [dismissed, setDismissed] = React.useState(false)
  const [deferredPrompt, setDeferredPrompt] = React.useState<Event | null>(null)
  const [showInstallBanner, setShowInstallBanner] = React.useState(false)
  const [isStandalone, setIsStandalone] = React.useState(false)

  React.useEffect(() => {
    // Check if running in standalone (installed PWA) mode
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches)

    const handleOnline = () => { setOnline(true); setDismissed(false) }
    const handleOffline = () => { setOnline(false); setDismissed(false) }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Capture the install event for the Add to Home Screen prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallBanner(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [setOnline])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    const promptEvent = deferredPrompt as any
    promptEvent.prompt()
    const { outcome } = await promptEvent.userChoice
    if (outcome === 'accepted') {
      setShowInstallBanner(false)
      setDeferredPrompt(null)
    }
  }

  if (dismissed) return null

  // Offline alert
  if (!isOnline) {
    return (
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
        <div className="pointer-events-auto mx-4 mb-3 flex items-center gap-3 px-4 py-2.5 rounded-lg bg-amber-500 text-white text-xs font-medium shadow-lg max-w-sm w-full">
          <WifiOff className="w-4 h-4 flex-shrink-0" />
          <span className="flex-1">You're offline — all changes saved locally</span>
          <button onClick={() => setDismissed(true)} className="opacity-70 hover:opacity-100">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    )
  }

  // Install PWA prompt (only shown once, before install)
  if (showInstallBanner && !isStandalone) {
    return (
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
        <div className="pointer-events-auto mx-4 mb-3 flex items-center gap-3 px-4 py-2.5 rounded-lg bg-[var(--bg-base)] border border-[var(--border)] shadow-lg max-w-sm w-full">
          <div className="w-6 h-6 rounded bg-[var(--accent)] flex items-center justify-center flex-shrink-0">
            <span className="text-white text-[10px] font-bold">H</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[var(--text-primary)]">Install Habit Platform</p>
            <p className="text-[10px] text-[var(--text-tertiary)]">Add to home screen for offline-first access</p>
          </div>
          <button
            onClick={handleInstall}
            className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded bg-[var(--accent)] text-white text-xs font-medium hover:opacity-90"
          >
            <Download className="w-3 h-3" /> Install
          </button>
          <button onClick={() => setShowInstallBanner(false)} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    )
  }

  return null
}
`);

// ─────────────────────────────────────────────────────────────────
// 7. Cloud Sync Status indicator (sidebar & settings)
// ─────────────────────────────────────────────────────────────────
writeFile('src/components/v4/sync-status.tsx', `
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
    success: lastSyncedAt ? \`Synced \${formatDate(lastSyncedAt, 'h:mm a')}\` : 'Synced',
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
`);

console.log('V4 core files written');
