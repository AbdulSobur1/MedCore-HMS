interface StatusBadgeProps {
  status: string
}

const statusColors: Record<string, string> = {
  admitted: 'bg-[--success-soft] text-[--success]',
  active: 'bg-[--success-soft] text-[--success]',
  confirmed: 'bg-[--success-soft] text-[--success]',
  paid: 'bg-[--success-soft] text-[--success]',
  dispensed: 'bg-[--success-soft] text-[--success]',
  critical: 'bg-[--danger-soft] text-[--danger]',
  urgent: 'bg-[--danger-soft] text-[--danger]',
  overdue: 'bg-[--danger-soft] text-[--danger]',
  pending: 'bg-[--warning-soft] text-[--warning]',
  processing: 'bg-[--warning-soft] text-[--warning]',
  discharged: 'bg-[--surface-2] text-[--text-3]',
  cancelled: 'bg-[--surface-2] text-[--text-3]',
  outpatient: 'bg-[--info-soft] text-[--info]',
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const colorClass = statusColors[status.toLowerCase()] || 'bg-[--surface-2] text-[--text-3]'

  return (
    <span className={`inline-block text-[11px] font-medium px-2.5 py-0.5 rounded-full capitalize ${colorClass}`}>
      {status}
    </span>
  )
}
