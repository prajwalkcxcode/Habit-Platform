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
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useUIStore } from '@/lib/store/ui'
import { useHabitStore } from '@/lib/store/habits'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/habits', label: 'Habits', icon: CheckSquare },
  { href: '/routines', label: 'Routines', icon: Repeat2 },
  { href: '/goals', label: 'Goals', icon: Target },
  { href: '/challenges', label: 'Challenges', icon: Trophy },
  { href: '/social', label: 'Social', icon: Users },
  { href: '/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/reviews', label: 'Reviews', icon: BookOpen },
]

export function Sidebar() {
  const pathname = usePathname()
  const collapsed = useUIStore(s => s.sidebarCollapsed)
  const setSidebarCollapsed = useUIStore(s => s.setSidebarCollapsed)
  const getStats = useHabitStore(s => s.getStats)
  const habits = useHabitStore(s => s.habits)

  const maxStreak = React.useMemo(() => {
    const activeHabits = habits.filter(h => h.status === 'active')
    if (activeHabits.length === 0) return 0
    return Math.max(...activeHabits.map(h => getStats(h.id).currentStreak))
  }, [habits, getStats])

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col h-full border-r border-[var(--border)] bg-[var(--bg-base)] transition-all duration-200 shrink-0',
        collapsed ? 'w-14' : 'w-52'
      )}
    >
      <div className={cn(
        'flex items-center h-12 border-b border-[var(--border)] px-3 gap-2.5',
        collapsed && 'justify-center'
      )}>
        <div className="w-6 h-6 rounded bg-[var(--accent)] flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-bold">H</span>
        </div>
        {!collapsed && (
          <span className="text-sm font-semibold text-[var(--text-primary)] tracking-tight">
            Habit Platform
          </span>
        )}
      </div>

      <nav className="flex-1 py-2 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2.5 mx-1.5 px-2 py-1.5 rounded-md text-sm transition-colors',
                isActive
                  ? 'bg-[var(--accent-subtle)] text-[var(--accent)] font-medium'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]',
                collapsed && 'justify-center px-0'
              )}
              title={collapsed ? label : undefined}
            >
              <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={isActive ? 2 : 1.5} />
              {!collapsed && <span>{label}</span>}
            </Link>
          )
        })}
      </nav>

      {maxStreak > 0 && (
        <div className={cn(
          'mx-1.5 mb-1 px-2 py-2 rounded-md bg-[var(--bg-elevated)] border border-[var(--border)]',
          collapsed ? 'flex justify-center' : 'flex items-center gap-2'
        )}>
          <Flame className="w-4 h-4 text-orange-500 flex-shrink-0" />
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[var(--text-primary)] tabular-nums">
                {maxStreak} {maxStreak === 1 ? 'day' : 'days'}
              </p>
              <p className="text-[10px] text-[var(--text-tertiary)] leading-tight">best streak</p>
            </div>
          )}
        </div>
      )}

      <div className="border-t border-[var(--border)] p-1.5 flex flex-col gap-0.5">
        <Link
          href="/profile"
          className={cn(
            'flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm transition-colors',
            pathname === '/profile'
              ? 'bg-[var(--accent-subtle)] text-[var(--accent)] font-medium'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]',
            collapsed && 'justify-center'
          )}
          title={collapsed ? 'Profile' : undefined}
        >
          <User className="w-4 h-4 flex-shrink-0" strokeWidth={pathname === '/profile' ? 2 : 1.5} />
          {!collapsed && <span>Profile</span>}
        </Link>
        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm transition-colors',
            pathname === '/settings'
              ? 'bg-[var(--accent-subtle)] text-[var(--accent)] font-medium'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]',
            collapsed && 'justify-center'
          )}
          title={collapsed ? 'Settings' : undefined}
        >
          <Settings className="w-4 h-4 flex-shrink-0" strokeWidth={pathname === '/settings' ? 2 : 1.5} />
          {!collapsed && <span>Settings</span>}
        </Link>
        <button
          onClick={() => setSidebarCollapsed(!collapsed)}
          className={cn(
            'flex items-center gap-2.5 w-full px-2 py-1.5 rounded-md text-sm transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]',
            collapsed && 'justify-center'
          )}
        >
          {collapsed
            ? <PanelLeftOpen className="w-4 h-4" strokeWidth={1.5} />
            : <PanelLeftClose className="w-4 h-4" strokeWidth={1.5} />}
          {!collapsed && <span className="text-xs">Collapse</span>}
        </button>
      </div>
    </aside>
  )
}
