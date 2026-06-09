'use client'
import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types'

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 animate-pulse">
      <div className="h-3 bg-gray-100 rounded w-1/2 mb-2" />
      <div className="h-7 bg-gray-100 rounded w-1/3" />
    </div>
  )
}

const ROADMAP = ['Profile', 'Shortlist', 'Apply', 'Visa']

const QUICK_ACTIONS = [
  { label: 'Browse universities', href: '/universities', icon: '🏛', desc: 'Find your best matches' },
  { label: 'Find scholarships',   href: '/scholarships', icon: '★', desc: 'Funding opportunities' },
  { label: 'Generate SOP',        href: '/sop-assistant',icon: '✎', desc: 'AI-drafted statement' },
  { label: 'Visa guidance',       href: '/visa',         icon: '📄', desc: 'Country-wise process' },
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
        .single()

      setProfile(prof ?? null)

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

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        {loading ? (
          <div className="animate-pulse">
            <div className="h-6 bg-gray-100 rounded w-48 mb-2" />
            <div className="h-4 bg-gray-100 rounded w-72" />
          </div>
        ) : (
          <>
            <h1 className="text-xl font-semibold text-gray-900">
              Welcome back, {name} 👋
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {completion < 100
                ? 'Complete your profile to unlock university recommendations.'
                : 'Your profile is complete. Check your university matches.'}
            </p>
          </>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <StatCard label="Profile complete" value={`${completion}%`} />
            <StatCard label="Saved unis"       value={String(savedCount)} />
            <StatCard
              label="Tasks done"
              value={tasksTotal ? `${tasksDone}/${tasksTotal}` : '—'}
            />
          </>
        )}
      </div>

      {/* Profile incomplete CTA */}
      {!loading && completion < 100 && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 mb-8 flex items-start gap-4">
          <div className="text-2xl">📋</div>
          <div className="flex-1">
            <p className="text-sm font-medium text-indigo-900">Finish your profile</p>
            <p className="text-xs text-indigo-600 mt-0.5">
              We need your CGPA, budget, and test scores to recommend universities.
            </p>
            <Link
              href="/profile"
              className="inline-block mt-3 px-4 py-1.5 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Complete profile →
            </Link>
          </div>
        </div>
      )}

      {/* Roadmap */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">
          Application roadmap
        </h2>
        <div className="flex items-center">
          {ROADMAP.map((step, i) => {
            const done = i === 0 && completion > 0
            return (
              <div key={step} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                      done
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {done ? '✓' : i + 1}
                  </div>
                  <span
                    className={`text-xs mt-1 ${done ? 'text-green-600' : 'text-gray-400'}`}
                  >
                    {step}
                  </span>
                </div>
                {i < ROADMAP.length - 1 && (
                  <div className="flex-1 h-px bg-gray-100 mb-4" />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Quick actions */}
      <h2 className="text-sm font-semibold text-gray-700 mb-3">Quick actions</h2>
      <div className="grid grid-cols-2 gap-3">
        {QUICK_ACTIONS.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="bg-white border border-gray-100 rounded-xl p-4 hover:border-indigo-200 hover:bg-indigo-50 transition-colors group"
          >
            <div className="text-xl mb-2">{action.icon}</div>
            <p className="text-sm font-medium text-gray-900 group-hover:text-indigo-700">
              {action.label}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{action.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
