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

    // Fetch the profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('clerk_user_id', userId)
      .single()

    const parsedProfile = profile ? parseProfile(profile) : null
    const userQuery = messages[messages.length - 1]?.content ?? ''

    const systemContext = `You are the GradPath AI Onboarding Navigator. Your job is to help the student set up their profile in a friendly, conversational way.
Here is the student's current profile:
${parsedProfile ? JSON.stringify(parsedProfile, null, 2) : 'No profile yet.'}

We need to gather the following fields:
1. Target Country/Countries (preferred_countries: e.g. ["USA", "Canada"])
2. CGPA (cgpa: e.g. 8.5)
3. Budget in INR (budget_inr: e.g. 3000000)
4. Field of Study / Branch (branch: e.g. "Computer Science")
5. IELTS or TOEFL score if taken (ielts_score: e.g. 7.5, or toefl_score)
6. Career Goals (career_goals: e.g. "To work in AI research")

Ask friendly, contextual questions to get these details. If they have already filled some, do not ask for them again, but confirm or move to the next missing ones. If they share new information, you MUST output a profile update block at the very end of your response:
[PROFILE_UPDATE]
{
  "cgpa": 8.5,
  "preferred_countries": ["USA"]
}
[/PROFILE_UPDATE]

Once all of the main 4 fields (preferred_countries, cgpa, budget_inr, branch) are successfully collected and stored, output the following block at the very end to indicate onboarding is complete:
[ONBOARDING_COMPLETE]true[/ONBOARDING_COMPLETE]

Be extremely encouraging, concise, and focused on onboarding.`

    const chatHistoryContext = messages.map((m: any) => `${m.role === 'user' ? 'Student' : 'Navigator'}: ${m.content}`).join('\n')
    const finalPrompt = `${systemContext}\n\nChat history:\n${chatHistoryContext}\nStudent: ${userQuery}\nNavigator:`

    const responseText = await askGemini(finalPrompt)

    // Parse and handle updates
    let cleanText = responseText
    let profileUpdated = false
    let updatedFields: any = null
    let onboardingComplete = false

    // Extract profile update block
    const updateRegex = /\[PROFILE_UPDATE\]([\s\S]*?)\[\/PROFILE_UPDATE\]/
    const updateMatch = responseText.match(updateRegex)

    if (updateMatch && updateMatch[1]) {
      try {
        updatedFields = JSON.parse(updateMatch[1].trim())
        cleanText = cleanText.replace(updateRegex, '').trim()

        if (parsedProfile && Object.keys(updatedFields).length > 0) {
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

          if (!upsertErr) {
            profileUpdated = true
          }
        }
      } catch (e) {
        console.error('Failed to parse onboarding profile update:', e)
      }
    }

    // Extract onboarding complete block
    const completeRegex = /\[ONBOARDING_COMPLETE\]([\s\S]*?)\[\/ONBOARDING_COMPLETE\]/
    const completeMatch = cleanText.match(completeRegex)
    if (completeMatch) {
      onboardingComplete = completeMatch[1].trim() === 'true'
      cleanText = cleanText.replace(completeRegex, '').trim()
    }

    // Double check database fields for completion
    if (!onboardingComplete && parsedProfile) {
      const currentCgpa = updatedFields?.cgpa ?? parsedProfile.cgpa
      const currentCountries = updatedFields?.preferred_countries ?? parsedProfile.preferred_countries
      const currentBudget = updatedFields?.budget_inr ?? parsedProfile.budget_inr
      const currentBranch = updatedFields?.branch ?? parsedProfile.branch

      if (currentCgpa !== null && currentCountries && currentCountries.length > 0 && currentBudget !== null && currentBranch !== null) {
        onboardingComplete = true
      }
    }

    return NextResponse.json({
      text: cleanText,
      profileUpdated,
      updatedFields,
      onboardingComplete
    })
  } catch (err) {
    console.error('[Onboarding API] Server error:', err)
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: 'Server onboarding error: ' + msg }, { status: 500 })
  }
}
