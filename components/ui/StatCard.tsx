'use client'

import { type LucideIcon } from 'lucide-react'

const colorMap: Record<string, { bg: string; text: string }> = {
  accent:  { bg: 'bg-[--accent-soft]',  text: 'text-[--accent]'  },
  success: { bg: 'bg-[--success-soft]', text: 'text-[--success]' },
  danger:  { bg: 'bg-[--danger-soft]',  text: 'text-[--danger]'  },
  warning: { bg: 'bg-[--warning-soft]', text: 'text-[--warning]' },
  info:    { bg: 'bg-[--info-soft]',    text: 'text-[--info]'    },
}

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string
  delta?: string
  color?: keyof typeof colorMap
}

export function StatCard({ icon: Icon, label, value, delta, color = 'accent' }: StatCardProps) {
  const { bg, text } = colorMap[color] ?? colorMap.accent
  return (
    <div className="bg-[--surface] rounded-xl border border-[--border] p-5
                    flex items-start justify-between">
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-[0.5px]
                      text-[--text-3] mb-2">{label}</p>
        <p className="text-[28px] font-semibold text-[--text-1] leading-none
                      mb-1">{value}</p>
        {delta && (
          <p className="text-[12px] text-[--text-3]">{delta}</p>
        )}
      </div>
      <div className={`w-9 h-9 rounded-lg ${bg} flex items-center
                       justify-center shrink-0`}>
        <Icon className={`w-4 h-4 ${text}`} />
      </div>
    </div>
  )
}
