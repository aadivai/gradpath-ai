// middleware.ts  (replace entirely)
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { refreshSupabaseSession } from './src/utils/supabase/middleware'
import { type NextRequest, NextResponse } from 'next/server'

const isProtected = createRouteMatcher([
  '/dashboard(.*)', '/profile(.*)', '/universities(.*)',
  '/scholarships(.*)', '/sop-assistant(.*)', '/visa(.*)',
  '/timeline(.*)', '/saved-universities(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  if (isProtected(req)) await auth.protect()

  const response = NextResponse.next()
  await refreshSupabaseSession(req as NextRequest, response)
  return response
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}