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
                  className={`w-8 h-8 text-xl rounded-md flex items-center justify-center transition-all ${
                    avatar === emoji
                      ? 'bg-[var(--accent-subtle)] ring-2 ring-[var(--accent)]'
                      : 'hover:bg-[var(--bg-elevated)]'
                  }`}
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
              onChange={e => setUsername(e.target.value.toLowerCase().replace(/s+/g, '_'))}
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
