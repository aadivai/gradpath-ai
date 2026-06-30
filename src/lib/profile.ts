import { supabase as defaultSupabase } from './supabase'
import { parseProfile } from '@/utils/profileMetadata'
import type { SupabaseClient } from '@supabase/supabase-js'

export async function getProfileId(clerkUserId: string, client?: SupabaseClient): Promise<string | null> {
  const supabaseClient = client || defaultSupabase
  const { data } = await supabaseClient
    .from('profiles')
    .select('id')
    .eq('clerk_user_id', clerkUserId)
    .maybeSingle()
  return data?.id ?? null
}

export async function verifyAdmin(clerkUserId: string, client?: SupabaseClient): Promise<boolean> {
  const supabaseClient = client || defaultSupabase
  const { data } = await supabaseClient
    .from('profiles')
    .select('full_name')
    .eq('clerk_user_id', clerkUserId)
    .maybeSingle()
  if (!data) return false
  const parsed = parseProfile(data)
  return parsed.role === 'admin' || parsed.role === 'super_admin'
}