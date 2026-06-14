import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { askGemini } from '@/lib/gemini'
import { parseProfile } from '@/utils/profileMetadata'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { messages } = await req.json()
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid message list.' }, { status: 400 })
    }

    // Fetch context data (Student profile, Universities, Visas)
    const [profileRes, universitiesRes, visasRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('clerk_user_id', userId).single(),
      supabase.from('universities').select('*'),
      supabase.from('visa_requirements').select('*')
    ])

    if (profileRes.error && profileRes.error.code !== 'PGRST116') {
      console.error('[Chat API] Profile query error:', profileRes.error)
    }
    if (universitiesRes.error) {
      console.error('[Chat API] Universities query error:', universitiesRes.error)
    }
    if (visasRes.error) {
      console.error('[Chat API] Visas query error:', visasRes.error)
    }

    const profile = profileRes.data
    const universities = universitiesRes.data
    const visas = visasRes.data

    const parsedProfile = profile ? parseProfile(profile) : null
    const userQuery = messages[messages.length - 1]?.content ?? ''

    // Assemble dynamic context for RAG
    const systemContext = `You are GradPath AI, an expert, encouraging study abroad counselor.
Student profile details:
${parsedProfile ? JSON.stringify(parsedProfile, null, 2) : 'No profile completed yet.'}

Available Universities in Database:
${JSON.stringify(universities?.map(u => ({ name: u.name, country: u.country, city: u.city, qs: u.qs_ranking, cgpa: u.min_cgpa, ielts: u.min_ielts, fee: u.annual_fee_usd, living: u.living_cost_usd, programs: u.programs })) || [], null, 2)}

Visa Requirements:
${JSON.stringify(visas || [], null, 2)}

Student query: "${userQuery}"

Provide a highly relevant, helpful, and concise answer (max 150 words). Format key details with bold markdown text or short bullet lists. Do not mention JSON structures; refer to them as "our catalog" or "our university database".`

    const responseText = await askGemini(systemContext)

    return NextResponse.json({ text: responseText })
  } catch (err) {
    console.error('[Chat API] Server chat error:', err)
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: 'Server chat error: ' + msg }, { status: 500 })
  }
}
