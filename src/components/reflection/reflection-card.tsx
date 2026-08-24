'use client'

import * as React from 'react'
import { useReflectionsStore } from '@/lib/store/reflections'
import { useUIStore } from '@/lib/store/ui'
import { toDateString, formatDate } from '@/lib/utils/date'
import { Smile, Zap, Save, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface ReflectionCardProps {
  date?: string // YYYY-MM-DD
}

const MOODS = ['😞', '😕', '😐', '🙂', '😊']
const ENERGIES = ['🪫', '🔋', '⚡', '🔥', '🚀']

export function ReflectionCard({ date }: ReflectionCardProps) {
  const targetDate = date ?? toDateString(new Date())
  const reflections = useReflectionsStore(s => s.reflections)
  const saveReflection = useReflectionsStore(s => s.saveReflection)
  const showToast = useUIStore(s => s.showToast)

  const existing = reflections.find(r => r.date === targetDate)

  const [mood, setMood] = React.useState<number>(existing?.mood ?? 3)
  const [energy, setEnergy] = React.useState<number>(existing?.energy ?? 3)
  const [journalText, setJournalText] = React.useState<string>(existing?.journalText ?? '')
  const [whatWentWell, setWhatWentWell] = React.useState<string>(existing?.whatWentWell ?? '')
  const [whatToImprove, setWhatToImprove] = React.useState<string>(existing?.whatToImprove ?? '')
  const [isExpanded, setIsExpanded] = React.useState(false)

  React.useEffect(() => {
    if (existing) {
      setMood(existing.mood)
      setEnergy(existing.energy)
      setJournalText(existing.journalText ?? '')
      setWhatWentWell(existing.whatWentWell ?? '')
      setWhatToImprove(existing.whatToImprove ?? '')
    }
  }, [existing])

  const handleSave = async () => {
    await saveReflection({
      date: targetDate,
      mood,
      energy,
      journalText: journalText || undefined,
      whatWentWell: whatWentWell || undefined,
      whatToImprove: whatToImprove || undefined,
    })
    showToast('Daily reflection saved', 'success')
  }

  return (
    <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-base)] space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[var(--accent)]" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            Daily Reflection
          </h3>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-[var(--accent)] hover:underline"
        >
          {isExpanded ? 'Collapse' : 'Journal & Reflection Notes'}
        </button>
      </div>

      {/* Mood & Energy Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Mood */}
        <div className="space-y-1.5">
          <Label className="text-xs">Mood Today</Label>
          <div className="flex items-center justify-between bg-[var(--bg-subtle)] p-1.5 rounded-md border border-[var(--border)]">
            {MOODS.map((emoji, index) => {
              const val = index + 1
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => setMood(val)}
                  className={`w-7 h-7 rounded flex items-center justify-center text-sm transition-transform ${
                    mood === val ? 'bg-[var(--accent-subtle)] ring-2 ring-[var(--accent)] scale-110' : 'hover:scale-105 opacity-60'
                  }`}
                >
                  {emoji}
                </button>
              )
            })}
          </div>
        </div>

        {/* Energy */}
        <div className="space-y-1.5">
          <Label className="text-xs">Energy Level</Label>
          <div className="flex items-center justify-between bg-[var(--bg-subtle)] p-1.5 rounded-md border border-[var(--border)]">
            {ENERGIES.map((emoji, index) => {
              const val = index + 1
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => setEnergy(val)}
                  className={`w-7 h-7 rounded flex items-center justify-center text-sm transition-transform ${
                    energy === val ? 'bg-[var(--accent-subtle)] ring-2 ring-[var(--accent)] scale-110' : 'hover:scale-105 opacity-60'
                  }`}
                >
                  {emoji}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Expanded Journal Prompts */}
      {isExpanded && (
        <div className="space-y-3 pt-2 border-t border-[var(--border)] animate-in fade-in-0">
          <div>
            <Label className="mb-1 block">What went well today?</Label>
            <Textarea
              placeholder="Completed workout early, focused morning..."
              value={whatWentWell}
              onChange={e => setWhatWentWell(e.target.value)}
              rows={2}
            />
          </div>
          <div>
            <Label className="mb-1 block">What could be improved?</Label>
            <Textarea
              placeholder="Stayed up late browsing phone..."
              value={whatToImprove}
              onChange={e => setWhatToImprove(e.target.value)}
              rows={2}
            />
          </div>
        </div>
      )}

      <div className="flex justify-end pt-1">
        <Button size="sm" onClick={handleSave}>
          <Save className="w-3.5 h-3.5" /> Save Reflection
        </Button>
      </div>
    </div>
  )
}
