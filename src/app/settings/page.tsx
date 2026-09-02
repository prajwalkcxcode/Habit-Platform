'use client'

import * as React from 'react'
import {
  Sun,
  Moon,
  Monitor,
  Download,
  Upload,
  Smartphone,
  CheckCircle,
  RefreshCw,
  LogOut,
  Volume2,
  VolumeX,
  Vibrate,
  Receipt
} from 'lucide-react'
import { useSettingsStore } from '@/lib/store/settings'
import { useHabitStore } from '@/lib/store/habits'
import { useSyncStore } from '@/lib/store/sync'
import { useUIStore } from '@/lib/store/ui'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SyncStatus } from '@/components/v4/sync-status'
import { supabase, isCloudEnabled } from '@/lib/cloud/supabase'
import { syncLocalToCloud } from '@/lib/cloud/sync-engine'
import { WeeklyReceiptModal } from '@/components/dashboard/weekly-receipt-modal'
import type { Theme } from '@/lib/types'

export default function SettingsPage() {
  const theme = useSettingsStore(s => s.theme)
  const setTheme = useSettingsStore(s => s.setTheme)
  const weekStartsOn = useSettingsStore(s => s.weekStartsOn)
  const setWeekStartsOn = useSettingsStore(s => s.setWeekStartsOn)
  const soundEnabled = useSettingsStore(s => s.soundEnabled ?? true)
  const setSoundEnabled = useSettingsStore(s => s.setSoundEnabled)
  const hapticsEnabled = useSettingsStore(s => s.hapticsEnabled ?? true)
  const setHapticsEnabled = useSettingsStore(s => s.setHapticsEnabled)

  const habits = useHabitStore(s => s.habits)
  const completions = useHabitStore(s => s.completions)
  const showToast = useUIStore(s => s.showToast)
  const syncStatus = useSyncStore(s => s.status)
  const setSyncStatus = useSyncStore(s => s.setStatus)

  const [receiptOpen, setReceiptOpen] = React.useState(false)

  // Auth state
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [authMode, setAuthMode] = React.useState<'signin' | 'signup'>('signin')
  const [authLoading, setAuthLoading] = React.useState(false)
  const [session, setSession] = React.useState<any>(null)
  const cloudEnabled = isCloudEnabled()

  React.useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
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

  const handleGoogleSignIn = async () => {
    if (!supabase) return
    setAuthLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/settings` : undefined,
        },
      })
      if (error) throw error
    } catch (err: any) {
      showToast(err.message, 'error')
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
    a.download = `habit-backup-v4-${new Date().toISOString().split('T')[0]}.json`
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
        <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Settings</h1>
        <p className="text-xs text-[var(--text-tertiary)] mt-0.5">Preferences, cloud sync, feedback, and data management</p>
      </div>

      {/* Appearance */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Appearance & Theme</h2>
        <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">Theme Mode</p>
              <p className="text-xs text-[var(--text-tertiary)]">Choose your preferred visual atmosphere</p>
            </div>
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] self-start sm:self-auto">
              {(['light', 'dark', 'system'] as Theme[]).map(t => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs capitalize transition-all ${
                    theme === t
                      ? 'bg-[var(--bg-card)] text-[var(--text-primary)] font-bold shadow-xs border border-[var(--border)]'
                      : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] font-medium'
                  }`}
                >
                  {t === 'light' && <Sun className="w-3.5 h-3.5 text-amber-500" />}
                  {t === 'dark' && <Moon className="w-3.5 h-3.5 text-indigo-400" />}
                  {t === 'system' && <Monitor className="w-3.5 h-3.5 text-[var(--text-secondary)]" />}
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-[var(--border)] pt-3">
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">Week starts on</p>
              <p className="text-xs text-[var(--text-tertiary)]">Configure calendar start day</p>
            </div>
            <div className="w-36">
              <Select value={String(weekStartsOn)} onValueChange={v => setWeekStartsOn(Number(v) as 0 | 1)}>
                <SelectTrigger className="h-8 text-xs rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="1">Monday</SelectItem>
                  <SelectItem value="0">Sunday</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Sound & Haptic Feedback */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Feedback & Micro-Interactions</h2>
        <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center">
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 opacity-50" />}
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">Completion Audio</p>
                <p className="text-xs text-[var(--text-tertiary)]">Satisfying harmonic chime when checking off habits</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                soundEnabled
                  ? 'bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent)]/30'
                  : 'bg-[var(--bg-elevated)] text-[var(--text-tertiary)] border border-[var(--border)]'
              }`}
            >
              {soundEnabled ? 'Enabled' : 'Muted'}
            </button>
          </div>

          <div className="flex items-center justify-between border-t border-[var(--border)] pt-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center">
                <Vibrate className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">Mobile Haptics</p>
                <p className="text-xs text-[var(--text-tertiary)]">Subtle vibration pulse on mobile & touch devices</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setHapticsEnabled(!hapticsEnabled)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                hapticsEnabled
                  ? 'bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent)]/30'
                  : 'bg-[var(--bg-elevated)] text-[var(--text-tertiary)] border border-[var(--border)]'
              }`}
            >
              {hapticsEnabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        </div>
      </section>

      {/* Weekly Consistency Receipt */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Weekly Proof of Effort</h2>
        <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-card flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">Consistency Receipt</p>
              <p className="text-xs text-[var(--text-tertiary)]">View or copy a minimalist receipt of this week's progress</p>
            </div>
          </div>
          <Button size="sm" variant="secondary" onClick={() => setReceiptOpen(true)} className="rounded-xl text-xs">
            View Receipt
          </Button>
        </div>
      </section>

      {/* Cloud & Sync */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Cloud Sync & Auth</h2>
        <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-card space-y-4">
          <SyncStatus />
          
          {cloudEnabled ? (
            <div className="space-y-4 pt-2">
              {session ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)] text-xs text-[var(--text-secondary)]">
                    <div>
                      <p className="font-semibold text-[var(--text-primary)]">Logged in as</p>
                      <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5 font-mono">{session.user.email}</p>
                    </div>
                    <Button size="sm" variant="secondary" onClick={handleSignOut} className="rounded-xl text-xs">
                      <LogOut className="w-3.5 h-3.5" /> Sign Out
                    </Button>
                  </div>
                  
                  <Button className="w-full flex items-center justify-center gap-2 rounded-xl text-xs font-semibold shadow-xs" onClick={triggerSync} disabled={syncStatus === 'syncing'}>
                    <RefreshCw className={`w-4 h-4 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                    Sync Data to Cloud
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 border-t border-[var(--border)] pt-4">
                  <p className="text-xs font-semibold text-[var(--text-primary)]">Sign in to sync across devices</p>

                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full flex items-center justify-center gap-2 border border-[var(--border)] py-2 text-xs font-medium rounded-xl hover:bg-[var(--bg-elevated)]"
                    onClick={handleGoogleSignIn}
                    disabled={authLoading}
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
                      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                      <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.5s.7 4.8 1.9 7.2l3.7-2.9z" />
                      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 17.4C3.7 21.1 7.5 24 12 24z" />
                    </svg>
                    Continue with Google
                  </Button>

                  <div className="flex items-center gap-2 py-1">
                    <div className="flex-1 h-px bg-[var(--border)]" />
                    <span className="text-[10px] text-[var(--text-tertiary)] uppercase font-mono">or email</span>
                    <div className="flex-1 h-px bg-[var(--border)]" />
                  </div>

                  <form onSubmit={handleAuth} className="space-y-3">
                    <div className="space-y-2">
                      <div>
                        <Label className="mb-1 block text-xs">Email</Label>
                        <Input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required className="rounded-xl" />
                      </div>
                      <div>
                        <Label className="mb-1 block text-xs">Password</Label>
                        <Input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required className="rounded-xl" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-2">
                      <button type="button" className="text-xs text-[var(--accent)] hover:underline" onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}>
                        {authMode === 'signin' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                      </button>
                      <Button type="submit" size="sm" disabled={authLoading} className="rounded-xl text-xs font-semibold">
                        {authLoading ? 'Loading...' : authMode === 'signin' ? 'Sign In' : 'Sign Up'}
                      </Button>
                    </div>
                  </form>
                </div>
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

      {/* Data Management */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Data Management</h2>
        <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">Export Data</p>
              <p className="text-xs text-[var(--text-tertiary)]">Download all habits and completions as JSON backup</p>
            </div>
            <Button size="sm" variant="secondary" onClick={handleExport} className="rounded-xl text-xs">
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

      {/* Weekly Receipt Modal */}
      <WeeklyReceiptModal open={receiptOpen} onOpenChange={setReceiptOpen} />
    </div>
  )
}
