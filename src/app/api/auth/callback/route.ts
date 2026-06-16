import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/dashboard'

  if (code) {
    try {
      const cookieStore = await cookies()
      const supabase = createClient(cookieStore)
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (!error) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          // Verify profile exists (fallback in case DB trigger is slow or not configured)
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('clerk_user_id', user.id)
            .maybeSingle()

          if (!profile) {
            const { serializeFullName } = require('@/utils/profileMetadata')
            const serializedName = serializeFullName(user.user_metadata?.full_name || 'New Student', {
              role: 'student'
            })
            
            await supabase.from('profiles').insert({
              id: user.id,
              clerk_user_id: user.id,
              email: user.email || '',
              full_name: serializedName,
              backlogs: 0,
              work_experience_months: 0
            })
          }
        }
        return NextResponse.redirect(new URL(next, request.url))
      } else {
        console.error('Session exchange error:', error.message)
      }
    } catch (err) {
      console.error('Session exchange exception:', err)
    }
  }

  // Redirect to login with error state
  return NextResponse.redirect(new URL('/login?error=Could%20not%20verify%20session', request.url))
}
