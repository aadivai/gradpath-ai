'use client'
import { useEffect, useState } from 'react'
import { useUser } from '@/components/providers/SupabaseAuthProvider'
import { supabase } from '@/lib/supabase'
import { getProfileId } from '@/lib/profile'
import { PageHeader } from '@/components/ui/page-header'
import { Bookmark, ChevronRight } from 'lucide-react'

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
  shortlisted:    'bg-muted/80 text-muted-foreground border-border/60',
  applied:        'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  offer_received: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  rejected:       'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-550/20',
  enrolled:       'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
}

const STATUS_LABELS: Record<string, string> = {
  shortlisted: 'Shortlisted', 
  applied: 'Applied',
  offer_received: 'Offer Received', 
  rejected: 'Rejected', 
  enrolled: 'Enrolled',
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
  }, [user?.id])

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

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-48" />
          <div className="h-4 bg-muted rounded w-72" />
          <div className="h-28 bg-muted rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 space-y-6">
      {/* Header */}
      <PageHeader
        icon={Bookmark}
        title="Saved Universities"
        subtitle="Track application statuses and notes of universities you've shortlisted."
      />

      {saved.length === 0 && (
        <div className="text-center py-16 bg-card border border-border rounded-xl shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-full bg-indigo-500/5 flex items-center justify-center text-indigo-650 dark:text-indigo-400 mx-auto">
            <Bookmark className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">No saved universities yet</p>
            <p className="text-xs text-muted-foreground mt-1">Go to Universities and click save on any matching profile.</p>
          </div>
          <a 
            href="/universities"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            Browse Universities <ChevronRight className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      <div className="space-y-4">
        {saved.map(s => {
          const uni  = s.universities
          const cost = ((uni.annual_fee_usd ?? 0) + (uni.living_cost_usd ?? 0))
          const inr  = Math.round(cost * 83 / 100000)
          return (
            <div key={s.id} className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-4 hover:border-muted-foreground/20 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground leading-tight">{uni.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{uni.city ? `${uni.city}, ` : ''}{uni.country}</p>
                </div>
                <button 
                  type="button"
                  onClick={() => removeUni(s.id)}
                  className="text-xs text-muted-foreground hover:text-red-500 transition-colors cursor-pointer"
                >
                  Remove
                </button>
              </div>

              {/* Status selector */}
              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">Application Status</p>
                <div className="flex flex-wrap gap-1.5">
                  {STATUSES.map(st => (
                    <button 
                      key={st} 
                      type="button"
                      onClick={() => updateStatus(s.id, st)}
                      className={`text-xs px-2.5 py-1 rounded-lg border font-semibold transition-all cursor-pointer
                        ${s.status === st ? STATUS_COLORS[st] : 'bg-background text-muted-foreground border-border hover:text-foreground hover:border-muted-foreground/30'}`}
                    >
                      {STATUS_LABELS[st]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cost + notes */}
              <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/40 pt-3">
                <span className="font-medium">~ ₹{inr}L/year total budget</span>
                {editId === s.id ? (
                  <div className="flex items-center gap-2">
                    <input 
                      value={notes} 
                      onChange={e => setNotes(e.target.value)}
                      className="bg-background border border-border rounded-xl px-2.5 py-1 text-xs w-44 bg-card text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-600 dark:focus-visible:ring-indigo-500 focus-visible:border-indigo-600 dark:focus-visible:border-indigo-500 transition-shadow" 
                      placeholder="Add notes..." 
                    />
                    <button 
                      type="button"
                      onClick={() => saveNotes(s.id)} 
                      className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
                    >
                      Save
                    </button>
                    <button 
                      type="button"
                      onClick={() => setEditId(null)} 
                      className="text-muted-foreground cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button 
                    type="button"
                    onClick={() => { setEditId(s.id); setNotes(s.notes ?? '') }}
                    className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer text-left truncate max-w-[200px]"
                  >
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