'use client'

import * as React from 'react'
import { WeeklyReviewCard } from '@/components/v6/weekly-review-card'
import { MonthlyReviewCard } from '@/components/v6/monthly-review-card'
import { YearReviewCard } from '@/components/v6/year-review-card'
import { CorrelationsCard } from '@/components/v6/correlations-card'
import { SmartRemindersCard } from '@/components/v6/smart-reminders-card'

export default function ReviewsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:px-8 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Reviews & Insights</h1>
        <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
          Weekly recaps, monthly trends, habit correlations, and smart timing recommendations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <WeeklyReviewCard />
        <MonthlyReviewCard />
      </div>

      <YearReviewCard />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CorrelationsCard />
        <SmartRemindersCard />
      </div>
    </div>
  )
}
