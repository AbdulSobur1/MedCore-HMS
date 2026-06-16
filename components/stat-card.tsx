import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  change?: string
  icon: LucideIcon
  color?: 'teal' | 'emerald' | 'rose' | 'amber' | 'sky'
}

const colorMap = {
  teal: 'bg-accent',
  emerald: 'bg-success',
  rose: 'bg-destructive',
  amber: 'bg-warning',
  sky: 'bg-info',
}

export function StatCard({ title, value, change, icon: Icon, color = 'teal' }: StatCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm text-muted-foreground mb-1 truncate">{title}</p>
          <p className="text-xl sm:text-2xl font-bold text-foreground">{value}</p>
          {change && <p className="text-xs text-muted-foreground mt-2">{change}</p>}
        </div>
        <div className={`${colorMap[color]} p-2 sm:p-3 rounded-lg flex-shrink-0`}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
      </div>
    </div>
  )
}
