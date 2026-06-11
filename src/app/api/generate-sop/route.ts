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
    const { targetCountry, targetUniversity, background } = body

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
      'Write a 300-word Statement of Purpose for a student applying to ' + destination + '.',
      '',
      'Student background: ' + background,
      '',
      'Structure:',
      '1. Hook: open with a specific project or moment, not "Since childhood"',
      '2. Academic achievements and technical work',
      '3. Career goals',
      '4. Why this specific university and country',
      '5. Forward-looking closing sentence',
      '',
      'Rules: no cliches, active voice, first person, specific details.',
      'Output only the SOP. Start with the first word immediately.',
    ]

    const sop = await askGemini(lines.join('\n'))
    return NextResponse.json({ sop })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: 'Server error: ' + message }, { status: 500 })
  }
}