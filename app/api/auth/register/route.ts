import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { patients } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { createPatientCode } from '@/lib/codes'

const schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(1, 'Phone is required'),
  dob: z.string().min(1, 'Date of birth is required'),
  gender: z.string().min(1, 'Gender is required'),
  bloodType: z.string().optional(),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  insurance: z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = schema.parse(body)

    // Check if email already exists
    const existing = await db.select().from(patients).where(eq(patients.email, data.email)).limit(1)
    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 409 }
      )
    }

    const patientCode = createPatientCode()

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10)

    // Create patient
    const [patient] = await db.insert(patients).values({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      dob: data.dob,
      gender: data.gender,
      bloodType: data.bloodType || null,
      address: data.address || null,
      emergencyContact: data.emergencyContact || null,
      insurance: data.insurance || null,
      passwordHash,
      patientCode,
      status: 'outpatient',
    }).returning()

    return NextResponse.json({
      success: true,
      patientCode: patient.patientCode,
      patientId: patient.id,
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
