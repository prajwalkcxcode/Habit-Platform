'use client'

import * as React from 'react'
import { useHabitStore } from '@/lib/store/habits'
import { useSettingsStore } from '@/lib/store/settings'
import { useSyncStore } from '@/lib/store/sync'
import { SyncStatus } from '@/components/v4/sync-status'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Download, Monitor, Smartphone, Moon, Sun } from 'lucide-react'
import type { Theme } from '@/lib/types'

export default function SettingsPage() {
  const theme = useSettingsStore(s => s.theme)
  const setTheme = useSettingsStore(s => s.setTheme)
  const weekStartsOn = useSettingsStore(s => s.weekStartsOn)
  const setWeekStartsOn = useSettingsStore(s => s.setWeekStartsOn)
  const cloudEnabled = useSyncStore(s => s.cloudEnabled)
  const habits = useHabitStore(s => s.habits)
  const completions = useHabitStore(s => s.completions)

  const handleExport = () => {
    const data = { habits, completions, exportedAt: new Date().toISOString(), version: 4 }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `habit-backup-v4-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:px-8 space-y-8">
      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Settings</h1>
        <p className="text-xs text-[var(--text-tertiary)] mt-0.5">Preferences, cloud sync, and data management</p>
      </div>

      {/* Appearance */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Appearance</h2>
        <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-base)] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">Theme</p>
              <p className="text-xs text-[var(--text-tertiary)]">Choose your preferred color scheme</p>
            </div>
            <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)]">
              {(['light', 'dark', 'system'] as Theme[]).map(t => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs capitalize transition-colors ${
                    theme === t
                      ? 'bg-[var(--bg-base)] text-[var(--text-primary)] font-medium shadow-sm border border-[var(--border)]'
                      : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                  }`}
                >
                  {t === 'light' && <Sun className="w-3 h-3" />}
                  {t === 'dark' && <Moon className="w-3 h-3" />}
                  {t === 'system' && <Monitor className="w-3 h-3" />}
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">Week starts on</p>
              <p className="text-xs text-[var(--text-tertiary)]">Sunday or Monday?</p>
            </div>
            <div className="w-36">
              <Select value={String(weekStartsOn)} onValueChange={v => setWeekStartsOn(Number(v) as 0 | 1)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Monday</SelectItem>
                  <SelectItem value="0">Sunday</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Cloud & Sync */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Cloud Sync</h2>
        <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-base)] space-y-3">
          <SyncStatus />
          {!cloudEnabled && (
            <div className="text-xs text-[var(--text-secondary)] space-y-1 pt-1">
              <p>To connect Supabase cloud sync:</p>
              <ol className="list-decimal ml-4 space-y-0.5 text-[var(--text-tertiary)]">
                <li>Create a free project at <span className="font-mono text-[var(--accent)]">supabase.com</span></li>
                <li>Add <code className="font-mono bg-[var(--bg-elevated)] px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code> to .env.local</li>
                <li>Add <code className="font-mono bg-[var(--bg-elevated)] px-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to .env.local</li>
                <li>Run the schema from <code className="font-mono bg-[var(--bg-elevated)] px-1 rounded">src/lib/cloud/schema.sql</code></li>
              </ol>
            </div>
          )}
        </div>
      </section>

      {/* PWA / Mobile */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Mobile & Offline</h2>
        <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-base)] space-y-3">
          <div className="flex items-center gap-3">
            <Smartphone className="w-5 h-5 text-[var(--accent)]" />
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">Progressive Web App</p>
              <p className="text-xs text-[var(--text-tertiary)]">
                Install Habit Platform on your phone for offline-first access. Tap the browser's install prompt or "Add to Home Screen".
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Data Management */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Data Management</h2>
        <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-base)] space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">Export Data</p>
              <p className="text-xs text-[var(--text-tertiary)]">Download all habits and completions as JSON backup</p>
            </div>
            <Button size="sm" variant="secondary" onClick={handleExport}>
              <Download className="w-3.5 h-3.5" /> Export JSON
            </Button>
          </div>

          <div className="border-t border-[var(--border)] pt-3">
            <p className="text-xs text-[var(--text-tertiary)]">
              {habits.length} habits · {completions.length} completions stored locally via IndexedDB
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
