'use client'

import * as React from 'react'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useUIStore } from '@/lib/store/ui'
import type { ToastMessage } from '@/lib/types'

const ICONS: Record<ToastMessage['type'], React.ReactNode> = {
  success: <CheckCircle className="w-4 h-4 text-green-500" />,
  error: <AlertCircle className="w-4 h-4 text-red-500" />,
  info: <Info className="w-4 h-4 text-blue-500" />,
}

export function Toast() {
  const toast = useUIStore(s => s.toast)
  const clearToast = useUIStore(s => s.clearToast)

  React.useEffect(() => {
    if (!toast) return
    const timer = setTimeout(clearToast, 3000)
    return () => clearTimeout(timer)
  }, [toast, clearToast])

  if (!toast) return null

  return (
    <div
      className={cn(
        'fixed bottom-5 right-5 z-[100] flex items-center gap-3 px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--bg-base)] shadow-lg',
        'animate-in slide-in-from-bottom-4 fade-in-0 duration-200'
      )}
      role="status"
      aria-live="polite"
    >
      {ICONS[toast.type]}
      <p className="text-sm text-[var(--text-primary)]">{toast.message}</p>
      <button
        onClick={clearToast}
        className="ml-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
