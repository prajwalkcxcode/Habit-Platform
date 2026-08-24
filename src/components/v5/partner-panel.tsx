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
    showToast(`Accountability partner "${partnerUsername}" added!`, 'success')
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
                  className={`w-8 h-8 text-lg rounded-md ${partnerAvatar === e ? 'ring-2 ring-[var(--accent)] bg-[var(--accent-subtle)]' : 'hover:bg-[var(--bg-elevated)]'}`}>
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
                  showToast(`Nudged ${partner.username}!`, 'info')
                }}>
                  <Bell className="w-3 h-3" /> Nudge
                </Button>
              )}
              {/* Demo: simulate partner check-in */}
              {!checkedInToday && (
                <Button size="sm" variant="secondary" className="h-7 text-[10px]" onClick={() => {
                  simulatePartnerCheckin(partner.id)
                  showToast(`${partner.username} checked in! (simulated)`, 'success')
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
