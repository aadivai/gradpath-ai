'use client'
import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { supabase } from '@/lib/supabase'
import { getProfileId } from '@/lib/profile'

type SavedUni = {
  id: string
  status: string
  notes: string | null
  universities: {
    id: string; name: string; country: string; city: string | null
    qs_ranking: number | null; annual_fee_usd: number | null
    living_cost_usd: number | null; tier: string; programs: string[]
  }
}

const STATUSES = ['shortlisted', 'applied', 'offer_received', 'rejected', 'enrolled']

const STATUS_COLORS: Record<string, string> = {
  shortlisted:    'bg-gray-50 text-gray-600 border-gray-200',
  applied:        'bg-blue-50 text-blue-700 border-blue-100',
  offer_received: 'bg-green-50 text-green-700 border-green-100',
  rejected:       'bg-red-50 text-red-600 border-red-100',
  enrolled:       'bg-indigo-50 text-indigo-700 border-indigo-100',
}

const STATUS_LABELS: Record<string, string> = {
  shortlisted: 'Shortlisted', applied: 'Applied',
  offer_received: 'Offer received', rejected: 'Rejected', enrolled: 'Enrolled',
}

export default function SavedUniversitiesPage() {
  const { user } = useUser()
  const [saved, setSaved]       = useState<SavedUni[]>([])
  const [loading, setLoading]   = useState(true)
  const [editId, setEditId]     = useState<string | null>(null)
  const [notes, setNotes]       = useState('')

  useEffect(() => {
    if (!user) return
    ;(async () => {
      const profileId = await getProfileId(user.id)
      if (!profileId) { setLoading(false); return }
      const { data } = await supabase
        .from('saved_universities')
        .select('id, status, notes, universities(*)')
        .eq('profile_id', profileId)
      setSaved((data || []) as unknown as SavedUni[])
      setLoading(false)
    })()
  }, [user])

  async function updateStatus(savedId: string, status: string) {
    setSaved(prev => prev.map(s => s.id === savedId ? { ...s, status } : s))
    await supabase.from('saved_universities').update({ status }).eq('id', savedId)
  }

  async function saveNotes(savedId: string) {
    await supabase.from('saved_universities').update({ notes }).eq('id', savedId)
    setSaved(prev => prev.map(s => s.id === savedId ? { ...s, notes } : s))
    setEditId(null)
  }

  async function removeUni(savedId: string) {
    setSaved(prev => prev.filter(s => s.id !== savedId))
    await supabase.from('saved_universities').delete().eq('id', savedId)
  }

  if (loading) return <div className="text-center py-16 text-sm text-gray-400">Loading...</div>

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-xl font-semibold text-gray-900 mb-1">Saved universities</h1>
      <p className="text-sm text-gray-500 mb-6">Track status of universities you've shortlisted.</p>

      {saved.length === 0 && (
        <div className="text-center py-14 bg-white border border-gray-100 rounded-xl">
          <p className="text-3xl mb-3">🏛</p>
          <p className="text-sm font-medium text-gray-700 mb-1">No saved universities yet</p>
          <p className="text-xs text-gray-400 mb-4">Go to Universities and tap "Save" on any match.</p>
          <a href="/universities"
            className="inline-block px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors">
            Browse universities →
          </a>
        </div>
      )}

      <div className="space-y-4">
        {saved.map(s => {
          const uni  = s.universities
          const cost = ((uni.annual_fee_usd ?? 0) + (uni.living_cost_usd ?? 0))
          const inr  = Math.round(cost * 83 / 100000)
          return (
            <div key={s.id} className="bg-white border border-gray-100 rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{uni.name}</p>
                  <p className="text-xs text-gray-400">{uni.city}, {uni.country}</p>
                </div>
                <button onClick={() => removeUni(s.id)}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors">
                  Remove
                </button>
              </div>

              {/* Status selector */}
              <div className="mb-3">
                <p className="text-xs text-gray-400 mb-1.5">Application status</p>
                <div className="flex flex-wrap gap-1.5">
                  {STATUSES.map(st => (
                    <button key={st} onClick={() => updateStatus(s.id, st)}
                      className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-colors
                        ${s.status === st ? STATUS_COLORS[st] : 'bg-gray-50 text-gray-400 border-gray-100 hover:border-gray-200'}`}>
                      {STATUS_LABELS[st]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cost + notes */}
              <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-50 pt-3">
                <span>~₹{inr}L/year total</span>
                {editId === s.id ? (
                  <div className="flex items-center gap-2">
                    <input value={notes} onChange={e => setNotes(e.target.value)}
                      className="border border-gray-200 rounded px-2 py-1 text-xs w-40" placeholder="Add note..." />
                    <button onClick={() => saveNotes(s.id)} className="text-indigo-600 font-medium">Save</button>
                    <button onClick={() => setEditId(null)} className="text-gray-400">Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => { setEditId(s.id); setNotes(s.notes ?? '') }}
                    className="text-indigo-600 hover:underline">
                    {s.notes ? `Note: ${s.notes}` : '+ Add note'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}