'use client'
import { useState } from 'react'
import type { ScoredUniversity } from '@/lib/recommender'
import SaveButton from '@/components/ui/SaveButton'
import { 
  Trophy, 
  MapPin, 
  DollarSign, 
  TrendingUp, 
  Sparkles, 
  Globe2, 
  Sun,
  ShieldCheck,
  CheckCircle,
  Briefcase
} from 'lucide-react'

// ---- University Card ----
function UniCard({ uni }: { uni: ScoredUniversity }) {
  const totalCost = (uni.annual_fee_usd ?? 0) + (uni.living_cost_usd ?? 0)
  const totalINR  = Math.round((totalCost * 83) / 100000) // in lakhs

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 hover:border-indigo-100 hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-2">
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-gray-900 leading-snug group-hover:text-indigo-600 transition-colors">
              {uni.name}
            </h3>
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-gray-300" />
              {uni.city}, {uni.country}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <SaveButton universityId={uni.id} universityName={uni.name} />
            {uni.matching_score !== undefined && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                uni.matching_score >= 80 ? 'bg-emerald-50 text-emerald-700' :
                uni.matching_score >= 60 ? 'bg-indigo-50 text-indigo-700' :
                'bg-amber-50 text-amber-700'
              }`}>
                {uni.matching_score}% Match
              </span>
            )}
          </div>
        </div>

        {/* Programs */}
        <div className="flex flex-wrap gap-1 mb-4">
          {uni.programs?.map(p => (
            <span key={p} className="text-[10px] bg-slate-50 text-slate-500 font-semibold px-2 py-0.5 rounded-md border border-slate-100/50">
              {p}
            </span>
          ))}
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs border-t border-b border-gray-50 py-4 mb-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-3.5 h-3.5 text-gray-400" />
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">Est. Total Cost</p>
              <p className="font-semibold text-gray-700">~₹{totalINR}L / yr</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">QS / THE Rank</p>
              <p className="font-semibold text-gray-700">#{uni.qs_ranking ?? '—'} / #{uni.the_ranking ?? '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Briefcase className="w-3.5 h-3.5 text-gray-400" />
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">Employability</p>
              <p className="font-semibold text-gray-700">{uni.employment_rate ? `${uni.employment_rate}%` : '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">Visa Success</p>
              <p className="font-semibold text-gray-700">{uni.visa_success_rate ? `${uni.visa_success_rate}%` : '—'}</p>
            </div>
          </div>
        </div>

        {/* Why Recommended reasoning snippet */}
        {uni.why_recommended && (
          <div className="bg-slate-50 rounded-lg p-2.5 mb-3 border border-slate-100 flex items-start gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
              {uni.why_recommended}
            </p>
          </div>
        )}
      </div>

      <div>
        {uni.website_url && (
          <a href={uni.website_url} target="_blank" rel="noopener noreferrer"
            className="block text-center text-xs font-semibold bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg py-2 transition-colors">
            Visit University Website →
          </a>
        )}
      </div>
    </div>
  )
}

// ---- Tier Section ----
const TIER_CONFIG = {
  safe:      { label: 'Safe Match',      color: 'bg-emerald-50  text-emerald-700  border-emerald-100',  dot: 'bg-emerald-500',  desc: 'Excellent admission probability' },
  moderate:  { label: 'Moderate Match',  color: 'bg-indigo-50   text-indigo-700   border-indigo-100',   dot: 'bg-indigo-500',   desc: 'Competitive but achievable fit' },
  ambitious: { label: 'Ambitious Fit',   color: 'bg-purple-50   text-purple-700   border-purple-100',   dot: 'bg-purple-500',   desc: 'Stretch target requiring strong SOP' },
  dream:     { label: 'Dream Choice',    color: 'bg-rose-50     text-rose-700     border-rose-100',     dot: 'bg-rose-500',     desc: 'Highly selective global benchmarks' }
}

function TierSection({ tier, unis }: { tier: 'safe' | 'moderate' | 'ambitious' | 'dream'; unis: ScoredUniversity[] }) {
  const cfg = TIER_CONFIG[tier]
  if (unis.length === 0) return null

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${cfg.color}`}>
          {cfg.label} ({unis.length})
        </span>
        <span className="text-xs text-gray-400 font-medium">{cfg.desc}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
  const [result, setResult]   = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  async function getRecommendations() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/recommend')
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}))
        throw new Error(errJson.error || `Server error (${res.status})`)
      }
      const data = await res.json()
      setResult(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const total = result ? result.safe.length + result.moderate.length + result.ambitious.length + (result.dream?.length ?? 0) : 0

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-900 tracking-tight">University Recommendations</h1>
      <p className="text-sm text-gray-500 mt-1 mb-6">
        Intelligent matching algorithm comparing GPA, GRE, research, climate, and cost parameters.
      </p>

      {/* Generate button */}
      {!result && !loading && (
        <div className="text-center py-12 bg-white border border-gray-100 rounded-xl mb-6 shadow-sm">
          <div className="text-3xl mb-3">🎓</div>
          <p className="text-sm font-bold text-gray-700 mb-1">Analyze Profile Matches</p>
          <p className="text-xs text-gray-400 mb-5">We will calculate matching percentages across 4 distinct admission tiers.</p>
          <button onClick={getRecommendations}
            className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 hover:shadow-indigo-100 hover:shadow-md transition-all duration-200 cursor-pointer">
            Calculate My Matches
          </button>
        </div>
      )}

      {loading && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-indigo-600">
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            Analyzing your student profile and running scores...
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
          <div className="bg-indigo-50/50 border border-indigo-100/80 rounded-xl p-5 mb-6 flex items-start gap-3 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0 text-indigo-600 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold text-indigo-800">AI Counselor Insights</span>
                <span className="text-[10px] uppercase font-semibold bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">powered by Gemini</span>
              </div>
              <p className="text-sm text-indigo-700 leading-relaxed font-medium">{result.aiInsight}</p>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {(['safe', 'moderate', 'ambitious', 'dream'] as const).map(tier => {
              const cfg = TIER_CONFIG[tier]
              return (
                <div key={tier} className="bg-white border border-gray-100 rounded-xl p-3 text-center shadow-sm">
                  <p className="text-2xl font-bold text-gray-900">
                    {result[tier]?.length ?? 0}
                  </p>
                  <p className="text-[10px] font-bold text-gray-400 capitalize mt-0.5">{tier}</p>
                </div>
              )
            })}
          </div>

          {total === 0 && (
            <div className="text-center py-8 bg-white border border-gray-100 rounded-xl shadow-sm">
              <p className="text-sm text-gray-600 mb-1">No matches found for your current filters.</p>
              <p className="text-xs text-gray-400">Try adjusting your budget cap or preferred countries in your profile.</p>
            </div>
          )}

          {/* Tier sections */}
          <TierSection tier="safe"      unis={result.safe} />
          <TierSection tier="moderate"  unis={result.moderate} />
          <TierSection tier="ambitious" unis={result.ambitious} />
          <TierSection tier="dream"     unis={result.dream} />

          {/* Refresh button */}
          <button onClick={getRecommendations}
            className="w-full mt-2 py-2 text-xs font-semibold text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
            Recalculate Matches
          </button>
        </>
      )}
    </div>
  )
}