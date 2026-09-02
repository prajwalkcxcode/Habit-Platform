'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  CheckSquare,
  BarChart2,
  Headphones,
  Settings,
  Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useUIStore } from '@/lib/store/ui'

export function MobileNav() {
  const pathname = usePathname()
  const openHabitForm = useUIStore(s => s.openHabitForm)

  const isTodayActive = pathname === '/dashboard' || pathname === '/'
  const isHabitsActive = pathname.startsWith('/habits')
  const isMusicActive = pathname.startsWith('/music')
  const isSettingsActive = pathname.startsWith('/settings') || pathname.startsWith('/profile')

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg-card)]/90 backdrop-blur-xl border-t border-[var(--border)] h-16 flex items-center justify-around px-2 safe-area-pb shadow-elevated">
      {/* 1. Today */}
      <Link
        href="/dashboard"
        className={cn(
          'flex flex-col items-center justify-center gap-0.5 flex-1 py-1 rounded-xl transition-colors',
          isTodayActive
            ? 'text-[var(--accent)] font-semibold'
            : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
        )}
      >
        <LayoutDashboard className="w-5 h-5" strokeWidth={isTodayActive ? 2.3 : 1.6} />
        <span className="text-[10px] tracking-tight">Today</span>
      </Link>

      {/* 2. Habits */}
      <Link
        href="/habits"
        className={cn(
          'flex flex-col items-center justify-center gap-0.5 flex-1 py-1 rounded-xl transition-colors',
          isHabitsActive
            ? 'text-[var(--accent)] font-semibold'
            : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
        )}
      >
        <CheckSquare className="w-5 h-5" strokeWidth={isHabitsActive ? 2.3 : 1.6} />
        <span className="text-[10px] tracking-tight">Habits</span>
      </Link>

      {/* 3. Center Add Floating Action Button */}
      <div className="flex-1 flex justify-center items-center">
        <button
          onClick={() => openHabitForm()}
          className="w-11 h-11 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white flex items-center justify-center shadow-lg transition-transform active:scale-95"
          aria-label="Create new habit"
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
        </button>
      </div>

      {/* 4. Focus Music */}
      <Link
        href="/music"
        className={cn(
          'flex flex-col items-center justify-center gap-0.5 flex-1 py-1 rounded-xl transition-colors',
          isMusicActive
            ? 'text-[var(--accent)] font-semibold'
            : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
        )}
      >
        <Headphones className="w-5 h-5" strokeWidth={isMusicActive ? 2.3 : 1.6} />
        <span className="text-[10px] tracking-tight">Music</span>
      </Link>

      {/* 5. Settings / Profile */}
      <Link
        href="/settings"
        className={cn(
          'flex flex-col items-center justify-center gap-0.5 flex-1 py-1 rounded-xl transition-colors',
          isSettingsActive
            ? 'text-[var(--accent)] font-semibold'
            : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
        )}
      >
        <Settings className="w-5 h-5" strokeWidth={isSettingsActive ? 2.3 : 1.6} />
        <span className="text-[10px] tracking-tight">Settings</span>
      </Link>
    </nav>
  )
}
