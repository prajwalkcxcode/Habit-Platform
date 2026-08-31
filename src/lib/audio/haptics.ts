'use client'

import { useSettingsStore } from '@/lib/store/settings'

class SoundEngine {
  private ctx: AudioContext | null = null

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {})
    }
    return this.ctx
  }

  // Soft, crisp completion toggle pop
  playCompletion() {
    const soundEnabled = useSettingsStore.getState().soundEnabled ?? true
    if (!soundEnabled) return

    const ctx = this.getContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(520, now)
      osc.frequency.exponentialRampToValueAtTime(780, now + 0.08)

      gain.gain.setValueAtTime(0.12, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.12)
    } catch {
      // AudioContext unavailable or blocked
    }
  }

  // Resonant celebratory chime
  playCelebration() {
    const soundEnabled = useSettingsStore.getState().soundEnabled ?? true
    if (!soundEnabled) return

    const ctx = this.getContext()
    if (!ctx) return

    try {
      const notes = [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const now = ctx.currentTime + idx * 0.06
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = 'triangle'
        osc.frequency.setValueAtTime(freq, now)

        gain.gain.setValueAtTime(0.1, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(now)
        osc.stop(now + 0.25)
      })
    } catch {}
  }
}

export const sound = new SoundEngine()

export function triggerHaptic(type: 'light' | 'medium' | 'success' = 'light') {
  const hapticsEnabled = useSettingsStore.getState().hapticsEnabled ?? true
  if (!hapticsEnabled || typeof navigator === 'undefined' || !navigator.vibrate) return

  try {
    if (type === 'light') {
      navigator.vibrate(12)
    } else if (type === 'medium') {
      navigator.vibrate(25)
    } else if (type === 'success') {
      navigator.vibrate([15, 40, 20])
    }
  } catch {}
}
