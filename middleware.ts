// middleware.ts  (replace entirely)
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtected = createRouteMatcher([
  '/dashboard(.*)', '/profile(.*)', '/universities(.*)',
  '/scholarships(.*)', '/sop-assistant(.*)', '/visa(.*)',
  '/timeline(.*)', '/saved-universities(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  if (isProtected(req)) await auth.protect()
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}