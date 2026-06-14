import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { askGemini } from '@/lib/gemini'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Not logged in.' }, { status: 401 })
    }

    const body = await req.json()
    const { targetCountry, targetUniversity, background, tone, professorName, focusArea } = body

    if (!background?.trim()) {
      return NextResponse.json({ error: 'Background is required.' }, { status: 400 })
    }
    if (!targetCountry) {
      return NextResponse.json({ error: 'Target country is required.' }, { status: 400 })
    }
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY not set in .env.local' }, { status: 500 })
    }

    const destination = targetUniversity
      ? targetUniversity + ' in ' + targetCountry
      : 'a university in ' + targetCountry

    const lines = [
      `Write a 300-word Statement of Purpose for a student applying to ${destination}.`,
      `The writing tone must be: ${tone || 'professional'} (e.g. academic, bold, professional, or narrative).`,
      professorName ? `Briefly reference working under the research supervision of Professor ${professorName} at the department.` : '',
      focusArea ? `Focus particularly on the student's technical interest and projects in the area of ${focusArea}.` : '',
      '',
      'Student background profile: ' + background,
      '',
      'SOP Structure:',
      '1. Hook: open with a specific project, thesis, or technical challenge. Avoid clichés like "Since childhood..."',
      '2. Academic highlights and practical technical competencies.',
      '3. Long-term career goals.',
      '4. Why this specific university and country matches their interests.',
      '5. Strong forward-looking conclusion.',
      '',
      'Rules: Use first-person active voice, maintain precise technical keywords, write naturally, and avoid overly generic templates.',
      'Output ONLY the SOP text. Start with the first paragraph immediately with no preamble or intro comments.'
    ]

    const sop = await askGemini(lines.filter(Boolean).join('\n'))
    return NextResponse.json({ sop })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: 'Server error: ' + message }, { status: 500 })
  }
}