import { createAuditLog, getAuditLogsFiltered } from './data'

export interface AuditEntry {
  id: string
  userId: string
  userRole: string
  action: 'READ' | 'CREATE' | 'UPDATE' | 'DELETE'
  resourceType: 'patient' | 'prescription' | 'invoice' | 'appointment' | 'staff' | 'settings'
  resourceId: string
  ipAddress: string
  userAgent: string
  timestamp: string
  metadata?: Record<string, unknown>
}

export async function writeAuditLog(
  entry: Omit<AuditEntry, 'id' | 'timestamp'>,
  request?: Request
) {
  try {
    const newEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      ipAddress: request?.headers?.get('x-forwarded-for') || entry.ipAddress || 'unknown',
      userAgent: request?.headers?.get('user-agent') || entry.userAgent || 'unknown',
    }
    return await createAuditLog(newEntry)
  } catch {
    // Silently fail if audit logging errors
    return null
  }
}

export async function getAuditLogs(filters?: {
  userId?: string
  resourceType?: string
  from?: string
  to?: string
  page?: number
  limit?: number
}) {
  return getAuditLogsFiltered(filters)
}
