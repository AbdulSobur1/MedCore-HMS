import { readDataFile, writeDataFile } from './data'
import { getSessionFromCookie } from './auth'

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
    const logs = await readDataFile<AuditEntry[]>('audit_logs.json')
    const ipAddress = request?.headers?.get('x-forwarded-for') || 'unknown'
    const userAgent = request?.headers?.get('user-agent') || 'unknown'

    const newEntry: AuditEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      ipAddress,
      userAgent,
    }
    logs.push(newEntry)
    await writeDataFile('audit_logs.json', logs)
    return newEntry
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
  let logs = await readDataFile<AuditEntry[]>('audit_logs.json')

  if (filters?.userId) {
    logs = logs.filter((l) => l.userId === filters.userId)
  }
  if (filters?.resourceType) {
    logs = logs.filter((l) => l.resourceType === filters.resourceType)
  }
  if (filters?.from) {
    const from = new Date(filters.from).getTime()
    logs = logs.filter((l) => new Date(l.timestamp).getTime() >= from)
  }
  if (filters?.to) {
    const to = new Date(filters.to).getTime()
    logs = logs.filter((l) => new Date(l.timestamp).getTime() <= to)
  }

  const page = filters?.page || 1
  const limit = filters?.limit || 50
  const start = (page - 1) * limit
  const paginated = logs.slice(start, start + limit)

  return {
    logs: paginated,
    total: logs.length,
    page,
    totalPages: Math.ceil(logs.length / limit),
  }
}
