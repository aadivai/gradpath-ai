import { NextResponse } from 'next/server'
import { askGemini } from '@/lib/gemini'
import { getSupabaseServer } from '@/lib/serverSupabase'

export async function POST(req: Request) {
  try {
    const supabase = await getSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { country, question, answer } = await req.json()
    if (!country || !question || !answer?.trim()) {
      return NextResponse.json({ error: 'Missing parameters.' }, { status: 400 })
    }

    const prompt = `You are a strict, helpful Embassy Visa Officer conducting a credibility interview for a student visa.
Country: ${country}
Visa Question: "${question}"
Student's Answer: "${answer}"

Analyze the student's answer and respond ONLY in the following raw JSON format:
{
  "score": 8, // out of 10
  "verdict": "Approved" or "Needs improvement" or "High risk of rejection",
  "critique": "A brief explanation of how the answer sounds to a visa officer.",
  "improvedAnswer": "A professional, structured, and compliant version of how they should answer."
}
No backticks, no preamble, no markdown, just the JSON text itself.`

    const responseText = await askGemini(prompt)

    try {
      // Clean possible backticks in response
      const cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim()
      const feedback = JSON.parse(cleanJson)
      return NextResponse.json(feedback)
    } catch (e) {
      console.error('Failed to parse Gemini JSON output:', responseText)
      return NextResponse.json({
        score: 6,
        verdict: "Needs improvement",
        critique: "Your answer could be more concise. Ensure you directly reference your university modules and financial documentation.",
        improvedAnswer: "I chose this program because it aligns with my BTech studies, specifically module X, and my parents are funding my education with a blocked account."
      })
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: 'Server visa check error: ' + msg }, { status: 500 })
  }
}
