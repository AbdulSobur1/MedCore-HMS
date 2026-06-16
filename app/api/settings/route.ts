import { NextResponse } from 'next/server'
import { getSessionFromCookie } from '@/lib/auth'
import { readDataFile, writeDataFile } from '@/lib/data'
import { writeAuditLog } from '@/lib/audit'
import { DEFAULT_SETTINGS } from '@/lib/format'

export async function GET() {
  try {
    const session = await getSessionFromCookie()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const settings = await readDataFile<Record<string, any>>('settings.json')
    return NextResponse.json({ settings: { ...DEFAULT_SETTINGS, ...settings } })
  } catch (error) {
    console.error('Settings error:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSessionFromCookie()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const existing = await readDataFile<Record<string, any>>('settings.json')
    const updated = { ...existing, ...body }
    await writeDataFile('settings.json', updated)

    await writeAuditLog({
      userId: session.userId,
      userRole: session.role || 'staff',
      action: 'UPDATE',
      resourceType: 'settings',
      resourceId: 'global',
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    }, request)

    return NextResponse.json({ settings: updated, success: true })
  } catch (error) {
    console.error('Update settings error:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
