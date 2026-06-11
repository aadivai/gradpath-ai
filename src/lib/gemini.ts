// src/lib/gemini.ts
export async function askGemini(prompt: string): Promise<string> {
  const key = process.env.GEMINI_API_KEY
  if (!key) return 'Add GEMINI_API_KEY to .env.local to enable AI insights.'

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{
              text: 'You are a writing assistant. Output ONLY the requested text — no commentary, no feedback, no preamble, no "Here is your SOP:", no meta-remarks. Just the content itself, starting immediately.'
            }]
          },
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        }),
      }
    )

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}))
      const msg = (errBody as { error?: { message?: string } }).error?.message ?? 'Unknown error'
      console.error('[Gemini] API error:', res.status, msg)
      return `Gemini error (${res.status}): ${msg}`
    }

    const data = await res.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No response generated.'
  } catch (e) {
    console.error('[Gemini] Network error:', e)
    return 'Could not reach Gemini API — check your internet connection.'
  }
}