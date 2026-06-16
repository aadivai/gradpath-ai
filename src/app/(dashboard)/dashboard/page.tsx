'use client'
import { useEffect, useState } from 'react'
import { useUser } from '@/components/providers/SupabaseAuthProvider'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { parseProfile } from '@/utils/profileMetadata'
import type { Profile } from '@/types'
import {
  UserCheck,
  Bookmark,
  Send,
  Plane,
  TrendingUp,
  Heart,
  ListTodo,
  Compass,
  Award,
  Sparkles,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Check,
  Briefcase,
  Wallet,
  FileText,
  UserMinus,
  Link2
} from 'lucide-react'

const QUICK_ACTIONS = [
  { label: 'Browse Universities', href: '/universities', icon: Compass, colorBg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 group-hover:text-blue-700 dark:group-hover:text-blue-300', desc: 'Find matches & detail ecosystem' },
  { label: 'Scholarship Intelligence', href: '/scholarships', icon: Award, colorBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/40 group-hover:text-amber-700 dark:group-hover:text-amber-300', desc: 'Eligibility predictor & auto-reminders' },
  { label: 'SOP & Essay Assistant', href: '/sop-assistant', icon: Sparkles, colorBg: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/40 group-hover:text-purple-700 dark:group-hover:text-purple-300', desc: 'Tone matching & version logs' },
  { label: 'Resume & LOR Studio', href: '/resume-builder', icon: FileText, colorBg: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/40 group-hover:text-indigo-700 dark:group-hover:text-indigo-300', desc: 'Harvard format CVs & recommendation letters' },
  { label: 'Interactive World Explorer', href: '/explorer', icon: Plane, colorBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/40 group-hover:text-emerald-700 dark:group-hover:text-emerald-300', desc: 'Map explorer & country insights' },
  { label: 'Relocation & Packing Assistant', href: '/relocation', icon: Wallet, colorBg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 group-hover:bg-rose-100 dark:group-hover:bg-rose-900/40 group-hover:text-rose-700 dark:group-hover:text-rose-300', desc: 'Accommodation guides & checklist' },
]

function completionPercent(p: Profile): number {
  const fields = [p.cgpa, p.branch, p.budget_inr, p.ielts_score, p.target_intake]
  const filled = fields.filter((f) => f !== null && f !== undefined).length
  return Math.round((filled / fields.length) * 100)
}

export default function DashboardPage() {
  const { user, isLoaded } = useUser()
  const [profile, setProfile]   = useState<Profile | null>(null)
  const [savedCount, setSavedCount] = useState(0)
  const [tasksDone, setTasksDone]   = useState(0)
  const [tasksTotal, setTasksTotal] = useState(0)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    if (!isLoaded || !user) return

    async function load() {
      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('clerk_user_id', user!.id)
        .maybeSingle()

      setProfile(prof ? parseProfile(prof) : null)

      if (prof?.id) {
        const [{ count: saved }, { data: tasks }] = await Promise.all([
          supabase
            .from('saved_universities')
            .select('*', { count: 'exact', head: true })
            .eq('profile_id', prof.id),
          supabase
            .from('timeline_tasks')
            .select('is_completed')
            .eq('profile_id', prof.id),
        ])
        setSavedCount(saved ?? 0)
        setTasksDone((tasks ?? []).filter((t) => t.is_completed).length)
        setTasksTotal((tasks ?? []).length)
      }

      setLoading(false)
    }

    load()
  }, [isLoaded, user?.id])

  const completion = profile ? completionPercent(profile) : 0
  const name = profile?.full_name?.split(' ')[0] ?? user?.firstName ?? 'there'

  // Dynamic OS Calculations (3.0 Vision)
  const cgpa = profile?.cgpa ?? 0
  const ielts = profile?.ielts_score ?? 0
  const gre = profile?.gre_score ?? 0
  const workExp = profile?.work_experience_months ?? 0
  const research = profile?.research_experience_months ?? 0
  const projects = profile?.projects_count ?? 0
  const publications = profile?.publications_count ?? 0
  const internships = profile?.internships_count ?? 0
  const budget = profile?.budget_inr ?? 0

  // 1. Acceptance Probability
  const calculateAcceptance = () => {
    if (!profile) return 30
    let score = 25
    if (cgpa >= 8.5) score += 30
    else if (cgpa >= 7.5) score += 20
    else if (cgpa >= 6.0) score += 10

    if (ielts >= 7.0) score += 15
    else if (ielts >= 6.0) score += 10

    if (gre >= 310) score += 15
    else if (gre > 0) score += 5

    const researchWeight = Math.min(15, research * 1 + publications * 5)
    score += researchWeight

    return Math.min(98, score)
  }

  // 2. Scholarship Probability
  const calculateScholarship = () => {
    if (!profile) return 10
    let score = 10
    if (cgpa >= 9.0) score += 40
    else if (cgpa >= 8.0) score += 25
    else if (cgpa >= 7.0) score += 10

    const publicationsWeight = Math.min(30, publications * 15 + research * 2)
    score += publicationsWeight

    const projectWeight = Math.min(20, projects * 3 + internships * 5 + (workExp > 0 ? 5 : 0))
    score += projectWeight

    return Math.min(95, score)
  }

  // 3. Visa Probability
  const calculateVisa = () => {
    if (!profile) return 50
    let score = 60
    // Financial proof check
    if (budget >= 3000000) score += 20
    else if (budget >= 1500000) score += 10
    else score -= 10

    // Backlog penalty
    if (profile.backlogs > 0) {
      score -= Math.min(30, profile.backlogs * 8)
    }

    // Language waiver status
    if (ielts >= 6.5) score += 15
    else if (ielts > 0) score += 5

    return Math.min(99, Math.max(15, score))
  }

  // 4. Application Strength
  const calculateStrength = () => {
    if (!profile) return 15
    let score = 15
    if (completion === 100) score += 25
    if (savedCount > 0) score += 20
    if (tasksTotal > 0) {
      score += Math.round((tasksDone / tasksTotal) * 20)
    }
    // SOP draft & Resume final checks mock integration
    if (projects > 0) score += 10
    if (workExp > 0 || internships > 0) score += 10
    return Math.min(100, score)
  }

  // 5. Weak Areas Diagnostic
  const getWeakAreas = () => {
    const areas = []
    if (!profile) {
      return [{ title: 'Profile Incomplete', desc: 'No academic or test records found. Fill your profile to start matchmaking.' }]
    }
    if (cgpa === 0) {
      areas.push({ title: 'Academic CGPA Missing', desc: 'Enter your undergraduate CGPA to unlock safe / dream tier analysis.' })
    }
    if (ielts === 0) {
      areas.push({ title: 'Language Score Missing', desc: 'Add your IELTS / TOEFL score. Universities require verified scores for formal offers.' })
    }
    if (budget === 0) {
      areas.push({ title: 'Financial Budget Missing', desc: 'Specify your yearly budget in INR to evaluate financial visa success requirements.' })
    }
    if (profile.backlogs > 0) {
      areas.push({ title: 'Active Backlogs Recorded', desc: `You have ${profile.backlogs} backlog(s). Emphasize project work and internships in your SOP to offset this.` })
    }
    if (research === 0 && publications === 0) {
      areas.push({ title: 'Research Profile is Thin', desc: 'No research experience or papers listed. Strengthen your profile by highlighting academic projects in the SOP.' })
    }
    if (areas.length === 0) {
      areas.push({ title: 'Profile is Elite', desc: 'Your profile has zero diagnostic warnings. Focus on preparing high-scoring target SOPs.' })
    }
    return areas
  }

  const acceptance = calculateAcceptance()
  const scholarship = calculateScholarship()
  const visaProb = calculateVisa()
  const strength = calculateStrength()
  const weakAreas = getWeakAreas()

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border/40 pb-5 gap-4">
        {loading ? (
          <div className="animate-pulse">
            <div className="h-6 bg-muted rounded w-48 mb-2" />
            <div className="h-4 bg-muted rounded w-72" />
          </div>
        ) : (
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">
              Admissions Control Cockpit
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Welcome back, <span className="text-indigo-600 dark:text-indigo-400 font-bold">{name}</span>. Your personalized AI-First study abroad roadmap is fully calculated.
            </p>
          </div>
        )}

        {!loading && (
          <div className="flex bg-card border border-border p-2 rounded-xl text-[10px] uppercase font-bold tracking-wider gap-3 shadow-xs items-center">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              AI Memory: Active
            </span>
            <span className="text-muted-foreground">|</span>
            <span>Shortlisted: {savedCount} Unis</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
          {[1,2,3,4].map(i => <div key={i} className="h-28 bg-muted rounded-2xl" />)}
        </div>
      ) : (
        /* ================== VISUAL AI METERS GRID ================== */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Gauge 1: Application Strength */}
          <div className="glass-card rounded-2xl p-5 border border-border bg-card flex flex-col justify-between items-center text-center">
            <span className="text-[9px] text-muted-foreground uppercase font-black tracking-wider">Application Strength</span>
            <div className="relative w-24 h-24 flex items-center justify-center my-3">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle className="text-muted/10 dark:text-muted/5" strokeWidth="6" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
                <circle className="text-indigo-600 dark:text-indigo-400 transition-all duration-1000" strokeWidth="6" strokeDasharray={251.2} strokeDashoffset={251.2 - (251.2 * strength) / 100} strokeLinecap="round" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
              </svg>
              <span className="absolute text-lg font-black text-foreground">{strength}%</span>
            </div>
            <span className="text-[10px] text-muted-foreground font-semibold">Overall milestones hit</span>
          </div>

          {/* Gauge 2: Acceptance Probability */}
          <div className="glass-card rounded-2xl p-5 border border-border bg-card flex flex-col justify-between items-center text-center">
            <span className="text-[9px] text-muted-foreground uppercase font-black tracking-wider">Acceptance Confidence</span>
            <div className="relative w-24 h-24 flex items-center justify-center my-3">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle className="text-muted/10 dark:text-muted/5" strokeWidth="6" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
                <circle className="text-blue-500 transition-all duration-1000" strokeWidth="6" strokeDasharray={251.2} strokeDashoffset={251.2 - (251.2 * acceptance) / 100} strokeLinecap="round" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
              </svg>
              <span className="absolute text-lg font-black text-foreground">{acceptance}%</span>
            </div>
            <span className="text-[10px] text-muted-foreground font-semibold">GPA & Test credentials rating</span>
          </div>

          {/* Gauge 3: Scholarship Eligibility */}
          <div className="glass-card rounded-2xl p-5 border border-border bg-card flex flex-col justify-between items-center text-center">
            <span className="text-[9px] text-muted-foreground uppercase font-black tracking-wider">Scholarship Odds</span>
            <div className="relative w-24 h-24 flex items-center justify-center my-3">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle className="text-muted/10 dark:text-muted/5" strokeWidth="6" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
                <circle className="text-purple-500 transition-all duration-1000" strokeWidth="6" strokeDasharray={251.2} strokeDashoffset={251.2 - (251.2 * scholarship) / 100} strokeLinecap="round" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
              </svg>
              <span className="absolute text-lg font-black text-foreground">{scholarship}%</span>
            </div>
            <span className="text-[10px] text-muted-foreground font-semibold">Research & Project weight</span>
          </div>

          {/* Gauge 4: Visa Success Probability */}
          <div className="glass-card rounded-2xl p-5 border border-border bg-card flex flex-col justify-between items-center text-center">
            <span className="text-[9px] text-muted-foreground uppercase font-black tracking-wider">Visa Success Ratio</span>
            <div className="relative w-24 h-24 flex items-center justify-center my-3">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle className="text-muted/10 dark:text-muted/5" strokeWidth="6" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
                <circle className="text-emerald-500 transition-all duration-1000" strokeWidth="6" strokeDasharray={251.2} strokeDashoffset={251.2 - (251.2 * visaProb) / 100} strokeLinecap="round" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
              </svg>
              <span className="absolute text-lg font-black text-foreground">{visaProb}%</span>
            </div>
            <span className="text-[10px] text-muted-foreground font-semibold">Funds & Backlog criteria index</span>
          </div>

        </div>
      )}

      {/* Main Grid: Left Diagnostics and Actions, Right Roadmap Milestone */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Span: Diagnostics & Quick actions (col-span-8) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Profile incomplete CTA Banner if under 100% */}
          {!loading && completion < 100 && (
            <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-5 flex items-start gap-4 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-500 dark:text-indigo-400 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-indigo-900 dark:text-indigo-300">Complete your student study profile</p>
                <p className="text-xs text-indigo-600/90 dark:text-indigo-300/80 mt-0.5 leading-relaxed font-semibold">
                  We need your GPA, test scores, and budget to compute your safe/moderate recommendations and generate target-tailored documents.
                </p>
                <Link href="/profile" className="inline-flex items-center gap-1.5 mt-3 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-all">
                  Complete Profile <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* Quick Actions Navigator */}
          <div className="space-y-3">
            <div>
              <h2 className="text-xs font-black text-foreground uppercase tracking-wider">Operating System Modules</h2>
              <p className="text-[10px] text-muted-foreground font-medium mt-0.5">Direct entry points to counselor modules</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon
                return (
                  <Link key={action.href} href={action.href} className="glass-card rounded-2xl p-5 flex items-start gap-4 border border-border bg-card hover:shadow-xs group">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300 ${action.colorBg}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {action.label}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed font-semibold">{action.desc}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Budget Health Analyzer */}
          {!loading && profile && (
            <div className="glass-card rounded-2xl p-5 border border-border bg-card space-y-4">
              <div>
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Wallet className="w-4.5 h-4.5 text-indigo-600" />
                  Financial & Budget Health
                </h3>
                <p className="text-[10px] text-muted-foreground font-medium mt-0.5 font-semibold">Evaluation of relocation and tuition resources</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                <div className="p-4 bg-muted rounded-xl border border-border/50 space-y-1">
                  <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground">My Annual Budget</span>
                  <p className="text-xl font-black text-foreground">
                    {budget > 0 ? `₹${(budget/100000).toFixed(1)} Lakhs` : 'Not Specified'}
                  </p>
                  <p className="text-[9.5px] text-muted-foreground leading-normal font-semibold">
                    Equals approx. ${budget > 0 ? Math.round(budget/83).toLocaleString() : '0'} USD
                  </p>
                </div>
                <div className="space-y-2.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="font-semibold text-foreground/80">Funds match major German universities (Tuition-free)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {budget >= 2500000 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                    )}
                    <span className="font-semibold text-foreground/80">
                      {budget >= 2500000 ? 'Sufficient for USA/Canada tuition benchmarks' : 'Budget is thin for top-tier USA/Canada programs'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Span: Diagnostic Weak Areas & Timeline Tracker (col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Weak Areas Diagnostics list */}
          <div className="glass-card rounded-2xl p-5 border border-border bg-card space-y-4">
            <div>
              <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4.5 h-4.5 text-indigo-600" />
                Profile Strength Diagnostics
              </h3>
              <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">Identified weak spots & recommendations</p>
            </div>
            
            <div className="space-y-3.5">
              {loading ? (
                [1,2].map(i => <div key={i} className="h-10 bg-muted rounded-lg" />)
              ) : (
                weakAreas.map((area, index) => (
                  <div key={index} className="flex items-start gap-2.5 text-xs">
                    {area.title.includes('Elite') ? (
                      <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4.5 h-4.5 text-amber-500 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-0.5">
                      <span className="font-bold block text-foreground">{area.title}</span>
                      <span className="text-[10px] text-muted-foreground leading-normal font-semibold block">{area.desc}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Timeline Milestones Progression */}
          <div className="glass-card rounded-2xl p-5 border border-border bg-card space-y-4">
            <div>
              <h3 className="text-xs font-black text-foreground uppercase tracking-wider">Timeline Progression</h3>
              <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">Milestones checklist status</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold border-b border-border/40 pb-2">
                <span className="text-muted-foreground">Overall Completed</span>
                <span className="text-indigo-650">{tasksTotal ? `${tasksDone}/${tasksTotal}` : '0/0'} Tasks</span>
              </div>

              <div className="space-y-2.5 pt-1">
                {[
                  { label: 'Academic Study Profile', done: completion === 100 },
                  { label: 'University Shortlisting', done: savedCount > 0 },
                  { label: 'Statement of Purpose Draft', done: projects > 0 }, // mock checklist
                  { label: 'Resume & LOR Assembly', done: workExp > 0 || internships > 0 },
                  { label: 'Visa Simulator Prep', done: tasksDone > 2 }
                ].map((step, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className={`font-semibold ${step.done ? 'text-foreground/80' : 'text-muted-foreground'}`}>
                      {step.label}
                    </span>
                    {step.done ? (
                      <Check className="w-4 h-4 text-emerald-500 stroke-[3]" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-border" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}
