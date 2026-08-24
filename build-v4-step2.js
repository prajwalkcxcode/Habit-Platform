const fs = require('fs');
const path = require('path');

function writeFile(relPath, content) {
  const fullPath = path.join(__dirname, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Wrote ' + relPath);
}

// ─────────────────────────────────────────────────────────────────
// 1. Updated App Shell — includes OfflineBanner, Sync initializer,
//    and online/offline event wiring
// ─────────────────────────────────────────────────────────────────
writeFile('src/components/layout/app-shell.tsx', `
'use client'

import * as React from 'react'
import { Sidebar } from './sidebar'
import { MobileNav } from './mobile-nav'
import { Toast } from '@/components/ui/toast'
import { HabitForm } from '@/components/habits/habit-form'
import { CommandMenu } from '@/components/command/command-menu'
import { OfflineBanner } from '@/components/v4/offline-banner'
import { useHabitStore } from '@/lib/store/habits'
import { useRoutinesStore } from '@/lib/store/routines'
import { useGoalsStore } from '@/lib/store/goals'
import { useReflectionsStore } from '@/lib/store/reflections'
import { useV3Store } from '@/lib/store/v3'
import { useSyncStore } from '@/lib/store/sync'
import { useUIStore } from '@/lib/store/ui'

export function AppShell({ children }: { children: React.ReactNode }) {
  const loadHabits = useHabitStore(s => s.loadAll)
  const habitsInitialized = useHabitStore(s => s.initialized)

  const loadRoutines = useRoutinesStore(s => s.loadAll)
  const routinesInitialized = useRoutinesStore(s => s.initialized)

  const loadGoals = useGoalsStore(s => s.loadAll)
  const goalsInitialized = useGoalsStore(s => s.initialized)

  const loadReflections = useReflectionsStore(s => s.loadAll)
  const reflectionsInitialized = useReflectionsStore(s => s.initialized)

  const loadV3 = useV3Store(s => s.loadAll)
  const v3Initialized = useV3Store(s => s.initialized)

  const setOnline = useSyncStore(s => s.setOnline)
  const openHabitForm = useUIStore(s => s.openHabitForm)

  // Load all stores on mount
  React.useEffect(() => {
    if (!habitsInitialized) loadHabits()
    if (!routinesInitialized) loadRoutines()
    if (!goalsInitialized) loadGoals()
    if (!reflectionsInitialized) loadReflections()
    if (!v3Initialized) loadV3()
  }, [habitsInitialized, routinesInitialized, goalsInitialized, reflectionsInitialized, v3Initialized,
      loadHabits, loadRoutines, loadGoals, loadReflections, loadV3])

  // Online/Offline sync status watcher
  React.useEffect(() => {
    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [setOnline])

  // Keyboard shortcut: 'n' for new habit
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement
      const isInput = activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA' || activeElement?.getAttribute('contenteditable') === 'true'
      if (isInput) return
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault()
        openHabitForm()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [openHabitForm])

  return (
    <div className="flex h-full">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-y-auto pb-16 md:pb-0">
        {children}
      </main>
      <MobileNav />
      <HabitForm />
      <CommandMenu />
      <OfflineBanner />
      <Toast />
    </div>
  )
}
`);

// ─────────────────────────────────────────────────────────────────
// 2. Updated Settings Page — Supabase Setup, Cloud Sync Status,
//    PWA section, Data export/import
// ─────────────────────────────────────────────────────────────────
writeFile('src/app/settings/page.tsx', `
'use client'

import * as React from 'react'
import { useUIStore } from '@/lib/store/ui'
import { useHabitStore } from '@/lib/store/habits'
import { useSyncStore } from '@/lib/store/sync'
import { SyncStatus } from '@/components/v4/sync-status'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Download, Upload, Trash2, Cloud, Monitor, Smartphone, Moon, Sun } from 'lucide-react'
import type { Theme } from '@/lib/types'

export default function SettingsPage() {
  const theme = useUIStore(s => s.theme)
  const setTheme = useUIStore(s => s.setTheme)
  const cloudEnabled = useSyncStore(s => s.cloudEnabled)
  const habits = useHabitStore(s => s.habits)
  const completions = useHabitStore(s => s.completions)
  const [weekStart, setWeekStart] = React.useState<'0' | '1'>('1')

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
              <Select value={weekStart} onValueChange={v => setWeekStart(v as '0' | '1')}>
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
`);

// ─────────────────────────────────────────────────────────────────
// 3. Updated layout.tsx — PWA meta tags + manifest link
// ─────────────────────────────────────────────────────────────────
writeFile('src/app/layout.tsx', `
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { AppShell } from '@/components/layout/app-shell'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const viewport: Viewport = {
  themeColor: '#6366f1',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: 'Habit — Track Your Consistency',
  description: 'A personal habit tracking platform. Make consistency visible.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Habit',
  },
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/icon-192.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={\`\${geistSans.variable} \${geistMono.variable} h-full\`}
      suppressHydrationWarning
    >
      <body className="h-full antialiased">
        <ThemeProvider>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  )
}
`);

// ─────────────────────────────────────────────────────────────────
// 4. Generate placeholder icons (needed for manifest)
// ─────────────────────────────────────────────────────────────────
// We'll create simple SVG icons and reference them via manifest
writeFile('public/icons/icon.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192">
  <rect width="192" height="192" rx="40" fill="#6366f1"/>
  <text x="96" y="130" font-size="100" text-anchor="middle" fill="white" font-family="system-ui">H</text>
</svg>
`);

// Update manifest to use SVG icon as fallback
const manifestPath = path.join(__dirname, 'public/manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
manifest.icons = [
  { src: '/icons/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable any' },
  ...manifest.icons,
];
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
console.log('Updated manifest.json with SVG icon');

console.log('V4 App Shell, Settings, and Layout written');
