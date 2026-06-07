// src/lib/gemini.ts
export async function askGemini(prompt: string): Promise<string> {
  const key = process.env.GEMINI_API_KEY
  if (!key) return 'Add GEMINI_API_KEY to .env.local to enable AI insights.'

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 400 },
        }),
      }
    )
    if (!res.ok) return 'AI insight unavailable right now.'
    const data = await res.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No insight generated.'
  } catch {
    return 'Could not reach Gemini API.'
  }
}