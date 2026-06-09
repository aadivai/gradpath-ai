export type Profile = {
  id: string
  clerk_user_id: string
  full_name: string | null
  cgpa: number | null
  branch: string | null
  backlogs: number
  work_experience_months: number
  budget_inr: number | null
  ielts_score: number | null
  gre_score: number | null
  toefl_score: number | null
  preferred_countries: string[]
  target_intake: string | null
  email: string | null
}

export type University = {
  id: string
  name: string
  country: string
  city: string | null
  qs_ranking: number | null
  acceptance_rate: number | null
  min_cgpa: number | null
  min_ielts: number | null
  min_gre: number | null
  annual_fee_usd: number | null
  living_cost_usd: number | null
  programs: string[]
  tier: 'safe' | 'moderate' | 'ambitious'
  application_deadline: string | null
  website_url: string | null
}

export type Scholarship = {
  id: string
  name: string
  country: string | null
  amount_usd: number | null
  is_fully_funded: boolean
  type: 'merit' | 'need' | 'government' | 'university'
  eligible_degrees: string[] | null
  min_cgpa: number | null
  deadline: string | null
  link: string | null
  description: string | null
}

export type RecommendResult = {
  safe: University[]
  moderate: University[]
  ambitious: University[]
  aiInsight: string
  profile: Profile
}

export type TimelineTask = {
  id: string
  profile_id?: string
  title: string
  description?: string | null
  due_month: number
  is_completed: boolean
  category:
    | "test_prep"
    | "documents"
    | "applications"
    | "visa"
    | "finance"
  created_at?: string
}