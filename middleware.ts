import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifySessionToken, ROLE_HOME } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const cookie = request.cookies.get('session')?.value

  // Public routes — never intercept
  if (pathname.startsWith('/auth') || pathname === '/') return NextResponse.next()

  if (!cookie) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  const session = await verifySessionToken(cookie)
  if (!session) {
    const res = NextResponse.redirect(new URL('/auth/login', request.url))
    res.cookies.delete('session')
    return res
  }

  const role = session.role as string

  // Block cross-role access — redirect to own home
  if (pathname.startsWith('/admin')        && role !== 'admin')
    return NextResponse.redirect(new URL(ROLE_HOME[role] || '/auth/login', request.url))
  if (pathname.startsWith('/doctor')       && role !== 'doctor')
    return NextResponse.redirect(new URL(ROLE_HOME[role] || '/auth/login', request.url))
  if (pathname.startsWith('/receptionist') && role !== 'receptionist')
    return NextResponse.redirect(new URL(ROLE_HOME[role] || '/auth/login', request.url))
  if (pathname.startsWith('/pharmacist')   && role !== 'pharmacist')
    return NextResponse.redirect(new URL(ROLE_HOME[role] || '/auth/login', request.url))
  if (pathname.startsWith('/accountant')   && role !== 'accountant')
    return NextResponse.redirect(new URL(ROLE_HOME[role] || '/auth/login', request.url))
  if (pathname.startsWith('/patient')      && role !== 'patient')
    return NextResponse.redirect(new URL(ROLE_HOME[role] || '/auth/login', request.url))

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*', '/doctor/:path*', '/receptionist/:path*',
    '/pharmacist/:path*', '/accountant/:path*', '/patient/:path*',
  ],
}
