// src/app/api/generate-sop/route.ts
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { askGemini } from '@/lib/gemini'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { targetCountry, targetUniversity, background } = await req.json()

  if (!background?.trim()) {
    return NextResponse.json({ error: 'Background is required' }, { status: 400 })
  }

  const prompt = `You are an expert university admissions counselor helping an Indian student write a Statement of Purpose (SOP) for ${targetUniversity || 'their target university'} in ${targetCountry}.

Student background: ${background}

Write a compelling 250-300 word SOP that:
1. Opens with a clear thesis (why this field, why this university)
2. Discusses academic background & achievements
3. Mentions career aspirations
4. Explains why this specific university/country
5. Closes with commitment to study abroad

Be personal, specific, and academic. No generic phrases like "expand my horizons" — be concrete. Use active voice. Make it sound like the student is passionate, not desperate.`

  const sop = await askGemini(prompt)
  return NextResponse.json({ sop })
}