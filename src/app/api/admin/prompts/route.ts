import { NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/serverSupabase'
import { verifyAdmin } from '@/lib/profile'
import { serializeFullName } from '@/utils/profileMetadata'

const DEFAULT_PROMPT = `You are a warm, direct study abroad counselor for Indian students.
Help students match universities, find scholarships, map timelines, and complete visa requirements.`

// GET: Retrieve the active prompt configuration and rollback history
export async function GET(req: Request) {
  try {
    const supabase = await getSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id
    if (!userId || !(await verifyAdmin(userId, supabase))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: configProfile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('clerk_user_id', 'system_config')
      .single()

    let activePrompt = DEFAULT_PROMPT
    let history: any[] = []

    if (configProfile?.full_name && configProfile.full_name.includes('|||')) {
      try {
        const meta = JSON.parse(configProfile.full_name.split('|||')[1])
        activePrompt = meta.activePrompt || activePrompt
        history = meta.history || []
      } catch (e) {}
    }

    return NextResponse.json({ activePrompt, history })
  } catch (err: any) {
    console.error('[Admin Prompts GET] Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST: Sandbox execution, prompt updates, and rollback versions
export async function POST(req: Request) {
  try {
    const supabase = await getSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id
    if (!userId || !(await verifyAdmin(userId, supabase))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { action, promptText, versionId, sandboxPrompt, sandboxQuery } = body

    if (!action) {
      return NextResponse.json({ error: 'Action is required.' }, { status: 400 })
    }

    // Fetch existing configuration profile
    const { data: configProfile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('clerk_user_id', 'system_config')
      .single()

    let activePrompt = DEFAULT_PROMPT
    let history: any[] = []

    if (configProfile?.full_name && configProfile.full_name.includes('|||')) {
      try {
        const meta = JSON.parse(configProfile.full_name.split('|||')[1])
        activePrompt = meta.activePrompt || activePrompt
        history = meta.history || []
      } catch (e) {}
    }

    if (action === 'save') {
      if (!promptText?.trim()) {
        return NextResponse.json({ error: 'Prompt text is required.' }, { status: 400 })
      }

      // Add existing active prompt to history before changing
      const newHistoryItem = {
        id: Date.now().toString(),
        prompt: activePrompt,
        updatedAt: new Date().toISOString(),
        author: userId
      }

      history.unshift(newHistoryItem)

      const serializedName = serializeFullName('System Prompts Config', {
        activePrompt: promptText,
        history: history.slice(0, 30) // limit history
      } as any)

      const { error: upsertErr } = await supabase
        .from('profiles')
        .upsert({
          clerk_user_id: 'system_config',
          full_name: serializedName
        }, { onConflict: 'clerk_user_id' })

      if (upsertErr) throw upsertErr

      await logAuditEvent(userId, 'prompt_update', `Updated AI Counselor active prompt`)
      return NextResponse.json({ success: true, activePrompt: promptText, history })
    }

    if (action === 'rollback') {
      if (!versionId) return NextResponse.json({ error: 'Version ID is required.' }, { status: 400 })

      const version = history.find(h => h.id === versionId)
      if (!version) return NextResponse.json({ error: 'Version not found.' }, { status: 404 })

      // Add current to history
      const newHistoryItem = {
        id: Date.now().toString(),
        prompt: activePrompt,
        updatedAt: new Date().toISOString(),
        author: userId
      }

      const updatedHistory = history.filter(h => h.id !== versionId)
      updatedHistory.unshift(newHistoryItem)

      const serializedName = serializeFullName('System Prompts Config', {
        activePrompt: version.prompt,
        history: updatedHistory
      } as any)

      const { error: upsertErr } = await supabase
        .from('profiles')
        .upsert({
          clerk_user_id: 'system_config',
          full_name: serializedName
        }, { onConflict: 'clerk_user_id' })

      if (upsertErr) throw upsertErr

      await logAuditEvent(userId, 'prompt_rollback', `Rolled back AI active prompt to version from ${version.updatedAt}`)
      return NextResponse.json({ success: true, activePrompt: version.prompt, history: updatedHistory })
    }

    if (action === 'test-sandbox') {
      if (!sandboxPrompt?.trim() || !sandboxQuery?.trim()) {
        return NextResponse.json({ error: 'Sandbox prompt and query are required.' }, { status: 400 })
      }

      // Invoke Gemini API using sandbox system prompt
      const key = process.env.GEMINI_API_KEY
      if (!key) {
        return NextResponse.json({ response: 'GEMINI_API_KEY is missing in backend env.' })
      }

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: sandboxPrompt }]
            },
            contents: [{ parts: [{ text: sandboxQuery }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2048,
            },
          }),
        }
      )

      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}))
        throw new Error(errorJson.error?.message || 'Gemini sandbox execution failed.')
      }

      const responseData = await res.json()
      const answer = responseData.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No response generated.'

      return NextResponse.json({ success: true, response: answer })
    }

    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 })
  } catch (err: any) {
    console.error('[Admin Prompts POST] Error:', err)
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
