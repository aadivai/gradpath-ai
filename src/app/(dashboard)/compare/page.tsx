'use client'
import { useEffect, useState } from 'react'
import { useUser } from '@/components/providers/SupabaseAuthProvider'
import { supabase } from '@/lib/supabase'
import { getProfileId } from '@/lib/profile'
import { UNIVERSITY_METADATA } from '@/lib/constants'
import { PageHeader } from '@/components/ui/page-header'
import {
  ArrowLeftRight,
  Check,
  Award,
  TrendingUp,
  DollarSign,
  Briefcase,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Info
} from 'lucide-react'

type University = {
  id: string
  name: string
  country: string
  city: string | null
  qs_ranking: number | null
  acceptance_rate: number | null
  annual_fee_usd: number | null
  living_cost_usd: number | null
  programs: string[]
  tier: string
}

type SavedUni = {
  id: string
  universities: University
}

export default function ComparePage() {
  const { user } = useUser()
  const [saved, setSaved] = useState<SavedUni[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    ;(async () => {
      try {
        const profileId = await getProfileId(user.id)
        if (!profileId) { 
          setLoading(false)
          return 
        }
        const { data } = await supabase
          .from('saved_universities')
          .select('id, universities(*)')
          .eq('profile_id', profileId)
        
        const list = (data || []) as unknown as SavedUni[]
        setSaved(list)
        
        // Auto-select up to first 3 universities
        if (list.length > 0) {
          setSelectedIds(list.slice(0, 3).map(s => s.universities.id))
        }
      } catch (err) {
        console.error('Error loading compare page data:', err)
      } finally {
        setLoading(false)
      }
    })()
  }, [user?.id])

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(x => x !== id) 
        : [...prev, id]
    )
  }

  const selectedUnis = saved
    .filter(s => selectedIds.includes(s.universities.id))
    .map(s => {
      const u = s.universities
      const meta = UNIVERSITY_METADATA[u.name] || {
        the_ranking: (u.qs_ranking ?? 100) + 10,
        employment_rate: 85,
        visa_success_rate: 90,
        roi_score: 80,
        climate: 'moderate',
        image_url: ''
      }
      return { ...u, ...meta }
    })

  // Calculate Winners for highlighting
  const findWinner = <T,>(
    list: typeof selectedUnis, 
    extractor: (u: typeof selectedUnis[number]) => T, 
    comparator: (a: T, b: T) => boolean
  ) => {
    if (list.length === 0) return null
    let bestUni = list[0]
    let bestVal = extractor(list[0])
    
    for (let i = 1; i < list.length; i++) {
      const currentVal = extractor(list[i])
      if (comparator(currentVal, bestVal)) {
        bestVal = currentVal
        bestUni = list[i]
      }
    }
    return bestUni.id
  }

  const bestQsId = findWinner(selectedUnis, u => u.qs_ranking ?? 9999, (a, b) => a < b)
  const lowestFeeId = findWinner(selectedUnis, u => u.annual_fee_usd ?? 999999, (a, b) => a < b)
  const highestEmployId = findWinner(selectedUnis, u => u.employment_rate ?? 0, (a, b) => a > b)
  const bestVisaId = findWinner(selectedUnis, u => u.visa_success_rate ?? 0, (a, b) => a > b)

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    )
  }

  // Max cost calculation for cost comparison chart scaling
  const maxCost = Math.max(...selectedUnis.map(u => (u.annual_fee_usd ?? 0) + (u.living_cost_usd ?? 0)), 10000)

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
      {/* Header */}
      <PageHeader
        icon={ArrowLeftRight}
        title="University Comparison Matrix"
        subtitle="Compare admissions parameters, living expenditures, employabilities, and visa statistics side-by-side."
      />

      {saved.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-xl shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-full bg-indigo-500/5 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto">
            <ArrowLeftRight className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">No saved universities to compare</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto leading-relaxed">
              Explore the global database list under the Universities module, click save, and return here to match them side-by-side.
            </p>
          </div>
          <a 
            href="/universities" 
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            Browse Universities <ChevronRight className="w-3.5 h-3.5" />
          </a>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Active selection bar card */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-3">
            <h2 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-650 dark:text-indigo-400" />
              Choose Shortlisted Universities to Compare
            </h2>
            <div className="flex flex-wrap gap-2">
              {saved.map(s => {
                const isSelected = selectedIds.includes(s.universities.id)
                return (
                  <button 
                    key={s.id} 
                    onClick={() => toggleSelect(s.universities.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected 
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' 
                        : 'bg-background text-muted-foreground border-border hover:text-foreground hover:border-muted-foreground/30'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                    {s.universities.name}
                  </button>
                )
              })}
            </div>
          </div>

          {selectedUnis.length === 0 ? (
            <div className="text-center py-12 bg-card border border-border rounded-xl text-xs text-muted-foreground font-semibold shadow-xs">
              Select at least one university from the list above to show comparison details.
            </div>
          ) : (
            <>
              {/* Comparative grid table sheet */}
              <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-muted/70 border-b border-border">
                        <th className="p-4 font-bold text-muted-foreground uppercase tracking-wide w-48">Parameter</th>
                        {selectedUnis.map(u => (
                          <th key={u.id} className="p-4 font-bold text-foreground border-l border-border min-w-[200px] text-center">
                            {u.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      <tr>
                        <td className="p-4 font-bold text-muted-foreground bg-muted/20">Country & City</td>
                        {selectedUnis.map(u => (
                          <td key={u.id} className="p-4 text-foreground border-l border-border font-semibold text-center">
                            {u.city ? `${u.city}, ` : ''}{u.country}
                          </td>
                        ))}
                      </tr>
                      
                      {/* QS rank row */}
                      <tr className="hover:bg-muted/10 transition-colors">
                        <td className="p-4 font-bold text-muted-foreground bg-muted/20">QS World Rank</td>
                        {selectedUnis.map(u => {
                          const isWinner = u.id === bestQsId && selectedUnis.length > 1
                          return (
                            <td key={u.id} className={`p-4 border-l border-border font-bold text-center ${
                              isWinner ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'text-foreground'
                            }`}>
                              #{u.qs_ranking ?? '—'}
                              {isWinner && <span className="block text-[8px] font-extrabold uppercase mt-1 text-indigo-600 dark:text-indigo-400 tracking-wider">🏆 Best Ranking</span>}
                            </td>
                          )
                        })}
                      </tr>

                      {/* THE Rank row */}
                      <tr className="hover:bg-muted/10 transition-colors">
                        <td className="p-4 font-bold text-muted-foreground bg-muted/20">THE World Rank</td>
                        {selectedUnis.map(u => (
                          <td key={u.id} className="p-4 text-foreground border-l border-border font-bold text-center">
                            #{u.the_ranking ?? '—'}
                          </td>
                        ))}
                      </tr>

                      {/* Acceptance rate row */}
                      <tr className="hover:bg-muted/10 transition-colors">
                        <td className="p-4 font-bold text-muted-foreground bg-muted/20">Acceptance Rate</td>
                        {selectedUnis.map(u => (
                          <td key={u.id} className="p-4 text-foreground border-l border-border font-semibold text-center">
                            {u.acceptance_rate ? `${u.acceptance_rate}%` : '—'}
                          </td>
                        ))}
                      </tr>

                      {/* Tuition fees row */}
                      <tr className="hover:bg-muted/10 transition-colors">
                        <td className="p-4 font-bold text-muted-foreground bg-muted/20">Annual Tuition Fee</td>
                        {selectedUnis.map(u => {
                          const isWinner = u.id === lowestFeeId && selectedUnis.length > 1
                          return (
                            <td key={u.id} className={`p-4 border-l border-border font-bold text-center ${
                              isWinner ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'text-foreground'
                            }`}>
                              ${(u.annual_fee_usd ?? 0).toLocaleString()} USD
                              {isWinner && <span className="block text-[8px] font-extrabold uppercase mt-1 text-emerald-600 dark:text-emerald-400 tracking-wider">🏆 Lowest Cost</span>}
                            </td>
                          )
                        })}
                      </tr>

                      {/* Living cost row */}
                      <tr className="hover:bg-muted/10 transition-colors">
                        <td className="p-4 font-bold text-muted-foreground bg-muted/20">Living Cost / Month</td>
                        {selectedUnis.map(u => (
                          <td key={u.id} className="p-4 text-foreground border-l border-border font-semibold text-center">
                            ${(u.living_cost_usd ?? 0).toLocaleString()} USD
                          </td>
                        ))}
                      </tr>

                      {/* Employment rate row */}
                      <tr className="hover:bg-muted/10 transition-colors">
                        <td className="p-4 font-bold text-muted-foreground bg-muted/20">Employability Rate</td>
                        {selectedUnis.map(u => {
                          const isWinner = u.id === highestEmployId && selectedUnis.length > 1
                          return (
                            <td key={u.id} className={`p-4 border-l border-border font-bold text-center ${
                              isWinner ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'text-foreground'
                            }`}>
                              {u.employment_rate}%
                              {isWinner && <span className="block text-[8px] font-extrabold uppercase mt-1 text-indigo-600 dark:text-indigo-400 tracking-wider">🏆 Highest Employment</span>}
                            </td>
                          )
                        })}
                      </tr>

                      {/* Visa success rate row */}
                      <tr className="hover:bg-muted/10 transition-colors">
                        <td className="p-4 font-bold text-muted-foreground bg-muted/20">Visa Success Odds</td>
                        {selectedUnis.map(u => {
                          const isWinner = u.id === bestVisaId && selectedUnis.length > 1
                          return (
                            <td key={u.id} className={`p-4 border-l border-border font-bold text-center ${
                              isWinner ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'text-foreground'
                            }`}>
                              {u.visa_success_rate}%
                              {isWinner && <span className="block text-[8px] font-extrabold uppercase mt-1 text-emerald-600 dark:text-emerald-400 tracking-wider">🏆 Best Visa Odds</span>}
                            </td>
                          )
                        })}
                      </tr>

                      {/* ROI scorecard row */}
                      <tr className="hover:bg-muted/10 transition-colors">
                        <td className="p-4 font-bold text-muted-foreground bg-muted/20">ROI Confidence</td>
                        {selectedUnis.map(u => (
                          <td key={u.id} className="p-4 border-l border-border text-center font-bold">
                            <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-md text-[10px]">
                              {u.roi_score} / 100
                            </span>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Charts Panel */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Cost Comparison chart card */}
                <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-4">
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    Gross Yearly Costs (Tuition + Living)
                  </h3>
                  
                  <div className="space-y-4 pt-2">
                    {selectedUnis.map(u => {
                      const annualTuition = u.annual_fee_usd ?? 0
                      const annualLiving = (u.living_cost_usd ?? 0) * 12
                      const totalCost = annualTuition + annualLiving
                      const percent = Math.min(100, Math.round((totalCost / maxCost) * 100))
                      return (
                        <div key={u.id} className="space-y-1">
                          <p className="text-[10px] font-bold text-muted-foreground truncate">{u.name}</p>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-3 bg-muted rounded-lg overflow-hidden relative border border-border/20">
                              <div 
                                className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-lg transition-all duration-750 ease-out" 
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-foreground shrink-0">${totalCost.toLocaleString()}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Placement Comparison chart card */}
                <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-4">
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    Post-Graduation Employment Odds
                  </h3>
                  
                  <div className="space-y-4 pt-2">
                    {selectedUnis.map(u => (
                      <div key={u.id} className="space-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground truncate">{u.name}</p>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-3 bg-muted rounded-lg overflow-hidden relative border border-border/20">
                            <div 
                              className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-lg transition-all duration-750 ease-out" 
                              style={{ width: `${u.employment_rate}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-foreground shrink-0">{u.employment_rate}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Differentiator Information card */}
              <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-5 text-amber-800 dark:text-amber-300 flex items-start gap-3.5 shadow-xs">
                <Info className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-[10px] text-amber-600 dark:text-amber-500 font-bold uppercase tracking-wider">
                    ROI Analysis Truth
                  </h4>
                  <p className="text-xs leading-relaxed text-amber-800/95 dark:text-amber-300/90 font-medium">
                    Do not base your comparison entirely on QS Rank. A higher rank (e.g. #30 vs #150) often carries double the tuition fee with marginal salary differences after graduation in standard engineering and tech fields.
                  </p>
                  <p className="text-xs leading-relaxed text-amber-800/90 dark:text-amber-300/80">
                    Always evaluate local visa policies for post-study work streams. For example, Germany offers a 18-month job seeker extension, whereas the UK features a 2-year Graduate Route.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
