import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { verifyAdmin } from '@/lib/profile'
import { parseProfile, serializeFullName } from '@/utils/profileMetadata'

// GET: List all profiles with parsing and query filtering
export async function GET(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId || !(await verifyAdmin(userId))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const searchQuery = searchParams.get('q')?.toLowerCase() || ''
    const roleFilter = searchParams.get('role') || ''

    const { data: rawProfiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    // Parse profiles and extract serialized properties
    let parsed = (rawProfiles ?? []).map(p => {
      const parsedProf = parseProfile(p)
      // Check if user metadata has custom properties (like deactivation status)
      let isDeactivated = false
      if (p.full_name && p.full_name.includes('|||')) {
        try {
          const meta = JSON.parse(p.full_name.split('|||')[1])
          isDeactivated = !!meta.is_deactivated
        } catch (e) {}
      }
      return {
        ...parsedProf,
        is_deactivated: isDeactivated
      }
    })

    // Filter results
    if (searchQuery) {
      parsed = parsed.filter(
        p =>
          p.full_name?.toLowerCase().includes(searchQuery) ||
          p.email?.toLowerCase().includes(searchQuery) ||
          p.branch?.toLowerCase().includes(searchQuery)
      )
    }

    if (roleFilter) {
      parsed = parsed.filter(p => p.role === roleFilter)
    }

    return NextResponse.json({ users: parsed })
  } catch (err: any) {
    console.error('[Admin Users GET] Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST: Manage profile role updates, deactivation, and deletions
export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId || !(await verifyAdmin(userId))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { action, targetUserId, role, isDeactivated } = await req.json()
    if (!targetUserId || !action) {
      return NextResponse.json({ error: 'Missing targetUserId or action.' }, { status: 400 })
    }

    // Fetch the target profile
    const { data: targetProfile, error: fetchErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('clerk_user_id', targetUserId)
      .single()

    if (fetchErr || !targetProfile) {
      return NextResponse.json({ error: 'Target user profile not found.' }, { status: 404 })
    }

    const parsedTarget = parseProfile(targetProfile)

    // Ensure super_admin role can only be updated by another super_admin (or self)
    // For simplicity, we check caller's role if they try to touch super_admin
    const { data: callerProfile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('clerk_user_id', userId)
      .single()
    const callerParsed = parseProfile(callerProfile)
    const isCallerSuperAdmin = callerParsed.role === 'super_admin'

    if (action === 'update-role') {
      if (!role) return NextResponse.json({ error: 'Role is required.' }, { status: 400 })
      
      // Enforce that only super_admins can assign super_admin role
      if (role === 'super_admin' && !isCallerSuperAdmin) {
        return NextResponse.json({ error: 'Only super_admins can assign super_admin role.' }, { status: 403 })
      }

      // Check if target is super_admin and caller is not
      if (parsedTarget.role === 'super_admin' && !isCallerSuperAdmin) {
        return NextResponse.json({ error: 'Cannot modify a super_admin role.' }, { status: 403 })
      }

      // Preserve existing metadata, only update role
      let currentMeta: any = {}
      if (targetProfile.full_name && targetProfile.full_name.includes('|||')) {
        try {
          currentMeta = JSON.parse(targetProfile.full_name.split('|||')[1])
        } catch (e) {}
      }

      const serializedName = serializeFullName(parsedTarget.full_name || '', {
        ...currentMeta,
        role: role
      })

      const { error: updateErr } = await supabase
        .from('profiles')
        .update({ full_name: serializedName })
        .eq('clerk_user_id', targetUserId)

      if (updateErr) throw updateErr

      // Log the event
      await logAuditEvent(userId, 'role_change', `Updated role of user ${targetUserId} to ${role}`)

      return NextResponse.json({ success: true, message: `User role updated to ${role}` })
    }

    if (action === 'toggle-deactivate') {
      if (parsedTarget.role === 'super_admin' && !isCallerSuperAdmin) {
        return NextResponse.json({ error: 'Cannot deactivate a super_admin.' }, { status: 403 })
      }

      let currentMeta: any = {}
      if (targetProfile.full_name && targetProfile.full_name.includes('|||')) {
        try {
          currentMeta = JSON.parse(targetProfile.full_name.split('|||')[1])
        } catch (e) {}
      }

      const serializedName = serializeFullName(parsedTarget.full_name || '', {
        ...currentMeta,
        is_deactivated: !!isDeactivated
      })

      const { error: updateErr } = await supabase
        .from('profiles')
        .update({ full_name: serializedName })
        .eq('clerk_user_id', targetUserId)

      if (updateErr) throw updateErr

      // Log the event
      await logAuditEvent(userId, 'user_deactivate', `${isDeactivated ? 'Deactivated' : 'Reactivated'} user ${targetUserId}`)

      return NextResponse.json({ success: true, message: `User deactivation status set to ${!!isDeactivated}` })
    }

    if (action === 'delete') {
      if (parsedTarget.role === 'super_admin' && !isCallerSuperAdmin) {
        return NextResponse.json({ error: 'Cannot delete a super_admin.' }, { status: 403 })
      }

      const { error: deleteErr } = await supabase
        .from('profiles')
        .delete()
        .eq('clerk_user_id', targetUserId)

      if (deleteErr) throw deleteErr

      // Log the event
      await logAuditEvent(userId, 'admin_action', `Deleted profile of user ${targetUserId}`)

      return NextResponse.json({ success: true, message: 'User profile deleted successfully.' })
    }

    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 })
  } catch (err: any) {
    console.error('[Admin Users POST] Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// Internal Audit Log Helper
async function logAuditEvent(actorClerkId: string, actionType: string, detail: string) {
  try {
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

    // Prepend new log and limit to 100 entries
    logs.unshift(newLog)
    const limitedLogs = logs.slice(0, 100)

    const serializedName = serializeFullName('Audit Logs Data', {
      logs: limitedLogs
    } as any)

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
