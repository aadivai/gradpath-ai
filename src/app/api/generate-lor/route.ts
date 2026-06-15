import { NextResponse } from 'next/server'
import { askGemini } from '@/lib/gemini'
import { getSupabaseServer } from '@/lib/serverSupabase'

export async function POST(req: Request) {
  try {
    const supabase = await getSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id
    if (!userId) {
      return NextResponse.json({ error: 'Not logged in.' }, { status: 401 })
    }

    const body = await req.json()
    const { candidateName, targetProgram, recommenderName, recommenderTitle, achievements, style } = body

    if (!candidateName?.trim() || !recommenderName?.trim() || !achievements?.trim()) {
      return NextResponse.json({ error: 'Candidate Name, Recommender Name, and Achievements are required.' }, { status: 400 })
    }

    const lines = [
      `Write a professional Letter of Recommendation (LOR) for a student named ${candidateName} applying for a ${targetProgram || 'graduate study abroad program'}.`,
      `Recommender Name: ${recommenderName}`,
      `Recommender Title: ${recommenderTitle || 'Professor'}`,
      `Recommender Relationship Style: ${style || 'professor'} (academic professor, project manager, or research guide).`,
      `Specific Candidate Achievements to emphasize: ${achievements}`,
      '',
      'Writing Style & Tone rules:',
      style === 'manager' 
        ? 'Act as a professional workplace manager. Focus on collaboration, project deliverables, leadership potential, engineering skills, and operational excellence.'
        : style === 'research'
        ? 'Act as a research guide or thesis supervisor. Focus on analytical reasoning, literature review diligence, experiment design, publication potential, and critical thinking.'
        : 'Act as an academic college professor. Focus on classroom standing, cognitive agility, response to academic rigor, GPA, and student engagement.',
      '',
      'Letter Structure:',
      '1. Salutation (e.g., "To the Admissions Committee,")',
      '2. Context of relationship (how long and in what capacity the recommender knows the candidate).',
      '3. Technical evaluation (detail specific projects or academic achievements mentioned).',
      '4. Character and personal traits evaluation (maturity, adaptability, collaboration).',
      '5. Strong endorsement and recommendation for admission.',
      '6. Sign-off structure (Sincerely, Recommender Name, Title).',
      '',
      'Rules: Use a highly professional and glowing endorsement tone. Avoid generic template statements. Do not add brackets like [Insert Date] - make it flow naturally. Output ONLY the LOR letter body text, start with the salutation immediately.'
    ]

    const lor = await askGemini(lines.join('\n'))
    return NextResponse.json({ lor })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: 'Server error: ' + message }, { status: 500 })
  }
}
