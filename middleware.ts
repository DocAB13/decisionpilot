import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  // /decision/new is open to anonymous users (H05 WF-1, IR01-065).
  // /decision/:id is also open to anonymous users carrying a valid anonymous_token
  // (H13 §2.1) — the same query param every /api/decision/* route already accepts
  // in place of a session; ownership of the token itself is enforced at the API/DB
  // layer, not here.
  const protectedPaths = ['/dashboard', '/history']
  const hasAnonymousToken = request.nextUrl.searchParams.has('anonymous_token')
  const isDecisionProtected =
    pathname.startsWith('/decision/') && pathname !== '/decision/new' && !hasAnonymousToken
  const authPaths = ['/auth/login', '/auth/signup']

  if (user && authPaths.includes(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (!user && (protectedPaths.some(p => pathname.startsWith(p)) || isDecisionProtected)) {
    const returnUrl = encodeURIComponent(pathname)
    return NextResponse.redirect(new URL(`/auth/login?return=${returnUrl}`, request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}