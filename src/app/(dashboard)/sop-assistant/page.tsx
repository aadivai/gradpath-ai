'use client'
import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { supabase } from '@/lib/supabase'
import { getProfileId } from '@/lib/profile'

const COUNTRIES = ['Germany', 'Canada', 'UK', 'Ireland', 'Netherlands', 'Other']

export default function SOPPage() {
  const { user } = useUser()
  const [step, setStep] = useState<'input' | 'output' | 'edit'>('input')
  const [country, setCountry] = useState('')
  const [university, setUniversity] = useState('')
  const [background, setBackground] = useState('')
  const [sop, setSop] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  async function generateSOP() {
    if (!country || !background.trim()) {
      setError('Country and background are required')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/generate-sop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetCountry: country, targetUniversity: university, background }),
      })
      if (!res.ok) throw new Error('Failed to generate SOP')
      const data = await res.json()
      setSop(data.sop)
      setStep('output')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  // In sop-assistant/page.tsx — replace saveDraft function
  async function saveDraft() {
    if (!user) return
    try {
      const profileId = await getProfileId(user.id)
      if (!profileId) { setError('Complete your profile first'); return }
      const { error: dbError } = await supabase.from('sop_drafts').insert({
        profile_id:         profileId,        // ← now correct
        target_country:     country,
        target_university:  university,
        background,
        sop_content:        sop,
        is_saved:           true,
      })
      if (dbError) throw dbError
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-xl font-semibold text-gray-900 mb-1">AI SOP Assistant</h1>
      <p className="text-sm text-gray-500 mb-6">Generate a compelling statement of purpose, then customize it.</p>

      {/* Input form */}
      {step === 'input' && (
        <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Target country</label>
            <select value={country} onChange={e => setCountry(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-300">
              <option value="">Select country</option>
              {COUNTRIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Target university (optional)</label>
            <input value={university} onChange={e => setUniversity(e.target.value)} placeholder="e.g., TU Munich, University of Toronto"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Your background (be specific)</label>
            <textarea value={background} onChange={e => setBackground(e.target.value)}
              placeholder="e.g., BTech CS, CGPA 7.8, internship at Acme Corp building ML models, passionate about AI/ML, want to study in Germany for research opportunities..."
              className="w-full h-24 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none" />
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button onClick={generateSOP} disabled={loading}
            className="w-full py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors">
            {loading ? 'Generating... (takes 15 seconds)' : 'Generate SOP with AI'}
          </button>
        </div>
      )}

      {/* Generated SOP */}
      {step === 'output' && (
        <div className="space-y-4">
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
            <p className="text-sm text-indigo-700 leading-relaxed whitespace-pre-wrap">{sop}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setStep('edit')}
              className="flex-1 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
              Edit in my words →
            </button>
            <button onClick={saveDraft}
              className="flex-1 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
              {saved ? '✓ Saved to drafts' : 'Save draft'}
            </button>
          </div>
          <button onClick={() => { setStep('input'); setSop('') }}
            className="w-full py-2 text-sm text-gray-500 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
            ← Start over
          </button>
        </div>
      )}

      {/* Edit mode */}
      {step === 'edit' && (
        <div className="space-y-4">
          <textarea value={sop} onChange={e => setSop(e.target.value)}
            className="w-full h-80 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none font-mono" />
          <div className="flex gap-2">
            <button onClick={() => setStep('output')}
              className="flex-1 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
              ← Back
            </button>
            <button onClick={saveDraft}
              className="flex-1 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
              {saved ? '✓ Saved' : 'Save this version'}
            </button>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="mt-8 p-4 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700">
        <p className="font-semibold mb-2">💡 SOP tips</p>
        <ul className="space-y-1 text-xs">
          <li>• Be specific: "I want to study X because Y" (not generic)</li>
          <li>• Show research: mention specific labs, professors, or programs</li>
          <li>• Tell a story: why this field, what experience led you there</li>
          <li>• Proofread 3 times before submitting</li>
          <li>• Universities can tell if AI wrote 100% of it — use as a draft only</li>
        </ul>
      </div>
    </div>
  )
}