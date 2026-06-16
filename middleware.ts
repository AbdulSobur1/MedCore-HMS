import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifySessionToken } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session')?.value

  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/auth/landing', request.url))
  }

  const session = await verifySessionToken(sessionCookie)
  if (!session) {
    const response = NextResponse.redirect(new URL('/auth/landing', request.url))
    response.cookies.delete('session')
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/staff/:path*', '/patient/:path*'],
}
