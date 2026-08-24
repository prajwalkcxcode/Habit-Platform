'use client'

import * as React from 'react'
import { User, Edit } from 'lucide-react'
import { useProfileStore } from '@/lib/store/profile'
import { ConsistencyCard } from '@/components/v5/consistency-card'
import { PartnerPanel } from '@/components/v5/partner-panel'
import { WeeklyWinCard } from '@/components/v5/weekly-win-card'
import { ProfileSetupModal } from '@/components/v5/profile-setup-modal'
import { Button } from '@/components/ui/button'

export default function ProfilePage() {
  const profile = useProfileStore(s => s.profile)
  const hasSetup = useProfileStore(s => s.hasSetup)
  const [setupOpen, setSetupOpen] = React.useState(!hasSetup)

  React.useEffect(() => {
    if (!hasSetup) setSetupOpen(true)
  }, [hasSetup])

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:px-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Your Profile</h1>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
            Share your consistency card and stay accountable with partners.
          </p>
        </div>
        <Button size="sm" variant="secondary" onClick={() => setSetupOpen(true)}>
          <Edit className="w-3.5 h-3.5" /> Edit Profile
        </Button>
      </div>

      {/* Consistency Card */}
      <ConsistencyCard />

      {/* Weekly Win */}
      <WeeklyWinCard />

      {/* Accountability Partners */}
      <div className="p-5 rounded-lg border border-[var(--border)] bg-[var(--bg-base)]">
        <PartnerPanel />
      </div>

      {/* Profile Setup Modal */}
      <ProfileSetupModal open={setupOpen} onOpenChange={setSetupOpen} />
    </div>
  )
}
