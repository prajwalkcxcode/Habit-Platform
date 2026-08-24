const fs = require('fs');
const path = require('path');

function writeFile(relPath, content) {
  const fullPath = path.join(__dirname, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Wrote ' + relPath);
}

// ─────────────────────────────────────────────────────────────────
// Updated Mobile Nav — adds Challenges, keeps it clean
// ─────────────────────────────────────────────────────────────────
writeFile('src/components/layout/mobile-nav.tsx', `
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  CheckSquare,
  BarChart2,
  Trophy,
  Target,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Today', icon: LayoutDashboard },
  { href: '/habits', label: 'Habits', icon: CheckSquare },
  { href: '/goals', label: 'Goals', icon: Target },
  { href: '/challenges', label: 'Level Up', icon: Trophy },
  { href: '/analytics', label: 'Stats', icon: BarChart2 },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg-base)] border-t border-[var(--border)] h-16 flex items-center justify-around px-2">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || pathname.startsWith(href + '/')
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors',
              isActive
                ? 'text-[var(--accent)]'
                : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
            )}
          >
            <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.5} />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
`);

// ─────────────────────────────────────────────────────────────────
// .env.local.example — template for users setting up Supabase
// ─────────────────────────────────────────────────────────────────
writeFile('.env.local.example', `# Habit Platform — V4 Environment Variables
# Copy this to .env.local and fill in your values.

# ──── Cloud Sync (Optional) ────────────────────────────────────
# Leave blank to run in local-only mode (Dexie/IndexedDB).
# Create a free project at https://supabase.com and paste your keys here.
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
`);

// ─────────────────────────────────────────────────────────────────
// Update .gitignore to include .env.local
// ─────────────────────────────────────────────────────────────────
let gitignore = '';
try { gitignore = fs.readFileSync('.gitignore', 'utf8'); } catch {}
if (!gitignore.includes('.env.local')) {
  gitignore += '\n# Local env secrets\n.env.local\n';
  fs.writeFileSync('.gitignore', gitignore, 'utf8');
  console.log('Updated .gitignore');
}

console.log('V4 Mobile Nav, env.example written');
