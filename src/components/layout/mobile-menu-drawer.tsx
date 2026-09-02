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
  X,
  Plus,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useUIStore } from '@/lib/store/ui'
import { useHabitStore } from '@/lib/store/habits'
import { useProfileStore } from '@/lib/store/profile'

const PRIMARY_NAV = [
  { href: '/dashboard', label: 'Today', description: 'Daily habits & progress', icon: LayoutDashboard },
  { href: '/habits', label: 'All Habits', description: 'Manage & track habits', icon: CheckSquare },
  { href: '/analytics', label: 'Analytics', description: 'Heatmap & consistency', icon: BarChart2 },
  { href: '/music', label: 'Focus Audio', description: 'Binaural beats & Spotify', icon: Headphones },
]

const FEATURES_NAV = [
  { href: '/routines', label: 'Routines', description: 'Morning & evening flows', icon: Repeat2 },
  { href: '/goals', label: 'Goals', description: 'Milestones & outcomes', icon: Target },
  { href: '/challenges', label: 'Challenges', description: '30-day streak challenges', icon: Trophy },
  { href: '/social', label: 'Social', description: 'Accountability & feed', icon: Users },
  { href: '/reviews', label: 'Reviews', description: 'Weekly & monthly review', icon: BookOpen },
]

interface MobileMenuDrawerProps {
  open?: boolean
  onClose?: () => void
}

export function MobileMenuDrawer({ open: controlledOpen, onClose: controlledClose }: MobileMenuDrawerProps = {}) {
  const pathname = usePathname()
  const storeOpen = useUIStore(s => s.mobileMenuOpen)
  const setStoreOpen = useUIStore(s => s.setMobileMenuOpen)
  const openHabitForm = useUIStore(s => s.openHabitForm)
  const getStats = useHabitStore(s => s.getStats)
  const habits = useHabitStore(s => s.habits)
  const profile = useProfileStore(s => s.profile)
  const hasSetup = useProfileStore(s => s.hasSetup)

  const isOpen = controlledOpen !== undefined ? controlledOpen : storeOpen
  const handleClose = () => {
    if (controlledClose) controlledClose()
    setStoreOpen(false)
  }

  const maxStreak = React.useMemo(() => {
    const activeHabits = habits.filter(h => h.status === 'active')
    if (activeHabits.length === 0) return 0
    return Math.max(0, ...activeHabits.map(h => getStats(h.id).currentStreak))
  }, [habits, getStats])

  // Close on route change
  React.useEffect(() => {
    handleClose()
  }, [pathname])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
        onClick={handleClose}
      />

      {/* Slide-over Drawer */}
      <div className="relative w-4/5 max-w-xs h-full bg-[var(--bg-card)] border-r border-[var(--border)] shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-300">
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[var(--accent)] flex items-center justify-center text-white font-bold text-sm shadow-xs">
              H
            </div>
            <div>
              <span className="text-sm font-bold text-[var(--text-primary)] block leading-tight">
                Habit Platform
              </span>
              <span className="text-[10px] text-[var(--text-tertiary)] block">
                Consistency Engine
              </span>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Button & Streak Pill */}
        <div className="p-3 border-b border-[var(--border)] space-y-2 bg-[var(--bg-subtle)]/50">
          <button
            onClick={() => {
              handleClose()
              openHabitForm()
            }}
            className="w-full h-9 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm active:scale-98 transition-transform"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New Habit</span>
          </button>

          {maxStreak > 0 && (
            <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-xs">
              <span className="text-[11px] text-[var(--text-secondary)] font-medium">Top Streak</span>
              <span className="flex items-center gap-1 text-orange-500 font-bold tabular-nums text-xs">
                <Flame className="w-3.5 h-3.5 fill-orange-500" />
                <span>{maxStreak} days</span>
              </span>
            </div>
          )}
        </div>

        {/* Scrollable Navigation List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-5">
          {/* Main Navigation */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] px-2 mb-1.5">
              Overview
            </p>
            <div className="space-y-1">
              {PRIMARY_NAV.map(({ href, label, description, icon: Icon }) => {
                const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={handleClose}
                    className={cn(
                      'flex items-center justify-between p-2.5 rounded-xl text-xs transition-colors',
                      isActive
                        ? 'bg-[var(--accent-subtle)] text-[var(--accent)] font-semibold shadow-2xs'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-[var(--accent)]' : 'text-[var(--text-tertiary)]')} />
                      <div className="min-w-0">
                        <p className="font-medium text-xs leading-tight truncate">{label}</p>
                        <p className="text-[10px] text-[var(--text-tertiary)] truncate">{description}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-[var(--text-tertiary)] shrink-0 opacity-60" />
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Features Navigation */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] px-2 mb-1.5">
              Features & Tools
            </p>
            <div className="space-y-1">
              {FEATURES_NAV.map(({ href, label, description, icon: Icon }) => {
                const isActive = pathname === href || pathname.startsWith(href)
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={handleClose}
                    className={cn(
                      'flex items-center justify-between p-2.5 rounded-xl text-xs transition-colors',
                      isActive
                        ? 'bg-[var(--accent-subtle)] text-[var(--accent)] font-semibold shadow-2xs'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-[var(--accent)]' : 'text-[var(--text-tertiary)]')} />
                      <div className="min-w-0">
                        <p className="font-medium text-xs leading-tight truncate">{label}</p>
                        <p className="text-[10px] text-[var(--text-tertiary)] truncate">{description}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-[var(--text-tertiary)] shrink-0 opacity-60" />
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Account & Settings */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] px-2 mb-1.5">
              Preferences
            </p>
            <div className="space-y-1">
              <Link
                href="/profile"
                onClick={handleClose}
                className={cn(
                  'flex items-center justify-between p-2.5 rounded-xl text-xs transition-colors',
                  pathname === '/profile'
                    ? 'bg-[var(--accent-subtle)] text-[var(--accent)] font-semibold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-base">{profile.avatarEmoji || '😎'}</span>
                  <div className="min-w-0">
                    <p className="font-medium text-xs leading-tight truncate">{hasSetup && profile.username ? profile.username : 'User Profile'}</p>
                    <p className="text-[10px] text-[var(--text-tertiary)] truncate">Stats & level milestones</p>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[var(--text-tertiary)] shrink-0 opacity-60" />
              </Link>

              <Link
                href="/settings"
                onClick={handleClose}
                className={cn(
                  'flex items-center justify-between p-2.5 rounded-xl text-xs transition-colors',
                  pathname === '/settings'
                    ? 'bg-[var(--accent-subtle)] text-[var(--accent)] font-semibold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Settings className="w-4 h-4 text-[var(--text-tertiary)] shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-xs leading-tight truncate">Settings</p>
                    <p className="text-[10px] text-[var(--text-tertiary)] truncate">Theme, backup & Google sync</p>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[var(--text-tertiary)] shrink-0 opacity-60" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
