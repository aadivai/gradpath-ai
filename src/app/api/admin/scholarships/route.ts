import { NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/serverSupabase'
import { verifyAdmin } from '@/lib/profile'

export async function GET(req: Request) {
  try {
    const supabase = await getSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id
    if (!userId || !(await verifyAdmin(userId, supabase))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: scholarships, error } = await supabase
      .from('scholarships')
      .select('*')
      .order('name', { ascending: true })

    if (error) throw error

    return NextResponse.json({ scholarships })
  } catch (err: any) {
    console.error('[Admin Scholarships GET] Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await getSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id
    if (!userId || !(await verifyAdmin(userId, supabase))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { action, id, scholarshipData } = body

    if (!action) {
      return NextResponse.json({ error: 'Action is required.' }, { status: 400 })
    }

    if (action === 'create') {
      if (!scholarshipData) return NextResponse.json({ error: 'Scholarship data is required.' }, { status: 400 })

      const { data, error } = await supabase
        .from('scholarships')
        .insert(scholarshipData)
        .select()
        .single()

      if (error) throw error

      await logAuditEvent(userId, 'admin_action', `Created scholarship: ${scholarshipData.name}`)
      return NextResponse.json({ success: true, scholarship: data })
    }

    if (action === 'edit') {
      if (!id || !scholarshipData) {
        return NextResponse.json({ error: 'ID and scholarshipData are required.' }, { status: 400 })
      }

      const { data, error } = await supabase
        .from('scholarships')
        .update(scholarshipData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      await logAuditEvent(userId, 'admin_action', `Edited scholarship: ${scholarshipData.name} (${id})`)
      return NextResponse.json({ success: true, scholarship: data })
    }

    if (action === 'delete') {
      if (!id) return NextResponse.json({ error: 'ID is required.' }, { status: 400 })

      // Fetch name for audit log
      const { data: sch } = await supabase.from('scholarships').select('name').eq('id', id).single()

      const { error } = await supabase
        .from('scholarships')
        .delete()
        .eq('id', id)

      if (error) throw error

      await logAuditEvent(userId, 'admin_action', `Deleted scholarship: ${sch?.name || id}`)
      return NextResponse.json({ success: true, message: 'Scholarship deleted successfully.' })
    }

    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 })
  } catch (err: any) {
    console.error('[Admin Scholarships POST] Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// Internal Audit Log Helper
async function logAuditEvent(actorClerkId: string, actionType: string, detail: string) {
  try {
    const supabase = await getSupabaseServer()
    const { data: logsProfile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('clerk_user_id', 'system_audit_logs')
      .single()

    let logs: any[] = []
    if (logsProfile?.full_name && logsProfile.full_name.includes('|||')) {
      try {
        logs = JSON.parse(logsProfile.full_name.split('|||')[1]).logs || []
      } catch (e) {}
    }

    const newLog = {
      timestamp: new Date().toISOString(),
      actor: actorClerkId,
      action: actionType,
      detail: detail
    }

    logs.unshift(newLog)
    const limitedLogs = logs.slice(0, 100)

    const { serializeFullName } = require('@/utils/profileMetadata')
    const serializedName = serializeFullName('Audit Logs Data', {
      logs: limitedLogs
    })

    await supabase
      .from('profiles')
      .upsert({
        clerk_user_id: 'system_audit_logs',
        full_name: serializedName
      }, { onConflict: 'clerk_user_id' })

  } catch (e) {
    console.error('Failed to write audit log:', e)
  }
}
