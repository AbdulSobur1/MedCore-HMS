'use client'

import { Clock, Construction } from 'lucide-react'

export default function AccountantDashboard() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-16 h-16 rounded-2xl bg-[--accent-soft] flex items-center justify-center mb-6">
        <Construction className="w-8 h-8 text-[--accent]" />
      </div>
      <h1 className="text-2xl font-semibold text-[--text-1] mb-2">Accountant Dashboard</h1>
      <p className="text-sm text-[--text-3] max-w-md">
        This module is coming soon. You&apos;ll be able to manage billing, invoices, payments, and financial reports here.
      </p>
      <div className="flex items-center gap-2 mt-6 text-xs text-[--text-3]">
        <Clock className="w-3.5 h-3.5" />
        <span>Expected release: Next update</span>
      </div>
    </div>
  )
}
