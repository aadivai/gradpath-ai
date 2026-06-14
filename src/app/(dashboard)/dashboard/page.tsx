'use client'
import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
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
  Check
} from 'lucide-react'

type StatCardProps = {
  label: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  iconBg: string
  iconColor: string
}

function StatCard({ label, value, icon: Icon, iconBg, iconColor }: StatCardProps) {
  return (
    <div className="glass-card rounded-2xl p-5 flex items-center justify-between group cursor-pointer border border-border bg-card">
      <div>
        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">{label}</p>
        <p className="text-2xl font-bold text-foreground tracking-tight">{value}</p>
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg} ${iconColor} transition-all duration-300 group-hover:scale-110`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 animate-pulse flex items-center justify-between">
      <div className="flex-1">
        <div className="h-3 bg-muted rounded w-1/2 mb-2" />
        <div className="h-7 bg-muted rounded w-1/3" />
      </div>
      <div className="w-10 h-10 bg-muted rounded-lg" />
    </div>
  )
}

const ROADMAP_STEPS = [
  { label: 'Profile', icon: UserCheck, desc: 'Add grades & test scores' },
  { label: 'Shortlist', icon: Bookmark, desc: 'Find & save universities' },
  { label: 'Apply', icon: Send, desc: 'Prepare SOP & applications' },
  { label: 'Visa', icon: Plane, desc: 'Apply for visa & finances' }
]

const QUICK_ACTIONS = [
  { label: 'Browse universities', href: '/universities', icon: Compass, colorBg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 group-hover:text-blue-700 dark:group-hover:text-blue-300', desc: 'Find your best matches' },
  { label: 'Find scholarships',   href: '/scholarships', icon: Award, colorBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/40 group-hover:text-amber-700 dark:group-hover:text-amber-300', desc: 'Funding opportunities' },
  { label: 'Generate SOP',        href: '/sop-assistant',icon: Sparkles, colorBg: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/40 group-hover:text-purple-700 dark:group-hover:text-purple-300', desc: 'AI-drafted statement' },
  { label: 'Visa guidance',       href: '/visa',         icon: BookOpen, colorBg: 'bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 group-hover:bg-green-100 dark:group-hover:bg-green-900/40 group-hover:text-green-700 dark:group-hover:text-green-300', desc: 'Country-wise process' },
]

function completionPercent(p: Profile): number {
  const fields = [p.cgpa, p.branch, p.budget_inr, p.ielts_score, p.target_intake]
  const filled = fields.filter((f) => f !== null && f !== undefined).length
  return Math.round((filled / fields.length) * 100)
}

function calculateProfileStrength(p: Profile): number {
  let strength = 20
  if (p.cgpa) strength += 20
  if (p.ielts_score || p.toefl_score) strength += 15
  if (p.gre_score) strength += 15
  if (p.research_experience_months && p.research_experience_months > 0) strength += 15
  if (p.projects_count && p.projects_count > 0) strength += 15
  return Math.min(100, strength)
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
        .single()

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
  }, [isLoaded, user])

  const completion = profile ? completionPercent(profile) : 0
  const name = profile?.full_name?.split(' ')[0] ?? user?.firstName ?? 'there'
  const strength = profile ? calculateProfileStrength(profile) : 0

  // Dynamic roadmap state engine
  const isStepDone = (index: number) => {
    if (index === 0) return completion === 100
    if (index === 1) return completion === 100 && savedCount > 0
    if (index === 2) return completion === 100 && savedCount > 0 && tasksDone > 0
    if (index === 3) return completion === 100 && savedCount > 0 && tasksTotal > 0 && tasksDone === tasksTotal
    return false
  }

  const isStepActive = (index: number) => {
    if (index === 0) return completion < 100
    if (index === 1) return completion === 100 && savedCount === 0
    if (index === 2) return completion === 100 && savedCount > 0 && tasksDone === 0
    if (index === 3) return completion === 100 && savedCount > 0 && tasksDone > 0 && tasksDone < tasksTotal
    return false
  }

  const getStrengthLabel = (score: number) => {
    if (score >= 80) return { text: 'Strong', color: 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/20 dark:border-emerald-500/20 border-emerald-100', dot: 'bg-emerald-500' }
    if (score >= 50) return { text: 'Moderate', color: 'text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/20 dark:border-amber-500/20 border-amber-100', dot: 'bg-amber-500' }
    return { text: 'Needs Info', color: 'text-rose-700 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/20 dark:border-rose-500/20 border-rose-100', dot: 'bg-rose-500' }
  }

  const strengthLabel = getStrengthLabel(strength)

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
      {/* Header Banner */}
      <div className="flex items-center justify-between">
        {loading ? (
          <div className="animate-pulse">
            <div className="h-6 bg-muted rounded w-48 mb-2" />
            <div className="h-4 bg-muted rounded w-72" />
          </div>
        ) : (
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Welcome back, <span className="text-indigo-600 dark:text-indigo-400">{name}</span> 👋
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              {completion < 100
                ? 'Fill your profile details to unlock smart matches.'
                : 'Your student profile is active. Check your recommended universities.'}
            </p>
          </div>
        )}
      </div>

      {/* Stats KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <StatCard 
              label="Profile progress" 
              value={`${completion}%`} 
              icon={TrendingUp} 
              iconBg="bg-indigo-50 dark:bg-indigo-950/30" 
              iconColor="text-indigo-600 dark:text-indigo-450" 
            />
            <StatCard 
              label="Saved universities" 
              value={String(savedCount)} 
              icon={Heart} 
              iconBg="bg-rose-50 dark:bg-rose-950/30" 
              iconColor="text-rose-600 dark:text-rose-450" 
            />
            <StatCard
              label="Timeline tasks"
              value={tasksTotal ? `${tasksDone}/${tasksTotal}` : '0/0'}
              icon={ListTodo}
              iconBg="bg-emerald-50 dark:bg-emerald-950/30"
              iconColor="text-emerald-600 dark:text-emerald-450"
            />
          </>
        )}
      </div>

      {/* Profile Strength & Improvement Recommendation Meter */}
      {!loading && profile && (
        <div className="glass-card rounded-2xl p-6 border border-border bg-card space-y-4">
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <div>
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400" />
                AI Profile Strength Analyzer
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">Evaluation based on admissions probability algorithms</p>
            </div>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${strengthLabel.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${strengthLabel.dot}`} />
              {strengthLabel.text}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Visual Circular/Radial Meter */}
            <div className="flex flex-col items-center justify-center py-2 border-r border-border/40">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle className="text-muted/20" strokeWidth="8" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
                  <circle className="text-indigo-600 dark:text-indigo-400 transition-all duration-1000 ease-out" strokeWidth="8" strokeDasharray={251.2} strokeDashoffset={251.2 - (251.2 * strength) / 100} strokeLinecap="round" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
                </svg>
                <span className="absolute text-xl font-black text-foreground tracking-tight">{strength}%</span>
              </div>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-2">Overall Score</p>
            </div>

            {/* List details & Recommendations */}
            <div className="md:col-span-2 space-y-3 pl-2">
              <p className="text-xs font-semibold text-foreground">How to strengthen your profile:</p>
              <ul className="space-y-2 text-xs">
                <li className="flex items-center gap-2 text-muted-foreground font-medium">
                  {profile.cgpa ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-450 shrink-0" />}
                  <span>Academic Standing: CGPA {profile.cgpa ? `${profile.cgpa}/10 (Verified)` : 'Missing (Add GPA for +20% score)'}</span>
                </li>
                <li className="flex items-center gap-2 text-muted-foreground font-medium">
                  {profile.ielts_score || profile.toefl_score ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> : <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />}
                  <span>Language Proficiency: {profile.ielts_score ? `IELTS ${profile.ielts_score} (Verified)` : 'Standardized test score missing (+15% score)'}</span>
                </li>
                <li className="flex items-center gap-2 text-muted-foreground font-medium">
                  {profile.gre_score ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> : <AlertCircle className="w-4 h-4 text-muted shrink-0" />}
                  <span>Standardized Tests: {profile.gre_score ? `GRE ${profile.gre_score} (Verified)` : 'Optional GRE not provided (+15% score)'}</span>
                </li>
                <li className="flex items-center gap-2 text-muted-foreground font-medium">
                  {(profile.research_experience_months ?? 0) > 0 || (profile.projects_count ?? 0) > 0 ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> : <AlertCircle className="w-4 h-4 text-muted shrink-0" />}
                  <span>Academic Achievements: Research/Projects added (+15% to +30% score)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Profile incomplete CTA Banner */}
      {!loading && completion < 100 && (
        <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-5 flex items-start gap-4 shadow-sm animate-fade-in">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-500 dark:text-indigo-400 shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-indigo-900 dark:text-indigo-400">Finish your study profile</p>
            <p className="text-xs text-indigo-600/90 dark:text-indigo-400/80 mt-0.5 leading-relaxed">
              We require your academic GPA, test scores (IELTS/GRE), and budget preference to calculate your safe, moderate, and ambitious university matches.
            </p>
            <Link
              href="/profile"
              className="inline-flex items-center gap-1.5 mt-3 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-750 text-white text-xs font-semibold rounded-lg shadow-sm transition-all duration-200"
            >
              Complete profile <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Dynamic Roadmap Timeline Widget */}
      <div className="glass-card rounded-2xl p-6 border border-border bg-card">
        <div className="mb-6">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
            Admissions Roadmap
          </h2>
          <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">Track your progressive journey milestones</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {ROADMAP_STEPS.map((step, i) => {
            const Icon = step.icon
            const done = isStepDone(i)
            const active = isStepActive(i)
            
            return (
              <div key={step.label} className="flex flex-col items-center text-center relative group">
                {/* Node connector line */}
                {i < ROADMAP_STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-5 left-[60%] right-[-40%] h-0.5 bg-muted z-0">
                    <div 
                      className={`h-full bg-emerald-500 transition-all duration-500 ${
                        done ? 'w-full' : 'w-0'
                      }`} 
                    />
                  </div>
                )}
                
                {/* Visual Circle Indicator */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 z-10 transition-all duration-300 ${
                    done
                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-100'
                      : active
                      ? 'bg-indigo-600 border-indigo-600 text-white ring-4 ring-indigo-500/20'
                      : 'bg-card border-border text-muted-foreground'
                  }`}
                >
                  {done ? (
                    <Check className="w-5 h-5" strokeWidth={3} />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                
                {/* Text Labels */}
                <span
                  className={`text-xs font-bold mt-3 ${
                    done ? 'text-emerald-600 dark:text-emerald-400' : active ? 'text-indigo-600 dark:text-indigo-400' : 'text-muted-foreground'
                  }`}
                >
                  {step.label}
                </span>
                <span className="text-[10px] text-muted-foreground mt-1 max-w-[140px] leading-relaxed">
                  {step.desc}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
            Quick actions
          </h2>
          <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">Jump directly to tool modules</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon
            return (
              <Link
                key={action.href}
                href={action.href}
                className="glass-card rounded-2xl p-5 flex items-start gap-4 group border border-border bg-card"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300 ${action.colorBg}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                    {action.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{action.desc}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
