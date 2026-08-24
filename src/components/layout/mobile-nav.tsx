'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  CheckSquare,
  Users,
  BookOpen,
  User,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Today', icon: LayoutDashboard },
  { href: '/habits', label: 'Habits', icon: CheckSquare },
  { href: '/social', label: 'Social', icon: Users },
  { href: '/reviews', label: 'Reviews', icon: BookOpen },
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg-base)] border-t border-[var(--border)] h-16 flex items-center justify-around px-1 safe-area-pb">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href + '/'))
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-col items-center justify-center gap-0.5 flex-1 py-1 rounded-lg transition-colors',
              isActive
                ? 'text-[var(--accent)] font-semibold'
                : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
            )}
          >
            <Icon className="w-4.5 h-4.5" strokeWidth={isActive ? 2.5 : 1.5} />
            <span className="text-[9px] tracking-tight">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
