import { NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/serverSupabase'
import { recommendUniversities } from '@/lib/recommender'
import { explainRecommendations } from '@/lib/ai/explainRecommendations'
import { parseProfile } from '@/utils/profileMetadata'
import type { ScoredUniversity } from '@/lib/recommender'

export async function GET() {
  try {
    const supabase = await getSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const profileRes = await supabase.from('profiles').select('*').eq('clerk_user_id', userId).single()

    if (profileRes.error) {
      console.error('[Recommend API] Profile fetch error:', profileRes.error)
      if (profileRes.error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Complete your profile first.' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Database error fetching profile: ' + profileRes.error.message }, { status: 500 })
    }

    const profile = profileRes.data

    if (!profile) return NextResponse.json({ error: 'Complete your profile first.' }, { status: 404 })

    const parsedProfile = parseProfile(profile)
    const { safe, moderate, ambitious, dream } = await recommendUniversities(profile.id, parsedProfile)

    // Combine all recommended universities to identify the top 5 by match score
    const allUnis = [...safe, ...moderate, ...ambitious, ...dream]
    const top5 = [...allUnis]
      .sort((a, b) => b.matching_score - a.matching_score)
      .slice(0, 5)

    // Generate explanations using Gemini
    const explanationResult = await explainRecommendations(parsedProfile, top5)

    // Map explanation results to a lookup Map
    const explanationMap = new Map(
      explanationResult.recommendations.map(r => [r.university, r])
    )

    // Helper to merge explanation fields back into ScoredUniversity
    const mergeExplanation = (uni: ScoredUniversity) => {
      const exp = explanationMap.get(uni.name)
      return {
        ...uni,
        ai_explanation: exp?.explanation || null,
        strengths: exp?.strengths || null,
        considerations: exp?.considerations || null
      }
    }

    const mergedSafe = safe.map(mergeExplanation)
    const mergedModerate = moderate.map(mergeExplanation)
    const mergedAmbitious = ambitious.map(mergeExplanation)
    const mergedDream = dream.map(mergeExplanation)

    // Formulate the flat recommendations array matching the requested response format
    const flatRecommendations = [...mergedSafe, ...mergedModerate, ...mergedAmbitious, ...mergedDream]
      .map(uni => ({
        name: uni.name,
        match_score: uni.matching_score,
        recommendation: uni.why_recommended,
        ai_explanation: uni.ai_explanation || `Calculated as a ${uni.tier} match. ${uni.why_recommended}`,
        strengths: uni.strengths || ['Meets minimum entry thresholds', 'Matches preferred region'],
        considerations: uni.considerations || ['Review specific visa deadlines']
      }))

    return NextResponse.json({
      safe: mergedSafe,
      moderate: mergedModerate,
      ambitious: mergedAmbitious,
      dream: mergedDream,
      aiInsight: explanationResult.overview,
      profile: parsedProfile,
      recommendations: flatRecommendations
    })
  } catch (err: any) {
    console.error('[Recommend API] Critical error:', err)
    return NextResponse.json({ error: 'Server recommendation error: ' + err.message }, { status: 500 })
  }
}