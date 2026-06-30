import { NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/serverSupabase'
import { verifyAdmin } from '@/lib/profile'

// GET: Retrieve all audit log entries
export async function GET(req: Request) {
  try {
    const supabase = await getSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id
    if (!userId || !(await verifyAdmin(userId, supabase))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const actionFilter = searchParams.get('action') || ''
    const actorFilter = searchParams.get('actor') || ''

    const { data: logsProfile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('clerk_user_id', 'system_audit_logs')
      .single()

    let logs: any[] = []
    if (logsProfile?.full_name && logsProfile.full_name.includes('|||')) {
      try {
        const meta = JSON.parse(logsProfile.full_name.split('|||')[1])
        logs = meta.logs || []
      } catch (e) {}
    }

    // Apply filters
    if (actionFilter) {
      logs = logs.filter(l => l.action === actionFilter)
    }
    if (actorFilter) {
      logs = logs.filter(l => l.actor?.toLowerCase().includes(actorFilter.toLowerCase()))
    }

    return NextResponse.json({ logs })
  } catch (err: any) {
    console.error('[Admin Logs GET] Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
