import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Redirect to the SVG icon to prevent 404 errors for /favicon.ico
  return NextResponse.redirect(new URL('/icon.svg', request.url))
}
