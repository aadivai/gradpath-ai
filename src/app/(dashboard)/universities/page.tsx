// src/app/(dashboard)/universities/page.tsx
'use client'
import { useState } from 'react'
import type { University, RecommendResult } from '@/types'
import SaveButton from '@/components/ui/SaveButton'

// ---- University Card ----
function UniCard({ uni }: { uni: University }) {
  const totalCost = (uni.annual_fee_usd ?? 0) + (uni.living_cost_usd ?? 0)
  const totalINR  = Math.round((totalCost * 83) / 100000) // in lakhs

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 hover:border-indigo-200 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-sm font-semibold text-gray-900">{uni.name}</p>
          <p className="text-xs text-gray-400">{uni.city}, {uni.country}</p>
        </div>
        <div className="flex items-center gap-2">
          {uni.qs_ranking && (
            <span className="text-xs font-medium bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
              QS #{uni.qs_ranking}
            </span>
          )}
          <SaveButton universityId={uni.id} universityName={uni.name} />  {/* ← add this */}
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        {uni.programs?.slice(0, 3).map(p => (
          <span key={p} className="text-xs bg-gray-50 text-gray-500 border border-gray-100 px-2 py-0.5 rounded-full">
            {p}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs border-t border-gray-50 pt-3">
        <div>
          <p className="text-gray-400">Est. annual cost</p>
          <p className="font-medium text-gray-700">~₹{totalINR}L / yr</p>
        </div>
        <div>
          <p className="text-gray-400">Min CGPA</p>
          <p className="font-medium text-gray-700">{uni.min_cgpa ?? '—'} / 10</p>
        </div>
        <div>
          <p className="text-gray-400">Min IELTS</p>
          <p className="font-medium text-gray-700">{uni.min_ielts ?? '—'}</p>
        </div>
        <div>
          <p className="text-gray-400">Acceptance</p>
          <p className="font-medium text-gray-700">{uni.acceptance_rate ? `${uni.acceptance_rate}%` : '—'}</p>
        </div>
      </div>

      {uni.website_url && (
        <a href={uni.website_url} target="_blank" rel="noopener noreferrer"
          className="block mt-3 text-center text-xs text-indigo-600 hover:underline">
          Visit university →
        </a>
      )}
    </div>
  )
}

// ---- Tier Section ----
const TIER_CONFIG = {
  safe:      { label: 'Safe',      color: 'bg-green-50  text-green-700  border-green-100',  dot: 'bg-green-500',  desc: 'Strong chance of admission' },
  moderate:  { label: 'Moderate',  color: 'bg-amber-50  text-amber-700  border-amber-100',  dot: 'bg-amber-500',  desc: 'Competitive but achievable' },
  ambitious: { label: 'Ambitious', color: 'bg-purple-50 text-purple-700 border-purple-100', dot: 'bg-purple-500', desc: 'Stretch — apply with strong SOP' },
}

function TierSection({ tier, unis }: { tier: 'safe' | 'moderate' | 'ambitious'; unis: University[] }) {
  const cfg = TIER_CONFIG[tier]
  if (unis.length === 0) return null

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.color}`}>
          {cfg.label} ({unis.length})
        </span>
        <span className="text-xs text-gray-400">{cfg.desc}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {unis.map(u => <UniCard key={u.id} uni={u} />)}
      </div>
    </div>
  )
}

// ---- Skeleton loader ----
function Skeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-gray-100 rounded-xl h-40" />
      ))}
    </div>
  )
}

// ---- Main Page ----
export default function UniversitiesPage() {
  const [result, setResult]   = useState<RecommendResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  async function getRecommendations() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/recommend')
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Something went wrong')
      }
      const data: RecommendResult = await res.json()
      setResult(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const total = result ? result.safe.length + result.moderate.length + result.ambitious.length : 0

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-xl font-semibold text-gray-900 mb-1">University recommendations</h1>
      <p className="text-sm text-gray-500 mb-6">
        Personalized matches based on your CGPA, budget, and preferences.
      </p>

      {/* Generate button */}
      {!result && !loading && (
        <div className="text-center py-12 bg-white border border-gray-100 rounded-xl mb-6">
          <div className="text-3xl mb-3">🎓</div>
          <p className="text-sm font-medium text-gray-700 mb-1">Ready to find your matches</p>
          <p className="text-xs text-gray-400 mb-5">We'll analyze your profile and suggest universities across 3 tiers.</p>
          <button onClick={getRecommendations}
            className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
            Generate my recommendations
          </button>
        </div>
      )}

      {loading && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4 text-sm text-indigo-600">
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            Analyzing your profile with AI...
          </div>
          <Skeleton />
        </div>
      )}

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {result && (
        <>
          {/* AI Insight card */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold text-indigo-800">AI counselor insight</span>
              <span className="text-xs text-indigo-400">powered by Gemini</span>
            </div>
            <p className="text-sm text-indigo-700 leading-relaxed">{result.aiInsight}</p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {(['safe', 'moderate', 'ambitious'] as const).map(tier => (
              <div key={tier} className="bg-white border border-gray-100 rounded-lg p-3 text-center">
                <p className="text-xl font-semibold text-gray-900">
                  {result[tier].length}
                </p>
                <p className="text-xs text-gray-400 capitalize">{tier}</p>
              </div>
            ))}
          </div>

          {total === 0 && (
            <div className="text-center py-8 bg-white border border-gray-100 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">No matches found for your current filters.</p>
              <p className="text-xs text-gray-400">Try increasing your budget or selecting more countries in your profile.</p>
            </div>
          )}

          {/* Tier sections */}
          <TierSection tier="safe"      unis={result.safe} />
          <TierSection tier="moderate"  unis={result.moderate} />
          <TierSection tier="ambitious" unis={result.ambitious} />

          {/* Refresh button */}
          <button onClick={getRecommendations}
            className="w-full mt-2 py-2 text-sm text-gray-500 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
            Refresh recommendations
          </button>
        </>
      )}
    </div>
  )
}