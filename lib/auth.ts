import { SignJWT, jwtVerify, type JWTPayload } from 'jose'
import bcrypt from 'bcryptjs'

// Password hashing
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Auth types
export type UserRole = 'admin' | 'doctor' | 'receptionist' | 'pharmacist' | 'accountant' | 'patient'

export interface AuthJWTPayload extends JWTPayload {
  id: string
  email: string
  name: string
  role: UserRole
  type: 'patient' | 'staff'
}

export const ROLE_HOME: Record<string, string> = {
  admin:        '/admin/dashboard',
  doctor:       '/doctor/dashboard',
  receptionist: '/receptionist/dashboard',
  pharmacist:   '/pharmacist/dashboard',
  accountant:   '/accountant/dashboard',
  patient:      '/patient/dashboard',
}

// JWT session management
const getJWTSecret = () => {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set')
  }
  return new TextEncoder().encode(secret)
}

export async function createSessionToken(payload: AuthJWTPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(getJWTSecret())
}

export async function verifySessionToken(token: string): Promise<AuthJWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJWTSecret())
    return payload as unknown as AuthJWTPayload
  } catch {
    return null
  }
}
