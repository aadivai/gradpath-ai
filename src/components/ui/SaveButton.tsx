// src/components/ui/SaveButton.tsx
'use client'
import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { supabase } from '@/lib/supabase'
import { getProfileId } from '@/lib/profile'

type Props = {
  universityId: string
  universityName: string
}

export default function SaveButton({ universityId, universityName }: Props) {
  const { user } = useUser()
  const [saved, setSaved]     = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSave() {
    if (!user || loading) return
    setLoading(true)
    try {
      const profileId = await getProfileId(user.id)
      if (!profileId) return

      if (saved) {
        await supabase.from('saved_universities')
          .delete()
          .eq('profile_id', profileId)
          .eq('university_id', universityId)
        setSaved(false)
      } else {
        await supabase.from('saved_universities').insert({
          profile_id:    profileId,
          university_id: universityId,
          status:        'shortlisted',
        })
        setSaved(true)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={handleSave} disabled={loading}
      title={saved ? 'Remove from saved' : `Save ${universityName}`}
      className={`text-xs px-2.5 py-1 rounded-lg border transition-colors font-medium
        ${saved
          ? 'bg-indigo-600 text-white border-indigo-600'
          : 'bg-white text-gray-500 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'}`}>
      {loading ? '...' : saved ? '♥ Saved' : '♡ Save'}
    </button>
  )
}