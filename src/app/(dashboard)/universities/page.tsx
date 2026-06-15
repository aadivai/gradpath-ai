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
// ---- University Card ----
function UniCard({ uni, onSelect }: { uni: ScoredUniversity; onSelect: (u: ScoredUniversity) => void }) {
  const totalCost = (uni.annual_fee_usd ?? 0) + (uni.living_cost_usd ?? 0)
  const totalINR  = Math.round((totalCost * 83) / 100000) // in lakhs

  return (
    <div 
      onClick={() => onSelect(uni)}
      className="bg-card border border-border rounded-xl p-5 hover:border-indigo-500/30 hover:shadow-md transition-all duration-300 flex flex-col justify-between group cursor-pointer"
    >
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-2">
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-foreground leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {uni.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-muted-foreground/60" />
              {uni.city}, {uni.country}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
            <SaveButton universityId={uni.id} universityName={uni.name} />
            {uni.matching_score !== undefined && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                uni.matching_score >= 80 ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' :
                uni.matching_score >= 60 ? 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400' :
                'bg-amber-500/10 text-amber-700 dark:text-amber-400'
              }`}>
                {uni.matching_score}% Match
              </span>
            )}
          </div>
        </div>

        {/* Programs */}
        <div className="flex flex-wrap gap-1 mb-4">
          {uni.programs?.map(p => (
            <span key={p} className="text-[10px] bg-muted text-muted-foreground font-semibold px-2 py-0.5 rounded-md border border-border/50">
              {p}
            </span>
          ))}
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs border-t border-b border-border/50 py-4 mb-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Est. Total Cost</p>
              <p className="font-semibold text-foreground">~₹{totalINR}L / yr</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">QS / THE Rank</p>
              <p className="font-semibold text-foreground">#{uni.qs_ranking ?? '—'} / #{uni.the_ranking ?? '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Employability</p>
              <p className="font-semibold text-foreground">{uni.employment_rate ? `${uni.employment_rate}%` : '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground" />
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Visa Success</p>
              <p className="font-semibold text-foreground">{uni.visa_success_rate ? `${uni.visa_success_rate}%` : '—'}</p>
            </div>
          </div>
        </div>

        {/* Why Recommended reasoning snippet */}
        {uni.why_recommended && (
          <div className="bg-muted/50 rounded-lg p-2.5 mb-3 border border-border/50 flex items-start gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
              {uni.why_recommended}
            </p>
          </div>
        )}
      </div>

      <div className="mt-2 text-center text-[10px] text-indigo-650 hover:text-indigo-700 dark:text-indigo-400 font-bold tracking-wider uppercase">
        View Detailed Analysis & Ecosystem →
      </div>
    </div>
  )
}

// ---- Tier Section ----
const TIER_CONFIG = {
  safe:      { label: 'Safe Match',      color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',  dot: 'bg-emerald-500',  desc: 'Excellent admission probability' },
  moderate:  { label: 'Moderate Match',  color: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20',   dot: 'bg-indigo-500',   desc: 'Competitive but achievable fit' },
  ambitious: { label: 'Ambitious Fit',   color: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',   dot: 'bg-purple-500',   desc: 'Stretch target requiring strong SOP' },
  dream:     { label: 'Dream Choice',    color: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20',     dot: 'bg-rose-500',     desc: 'Highly selective global benchmarks' }
}

function TierSection({ 
  tier, 
  unis, 
  onSelect 
}: { 
  tier: 'safe' | 'moderate' | 'ambitious' | 'dream'; 
  unis: ScoredUniversity[]; 
  onSelect: (u: ScoredUniversity) => void 
}) {
  const cfg = TIER_CONFIG[tier]
  if (unis.length === 0) return null

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${cfg.color}`}>
          {cfg.label} ({unis.length})
        </span>
        <span className="text-xs text-muted-foreground font-medium">{cfg.desc}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {unis.map(u => <UniCard key={u.id} uni={u} onSelect={onSelect} />)}
      </div>
    </div>
  )
}

// ---- Skeleton loader ----
function Skeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-muted rounded-xl h-40" />
      ))}
    </div>
  )
}

