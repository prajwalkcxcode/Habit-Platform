const fs = require('fs');
const path = require('path');

function writeFile(relPath, content) {
  const fullPath = path.join(__dirname, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Wrote ' + relPath);
}

// ─────────────────────────────────────────────────────────────────
// 1. Profile Setup Onboarding Modal
// ─────────────────────────────────────────────────────────────────
writeFile('src/components/v5/profile-setup-modal.tsx', `
'use client'

import * as React from 'react'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useProfileStore } from '@/lib/store/profile'

const AVATAR_OPTIONS = ['😎','🧠','💪','🌱','🚀','🎯','🔥','📚','🧘','🦁','🐺','⚡','🏔','🌊','🎸','🎨']

interface ProfileSetupModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProfileSetupModal({ open, onOpenChange }: ProfileSetupModalProps) {
  const profile = useProfileStore(s => s.profile)
  const setProfile = useProfileStore(s => s.setProfile)

  const [username, setUsername] = React.useState(profile.username || '')
  const [bio, setBio] = React.useState(profile.bio || '')
  const [avatar, setAvatar] = React.useState(profile.avatarEmoji || '😎')

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) return
    setProfile({ username: username.trim(), bio: bio.trim(), avatarEmoji: avatar })
    onOpenChange(false)
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-sm">
        <ModalHeader>
          <ModalTitle>Your Profile</ModalTitle>
        </ModalHeader>
        <form onSubmit={handleSave} className="p-5 space-y-5">
          {/* Avatar Picker */}
          <div>
            <Label className="mb-2 block">Pick your avatar</Label>
            <div className="grid grid-cols-8 gap-1.5">
              {AVATAR_OPTIONS.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setAvatar(emoji)}
                  className={\`w-8 h-8 text-xl rounded-md flex items-center justify-center transition-all \${
                    avatar === emoji
                      ? 'bg-[var(--accent-subtle)] ring-2 ring-[var(--accent)]'
                      : 'hover:bg-[var(--bg-elevated)]'
                  }\`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="mb-1.5 block">Username</Label>
            <Input
              placeholder="e.g. prajwal_k"
              value={username}
              onChange={e => setUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
              maxLength={24}
              required
            />
            <p className="text-[10px] text-[var(--text-tertiary)] mt-1">
              Your share code: <span className="font-mono font-bold text-[var(--accent)]">{profile.shareCode}</span>
            </p>
          </div>

          <div>
            <Label className="mb-1.5 block">Bio <span className="text-[var(--text-tertiary)]">(optional)</span></Label>
            <Input placeholder="Building better habits one day at a time..." value={bio} onChange={e => setBio(e.target.value)} maxLength={80} />
          </div>

          <ModalFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Save Profile</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}
`);

// ─────────────────────────────────────────────────────────────────
// 2. Public Consistency Card component
// ─────────────────────────────────────────────────────────────────
writeFile('src/components/v5/consistency-card.tsx', `
'use client'

import * as React from 'react'
import { Flame, Trophy, CheckCircle2, Share2, Copy, Check } from 'lucide-react'
import { useProfileStore } from '@/lib/store/profile'
import { useHabitStore } from '@/lib/store/habits'
import { useV3Store } from '@/lib/store/v3'
import { computeWeeklySummary } from '@/lib/social/weekly-summary'
import { useSettingsStore } from '@/lib/store/settings'
import { Button } from '@/components/ui/button'

export function ConsistencyCard() {
  const profile = useProfileStore(s => s.profile)
  const habits = useHabitStore(s => s.habits)
  const completions = useHabitStore(s => s.completions)
  const getStats = useHabitStore(s => s.getStats)
  const userXP = useV3Store(s => s.userXP)
  const weekStartsOn = useSettingsStore(s => s.weekStartsOn)
  const [copied, setCopied] = React.useState(false)

  const activeHabits = habits.filter(h => h.status === 'active')
  const maxStreak = activeHabits.length > 0
    ? Math.max(...activeHabits.map(h => getStats(h.id).currentStreak))
    : 0
  const bestStreak = activeHabits.length > 0
    ? Math.max(...activeHabits.map(h => getStats(h.id).bestStreak))
    : 0

  const weekly = computeWeeklySummary(habits, completions, weekStartsOn)

  const handleCopy = () => {
    const text = \`\${profile.avatarEmoji} \${profile.username || 'Anonymous'} on Habit Platform
This week: \${weekly.completed}/\${weekly.total} habits (\${weekly.consistencyPct}%)
Current streak: \${maxStreak} days
Level \${userXP.level} · \${userXP.xp} XP
Share code: \${profile.shareCode}\`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--bg-base)] space-y-5">
      {/* Identity */}
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center text-3xl">
          {profile.avatarEmoji}
        </div>
        <div>
          <h2 className="text-base font-bold text-[var(--text-primary)]">
            {profile.username || 'Anonymous'}
          </h2>
          {profile.bio && (
            <p className="text-xs text-[var(--text-secondary)] max-w-[220px]">{profile.bio}</p>
          )}
          <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5 font-mono">
            Code: <span className="font-bold text-[var(--accent)]">{profile.shareCode}</span>
          </p>
        </div>
        <div className="ml-auto">
          <div className="w-10 h-10 rounded-full bg-[var(--accent)] text-white flex items-center justify-center font-bold text-sm">
            L{userXP.level}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: <Flame className="w-4 h-4 text-orange-500" />, label: 'Streak', value: \`\${maxStreak}d\` },
          { icon: <Trophy className="w-4 h-4 text-yellow-500" />, label: 'Best', value: \`\${bestStreak}d\` },
          { icon: <CheckCircle2 className="w-4 h-4 text-[var(--accent)]" />, label: 'This week', value: \`\${weekly.consistencyPct}%\` },
        ].map(({ icon, label, value }) => (
          <div key={label} className="p-3 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] text-center">
            <div className="flex justify-center mb-1">{icon}</div>
            <p className="text-base font-bold text-[var(--text-primary)] tabular-nums">{value}</p>
            <p className="text-[10px] text-[var(--text-tertiary)]">{label}</p>
          </div>
        ))}
      </div>

      {/* Weekly summary */}
      <div className="p-3 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border)] text-xs text-[var(--text-secondary)]">
        <span className="font-semibold text-[var(--text-primary)]">This week</span>
        {' '}— {weekly.completed} of {weekly.total} habits completed
        {weekly.topHabitName && (
          <span className="text-[var(--text-tertiary)]"> · Top: {weekly.topHabitName}</span>
        )}
      </div>

      {/* Share button */}
      <Button variant="secondary" size="sm" className="w-full" onClick={handleCopy}>
        {copied
          ? <><Check className="w-3.5 h-3.5 text-green-500" /> Copied to clipboard!</>
          : <><Share2 className="w-3.5 h-3.5" /> Share my consistency card</>
        }
      </Button>
    </div>
  )
}
`);

// ─────────────────────────────────────────────────────────────────
// 3. Accountability Partner Panel
// ─────────────────────────────────────────────────────────────────
writeFile('src/components/v5/partner-panel.tsx', `
'use client'

import * as React from 'react'
import { Bell, Trash2, Users, Plus, CheckCircle2, MinusCircle } from 'lucide-react'
import { useProfileStore } from '@/lib/store/profile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useUIStore } from '@/lib/store/ui'
import { toDateString } from '@/lib/utils/date'

const AVATAR_OPTIONS = ['😎','🧠','💪','🌱','🚀','🎯','🔥','📚','🧘','🦁']

export function PartnerPanel() {
  const partners = useProfileStore(s => s.partners)
  const addPartner = useProfileStore(s => s.addPartner)
  const removePartner = useProfileStore(s => s.removePartner)
  const nudgePartner = useProfileStore(s => s.nudgePartner)
  const simulatePartnerCheckin = useProfileStore(s => s.simulatePartnerCheckin)
  const showToast = useUIStore(s => s.showToast)

  const [addingPartner, setAddingPartner] = React.useState(false)
  const [code, setCode] = React.useState('')
  const [partnerUsername, setPartnerUsername] = React.useState('')
  const [partnerAvatar, setPartnerAvatar] = React.useState('🧠')

  const todayStr = toDateString(new Date())

  const handleAddPartner = (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim() || !partnerUsername.trim()) return
    addPartner(code.toUpperCase(), partnerUsername, partnerAvatar)
    showToast(\`Accountability partner "\${partnerUsername}" added!\`, 'success')
    setCode('')
    setPartnerUsername('')
    setAddingPartner(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
          Accountability Partners ({partners.length}/3)
        </h3>
        {partners.length < 3 && (
          <Button size="sm" variant="secondary" onClick={() => setAddingPartner(!addingPartner)}>
            <Plus className="w-3.5 h-3.5" /> Add Partner
          </Button>
        )}
      </div>

      {/* Add Partner Form */}
      {addingPartner && (
        <form onSubmit={handleAddPartner} className="p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1.5 block text-xs">Their Share Code</Label>
              <Input
                placeholder="e.g. ABCD12"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="font-mono uppercase"
                required
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs">Their Username</Label>
              <Input placeholder="e.g. alex_k" value={partnerUsername} onChange={e => setPartnerUsername(e.target.value)} required />
            </div>
          </div>
          <div>
            <Label className="mb-1.5 block text-xs">Their Avatar</Label>
            <div className="flex gap-1.5 flex-wrap">
              {AVATAR_OPTIONS.map(e => (
                <button key={e} type="button" onClick={() => setPartnerAvatar(e)}
                  className={\`w-8 h-8 text-lg rounded-md \${partnerAvatar === e ? 'ring-2 ring-[var(--accent)] bg-[var(--accent-subtle)]' : 'hover:bg-[var(--bg-elevated)]'}\`}>
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" size="sm" onClick={() => setAddingPartner(false)}>Cancel</Button>
            <Button type="submit" size="sm">Add Partner</Button>
          </div>
        </form>
      )}

      {/* Partner List */}
      {partners.length === 0 && !addingPartner && (
        <div className="text-center py-6 text-xs text-[var(--text-tertiary)]">
          <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p>No partners yet. Share your code and add theirs.</p>
        </div>
      )}

      {partners.map(partner => {
        const checkedInToday = partner.lastCheckedInDate === todayStr
        return (
          <div key={partner.id} className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border)] bg-[var(--bg-base)]">
            <div className="w-10 h-10 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center text-xl flex-shrink-0">
              {partner.avatarEmoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--text-primary)]">{partner.username}</p>
              <div className="flex items-center gap-1 mt-0.5">
                {checkedInToday
                  ? <><CheckCircle2 className="w-3 h-3 text-green-500" /><span className="text-[10px] text-green-500">Checked in today</span></>
                  : <><MinusCircle className="w-3 h-3 text-[var(--text-tertiary)]" /><span className="text-[10px] text-[var(--text-tertiary)]">Not yet today</span></>
                }
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {!checkedInToday && !partner.nudgeSentToday && (
                <Button size="sm" variant="secondary" className="h-7 text-xs" onClick={() => {
                  nudgePartner(partner.id)
                  showToast(\`Nudged \${partner.username}!\`, 'info')
                }}>
                  <Bell className="w-3 h-3" /> Nudge
                </Button>
              )}
              {/* Demo: simulate partner check-in */}
              {!checkedInToday && (
                <Button size="sm" variant="secondary" className="h-7 text-[10px]" onClick={() => {
                  simulatePartnerCheckin(partner.id)
                  showToast(\`\${partner.username} checked in! (simulated)\`, 'success')
                }}>
                  Simulate ✓
                </Button>
              )}
              <button onClick={() => removePartner(partner.id)} className="text-[var(--text-tertiary)] hover:text-red-500 p-1">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
`);

console.log('V5 UI Components written');
