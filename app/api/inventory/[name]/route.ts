import { NextResponse } from 'next/server'
import { getSessionFromCookie } from '@/lib/auth'
import { readDataFile, writeDataFile } from '@/lib/data'

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
    const inventory = await readDataFile<any[]>('inventory.json')

    const index = inventory.findIndex(
      (item: any) => item.name.toLowerCase() === decodedName.toLowerCase()
    )

    if (index === -1) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    inventory[index] = { ...inventory[index], ...body }
    await writeDataFile('inventory.json', inventory)

    return NextResponse.json({ item: inventory[index], success: true })
  } catch (error) {
    console.error('Update inventory error:', error)
    return NextResponse.json({ error: 'Failed to update inventory' }, { status: 500 })
  }
}
