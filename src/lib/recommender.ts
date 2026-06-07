// src/lib/recommender.ts
import type { University, Profile } from '@/types'

export function scoreAndFilter(universities: University[], profile: Profile) {
  const cgpa       = profile.cgpa ?? 0
  const ielts      = profile.ielts_score ?? 0
  const budgetUSD  = profile.budget_inr ? Math.round(profile.budget_inr / 83) : Infinity
  const countries  = profile.preferred_countries ?? []

  const filtered = universities.filter(uni => {
    // 1. Country preference
    if (countries.length > 0 && !countries.includes(uni.country)) return false

    // 2. Budget — total annual cost must be within 120% of budget
    const totalCost = (uni.annual_fee_usd ?? 0) + (uni.living_cost_usd ?? 0)
    if (budgetUSD < Infinity && totalCost > budgetUSD * 1.2) return false

    // 3. CGPA — exclude if student is more than 1.5 below the minimum
    if (cgpa < (uni.min_cgpa ?? 0) - 1.5) return false

    // 4. IELTS — exclude if student has score and is more than 1 band below minimum
    if (ielts > 0 && uni.min_ielts && ielts < uni.min_ielts - 1.0) return false

    return true
  })

  return {
    safe:      filtered.filter(u => u.tier === 'safe'),
    moderate:  filtered.filter(u => u.tier === 'moderate'),
    ambitious: filtered.filter(u => u.tier === 'ambitious'),
  }
}