// ---- Main Page ----
export default function UniversitiesPage() {
  const [result, setResult]   = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [selectedUni, setSelectedUni] = useState<ScoredUniversity | null>(null)

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
    <div className="max-w-3xl mx-auto px-6 py-10 relative">
      <h1 className="text-2xl font-bold text-foreground tracking-tight">University Recommendations</h1>
      <p className="text-sm text-muted-foreground mt-1 mb-6">
        Intelligent matching algorithm comparing GPA, GRE, research, climate, and cost parameters.
      </p>

      {/* Generate button */}
      {!result && !loading && (
        <div className="text-center py-12 bg-card border border-border rounded-xl mb-6 shadow-sm">
          <div className="text-3xl mb-3">🎓</div>
          <p className="text-sm font-bold text-foreground mb-1">Analyze Profile Matches</p>
          <p className="text-xs text-muted-foreground mb-5">We will calculate matching percentages across 4 distinct admission tiers.</p>
          <button onClick={getRecommendations}
            className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 hover:shadow-md transition-all duration-200 cursor-pointer">
            Calculate My Matches
          </button>
        </div>
      )}

      {loading && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
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
        <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {result && (
        <>
          {/* AI Insight card */}
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-5 mb-6 flex items-start gap-3 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0 text-indigo-600 dark:text-indigo-400 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold text-indigo-800 dark:text-indigo-300">AI Counselor Insights</span>
                <span className="text-[10px] uppercase font-semibold bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded">powered by Gemini</span>
              </div>
              <p className="text-sm text-indigo-700 dark:text-indigo-300 leading-relaxed font-medium">{result.aiInsight}</p>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {(['safe', 'moderate', 'ambitious', 'dream'] as const).map(tier => {
              const cfg = TIER_CONFIG[tier]
              return (
                <div key={tier} className="bg-card border border-border rounded-xl p-3 text-center shadow-sm">
                  <p className="text-2xl font-bold text-foreground">
                    {result[tier]?.length ?? 0}
                  </p>
                  <p className="text-[10px] font-bold text-muted-foreground capitalize mt-0.5">{tier}</p>
                </div>
              )
            })}
          </div>

          {total === 0 && (
            <div className="text-center py-8 bg-card border border-border rounded-xl shadow-sm">
              <p className="text-sm text-foreground mb-1">No matches found for your current filters.</p>
              <p className="text-xs text-muted-foreground">Try adjusting your budget cap or preferred countries in your profile.</p>
            </div>
          )}

          {/* Tier sections */}
          <TierSection tier="safe"      unis={result.safe} onSelect={setSelectedUni} />
          <TierSection tier="moderate"  unis={result.moderate} onSelect={setSelectedUni} />
          <TierSection tier="ambitious" unis={result.ambitious} onSelect={setSelectedUni} />
          <TierSection tier="dream"     unis={result.dream} onSelect={setSelectedUni} />

          {/* Refresh button */}
          <button onClick={getRecommendations}
            className="w-full mt-2 py-2 text-xs font-semibold text-muted-foreground border border-border rounded-lg hover:bg-muted transition-colors cursor-pointer">
            Recalculate Matches
          </button>
        </>
      )}

      {/* University Rich Detail slide-out Modal */}
      {selectedUni && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end animate-fade-in" onClick={() => setSelectedUni(null)}>
          <div 
            className="bg-card border-l border-border w-full max-w-xl h-full shadow-2xl flex flex-col overflow-y-auto relative animate-slide-in p-0" 
            onClick={e => e.stopPropagation()}
          >
            {/* Header Image banner */}
            <div className="h-48 bg-stone-300 relative shrink-0">
              <img 
                src={selectedUni.image_url ?? 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=600'} 
                alt={selectedUni.name} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <button 
                onClick={() => setSelectedUni(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center font-bold text-xs transition-colors cursor-pointer border-none"
              >
                ✕
              </button>
              
              <div className="absolute bottom-4 left-6 right-6 text-white">
                <span className="text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded bg-indigo-600">
                  {selectedUni.tier} MATCH
                </span>
                <h2 className="text-lg font-black mt-1 leading-tight">{selectedUni.name}</h2>
                <p className="text-xs text-white/80 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-indigo-400 shrink-0" />
                  {selectedUni.city}, {selectedUni.country}
                </p>
              </div>
            </div>

            {/* Content Details Grid */}
            <div className="p-6 space-y-6">
              
              {/* Stat grid of detailed scores */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-muted p-3.5 rounded-xl border border-border/50 text-center">
                  <p className="text-indigo-600 dark:text-indigo-400 text-lg font-black">{selectedUni.admission_probability ?? selectedUni.matching_score}%</p>
                  <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider mt-0.5">Admission Prob</p>
                </div>
                <div className="bg-muted p-3.5 rounded-xl border border-border/50 text-center">
                  <p className="text-emerald-600 dark:text-emerald-400 text-lg font-black">{selectedUni.scholarship_probability ?? 30}%</p>
                  <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider mt-0.5">Scholarship Prob</p>
                </div>
                <div className="bg-muted p-3.5 rounded-xl border border-border/50 text-center">
                  <p className="text-amber-500 text-lg font-black">{selectedUni.roi_score ?? 85}/100</p>
                  <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider mt-0.5">ROI Score</p>
                </div>
              </div>

              {/* Grid of basic key details */}
              <div className="grid grid-cols-2 gap-4 border border-border/50 rounded-xl p-4 bg-muted/20">
                <div className="space-y-1">
                  <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">QS Ranking</span>
                  <p className="text-xs font-semibold text-foreground">#{selectedUni.qs_ranking ?? 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Acceptance Rate</span>
                  <p className="text-xs font-semibold text-foreground">
                    {selectedUni.acceptance_rate ? `${selectedUni.acceptance_rate}%` : 'N/A'}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Annual Tuition</span>
                  <p className="text-xs font-semibold text-foreground">
                    {selectedUni.annual_fee_usd ? `$${selectedUni.annual_fee_usd.toLocaleString()}` : 'N/A'}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Est. Living Cost</span>
                  <p className="text-xs font-semibold text-foreground">
                    {selectedUni.living_cost_usd ? `$${selectedUni.living_cost_usd.toLocaleString()}/yr` : 'N/A'}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Visa Success Rate</span>
                  <p className="text-xs font-semibold text-foreground">{selectedUni.visa_success_rate ?? '90'}%</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Employment Rate</span>
                  <p className="text-xs font-semibold text-foreground">{selectedUni.employment_rate ?? '85'}%</p>
                </div>
              </div>

              {/* Academics & Matching thresholds */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider border-b border-border pb-1">Academic Criteria</h3>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-2 bg-muted rounded-lg">
                    <p className="text-[10px] text-muted-foreground">Min CGPA</p>
                    <p className="font-semibold">{selectedUni.min_cgpa ?? 'None'}</p>
                  </div>
                  <div className="p-2 bg-muted rounded-lg">
                    <p className="text-[10px] text-muted-foreground">Min IELTS</p>
                    <p className="font-semibold">{selectedUni.min_ielts ?? 'None'}</p>
                  </div>
                  <div className="p-2 bg-muted rounded-lg">
                    <p className="text-[10px] text-muted-foreground">Min GRE</p>
                    <p className="font-semibold">{selectedUni.min_gre ?? 'Optional'}</p>
                  </div>
                </div>
              </div>

              {/* Local Ecosystem & Connections */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider border-b border-border pb-1">Industry & Placement Ecosystem</h3>
                
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Nearby Corporations</span>
                  <p className="text-xs text-foreground leading-relaxed font-medium">
                    {selectedUni.nearby_companies ?? 'Local tech firms, consulting groups, and regional offices.'}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Nearby Startups</span>
                  <p className="text-xs text-foreground leading-relaxed font-medium">
                    {selectedUni.nearby_startups ?? 'Local incubators, venture capital labs, and emerging SaaS builders.'}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Placement Statistics</span>
                  <p className="text-xs text-foreground leading-relaxed font-medium">
                    {selectedUni.placement_statistics ?? 'Standard post-study placement support.'}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Internship Opportunities</span>
                  <p className="text-xs text-foreground leading-relaxed font-medium">
                    {selectedUni.internship_opportunities ?? 'Campus employment and credit-bearing co-op placements.'}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Industry Connections</span>
                  <p className="text-xs text-foreground leading-relaxed font-medium">
                    {selectedUni.industry_connections ?? 'Partnerships with regional engineering and commerce consortia.'}
                  </p>
                </div>
              </div>

              {/* Research & Campus details */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider border-b border-border pb-1">Research & Faculty</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Research Laboratories</span>
                    <p className="text-xs text-foreground mt-0.5 leading-relaxed">
                      {selectedUni.research_labs ?? 'Core academic subject departments and computational facilities.'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Faculty Ratio</span>
                    <p className="text-xs text-foreground mt-0.5 font-semibold">
                      {selectedUni.faculty_ratio ?? '1:15'} (Student to Faculty)
                    </p>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-4 flex gap-3">
                {selectedUni.website_url && (
                  <a 
                    href={selectedUni.website_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 text-center py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Visit Official Site
                  </a>
                )}
                <button 
                  onClick={() => setSelectedUni(null)}
                  className="flex-1 py-2.5 bg-muted hover:bg-stone-200 dark:hover:bg-stone-850 text-foreground font-bold text-xs rounded-xl transition-colors border border-border cursor-pointer"
                >
                  Close Analysis
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  )
}