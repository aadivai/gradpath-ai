'use client'
import { useEffect, useState } from 'react'
import { useUser } from '@/components/providers/SupabaseAuthProvider'
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
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  HelpCircle,
  TrendingDown,
  Clock,
  FileText,
  Calendar,
  CheckSquare,
  Square,
  BellRing
} from 'lucide-react'

const TYPE_LABELS: Record<string, string> = {
  merit:      'Merit',
  need:       'Need-based',
  government: 'Government',
  university: 'University',
}

const TYPE_COLORS: Record<string, string> = {
  merit:      'bg-indigo-50/70   text-indigo-700   border-indigo-100/50 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-500/20',
  need:       'bg-amber-50/70    text-amber-700    border-amber-100/50 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-500/20',
  government: 'bg-emerald-50/70  text-emerald-700  border-emerald-100/50 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-500/20',
  university: 'bg-purple-50/70   text-purple-700   border-purple-100/50 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-500/20',
}

const COUNTRIES = ['All', 'India', 'USA', 'Canada', 'United Kingdom', 'Germany', 'Ireland', 'Netherlands', 'France', 'Italy', 'Spain', 'Sweden', 'Switzerland', 'Australia', 'New Zealand', 'Singapore', 'Japan', 'South Korea', 'UAE']
const TYPES     = ['All', 'merit', 'need', 'government', 'university']

// Static enrichment data for 3.0 scholarship intelligence
const SCHOLARSHIP_METADATA: Record<string, {
  funding_percent: number
  deadline: string
  documents_required: string[]
  checklist: string[]
}> = {
  'DAAD Study Scholarships': {
    funding_percent: 100,
    deadline: 'October 31, 2026',
    documents_required: ['SOP (DAAD template)', '2 Letters of Recommendation', 'CV (Europass format)', 'Language Certificate'],
    checklist: ['Download DAAD application form', 'Request professor LORs', 'Translate transcript into German', 'Write DAAD motivation letter']
  },
  'Lester B. Pearson Scholarship': {
    funding_percent: 100,
    deadline: 'January 15, 2026',
    documents_required: ['School Nomination Form', 'Student SOP/Essay', 'Secondary School Transcripts', '2 References'],
    checklist: ['Get nominated by school principal', 'Submit Toronto undergraduate application', 'Draft Pearson Essay', 'Submit reference forms']
  },
  'Fulbright Student Program': {
    funding_percent: 100,
    deadline: 'October 15, 2026',
    documents_required: ['Study/Research Objective Essay', 'Personal Statement', '3 LORs', 'Transcripts', 'GRE/TOEFL scores'],
    checklist: ['Submit preliminary web query', 'Draft research proposal', 'Request LORs from professors', 'Scan official transcripts']
  },
  'Holland Scholarship': {
    funding_percent: 50,
    deadline: 'February 1, 2026',
    documents_required: ['Motivation Letter', 'Academic Transcripts', 'CV', 'Enrolment confirmation'],
    checklist: ['Submit application to Dutch host university', 'Write Dutch motivation letter', 'Scan Dutch acceptance page']
  },
  'JN Tata Endowment Loan Scholarship': {
    funding_percent: 40,
    deadline: 'March 15, 2026',
    documents_required: ['SOP / Essay', 'Letter of Recommendation', 'Academic Transcripts', 'Parental Income Proof'],
    checklist: ['Fill JN Tata portal application', 'Prepare for online thinking skills test', 'Attend mock interview', 'Get LOR from college dean']
  },
  'Inlaks Shivdasani Foundation Scholarship': {
    funding_percent: 100,
    deadline: 'March 30, 2026',
    documents_required: ['SOP / Essay', 'Evidence of admission', '2 LORs', 'CV', 'Portfolio (for arts/design candidates)'],
    checklist: ['Review Inlaks eligibility guidelines', 'Obtain target university acceptance offer', 'Draft Inlaks project proposal', 'Submit referee email details']
  },
  'K.C. Mahindra Postgraduate Scholarship': {
    funding_percent: 35,
    deadline: 'July 5, 2026',
    documents_required: ['Mahindra Application Form', 'Statement of Purpose', '3 LORs', 'Acceptance letter', 'GRE/GMAT/IELTS sheets'],
    checklist: ['Submit preliminary application', 'Draft SOP for Mahindra trustees', 'Request professor reference letters', 'Attend final round panel interview']
  },
  'National Overseas Scholarship Scheme (NOS)': {
    funding_percent: 100,
    deadline: 'March 31, 2026',
    documents_required: ['Caste Certificate', 'Income Certificate', 'Academic Marksheets', 'Acceptance Offer Letter', 'Aadhaar Card'],
    checklist: ['Apply on NOS portal', 'Get caste certificate verified', 'Upload official university offer letter', 'Submit family income affidavit']
  }
}

