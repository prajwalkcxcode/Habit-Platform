'use client'

import * as React from 'react'
import { WifiOff, Download, X } from 'lucide-react'
import { useSyncStore } from '@/lib/store/sync'

export function OfflineBanner() {
  const isOnline = useSyncStore(s => s.isOnline)
  const setOnline = useSyncStore(s => s.setOnline)
  const [mounted, setMounted] = React.useState(false)
  const [dismissed, setDismissed] = React.useState(false)
  const [deferredPrompt, setDeferredPrompt] = React.useState<Event | null>(null)
  const [showInstallBanner, setShowInstallBanner] = React.useState(false)
  const [isStandalone, setIsStandalone] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    // Check if running in standalone (installed PWA) mode
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches)

    const handleOnline = () => { setOnline(true); setDismissed(false) }
    const handleOffline = () => { setOnline(false); setDismissed(false) }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Capture the install event for the Add to Home Screen prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallBanner(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [setOnline])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    const promptEvent = deferredPrompt as any
    promptEvent.prompt()
    const { outcome } = await promptEvent.userChoice
    if (outcome === 'accepted') {
      setShowInstallBanner(false)
      setDeferredPrompt(null)
    }
  }

  if (!mounted || dismissed) return null

  // Offline alert
  if (!isOnline) {
    return (
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
        <div className="pointer-events-auto mx-4 mb-3 flex items-center gap-3 px-4 py-2.5 rounded-lg bg-amber-500 text-white text-xs font-medium shadow-lg max-w-sm w-full">
          <WifiOff className="w-4 h-4 flex-shrink-0" />
          <span className="flex-1">You're offline — all changes saved locally</span>
          <button onClick={() => setDismissed(true)} className="opacity-70 hover:opacity-100">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    )
  }

  // Install PWA prompt (only shown once, before install)
  if (showInstallBanner && !isStandalone) {
    return (
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
        <div className="pointer-events-auto mx-4 mb-3 flex items-center gap-3 px-4 py-2.5 rounded-lg bg-[var(--bg-base)] border border-[var(--border)] shadow-lg max-w-sm w-full">
          <div className="w-6 h-6 rounded bg-[var(--accent)] flex items-center justify-center flex-shrink-0">
            <span className="text-white text-[10px] font-bold">H</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[var(--text-primary)]">Install Habit Platform</p>
            <p className="text-[10px] text-[var(--text-tertiary)]">Add to home screen for offline-first access</p>
          </div>
          <button
            onClick={handleInstall}
            className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded bg-[var(--accent)] text-white text-xs font-medium hover:opacity-90"
          >
            <Download className="w-3 h-3" /> Install
          </button>
          <button onClick={() => setShowInstallBanner(false)} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    )
  }

  return null
}
