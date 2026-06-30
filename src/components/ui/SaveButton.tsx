'use client'
import { useState, useEffect } from 'react'
import { useUser } from '@/components/providers/SupabaseAuthProvider'
import { supabase } from '@/lib/supabase'
import { getProfileId } from '@/lib/profile'
import { Heart } from 'lucide-react'

type Props = {
  universityId: string
  universityName: string
}

export default function SaveButton({ universityId, universityName }: Props) {
  const { user } = useUser()
  const [saved, setSaved]       = useState(false)
  const [loading, setLoading]   = useState(false)
  const [checked, setChecked]   = useState(false)

  // Check if already saved on mount
  useEffect(() => {
    if (!user) return
    ;(async () => {
      const profileId = await getProfileId(user.id)
      if (!profileId) { setChecked(true); return }
      const { data, error } = await supabase
        .from('saved_universities')
        .select('id')
        .eq('profile_id', profileId)
        .eq('university_id', universityId)
        .single()
      if (error && error.code !== 'PGRST116') {
        console.error('[SaveButton] Error checking saved status:', error)
      }
      setSaved(!!data)
      setChecked(true)
    })()
  }, [user, universityId])

  async function handleSave() {
    if (!user || loading) return
    setLoading(true)
    try {
      const profileId = await getProfileId(user.id)
      if (!profileId) {
        console.error('[SaveButton] Profile ID not found for user:', user.id)
        return
      }

      if (saved) {
        const { error } = await supabase
          .from('saved_universities')
          .delete()
          .eq('profile_id', profileId)
          .eq('university_id', universityId)
        if (error) {
          console.error('[SaveButton] Error deleting saved university:', error)
        } else {
          setSaved(false)
        }
      } else {
        const { error } = await supabase.from('saved_universities').insert({
          profile_id:    profileId,
          university_id: universityId,
          status:        'shortlisted',
        })
        if (error) {
          console.error('[SaveButton] Error saving university:', error)
        } else {
          setSaved(true)
        }
      }
    } catch (err) {
      console.error('[SaveButton] Exception in handleSave:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!checked) return null

  return (
    <button
      onClick={handleSave}
      disabled={loading}
      title={saved ? 'Remove from saved' : `Save ${universityName}`}
      className={`group flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full border transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
        saved
          ? 'bg-rose-500/10 text-rose-600 border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/40 hover:bg-rose-500/20'
          : 'bg-muted/40 text-muted-foreground border-border/80 hover:bg-muted/80 hover:text-foreground hover:border-muted-foreground/30 dark:bg-muted/20 dark:hover:bg-muted/50'
      }`}
    >
      <Heart
        className={`w-3.5 h-3.5 transition-transform duration-200 group-hover:scale-110 ${
          saved
            ? 'fill-rose-500 text-rose-500 dark:fill-rose-400 dark:text-rose-400'
            : 'text-muted-foreground group-hover:text-rose-500'
        }`}
      />
      <span>{loading ? '...' : saved ? 'Saved' : 'Save'}</span>
    </button>
  )
}

