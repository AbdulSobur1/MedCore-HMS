import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-14 h-14 rounded-full bg-[--accent-soft] flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-[--accent]" />
      </div>
      <p className="text-[15px] font-medium text-[--text-1] mb-1">{title}</p>
      {description && (
        <p className="text-[13px] text-[--text-3] mb-4">{description}</p>
      )}
      {action}
    </div>
  )
}
