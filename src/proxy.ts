import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const isAdminRoute = createRouteMatcher(['/admin(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (isAdminRoute(req)) {
    const { userId } = await auth()
    if (!userId) {
      const signInUrl = new URL('/sign-in', req.url)
      return NextResponse.redirect(signInUrl)
    }

    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('clerk_user_id', userId)
        .single()

      let role = 'student'
      if (profile?.full_name && profile.full_name.includes('|||')) {
        const parts = profile.full_name.split('|||')
        if (parts[1]) {
          const meta = JSON.parse(parts[1])
          role = meta.role || 'student'
        }
      }

      if (role !== 'admin' && role !== 'super_admin') {
        const unauthorizedUrl = new URL('/unauthorized', req.url)
        return NextResponse.redirect(unauthorizedUrl)
      }
    } catch (e) {
      console.error('[Middleware] Admin check failure:', e)
      const unauthorizedUrl = new URL('/unauthorized', req.url)
      return NextResponse.redirect(unauthorizedUrl)
    }
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}