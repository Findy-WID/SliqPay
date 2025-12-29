import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Update Supabase session in middleware
 * This runs alongside your custom auth middleware
 * Keeps Supabase session cookies in sync (optional feature)
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Refresh Supabase session (optional - mainly for direct Supabase queries)
  // Your main auth still uses custom backend tokens
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Note: We don't redirect based on Supabase auth
  // Your existing middleware handles that with accessToken

  return supabaseResponse
}
