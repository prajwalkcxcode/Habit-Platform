import { create } from 'zustand'
import type { CloudSyncStatus } from '@/lib/cloud/supabase'
import { isCloudEnabled } from '@/lib/cloud/supabase'

interface SyncState {
  status: CloudSyncStatus
  lastSyncedAt: string | null
  isOnline: boolean
  cloudEnabled: boolean
  setStatus: (status: CloudSyncStatus) => void
  setOnline: (online: boolean) => void
  markSynced: () => void
}

export const useSyncStore = create<SyncState>((set) => ({
  status: isCloudEnabled() ? 'idle' : 'disabled',
  lastSyncedAt: null,
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  cloudEnabled: isCloudEnabled(),

  setStatus: (status) => set({ status }),
  setOnline: (online) => set({ isOnline: online }),
  markSynced: () => set({ status: 'success', lastSyncedAt: new Date().toISOString() }),
}))
