// src/app/(dashboard)/visa/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface VisaInfo {
  country: string
  visa_type: string | null
  processing_days_min: number | null
  processing_days_max: number | null
  required_docs: string[] | null
  estimated_cost_usd: number | null
  interview_required: boolean
  interview_tips: string | null
  common_rejection_reasons: string[] | null
  financial_requirement_usd: number | null
}

const COUNTRIES = ['Germany', 'Canada', 'UK', 'Ireland', 'Netherlands']

export default function VisaPage() {
  const [visas, setVisas] = useState<Record<string, VisaInfo>>({})
  const [selected, setSelected] = useState('Germany')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('visa_requirements').select('*').then(({ data }) => {
      const map = Object.fromEntries(data?.map((v: VisaInfo) => [v.country, v]) ?? [])
      setVisas(map)
      setLoading(false)
    })
  }, [])

  const visa = visas[selected]

  if (loading) return <div className="text-center py-10">Loading...</div>

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-xl font-semibold text-gray-900 mb-1">Visa guidance</h1>
      <p className="text-sm text-gray-500 mb-6">Country-specific visa requirements and timelines.</p>

      {/* Country tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-100 pb-4">
        {COUNTRIES.map(c => (
          <button key={c} onClick={() => setSelected(c)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${selected === c
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
            {c}
          </button>
        ))}
      </div>

      {visa && (
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5">
            <p className="text-sm font-semibold text-indigo-900 mb-1">{visa.visa_type}</p>
            <p className="text-xs text-indigo-600 mb-3">Processing: {visa.processing_days_min}-{visa.processing_days_max} business days</p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-indigo-600 mb-1">Visa fee</p>
                <p className="font-semibold text-indigo-900">${visa.estimated_cost_usd}</p>
              </div>
              <div>
                <p className="text-indigo-600 mb-1">Financial requirement</p>
                <p className="font-semibold text-indigo-900">${visa.financial_requirement_usd?.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Required documents */}
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Required documents</h2>
            <ul className="space-y-2">
              {visa.required_docs?.map((doc, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-indigo-600 font-bold mt-0.5">✓</span>
                  <span>{doc}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Interview info */}
          {visa.interview_required && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-amber-900 mb-2">Visa interview required</h2>
              <p className="text-xs text-amber-700 leading-relaxed">{visa.interview_tips}</p>
            </div>
          )}

          {/* Rejection reasons */}
          <div className="bg-red-50 border border-red-100 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-red-900 mb-3">Common rejection reasons</h2>
            <ul className="space-y-2">
              {visa.common_rejection_reasons?.map((reason, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-red-700">
                  <span className="font-bold mt-0.5">•</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Transparency box */}
          <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-xs text-green-700">
            <p className="font-semibold mb-2">✓ Transparent checklist</p>
            <p>No hidden costs. Process varies slightly year-to-year. Always verify on official government websites before applying. Start 6 months before your target intake.</p>
          </div>
        </div>
      )}
    </div>
  )
}