'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

type AuthContextType = {
  user: User | null
  role: string
  isLoaded: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: 'student',
  isLoaded: false,
  signOut: async () => {},
})

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<string>('student')
  const [isLoaded, setIsLoaded] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    let mounted = true

    async function loadSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!mounted) return

        const activeUser = session?.user ?? null
        setUser(activeUser)
        
        if (activeUser) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('clerk_user_id', activeUser.id)
            .single()
            
          if (mounted && profile?.full_name && profile.full_name.includes('|||')) {
            try {
              const meta = JSON.parse(profile.full_name.split('|||')[1])
              if (meta.role) setRole(meta.role)
            } catch (e) {}
          }
        }
      } catch (err) {
        console.error('Failed to load Supabase session:', err)
      } finally {
        if (mounted) {
          setIsLoaded(true)
        }
      }
    }

    loadSession()

    // Listen for auth state modifications
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return
      const activeUser = session?.user ?? null
      setUser(activeUser)
      
      if (activeUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('clerk_user_id', activeUser.id)
          .single()
          
        if (mounted && profile?.full_name && profile.full_name.includes('|||')) {
          try {
            const meta = JSON.parse(profile.full_name.split('|||')[1])
            if (meta.role) setRole(meta.role)
          } catch (e) {}
        }
      } else {
        setRole('student')
      }
      setIsLoaded(true)

      if (event === 'SIGNED_OUT') {
        router.push('/login')
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase, router])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setRole('student')
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, role, isLoaded, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

// Expose mock Clerk useUser shape for drop-in replacement
export function useUser() {
  const { user, role, isLoaded } = useAuth()
  
  const clonedUser = user ? {
    id: user.id,
    emailAddresses: [{ emailAddress: user.email ?? '' }],
    primaryEmailAddress: { emailAddress: user.email ?? '' },
    fullName: user.user_metadata?.full_name ?? '',
    firstName: (user.user_metadata?.full_name ?? '').split(' ')[0] ?? '',
    imageUrl: user.user_metadata?.avatar_url ?? '',
    publicMetadata: { role }
  } : null

  return {
    user: clonedUser,
    isLoaded,
    isSignedIn: !!user,
  }
}
