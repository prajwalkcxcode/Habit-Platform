const fs = require('fs');
const path = require('path');

function writeFile(relPath, content) {
  const fullPath = path.join(__dirname, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Wrote ' + relPath);
}

writeFile('src/app/settings/page.tsx', `
'use client'

import * as React from 'react'
import { useHabitStore } from '@/lib/store/habits'
import { useSettingsStore } from '@/lib/store/settings'
import { useSyncStore } from '@/lib/store/sync'
import { SyncStatus } from '@/components/v4/sync-status'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Download, Monitor, Smartphone, Moon, Sun, Cloud, RefreshCw, LogOut } from 'lucide-react'
import type { Theme } from '@/lib/types'
import { supabase, isCloudEnabled } from '@/lib/cloud/supabase'
import { syncLocalToCloud } from '@/lib/cloud/sync-engine'
import { useUIStore } from '@/lib/store/ui'

export default function SettingsPage() {
  const theme = useSettingsStore(s => s.theme)
  const setTheme = useSettingsStore(s => s.setTheme)
  const weekStartsOn = useSettingsStore(s => s.weekStartsOn)
  const setWeekStartsOn = useSettingsStore(s => s.setWeekStartsOn)
  const cloudEnabled = useSyncStore(s => s.cloudEnabled)
  const syncStatus = useSyncStore(s => s.status)
  const setSyncStatus = useSyncStore(s => s.setStatus)
  const habits = useHabitStore(s => s.habits)
  const completions = useHabitStore(s => s.completions)
  const showToast = useUIStore(s => s.showToast)

  // Auth State
  const [session, setSession] = React.useState<any>(null)
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [authLoading, setAuthLoading] = React.useState(false)
  const [authMode, setAuthMode] = React.useState<'signin' | 'signup'>('signin')

  React.useEffect(() => {
    if (isCloudEnabled() && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session)
        if (session) syncLocalToCloud()
      })

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session)
        if (session) syncLocalToCloud()
      })

      return () => subscription.unsubscribe()
    }
  }, [])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) return
    setAuthLoading(true)

    try {
      if (authMode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        showToast('Verification email sent! Check your inbox.', 'success')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        showToast('Signed in successfully!', 'success')
      }
    } catch (err: any) {
      showToast(err.message, 'error')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleSignOut = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    setSession(null)
    setSyncStatus('disabled')
    showToast('Signed out successfully.', 'info')
  }

  const handleExport = () => {
    const data = { habits, completions, exportedAt: new Date().toISOString(), version: 4 }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = \`habit-backup-v4-\${new Date().toISOString().split('T')[0]}.json\`
    a.click()
    URL.revokeObjectURL(url)
  }

  const triggerSync = async () => {
    if (!session) {
      showToast('Sign in to sync your data to the cloud', 'error')
      return
    }
    await syncLocalToCloud()
    showToast('Synchronization complete!', 'success')
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
                  className={\`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs capitalize transition-colors \${
                    theme === t
                      ? 'bg-[var(--bg-base)] text-[var(--text-primary)] font-medium shadow-sm border border-[var(--border)]'
                      : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                  }\`}
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
        <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-base)] space-y-4">
          <SyncStatus />
          
          {cloudEnabled ? (
            <div className="space-y-4 pt-2">
              {session ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border)] text-xs text-[var(--text-secondary)]">
                    <div>
                      <p className="font-semibold text-[var(--text-primary)]">Logged in as</p>
                      <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5 font-mono">{session.user.email}</p>
                    </div>
                    <Button size="sm" variant="secondary" onClick={handleSignOut}>
                      <LogOut className="w-3.5 h-3.5" /> Sign Out
                    </Button>
                  </div>
                  
                  <Button className="w-full flex items-center justify-center gap-2" onClick={triggerSync} disabled={syncStatus === 'syncing'}>
                    <RefreshCw className={\`w-4 h-4 \${syncStatus === 'syncing' ? 'animate-spin' : ''}\`} />
                    Sync Data to Cloud
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleAuth} className="space-y-3 border-t border-[var(--border)] pt-4">
                  <p className="text-xs font-semibold text-[var(--text-primary)]">Sign in to sync devices</p>
                  
                  <div className="space-y-2">
                    <div>
                      <Label className="mb-1 block text-xs">Email</Label>
                      <Input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div>
                      <Label className="mb-1 block text-xs">Password</Label>
                      <Input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-2">
                    <button type="button" className="text-xs text-[var(--accent)] hover:underline" onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}>
                      {authMode === 'signin' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                    </button>
                    <Button type="submit" size="sm" disabled={authLoading}>
                      {authLoading ? 'Loading...' : authMode === 'signin' ? 'Sign In' : 'Sign Up'}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          ) : (
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
`);

console.log('Settings Auth Page Updated');
