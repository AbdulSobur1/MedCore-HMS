import { NextResponse } from 'next/server'
import { hashPassword, generatePatientId } from '@/lib/auth'
import { readDataFile, writeDataFile } from '@/lib/data'
import { z } from 'zod'

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(1, 'Phone is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['M', 'F', 'Other']),
  bloodType: z.string().min(1, 'Blood type is required'),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validated = registerSchema.parse(body)

    // Read existing patients
    const patients = await readDataFile<Record<string, any>>('patients.json')

    // Check for duplicate email
    const emailExists = Object.values(patients).some(
      (p: any) => p.email === validated.email
    )
    if (emailExists) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      )
    }

    const patientId = generatePatientId()
    const patient = {
      patientId,
      ...validated,
      createdAt: new Date().toISOString(),
    }

    patients[patientId] = patient
    await writeDataFile('patients.json', patients)

    return NextResponse.json({ patientId, success: true }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    )
  }
}
