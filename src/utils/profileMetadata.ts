import type { Profile } from '@/types'

export interface ExtendedMetadata {
  research_experience_months: number
  projects_count: number
  publications_count: number
  internships_count: number
  weather_preference: 'warm' | 'cold' | 'moderate' | 'any'
  language_preference: string[]
  career_goals: string
  role?: 'student' | 'mentor' | 'moderator' | 'admin' | 'super_admin'
}

export const DEFAULT_METADATA: ExtendedMetadata = {
  research_experience_months: 0,
  projects_count: 0,
  publications_count: 0,
  internships_count: 0,
  weather_preference: 'any',
  language_preference: ['English'],
  career_goals: '',
  role: 'student'
}

export function parseProfile(raw: any): Profile {
  if (!raw) return raw

  const result = { ...raw } as Profile
  const fullName = raw.full_name ?? ''

  if (fullName.includes('|||')) {
    const [name, metaStr] = fullName.split('|||')
    result.full_name = name.trim()
    try {
      const meta = JSON.parse(metaStr)
      result.research_experience_months = meta.research_experience_months ?? DEFAULT_METADATA.research_experience_months
      result.projects_count = meta.projects_count ?? DEFAULT_METADATA.projects_count
      result.publications_count = meta.publications_count ?? DEFAULT_METADATA.publications_count
      result.internships_count = meta.internships_count ?? DEFAULT_METADATA.internships_count
      result.weather_preference = meta.weather_preference ?? DEFAULT_METADATA.weather_preference
      result.language_preference = meta.language_preference ?? DEFAULT_METADATA.language_preference
      result.career_goals = meta.career_goals ?? DEFAULT_METADATA.career_goals
      result.role = meta.role ?? DEFAULT_METADATA.role
    } catch (e) {
      console.error('Failed to parse profile metadata:', e)
      Object.assign(result, DEFAULT_METADATA)
    }
  } else {
    // Populate defaults
    Object.assign(result, DEFAULT_METADATA)
  }

  return result
}

export function serializeFullName(name: string | null, metadata: Partial<ExtendedMetadata>): string {
  const cleanName = (name ?? '').split('|||')[0].trim()
  const mergedMeta = {
    research_experience_months: metadata.research_experience_months ?? DEFAULT_METADATA.research_experience_months,
    projects_count: metadata.projects_count ?? DEFAULT_METADATA.projects_count,
    publications_count: metadata.publications_count ?? DEFAULT_METADATA.publications_count,
    internships_count: metadata.internships_count ?? DEFAULT_METADATA.internships_count,
    weather_preference: metadata.weather_preference ?? DEFAULT_METADATA.weather_preference,
    language_preference: metadata.language_preference ?? DEFAULT_METADATA.language_preference,
    career_goals: metadata.career_goals ?? DEFAULT_METADATA.career_goals,
    role: metadata.role ?? DEFAULT_METADATA.role
  }
  return `${cleanName}|||${JSON.stringify(mergedMeta)}`
}
