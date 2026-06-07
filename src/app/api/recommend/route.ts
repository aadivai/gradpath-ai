// src/app/api/recommend/route.ts
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { scoreAndFilter } from '@/lib/recommender'
import { askGemini } from '@/lib/gemini'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [{ data: profile }, { data: universities }] = await Promise.all([
    supabase.from('profiles').select('*').eq('clerk_user_id', userId).single(),
    supabase.from('universities').select('*'),
  ])

  if (!profile)     return NextResponse.json({ error: 'Complete your profile first.' }, { status: 404 })
  if (!universities) return NextResponse.json({ error: 'No university data found.' },   { status: 500 })

  const { safe, moderate, ambitious } = scoreAndFilter(universities, profile)

  const prompt = `You are a warm, direct study abroad counselor for Indian students.
Student profile:
- Branch: ${profile.branch}
- CGPA: ${profile.cgpa}/10
- IELTS: ${profile.ielts_score ?? 'not taken'}
- GRE: ${profile.gre_score ?? 'not taken'}
- Budget: ₹${profile.budget_inr?.toLocaleString() ?? 'not set'}/year
- Countries: ${profile.preferred_countries?.join(', ') || 'no preference'}
- Intake: ${profile.target_intake ?? 'not set'}
- Safe options found: ${safe.length}, Moderate: ${moderate.length}, Ambitious: ${ambitious.length}

Write exactly 3 short, punchy sentences: 
1. Their strongest asset for studying abroad.
2. Which tier/country to prioritize and why.
3. One specific actionable tip for their profile.
No bullet points. No generic advice.`

  const aiInsight = await askGemini(prompt)

  return NextResponse.json({ safe, moderate, ambitious, aiInsight, profile })
}