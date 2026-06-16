import type { University, Profile } from '@/types'
import { getSupabaseServer } from '@/lib/serverSupabase'

import { UNIVERSITY_METADATA } from '@/lib/constants'


export interface ScoredUniversity extends University {
  matching_score: number
  why_recommended: string
  admission_probability?: number
  scholarship_probability?: number
  roi_score?: number | null
  employment_score?: number | null
  safety_index?: number | null
  city_rating?: number | null
  nearby_companies?: string | null
  nearby_startups?: string | null
  industry_connections?: string | null
  research_labs?: string | null
  faculty_ratio?: string | null
  internship_opportunities?: string | null
  placement_statistics?: string | null
  international_student_count?: number | null
  language_requirements?: string | null
  image_url?: string | null
}

export async function recommendUniversities(
  profileId: string,
  profile?: Profile
): Promise<{
  safe: ScoredUniversity[]
  moderate: ScoredUniversity[]
  ambitious: ScoredUniversity[]
  dream: ScoredUniversity[]
}> {
  const supabase = await getSupabaseServer()

  // 1. Fetch profile if not provided (needed for helper calculations like scholarship probability)
  let userProfile = profile
  if (!userProfile) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .single()
    if (error) {
      throw new Error(`Profile fetch error: ${error.message}`)
    }
    userProfile = data as Profile
  }

  // 2. Call the RPC function
  const { data: recommendations, error: rpcError } = await supabase.rpc(
    'recommend_universities',
    { p_profile_id: profileId }
  )

  if (rpcError) {
    throw new Error(`RPC error: ${rpcError.message}`)
  }

  if (!recommendations || recommendations.length === 0) {
    return { safe: [], moderate: [], ambitious: [], dream: [] }
  }

  // 3. Fetch full university details for the recommended university IDs
  const uniIds = recommendations.map((r: any) => r.university_id)
  const { data: universities, error: uniError } = await supabase
    .from('universities')
    .select('*')
    .in('id', uniIds)

  if (uniError) {
    throw new Error(`Database error fetching universities: ${uniError.message}`)
  }

  const uniMap = new Map(universities?.map(u => [u.id, u]) ?? [])

  // 4. Enrich and structure the results
  const cgpa = userProfile?.cgpa ?? 0
  const publications = userProfile?.publications_count ?? 0
  const research = userProfile?.research_experience_months ?? 0
  const projects = userProfile?.projects_count ?? 0
  const internships = userProfile?.internships_count ?? 0

  const scored: ScoredUniversity[] = recommendations
    .map((rec: any) => {
      const dbUni = uniMap.get(rec.university_id)
      if (!dbUni) return null

      const meta = UNIVERSITY_METADATA[dbUni.name] || {
        the_ranking: (dbUni.qs_ranking ?? 100) + 10,
        employment_rate: 85,
        visa_success_rate: 90,
        roi_score: 80,
        climate: 'moderate',
        internship_opportunities: 'Broad local student internship schemes.',
        placement_statistics: 'Standard regional placements.',
        international_student_count: 2000,
        language_requirements: 'English',
        image_url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=600',
        safety_index: 82,
        city_rating: 8.5,
        nearby_companies: 'Local consulting firms, tech providers, regional banking offices.',
        nearby_startups: 'SaaS ventures, e-commerce firms, hardware labs.',
        industry_connections: 'Strong relationships with local engineering and business corporations.',
        research_labs: 'Primary regional research departments, digital innovation hubs.',
        faculty_ratio: '1:15'
      }

      // Merge database columns, static metadata, and RPC values
      const enrichedUni: ScoredUniversity = {
        ...dbUni,
        ...meta,
        matching_score: rec.match_score,
        why_recommended: rec.recommendation || 'Good baseline fit for academic and cost preferences.',
        admission_probability: Math.round(rec.match_score),
        tier: rec.tier as 'safe' | 'moderate' | 'ambitious' | 'dream'
      }

      // Recalculate scholarship probability using profile metrics
      const baseSch = cgpa >= 8.5 ? 45 : cgpa >= 7.5 ? 25 : 5
      const schBonus = Math.min(
        45,
        publications * 10 + research * 2 + projects * 4 + internships * 5
      )
      enrichedUni.scholarship_probability = Math.min(95, baseSch + schBonus)

      // ROI and Employment details matching original logic
      enrichedUni.roi_score = meta.roi_score ?? 80
      enrichedUni.employment_score = meta.employment_rate
        ? Math.round((meta.employment_rate / 10) * 10) / 10
        : 8.5

      return enrichedUni
    })
    .filter((u: ScoredUniversity | null): u is ScoredUniversity => u !== null)

  // 5. Categorize into tiers based on RPC tier value
  return {
    safe: scored.filter(u => u.tier === 'safe'),
    moderate: scored.filter(u => u.tier === 'moderate'),
    ambitious: scored.filter(u => u.tier === 'ambitious'),
    dream: scored.filter(u => u.tier === 'dream')
  }
}