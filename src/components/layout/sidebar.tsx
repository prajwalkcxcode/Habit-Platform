'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  CheckSquare,
  Repeat2,
  Target,
  BarChart2,
  Trophy,
  Users,
  User,
  Settings,
  Flame,
  BookOpen,
  Headphones,
  PanelLeftClose,
  PanelLeftOpen,
  Plus
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useUIStore } from '@/lib/store/ui'
import { useHabitStore } from '@/lib/store/habits'

const PRIMARY_NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/habits', label: 'Habits', icon: CheckSquare },
  { href: '/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/music', label: 'Focus Audio', icon: Headphones },
]

const SECONDARY_NAV = [
  { href: '/routines', label: 'Routines', icon: Repeat2 },
  { href: '/goals', label: 'Goals', icon: Target },
  { href: '/challenges', label: 'Challenges', icon: Trophy },
  { href: '/social', label: 'Social', icon: Users },
  { href: '/reviews', label: 'Reviews', icon: BookOpen },
]

export function Sidebar() {
  const pathname = usePathname()
  const collapsed = useUIStore(s => s.sidebarCollapsed)
  const setSidebarCollapsed = useUIStore(s => s.setSidebarCollapsed)
  const openHabitForm = useUIStore(s => s.openHabitForm)
  const getStats = useHabitStore(s => s.getStats)
  const habits = useHabitStore(s => s.habits)

  const maxStreak = React.useMemo(() => {
    const activeHabits = habits.filter(h => h.status === 'active')
    if (activeHabits.length === 0) return 0
    return Math.max(0, ...activeHabits.map(h => getStats(h.id).currentStreak))
  }, [habits, getStats])

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col h-full border-r border-[var(--border)] bg-[var(--bg-card)] transition-all duration-200 shrink-0 z-20',
        collapsed ? 'w-16' : 'w-56'
      )}
    >
      {/* Brand Header */}
      <div className={cn(
        'flex items-center h-14 border-b border-[var(--border)] px-4 gap-3',
        collapsed && 'justify-center px-0'
      )}>
        <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center flex-shrink-0 shadow-xs">
          <span className="text-white text-xs font-black tracking-tighter">H</span>
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <span className="text-sm font-bold text-[var(--text-primary)] tracking-tight">
              Habit
            </span>
            <span className="text-[10px] font-medium text-[var(--text-tertiary)] block leading-none">
              Consistency
            </span>
          </div>
        )}
      </div>

      {/* Quick Action Button */}
      <div className="p-2">
        <button
          onClick={() => openHabitForm()}
          className={cn(
            'w-full flex items-center gap-2 py-2 px-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold shadow-xs transition-transform active:scale-98',
            collapsed && 'justify-center px-0'
          )}
          title="Create Habit (N)"
        >
          <Plus className="w-4 h-4 shrink-0" strokeWidth={2.5} />
          {!collapsed && <span>New Habit</span>}
        </button>
      </div>

      {/* Nav list */}
      <nav className="flex-1 px-2 py-1 overflow-y-auto space-y-4">
        {/* Core Nav */}
        <div className="space-y-0.5">
          {!collapsed && (
            <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
              Overview
            </p>
          )}
          {PRIMARY_NAV.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href + '/'))
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-[var(--accent-subtle)] text-[var(--accent)] font-semibold shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]',
                  collapsed && 'justify-center px-0 py-2'
                )}
                title={collapsed ? label : undefined}
              >
                <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={isActive ? 2.2 : 1.6} />
                {!collapsed && <span>{label}</span>}
              </Link>
            )
          })}
        </div>

        {/* Secondary Nav */}
        <div className="space-y-0.5 pt-2 border-t border-[var(--border)]">
          {!collapsed && (
            <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
              Features
            </p>
          )}
          {SECONDARY_NAV.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-[var(--accent-subtle)] text-[var(--accent)] font-semibold shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]',
                  collapsed && 'justify-center px-0 py-2'
                )}
                title={collapsed ? label : undefined}
              >
                <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={isActive ? 2.2 : 1.6} />
                {!collapsed && <span>{label}</span>}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Streak summary pill */}
      {maxStreak > 0 && (
        <div className={cn(
          'mx-2 mb-2 p-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]',
          collapsed ? 'flex justify-center p-2' : 'flex items-center gap-2.5'
        )}>
          <Flame className="w-4 h-4 text-orange-500 flex-shrink-0 animate-pulse-subtle" />
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-xs font-bold text-[var(--text-primary)] tabular-nums">
                {maxStreak} {maxStreak === 1 ? 'day' : 'days'}
              </p>
              <p className="text-[10px] text-[var(--text-tertiary)] leading-tight">active streak</p>
            </div>
          )}
        </div>
      )}

      {/* Footer Nav & Collapse */}
      <div className="border-t border-[var(--border)] p-2 space-y-0.5">
        <Link
          href="/profile"
          className={cn(
            'flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors',
            pathname === '/profile'
              ? 'bg-[var(--accent-subtle)] text-[var(--accent)] font-semibold'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]',
            collapsed && 'justify-center px-0'
          )}
          title={collapsed ? 'Profile' : undefined}
        >
          <User className="w-4 h-4 flex-shrink-0" strokeWidth={pathname === '/profile' ? 2.2 : 1.6} />
          {!collapsed && <span>Profile</span>}
        </Link>
        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors',
            pathname === '/settings'
              ? 'bg-[var(--accent-subtle)] text-[var(--accent)] font-semibold'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]',
            collapsed && 'justify-center px-0'
          )}
          title={collapsed ? 'Settings' : undefined}
        >
          <Settings className="w-4 h-4 flex-shrink-0" strokeWidth={pathname === '/settings' ? 2.2 : 1.6} />
          {!collapsed && <span>Settings</span>}
        </Link>
        <button
          onClick={() => setSidebarCollapsed(!collapsed)}
          className={cn(
            'flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-xl text-xs font-medium text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors',
            collapsed && 'justify-center px-0'
          )}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed
            ? <PanelLeftOpen className="w-4 h-4" strokeWidth={1.6} />
            : <PanelLeftClose className="w-4 h-4" strokeWidth={1.6} />}
          {!collapsed && <span className="text-[11px]">Collapse</span>}
        </button>
      </div>
    </aside>
  )
}
