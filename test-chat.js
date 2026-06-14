import fs from 'fs'

const envContent = fs.readFileSync('.env.local', 'utf-8')
const env = {}
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([^#=]+)\s*=\s*(.*)$/)
  if (match) {
    const key = match[1].trim()
    let val = match[2].trim()
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1)
    if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1)
    env[key] = val
  }
})

const key = env.GEMINI_API_KEY
console.log('Gemini API Key:', key ? `${key.substring(0, 5)}...` : 'MISSING')

async function test() {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{
              text: 'You are a writing assistant.'
            }]
          },
          contents: [{ parts: [{ text: 'Hello, testing!' }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        }),
      }
    )

    console.log('Res Status:', res.status, res.statusText)
    const body = await res.json()
    console.log('Res Body:', JSON.stringify(body, null, 2))
  } catch (e) {
    console.error('Test Error:', e)
  }
}

test()
