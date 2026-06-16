import { NextResponse } from 'next/server'
import { getSessionFromCookie } from '@/lib/auth'
import { updateInventoryItem } from '@/lib/data'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const session = await getSessionFromCookie()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name } = await params
    const decodedName = decodeURIComponent(name)
    const body = await request.json()

    const updated = await updateInventoryItem(decodedName, body)

    if (!updated) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    return NextResponse.json({ item: updated, success: true })
  } catch (error) {
    console.error('Update inventory error:', error)
    return NextResponse.json({ error: 'Failed to update inventory' }, { status: 500 })
  }
}
