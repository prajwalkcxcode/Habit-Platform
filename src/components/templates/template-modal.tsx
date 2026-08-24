'use client'

import * as React from 'react'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from '@/components/ui/modal'
import { STARTER_TEMPLATES } from '@/lib/store/templates'
import { useHabitStore } from '@/lib/store/habits'
import { useUIStore } from '@/lib/store/ui'
import { Button } from '@/components/ui/button'
import { Sparkles, Check } from 'lucide-react'

interface TemplateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TemplateModal({ open, onOpenChange }: TemplateModalProps) {
  const addHabit = useHabitStore(s => s.addHabit)
  const showToast = useUIStore(s => s.showToast)
  const [selectedId, setSelectedId] = React.useState<string | null>(null)

  const handleInstall = async (templateId: string) => {
    const template = STARTER_TEMPLATES.find(t => t.id === templateId)
    if (!template) return

    for (const h of template.habits) {
      await addHabit({
        name: h.name,
        description: h.description,
        icon: h.icon,
        accentColor: h.accentColor,
        frequency: { type: h.frequencyType },
        preferredTime: h.preferredTime,
        priority: 'medium',
        difficulty: 'medium',
        status: 'active',
      })
    }

    showToast(`Installed "${template.name}" starter pack (${template.habits.length} habits)`, 'success')
    onOpenChange(false)
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <ModalHeader>
          <ModalTitle className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--accent)]" /> Habit Starter Packs & Templates
          </ModalTitle>
        </ModalHeader>

        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {STARTER_TEMPLATES.map(tmpl => (
            <div
              key={tmpl.id}
              onClick={() => setSelectedId(tmpl.id)}
              className={`p-4 rounded-lg border cursor-pointer transition-all space-y-3 flex flex-col justify-between ${
                selectedId === tmpl.id
                  ? 'border-[var(--accent)] bg-[var(--accent-subtle)]'
                  : 'border-[var(--border)] bg-[var(--bg-base)] hover:border-[var(--border-strong)]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-2xl">{tmpl.icon}</span>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-[var(--bg-elevated)] text-[var(--text-tertiary)]">
                    {tmpl.category}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-[var(--text-primary)]">{tmpl.name}</h4>
                <p className="text-xs text-[var(--text-tertiary)] mt-1">{tmpl.description}</p>

                <div className="space-y-1 mt-3 border-t border-[var(--border)] pt-2">
                  {tmpl.habits.map((h, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                      <span>{h.icon}</span>
                      <span className="truncate">{h.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                size="sm"
                variant={selectedId === tmpl.id ? 'default' : 'secondary'}
                className="w-full mt-3"
                onClick={(e) => {
                  e.stopPropagation()
                  handleInstall(tmpl.id)
                }}
              >
                Install Starter Pack
              </Button>
            </div>
          ))}
        </div>

        <ModalFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
