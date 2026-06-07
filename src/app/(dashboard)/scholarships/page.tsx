// src/app/(dashboard)/scholarships/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Scholarship } from '@/types'

const TYPE_LABELS: Record<string, string> = {
  merit:      'Merit',
  need:       'Need-based',
  government: 'Government',
  university: 'University',
}

const TYPE_COLORS: Record<string, string> = {
  merit:      'bg-blue-50   text-blue-700   border-blue-100',
  need:       'bg-orange-50 text-orange-700 border-orange-100',
  government: 'bg-green-50  text-green-700  border-green-100',
  university: 'bg-purple-50 text-purple-700 border-purple-100',
}

const COUNTRIES = ['All', 'Germany', 'Canada', 'UK', 'Ireland', 'Netherlands']
const TYPES     = ['All', 'merit', 'need', 'government', 'university']

function ScholarshipCard({ s }: { s: Scholarship }) {
  const amountINR = s.amount_usd ? Math.round(s.amount_usd * 83 / 100000) : null

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 hover:border-indigo-200 transition-colors">
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-semibold text-gray-900 leading-tight">{s.name}</p>
        <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full border ${TYPE_COLORS[s.type]}`}>
          {TYPE_LABELS[s.type]}
        </span>
      </div>

      <p className="text-xs text-gray-400 mb-3">{s.country ?? 'International'}</p>

      {s.description && (
        <p className="text-xs text-gray-600 mb-3 leading-relaxed">{s.description}</p>
      )}

      <div className="grid grid-cols-2 gap-2 text-xs border-t border-gray-50 pt-3">
        <div>
          <p className="text-gray-400">Amount</p>
          <p className="font-medium text-gray-700">
            {s.is_fully_funded
              ? '✅ Fully funded'
              : amountINR
              ? `~₹${amountINR}L`
              : '—'}
          </p>
        </div>
        <div>
          <p className="text-gray-400">Min CGPA</p>
          <p className="font-medium text-gray-700">{s.min_cgpa ?? 'Not specified'}</p>
        </div>
        <div className="col-span-2">
          <p className="text-gray-400">Deadline</p>
          <p className="font-medium text-gray-700">{s.deadline ?? 'Check official site'}</p>
        </div>
      </div>

      {s.link && (
        <a href={s.link} target="_blank" rel="noopener noreferrer"
          className="block mt-3 text-center text-xs text-indigo-600 hover:underline">
          Apply / learn more →
        </a>
      )}
    </div>
  )
}

function FilterPill({
  label, active, onClick,
}: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors
        ${active
          ? 'bg-indigo-600 text-white border-indigo-600'
          : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'}`}>
      {label}
    </button>
  )
}

export default function ScholarshipsPage() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([])
  const [loading, setLoading]           = useState(true)
  const [country, setCountry]           = useState('All')
  const [type, setType]                 = useState('All')

  useEffect(() => {
    supabase.from('scholarships').select('*')
      .then(({ data }) => {
        setScholarships(data ?? [])
        setLoading(false)
      })
  }, [])

  const filtered = scholarships.filter(s => {
    if (country !== 'All' && s.country !== country) return false
    if (type    !== 'All' && s.type    !== type)    return false
    return true
  })

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-xl font-semibold text-gray-900 mb-1">Scholarships</h1>
      <p className="text-sm text-gray-500 mb-6">
        Government, merit, and university-specific funding opportunities.
      </p>

      {/* Filters */}
      <div className="bg-white border border-gray-100 rounded-xl p-4 mb-6 space-y-3">
        <div>
          <p className="text-xs text-gray-400 mb-2">Country</p>
          <div className="flex flex-wrap gap-2">
            {COUNTRIES.map(c => (
              <FilterPill key={c} label={c} active={country === c} onClick={() => setCountry(c)} />
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-2">Type</p>
          <div className="flex flex-wrap gap-2">
            {TYPES.map(t => (
              <FilterPill key={t} label={t === 'All' ? 'All' : TYPE_LABELS[t]} active={type === t} onClick={() => setType(t)} />
            ))}
          </div>
        </div>
      </div>

      {/* Results count */}
      {!loading && (
        <p className="text-xs text-gray-400 mb-4">
          Showing {filtered.length} scholarship{filtered.length !== 1 ? 's' : ''}
        </p>
      )}

      {loading && (
        <div className="animate-pulse grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="bg-gray-100 rounded-xl h-36" />)}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-10 bg-white border border-gray-100 rounded-xl">
          <p className="text-sm text-gray-500">No scholarships match these filters.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map(s => <ScholarshipCard key={s.id} s={s} />)}
      </div>

      {/* Transparency note — your differentiator */}
      <div className="mt-8 p-4 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700">
        <p className="font-semibold mb-1">⚠️ What agents don't tell you</p>
        <p>Most scholarships require early application — 6 to 9 months before the intake. Many consultancies push you toward universities that pay them referral fees, not ones that fit your profile. Always verify scholarship terms on the official university website.</p>
      </div>
    </div>
  )
}