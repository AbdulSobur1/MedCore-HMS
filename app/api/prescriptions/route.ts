import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { prescriptions, prescriptionDrugs, staff } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { verifySessionToken } from '@/lib/auth'

export async function GET() {
  try {
    const cookieHeader = await import('next/headers').then(m => m.cookies())
    const token = cookieHeader.get('session')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const session = await verifySessionToken(token)
    if (!session || (session.role !== 'admin' && session.role !== 'doctor' && session.role !== 'pharmacist' && session.role !== 'patient')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    let result
    if (session.role === 'doctor') {
      result = await db.select().from(prescriptions)
        .where(eq(prescriptions.doctorId, session.id))
        .orderBy(prescriptions.createdAt)
    } else if (session.role === 'patient') {
      result = await db.select().from(prescriptions)
        .where(eq(prescriptions.patientId, session.id))
        .orderBy(prescriptions.createdAt)
    } else {
      result = await db.select().from(prescriptions)
        .orderBy(prescriptions.createdAt)
    }

    // Get drugs for each prescription
    const prescriptionsWithDrugs = await Promise.all(
      result.map(async (rx) => {
        const drugs = await db.select().from(prescriptionDrugs)
          .where(eq(prescriptionDrugs.prescriptionId, rx.id))
        return { ...rx, drugs }
      })
    )

    return NextResponse.json({ prescriptions: prescriptionsWithDrugs })
  } catch (error) {
    console.error('Prescriptions list error:', error)
    return NextResponse.json({ error: 'Failed to fetch prescriptions' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const cookieHeader = await import('next/headers').then(m => m.cookies())
    const token = cookieHeader.get('session')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const session = await verifySessionToken(token)
    if (!session || (session.role !== 'doctor' && session.role !== 'admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()

    const [rx] = await db.insert(prescriptions).values({
      patientId: body.patientId,
      doctorId: body.doctorId || session.id,
      diagnosis: body.diagnosis,
      notes: body.notes || null,
      status: 'pending',
    }).returning()

    // Insert drugs
    if (body.drugs && Array.isArray(body.drugs)) {
      for (const drug of body.drugs) {
        await db.insert(prescriptionDrugs).values({
          prescriptionId: rx.id,
          drugName: drug.drugName,
          dosage: drug.dosage,
          frequency: drug.frequency,
          duration: drug.duration,
        })
      }
    }

    return NextResponse.json({ prescription: rx, success: true }, { status: 201 })
  } catch (error) {
    console.error('Create prescription error:', error)
    return NextResponse.json({ error: 'Failed to create prescription' }, { status: 500 })
  }
}
