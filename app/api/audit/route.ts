import { NextResponse } from 'next/server'
import { getSessionFromCookie } from '@/lib/auth'
import { getAuditLogs } from '@/lib/audit'

export async function GET(request: Request) {
  try {
    const session = await getSessionFromCookie()
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const filters = {
      userId: searchParams.get('userId') || undefined,
      resourceType: searchParams.get('resourceType') || undefined,
      from: searchParams.get('from') || undefined,
      to: searchParams.get('to') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '50'),
    }

    const result = await getAuditLogs(filters)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Audit log error:', error)
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 })
  }
}
