'use client'
import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { supabase } from '@/lib/supabase'
import { parseProfile } from '@/utils/profileMetadata'
import type { Profile, Scholarship } from '@/types'
import {
  Award,
  Filter,
  DollarSign,
  TrendingUp,
  Percent,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  HelpCircle,
  TrendingDown
} from 'lucide-react'

const TYPE_LABELS: Record<string, string> = {
  merit:      'Merit',
  need:       'Need-based',
  government: 'Government',
  university: 'University',
}

const TYPE_COLORS: Record<string, string> = {
  merit:      'bg-indigo-50/70   text-indigo-700   border-indigo-100/50',
  need:       'bg-amber-50/70    text-amber-700    border-amber-100/50',
  government: 'bg-emerald-50/70  text-emerald-700  border-emerald-100/50',
  university: 'bg-purple-50/70   text-purple-700   border-purple-100/50',
}

const COUNTRIES = ['All', 'Germany', 'Canada', 'United Kingdom', 'Ireland', 'Netherlands', 'USA', 'Australia']
const TYPES     = ['All', 'merit', 'need', 'government', 'university']

export default function ScholarshipsPage() {
  const { user, isLoaded } = useUser()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [scholarships, setScholarships] = useState<Scholarship[]>([])
  const [loading, setLoading] = useState(true)
  const [country, setCountry] = useState('All')
  const [type, setType] = useState('All')

  // Calculator inputs
  const [selectedScholarshipId, setSelectedScholarshipId] = useState<string>('')
  const [tuitionFee, setTuitionFee] = useState<number>(25000)
  const [livingCost, setLivingCost] = useState<number>(12000)
  const [studentCgpa, setStudentCgpa] = useState<number>(8.0)
  const [studentIelts, setStudentIelts] = useState<number>(7.0)

  // Load profile and scholarships
  useEffect(() => {
    async function loadData() {
      try {
        const { data: scholData } = await supabase
          .from('scholarships')
          .select('*')
          .order('name')
        
        const loadedScholarships = scholData ?? []
        setScholarships(loadedScholarships)
        
        if (loadedScholarships.length > 0) {
          setSelectedScholarshipId(loadedScholarships[0].id)
        }

        if (isLoaded && user) {
          const { data: prof } = await supabase
            .from('profiles')
            .select('*')
            .eq('clerk_user_id', user.id)
            .single()

          if (prof) {
            const parsed = parseProfile(prof)
            setProfile(parsed)
            if (parsed.cgpa) {
              setStudentCgpa(parsed.cgpa)
            }
            if (parsed.ielts_score) {
              setStudentIelts(parsed.ielts_score)
            }
          }
        }
      } catch (err) {
        console.error('Error loading scholarships page data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [isLoaded, user])

  const filtered = scholarships.filter(s => {
    if (country !== 'All' && s.country !== country) return false
    if (type !== 'All' && s.type !== type) return false
    return true
  })

  // Selected scholarship for calculator
  const activeScholarship = scholarships.find(s => s.id === selectedScholarshipId)

  // Calculations
  const scholarshipAmount = activeScholarship 
    ? (activeScholarship.is_fully_funded ? (tuitionFee + livingCost) : (activeScholarship.amount_usd ?? 0))
    : 0

  const totalCost = tuitionFee + livingCost
  const netGapVal = Math.max(0, totalCost - scholarshipAmount)
  const totalCostINR = Math.round(totalCost * 83)
  const scholarshipAmountINR = Math.round(scholarshipAmount * 83)
  const netGapINR = Math.round(netGapVal * 83)

  // Match probability logic
  const calculateMatchProb = () => {
    if (!activeScholarship) return 0
    const minReq = activeScholarship.min_cgpa ?? 0
    if (minReq === 0) return 82 // general fallback

    if (studentCgpa >= minReq) {
      // Bonus probability for higher GPA
      const diff = studentCgpa - minReq
      const bonus = Math.round(diff * 12)
      return Math.min(98, 85 + bonus)
    } else {
      // Penalty for failing to meet minimum requirements
      const diff = minReq - studentCgpa
      const penalty = Math.round(diff * 35)
      return Math.max(15, 80 - penalty)
    }
  }

  const matchProbability = calculateMatchProb()

  const getMatchGrade = (prob: number) => {
    if (prob >= 80) return { label: 'High Eligibility', color: 'text-emerald-700 bg-emerald-50 border-emerald-100', dot: 'bg-emerald-500', barColor: 'bg-emerald-500' }
    if (prob >= 50) return { label: 'Moderate Match', color: 'text-amber-700 bg-amber-50 border-amber-100', dot: 'bg-amber-500', barColor: 'bg-amber-500' }
    return { label: 'Low Eligibility', color: 'text-rose-700 bg-rose-50 border-rose-100', dot: 'bg-rose-500', barColor: 'bg-rose-500' }
  }

  const matchGrade = getMatchGrade(matchProbability)

  // Preset quick values
  const handleSelectScholarship = (s: Scholarship) => {
    setSelectedScholarshipId(s.id)
    if (s.min_cgpa) {
      // auto set to required if student score is lower for demonstration
      if (studentCgpa < s.min_cgpa) {
        setStudentCgpa(s.min_cgpa)
      }
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
          <Award className="w-6 h-6 text-indigo-600" />
          Scholarship Intelligence
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Explore elite international funding, calculate real-time net education costs, and verify admissions matches.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Directory & List */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-card rounded-2xl p-5 border border-stone-200/50 space-y-4">
            <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-indigo-600" />
              Filter Schemes
            </h3>

            {/* Country Selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Country</label>
              <div className="flex flex-wrap gap-1.5">
                {COUNTRIES.map(c => (
                  <button
                    key={c}
                    onClick={() => setCountry(c)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all ${
                      country === c
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white text-stone-600 border-stone-200 hover:border-indigo-300'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Type Selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Scholarship Class</label>
              <div className="flex flex-wrap gap-1.5">
                {TYPES.map(t => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all ${
                      type === t
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white text-stone-600 border-stone-200 hover:border-indigo-300'
                    }`}
                  >
                    {t === 'All' ? 'All Types' : TYPE_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Listings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-stone-400 font-bold uppercase tracking-wider">
                Available Programs ({filtered.length})
              </p>
              {profile && (
                <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                  Profile CGPA: {profile.cgpa ?? 'None'}
                </span>
              )}
            </div>

            {loading ? (
              <div className="animate-pulse grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-white border border-stone-200/50 rounded-2xl h-44" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 bg-white border border-stone-200/40 rounded-2xl">
                <p className="text-xs text-stone-500">No funding opportunities found for the selected filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filtered.map(s => {
                  const amtL = s.amount_usd ? Math.round(s.amount_usd * 83 / 100000) : null
                  const isSelected = selectedScholarshipId === s.id
                  return (
                    <div 
                      key={s.id} 
                      onClick={() => handleSelectScholarship(s)}
                      className={`glass-card rounded-2xl p-5 border cursor-pointer transition-all duration-300 relative flex flex-col justify-between group ${
                        isSelected 
                          ? 'border-indigo-600 ring-2 ring-indigo-100 bg-indigo-50/20' 
                          : 'border-stone-200/50 hover:border-indigo-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <p className="text-xs font-bold text-stone-800 leading-snug group-hover:text-indigo-600 transition-colors">
                            {s.name}
                          </p>
                          <span className={`shrink-0 text-[9px] font-bold px-2 py-0.5 rounded-full border ${TYPE_COLORS[s.type]}`}>
                            {TYPE_LABELS[s.type]}
                          </span>
                        </div>

                        <p className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider mb-3">
                          {s.country ?? 'International'}
                        </p>

                        {s.description && (
                          <p className="text-xs text-stone-500 mb-4 line-clamp-2 leading-relaxed">
                            {s.description}
                          </p>
                        )}
                      </div>

                      <div className="space-y-3 pt-3 border-t border-stone-200/40">
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div>
                            <span className="text-stone-400 block font-medium">Value</span>
                            <span className="font-bold text-stone-700">
                              {s.is_fully_funded ? 'Fully Funded' : amtL ? `₹${amtL} Lakhs` : 'Varies'}
                            </span>
                          </div>
                          <div>
                            <span className="text-stone-400 block font-medium">Min CGPA</span>
                            <span className="font-bold text-stone-700">
                              {s.min_cgpa ? `${s.min_cgpa}/10` : 'None'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          {s.link ? (
                            <a 
                              href={s.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              onClick={e => e.stopPropagation()}
                              className="text-[10px] font-bold text-indigo-600 flex items-center gap-1 hover:underline"
                            >
                              Details <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-[10px] text-stone-400">Institutional Apply</span>
                          )}
                          
                          <button className="text-[10px] font-bold text-stone-500 hover:text-stone-800 flex items-center gap-0.5">
                            Calculate match <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Interactive Predictor & Gap Calculator */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Main Predictor Widget Card */}
          <div className="glass-card rounded-2xl p-6 border border-stone-200/60 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4.5 h-4.5 text-indigo-600" />
                AI Predictor & Calculator
              </h3>
              <p className="text-[11px] text-stone-400 mt-0.5 font-medium">
                Verify target academic fit and map remaining out-of-pocket costs.
              </p>
            </div>

            {/* Target Select Indicator */}
            {activeScholarship ? (
              <div className="bg-slate-50 border border-slate-200/50 rounded-xl p-3 flex flex-col gap-1">
                <span className="text-[9px] text-stone-400 font-bold uppercase tracking-wider">Target Award</span>
                <span className="text-xs font-bold text-stone-800 line-clamp-1">{activeScholarship.name}</span>
                <div className="flex items-center justify-between text-[10px] text-stone-500 mt-1">
                  <span>Requirement: Min CGPA {activeScholarship.min_cgpa ?? 'Not Specified'}</span>
                  <span>Amount: {activeScholarship.is_fully_funded ? 'Full Tuition & Living' : activeScholarship.amount_usd ? `$${activeScholarship.amount_usd.toLocaleString()}` : 'Varies'}</span>
                </div>
              </div>
            ) : (
              <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 text-xs text-rose-700">
                Select a scholarship from the list to get started.
              </div>
            )}

            {/* Inputs sliders & inputs */}
            <div className="space-y-4">
              {/* Sliders for cost */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-stone-500 font-bold">Annual Tuition Fee (USD)</span>
                  <span className="text-indigo-600 font-bold">${tuitionFee.toLocaleString()} <span className="text-stone-400 font-normal">({Math.round(tuitionFee*83/100000)}L INR)</span></span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="80000"
                  step="1000"
                  value={tuitionFee}
                  onChange={e => setTuitionFee(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-stone-100 rounded-lg appearance-none"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-stone-500 font-bold">Annual Living Expenses (USD)</span>
                  <span className="text-indigo-600 font-bold">${livingCost.toLocaleString()} <span className="text-stone-400 font-normal">({Math.round(livingCost*83/100000)}L INR)</span></span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="30000"
                  step="500"
                  value={livingCost}
                  onChange={e => setLivingCost(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-stone-100 rounded-lg appearance-none"
                />
              </div>

              {/* Student scores parameters */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Your CGPA</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    step="0.1"
                    value={studentCgpa}
                    onChange={e => setStudentCgpa(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-indigo-600 text-stone-850 bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Your IELTS Score</label>
                  <input
                    type="number"
                    min="4"
                    max="9"
                    step="0.5"
                    value={studentIelts}
                    onChange={e => setStudentIelts(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-indigo-600 text-stone-850 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Calculations and predictions widgets */}
            <div className="border-t border-stone-200/40 pt-4 space-y-4">
              
              {/* Match Probability Score */}
              {activeScholarship && (
                <div className="bg-slate-50/50 border border-slate-200/40 rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">Match Probability</span>
                      <span className="text-xs font-bold text-stone-700">Admission & eligibility score</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${matchGrade.color}`}>
                      {matchGrade.label}
                    </span>
                  </div>

                  {/* Meter Bar */}
                  <div className="space-y-1">
                    <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${matchGrade.barColor} transition-all duration-700 ease-out`}
                        style={{ width: `${matchProbability}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] text-stone-400 font-bold">
                      <span>{matchProbability}% Confidence</span>
                      {activeScholarship.min_cgpa && studentCgpa < activeScholarship.min_cgpa ? (
                        <span className="text-rose-500 flex items-center gap-0.5">
                          <AlertTriangle className="w-2.5 h-2.5" /> GPA below minimum
                        </span>
                      ) : (
                        <span className="text-emerald-600 flex items-center gap-0.5">
                          <CheckCircle className="w-2.5 h-2.5" /> Meets GPA cut
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Funding Breakdowns */}
              <div className="space-y-2.5">
                <h4 className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Funding Statement</h4>

                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-slate-50 border border-slate-200/40 rounded-xl p-3 text-center">
                    <span className="text-[9px] text-stone-400 font-bold uppercase tracking-wider block">Gross Cost</span>
                    <span className="text-xs font-bold text-stone-800">${totalCost.toLocaleString()}</span>
                    <span className="text-[9px] text-stone-400 block mt-0.5">₹{Math.round(totalCostINR/100000)}L</span>
                  </div>

                  <div className="bg-indigo-50/50 border border-indigo-100/40 rounded-xl p-3 text-center">
                    <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-wider block">Scholarship</span>
                    <span className="text-xs font-bold text-indigo-700">-${scholarshipAmount.toLocaleString()}</span>
                    <span className="text-[9px] text-indigo-400 block mt-0.5">₹{Math.round(scholarshipAmountINR/100000)}L</span>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-100/40 rounded-xl p-3 text-center">
                    <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-wider block">Net Liability</span>
                    <span className="text-xs font-bold text-emerald-700">${netGapVal.toLocaleString()}</span>
                    <span className="text-[9px] text-emerald-500 block mt-0.5">₹{Math.round(netGapINR/100000)}L</span>
                  </div>
                </div>

                {/* Net Cost Warning/Recommendation Alert */}
                {profile && profile.budget_inr && (
                  <div className={`border rounded-xl p-3 text-xs leading-relaxed flex gap-2.5 ${
                    netGapINR > profile.budget_inr
                      ? 'bg-rose-50 border-rose-100 text-rose-800'
                      : 'bg-emerald-50 border-emerald-100 text-emerald-800'
                  }`}>
                    {netGapINR > profile.budget_inr ? (
                      <>
                        <AlertTriangle className="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">Estimated deficit of ₹{Math.round((netGapINR - profile.budget_inr)/100000)}L</p>
                          <p className="text-[11px] mt-0.5 text-rose-600">The net cost exceeds your declared budget profile (₹{Math.round(profile.budget_inr/100000)}L). We recommend reviewing part-time job policies or need-based aid.</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">Fits within budget profile</p>
                          <p className="text-[11px] mt-0.5 text-emerald-600">The net out-of-pocket costs are within your target budget threshold of ₹{Math.round(profile.budget_inr/100000)}L.</p>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Differentiator / Transparency Insights Box */}
          <div className="glass-card rounded-2xl p-5 border border-stone-200/50 space-y-3 bg-amber-50/40 text-amber-800">
            <h4 className="text-[10px] text-amber-700 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <TrendingDown className="w-4.5 h-4.5 text-amber-600" />
              Agent Transparency Insight
            </h4>
            <p className="text-xs leading-relaxed text-amber-700/95 font-medium">
              Study abroad consultancies frequently hide the actual costs of living or push you to universities without scholarship incentives because they collect direct referral commissions (often 10-20% of your tuition fees). 
            </p>
            <p className="text-xs leading-relaxed text-amber-700/90">
              Always plan your funding applications at least <strong>9 months</strong> before enrollment. Check if target countries permit student part-time jobs (e.g. Germany permits 140 full days per year) to cover your living costs.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}