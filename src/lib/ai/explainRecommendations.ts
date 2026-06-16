import { z } from 'zod'
import type { Profile } from '@/types'
import type { ScoredUniversity } from '@/lib/recommender'

export const RecommendationExplanationSchema = z.object({
  university: z.string(),
  explanation: z.string(),
  strengths: z.array(z.string()),
  considerations: z.array(z.string())
})

export const ExplanationResultSchema = z.object({
  overview: z.string(),
  recommendations: z.array(RecommendationExplanationSchema)
})

export type ExplanationResult = z.infer<typeof ExplanationResultSchema>

export async function explainRecommendations(
  profile: Profile,
  recommendations: ScoredUniversity[]
): Promise<ExplanationResult> {
  const key = process.env.GEMINI_API_KEY
  if (!key) {
    console.warn('[Gemini AI] GEMINI_API_KEY is not defined. Using fallback explanation.')
    return getFallbackResponse(recommendations)
  }

  try {
    const prompt = `You are a warm, direct study abroad counselor for Indian students.
Explain the recommended universities for the student based ONLY on the provided list. Do not invent any universities.

Student Profile:
- Branch/Field: ${profile.branch ?? 'N/A'}
- CGPA: ${profile.cgpa ?? 'N/A'}/10
- IELTS: ${profile.ielts_score ?? 'Not taken'}
- GRE: ${profile.gre_score ?? 'Not taken'}
- Budget: ₹${profile.budget_inr?.toLocaleString() ?? 'Not set'}/year
- Work Experience: ${profile.work_experience_months ?? 0} months
- Preferred Countries: ${profile.preferred_countries?.join(', ') || 'No preference'}

Recommended Universities to Explain:
${recommendations.map(uni => `- Name: ${uni.name}
  Tier: ${uni.tier}
  Match Score: ${uni.matching_score}%
  Match Reason: ${uni.why_recommended}
  QS Ranking: ${uni.qs_ranking ?? 'N/A'}
  Tuition Fee: $${uni.annual_fee_usd ?? 'N/A'}/year`).join('\n\n')}

Your response must strictly match the following JSON schema:
{
  "overview": "A short, 2-sentence summary highlighting the student's overall profile strength and target intake strategy.",
  "recommendations": [
    {
      "university": "Exactly the university name as provided above",
      "explanation": "A direct, personalized explanation of why this university matches the student profile (max 120 words). Mention CGPA, IELTS, GRE, budget, or work experience fit.",
      "strengths": ["2-3 key strengths/advantages for this student at this university"],
      "considerations": ["1-2 key challenges, costs, or requirements the student should consider"]
    }
  ]
}

Return valid JSON only. Do not wrap the output in markdown code blocks like \`\`\`json. Return only the JSON object.`

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{
              text: 'You are an AI counselor assistant. You must output ONLY a valid JSON object matching the requested schema. No commentary, no markdown formatting (do not include ```json), no markdown wrappers.'
            }]
          },
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
            responseMimeType: 'application/json'
          },
        }),
      }
    )

    if (!res.ok) {
      console.error('[Gemini AI] API error status:', res.status)
      return getFallbackResponse(recommendations)
    }

    const data = await res.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) {
      console.warn('[Gemini AI] Empty response text.')
      return getFallbackResponse(recommendations)
    }

    const parsedJson = JSON.parse(text)
    const validated = ExplanationResultSchema.safeParse(parsedJson)
    if (!validated.success) {
      console.warn('[Gemini AI] JSON validation failed:', validated.error)
      return getFallbackResponse(recommendations)
    }

    return validated.data
  } catch (error) {
    console.error('[Gemini AI] Error during explainRecommendations:', error)
    return getFallbackResponse(recommendations)
  }
}

function getFallbackResponse(recommendations: ScoredUniversity[]): ExplanationResult {
  return {
    overview: "We've generated university options tailored to your CGPA, test scores, and country preferences.",
    recommendations: recommendations.map(uni => ({
      university: uni.name,
      explanation: `Calculated as a ${uni.tier} match. ${uni.why_recommended}`,
      strengths: ['Meets minimum entry thresholds', 'Matches preferred region'],
      considerations: ['Review specific visa deadlines']
    }))
  }
}
