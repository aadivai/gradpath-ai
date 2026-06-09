'use client'
import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type FormData = {
  full_name: string
  branch: string
  cgpa: string
  backlogs: string
  work_experience_months: string
  ielts_score: string
  gre_score: string
  toefl_score: string
  budget_inr: string
  target_intake: string
  preferred_countries: string[]
}

const EMPTY_FORM: FormData = {
  full_name: '', branch: '', cgpa: '', backlogs: '0',
  work_experience_months: '0', ielts_score: '', gre_score: '',
  toefl_score: '', budget_inr: '', target_intake: '',
  preferred_countries: [],
}

const COUNTRIES = ['USA', 'UK', 'Canada', 'Germany', 'Australia', 'Ireland', 'Netherlands', 'France']
const BRANCHES  = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Chemical', 'MBA', 'Other']
const INTAKES   = ['Fall 2025', 'Spring 2026', 'Fall 2026', 'Spring 2027']

const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</label>
      {children}
    </div>
  )
}

function StepIndicator({ current }: { current: number }) {
  const steps = ['Academic info', 'Test scores', 'Preferences']
  return (
    <div className="flex items-center gap-2 mb-8 flex-wrap">
      {steps.map((label, i) => {
        const num    = i + 1
        const done   = num < current
        const active = num === current
        return (
          <div key={i} className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium
                ${done   ? 'bg-green-500 text-white'   : ''}
                ${active ? 'bg-indigo-600 text-white'  : ''}
                ${!done && !active ? 'bg-gray-200 text-gray-500' : ''}`}
            >
              {done ? '✓' : num}
            </div>
            <span className={`text-sm ${active ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
              {label}
            </span>
            {i < steps.length - 1 && <div className="w-6 h-px bg-gray-200 mx-1" />}
          </div>
        )
      })}
    </div>
  )
}

function Step1({ data, update }: { data: FormData; update: (k: keyof FormData, v: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="col-span-2">
        <Field label="Full name">
          <input className={inputCls} value={data.full_name}
            onChange={e => update('full_name', e.target.value)} placeholder="Rahul Kumar" />
        </Field>
      </div>
      <Field label="Branch / stream">
        <select className={inputCls} value={data.branch} onChange={e => update('branch', e.target.value)}>
          <option value="">Select branch</option>
          {BRANCHES.map(b => <option key={b}>{b}</option>)}
        </select>
      </Field>
      <Field label="CGPA (out of 10)">
        <input className={inputCls} type="number" step="0.1" min="0" max="10"
          value={data.cgpa} onChange={e => update('cgpa', e.target.value)} placeholder="7.8" />
      </Field>
      <Field label="Number of backlogs">
        <input className={inputCls} type="number" min="0"
          value={data.backlogs} onChange={e => update('backlogs', e.target.value)} placeholder="0" />
      </Field>
      <Field label="Work experience (months)">
        <input className={inputCls} type="number" min="0"
          value={data.work_experience_months}
          onChange={e => update('work_experience_months', e.target.value)} placeholder="0" />
      </Field>
    </div>
  )
}

function Step2({ data, update }: { data: FormData; update: (k: keyof FormData, v: string) => void }) {
  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">Leave blank if you haven't taken the exam yet.</p>
      <div className="grid grid-cols-2 gap-4">
        <Field label="IELTS overall band">
          <input className={inputCls} type="number" step="0.5" min="0" max="9"
            value={data.ielts_score} onChange={e => update('ielts_score', e.target.value)} placeholder="7.0" />
        </Field>
        <Field label="GRE total score">
          <input className={inputCls} type="number" min="260" max="340"
            value={data.gre_score} onChange={e => update('gre_score', e.target.value)} placeholder="315" />
        </Field>
        <Field label="TOEFL score">
          <input className={inputCls} type="number" min="0" max="120"
            value={data.toefl_score} onChange={e => update('toefl_score', e.target.value)} placeholder="100" />
        </Field>
      </div>
      <div className="mt-4 p-3 bg-indigo-50 rounded-lg text-xs text-indigo-700">
        💡 For Germany and most of Europe, IELTS is sufficient. GRE is mainly needed for US/Canada.
      </div>
    </div>
  )
}

function Step3({
  data, update, toggleCountry,
}: {
  data: FormData
  update: (k: keyof FormData, v: string) => void
  toggleCountry: (c: string) => void
}) {
  const budgetNum = parseInt(data.budget_inr)
  return (
    <div className="flex flex-col gap-4">
      <Field label="Total budget (₹ per year, including tuition + living)">
        <input className={inputCls} type="number"
          value={data.budget_inr} onChange={e => update('budget_inr', e.target.value)}
          placeholder="3000000" />
        {!isNaN(budgetNum) && budgetNum > 0 && (
          <p className="text-xs text-gray-400 mt-1">
            ≈ ${Math.round(budgetNum / 83).toLocaleString()} USD / year
          </p>
        )}
      </Field>
      <Field label="Target intake">
        <select className={inputCls} value={data.target_intake}
          onChange={e => update('target_intake', e.target.value)}>
          <option value="">Select intake</option>
          {INTAKES.map(i => <option key={i}>{i}</option>)}
        </select>
      </Field>
      <Field label="Preferred countries (select all that interest you)">
        <div className="flex flex-wrap gap-2 mt-1">
          {COUNTRIES.map(country => {
            const selected = data.preferred_countries.includes(country)
            return (
              <button key={country} type="button" onClick={() => toggleCountry(country)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors
                  ${selected
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'}`}>
                {country}
              </button>
            )
          })}
        </div>
      </Field>
    </div>
  )
}

export default function ProfilePage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [step, setStep]       = useState(1)
  const [saving, setSaving]   = useState(false)
  const [loading, setLoading] = useState(true)
  const [isEdit, setIsEdit]   = useState(false)
  const [error, setError]     = useState('')
  const [data, setData]       = useState<FormData>(EMPTY_FORM)

  useEffect(() => {
    if (!isLoaded || !user) return
    supabase
      .from('profiles')
      .select('*')
      .eq('clerk_user_id', user.id)
      .single()
      .then(({ data: profile }) => {
        if (profile) {
          setIsEdit(true)
          setData({
            full_name:              profile.full_name ?? '',
            branch:                 profile.branch ?? '',
            cgpa:                   profile.cgpa?.toString() ?? '',
            backlogs:               profile.backlogs?.toString() ?? '0',
            work_experience_months: profile.work_experience_months?.toString() ?? '0',
            ielts_score:            profile.ielts_score?.toString() ?? '',
            gre_score:              profile.gre_score?.toString() ?? '',
            toefl_score:            profile.toefl_score?.toString() ?? '',
            budget_inr:             profile.budget_inr?.toString() ?? '',
            target_intake:          profile.target_intake ?? '',
            preferred_countries:    profile.preferred_countries ?? [],
          })
        }
        setLoading(false)
      })
  }, [isLoaded, user])

  function update(key: keyof FormData, value: string) {
    setData(prev => ({ ...prev, [key]: value }))
  }

  function toggleCountry(country: string) {
    setData(prev => ({
      ...prev,
      preferred_countries: prev.preferred_countries.includes(country)
        ? prev.preferred_countries.filter(c => c !== country)
        : [...prev.preferred_countries, country],
    }))
  }

  async function saveProfile() {
    if (!user) return
    setSaving(true)
    setError('')
    try {
      const payload = {
        clerk_user_id:          user.id,
        full_name:              data.full_name || null,
        email:                  user.emailAddresses[0]?.emailAddress ?? '',
        branch:                 data.branch || null,
        cgpa:                   data.cgpa       ? parseFloat(data.cgpa)      : null,
        backlogs:               parseInt(data.backlogs)  || 0,
        work_experience_months: parseInt(data.work_experience_months) || 0,
        ielts_score:            data.ielts_score ? parseFloat(data.ielts_score) : null,
        gre_score:              data.gre_score   ? parseInt(data.gre_score)    : null,
        toefl_score:            data.toefl_score ? parseInt(data.toefl_score)  : null,
        budget_inr:             data.budget_inr  ? parseInt(data.budget_inr)   : null,
        target_intake:          data.target_intake || null,
        preferred_countries:    data.preferred_countries,
        updated_at:             new Date().toISOString(),
      }
      const { error: dbError } = await supabase
        .from('profiles')
        .upsert(payload, { onConflict: 'clerk_user_id' })
      if (dbError) throw dbError
      router.push('/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="max-w-xl mx-auto px-6 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-100 rounded w-48" />
          <div className="h-4 bg-gray-100 rounded w-72" />
          <div className="h-48 bg-gray-100 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-10">
      <h1 className="text-xl font-semibold text-gray-900 mb-1">
        {isEdit ? 'Edit your profile' : 'Complete your profile'}
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        {isEdit
          ? 'Update your details to refresh university recommendations.'
          : 'We use this to suggest universities, scholarships, and a roadmap.'}
      </p>

      <StepIndicator current={step} />

      <div className="bg-white border border-gray-100 rounded-xl p-6 mb-4">
        {step === 1 && <Step1 data={data} update={update} />}
        {step === 2 && <Step2 data={data} update={update} />}
        {step === 3 && <Step3 data={data} update={update} toggleCountry={toggleCountry} />}
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        {step > 1 && (
          <button onClick={() => setStep(s => s - 1)}
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            ← Back
          </button>
        )}
        {step < 3 ? (
          <button onClick={() => setStep(s => s + 1)}
            className="flex-[2] px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
            Next →
          </button>
        ) : (
          <button onClick={saveProfile} disabled={saving}
            className="flex-[2] px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 transition-colors">
            {saving ? 'Saving...' : isEdit ? 'Update profile' : 'Save & continue'}
          </button>
        )}
      </div>
    </div>
  )
}
