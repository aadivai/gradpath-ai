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

    const { data: universities, error } = await supabase
      .from('universities')
      .select('*')
      .order('name', { ascending: true })

    if (error) throw error

    return NextResponse.json({ universities })
  } catch (err: any) {
    console.error('[Admin Universities GET] Error:', err)
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
    const { action, id, universityData, bulkData } = body

    if (!action) {
      return NextResponse.json({ error: 'Action is required.' }, { status: 400 })
    }

    if (action === 'create') {
      if (!universityData) return NextResponse.json({ error: 'University data is required.' }, { status: 400 })
      
      const { data, error } = await supabase
        .from('universities')
        .insert(universityData)
        .select()
        .single()

      if (error) throw error

      await logAuditEvent(userId, 'admin_action', `Created university: ${universityData.name}`)
      return NextResponse.json({ success: true, university: data })
    }

    if (action === 'edit') {
      if (!id || !universityData) {
        return NextResponse.json({ error: 'ID and universityData are required.' }, { status: 400 })
      }

      const { data, error } = await supabase
        .from('universities')
        .update(universityData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      await logAuditEvent(userId, 'admin_action', `Edited university: ${universityData.name} (${id})`)
      return NextResponse.json({ success: true, university: data })
    }

    if (action === 'delete') {
      if (!id) return NextResponse.json({ error: 'ID is required.' }, { status: 400 })

      // Fetch name first for audit log
      const { data: uni } = await supabase.from('universities').select('name').eq('id', id).single()

      const { error } = await supabase
        .from('universities')
        .delete()
        .eq('id', id)

      if (error) throw error

      await logAuditEvent(userId, 'admin_action', `Deleted university: ${uni?.name || id}`)
      return NextResponse.json({ success: true, message: 'University deleted successfully.' })
    }

    if (action === 'bulk-upload') {
      if (!bulkData || !Array.isArray(bulkData) || bulkData.length === 0) {
        return NextResponse.json({ error: 'Valid bulkData array is required.' }, { status: 400 })
      }

      // Supabase supports bulk inserts via passing an array of objects
      const { data, error } = await supabase
        .from('universities')
        .insert(bulkData)
        .select()

      if (error) throw error

      await logAuditEvent(userId, 'admin_action', `Bulk uploaded ${bulkData.length} universities via CSV`)
      return NextResponse.json({ success: true, insertedCount: data?.length || 0 })
    }

    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 })
  } catch (err: any) {
    console.error('[Admin Universities POST] Error:', err)
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
