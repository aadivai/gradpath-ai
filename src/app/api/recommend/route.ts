import { NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/serverSupabase'
import { scoreAndFilter } from '@/lib/recommender'
import { askGemini } from '@/lib/gemini'
import { parseProfile } from '@/utils/profileMetadata'

export async function GET() {
  try {
    const supabase = await getSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [profileRes, universitiesRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('clerk_user_id', userId).single(),
      supabase.from('universities').select('*'),
    ])

    if (profileRes.error) {
      console.error('[Recommend API] Profile fetch error:', profileRes.error)
      if (profileRes.error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Complete your profile first.' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Database error fetching profile: ' + profileRes.error.message }, { status: 500 })
    }

    if (universitiesRes.error) {
      console.error('[Recommend API] Universities fetch error:', universitiesRes.error)
      return NextResponse.json({ error: 'Database error fetching universities: ' + universitiesRes.error.message }, { status: 500 })
    }

    const profile = profileRes.data
    const universities = universitiesRes.data

    if (!profile)     return NextResponse.json({ error: 'Complete your profile first.' }, { status: 404 })
    if (!universities) return NextResponse.json({ error: 'No university data found.' },   { status: 500 })

    const parsedProfile = parseProfile(profile)
    const { safe, moderate, ambitious, dream } = scoreAndFilter(universities, parsedProfile)

    const prompt = `You are a warm, direct study abroad counselor for Indian students.
Student profile:
- Branch: ${parsedProfile.branch}
- CGPA: ${parsedProfile.cgpa}/10
- IELTS: ${parsedProfile.ielts_score ?? 'not taken'}
- GRE: ${parsedProfile.gre_score ?? 'not taken'}
- Research Exp: ${parsedProfile.research_experience_months ?? 0} months
- Projects: ${parsedProfile.projects_count ?? 0} completed
- Budget: ₹${parsedProfile.budget_inr?.toLocaleString() ?? 'not set'}/year
- Countries: ${parsedProfile.preferred_countries?.join(', ') || 'no preference'}
- Target Intake: ${parsedProfile.target_intake ?? 'not set'}
- Climate Pref: ${parsedProfile.weather_preference ?? 'any'}
- Career Goals: ${parsedProfile.career_goals ?? 'not set'}
- Safe options found: ${safe.length}, Moderate: ${moderate.length}, Ambitious: ${ambitious.length}, Dream: ${dream.length}

Write exactly 3 short, punchy sentences: 
1. Their strongest asset for studying abroad (highlighting research or projects if significant).
2. Which tier/country to prioritize and why.
3. One specific actionable tip (mentioning their career goals).
No bullet points. No generic advice.`

    const aiInsight = await askGemini(prompt)

    return NextResponse.json({ safe, moderate, ambitious, dream, aiInsight, profile: parsedProfile })
  } catch (err: any) {
    console.error('[Recommend API] Critical error:', err)
    return NextResponse.json({ error: 'Server recommendation error: ' + err.message }, { status: 500 })
  }
}