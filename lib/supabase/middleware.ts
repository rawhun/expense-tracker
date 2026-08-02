import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const pathname = request.nextUrl.pathname

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy.supabase.co",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy-anon-key",
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach((cookie) => {
              if (!cookie?.name) return
              request.cookies.set(cookie.name, cookie.value)
            })
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach((cookie) => {
              if (!cookie?.name) return
              supabaseResponse.cookies.set(cookie.name, cookie.value, cookie.options)
            })
          },
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register')
    const isApiRoute = pathname.startsWith('/api/')
    const isPublicApi = pathname.startsWith('/api/auth/callback')

    if (
      !user &&
      !isAuthRoute &&
      !isPublicApi &&
      pathname !== '/'
    ) {
      if (isApiRoute) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    if (user && isAuthRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  } catch (error) {
    console.error('Middleware session update failed:', error)
    // Fail open for public routes; send protected routes to login
    const isPublic =
      pathname === '/' ||
      pathname.startsWith('/login') ||
      pathname.startsWith('/register') ||
      pathname.startsWith('/api/auth/callback')
    if (!isPublic && !pathname.startsWith('/api/')) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
    if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/callback')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  return supabaseResponse
}