export default function ScholarshipsPage() {
  const { user, isLoaded } = useUser()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [scholarships, setScholarships] = useState<Scholarship[]>([])
  const [loading, setLoading] = useState(true)
  const [country, setCountry] = useState('All')
  const [type, setType] = useState('All')
  const [showFilters, setShowFilters] = useState(false)

  // Calculator inputs
  const [selectedScholarshipId, setSelectedScholarshipId] = useState<string>('')
  const [tuitionFee, setTuitionFee] = useState<number>(25000)
  const [livingCost, setLivingCost] = useState<number>(12000)
  const [studentCgpa, setStudentCgpa] = useState<number>(8.0)
  const [studentIelts, setStudentIelts] = useState<number>(7.0)
  const [reminderSet, setReminderSet] = useState(false)
  
  // Checklist states
  const [checkedItems, setCheckedItems] = useState<Record<string, string[]>>({})

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
  }, [isLoaded, user?.id])

  const filtered = scholarships.filter(s => {
    if (country !== 'All') {
      if (country === 'India') {
        if (s.country !== 'India') return false
      } else {
        if (s.country !== country && s.country !== 'India' && s.country !== 'All' && s.country !== 'global') return false
      }
    }
    if (type !== 'All' && s.type !== type) return false
    return true
  })

  // Selected scholarship for calculator
  const activeScholarship = scholarships.find(s => s.id === selectedScholarshipId)

  // Enrich active scholarship details
  const meta = activeScholarship ? (SCHOLARSHIP_METADATA[activeScholarship.name] || {
    funding_percent: activeScholarship.is_fully_funded ? 100 : 35,
    deadline: activeScholarship.deadline || 'April 30, 2026',
    documents_required: ['SOP / Essay', '2 Letters of Recommendation', 'CV', 'Transcript'],
    checklist: ['Submit host university offer', 'Draft motivation essay', 'Request referee letter', 'Scan academic marksheet']
  }) : null

  // Calculations
  const scholarshipAmount = activeScholarship 
    ? (activeScholarship.is_fully_funded ? (tuitionFee + livingCost) : (activeScholarship.amount_usd ?? 0))
    : 0

  const totalCost = tuitionFee + livingCost
  const netGapVal = Math.max(0, totalCost - scholarshipAmount)
  const totalCostINR = Math.round(totalCost * 83)
  const scholarshipAmountINR = Math.round(scholarshipAmount * 83)
  const netGapINR = Math.round(netGapVal * 83)

  // AI Predictor status calculation
  const getScholarshipMatchProb = (s: Scholarship, cgpaVal: number, ieltsVal: number) => {
    const minReq = s.min_cgpa ?? 0
    if (minReq === 0) return 82

    if (cgpaVal >= minReq) {
      const diff = cgpaVal - minReq
      const bonus = Math.round(diff * 12)
      const ieltsBonus = ieltsVal >= 7.0 ? 5 : 0
      return Math.min(98, 80 + bonus + ieltsBonus)
    } else {
      const diff = minReq - cgpaVal
      const penalty = Math.round(diff * 35)
      return Math.max(15, 75 - penalty)
    }
  }

  const getEligibilityStatus = (s: Scholarship, cgpaVal: number, ieltsVal: number) => {
    const prob = getScholarshipMatchProb(s, cgpaVal, ieltsVal)
    if (prob >= 85) return { label: 'Highly Recommended', color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-bold' }
    if (prob >= 70) return { label: 'Recommended', color: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/10' }
    if (prob >= 50) return { label: 'Competitive', color: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/15' }
    return { label: 'Stretch', color: 'bg-rose-500/10 text-rose-700 dark:text-rose-455 border border-rose-500/20' }
  }

  // Calculate Match Probability
  const calculateMatchProb = () => {
    if (!activeScholarship) return 0
    return getScholarshipMatchProb(activeScholarship, studentCgpa, studentIelts)
  }

  const matchProbability = calculateMatchProb()

  const getMatchGrade = (prob: number) => {
    if (prob >= 85) return { label: 'Highly Recommended', color: 'text-emerald-700 bg-emerald-50 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-500/20', dot: 'bg-emerald-500', barColor: 'bg-emerald-500' }
    if (prob >= 70) return { label: 'Recommended', color: 'text-indigo-700 bg-indigo-50 border-indigo-100 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-500/20', dot: 'bg-indigo-500', barColor: 'bg-indigo-500' }
    if (prob >= 50) return { label: 'Competitive', color: 'text-amber-700 bg-amber-50 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-500/20', dot: 'bg-amber-500', barColor: 'bg-amber-500' }
    return { label: 'Stretch', color: 'text-rose-700 bg-rose-50 border-rose-100 dark:bg-rose-950/20 dark:text-rose-455 dark:border-rose-500/20', dot: 'bg-rose-500', barColor: 'bg-rose-500' }
  }

  const matchGrade = getMatchGrade(matchProbability)

  // Advanced scholarship metrics
  const eligibilityScore = (() => {
    if (!activeScholarship) return 0
    const minReq = activeScholarship.min_cgpa ?? 0
    if (minReq === 0) {
      return Math.min(100, Math.round((studentCgpa / 8.0) * 85 + (studentIelts / 7.0) * 15))
    }
    return Math.min(100, Math.round((studentCgpa / minReq) * 85 + (studentIelts / 7.5) * 15))
  })()

  const estimatedRoi = (() => {
    if (!activeScholarship) return 'N/A'
    if (activeScholarship.is_fully_funded) {
      return 'Very High (100% Tuition & Living covered)'
    }
    const percentCovered = (scholarshipAmount / totalCost) * 100
    if (percentCovered >= 75) {
      return `Very High (${Math.round(percentCovered)}% Cost covered)`
    }
    if (percentCovered >= 50) {
      return `High (${Math.round(percentCovered)}% Cost covered)`
    }
    if (percentCovered >= 25) {
      return `Moderate (${Math.round(percentCovered)}% Cost covered)`
    }
    return `Balanced (Partial tuition/fees covered)`
  })()

  const visaCompatibility = (() => {
    if (!activeScholarship) return 'N/A'
    if (activeScholarship.is_fully_funded || netGapVal === 0) {
      return 'Excellent (99% - Fully Sponsored / Zero Gap)'
    }
    if (netGapVal < 10000) {
      return 'High (92% - Low funding gap, easily approved with minor proof)'
    }
    if (netGapVal < 25000) {
      return 'Good (85% - Standard gap, requires moderate liquid funds/loan)'
    }
    return 'Moderate (72% - Large gap, requires substantial sponsor/collateral loan proof)'
  })()

  const handleSelectScholarship = (s: Scholarship) => {
    setSelectedScholarshipId(s.id)
    setReminderSet(false)
  }

  const toggleChecklist = (schId: string, item: string) => {
    const current = checkedItems[schId] || []
    let next: string[]
    if (current.includes(item)) {
      next = current.filter(x => x !== item)
    } else {
      next = [...current, item]
    }
    setCheckedItems({ ...checkedItems, [schId]: next })
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
          <Award className="w-6 h-6 text-indigo-600" />
          AI Scholarship Intelligence
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Explore international funding schemes, evaluate eligibility grades, and sync application checklists.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Directory & List */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-card rounded-2xl p-5 border border-border bg-card space-y-4">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="w-full flex items-center justify-between text-xs font-bold text-foreground uppercase tracking-wider cursor-pointer select-none outline-none"
            >
              <span className="flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-indigo-600" />
                Filter Schemes
              </span>
              <span className="text-muted-foreground flex items-center gap-2">
                {!showFilters && (
                  <span className="text-[10px] lowercase font-semibold text-indigo-650 bg-indigo-50/50 border border-indigo-100/50 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-500/20 px-2.5 py-0.5 rounded-md">
                    {country} • {type === 'All' ? 'all classes' : TYPE_LABELS[type]}
                  </span>
                )}
                {showFilters ? <ChevronUp className="w-4 h-4 text-indigo-600" /> : <ChevronDown className="w-4 h-4 text-indigo-600" />}
              </span>
            </button>

            {showFilters && (
              <div className="space-y-4 pt-4 border-t border-border/40 animate-fade-in">
                {/* Country Selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Country</label>
                  <div className="flex flex-wrap gap-1.5">
                    {COUNTRIES.map(c => (
                      <button
                        key={c}
                        onClick={() => setCountry(c)}
                        className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
                          country === c
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-card text-muted-foreground border-border hover:border-indigo-500/30'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Type Selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Scholarship Class</label>
                  <div className="flex flex-wrap gap-1.5">
                    {TYPES.map(t => (
                      <button
                        key={t}
                        onClick={() => setType(t)}
                        className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
                          type === t
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-card text-muted-foreground border-border hover:border-indigo-500/30'
                        }`}
                      >
                        {t === 'All' ? 'All Types' : TYPE_LABELS[t]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Results Listings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">
                Available Programs ({filtered.length})
              </p>
              {profile && (
                <span className="text-[10px] font-semibold text-indigo-650 bg-indigo-50 border border-indigo-100 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-500/20 px-2 py-0.5 rounded-full">
                  Profile CGPA: {profile.cgpa ?? 'None'}
                </span>
              )}
            </div>

            {loading ? (
              <div className="animate-pulse grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-card border border-border rounded-2xl h-44" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 bg-card border border-border/40 rounded-2xl">
                <p className="text-xs text-muted-foreground">No funding opportunities found for the selected filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filtered.map(s => {
                  const amtL = s.amount_usd ? Math.round(s.amount_usd * 83 / 100000) : null
                  const isSelected = selectedScholarshipId === s.id
                  const status = getEligibilityStatus(s, studentCgpa, studentIelts)

                  return (
                    <div 
                      key={s.id} 
                      onClick={() => handleSelectScholarship(s)}
                      className={`glass-card rounded-2xl p-5 border cursor-pointer transition-all duration-300 relative flex flex-col justify-between group ${
                        isSelected 
                          ? 'border-indigo-600 ring-2 ring-indigo-100 bg-indigo-50/20' 
                          : 'border-border hover:border-indigo-500/30 bg-card'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <p className="text-xs font-bold text-foreground leading-snug group-hover:text-indigo-600 transition-colors">
                            {s.name}
                          </p>
                          <span className={`shrink-0 text-[9px] font-bold px-2 py-0.5 rounded-full border ${TYPE_COLORS[s.type]}`}>
                            {TYPE_LABELS[s.type]}
                          </span>
                        </div>

                        {/* Country & AI status row */}
                        <div className="flex items-center justify-between mb-3 text-[10px] font-semibold">
                          <span className="text-muted-foreground uppercase tracking-wider">{s.country ?? 'International'}</span>
                          <span className={`px-2 py-0.5 rounded font-black text-[9px] uppercase tracking-wider ${status.color}`}>
                            {status.label}
                          </span>
                        </div>

                        {s.description && (
                          <p className="text-xs text-muted-foreground mb-4 line-clamp-2 leading-relaxed font-semibold">
                            {s.description}
                          </p>
                        )}
                      </div>

                      <div className="space-y-3 pt-3 border-t border-border/40">
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div>
                            <span className="text-muted-foreground block font-medium">Value</span>
                            <span className="font-bold text-foreground/80">
                              {s.is_fully_funded ? 'Fully Funded' : amtL ? `₹${amtL} Lakhs` : 'Varies'}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block font-medium">Min CGPA</span>
                            <span className="font-bold text-foreground/80">
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
                            <span className="text-[10px] text-muted-foreground">Institutional Apply</span>
                          )}
                          
                          <button className="text-[10px] font-bold text-muted-foreground group-hover:text-indigo-600 flex items-center gap-0.5">
                            Details & Calculator <ChevronRight className="w-3 h-3" />
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

        {/* Right Side: Interactive Predictor, Gap Calculator & Checklist */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Main Predictor Widget Card */}
          <div className="glass-card rounded-2xl p-6 border border-border bg-card space-y-6">
            <div>
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4.5 h-4.5 text-indigo-600" />
                AI Predictor & Calculator
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">
                Verify target academic fit and map remaining out-of-pocket costs.
              </p>
            </div>

            {/* Target Select Indicator */}
            {activeScholarship ? (
              <div className="bg-muted border border-border rounded-xl p-3 flex flex-col gap-1">
                <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Target Award</span>
                <span className="text-xs font-bold text-foreground line-clamp-1">{activeScholarship.name}</span>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1">
                  <span>Requirement: Min CGPA {activeScholarship.min_cgpa ?? 'Not Specified'}</span>
                  <span>Funding: {meta?.funding_percent ?? 50}%</span>
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
                  <span className="text-muted-foreground font-bold">Annual Tuition Fee (USD)</span>
                  <span className="text-indigo-600 font-bold">${tuitionFee.toLocaleString()} <span className="text-muted-foreground font-normal">({Math.round(tuitionFee*83/100000)}L INR)</span></span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="80000"
                  step="1000"
                  value={tuitionFee}
                  onChange={e => setTuitionFee(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-muted rounded-lg appearance-none"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground font-bold">Annual Living Expenses (USD)</span>
                  <span className="text-indigo-600 font-bold">${livingCost.toLocaleString()} <span className="text-muted-foreground font-normal">({Math.round(livingCost*83/100000)}L INR)</span></span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="30000"
                  step="500"
                  value={livingCost}
                  onChange={e => setLivingCost(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-muted rounded-lg appearance-none"
                />
              </div>

              {/* Student scores parameters */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Your CGPA</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    step="0.1"
                    value={studentCgpa}
                    onChange={e => setStudentCgpa(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-border rounded-xl text-xs font-semibold focus:outline-indigo-500 text-foreground bg-card"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Your IELTS Score</label>
                  <input
                    type="number"
                    min="4"
                    max="9"
                    step="0.5"
                    value={studentIelts}
                    onChange={e => setStudentIelts(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-border rounded-xl text-xs font-semibold focus:outline-indigo-500 text-foreground bg-card"
                  />
                </div>
              </div>
            </div>

            {/* Calculations and predictions widgets */}
            <div className="border-t border-border/40 pt-4 space-y-4">
              
              {/* Match Probability Score */}
              {activeScholarship && (
                <div className="bg-muted/50 border border-border/40 rounded-xl p-4 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">Predictor Grade</span>
                      <span className="text-xs font-bold text-foreground/80">Overall profile evaluation</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${matchGrade.color}`}>
                      {matchGrade.label}
                    </span>
                  </div>

                  {/* Meter Bar */}
                  <div className="space-y-1">
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${matchGrade.barColor} transition-all duration-700 ease-out`}
                        style={{ width: `${matchProbability}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] text-muted-foreground font-bold">
                      <span>{matchProbability}% Match Confidence</span>
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

                  {/* Advanced Score Parameters (Eligibility Score, ROI, Visa) */}
                  <div className="border-t border-border/40 pt-3.5 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <Percent className="w-3.5 h-3.5 text-indigo-500" />
                        <span className="text-muted-foreground font-semibold">Eligibility Score</span>
                      </div>
                      <span className="font-bold text-foreground">{eligibilityScore} / 100</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-muted-foreground font-semibold">Estimated ROI</span>
                      </div>
                      <span className="font-bold text-foreground text-right text-[11px] max-w-[200px] truncate" title={estimatedRoi}>
                        {estimatedRoi}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                        <span className="text-muted-foreground font-semibold">Visa Compatibility</span>
                      </div>
                      <span className="font-bold text-foreground text-right text-[11px] max-w-[200px] truncate" title={visaCompatibility}>
                        {visaCompatibility}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Funding Breakdowns */}
              <div className="space-y-2.5">
                <h4 className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Funding Statement</h4>

                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-muted border border-border/40 rounded-xl p-3 text-center">
                    <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider block">Gross Cost</span>
                    <span className="text-xs font-bold text-foreground">${totalCost.toLocaleString()}</span>
                    <span className="text-[9px] text-muted-foreground block mt-0.5">₹{Math.round(totalCostINR/100000)}L</span>
                  </div>

                  <div className="bg-indigo-50/50 border border-indigo-100/40 rounded-xl p-3 text-center">
                    <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-wider block">Scholarship</span>
                    <span className="text-xs font-bold text-indigo-750">-${scholarshipAmount.toLocaleString()}</span>
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

          {/* New 3.0 Documents Required & Checklist section */}
          {activeScholarship && meta && (
            <div className="glass-card rounded-2xl p-5 border border-border bg-card space-y-4">
              <div>
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  Application Checklist & Docs
                </h3>
                <p className="text-[10px] text-muted-foreground mt-0.5 font-semibold">
                  Deadline: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{meta.deadline}</span>
                </p>
              </div>

              {/* Documents lists */}
              <div className="space-y-1 text-xs">
                <span className="text-[9px] uppercase font-bold text-muted-foreground block mb-1">Required Dossier Documents</span>
                <div className="flex flex-wrap gap-1.5">
                  {meta.documents_required.map(doc => (
                    <span key={doc} className="px-2.5 py-1 bg-muted border border-border rounded-lg text-foreground font-semibold text-[10px]">
                      {doc}
                    </span>
                  ))}
                </div>
              </div>

              {/* Checklist items */}
              <div className="space-y-2.5 pt-2 border-t border-border/40">
                <span className="text-[9px] uppercase font-bold text-muted-foreground block">Prep Tasks</span>
                <div className="space-y-2">
                  {meta.checklist.map(item => {
                    const checkedList = checkedItems[activeScholarship.id] || []
                    const checked = checkedList.includes(item)
                    return (
                      <button
                        key={item}
                        onClick={() => toggleChecklist(activeScholarship.id, item)}
                        className="w-full text-left flex items-start gap-2 text-xs font-medium text-foreground hover:text-indigo-650 transition-colors group cursor-pointer"
                      >
                        <span className="shrink-0 text-indigo-600 dark:text-indigo-400 mt-0.5">
                          {checked ? (
                            <CheckSquare className="w-4 h-4" />
                          ) : (
                            <Square className="w-4 h-4 text-muted-foreground/60 group-hover:text-indigo-500" />
                          )}
                        </span>
                        <span className={checked ? 'line-through text-muted-foreground' : 'text-foreground/80'}>
                          {item}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Setup Auto Reminder Mock button */}
              <button 
                onClick={() => {
                  setReminderSet(true)
                  alert(`Auto-reminder registered! You will receive email alerts 15 days before the ${activeScholarship.name} deadline (${meta.deadline}).`)
                }}
                disabled={reminderSet}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border cursor-pointer ${
                  reminderSet 
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20' 
                    : 'bg-card text-foreground border-border hover:bg-muted'
                }`}
              >
                <BellRing className="w-4 h-4" />
                {reminderSet ? 'Deadline Notification Configured ✓' : 'Configure Auto-Reminder'}
              </button>

            </div>
          )}

          {/* Differentiator / Transparency Insights Box */}
          <div className="glass-card rounded-2xl p-5 border border-border space-y-3 bg-amber-50/40 text-amber-800 dark:bg-amber-950/20 dark:text-amber-300">
            <h4 className="text-[10px] text-amber-700 dark:text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <TrendingDown className="w-4.5 h-4.5 text-amber-600 dark:text-amber-500" />
              Agent Transparency Insight
            </h4>
            <p className="text-xs leading-relaxed text-amber-700/95 dark:text-amber-300/95 font-medium">
              Study abroad consultancies frequently hide the actual costs of living or push you to universities without scholarship incentives because they collect direct referral commissions (often 10-20% of your tuition fees). 
            </p>
            <p className="text-xs leading-relaxed text-amber-700/90 dark:text-amber-300/80">
              Always plan your funding applications at least <strong>9 months</strong> before enrollment. Check if target countries permit student part-time jobs (e.g. Germany permits 140 full days per year) to cover your living costs.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}