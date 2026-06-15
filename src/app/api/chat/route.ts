import { NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/serverSupabase'
import { askGemini } from '@/lib/gemini'
import { parseProfile, serializeFullName } from '@/utils/profileMetadata'

export async function POST(req: Request) {
  try {
    const supabase = await getSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { messages } = await req.json()
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid message list.' }, { status: 400 })
    }

    // Fetch context data (Student profile, Universities, Visas, Scholarships)
    const [profileRes, universitiesRes, visasRes, scholarshipsRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('clerk_user_id', userId).single(),
      supabase.from('universities').select('*'),
      supabase.from('visa_requirements').select('*'),
      supabase.from('scholarships').select('*')
    ])

    const profile = profileRes.data
    const universities = universitiesRes.data
    const visas = visasRes.data
    const scholarships = scholarshipsRes.data

    const parsedProfile = profile ? parseProfile(profile) : null
    const userQuery = messages[messages.length - 1]?.content ?? ''

    // Assemble dynamic context for RAG with instructions for profile memory updates
    const systemContext = `You are GradPath AI, an expert, encouraging study abroad counselor agent.
Student profile details:
${parsedProfile ? JSON.stringify(parsedProfile, null, 2) : 'No profile completed yet.'}

Available Universities in Database:
${JSON.stringify(universities?.map(u => ({ id: u.id, name: u.name, country: u.country, city: u.city, qs: u.qs_ranking, cgpa: u.min_cgpa, ielts: u.min_ielts, fee: u.annual_fee_usd, living: u.living_cost_usd, programs: u.programs })) || [], null, 2)}

Available Scholarships in Database:
${JSON.stringify(scholarships?.map(s => ({ name: s.name, country: s.country, type: s.type, amount: s.amount_usd, fully_funded: s.is_fully_funded, min_cgpa: s.min_cgpa, desc: s.description })) || [], null, 2)}

Visa Requirements:
${JSON.stringify(visas || [], null, 2)}

Student query: "${userQuery}"

Provide a highly relevant, helpful, and concise answer (max 150 words). Format key details with bold markdown text or short bullet lists.

Additionally, you have access to update the student's profile. If the student reveals new information about themselves (like a new CGPA, IELTS/GRE/TOEFL score, preferred countries, work experience, publications, projects, or budget), you MUST output a profile update block at the very end of your response in the exact format:
[PROFILE_UPDATE]
{
  "cgpa": 8.5,
  "preferred_countries": ["Canada"]
}
[/PROFILE_UPDATE]
Only update fields that are explicitly mentioned or changed. Do not output this block if no new details were shared.`

    const responseText = await askGemini(systemContext)

    // Parse profile update block if present
    let cleanText = responseText
    let profileUpdated = false
    let updatedFields: any = null

    const updateRegex = /\[PROFILE_UPDATE\]([\s\S]*?)\[\/PROFILE_UPDATE\]/
    const match = responseText.match(updateRegex)

    if (match && match[1]) {
      try {
        updatedFields = JSON.parse(match[1].trim())
        cleanText = responseText.replace(updateRegex, '').trim()

        if (parsedProfile && Object.keys(updatedFields).length > 0) {
          // Merge fields into existing profile
          const merged = { ...parsedProfile, ...updatedFields }

          const resolvedRole = parsedProfile.role || 'student'
          const serializedName = serializeFullName(merged.full_name || '', {
            research_experience_months: Number(merged.research_experience_months) || 0,
            projects_count:             Number(merged.projects_count) || 0,
            publications_count:         Number(merged.publications_count) || 0,
            internships_count:          Number(merged.internships_count) || 0,
            weather_preference:         merged.weather_preference || 'any',
            language_preference:        merged.language_preference || ['English'],
            career_goals:               merged.career_goals || '',
            role:                       resolvedRole
          })

          const payload = {
            clerk_user_id:          userId,
            full_name:              serializedName,
            email:                  profile?.email || '',
            branch:                 merged.branch || null,
            cgpa:                   merged.cgpa ? parseFloat(merged.cgpa) : null,
            backlogs:               Number(merged.backlogs) || 0,
            work_experience_months: Number(merged.work_experience_months) || 0,
            ielts_score:            merged.ielts_score ? parseFloat(merged.ielts_score) : null,
            gre_score:              merged.gre_score ? parseInt(merged.gre_score) : null,
            toefl_score:            merged.toefl_score ? parseInt(merged.toefl_score) : null,
            budget_inr:             merged.budget_inr ? parseInt(merged.budget_inr) : null,
            target_intake:          merged.target_intake || null,
            preferred_countries:    merged.preferred_countries || [],
            updated_at:             new Date().toISOString()
          }

          const { error: upsertErr } = await supabase
            .from('profiles')
            .upsert(payload, { onConflict: 'clerk_user_id' })

          if (upsertErr) {
            console.error('[Chat API] Failed to auto-update profile:', upsertErr)
          } else {
            profileUpdated = true
          }
        }
      } catch (parseErr) {
        console.error('[Chat API] Failed to parse profile update block:', parseErr)
      }
    }

    return NextResponse.json({ 
      text: cleanText, 
      profileUpdated, 
      updatedFields 
    })
  } catch (err) {
    console.error('[Chat API] Server chat error:', err)
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: 'Server chat error: ' + msg }, { status: 500 })
  }
}
