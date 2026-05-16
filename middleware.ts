import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// @supabase/supabase-js pulls in 'ws' which uses __dirname — not available in
// the Edge Runtime. Check the auth cookie directly instead; server components
// use createServerClient (Node.js runtime) for actual session validation.
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === '/login' || pathname.startsWith('/auth/')) {
    return NextResponse.next({ request })
  }

  const hasSession = request.cookies.getAll().some(
    c => c.name.startsWith('sb-') && c.name.endsWith('-auth-token')
  )

  if (!hasSession) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next({ request })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
