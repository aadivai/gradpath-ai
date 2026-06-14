import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { parseProfile, serializeFullName } from '@/utils/profileMetadata'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      full_name,
      branch,
      cgpa,
      backlogs,
      work_experience_months,
      ielts_score,
      gre_score,
      toefl_score,
      budget_inr,
      target_intake,
      preferred_countries,
      research_experience_months,
      projects_count,
      weather_preference,
      language_preference,
      career_goals
    } = body

    // 1. Fetch existing profile to determine the role
    const { data: existing } = await supabase
      .from('profiles')
      .select('*')
      .eq('clerk_user_id', userId)
      .single()

    const existingParsed = existing ? parseProfile(existing) : null
    
    // Default to 'student' unless user has a role assigned in DB (e.g. 'admin' or 'super_admin')
    const resolvedRole = existingParsed?.role || 'student'

    // 2. Serialize full_name column with metadata and resolved role
    const serializedName = serializeFullName(full_name || '', {
      research_experience_months: Number(research_experience_months) || 0,
      projects_count:             Number(projects_count) || 0,
      weather_preference:         weather_preference || 'any',
      language_preference:        language_preference || ['English'],
      career_goals:               career_goals || '',
      role:                       resolvedRole
    })

    const payload = {
      clerk_user_id:          userId,
      full_name:              serializedName,
      email:                  existing?.email || '', // Retain existing email or update if empty
      branch:                 branch || null,
      cgpa:                   cgpa ? parseFloat(cgpa) : null,
      backlogs:               Number(backlogs) || 0,
      work_experience_months: Number(work_experience_months) || 0,
      ielts_score:            ielts_score ? parseFloat(ielts_score) : null,
      gre_score:              gre_score ? parseInt(gre_score) : null,
      toefl_score:            toefl_score ? parseInt(toefl_score) : null,
      budget_inr:             budget_inr ? parseInt(budget_inr) : null,
      target_intake:          target_intake || null,
      preferred_countries:    preferred_countries || [],
      updated_at:             new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'clerk_user_id' })
      .select()
      .single()

    if (error) {
      console.error('[Profile Save API] Database error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const parsedData = data ? parseProfile(data) : null

    return NextResponse.json({ success: true, profile: parsedData })
  } catch (err) {
    console.error('[Profile Save API] Catch error:', err)
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: 'Server error: ' + msg }, { status: 500 })
  }
}
