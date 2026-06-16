import { NextResponse } from 'next/server'
import { createSessionToken } from '@/lib/auth'
import { readDataFile, writeDataFile } from '@/lib/data'
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json()

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      )
    }

    // Rate limiting: max 3 OTP attempts per email per 5 minutes
    if (!checkRateLimit(`verify:${email}`, 3, 5 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Too many OTP attempts. Please request a new OTP.' },
        { status: 429 }
      )
    }

    // Read OTPs
    const otps = await readDataFile<Record<string, any>>('otps.json')
    const storedOtp = otps[email]

    if (!storedOtp) {
      return NextResponse.json(
        { error: 'No OTP found. Please request a new one.' },
        { status: 400 }
      )
    }

    // Check if OTP has expired
    if (Date.now() > storedOtp.expiresAt) {
      delete otps[email]
      await writeDataFile('otps.json', otps)
      return NextResponse.json(
        { error: 'OTP has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    // Check if OTP matches
    if (storedOtp.code !== otp) {
      return NextResponse.json(
        { error: 'Invalid OTP. Please try again.' },
        { status: 401 }
      )
    }

    // Delete OTP entry
    delete otps[email]
    await writeDataFile('otps.json', otps)

    // Look up patient data
    const patients = await readDataFile<Record<string, any>>('patients.json')
    const patient = Object.values(patients).find((p: any) => p.email === email)

    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      )
    }

    // Create JWT session
    const token = await createSessionToken({
      userType: 'patient',
      userId: patient.patientId,
      email: patient.email,
      name: patient.name,
    })

    // Set httpOnly cookie
    const response = NextResponse.json({ success: true })
    response.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    })

    return response
  } catch (error) {
    console.error('OTP verification error:', error)
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    )
  }
}
